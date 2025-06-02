import re
import json 
import logging

# Configure logging for step-related events
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def extract_action_input(input_str: str) -> tuple[str, str]:
    """
    Extracts the first valid JSON object from the action input string, handling format violations.
    Designed for LangChain ReAct agents where input_str is typically the action_input from the LLM.
    Returns (json_str, warning_message), where warning_message is empty if no violation occurs.
    Raises ValueError if no valid JSON is found.

    Args:
        input_str: The action input string from LangChain, e.g., '{"key": "value"}' or '{"key": "value"}Observ'.

    Returns:
        Tuple[str, str]: (extracted JSON string, warning message for format violations).
    """
    cleaned_input = input_str.strip()

    # Handle markdown code blocks if present
    if cleaned_input.startswith("```"):
        cleaned_input = re.sub(r'^```(?:json)?\s*\n?(.*?)\n?\s*```$', r'\1', cleaned_input, flags=re.DOTALL)
        cleaned_input = cleaned_input.strip()

    # Check if input starts with "Action Input:" and extract the content
    action_input_match = re.search(r'Action Input:\s*(.*)', cleaned_input, re.DOTALL)
    if action_input_match:
        action_input_text = action_input_match.group(1).strip()
        has_action_input_prefix = True
    else:
        action_input_text = cleaned_input
        has_action_input_prefix = False

    # Try parsing the entire cleaned input as JSON (most common valid case)
    try:
        json.loads(action_input_text)
        # Pure JSON without extra text - no warning needed
        return action_input_text, ""
    except json.JSONDecodeError:
        pass

    # Extract the first complete JSON object, accounting for strings and escapes
    brace_count = 0
    in_string = False
    escape = False
    start = -1
    end = -1

    for i, char in enumerate(action_input_text):
        if char == '"' and not escape:
            in_string = not in_string
        elif char == '{' and not in_string:
            if brace_count == 0:
                start = i
            brace_count += 1
        elif char == '}' and not in_string:
            brace_count -= 1
            if brace_count == 0:
                end = i + 1
                break
        escape = char == '\\' and not escape

    if start == -1 or end == -1 or brace_count != 0:
        logger.error(f"No complete JSON object found in input: {input_str}")
        raise ValueError("No valid JSON object found in the input string")

    extracted_json = action_input_text[start:end]
    remaining_text = action_input_text[end:].strip()

    # Validate the extracted JSON
    try:
        json.loads(extracted_json)
    except json.JSONDecodeError as e:
        logger.error(f"Extracted text is not valid JSON: {extracted_json}, error: {str(e)}")
        raise ValueError(f"Invalid JSON in action input: {str(e)}")

    # Generate warning for format violations
    warning_message = ""
    violations = []
    
    if remaining_text:
        violations.append(f"extra text after JSON: '{remaining_text}'")
    
    if has_action_input_prefix:
        violations.append("unnecessary 'Action Input:' prefix")
    
    if violations:
        violation_details = ", ".join(violations)
        logger.warning(f"ReAct format violation detected: {violation_details}. Full input: '{input_str}'")
        warning_message = f"\n\nWarning: ReAct format violation detected ({violation_details}). Please ensure proper ReAct format: Action Input must contain only valid JSON without extra text or prefixes."

    return extracted_json, warning_message