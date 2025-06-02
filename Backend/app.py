from flask import Flask, request, jsonify, g, Response
import sqlite3
from utils.memory_utils import load_session_memory, save_memory
import json
from queue import Queue
import psutil
import logging
import threading
import time
from flask_cors import CORS
from utils.db_utils import init_db
from utils.system_utils import get_os_and_kernel
from pathlib import Path
from utils.codeserver import start_code_server
from tools.terminal_events import terminal_events
from tools.shell_tool import shell_manager
from tools.user_shell import user_shell_manager
from utils.service_utils import appview_queues, check_running_services
app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Initialize database before agent.py to avoid race conditions...
init_db()
# Importing from agent.py after database initialization...
from agent import start_new_session, process_query, get_session_history

# Database connection management
def get_db():
    """Get a database connection, reusing it within the request context."""
    if 'db' not in g:
        g.db = sqlite3.connect("agent_memory.db", check_same_thread=False)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(error):
    """Close the database connection at the end of the request."""
    if hasattr(g, 'db'):
        g.db.close()

def update_system_settings():
    """
    Update OS and kernel version in the settings table and create the workspace directory.
    """
    # --- Create workspace directory ---
    try:
        # Path.home() gets the user's home directory (~/ on Linux, C:\Users\<user> on Windows)
        workspace_path = Path.home() / "workspace"
        
        # Create the directory. exist_ok=True prevents an error if it already exists.
        workspace_path.mkdir(exist_ok=True)
        
        logger.info(f"Workspace directory is ready at: {workspace_path}")
        
    except Exception as e:
        # Log an error if the directory creation fails for any reason (e.g., permissions)
        logger.error(f"Could not create or access the workspace directory: {e}")
        


    # --- Original database update logic ---
    os_name, kernel_version = get_os_and_kernel()
    conn = sqlite3.connect("agent_memory.db")
    c = conn.cursor()
    c.execute("UPDATE settings SET os = ?, kernel_version = ? WHERE id = 1", (os_name, kernel_version))
    conn.commit()
    conn.close()
    logger.info(f"Updated settings with OS: {os_name}, Kernel: {kernel_version}")



# Endpoint: Process a query with streaming
@app.route('/Query', methods=['POST'])
def query():
    """Process a user query within a session, streaming steps as they complete."""
    data = request.get_json()
    if not data or 'session_id' not in data or 'query' not in data:
        return jsonify({'error': 'Missing session_id or query'}), 400
    session_id = data['session_id']
    query = data['query']
    
    db = get_db()
    c = db.cursor()
    c.execute("SELECT session_id FROM sessions WHERE session_id = ?", (session_id,))
    if not c.fetchone():
        return jsonify({'error': f'Session {session_id} not found'}), 404

    # Check if settings are configured
    c.execute("SELECT model FROM settings WHERE id = 1")
    row = c.fetchone()
    if not row or not row['model']:
        return jsonify({'error': 'Model is Required, Please ensure Model name is configured.'}), 400
    
    memory = load_session_memory(session_id)
    queue = Queue()
    
    def run_executor():
        try: 
            process_query(session_id, query, memory, queue)  # No db parameter
            save_memory(session_id, memory)
        except ValueError as e: 
            error_message = str(e)
            if "Model string must be in format 'provider/model'" in error_message or "Both provider and model must be non-empty" in error_message:
                queue.put({"type": "error", "error": "Model is Required, Please ensure Model name is configured."})
            elif "API_KEY not set in database or environment" in error_message:
                queue.put({"type": "error", "error": "API Not initialized! Please Ensure API key is Configured."})
            else:
                queue.put({"type": "error", "error": f"Query processing failed: {error_message}"})
    
    executor_thread = threading.Thread(target=run_executor)
    executor_thread.start()
    time.sleep(0.5)
    
    def generate():
        while True:
            event = queue.get()
            logger.info(f"Dequeued event: {event}")
            if event["type"] == "error":
                yield f"data: {json.dumps(event)}\n\n"
                break
            if event["type"] == "execution_time":
                yield f"data: {json.dumps(event)}\n\n"
                break
            yield f"data: {json.dumps(event)}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')


# Endpoint: Create a new session
@app.route('/New_Session', methods=['POST'])
def start_session():
    """Start a new session and return the session ID."""
    try:
        session_id, _ = start_new_session()
        return jsonify({'session_id': session_id})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error starting new session: {e}")
        return jsonify({'error': 'Failed to start new session'}), 500


