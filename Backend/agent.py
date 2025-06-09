import os
import logging
import json
import time
import sqlite3
import uuid
from datetime import datetime
from typing import Dict, Any, Union
from langchain_openai import ChatOpenAI
from langchain_litellm import ChatLiteLLM
from langchain_core.prompts import PromptTemplate
from langchain_core.tools import Tool
from langchain.agents import create_react_agent, AgentExecutor
from langchain.memory import ConversationSummaryMemory
from langchain.callbacks.base import BaseCallbackHandler
from tools.file_tools import read_file, write_file
from tools.shell_tool import shell_tool_function
from tools.email_tool import send_email_smtp
from utils.extract_utils import extract_action_input
from utils.llm_utils import initialize_llm
from prompts.agent_prompt import prompt
from prompts.summary_prompt import FORMATTED_PROMPT
from utils.service_utils import get_pid_by_port, add_or_update_server, set_current_frontend, notify_appview_update
import re
from queue import Queue
# Using threading storage.. 
import threading
from thread_storage import thread_local 
from utils.db_utils import init_db


# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)
    

import logging
logger = logging.getLogger(__name__)

def appview_tool_function(input_data):
    """Handle AppView tool requests by updating the database and notifying clients."""
    logger.info(f"AppView tool called with input: {input_data}")
    try:
        if isinstance(input_data, str):
            data = json.loads(input_data)
            logger.info(f"Parsed JSON input: {data}")
        elif isinstance(input_data, dict):
            data = input_data
            logger.info(f"Received dict input: {data}")
        else:
            logger.error("Invalid input type")
            return "Error: AppView tool input must be JSON string or dictionary"
        
        server_port = data.get('server-port')
        frontend_port = data.get('frontend-port')
        render_server = data.get('Render-server', True)
        render_frontend = data.get('Render-Frontend', True)
        
        errors = []
        success_messages = []
        
        if server_port and render_server:
            try:
                server_port = int(server_port)
                logger.info(f"Checking server port {server_port}")
                server_pid = get_pid_by_port(server_port)
                if server_pid:
                    add_or_update_server(server_port, server_pid)
                    success_messages.append(f"Server on port {server_port} added to AppView")
                    logger.info(f"✓ Server on port {server_port} (PID: {server_pid}) registered")
                else:
                    errors.append(f"No process found listening on server port {server_port}")
                    logger.warning(f"✗ No process found on server port {server_port}")
            except ValueError:
                errors.append(f"Invalid server port: {server_port}")
                logger.error(f"Invalid server port value: {server_port}")
            except Exception as e:
                errors.append(f"Error checking server port {server_port}: {str(e)}")
                logger.error(f"Server port error: {e}", exc_info=True)
        
        if frontend_port and render_frontend:
            try:
                frontend_port = int(frontend_port)
                logger.info(f"Checking frontend port {frontend_port}")
                frontend_pid = get_pid_by_port(frontend_port)
                if frontend_pid:
                    set_current_frontend(frontend_port, frontend_pid)
                    success_messages.append(f"Frontend on port {frontend_port} set for browser view")
                    logger.info(f"✓ Frontend on port {frontend_port} (PID: {frontend_pid}) registered")
                else:
                    errors.append(f"No process found listening on frontend port {frontend_port}")
                    logger.warning(f"✗ No process found on frontend port {frontend_port}")
            except ValueError:
                errors.append(f"Invalid frontend port: {frontend_port}")
                logger.error(f"Invalid frontend port value: {frontend_port}")
            except Exception as e:
                errors.append(f"Error checking frontend port {frontend_port}: {str(e)}")
                logger.error(f"Frontend port error: {e}", exc_info=True)
        
        notify_appview_update()
        
        if errors and success_messages:
            result = f"AppView partially updated: {'; '.join(success_messages)}. Errors: {'; '.join(errors)}"
        elif errors:
            result = f"AppView update failed: {'; '.join(errors)}"
        elif success_messages:
            result = f"AppView updated successfully: {'; '.join(success_messages)}"
        else:
            result = "AppView tool called but no valid ports provided"
        
        logger.info(f"AppView tool returning: {result}")
        return result
    except json.JSONDecodeError as e:
        error_msg = f"Error: Invalid JSON format in AppView tool input: {str(e)}"
        logger.error(error_msg)
        return error_msg
    except Exception as e:
        error_msg = f"Critical error in AppView tool: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return error_msg
    


