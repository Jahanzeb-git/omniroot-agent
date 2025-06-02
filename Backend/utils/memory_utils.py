# memory_utils.py
import sqlite3
import logging
from langchain.memory import ConversationSummaryMemory
from utils.llm_utils import initialize_llm
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def load_session_memory(session_id: str) -> ConversationSummaryMemory:
    """Load memory summary for a given session from the database."""
    model_string = "together/Qwen/Qwen2.5-Coder-32B-Instruct"
    memory = ConversationSummaryMemory(llm=initialize_llm(model_string))
    logger.info(f"Memory from conversationSummeryMemory as : {memory}")
    conn = sqlite3.connect("agent_memory.db")
    c = conn.cursor()
    c.execute("SELECT summary FROM memory WHERE session_id = ?", (session_id,))
    result = c.fetchone()
    conn.close()
    if result and result[0]:
        memory.buffer = result[0]
        logger.info(f"Loaded memory for session: {session_id}: {result[0]}")
    else:
        logger.info(f"No memory found in Session : {session_id}")
    logger.info(f"Loaded memory for session : {session_id}")
    return memory

def save_memory(session_id: str, memory: ConversationSummaryMemory) -> None:
    """Save memory summary to the database."""
    conn = sqlite3.connect("agent_memory.db")
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO memory (session_id, summary, last_updated) VALUES (?, ?, ?)",
              (session_id, memory.buffer, datetime.now().isoformat()))
    conn.commit()
    conn.close()
    logger.info(f"Saved memory for session: {session_id}")