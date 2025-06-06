import React from 'react';
import clsx from 'clsx';

type StatusType = 'running' | 'waiting' | 'completed' | 'error' | 'connecting';

interface StatusIndicatorProps {
  status: StatusType;
  className?: string;
  compact?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, className, compact = false }) => {
  // Determine the color and animation based on status
  const getStatusStyles = (status: StatusType) => {
    switch (status) {
      case 'running':
        return {
          color: 'bg-blue-500',
          animation: 'animate-pulse',
          text: 'Processing...',
          textColor: 'text-blue-700'
        };
      case 'connecting':
        return {
          color: 'bg-yellow-500',
          animation: 'animate-pulse',
          text: 'Connecting...',
          textColor: 'text-yellow-700'
        };
      case 'waiting':
        return {
          color: 'bg-orange-500',
          animation: 'animate-pulse',
          text: 'Waiting for input',
          textColor: 'text-orange-700'
        };
      case 'error':
        return {
          color: 'bg-red-500',
          animation: '',
          text: 'Error occurred',
          textColor: 'text-red-700'
        };
      case 'completed':
      default:
        return {
          color: 'bg-green-500',
          animation: '',
          text: 'Completed',
          textColor: 'text-green-700'
        };
    }
  };
  
  const styles = getStatusStyles(status);
  
  if (compact) {
    return (
      <div className={clsx('flex items-center gap-2', className)}>
        <span
          className={clsx(
            'h-2 w-2 rounded-full',
            styles.color,
            styles.animation
          )}
          aria-hidden="true"
        />
        <span className={clsx('text-xs font-medium', styles.textColor)}>
          {styles.text}
        </span>
        
        {(status === 'running' || status === 'connecting') && (
          <div className="flex gap-0.5 ml-1">
            <div className="w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={clsx('flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200', className)}>
      <div className="flex items-center gap-2">
        <span
          className={clsx(
            'h-2.5 w-2.5 rounded-full',
            styles.color,
            styles.animation
          )}
          aria-hidden="true"
        />
        <span className={clsx('text-sm font-medium', styles.textColor)}>
          {styles.text}
        </span>
      </div>
      
      {(status === 'running' || status === 'connecting') && (
        <div className="flex gap-1 ml-2">
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;