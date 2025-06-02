import json
import logging
import re
import smtplib
import socket
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from email.utils import formatdate
from pathlib import Path
import sqlite3
import os

try:
    from utils.extract_utils import extract_action_input
except ImportError:
    def extract_action_input(input_str: str) -> Tuple[Optional[str], Optional[str]]:
        try:
            start_idx = input_str.find('{')
            end_idx = input_str.rfind('}')
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                potential_json = input_str[start_idx:end_idx + 1]
                json.loads(potential_json)
                return potential_json, None
            else:
                json.loads(input_str)
                return input_str, None
        except json.JSONDecodeError:
            return None, " [Warning: Could not extract valid JSON from input]"

# Configure logging
logger = logging.getLogger(__name__)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Email validation regex (RFC 5322 compliant)
EMAIL_REGEX = re.compile(
    r'^[a-zA-Z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&\'*+/=?^_`{|}~-]+)*'
    r'@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$'
)

# SMTP server configurations for common providers
SMTP_CONFIGS = {
    'gmail.com': {'host': 'smtp.gmail.com', 'port': 587},
    'yahoo.com': {'host': 'smtp.mail.yahoo.com', 'port': 587},
    'outlook.com': {'host': 'smtp-mail.outlook.com', 'port': 587},
    'hotmail.com': {'host': 'smtp-mail.outlook.com', 'port': 587},
    'icloud.com': {'host': 'smtp.mail.me.com', 'port': 587},
}

class EmailConfigError(Exception):
    """Custom exception for email configuration errors."""
    pass

class EmailValidationError(Exception):
    """Custom exception for email validation errors."""
    pass

class EmailSendError(Exception):
    """Custom exception for email sending errors."""
    pass

def load_config() -> Dict[str, Any]:
    """
    Load SMTP configuration from the database.
    
    Returns:
        Dict containing validated configuration
        
    Raises:
        EmailConfigError: If configuration is invalid or missing
    """
    conn = sqlite3.connect("agent_memory.db")
    c = conn.cursor()
    c.execute("SELECT smtp_email, smtp_password, smtp_host, smtp_port, timeout, use_tls FROM settings WHERE id = 1")
    row = c.fetchone()
    conn.close()
    
    if not row:
        raise EmailConfigError("No SMTP configuration found in database. Please set via /settings endpoint.")
    
    config = {
        'smtp_email': row[0],
        'smtp_password': row[1],
        'smtp_host': row[2],
        'smtp_port': row[3] or 587,
        'timeout': row[4] or 30,
        'use_tls': bool(row[5]) if row[5] is not None else True
    }
    
    # Validate required fields
    if not config['smtp_email'] or not config['smtp_password']:
        raise EmailConfigError("smtp_email and smtp_password must be set in settings.")
    
    # Validate email format
    if not validate_email_address(config['smtp_email']):
        raise EmailConfigError(f"Invalid smtp_email: {config['smtp_email']}")
    
    # Auto-detect SMTP host if not provided
    if not config['smtp_host']:
        email_domain = config['smtp_email'].split('@')[1].lower()
        if email_domain in SMTP_CONFIGS:
            config['smtp_host'] = SMTP_CONFIGS[email_domain]['host']
            config['smtp_port'] = SMTP_CONFIGS[email_domain]['port']
            logger.info(f"Auto-detected SMTP settings for {email_domain}")
        else:
            raise EmailConfigError(
                f"SMTP host not specified and could not auto-detect for domain '{email_domain}'. "
                f"Please specify 'smtp_host' via /settings endpoint."
            )
    
    # Validate optional fields
    if not isinstance(config['smtp_port'], int) or not (1 <= config['smtp_port'] <= 65535):
        raise EmailConfigError(f"smtp_port must be between 1 and 65535, got: {config['smtp_port']}")
    
    if not isinstance(config['timeout'], (int, float)) or config['timeout'] <= 0:
        raise EmailConfigError(f"timeout must be positive, got: {config['timeout']}")
    
    if not isinstance(config['use_tls'], bool):
        raise EmailConfigError(f"use_tls must be a boolean, got: {type(config['use_tls']).__name__}")
    
    logger.info("Successfully loaded SMTP configuration from database")
    return config

