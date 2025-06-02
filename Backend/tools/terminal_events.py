import threading
import queue
import time
import json
from typing import Dict, Any, List, Optional

class TerminalEventManager:
    """
    Manages terminal events for real-time display in the UI.
    Uses a singleton pattern to ensure all parts of the application
    can access the same event queue.
    """
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(TerminalEventManager, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        self._event_queue = queue.Queue()
        self._clients: List[queue.Queue] = []
        self._clients_lock = threading.Lock()
        self._initialized = True
        
        # Start the event dispatcher thread
        self._dispatcher_thread = threading.Thread(target=self._dispatch_events, daemon=True)
        self._dispatcher_thread.start()
    
    def register_client(self) -> queue.Queue:
        """
        Register a new client to receive terminal events.
        Returns a queue that the client can use to receive events.
        """
        client_queue = queue.Queue()
        with self._clients_lock:
            self._clients.append(client_queue)
        return client_queue
    
    def unregister_client(self, client_queue: queue.Queue) -> None:
        """
        Unregister a client from receiving terminal events.
        """
        with self._clients_lock:
            if client_queue in self._clients:
                self._clients.remove(client_queue)
    
    def emit_command(self, command: str, source: str = "agent", working_directory: Optional[str] = None) -> None:
        """
        Emit a command event to all registered clients.
        Always use 'agent' as the source to ensure all commands appear from the agent.
        """
        event = {
            "type": "command",
            "command": command,
            "source": "agent",  # Always use 'agent' regardless of the input
            "timestamp": time.time(),
            "working_directory": working_directory
        }
        self._event_queue.put(event)
    
    def emit_output(self, output: str, command_id: Optional[str] = None, working_directory: Optional[str] = None, source: str = "agent") -> None:
        """
        Emit an output event to all registered clients.
        Always use 'agent' as the source to ensure all output appears from the agent.
        """
        event = {
            "type": "output",
            "content": output,
            "command_id": command_id,
            "timestamp": time.time(),
            "working_directory": working_directory,
            "source": "agent"  # Always use 'agent' regardless of the input
        }
        self._event_queue.put(event)
    
    def _dispatch_events(self) -> None:
        """
        Dispatch events to all registered clients.
        Runs in a separate thread.
        """
        while True:
            event = self._event_queue.get()
            with self._clients_lock:
                # Make a copy of the clients list to avoid issues if it changes during iteration
                clients = self._clients.copy()
            
            # Dispatch the event to all registered clients
            for client_queue in clients:
                try:
                    client_queue.put(event)
                except:
                    # If there's an error, we'll remove this client on the next iteration
                    pass
            
            self._event_queue.task_done()

# Global instance
terminal_events = TerminalEventManager()