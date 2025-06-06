import axios from 'axios';
import { Session } from '../types';

const API_BASE_URL = 'http://localhost:5001';

export const createSession = async (): Promise<Session> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/New_Session`, {}, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return {
      id: response.data.session_id,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }
};

export const submitQuery = async (sessionId: string, query: string): Promise<Response> => {
  return fetch(`${API_BASE_URL}/Query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: sessionId,
      query: query,
    }),
  });
};