import logging
import sqlite3
from langchain_core.prompts import PromptTemplate

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Custom summarization prompt
# Fetch summarization percentage from settings
try:
    conn = sqlite3.connect("agent_memory.db")
    c = conn.cursor()
    c.execute("SELECT summarization_percentage FROM settings WHERE id = 1")
    row = c.fetchone()
    summarization_percentage = row[0] if row and row[0] is not None else 50.0
finally:
    conn.close()
SUMMARY_PROMPT = PromptTemplate.from_template(
    """Current summary:
{summary}

New lines of conversation:
{new_lines}

Summarize the conversation to approximately {summarization_percentage}% of its original length, prioritizing context retention and token efficiency. Strictly include:
- Main user tasks (e.g., create, modify, test).
- Specific file names created, modified, or referenced (e.g., 'sort_function.py').
- Tools used (e.g., WriteFile, ShellTool, EmailTool, ReadFile) and their actions (e.g., 'wrote to sort_function.py', 'ran python3 sort_function.py').
- Key operations (e.g., 'changed > to < in bubble sort', 'output: [90, 64, 34]').
- Any PIDs Noted.(Must include PID context.)

Goal: Maximize context retention and minimize token usage based on the summarization percentage.

Higher {summarization_percentage} retains more details; lower values prioritize brevity. Aim for concise, precise language.

Updated summary:"""
)
FORMATTED_PROMPT = SUMMARY_PROMPT.partial(summarization_percentage=str(summarization_percentage))
logger.info("Created PromptTemplate for ConversationSummaryMemory")