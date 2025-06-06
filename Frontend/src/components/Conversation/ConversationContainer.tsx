import React, { useEffect, useState } from 'react';
import MessageItem from './MessageItem';
import UserInput from './UserInput';
import StatusIndicator from './StatusIndicator';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { useSession } from '../../contexts/SessionContext';
import { SSEHandler } from '../../services/sseHandler';
import { useTaskStore } from '../../store/taskStore';

const ConversationContainer: React.FC = () => {
  const { getCurrentSessionId, error: sessionError } = useSession();
  const { addEventToTask, setTaskStatus } = useTaskStore();
  const tasks = useTaskStore(state => state.tasks);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const messagesRef = useAutoScroll<HTMLDivElement>({
    enabled: true,
    smooth: true,
    threshold: 150,
  });

  // Handle query submission
  const handleSubmitQuery = async (query: string) => {
    const sessionId = getCurrentSessionId();

    if (!sessionId) {
      setConnectionError('No active session found. Please refresh the page.');
      return;
    }

    setConnectionError(null);
    setIsConnecting(true);

    // Create a new task
    const taskId = useTaskStore.getState().createTask(query);
    setTaskStatus(taskId, 'running');

    const sseHandler = new SSEHandler({
      onConnectionStart: () => {
        setIsConnecting(false);
        setTaskStatus(taskId, 'running');
      },
      onEvent: (event) => {
        addEventToTask(taskId, event);
        if (event.type === 'final_answer' || event.type === 'execution_time') {
          setTaskStatus(taskId, 'completed');
        }
      },
      onError: (error) => {
        console.error('SSE error:', error);
        setConnectionError(error);
        setTaskStatus(taskId, 'error');
        addEventToTask(taskId, { type: 'error', error });
        setIsConnecting(false);
      },
      onClose: () => {
        console.log('SSE connection closed');
        setIsConnecting(false);
        const currentTask = useTaskStore.getState().tasks.find(t => t.id === taskId);
        if (currentTask && currentTask.status === 'running') {
          setTaskStatus(taskId, 'completed');
        }
      },
    });

    try {
      await sseHandler.connectWithFetch(sessionId, query);
    } catch (error) {
      console.error('Failed to initiate connection:', error);
      setConnectionError('Failed to connect to server');
      setTaskStatus(taskId, 'error');
      setIsConnecting(false);
    }
  };

  // Empty state when no tasks exist
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg 
                className="w-8 h-8 text-blue-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" 
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Ready to Help</h2>
            <p className="text-gray-600 mb-6">
              I'm an AI agent that can help you with various tasks. Ask me anything!
            </p>
            {(sessionError || connectionError) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{sessionError || connectionError}</p>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 bg-white border-t border-gray-200">
          <UserInput
            onSubmit={handleSubmitQuery}
            isDisabled={isConnecting}
            placeholder={isConnecting ? "Connecting..." : "Ask me anything..."}
          />
        </div>
      </div>
    );
  }

  // Get status of the latest task
  const latestTask = tasks[tasks.length - 1];
  const getTaskStatus = () => {
    if (isConnecting) return 'connecting';
    return latestTask?.status || 'waiting';
  };

  // Build conversation items from all tasks
  const conversationItems = tasks.flatMap(task => [
    { type: 'user_query', content: { id: task.id, query: task.query, timestamp: task.createdAt } },
    ...task.events.map((event, index) => ({ type: 'task_event', content: event, index })),
  ]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with status */}
      <div className="p-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            <span className="text-sm text-gray-600 truncate">Active Session</span>
          </div>
          <div className="flex-shrink-0">
            <StatusIndicator status={getTaskStatus()} className="!p-2 !border-0 !bg-transparent" />
          </div>
        </div>
      </div>

      {/* Conversation messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto bg-gray-50">
        {conversationItems.length === 0 && !isConnecting ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Waiting for response...</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversationItems.map((item, index) => {
              if (item.type === 'user_query') {
                return (
                  <div key={`user-${item.content.id}`} className="p-4">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-700 mb-2">Your Query</p>
                          <p className="text-gray-800 text-sm leading-relaxed">{item.content.query}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <MessageItem
                    key={`event-${index}`}
                    event={item.content}
                    isLatest={index === conversationItems.length - 1}
                  />
                );
              }
            })}
          </div>
        )}
        {connectionError && (
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-red-600 mb-2">Connection Error</p>
                  <p className="text-gray-800 text-sm leading-relaxed">{connectionError}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <UserInput
          onSubmit={handleSubmitQuery}
          isDisabled={isConnecting}
          placeholder={isConnecting ? "Connecting..." : "Task me anything..."}
        />
      </div>
    </div>
  );
};

export default ConversationContainer;