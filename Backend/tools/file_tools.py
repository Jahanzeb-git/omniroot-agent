import json
import os
import re
import time
from typing import Optional, List, Dict, Any, Tuple
import logging
from thread_storage import thread_local
from watchers.file_watcher import start_watching
from utils.extract_utils import extract_action_input

# Configure logging for step-related events
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def read_file(input_str: str) -> str:
    logger.info(f"Reading file with input: {input_str}")
    action_input, warning = extract_action_input(input_str)
    if not action_input:
        logger.error("Failed to extract valid JSON input")
        return """Error: Invalid or missing Action Input. Expected JSON format like '{"file_path": "test.txt"}'."""

    try:
        input_dict = json.loads(action_input)
        if not isinstance(input_dict, dict):
            logger.error(f"Action Input is not a JSON object: {input_dict}")
            return "Error: Action Input must be a JSON object."
        file_path = input_dict.get("file_path")
        if not isinstance(file_path, str) or not file_path:
            logger.error(f"Invalid file_path: {file_path}")
            return "Error: 'file_path' must be a non-empty string."
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}")
        return f"""Error: Invalid JSON in Action Input: {str(e)}. Expected '{"file_path": "test.txt"}'."""

    # Process file_path with default directory logic
    file_path = file_path.strip()
    file_path = os.path.expanduser(file_path)
    if not os.path.isabs(file_path):
        default_dir = os.path.expanduser('~/workspace')
        file_path = os.path.join(default_dir, file_path)
    file_path = os.path.normpath(file_path)

    # Check if the file was written in this query processing
    if hasattr(thread_local, 'written_files') and file_path in thread_local.written_files:
        result = f"File content is unchanged since your last write operation for '{file_path}'."
        if warning:
            result += warning
        logger.info(f"Optimized read: File '{file_path}' was recently written, returning message.")
        return result

    if len(file_path) > 1024:
        logger.error(f"file_path too long: {len(file_path)} characters")
        return "Error: 'file_path' is too long (max 1024 characters)."
    if any(c in file_path for c in '<>:"|?*'):
        logger.error(f"file_path contains invalid characters: {file_path}")
        return f"Error: 'file_path' contains invalid characters: {file_path}."

    if not os.path.exists(file_path):
        logger.error(f"File does not exist: {file_path}")
        return f"Error: File '{file_path}' does not exist."
    if not os.path.isfile(file_path):
        logger.error(f"Path is not a file: {file_path}")
        return f"Error: '{file_path}' is not a file."
    if os.path.islink(file_path):
        logger.error(f"Path is a symbolic link: {file_path}")
        return f"Error: '{file_path}' is a symbolic link, not supported."

    try:
        file_size = os.path.getsize(file_path)
        if file_size > 10 * 1024 * 1024:
            logger.error(f"File too large: {file_size} bytes")
            return f"Error: File '{file_path}' is too large (>10MB)."
    except OSError as e:
        logger.error(f"Cannot access file: {str(e)}")
        return f"Error: Cannot access file '{file_path}': {str(e)}."

    max_retries = 3
    for attempt in range(max_retries):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if len(content.encode('utf-8')) > 10 * 1024 * 1024:
                    logger.error(f"Content too large: {len(content.encode('utf-8'))} bytes")
                    return f"Error: Content of '{file_path}' exceeds 10MB."
                logger.info(f"Successfully read file: {file_path}")
                result = content
                if warning:
                    result += warning
                return result
        except UnicodeDecodeError:
            logger.error(f"File is not valid text: {file_path}")
            return f"Error: File '{file_path}' is not a valid text file."
        except PermissionError:
            logger.error(f"Permission denied: {file_path}")
            return f"Error: Permission denied to read '{file_path}'."
        except OSError as e:
            if attempt < max_retries - 1:
                time.sleep(0.5)
                continue
            logger.error(f"Failed to read file after retries: {str(e)}")
            return f"Error reading file '{file_path}': {str(e)}."



