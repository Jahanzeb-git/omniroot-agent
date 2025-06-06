import subprocess
import os
import logging 

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def start_code_server(workspace_path="/app/workspace", port=8080):
    """
    Starts code-server in the specified workspace directory.

    Args:
        workspace_path (str): Path to the workspace directory (default: /app/workspace).
        port (int): Port to run code-server on (default: 8080).
    """
    logger.info(f"Attempting to start code-server with workspace_path: {workspace_path}")
    # Expand the tilde (~) to the full home path
    full_path = os.path.abspath(workspace_path)

    # Ensure the directory exists
    if not os.path.isdir(full_path):
        raise FileNotFoundError(f"The directory '{full_path}' does not exist.")

    try:
        subprocess.Popen(
            ["code-server", "--bind-addr", f"0.0.0.0:{port}", "--auth", "none", full_path],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            stdin=subprocess.DEVNULL,
            start_new_session=True
        )
        print(f"code-server started on http://0.0.0.0:{port} in {full_path}")
        logger.info("code server successfully started.")
    except FileNotFoundError:
        print("code-server is not installed or not in PATH.")
        logger.error("code-server is not installed or not in PATH")
    except Exception as e:
        print(f"Failed to start code-server: {e}")
        logger.error(f"Failed to start code-server: {e}")