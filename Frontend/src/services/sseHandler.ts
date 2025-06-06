import { TaskEvent } from '../types';

interface SSEHandlerOptions {
  onEvent: (event: TaskEvent) => void;
  onError: (error: string) => void;
  onClose?: () => void;
  onConnectionStart?: () => void;
}

export class SSEHandler {
  private abortController: AbortController | null = null;
  private options: SSEHandlerOptions;
  private isConnected: boolean = false;

  constructor(options: SSEHandlerOptions) {
    this.options = options;
  }

  public async connectWithFetch(sessionId: string, query: string): Promise<void> {
    // Close any existing connection
    this.close();

    this.abortController = new AbortController();
    const { signal } = this.abortController;

    try {
      // Notify connection start
      if (this.options.onConnectionStart) {
        this.options.onConnectionStart();
      }

      const response = await fetch('http://localhost:5001/Query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          session_id: sessionId,
          query: query,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is not readable');
      }

      this.isConnected = true;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const processStream = async (): Promise<void> => {
        try {
          while (this.isConnected) {
            const { done, value } = await reader.read();
            
            if (done) {
              if (this.options.onClose) {
                this.options.onClose();
              }
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            
            // Process each complete line
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
            
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('data:')) {
                try {
                  const jsonData = trimmedLine.substring(5).trim();
                  if (jsonData && jsonData !== '[DONE]') {
                    const data: TaskEvent = JSON.parse(jsonData);
                    this.options.onEvent(data);
                  }
                } catch (parseError) {
                  console.error('Error parsing SSE data:', parseError);
                }
              }
            }
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Error reading stream:', error);
            this.options.onError('Error reading response stream');
          }
        } finally {
          this.isConnected = false;
        }
      };

      await processStream();
      
    } catch (error) {
      this.isConnected = false;
      
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }

      console.error('Fetch error:', error);
      
      if (error.message.includes('Failed to fetch')) {
        this.options.onError('Unable to connect to server. Please check if the backend is running on localhost:5001');
      } else if (error.message.includes('HTTP error! status:')) {
        this.options.onError(`Server error: ${error.message}`);
      } else {
        this.options.onError(`Connection error: ${error.message}`);
      }
    }
  }

  public close(): void {
    this.isConnected = false;
    
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    
    if (this.options.onClose) {
      this.options.onClose();
    }
  }

  public isActiveConnection(): boolean {
    return this.isConnected;
  }
}