# Endpoint: settings
@app.route('/settings', methods=['POST'])
def set_settings():
    """Update settings in the database."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    db = get_db()
    c = db.cursor()
    fields = ['model', 'openai_api_key', 'anthropic_api_key', 'google_api_key', 'together_api_key',
              'summarization_percentage', 'smtp_email', 'smtp_password', 'smtp_host', 'smtp_port',
              'use_tls', 'user_name', 'theme', 'max_iterations', 'llm_temperature', 'llm_max_tokens', 'llm_timeout']
    # Validate inputs
    if 'summarization_percentage' in data and not (0 <= float(data['summarization_percentage']) <= 100):
        return jsonify({'error': 'summarization_percentage must be between 0 and 100'}), 400
    
    if 'theme' in data and data['theme'] not in ['light', 'dark', 'system']:
        return jsonify({'error': 'Invalid theme value. Use "light", "dark", or "system".'}), 400
    
    if 'smtp_port' in data and not (1 <= int(data['smtp_port']) <= 65535):
        return jsonify({'error': 'smtp_port must be between 1 and 65535'}), 400
    
    if 'use_tls' in data and not isinstance(data['use_tls'], bool):
        return jsonify({'error': 'use_tls must be a boolean'}), 400
    
    if 'max_iterations' in data and not (isinstance(data['max_iterations'], int) and data['max_iterations'] > 0):
        return jsonify({'error': 'max_iterations must be a positive integer'}), 400
    
    if 'llm_temperature' in data and not (0 <= float(data['llm_temperature']) <= 1):
        return jsonify({'error': 'llm_temperature must be between 0 and 1'}), 400
    
    if 'llm_max_tokens' in data and not (isinstance(data['llm_max_tokens'], int) and data['llm_max_tokens'] > 0):
        return jsonify({'error': 'llm_max_tokens must be a positive integer'}), 400
    
    if 'llm_timeout' in data and not (float(data['llm_timeout']) > 0):
        return jsonify({'error': 'llm_timeout must be a positive number'}), 400
    
    # Update provided fields
    set_clause = ', '.join([f"{field} = ?" for field in fields if field in data])
    values = [data[field] for field in fields if field in data]
    if set_clause:
        c.execute(f"UPDATE settings SET {set_clause} WHERE id = 1", values)
        db.commit()
        logger.info(f"Updated settings: {set_clause}")
    else:
        return jsonify({'error': 'No valid fields provided'}), 400
    return jsonify({'message': 'Settings updated successfully'}), 200

# Endpoint: get_settings.
@app.route('/get_settings', methods=['GET'])
def get_settings():
    """Retrieve current settings from the database."""
    db = get_db()
    c = db.cursor()
    c.execute("SELECT * FROM settings WHERE id = 1")
    row = c.fetchone()
    if row:
        settings = {key: row[key] for key in row.keys()}
        return jsonify(settings), 200
    else:
        return jsonify({'error': 'Settings not found'}), 404
    


# Endpoint: Retrieve session history
@app.route('/History/<session_number>', methods=['GET'])
def history(session_number):
    """Retrieve the history of a specific session."""
    history = get_session_history(session_number)
    if history is None:
        return jsonify({'error': f'Session {session_number} not found'}), 404
    return jsonify(history), 200

# Endpoint: List all sessions
@app.route('/Sessions', methods=['GET'])
def list_sessions():
    """List all sessions with their start times."""
    try:
        db = get_db()
        c = db.cursor()
        c.execute("SELECT session_id, start_time FROM sessions ORDER BY start_time DESC")
        sessions = [{'session_id': row['session_id'], 'start_time': row['start_time']} for row in c.fetchall()]
        return jsonify({'sessions': sessions}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve sessions: {str(e)}'}), 500


@app.route('/test', methods=['GET'])
def test():
    try:
        return jsonify({'Test': 'Test is Successful!'}), 200
    except Exception as e:
        # Optional: log the actual exception for debugging
        app.logger.error(f"Test endpoint error: {e}")
        return jsonify({"error": "Test Failed!", "message": str(e)}), 500


# Terminal API endpoints
@app.route('/api/terminal/events', methods=['GET'])
def terminal_events_stream():
    """
    Stream terminal events to the client using Server-Sent Events (SSE).
    This endpoint is used by the terminal UI to receive real-time updates.
    """
    def generate():
        # Register a new client
        client_queue = terminal_events.register_client()
        
        try:
            while True:
                # Get the next event from the queue
                event = client_queue.get()
                
                # Convert the event to JSON and send it to the client
                yield f"data: {json.dumps(event)}\n\n"
                
                # Mark the event as processed
                client_queue.task_done()
        except GeneratorExit:
            # Client disconnected, unregister the client
            terminal_events.unregister_client(client_queue)
    
    return Response(generate(), mimetype='text/event-stream')

@app.route('/api/terminal/execute', methods=['POST'])
def terminal_execute():
    """
    Execute a command in the terminal.
    This endpoint has been disabled as per requirements.
    Users should use VS Code terminal for running commands.
    The terminal UI is now read-only and only displays agent commands.
    """
    return jsonify({
        'error': 'User command execution is disabled. Please use VS Code terminal for running commands. The terminal UI is now read-only and only displays omniroot agent commands.',
        'status': 'Failed',
        'working_directory': '/'
    }), 403


@app.route('/Delete/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    db = get_db()
    try:
        with db:
            c = db.cursor()
            # Check if session exists
            c.execute("SELECT session_id FROM sessions WHERE session_id = ?", (session_id,))
            if not c.fetchone():
                return jsonify({'error': 'Session not found'}), 404
            # Delete steps
            c.execute("DELETE FROM steps WHERE workflow_id IN (SELECT workflow_id FROM workflows WHERE session_id = ?)", (session_id,))
            # Delete workflows
            c.execute("DELETE FROM workflows WHERE session_id = ?", (session_id,))
            # Delete memory
            c.execute("DELETE FROM memory WHERE session_id = ?", (session_id,))
            # Delete session
            c.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
        return jsonify({'message': 'Session deleted successfully'}), 200
    except Exception as e:
        logger.error(f"Error deleting session {session_id}: {e}")
        return jsonify({'error': 'Failed to delete session'}), 500
    

# SSE Endpoint for AppView
@app.route('/api/appview/events', methods=['GET'])
def appview_events_stream():
    def generate():
        queue = Queue()
        appview_queues.append(queue)
        try:
            while True:
                event = queue.get()
                yield f"data: {json.dumps(event)}\n\n"
        except GeneratorExit:
            appview_queues.remove(queue)
    return Response(generate(), mimetype='text/event-stream')



if __name__ == '__main__':
    update_system_settings()
    start_code_server()
    threading.Thread(target=check_running_services, daemon=True).start()
    app.run(debug=False, host='0.0.0.0', port=5001)