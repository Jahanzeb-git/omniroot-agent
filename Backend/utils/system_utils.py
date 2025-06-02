import platform
import logging

logger = logging.getLogger(__name__)

def get_os_and_kernel():
    """Detect the operating system and kernel version."""
    os_name = platform.system()
    if os_name == "Linux":
        kernel_version = platform.release()
    elif os_name == "Windows":
        kernel_version = platform.version()
    else:
        kernel_version = "Unknown"
    return os_name, kernel_version