def write_file(input_str: str) -> str:
    """Write content to a file with robust error handling and default workspace directory."""
    logger.info(f"Writing file with input: {input_str}")
    action_input, warning = extract_action_input(input_str)
    if not action_input:
        logger.error("Failed to extract valid JSON input")
        return """Error: Invalid or missing Action Input. Expected JSON format like '{"file_name": "example.txt", "directory": "/existing/path", "content": "Hello World"}' or '{"file_name": "example.txt", "content": "Hello World"}' for default ~/workspace directory."""

    try:
        input_dict = json.loads(action_input)
        if not isinstance(input_dict, dict):
            logger.error(f"Action Input is not a JSON object: {input_dict}")
            return "Error: Action Input must be a JSON object."
        
        file_name = input_dict.get("file_name")
        directory = input_dict.get("directory")
        content = input_dict.get("content")
        
        # Validate file_name
        if not isinstance(file_name, str) or not file_name.strip():
            logger.error(f"Invalid file_name: {file_name}")
            return "Error: 'file_name' must be a non-empty string."
        
        # Set default directory if not provided
        if directory is None or directory == "":
            directory = os.path.expanduser("~/workspace")
            logger.info(f"Using default workspace directory: {directory}")
        elif not isinstance(directory, str):
            logger.error(f"Invalid directory type: {type(directory)}")
            return "Error: 'directory' must be a string or null/empty for default workspace."
        
        # Validate content
        if not isinstance(content, str):
            logger.error(f"Invalid content: {type(content)}")
            return "Error: 'content' must be a string."
            
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}")
        return f"""Error: Invalid JSON in Action Input: {str(e)}. Expected format: '{{"file_name": "example.txt", "directory": "/existing/path", "content": "Hello World"}}' or '{{"file_name": "example.txt", "content": "Hello World"}}' for default ~/workspace."""

    # Clean and validate file_name
    file_name = file_name.strip()
    if any(c in file_name for c in '<>:"|?*/\\'):
        logger.error(f"file_name contains invalid characters: {file_name}")
        return f"Error: 'file_name' contains invalid characters. Avoid: < > : \" | ? * / \\"
    
    if len(file_name) > 255:
        logger.error(f"file_name too long: {len(file_name)} characters")
        return "Error: 'file_name' is too long (max 255 characters)."

    # Process and validate directory
    directory = os.path.expanduser(directory.strip())
    directory = os.path.normpath(directory)
    
    if len(directory) > 1024:
        logger.error(f"directory path too long: {len(directory)} characters")
        return "Error: 'directory' path is too long (max 1024 characters)."
    
    if any(c in directory for c in '<>:"|?*'):
        logger.error(f"directory contains invalid characters: {directory}")
        return f"Error: 'directory' contains invalid characters: {directory}."

    # Construct full file path
    file_path = os.path.join(directory, file_name)
    
    if os.path.islink(file_path):
        logger.error(f"Path is a symbolic link: {file_path}")
        return f"Error: '{file_path}' is a symbolic link, not supported."

    # Validate content size
    if len(content.encode('utf-8')) > 10 * 1024 * 1024:
        logger.error(f"Content too large: {len(content.encode('utf-8'))} bytes")
        return f"Error: Content for '{file_name}' exceeds 10MB limit."

    # Validate directory exists (do not create directories)
    if not os.path.exists(directory):
        logger.error(f"Directory does not exist: {directory}")
        return f"Error: Directory '{directory}' does not exist. Please create it first or use an existing directory."
    
    if not os.path.isdir(directory):
        logger.error(f"Path is not a directory: {directory}")
        return f"Error: '{directory}' exists but is not a directory."
    
    if not os.access(directory, os.W_OK):
        logger.error(f"Write permission denied for directory: {directory}")
        return f"Error: Write permission denied for directory '{directory}'."

    # Check existing file permissions
    if os.path.exists(file_path):
        if not os.access(file_path, os.W_OK):
            logger.error(f"Write permission denied: {file_path}")
            return f"Error: Write permission denied for existing file '{file_name}' in '{directory}'."
        if not os.path.isfile(file_path):
            logger.error(f"Path is not a file: {file_path}")
            return f"Error: '{file_name}' exists in '{directory}' but is not a file."

    # Write file with retry mechanism
    max_retries = 3
    for attempt in range(max_retries):
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            logger.info(f"Successfully wrote to file: {file_path}")
            
            # Add file_path to thread_local.written_files if available
            if hasattr(thread_local, 'written_files'):
                thread_local.written_files.add(file_path)
            
            # Start watching the file for external changes if session tracking is available
            if hasattr(thread_local, 'session_id'):
                start_watching(file_path, thread_local.session_id)
            
            # Construct success message
            user_home = os.path.expanduser("~")
            default_workspace = os.path.join(user_home, "workspace")
            if directory == default_workspace:
                result = f"Successfully created '{file_name}' in default workspace directory ({directory})"
            else:
                result = f"Successfully created '{file_name}' in directory '{directory}'"
            
            if warning:
                result += warning
            return result
            
        except PermissionError:
            logger.error(f"Permission denied to write: {file_path}")
            return f"Error: Permission denied to write '{file_name}' to '{directory}'."
        except OSError as e:
            if attempt < max_retries - 1:
                time.sleep(0.5)
                continue
            logger.error(f"Failed to write file after retries: {str(e)}")
            return f"Error writing '{file_name}' to '{directory}': {str(e)}."