# Tools definition
tools = [
    Tool(
        name="ReadFile",
        func=read_file,
        description="Retrieves file content from '~/workspace' unless an absolute path is given. Input must be a JSON string, e.g., '{\"file_path\": \"test.txt\"}'. Use relative paths (e.g., 'test.txt') for '~/workspace'; absolute paths (e.g., '/other/file.txt') for other locations. Returns content or error if file is invalid, >10MB, or inaccessible. PDF and DOCX files also supported to read in TXT."
    ),
    Tool(
        name="WriteFile",
        func=write_file,
        description="""
            Creates files in ~/workspace by default. Use default unless user specifies directory.

            FORMAT: {"file_name": "name.ext", "content": "text"}
            CUSTOM DIR: {"file_name": "name.ext", "directory": "/path", "content": "text"}

            Rules: file_name required, content required, directory optional (defaults ~/workspace)
            Limits: filename ≤255 chars, path ≤1024 chars, content ≤10MB

            Example: {"file_name": "test.py", "content": "print('hi')"}
            """
    ),
    Tool(
        name="ShellTool",
        func=shell_tool_function,
        description="""Run shell commands on the host OS with session, sudo, and timeout support.

**Input (JSON):**
- `command` (str, required): Shell command to run
- `timeout` (int, optional): Max time in seconds (default: 60)
- `use_sudo` (bool, optional): Use elevated privileges
- `session` (str, optional): Session ID ("default", "new", or custom)

**Examples:**
- Basic: {"command": "ls"}
- Timeout: {"command": "find .", "timeout": 90}
- Sudo: {"command": "systemctl restart nginx", "use_sudo": true}
- New session: {"command": "cd /tmp", "session": "new"}
- Server: {"command": "python app.py"}

**Output:**
- `status`: successful | error | blocked | timeout
- `output`: Command result or error
- `cwd`: Current working directory
- `session_id`: Active session
For List all sessions please Call "list_shell_sessions()" function without any input.
"""
    ),
    Tool(
        name="EmailTool",
        description=(
            "Send emails via SMTP. Input must be a JSON object with: "
            "  • to (string): recipient email address  "
            "  • subject (string): email subject  "
            "  • body (string): plain-text body  "
            "Optional: html_body (string): HTML body  "
            "Example: {\"to\":\"alice@example.com\",\"subject\":\"Hi\",\"body\":\"Hello!\",\"html_body\":\"<p>Hello!</p>\"}"
        ),
        func=send_email_smtp
    ),
    Tool(
        name="AppView",
        description=(
            "Display running servers and frontends to the user in the AppView interface. "
            "Input must be JSON with port numbers and render flags. "
            "Example: {\"server-port\": 5005, \"frontend-port\": 3003, \"Render-server\": true, \"Render-Frontend\": true}. "
            "Either server or frontend can be shown individually or both together."
        ),
    func=appview_tool_function
    )
]
logger.info("Created tools: ReadFile, WriteFile, ShellTool, EmailTool")

# Start a new session
def start_new_session() -> tuple[str, ConversationSummaryMemory]:
    """Create a new session with a unique ID and initialize memory."""
    session_id = str(uuid.uuid4())
    # Fetch model from settings
    try:
        conn = sqlite3.connect("/data/agent_memory.db")
        c = conn.cursor()
        c.execute("SELECT model FROM settings WHERE id = 1")
        row = c.fetchone()
        model_string = row[0] if row and row[0] else None
    finally:
        conn.close()
    memory = ConversationSummaryMemory(llm=initialize_llm(model_string), prompt = FORMATTED_PROMPT)
    conn = sqlite3.connect("/data/agent_memory.db")
    c = conn.cursor()
    c.execute("INSERT INTO sessions (session_id, start_time) VALUES (?, ?)",
              (session_id, datetime.now().isoformat()))
    conn.commit()
    conn.close()
    logger.info(f"Started new session: {session_id}")
    return session_id, memory


# Custom Callback Handler for streaming
class StreamingCallbackHandler(BaseCallbackHandler):
    def __init__(self, queue: Queue, workflow_id: str, db: sqlite3.Connection):
        self.queue = queue
        self.workflow_id = workflow_id
        self.db = db
        self.step_counter = 0

    def on_agent_action(self, action, **kwargs):
        thought = extract_thought(action.log)
        action_name = extract_action(action.log)
        action_input = extract_action_input(action.log)
        step_data = {
            "type": "step",
            "thought": f"Thought: {thought}",
            "action": action_name
        }
        # Exclude action_input for WriteFile and ReadFile
        if action_name not in ["WriteFile", "ReadFile"]:
            step_data["action_input"] = json.loads(action_input)
        self.queue.put(step_data)
        self._insert_step(thought, action_name, action_input, "")

    def on_tool_end(self, output, **kwargs):
        observation_data = {
            "type": "observation",
            "observation": output
        }
        self.queue.put(observation_data)
        # Update the last step with observation
        c = self.db.cursor()
        c.execute("UPDATE steps SET observation = ? WHERE step_id = ?",
                  (output, self.last_step_id))
        self.db.commit()

    def on_agent_finish(self, finish, **kwargs):
        final_thought = extract_thought(finish.log)
        final_answer = finish.return_values['output']
        final_data = {
            "type": "final_answer",
            "thought": f"Thought: {final_thought}",
            "answer": final_answer
        }
        self.queue.put(final_data)
        self._insert_step(final_thought, "Final Answer", "", final_answer)

    def _insert_step(self, thought: str, action: str, action_input: str, observation: str):
        self.step_counter += 1
        step_id = f"{self.workflow_id}_{self.step_counter}"
        self.last_step_id = step_id
        c = self.db.cursor()
        c.execute("INSERT INTO steps (step_id, workflow_id, thought, action, action_input, observation, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
                  (step_id, self.workflow_id, thought, action, action_input, observation, datetime.now().isoformat()))
        self.db.commit()
        

