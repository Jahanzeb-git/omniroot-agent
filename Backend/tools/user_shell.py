import os
import subprocess
import threading
import time
import signal
import psutil
import re
import select
from typing import Dict, Any, Optional, Tuple
import json
import uuid
import tempfile
from tools.terminal_events import terminal_events

class UserShellManager:
    """
    A dedicated shell manager for user terminal commands.
    This is separate from the agent's shell tool to avoid workflow ID interference
    and provide a consistent user experience.
    """
    def __init__(self):
        self.thread_local = threading.local()
        self.workspace_dir = os.path.expanduser("~/workspace")
        self.sudo_password = "ubuntu@2002"
        self.logs_dir = os.path.join(self.workspace_dir, "logs")
        self.session_history = []
        
        # Ensure logs directory exists
        os.makedirs(self.logs_dir, exist_ok=True)
        
        # Dangerous commands patterns
        self.dangerous_commands = [
            r'^rm\s+.*-[rf].*',  # rm with -r or -f flags
            r'^rm\s+/',          # rm on root paths
            r'^rm\s+.*\*',       # rm with wildcards
            r'^sudo\s+rm',       # sudo rm
            r'^dd\s+',           # dd command
            r'^mkfs\.',          # filesystem creation
            r'^fdisk',           # disk partitioning
            r'^parted',          # disk partitioning
            r'^format',          # format command
            r'^chmod\s+777',     # dangerous permissions
            r'^chmod\s+-R\s+777', # recursive dangerous permissions
        ]
        
        # Server startup commands
        self.server_commands = [
            r'^uvicorn\s+',
            r'^flask\s+run',
            r'^python\s+-m\s+http\.server',
            r'^node\s+.*server\.js',
            r'^npm\s+start',
            r'^yarn\s+start',
            r'^django-admin\s+runserver',
            r'^python\s+manage\.py\s+runserver',
            r'^gunicorn\s+',
            r'^hypercorn\s+',
        ]

    def validate_command(self, command: str) -> Tuple[bool, str]:
        """Validate command for dangerous operations"""
        command_lower = command.strip().lower()
        
        for pattern in self.dangerous_commands:
            if re.search(pattern, command_lower):
                return False, f"THREAT WARNING: Dangerous command detected - '{command}'. Command contains potentially destructive operations that could affect OS files."
                
        return True, ""
    
    def detect_server_command(self, command: str) -> Tuple[bool, str]:
        """Detect server startup commands"""
        command_lower = command.strip().lower()
        
        for pattern in self.server_commands:
            if re.search(pattern, command_lower):
                if not command.strip().endswith('&'):
                    return True, "It seems you're trying to run server in foreground! Please run in background using '&'."
                    
        return False, ""

    def execute_command(self, command: str, timeout: int = 60, use_sudo: bool = False) -> Dict[str, Any]:
        """Execute shell command with complete isolation between commands and improved server handling"""
        try:
            # Trim the command
            command = command.strip()
            
            # Get current working directory
            current_dir = getattr(self.thread_local, 'current_dir', self.workspace_dir)
            
            # Emit command event to terminal with working directory
            terminal_events.emit_command(command, "user", current_dir)
            
            # Add command to session history
            self.session_history.append({
                "command": command,
                "timestamp": time.time()
            })
            
            # Validate command safety
            is_safe, threat_msg = self.validate_command(command)
            if not is_safe:
                result = {
                    "working_directory": getattr(self.thread_local, 'current_dir', self.workspace_dir),
                    "status": "Failed",
                    "output": threat_msg,
                    "warnings": ""
                }
                terminal_events.emit_output(result["output"])
                return result
            
            # Determine if this is a background command
            is_background = command.endswith('&')
            
            # Check for server commands
            is_server_command = False
            for pattern in self.server_commands:
                if re.search(pattern, command.lower()):
                    is_server_command = True
                    break
            
            # If this is a server command but not marked as background, suggest running it in the background
            if is_server_command and not is_background:
                result = {
                    "working_directory": getattr(self.thread_local, 'current_dir', self.workspace_dir),
                    "status": "Failed",
                    "output": f"This appears to be a server command: '{command}'. Please run it in the background by adding '&' at the end.",
                    "warnings": "Server commands should be run in the background to avoid hanging the shell."
                }
                terminal_events.emit_output(result["output"])
                return result
            
            # Execute the command
            if is_background:
                return self.execute_background_command(command)
            else:
                return self.execute_foreground_command(command, timeout, use_sudo)
                
        except Exception as e:
            result = {
                "working_directory": getattr(self.thread_local, 'current_dir', self.workspace_dir),
                "status": "Failed",
                "output": f"Shell tool error: {str(e)}",
                "warnings": ""
            }
            terminal_events.emit_output(result["output"])
            return result
    
    def execute_background_command(self, command: str) -> Dict[str, Any]:
        """Execute background command with complete isolation and reliable process detection"""
        try:
            # Remove the trailing & from command
            clean_command = command.rstrip().rstrip('&').rstrip()
            
            # Generate unique log filename
            timestamp = int(time.time())
            unique_id = str(uuid.uuid4())[:8]
            log_filename = f"server_{timestamp}_{unique_id}.log"
            log_path = os.path.join(self.logs_dir, log_filename)
            
            # Create a temporary directory for process isolation
            temp_dir = tempfile.mkdtemp(prefix="bg_process_")
            script_path = os.path.join(temp_dir, "run.sh")
            pid_file = os.path.join(temp_dir, "pid")
            status_file = os.path.join(temp_dir, "status")
            
            # Create the runner script with proper isolation and status reporting
            with open(script_path, 'w') as f:
                f.write(f"""#!/bin/bash
# Redirect all output to the log file
exec > "{log_path}" 2>&1

# Mark process as started
echo "RUNNING" > "{status_file}"

# Run the actual command
{clean_command}

# Mark process as completed if it exits normally
echo "COMPLETED" > "{status_file}"
""")
            
            # Make the script executable
            os.chmod(script_path, 0o755)
            
            # Create a wrapper script that handles process management
            wrapper_path = os.path.join(temp_dir, "wrapper.sh")
            with open(wrapper_path, 'w') as f:
                f.write(f"""#!/bin/bash
# Execute the main script in background and grab its PID
bash "{script_path}" &
CHILD_PID=$!

# Save the real server PID to the PID file
echo $CHILD_PID > "{pid_file}"

# Initialize status file
echo "STARTING" > "{status_file}"

# Wait a moment for the process to initialize
sleep 2

# Check if the process is still running or if it has a child
if ps -p $CHILD_PID > /dev/null || grep -q "RUNNING" "{status_file}"; then
    # Process is running successfully
    exit 0
else
    # Process failed to start
    echo "FAILED" > "{status_file}"
    exit 1
fi
""")
            
            # Make the wrapper script executable
            os.chmod(wrapper_path, 0o755)
            
            # Launch the process in a completely separate environment
            launch_cmd = f"""
nohup setsid "{wrapper_path}" </dev/null >/dev/null 2>&1 &
"""
            
            # Execute the launch command
            subprocess.run(launch_cmd, shell=True, cwd=self.workspace_dir)
            
            # Wait for the process to initialize (longer wait time)
            time.sleep(3)
            
            # Check the status file
            status = "UNKNOWN"
            if os.path.exists(status_file):
                try:
                    with open(status_file, 'r') as f:
                        status = f.read().strip()
                except:
                    pass
            
            # Get the PID from the file
            bg_pid = None
            if os.path.exists(pid_file):
                try:
                    with open(pid_file, 'r') as f:
                        bg_pid = f.read().strip()
                except:
                    pass
            
            # Determine if the process started successfully
            process_running = False
            
            # First check the status file
            if status in ["RUNNING", "STARTING"]:
                process_running = True
            
            # Then verify with the PID if available
            if bg_pid and not process_running:
                try:
                    # Check if the process exists
                    os.kill(int(bg_pid), 0)
                    process_running = True
                except (OSError, ValueError):
                    pass
            
            # Also check for any child processes that might be running
            if not process_running and bg_pid:
                try:
                    # Check for child processes
                    child_check = subprocess.run(
                        f"pgrep -P {bg_pid}", 
                        shell=True, 
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True
                    )
                    if child_check.stdout.strip():
                        process_running = True
                except:
                    pass
            
            # Schedule cleanup of the temporary directory (but keep the log file)
            subprocess.Popen(f"sleep 30 && rm -rf '{temp_dir}'", shell=True)
            
            # Store the current directory
            current_dir = self.workspace_dir
            if hasattr(self.thread_local, 'current_dir'):
                current_dir = self.thread_local.current_dir
            
            if process_running:
                # Process started successfully
                output_msg = f"Background process started successfully with PID: {bg_pid or 'unknown'}"
                warnings = f"Background process started successfully with PID: {bg_pid or 'unknown'}. You can access logs at: {log_path}"
                
                # Emit output event to terminal
                terminal_events.emit_output(output_msg)
                
                return {
                    "working_directory": current_dir,
                    "status": "Successful",
                    "output": output_msg,
                    "warnings": warnings
                }
            else:
                # Process failed to start or exited immediately
                # Check the log file for error messages
                error_msg = "Background process started but exited immediately"
                if os.path.exists(log_path):
                    try:
                        with open(log_path, 'r') as f:
                            log_content = f.read().strip()
                            if log_content:
                                error_msg += f"\nLog output: {log_content[:500]}"
                                if len(log_content) > 500:
                                    error_msg += "... (truncated)"
                    except:
                        pass
                
                # Emit output event to terminal
                terminal_events.emit_output(error_msg)
                
                return {
                    "working_directory": current_dir,
                    "status": "Failed",
                    "output": error_msg,
                    "warnings": f"Check the log file for more details: {log_path}"
                }
                
        except Exception as e:
            return {
                "working_directory": getattr(self.thread_local, 'current_dir', self.workspace_dir),
                "status": "Failed",
                "output": f"Background command execution error: {str(e)}",
                "warnings": ""
            }
    
    def execute_foreground_command(self, command: str, timeout: int, use_sudo: bool) -> Dict[str, Any]:
        """Execute foreground command with complete isolation and improved server detection"""
        try:
            # Check if this is a server command that should be run in the background
            is_server_command = False
            for pattern in self.server_commands:
                if re.search(pattern, command.strip().lower()):
                    is_server_command = True
                    break
            
            # If this is a server command, suggest running it in the background
            if is_server_command:
                return {
                    "working_directory": getattr(self.thread_local, 'current_dir', self.workspace_dir),
                    "status": "Failed",
                    "output": f"This appears to be a server command: '{command}'. Please run it in the background by adding '&' at the end.",
                    "warnings": "Server commands should be run in the background to avoid hanging the shell."
                }
            
            # Check if this is a curl command to a local server
            is_curl_to_local = False
            if command.strip().lower().startswith("curl ") and ("localhost" in command or "127.0.0.1" in command):
                is_curl_to_local = True
            
            # Create a temporary directory for command execution
            temp_dir = tempfile.mkdtemp(prefix="cmd_")
            output_file = os.path.join(temp_dir, "output.txt")
            pwd_file = os.path.join(temp_dir, "pwd.txt")
            exit_code_file = os.path.join(temp_dir, "exit_code.txt")
            
            # Prepare the command
            if use_sudo:
                cmd = f"echo '{self.sudo_password}' | sudo -S {command}"
            else:
                cmd = command
            
            # Create a script to execute the command with proper isolation
            script_path = os.path.join(temp_dir, "cmd.sh")
            
            # For curl commands to local servers, use a shorter timeout
            curl_timeout = min(10, timeout) if is_curl_to_local else timeout
            
            # Handle compound commands with &&
            if ' && ' in cmd:
                # Split the command by &&
                commands = [c.strip() for c in cmd.split('&&')]
                
                # Process each command
                current_dir = getattr(self.thread_local, 'current_dir', self.workspace_dir)
                output_lines = []
                exit_code = 0
                
                for command in commands:
                    command = command.strip()
                    
                    # Handle cd command
                    if command.startswith('cd '):
                        # Extract the directory path
                        dir_path = command[3:].strip()
                        
                        # Handle ~ in path
                        if dir_path.startswith('~'):
                            dir_path = os.path.expanduser(dir_path)
                        
                        # Check if the directory exists
                        if os.path.isdir(dir_path):
                            # Directory exists, update the current directory
                            current_dir = dir_path
                            self.thread_local.current_dir = current_dir
                            output_lines.append(f"Changed directory to: {dir_path}")
                        else:
                            # Directory doesn't exist
                            output_lines.append(f"cd: {dir_path}: No such file or directory")
                            exit_code = 1
                            break
                    else:
                        # Execute the non-cd command
                        try:
                            # Create a temporary script for the command
                            temp_script = os.path.join(temp_dir, f"cmd_{len(output_lines)}.sh")
                            with open(temp_script, 'w') as f:
                                f.write(f"""#!/bin/bash
cd "{current_dir}"
{command} 2>&1
""")
                            os.chmod(temp_script, 0o755)
                            
                            # Execute the script
                            result = subprocess.run(
                                [temp_script],
                                stdout=subprocess.PIPE,
                                stderr=subprocess.STDOUT,
                                text=True,
                                timeout=timeout
                            )
                            
                            # Append the output
                            if result.stdout:
                                output_lines.append(result.stdout.strip())
                            
                            # Check exit code
                            if result.returncode != 0:
                                exit_code = result.returncode
                                break
                        except Exception as e:
                            output_lines.append(f"Error executing command: {str(e)}")
                            exit_code = 1
                            break
                
                # Write the output
                with open(output_file, 'w') as f:
                    f.write('\n'.join(output_lines))
                
                # Write the exit code
                with open(exit_code_file, 'w') as f:
                    f.write(str(exit_code))
                
                # Write the current directory
                with open(pwd_file, 'w') as f:
                    f.write(current_dir)
                
                # Skip executing the script
                output = '\n'.join(output_lines)
                
                # Emit output event to terminal
                terminal_events.emit_output(output)
                
                return {
                    "working_directory": current_dir,
                    "status": "Successful" if exit_code == 0 else "Failed",
                    "output": output,
                    "warnings": ""
                }
            
            # Create a special script for cd commands
            elif cmd.strip().startswith('cd '):
                # Extract the directory path
                dir_path = cmd.strip()[3:].strip()
                
                # Handle ~ in path
                if dir_path.startswith('~'):
                    dir_path = os.path.expanduser(dir_path)
                
                # Check if the directory exists
                if os.path.isdir(dir_path):
                    # Directory exists, update the current directory
                    self.thread_local.current_dir = dir_path
                    
                    # Write success output
                    with open(output_file, 'w') as f:
                        f.write(f"Changed directory to: {dir_path}")
                    
                    # Write exit code
                    with open(exit_code_file, 'w') as f:
                        f.write("0")
                    
                    # Write current directory
                    with open(pwd_file, 'w') as f:
                        f.write(dir_path)
                    
                    # Skip executing the script
                    output = f"Changed directory to: {dir_path}"
                    
                    # Emit output event to terminal
                    terminal_events.emit_output(output)
                    
                    return {
                        "working_directory": dir_path,
                        "status": "Successful",
                        "output": output,
                        "warnings": ""
                    }
                else:
                    # Directory doesn't exist
                    with open(output_file, 'w') as f:
                        f.write(f"cd: {dir_path}: No such file or directory")
                    
                    # Write exit code
                    with open(exit_code_file, 'w') as f:
                        f.write("1")
                    
                    # Write current directory (unchanged)
                    current_dir = getattr(self.thread_local, 'current_dir', self.workspace_dir)
                    with open(pwd_file, 'w') as f:
                        f.write(current_dir)
                    
                    # Skip executing the script
                    output = f"cd: {dir_path}: No such file or directory"
                    
                    # Emit output event to terminal
                    terminal_events.emit_output(output)
                    
                    return {
                        "working_directory": current_dir,
                        "status": "Failed",
                        "output": output,
                        "warnings": ""
                    }
            
            # For regular commands, create a script
            with open(script_path, 'w') as f:
                f.write(f"""#!/bin/bash
# Change to the workspace directory
cd "{self.workspace_dir}"
if [ -n "$USER_SHELL_CURRENT_DIR" ] && [ -d "$USER_SHELL_CURRENT_DIR" ]; then
    cd "$USER_SHELL_CURRENT_DIR"
fi

# For curl commands to localhost, add a timeout to prevent hanging
if [[ "{cmd}" == curl* ]] && [[ "{cmd}" == *localhost* || "{cmd}" == *127.0.0.1* ]]; then
    # Add timeout to curl command if not already present
    if ! [[ "{cmd}" == *"--connect-timeout"* ]]; then
        CMD="{cmd} --connect-timeout 5 --max-time {curl_timeout}"
    else
        CMD="{cmd}"
    fi
    
    # Execute the command and capture output
    {{ $CMD; }} > "{output_file}" 2>&1
    echo $? > "{exit_code_file}"
else
    # Execute the command and capture output
    {{ {cmd}; }} > "{output_file}" 2>&1
    echo $? > "{exit_code_file}"
fi

# Save the current directory
pwd > "{pwd_file}"
""")
            
            # Make the script executable
            os.chmod(script_path, 0o755)
            
            # Set the current directory environment variable
            env = os.environ.copy()
            if hasattr(self.thread_local, 'current_dir'):
                env["USER_SHELL_CURRENT_DIR"] = self.thread_local.current_dir
            
            # Execute the script with timeout
            try:
                # Use a shorter timeout for curl commands to local servers
                effective_timeout = curl_timeout if is_curl_to_local else timeout
                
                subprocess.run(
                    [script_path],
                    env=env,
                    timeout=effective_timeout,
                    check=False
                )
                
                # Read the output
                with open(output_file, 'r') as f:
                    output = f.read()
                
                # Read the exit code
                with open(exit_code_file, 'r') as f:
                    exit_code = int(f.read().strip())
                
                # Read the current directory
                with open(pwd_file, 'r') as f:
                    current_dir = f.read().strip()
                    self.thread_local.current_dir = current_dir
                
                # Clean up
                os.system(f"rm -rf '{temp_dir}'")
                
                # Clean sudo password prompts
                if use_sudo and '[sudo] password for' in output:
                    output_lines = output.split('\n')
                    output_lines = [line for line in output_lines if '[sudo] password for' not in line]
                    output = '\n'.join(output_lines)
                
                # For curl commands to local servers that failed, check if the server is running
                if is_curl_to_local and exit_code != 0:
                    # Extract the port from the curl command
                    port_match = re.search(r'localhost:(\d+)|127\.0\.0\.1:(\d+)', command)
                    if port_match:
                        port = port_match.group(1) or port_match.group(2)
                        # Check if anything is listening on this port
                        try:
                            port_check = subprocess.run(
                                f"lsof -i :{port} -P -n | grep LISTEN",
                                shell=True,
                                stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE,
                                text=True
                            )
                            if not port_check.stdout.strip():
                                output += f"\n\nNo process is listening on port {port}. Make sure your server is running."
                            else:
                                output += f"\n\nA process is listening on port {port}, but the curl command failed. The server might not be fully initialized yet."
                        except:
                            pass
                
                # Emit output event to terminal
                terminal_events.emit_output(output)
                
                return {
                    "working_directory": current_dir,
                    "status": "Successful" if exit_code == 0 else "Failed",
                    "output": output,
                    "warnings": ""
                }
                
            except subprocess.TimeoutExpired:
                # Command timed out
                os.system(f"rm -rf '{temp_dir}'")
                
                # For curl commands to local servers, provide a more helpful message
                if is_curl_to_local:
                    # Extract the port from the curl command
                    port_match = re.search(r'localhost:(\d+)|127\.0\.0\.1:(\d+)', command)
                    if port_match:
                        port = port_match.group(1) or port_match.group(2)
                        # Check if anything is listening on this port
                        try:
                            port_check = subprocess.run(
                                f"lsof -i :{port} -P -n | grep LISTEN",
                                shell=True,
                                stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE,
                                text=True
                            )
                            if not port_check.stdout.strip():
                                output = f"Curl command timed out after {timeout} seconds. No process is listening on port {port}. Make sure your server is running."
                                
                                # Emit output event to terminal
                                terminal_events.emit_output(output)
                                
                                return {
                                    "working_directory": getattr(self.thread_local, 'current_dir', self.workspace_dir),
                                    "status": "Failed",
                                    "output": output,
                                    "warnings": "The server might not be running or might be listening on a different port."
                                }
                        except:
                            pass
                
                output = f"Command timed out after {timeout} seconds"
                
                # Emit output event to terminal
                terminal_events.emit_output(output)
                
                return {
                    "working_directory": getattr(self.thread_local, 'current_dir', self.workspace_dir),
                    "status": "Failed",
                    "output": output,
                    "warnings": "The command may still be running in the background"
                }
                
        except Exception as e:
            output = f"Foreground command execution error: {str(e)}"
            
            # Emit output event to terminal
            terminal_events.emit_output(output)
            
            return {
                "working_directory": getattr(self.thread_local, 'current_dir', self.workspace_dir),
                "status": "Failed",
                "output": output,
                "warnings": ""
            }

# Global instance
user_shell_manager = UserShellManager()