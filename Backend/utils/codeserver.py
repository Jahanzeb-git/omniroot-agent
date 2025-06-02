import subprocess
import os
import logging 

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def start_code_server(workspace_path="~/workspace", port=8080):
    """
    Starts code-server in the specified workspace directory.

    Args:
        workspace_path (str): Path to the workspace directory (default: ~/workspace).
        port (int): Port to run code-server on (default: 8080).
    """
    # Expand the tilde (~) to the full home path
    full_path = os.path.expanduser(workspace_path)

    # Ensure the directory exists
    if not os.path.isdir(full_path):
        raise FileNotFoundError(f"The directory '{full_path}' does not exist.")

    try:
        subprocess.Popen(
            ["code-server", "--bind-addr", f"127.0.0.1:{port}", full_path],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            stdin=subprocess.DEVNULL,
            start_new_session=True
        )
        print(f"code-server started on http://127.0.0.1:{port} in {full_path}")
        logger.info("code server successfully started.")
    except FileNotFoundError:
        print("code-server is not installed or not in PATH.")
        logging.info("code-server is not installed or not in PATH")
    except Exception as e:
        print(f"Failed to start code-server: {e}")
        logging.info("Failed to start code-server")
