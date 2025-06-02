import sqlite3
import time
import psutil
from queue import Queue
import logging
import json

logger = logging.getLogger(__name__)

appview_queues = []

def get_pid_by_port(port):
    """Get the PID of a process listening on a given port."""
    for conn in psutil.net_connections(kind='inet'):
        if conn.laddr.port == port and conn.status == psutil.CONN_LISTEN:
            return conn.pid
    return None

def add_or_update_server(port, pid):
    """Add or update a server in the running_servers table."""
    conn = sqlite3.connect("agent_memory.db")
    c = conn.cursor()
    timestamp = time.time()
    c.execute("INSERT OR REPLACE INTO running_servers (port, pid, timestamp) VALUES (?, ?, ?)", (port, pid, timestamp))
    conn.commit()
    conn.close()

def set_current_frontend(port, pid):
    """Set the current frontend in the current_frontend table."""
    conn = sqlite3.connect("agent_memory.db")
    c = conn.cursor()
    timestamp = time.time()
    c.execute("INSERT OR REPLACE INTO current_frontend (id, port, pid, timestamp) VALUES (1, ?, ?, ?)", (port, pid, timestamp))
    conn.commit()
    conn.close()

def notify_appview_update():
    """Notify all clients of the current AppView state."""
    conn = sqlite3.connect("agent_memory.db")
    c = conn.cursor()
    c.execute("SELECT port, pid, timestamp FROM running_servers")
    servers = [{'port': row[0], 'pid': row[1], 'timestamp': row[2]} for row in c.fetchall()]
    c.execute("SELECT port, pid, timestamp FROM current_frontend WHERE id = 1")
    frontend_row = c.fetchone()
    frontend = {'port': frontend_row[0], 'pid': frontend_row[1], 'timestamp': frontend_row[2]} if frontend_row and frontend_row[0] is not None else None
    conn.close()
    
    state = {'servers': servers, 'current_frontend': frontend}
    for queue in appview_queues:
        try:
            queue.put(state)
        except Exception as e:
            logger.error(f"Error notifying queue: {e}")

def check_running_services():
    """Periodically check and update the status of running services."""
    while True:
        time.sleep(5)
        conn = sqlite3.connect("agent_memory.db")
        c = conn.cursor()
        c.execute("SELECT port, pid FROM running_servers")
        servers = c.fetchall()
        to_remove_servers = []
        for port, pid in servers:
            try:
                psutil.Process(pid)
            except psutil.NoSuchProcess:
                to_remove_servers.append(port)
        
        for port in to_remove_servers:
            c.execute("DELETE FROM running_servers WHERE port = ?", (port,))
        
        c.execute("SELECT pid FROM current_frontend WHERE id = 1 AND pid IS NOT NULL")
        frontend_pid = c.fetchone()
        if frontend_pid:
            pid = frontend_pid[0]
            try:
                psutil.Process(pid)
            except psutil.NoSuchProcess:
                c.execute("UPDATE current_frontend SET port = NULL, pid = NULL, timestamp = NULL WHERE id = 1")
        
        conn.commit()
        conn.close()
        
        if to_remove_servers or (frontend_pid and pid and not psutil.pid_exists(pid)):
            notify_appview_update()