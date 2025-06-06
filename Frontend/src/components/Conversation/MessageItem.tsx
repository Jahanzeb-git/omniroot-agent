import React, { useState } from 'react';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import { TaskEvent } from '../../types';
import { formatExecutionTime } from '../../utils/formatters';

interface MessageItemProps {
  event: TaskEvent;
  isLatest?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ event, isLatest = false }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  // Get status indicator color based on event type
  const getStatusColor = (type: string) => {
    switch (type) {
      case 'step':
        return 'bg-blue-500';
      case 'final_answer':
        return 'bg-green-500';
      case 'execution_time':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  // Copy command to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Copy Icon Component
  const CopyIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );

  // Check Icon Component
  const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const MarkdownContent = ({ content }: { content: string }) => (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="text-gray-800 text-sm leading-relaxed">{children}</p>,
        code: ({ children }) => <code className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono">{children}</code>,
        pre: ({ children }) => (
          <pre className="bg-gray-100 rounded p-3 my-2 overflow-x-auto">
            {children}
          </pre>
        ),
        h1: ({ children }) => <h1 className="text-xl font-bold my-3">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-bold my-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-md font-bold my-2">{children}</h3>,
        ul: ({ children }) => <ul className="list-disc ml-4 my-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal ml-4 my-2">{children}</ol>,
        li: ({ children }) => <li className="my-1">{children}</li>,
        a: ({ href, children }) => (
          <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-gray-200 pl-4 my-2 italic">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );

  // Helper function to check if action is ShellTool
  const isShellTool = (action: string): boolean => {
    return action.toLowerCase() === 'shelltool';
  };

  // Helper function to parse and format action input for ShellTool
  const formatShellCommand = (actionInput: string | object): string => {
    try {
      // If actionInput is already an object
      if (typeof actionInput === 'object' && actionInput !== null) {
        const inputObj = actionInput as any;
        return inputObj.command ? String(inputObj.command) : String(actionInput);
      }
      
      // If actionInput is a string, try to parse it as JSON
      if (typeof actionInput === 'string') {
        try {
          const parsed = JSON.parse(actionInput);
          if (typeof parsed === 'object' && parsed !== null && parsed.command) {
            return String(parsed.command);
          }
        } catch {
          // If JSON parsing fails, return the string as-is
          return actionInput;
        }
      }
      
      return String(actionInput);
    } catch {
      return String(actionInput);
    }
  };

  // Render different content based on event type
  const renderContent = () => {
    switch (event.type) {
      case 'step':
        const isShell = isShellTool(event.action);
        const shellCommand = isShell ? formatShellCommand(event.action_input) : '';
        
        return (
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-start gap-3">
                <div className={clsx(
                  'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                  getStatusColor(event.type)
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 mb-2">Thinking</p>
                  <MarkdownContent content={event.thought} />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 ml-5">
              {event.action && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit">
                  Action: {event.action}
                </span>
              )}
              
              {/* Modern Shell Command UI */}
              {isShell && event.action_input && (
                <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                  {/* Header with language label and copy button */}
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-300 bg-gray-700 px-2 py-1 rounded">
                        bash
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(shellCommand)}
                      className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors duration-150"
                      title="Copy command"
                    >
                      {copySuccess ? (
                        <>
                          <CheckIcon className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <CopyIcon className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Command content */}
                  <div className="p-4">
                    <pre className="text-sm text-green-400 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
                      <code>{shellCommand}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'final_answer':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-start gap-3">
                <div className={clsx(
                  'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                  getStatusColor(event.type)
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 mb-2">Final Thought</p>
                  <MarkdownContent content={event.thought} />
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-700 mb-2">Answer</p>
                  <MarkdownContent content={event.answer} />
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'execution_time':
        return (
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={clsx(
                  'w-2 h-2 rounded-full',
                  getStatusColor(event.type)
                )} />
                <span className="text-sm font-medium text-gray-600">Execution completed</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {formatExecutionTime(event.time)}
              </span>
            </div>
          </div>
        );
        
      case 'error':
        return (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className={clsx(
                'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                getStatusColor(event.type)
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-700 mb-2">Error</p>
                <MarkdownContent content={event.error} />
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div 
      className={clsx(
        'p-4 transition-all duration-500 ease-out',
        isLatest && 'animate-[slideInFromBottom_0.4s_ease-out]',
        'border-b border-gray-100 last:border-b-0'
      )}
    >
      {renderContent()}
    </div>
  );
};

export default MessageItem;