# Process query with streaming
def process_query(session_id: str, query: str, memory: ConversationSummaryMemory, queue: Queue) -> None:
    """Process a user query with streaming via a queue."""

    thread_local.written_files = set() # Initialize thread-local written_files set
    thread_local.session_id = session_id # Initialize thread_local session_id for hold session.

    # Open a new database connection
    db = sqlite3.connect("/data/agent_memory.db", check_same_thread=False)
    db.row_factory = sqlite3.Row
    try:
        # Fetch model from settings
        c = db.cursor()
        c.execute("SELECT model, max_iterations FROM settings WHERE id = 1")
        row = c.fetchone()
        model_string = row['model'] if row and row['model'] else None
        max_iterations = row['max_iterations'] if row and row['max_iterations'] is not None else 10
        llm = initialize_llm(model_string)
        agent = create_react_agent(llm, tools, prompt)
        workflow_id = str(uuid.uuid4())
        c = db.cursor()
        c.execute("INSERT INTO workflows (workflow_id, session_id, start_time, query) VALUES (?, ?, ?, ?)",
                  (workflow_id, session_id, datetime.now().isoformat(), query))
        db.commit()
        handler = StreamingCallbackHandler(queue, workflow_id, db)
        logger.info(f"Registering callback handler for workflow {workflow_id}: {handler}")
        executor = AgentExecutor(
            agent=agent,
            tools=tools,
            memory=memory,
            verbose=True,
            max_iterations=max_iterations,
            handle_parsing_errors=True,
            callbacks=[handler]
        )
        start_time = time.time()
        logger.info(f"Starting AgentExecutor for query: {query}")
        executor.invoke({"input": query})
        execution_time = time.time() - start_time
        queue.put({"type": "execution_time", "time": execution_time})
        logger.info(f"Processed query in session {session_id}, workflow {workflow_id}, execution time: {execution_time:.2f}s")
    finally:
        db.close()  # Ensure the connection is closed even if an error occurs
        if hasattr (thread_local, 'session_id'):
            del thread_local.session_id
        if hasattr (thread_local, 'written_files'):
            del thread_local.written_files



# Get session history
def get_session_history(session_id: str) -> Dict[str, Any]:
    """Retrieve the history of workflows and steps for a given session."""
    conn = sqlite3.connect("/data/agent_memory.db")
    conn.row_factory = sqlite3.Row  # Enable column name access
    c = conn.cursor()
    
    # Check if the session exists and fetch start_time
    c.execute("SELECT start_time FROM sessions WHERE session_id = ?", (session_id,))
    session = c.fetchone()
    if not session:
        conn.close()
        return None  # Session does not exist
    
    session_start_time = session['start_time']
    
    # Fetch workflows
    c.execute("SELECT workflow_id, start_time, query FROM workflows WHERE session_id = ?", (session_id,))
    workflows = c.fetchall()
    
    history = []
    for workflow in workflows:
        workflow_id = workflow['workflow_id']
        c.execute("SELECT thought, action, action_input, observation FROM steps WHERE workflow_id = ? ORDER BY timestamp", (workflow_id,))
        steps = c.fetchall()
        workflow_data = {
            'workflow_id': workflow_id,
            'start_time': workflow['start_time'],
            'query': workflow['query'] if workflow['query'] is not None else "Query not available",
            'steps': [{'thought': step['thought'], 'action': step['action'], 'action_input': step['action_input'], 'observation': step['observation']} for step in steps]
        }
        history.append(workflow_data)
    
    conn.close()
    logger.info(f"Retrieved history for session: {session_id}")
    return {
        'session_id': session_id,
        'start_time': session_start_time,
        'workflows': history
    }


# Helper functions to extract thought, action, action_input from log
def extract_thought(log: str) -> str:
    """Extract the 'Thought' from the agent's log."""
    match = re.search(r'Thought: (.*?)(?:\n|$)', log)
    return match.group(1) if match else ''

def extract_action(log: str) -> str:
    """Extract the 'Action' from the agent's log."""
    match = re.search(r'Action: (.*?)(?:\n|$)', log)
    return match.group(1) if match else ''

def extract_action_input(log: str) -> str:
    """Extract the 'Action Input' from the agent's log."""
    match = re.search(r'Action Input: (.*?)(?:\n|$)', log)
    return match.group(1) if match else ''


