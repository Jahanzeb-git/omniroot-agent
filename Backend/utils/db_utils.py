import sqlite3
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def init_db():
    """Initialize SQLite database with required tables."""
    conn = sqlite3.connect("/data/agent_memory.db")
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS sessions
                 (session_id TEXT PRIMARY KEY, start_time TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS workflows
                 (workflow_id TEXT PRIMARY KEY, session_id TEXT, start_time TEXT, query TEXT, status TEXT,
                  FOREIGN KEY(session_id) REFERENCES sessions(session_id))''')
    c.execute('''CREATE TABLE IF NOT EXISTS steps
                 (step_id TEXT PRIMARY KEY, workflow_id TEXT, thought TEXT, action TEXT,
                  action_input TEXT, observation TEXT, timestamp TEXT,
                  FOREIGN KEY(workflow_id) REFERENCES workflows(workflow_id))''')
    c.execute('''CREATE TABLE IF NOT EXISTS memory
                 (session_id TEXT PRIMARY KEY, summary TEXT, last_updated TEXT,
                  FOREIGN KEY(session_id) REFERENCES sessions(session_id))''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS settings
                (id INTEGER PRIMARY KEY,
                model TEXT,
                openai_api_key TEXT,
                anthropic_api_key TEXT,
                google_api_key TEXT,
                together_api_key TEXT,
                summarization_percentage REAL DEFAULT 50.0,
                smtp_email TEXT,
                smtp_password TEXT,
                smtp_host TEXT,
                smtp_port INTEGER DEFAULT 587,
                timeout REAL DEFAULT 30.0,
                use_tls INTEGER DEFAULT 1,
                user_name TEXT,
                theme TEXT DEFAULT 'system',
                max_iterations INTEGER DEFAULT 10,
                llm_temperature REAL DEFAULT 0.1,
                llm_max_tokens INTEGER DEFAULT 1500,
                llm_timeout REAL DEFAULT 120,
                os TEXT,
                kernel_version TEXT)''')
    # New tables for AppView
    c.execute('''CREATE TABLE IF NOT EXISTS running_servers
                 (port INTEGER PRIMARY KEY,
                  pid INTEGER,
                  timestamp REAL)''')
    c.execute('''CREATE TABLE IF NOT EXISTS current_frontend
                 (id INTEGER PRIMARY KEY,
                  port INTEGER,
                  pid INTEGER,
                  timestamp REAL)''')
    c.execute("INSERT OR IGNORE INTO settings (id) VALUES (1)")
    conn.commit()
    conn.close()
    logger.info("Initialized SQLite database with sessions, workflows, steps, memory, and settings tables")