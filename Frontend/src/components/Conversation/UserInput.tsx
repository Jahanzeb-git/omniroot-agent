import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import clsx from 'clsx';

interface UserInputProps {
  onSubmit: (query: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
}

const UserInput: React.FC<UserInputProps> = ({
  onSubmit,
  isDisabled = false,
  placeholder = 'Task me anything...',
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160 // Max height
      )}px`;
    }
  }, [query]);
  
  const handleSubmit = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery && !isDisabled) {
      onSubmit(trimmedQuery);
      setQuery('');
      
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  return (
    <div
      className={clsx(
        'relative bg-white border-2 rounded-xl transition-all duration-200 ease-out',
        isFocused ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-gray-200 shadow-sm',
        'hover:border-gray-300 hover:shadow-md',
        isDisabled && 'opacity-60 cursor-not-allowed'
      )}
    >
      <div className="relative flex items-end gap-2 p-3">
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={1}
          className={clsx(
            'flex-1 resize-none bg-transparent text-gray-800 placeholder-gray-500',
            'focus:outline-none text-sm leading-relaxed',
            'max-h-40 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'
          )}
          disabled={isDisabled}
          style={{ minHeight: '24px' }}
        />
        
        <button
          className={clsx(
            'flex-shrink-0 p-2 rounded-lg transition-all duration-200',
            query.trim() && !isDisabled
              ? 'text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:scale-105'
              : 'text-gray-400 bg-gray-100 cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          )}
          onClick={handleSubmit}
          disabled={!query.trim() || isDisabled}
          aria-label="Send query"
        >
          <Send size={16} />
        </button>
      </div>
      
      {/* Character counter for long messages */}
      {query.length > 500 && (
        <div className="absolute -top-6 right-2">
          <span className={clsx(
            'text-xs px-2 py-1 rounded-full',
            query.length > 1000 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
          )}>
            {query.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default UserInput;