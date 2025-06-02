import os
import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileModifiedEvent, FileDeletedEvent, FileMovedEvent
from utils.memory_utils import load_session_memory, save_memory
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Global observer
observer = Observer()

# Dictionary to track which sessions are watching which files
# {file_path: set of session_ids}
watched_files = {}

# Lock for thread-safe operations
lock = threading.Lock()

class SessionFileEventHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if isinstance(event, FileModifiedEvent) and not event.is_directory:
            self._handle_event(event.src_path, "modified")

    def on_deleted(self, event):
        if isinstance(event, FileDeletedEvent) and not event.is_directory:
            self._handle_event(event.src_path, "deleted")

    def on_moved(self, event):
        if isinstance(event, FileMovedEvent) and not event.is_directory:
            self._handle_event(event.src_path, f"moved to {event.dest_path}")

    def _handle_event(self, file_path, event_type):
        file_path = os.path.abspath(file_path)  # Ensure absolute path
        with lock:
            if file_path in watched_files:
                for session_id in watched_files[file_path]:
                    try:
                        memory = load_session_memory(session_id)
                        notification = f"File {file_path} {event_type} by user at {datetime.now().isoformat()}"
                        memory.save_context(
                            {"input": "System notification"},
                            {"output": notification}
                        )
                        save_memory(session_id, memory)
                        logger.info(f"Recorded {event_type} event for {file_path} in session {session_id}")
                    except Exception as e:
                        logger.error(f"Failed to update memory for session {session_id}: {str(e)}")

def start_watching(file_path, session_id):
    """Start watching a file for a specific session."""
    file_path = os.path.abspath(file_path)  # Ensure absolute path
    with lock:
        if file_path not in watched_files:
            watched_files[file_path] = set()
            try:
                observer.schedule(SessionFileEventHandler(), os.path.dirname(file_path), recursive=False)
                logger.info(f"Started watching {file_path} for session {session_id}")
            except Exception as e:
                logger.error(f"Failed to start watching {file_path}: {str(e)}")
                return
        watched_files[file_path].add(session_id)

def stop_watching(file_path, session_id):
    """Stop watching a file for a specific session."""
    file_path = os.path.abspath(file_path)
    with lock:
        if file_path in watched_files and session_id in watched_files[file_path]:
            watched_files[file_path].remove(session_id)
            if not watched_files[file_path]:
                del watched_files[file_path]
                # Note: unschedule_all stops all watchers; we keep it simple for now
                observer.unschedule_all()
                logger.info(f"Stopped watching {file_path}")

# Start the observer
try:
    observer.start()
    logger.info("File watcher observer started")
except Exception as e:
    logger.error(f"Failed to start file watcher observer: {str(e)}")