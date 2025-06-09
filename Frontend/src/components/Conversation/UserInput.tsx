import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, FileText, File } from 'lucide-react';
import clsx from 'clsx';

interface UploadedFile {
  filename: string;
  original_name: string;
  size: number;
}

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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('http://localhost:5001/api/file_upload', {
        method: 'POST',
        body: formData,
      });

      // Add better error handling
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } 
      
      const result = await response.json();
      
      if (result.success && result.uploaded_files) {
        setUploadedFiles(prev => [...prev, ...result.uploaded_files]);
        console.log('Files uploaded successfully:', result.uploaded_files);
      } else {
        console.error('Upload failed:', result.errors);
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const removeFile = (filename: string) => {
    setUploadedFiles(prev => prev.filter(file => file.filename !== filename));
  };
  
  const generateFilePrompt = () => {
    if (uploadedFiles.length === 0) return '';
    
    const fileNames = uploadedFiles.map(file => file.filename).join(', ');
    return `I have shared you ${fileNames} in your workspace: `;
  };
  
  const handleSubmit = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery && !isDisabled) {
      const filePrompt = generateFilePrompt();
      const finalQuery = filePrompt + trimmedQuery;
      
      onSubmit(finalQuery);
      setQuery('');
      setUploadedFiles([]); // Clear uploaded files after submission
      
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
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };
  
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || ext === 'docx' || ext === 'doc') {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };
  
  return (
    <div className="space-y-2">
      {/* Uploaded Files Display */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md border border-gray-200 shadow-sm"
            >
              <div className="text-blue-600">
                {getFileIcon(file.filename)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                  {file.filename}
                </span>
                <span className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </span>
              </div>
              <button
                onClick={() => removeFile(file.filename)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Input Area */}
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
          
          {/* File Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled || isUploading}
            className={clsx(
              'flex-shrink-0 p-2 rounded-lg transition-all duration-200',
              isUploading 
                ? 'text-blue-400 bg-blue-50 cursor-wait'
                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            )}
            aria-label="Upload files"
          >
            <Paperclip className={clsx('w-4 h-4', isUploading && 'animate-pulse')} />
          </button>
          
          {/* Send Button */}
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
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.py,.js,.html,.css,.json,.xml,.yaml,.yml,.md,.csv,.sql,.sh,.bat,.pdf,.docx,.doc,.rtf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default UserInput;