import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '../types';
import { createSession } from '../services/api';

interface SessionContextType {
  getCurrentSessionId: () => string | null;
  resetSession: () => Promise<void>;
  error: string | null;
}

const SessionContext = createContext<SessionContextType | null>(null);

const SESSIONS_KEY = 'agentic_ai_sessions';

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      await createNewSession();
    } catch (err) {
      setError('Unable to initialize the session. Please ensure that the model and API key are correctly configured in the settings!');
      console.error('Session initialization error:', err);
    }
  };

  const createNewSession = async () => {
    try {
      const session = await createSession();
      
      // Get existing sessions or initialize empty array
      const existingSessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
      
      // Add new session to the front (LIFO)
      existingSessions.unshift(session.id);
      
      // Store back in localStorage
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(existingSessions));
      
      setError(null);
    } catch (err) {
      setError('Failed to create new session');
      throw err;
    }
  };

  const getCurrentSessionId = (): string | null => {
    try {
      const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
      return sessions[0] || null; // Return most recent session (LIFO)
    } catch (err) {
      console.error('Error getting current session:', err);
      return null;
    }
  };

  const resetSession = async () => {
    try {
      await createNewSession();
    } catch (err) {
      setError('Failed to reset session');
      console.error('Reset session error:', err);
    }
  };

  return (
    <SessionContext.Provider value={{ getCurrentSessionId, resetSession, error }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};