def validate_email_address(email: str) -> bool:
    """
    Validate email address format using RFC 5322 compliant regex.
    
    Args:
        email: Email address to validate
        
    Returns:
        True if email is valid, False otherwise
    """
    if not isinstance(email, str):
        return False
    
    email = email.strip()
    if not email:
        return False
    
    if len(email) > 254:  # RFC 5321 limit
        return False
    
    if not EMAIL_REGEX.match(email):
        return False
    
    local, domain = email.rsplit('@', 1)
    if len(local) > 64:  # RFC 5321 limit for local part
        return False
    
    return True

def sanitize_header_value(value: str, max_length: int = 998) -> str:
    """
    Sanitize header values to prevent header injection and ensure RFC compliance.
    
    Args:
        value: Header value to sanitize
        max_length: Maximum allowed length for the header
        
    Returns:
        Sanitized header value
    """
    if not isinstance(value, str):
        value = str(value)
    
    sanitized = re.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]', '', value)
    sanitized = re.sub(r'[\r\n]', ' ', sanitized)
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length-3] + '...'
    
    return sanitized.strip()

def create_email_message(
    sender: str,
    to: str,
    subject: str,
    body: str,
    html_body: Optional[str] = None,
    custom_headers: Optional[Dict[str, str]] = None
) -> MIMEMultipart:
    """
    Create a professional MIME email message with proper headers and encoding.
    
    Args:
        sender: Sender email address
        to: Recipient email address
        subject: Email subject
        body: Plain text body
        html_body: Optional HTML body
        custom_headers: Optional custom headers
        
    Returns:
        MIMEMultipart message object
        
    Raises:
        EmailValidationError: If input parameters are invalid
    """
    if not validate_email_address(sender):
        raise EmailValidationError(f"Invalid sender email address: {sender}")
    
    if not validate_email_address(to):
        raise EmailValidationError(f"Invalid recipient email address: {to}")
    
    if not isinstance(subject, str):
        raise EmailValidationError(f"Subject must be a string, got {type(subject).__name__}")
    
    if not isinstance(body, str):
        raise EmailValidationError(f"Body must be a string, got {type(body).__name__}")
    
    if html_body is not None and not isinstance(html_body, str):
        raise EmailValidationError(f"HTML body must be a string, got {type(html_body).__name__}")
    
    if html_body:
        msg = MIMEMultipart('alternative')
    else:
        msg = MIMEMultipart()
    
    msg['From'] = Header(sender, 'utf-8').encode()
    msg['To'] = Header(to, 'utf-8').encode()
    msg['Subject'] = Header(sanitize_header_value(subject), 'utf-8').encode()
    msg['Date'] = formatdate(localtime=True)
    msg['Message-ID'] = f"<{datetime.now().strftime('%Y%m%d%H%M%S')}.{os.getpid()}@{socket.gethostname()}>"
    msg['X-Mailer'] = 'Professional SMTP Client v1.0'
    msg['X-Priority'] = '3'
    msg['MIME-Version'] = '1.0'
    
    if custom_headers:
        for key, value in custom_headers.items():
            if key.lower() not in ['from', 'to', 'subject', 'date', 'message-id']:
                msg[key] = Header(sanitize_header_value(str(value)), 'utf-8').encode()
    
    try:
        text_part = MIMEText(body, 'plain', 'utf-8')
        msg.attach(text_part)
    except Exception as e:
        raise EmailValidationError(f"Error creating text part: {str(e)}")
    
    if html_body:
        try:
            html_part = MIMEText(html_body, 'html', 'utf-8')
            msg.attach(html_part)
        except Exception as e:
            raise EmailValidationError(f"Error creating HTML part: {str(e)}")
    
    return msg

def send_email_smtp(input_str: str) -> str:
    """
    Send an email via SMTP using credentials from database.
    
    Expected input format (JSON):
    {
        "to": "recipient@example.com",
        "subject": "Email subject",
        "body": "Plain text email body",
        "html_body": "<p>Optional HTML body</p>",  // Optional
        "custom_headers": {"X-Custom": "value"}    // Optional
    }
    
    Args:
        input_str: JSON string containing email parameters
        
    Returns:
        Success message or error message starting with 'Error:'
    """
    logger.info("Starting email send process")
    
    try:
        action_input, warning = extract_action_input(input_str)
        if not action_input:
            return (
                "Error: Invalid input format. Expected a JSON string with the following structure:\n"
                "{\n"
                '  "to": "recipient@example.com",\n'
                '  "subject": "Your subject",\n'
                '  "body": "Your message",\n'
                '  "html_body": "<p>Optional HTML</p>",  // Optional\n'
                '  "custom_headers": {"key": "value"}    // Optional\n'
                "}\n"
                f"Received input: {repr(input_str[:200])}..."
            )
        
        try:
            data = json.loads(action_input)
        except json.JSONDecodeError as e:
            return (
                f"Error: Malformed JSON input. JSON parsing failed: {str(e)}\n"
                f"Please ensure your input is valid JSON. "
                f"Received: {repr(action_input[:200])}..."
            )
        
        if not isinstance(data, dict):
            return (
                f"Error: Input must be a JSON object (dictionary), "
                f"got {type(data).__name__}. "
                f"Received: {repr(data)}"
            )
    
        required_fields = ['to', 'subject', 'body']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            available_fields = list(data.keys())
            return (
                f"Error: Missing required fields: {', '.join(missing_fields)}. "
                f"Required fields are: {', '.join(required_fields)}. "
                f"Available fields in input: {', '.join(available_fields) if available_fields else 'None'}"
            )
    
        to_addr = data['to']
        subject = data['subject']
        body = data['body']
        html_body = data.get('html_body')
        custom_headers = data.get('custom_headers', {})
    
        if not isinstance(to_addr, str):
            return (
                f"Error: 'to' field must be a string, got {type(to_addr).__name__}. "
                f"Value: {repr(to_addr)}"
            )
    
        to_addr = to_addr.strip()
        if not validate_email_address(to_addr):
            return (
                f"Error: Invalid recipient email address '{to_addr}'. "
                f"Please ensure the email follows the format: user@domain.com"
            )
    
        if not isinstance(subject, str):
            return (
                f"Error: 'subject' field must be a string, got {type(subject).__name__}. "
                f"Value: {repr(subject)}"
            )
    
        subject = subject.strip()
        if not subject:
            return "Error: 'subject' field cannot be empty. Please provide a subject for the email."
    
        if not isinstance(body, str):
            return (
                f"Error: 'body' field must be a string, got {type(body).__name__}. "
                f"Value: {repr(body)}"
            )
    
        if html_body is not None and not isinstance(html_body, str):
            return (
                f"Error: 'html_body' field must be a string if provided, "
                f"got {type(html_body).__name__}. "
                f"Value: {repr(html_body)}"
            )
    
        if not isinstance(custom_headers, dict):
            return (
                f"Error: 'custom_headers' field must be a dictionary if provided, "
                f"got {type(custom_headers).__name__}. "
                f"Value: {repr(custom_headers)}"
            )
    
        try:
            config = load_config()
            sender = config['smtp_email']
            logger.info(f"Using sender: {sender}")
        except EmailConfigError as e:
            return f"Error: Configuration issue: {str(e)}"
        except Exception as e:
            return f"Error: Unexpected error loading configuration: {str(e)}"
    
        try:
            msg = create_email_message(
                sender=sender,
                to=to_addr,
                subject=subject,
                body=body,
                html_body=html_body,
                custom_headers=custom_headers
            )
            logger.info("Email message created successfully")
        except EmailValidationError as e:
            return f"Error: Message creation failed: {str(e)}"
        except Exception as e:
            return f"Error: Unexpected error creating message: {str(e)}"
    
        smtp_server = None
        try:
            logger.info(f"Connecting to SMTP server {config['smtp_host']}:{config['smtp_port']}")
            smtp_server = smtplib.SMTP(
                host=config['smtp_host'],
                port=config['smtp_port'],
                timeout=config['timeout']
            )
            if logger.getEffectiveLevel() == logging.DEBUG:
                smtp_server.set_debuglevel(1)
            if config['use_tls']:
                logger.info("Starting TLS encryption")
                smtp_server.ehlo()
                smtp_server.starttls()
                smtp_server.ehlo()
            logger.info("Authenticating with SMTP server")
            smtp_server.login(sender, config['smtp_password'])
            logger.info(f"Sending email to {to_addr}")
            refused = smtp_server.sendmail(sender, [to_addr], msg.as_string())
            if refused:
                return (
                    f"Error: Some recipients were refused by the server: {refused}. "
                    f"Please check the recipient email addresses and try again."
                )
            logger.info(f"Email sent successfully to {to_addr}")
            result = f"Email sent successfully to {to_addr}"
            if warning:
                result += warning
            return result
        except smtplib.SMTPAuthenticationError as e:
            error_msg = (
                f"Error: SMTP authentication failed: {str(e)}. "
                f"This usually means:\n"
                f"1. Incorrect email or password in configuration\n"
                f"2. Two-factor authentication is enabled (use app password instead)\n"
                f"3. Less secure app access is disabled (enable it or use app password)\n"
                f"Please verify your credentials via /settings endpoint."
            )
            logger.error(error_msg)
            return error_msg
        except smtplib.SMTPConnectError as e:
            error_msg = (
                f"Error: Failed to connect to SMTP server {config['smtp_host']}:{config['smtp_port']}: {str(e)}. "
                f"This could be due to:\n"
                f"1. Incorrect SMTP host or port\n"
                f"2. Network connectivity issues\n"
                f"3. Firewall blocking the connection\n"
                f"4. SMTP server is down\n"
                f"Please verify the SMTP settings via /settings endpoint."
            )
            logger.error(error_msg)
            return error_msg
        except smtplib.SMTPRecipientsRefused as e:
            error_msg = (
                f"Error: Recipient address '{to_addr}' was refused by the server: {str(e)}. "
                f"This could be due to:\n"
                f"1. Invalid or non-existent email address\n"
                f"2. Recipient's server blocking emails from your domain\n"
                f"3. Temporary server issues\n"
                f"Please verify the recipient's email address."
            )
            logger.error(error_msg)
            return error_msg
        except smtplib.SMTPDataError as e:
            error_msg = (
                f"Error: SMTP server rejected the email data: {str(e)}. "
                f"This could be due to:\n"
                f"1. Email content triggering spam filters\n"
                f"2. Email size exceeding limits\n"
                f"3. Invalid email format\n"
                f"Please review the email content and try again."
            )
            logger.error(error_msg)
            return error_msg
        except smtplib.SMTPException as e:
            error_msg = f"Error: SMTP protocol error: {str(e)}. Please try again or contact support."
            logger.error(error_msg)
            return error_msg
        except socket.timeout:
            error_msg = (
                f"Error: Connection timed out after {config['timeout']} seconds. "
                f"This could be due to:\n"
                f"1. Slow network connection\n"
                f"2. Server overload\n"
                f"3. Firewall issues\n"
                f"Please try again or increase the timeout value via /settings endpoint."
            )
            logger.error(error_msg)
            return error_msg
        except socket.gaierror as e:
            error_msg = (
                f"Error: DNS resolution failed for {config['smtp_host']}: {str(e)}. "
                f"Please verify the SMTP host address via /settings endpoint."
            )
            logger.error(error_msg)
            return error_msg
    except Exception as e:
        error_msg = (
            f"Error: Unexpected error during email sending: {str(e)}. "
            f"Error type: {type(e).__name__}. "
            f"Please check the configuration via /settings endpoint."
        )
        logger.error(error_msg)
        return error_msg
    finally:
        if smtp_server:
            try:
                smtp_server.quit()
                logger.info("SMTP connection closed")
            except Exception as e:
                logger.warning(f"Error closing SMTP connection: {e}")