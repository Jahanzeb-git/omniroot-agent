import React, { useState, useEffect } from 'react';
import { X, Calendar, MessageSquare, Loader2, AlertCircle, Clock, Trash2 } from 'lucide-react';
import clsx from 'clsx';

interface SessionData {
  session_id: string;
  start_time: string;
  workflows: Array<{
    query: string;
    start_time: string;
    workflow_id: string;
    steps: Array<{
      action: string;
      action_input: string;
      observation: string;
      thought: string;
    }>;
  }>;
}

interface SessionCardData {
  id: string;
  firstQuery: string;
  createdAt: string;
  workflowCount: number;
  isActive: boolean;
  error?: string;
  loading: boolean;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionSelect: (sessionId: string, sessionData: SessionData) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, onSessionSelect }) => {
  const [sessions, setSessions] = useState<SessionCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Truncate query to maximum 15 words
  const truncateQuery = (query: string, maxWords: number = 15): string => {
    if (!query) return query;
    
    const words = query.trim().split(/\s+/);
    if (words.length <= maxWords) {
      return query;
    }
    
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Get sessions from localStorage
  const getSessionsFromStorage = (): string[] => {
    try {
      const stored = localStorage.getItem('agentic_ai_sessions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading sessions from localStorage:', error);
      return [];
    }
  };

  // Fetch session data from API
  const fetchSessionData = async (sessionId: string): Promise<Partial<SessionCardData>> => {
    try {
      const response = await fetch(`http://localhost:5001/History/${sessionId}`);
      if (response.status === 404) {
        return {
          firstQuery: 'Session not found',
          createdAt: 'Unknown',
          workflowCount: 0,
          error: 'Session no longer available'
        };
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch session data: ${response.status}`);
      }
      
      const data: SessionData = await response.json();
      
      if (data.workflows.length === 0) {
        return {
          firstQuery: 'No Conversations found yet!',
          createdAt: data.start_time || 'Unknown',
          workflowCount: 0
        };
      }

      const firstWorkflow = data.workflows[0];
      const originalQuery = firstWorkflow.query || 'Untitled conversation';
      
      return {
        firstQuery: truncateQuery(originalQuery),
        createdAt: firstWorkflow.start_time,
        workflowCount: data.workflows.length,
      };
    } catch (error) {
      console.error(`Error fetching session ${sessionId}:`, error);
      return {
        firstQuery: 'Failed to load',
        createdAt: 'Unknown',
        workflowCount: 0,
        error: 'Failed to fetch session data'
      };
    }
  };

  // Load all sessions when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const loadSessions = async () => {
      setIsLoading(true);
      const sessionIds = getSessionsFromStorage();
      const activeSessionId = sessionIds[0] || null;

      // Initialize sessions with loading state
      const initialSessions: SessionCardData[] = sessionIds.map(id => ({
        id,
        firstQuery: '',
        createdAt: '',
        workflowCount: 0,
        isActive: id === activeSessionId,
        loading: true
      }));

      setSessions(initialSessions);

      // Fetch data for each session
      const sessionPromises = sessionIds.map(async (sessionId) => {
        const sessionData = await fetchSessionData(sessionId);
        return {
          id: sessionId,
          isActive: sessionId === activeSessionId,
          loading: false,
          ...sessionData
        };
      });

      try {
        const loadedSessions = await Promise.all(sessionPromises);
        setSessions(loadedSessions);
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [isOpen]);

  // Handle session selection
  const handleSessionSelect = async (sessionId: string) => {
    if (sessions.find(s => s.id === sessionId)?.isActive) return;

    try {
      // Fetch full session data
      const response = await fetch(`http://localhost:5001/History/${sessionId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch session data: ${response.status}`);
      }
      
      const sessionData: SessionData = await response.json();

      // Move selected session to top of localStorage
      const currentSessions = getSessionsFromStorage();
      const filteredSessions = currentSessions.filter(id => id !== sessionId);
      const updatedSessions = [sessionId, ...filteredSessions];
      localStorage.setItem('agentic_ai_sessions', JSON.stringify(updatedSessions));

      // Call the callback with session data
      onSessionSelect(sessionId, sessionData);
      onClose();
    } catch (error) {
      console.error('Error selecting session:', error);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:5001/Delete/${sessionToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete session');
      }
      // Update localStorage
      const currentSessions = getSessionsFromStorage();
      const updatedSessions = currentSessions.filter(id => id !== sessionToDelete);
      localStorage.setItem('agentic_ai_sessions', JSON.stringify(updatedSessions));
      // Update state
      setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionToDelete));
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting session:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Session History</h2>
              <p className="text-sm text-gray-600">Resume your previous conversations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && sessions.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-gray-600">Loading sessions...</p>
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-lg">No sessions found</p>
                <p className="text-sm text-gray-500">Start a new conversation to create your first session</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={clsx(
                    'border rounded-xl p-5 transition-all duration-200 cursor-pointer',
                    {
                      'border-blue-200 bg-blue-50 shadow-sm': session.isActive,
                      'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md': !session.isActive && !session.error && session.firstQuery !== 'No Conversations found yet!',
                      'border-gray-300 bg-gray-100': session.firstQuery === 'No Conversations found yet!',
                      'border-red-200 bg-red-50': session.error,
                      'cursor-not-allowed opacity-75': session.isActive,
                      'cursor-default': session.error
                    }
                  )}
                  onClick={() => !session.isActive && !session.error && handleSessionSelect(session.id)}
                >
                  {session.loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {session.isActive && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Active
                            </span>
                          )}
                          {session.error && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertCircle className="w-3 h-3" />
                              Error
                            </span>
                          )}
                        </div>
                        
                        <h3 className={clsx(
                          'font-medium mb-2 truncate',
                          {
                            'text-blue-900': session.isActive,
                            'text-gray-900': !session.isActive && !session.error && session.firstQuery !== 'No Conversations found yet!',
                            'text-gray-600': session.firstQuery === 'No Conversations found yet!',
                            'text-red-900': session.error
                          }
                        )}>
                          {session.firstQuery}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(session.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{session.workflowCount} workflow{session.workflowCount !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        
                        {session.error && (
                          <p className="text-sm text-red-600 mt-2">{session.error}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                          {session.id.split('-')[0]}...
                        </div>
                        {!session.isActive && !session.error && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSessionToDelete(session.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Click on any session to resume your conversation
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this session? All information in this session will be lost!
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className={clsx(
                  'px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600',
                  isDeleting && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryModal;