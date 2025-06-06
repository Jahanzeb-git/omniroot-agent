import React, { useState, useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
import '@xterm/xterm/css/xterm.css';

interface TerminalUIProps {
  // Additional props as needed
}

interface CommandData {
  command: string;
  output: string;
  type: 'user' | 'agent';
  timestamp: number;
  workingDirectory?: string;
}

const TerminalUI: React.FC<TerminalUIProps> = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [terminal, setTerminal] = useState<XTerm | null>(null);
  const [fitAddon, setFitAddon] = useState<FitAddon | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [terminalContent, setTerminalContent] = useState<CommandData[]>([]);

  // Load terminal content from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem('terminal-content');
    const savedHistory = localStorage.getItem('terminal-history');
    
    if (savedContent) {
      try {
        setTerminalContent(JSON.parse(savedContent));
      } catch (error) {
        console.error('Error loading terminal content:', error);
      }
    }
    
    if (savedHistory) {
      try {
        setCommandHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading command history:', error);
      }
    }
  }, []);

  // Save terminal content to localStorage
  const saveTerminalState = (content: CommandData[], history: string[]) => {
    localStorage.setItem('terminal-content', JSON.stringify(content));
    localStorage.setItem('terminal-history', JSON.stringify(history));
  };

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current) return;

    // Create terminal instance with light theme
    const term = new XTerm({
      cursorBlink: true,
      fontFamily: "'Ubuntu Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
      fontSize: 14,
      lineHeight: 1.5,
      scrollback: 5000,
      allowTransparency: true,
      theme: {
        background: '#FFFFFF',
        foreground: '#333333',
        cursor: '#333333',
        cursorAccent: '#FFFFFF',
        selectionBackground: '#D3D3D3',
        black: '#000000',
        red: '#CC0000',
        green: '#4E9A06',
        yellow: '#C4A000',
        blue: '#3465A4',
        magenta: '#75507B',
        cyan: '#06989A',
        white: '#D3D3D3',
        brightBlack: '#555753',
        brightRed: '#EF2929',
        brightGreen: '#8AE234',
        brightYellow: '#FCE94F',
        brightBlue: '#729FCF',
        brightMagenta: '#AD7FA8',
        brightCyan: '#34E2E2',
        brightWhite: '#EEEEEC'
      }
    });

    // Create and load addons
    const fit = new FitAddon();
    const webLinks = new WebLinksAddon();
    const search = new SearchAddon();
    
    term.loadAddon(fit);
    term.loadAddon(webLinks);
    term.loadAddon(search);

    // Open terminal
    term.open(terminalRef.current);
    fit.fit();

    // Display welcome banner
    displayWelcomeBanner(term);

    // Restore previous terminal content
    if (terminalContent.length > 0) {
      restoreTerminalContent(term);
    }

    // Display initial prompt for agent
    term.write('\x1b[33m[omniroot agent]\x1b[0m \x1b[38;2;0;128;0m$ \x1b[0m');

    // Search functionality is added via event listener in cleanup section
    
    // We're removing user input handling as per requirements
    // The terminal will only display agent commands and their output

    // Save terminal instance
    setTerminal(term);
    setFitAddon(fit);

    // Connect to terminal events stream
    connectToTerminalEvents(term);

    // Handle window resize
    const handleResize = () => {
      if (fit) fit.fit();
    };
    window.addEventListener('resize', handleResize);

    // Store search function reference for cleanup
    const searchHandler = (e: KeyboardEvent) => {
      // Ctrl+F or Cmd+F for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        search.findNext(prompt('Search for:') || '');
      }
      
      // F3 for find next
      if (e.key === 'F3') {
        e.preventDefault();
        search.findNext();
      }
      
      // Shift+F3 for find previous
      if (e.shiftKey && e.key === 'F3') {
        e.preventDefault();
        search.findPrevious();
      }
    };
    
    // Add the event listener
    document.addEventListener('keydown', searchHandler);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', searchHandler);
      if (eventSource) {
        eventSource.close();
      }
      term.dispose();
    };
  }, []);

  // Display welcome banner
  const displayWelcomeBanner = (term: XTerm) => {
    term.writeln('\x1b[38;2;0;102;204m┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\x1b[0m');
    term.writeln('\x1b[38;2;0;102;204m┃                                                                                  ┃\x1b[0m');
    term.writeln('\x1b[38;2;0;102;204m┃   \x1b[38;2;204;0;0m Welcome to the omniroot agent Terminal                                      \x1b[38;2;0;102;204m┃\x1b[0m');
    term.writeln('\x1b[38;2;0;102;204m┃   \x1b[38;2;51;51;51mWatch the omniroot agent execute commands                                     \x1b[38;2;0;102;204m┃\x1b[0m');
    term.writeln('\x1b[38;2;0;102;204m┃   \x1b[38;2;0;128;0mCommands and outputs are persistent across sessions                            \x1b[38;2;0;102;204m┃\x1b[0m');
    term.writeln('\x1b[38;2;0;102;204m┃                                                                                  ┃\x1b[0m');
    term.writeln('\x1b[38;2;0;102;204m┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\x1b[0m');
    term.writeln('');
  };

  // Restore terminal content from saved state
  const restoreTerminalContent = (term: XTerm) => {
    if (terminalContent.length === 0) return;
    
    term.writeln('\x1b[38;2;0;102;204m┌─ Previous Session History ─────────────────────────────────────────────────────────┐\x1b[0m');
    
    terminalContent.forEach((entry, index) => {
      // Show working directory if available
      if (entry.workingDirectory) {
        term.writeln(`\x1b[38;2;0;102;204m┌─[\x1b[38;2;0;128;0m${entry.workingDirectory}\x1b[38;2;0;102;204m]─┐\x1b[0m`);
      }
      
      // Show command with appropriate prefix
      const prefix = '\x1b[33m[omniroot agent]\x1b[0m';
      term.writeln(`${prefix} \x1b[38;2;0;128;0m$ \x1b[0m${entry.command}`);
      
      // Show command output with formatting
      if (entry.output) {
        const formattedOutput = formatCommandOutput(entry.command, entry.output);
        term.write(formattedOutput);
        if (!formattedOutput.endsWith('\n')) {
          term.writeln('');
        }
      }
      
      // Add separator between commands for better readability
      if (index < terminalContent.length - 1) {
        term.writeln('\x1b[38;2;153;153;153m─────────────────────────────────────────────────────────────────────────────────\x1b[0m');
      }
    });
    
    term.writeln('\x1b[38;2;0;102;204m└───────────────────────────────────────────────────────────────────────────────────┘\x1b[0m');
    term.writeln('');
  };

  // Format command output for better readability
  const formatCommandOutput = (command: string, output: string): string => {
    // If output is empty, return empty string
    if (!output || output.trim() === '') {
      return '';
    }
    
    const cmd = command.trim().toLowerCase();
    
    // Format version commands
    if (cmd.includes('--version') || cmd.includes('-v') && !cmd.includes('grep')) {
      return output
        .split('\n')
        .map((line, index) => {
          if (index === 0) {
            return `\x1b[38;2;0;128;0m${line}\x1b[0m`;
          } else if (line.includes('Copyright') || line.includes('license')) {
            return `\x1b[38;2;0;102;204m${line}\x1b[0m`;
          }
          return `\x1b[38;2;51;51;51m${line}\x1b[0m`;
        })
        .join('\n');
    } 
    // Format ls command output
    else if (cmd.startsWith('ls') || cmd === 'll' || cmd === 'la' || cmd.startsWith('ls ')) {
      // Check if it's likely a long format listing (ls -l)
      if (output.includes('total ') || output.includes('drwx') || output.includes('-rw-')) {
        return output
          .split('\n')
          .map(line => {
            if (line.startsWith('total ')) {
              return `\x1b[38;2;51;51;51m${line}\x1b[0m`;
            }
            
            // Handle directory entries (start with d)
            if (line.startsWith('d')) {
              return line.replace(/([^ ]*)(\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+)([^ ].*)/, 
                '\x1b[38;2;0;102;204m$1\x1b[38;2;51;51;51m$2\x1b[1;38;2;0;102;204m$3\x1b[0m');
            }
            
            // Handle executable files (contain 'x' in permissions)
            if (line.includes('x')) {
              return line.replace(/([^ ]*)(\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+)([^ ].*)/, 
                '\x1b[38;2;0;128;0m$1\x1b[38;2;51;51;51m$2\x1b[38;2;0;128;0m$3\x1b[0m');
            }
            
            // Handle different file types
            if (line.includes('.py')) {
              return line.replace(/([^ ]*)(\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+)([^ ].*)/, 
                '\x1b[38;2;249;226;175m$1\x1b[38;2;186;194;222m$2\x1b[38;2;249;226;175m$3\x1b[0m');
            } else if (line.includes('.js') || line.includes('.ts') || line.includes('.jsx') || line.includes('.tsx')) {
              return line.replace(/([^ ]*)(\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+)([^ ].*)/, 
                '\x1b[38;2;245;194;231m$1\x1b[38;2;186;194;222m$2\x1b[38;2;245;194;231m$3\x1b[0m');
            } else if (line.includes('.json') || line.includes('.yml') || line.includes('.yaml') || line.includes('.toml')) {
              return line.replace(/([^ ]*)(\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+)([^ ].*)/, 
                '\x1b[38;2;249;226;175m$1\x1b[38;2;186;194;222m$2\x1b[38;2;249;226;175m$3\x1b[0m');
            } else if (line.includes('.md') || line.includes('.txt')) {
              return line.replace(/([^ ]*)(\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+)([^ ].*)/, 
                '\x1b[38;2;148;226;213m$1\x1b[38;2;186;194;222m$2\x1b[38;2;148;226;213m$3\x1b[0m');
            }
            
            // Default formatting for other files
            return line.replace(/([^ ]*)(\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+[^ ]+\s+)([^ ].*)/, 
              '\x1b[38;2;205;214;244m$1\x1b[38;2;186;194;222m$2\x1b[38;2;205;214;244m$3\x1b[0m');
          })
          .join('\n');
      } else {
        // Simple ls output (no details)
        return output
          .split(/\s+/)
          .filter(item => item.trim())
          .map(item => {
            if (item.endsWith('/')) {
              return `\x1b[1;38;2;137;180;250m${item}\x1b[0m`;
            } else if (item.includes('.py')) {
              return `\x1b[38;2;249;226;175m${item}\x1b[0m`;
            } else if (item.includes('.js') || item.includes('.ts') || item.includes('.jsx') || item.includes('.tsx')) {
              return `\x1b[38;2;245;194;231m${item}\x1b[0m`;
            } else if (item.includes('.json') || item.includes('.yml') || item.includes('.yaml') || item.includes('.toml')) {
              return `\x1b[38;2;249;226;175m${item}\x1b[0m`;
            } else if (item.includes('.md') || item.includes('.txt')) {
              return `\x1b[38;2;0;102;204m${item}\x1b[0m`;
            } else if (item.includes('.')) {
              return `\x1b[38;2;51;51;51m${item}\x1b[0m`;
            }
            return `\x1b[38;2;0;128;0m${item}\x1b[0m`;
          })
          .join('  ') + '\n';
      }
    } 
    // Format directory commands
    else if (cmd === 'pwd' || cmd.startsWith('cd ')) {
      return `\x1b[38;2;0;128;0m${output}\x1b[0m`;
    }
    // Format git status output
    else if (cmd.includes('git status')) {
      return output
        .split('\n')
        .map(line => {
          if (line.includes('On branch')) {
            return `\x1b[38;2;0;102;204m${line}\x1b[0m`;
          } else if (line.includes('modified:')) {
            return `\x1b[38;2;153;102;0m${line}\x1b[0m`;
          } else if (line.includes('new file:')) {
            return `\x1b[38;2;0;128;0m${line}\x1b[0m`;
          } else if (line.includes('deleted:')) {
            return `\x1b[38;2;204;0;0m${line}\x1b[0m`;
          } else if (line.includes('Untracked files:')) {
            return `\x1b[38;2;153;0;153m${line}\x1b[0m`;
          }
          return `\x1b[38;2;51;51;51m${line}\x1b[0m`;
        })
        .join('\n');
    }
    // Format grep output
    else if (cmd.includes('grep')) {
      return output
        .split('\n')
        .map(line => {
          // Highlight the matching part
          const parts = line.split(':');
          if (parts.length > 1) {
            const file = parts[0];
            const rest = parts.slice(1).join(':');
            return `\x1b[38;2;0;102;204m${file}\x1b[0m:\x1b[38;2;153;102;0m${rest}\x1b[0m`;
          }
          return `\x1b[38;2;51;51;51m${line}\x1b[0m`;
        })
        .join('\n');
    }
    // Format error messages
    else if (output.toLowerCase().includes('error') || output.toLowerCase().includes('failed')) {
      return output
        .split('\n')
        .map(line => {
          if (line.toLowerCase().includes('error')) {
            return `\x1b[38;2;204;0;0m${line}\x1b[0m`;
          } else if (line.toLowerCase().includes('warning')) {
            return `\x1b[38;2;153;102;0m${line}\x1b[0m`;
          }
          return `\x1b[38;2;51;51;51m${line}\x1b[0m`;
        })
        .join('\n');
    }
    
    // Default formatting
    return `\x1b[38;2;51;51;51m${output}\x1b[0m`;
  };

  // Handle Enter key press
  const handleEnterKey = (term: XTerm, input: string) => {
    term.writeln('');
    if (input.trim()) {
      // Display a message that user command execution is disabled
      term.writeln('\x1b[38;2;204;0;0mUser command execution is disabled. Please use VS Code terminal for running commands.\x1b[0m');
      term.write('\x1b[33m[omniroot agent]\x1b[0m \x1b[38;2;0;128;0m$ \x1b[0m');
    } else {
      term.write('\x1b[33m[omniroot agent]\x1b[0m \x1b[38;2;0;128;0m$ \x1b[0m');
    }
  };

  // Handle Up arrow key press
  const handleUpArrow = (term: XTerm, currentLine: string): string => {
    if (commandHistory.length === 0) return currentLine;
    
    const newIndex = historyIndex === -1 
      ? commandHistory.length - 1 
      : Math.max(0, historyIndex - 1);
    
    setHistoryIndex(newIndex);
    
    // Clear current line
    for (let i = 0; i < currentLine.length; i++) {
      term.write('\b \b');
    }
    
    // Write history command
    const historyCommand = commandHistory[newIndex];
    term.write(historyCommand);
    setCurrentInput(historyCommand);
    return historyCommand;
  };

  // Handle Down arrow key press
  const handleDownArrow = (term: XTerm, currentLine: string): string => {
    if (historyIndex === -1) return currentLine;
    
    const newIndex = historyIndex === commandHistory.length - 1 
      ? -1 
      : historyIndex + 1;
    
    setHistoryIndex(newIndex);
    
    // Clear current line
    for (let i = 0; i < currentLine.length; i++) {
      term.write('\b \b');
    }
    
    // Write history command or empty line
    if (newIndex === -1) {
      setCurrentInput('');
      return '';
    } else {
      const historyCommand = commandHistory[newIndex];
      term.write(historyCommand);
      setCurrentInput(historyCommand);
      return historyCommand;
    }
  };

  // Execute command - now only used for agent commands
  const executeCommand = async (command: string, term: XTerm, type: 'user' | 'agent' = 'user') => {
    // If it's a user command, display a message that user command execution is disabled
    if (type === 'user') {
      term.writeln('\x1b[38;2;204;0;0mUser command execution is disabled. Please use VS Code terminal for running commands.\x1b[0m');
      term.write('\x1b[33m[omniroot agent]\x1b[0m \x1b[38;2;0;128;0m$ \x1b[0m');
      return;
    }
    
    // Only agent commands should reach this point
    setIsProcessing(true);
    
    try {
      // For agent commands, we don't actually execute them here
      // They are executed elsewhere and we just display them
      // This function is kept for compatibility with the existing code
      
      // Add command to terminal content
      const newContent = [...terminalContent, {
        command: command,
        output: '',
        type: 'agent' as const,
        timestamp: Date.now(),
        workingDirectory: '/'
      }];
      
      setTerminalContent(newContent);
      saveTerminalState(newContent, commandHistory);
      
      // The actual output will come through the event stream
    } catch (error) {
      term.writeln(`\x1b[38;2;204;0;0mError executing command: ${error}\x1b[0m`);
      const prefix = '\x1b[33m[omniroot agent]\x1b[0m';
      term.write(`${prefix} \x1b[38;2;0;128;0m$ \x1b[0m`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Connect to terminal events stream
  const connectToTerminalEvents = (term: XTerm) => {
    const es = new EventSource('http://localhost:5001/api/terminal/events');
    
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'command') {
          // Agent is executing a command
          term.writeln('');
          term.write(`\x1b[33m[omniroot agent]\x1b[0m \x1b[38;2;0;128;0m$ \x1b[0m${data.command}`);
          term.writeln('');
          
          // Add to terminal content
          const newContent = [...terminalContent, {
            command: data.command,
            output: '',
            type: 'agent' as const,
            timestamp: Date.now(),
            workingDirectory: data.working_directory || undefined
          }];
          setTerminalContent(newContent);
          
          // Save to localStorage immediately to ensure persistence
          saveTerminalState(newContent, commandHistory);
        } else if (data.type === 'output') {
          // Output from a command
          const formattedOutput = formatCommandOutput(data.command || '', data.content);
          term.write(formattedOutput);
          
          if (!formattedOutput.endsWith('\n')) {
            term.writeln('');
          }
          
          // Update the last command entry with output
          const updatedContent = [...terminalContent];
          if (updatedContent.length > 0) {
            updatedContent[updatedContent.length - 1].output = data.content;
            
            // If working directory is provided, update it
            if (data.working_directory) {
              updatedContent[updatedContent.length - 1].workingDirectory = data.working_directory;
            }
            
            setTerminalContent(updatedContent);
            saveTerminalState(updatedContent, commandHistory);
          }
          
          // Always use the agent prefix since we're removing user input
          term.write(`\x1b[33m[omniroot agent]\x1b[0m \x1b[38;2;0;128;0m$ \x1b[0m`);
        }
      } catch (error) {
        console.error('Error parsing terminal event:', error);
      }
    };
    
    es.onerror = (error) => {
      console.error('Terminal events stream error:', error);
      term.writeln('\x1b[31m⚠️  Terminal connection lost. Reconnecting...\x1b[0m');
      
      // Try to reconnect after a delay
      setTimeout(() => {
        if (es.readyState === EventSource.CLOSED) {
          term.writeln('\x1b[32m🔄 Attempting to reconnect...\x1b[0m');
          connectToTerminalEvents(term);
        }
      }, 3000);
    };
    
    // Set up a heartbeat to check connection status
    const heartbeatInterval = setInterval(() => {
      if (es.readyState === EventSource.CLOSED) {
        console.log('Terminal events stream closed, reconnecting...');
        clearInterval(heartbeatInterval);
        connectToTerminalEvents(term);
      }
    }, 10000);
    
    setEventSource(es);
  };

  return (
    <div className="h-full w-full bg-[#FFFFFF] border border-[#e0e0e0] rounded-lg shadow-md overflow-hidden">
      <div className="h-8 bg-gradient-to-r from-[#f8f8f8] to-[#f0f0f0] border-b border-[#e0e0e0] flex items-center justify-between px-4">
        <div className="flex items-center">
          <div className="flex space-x-2 mr-3">
            <div className="w-3 h-3 rounded-full bg-[#F38BA8] hover:brightness-110 transition-all cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-[#F9E2AF] hover:brightness-110 transition-all cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-[#A6E3A1] hover:brightness-110 transition-all cursor-pointer"></div>
          </div>
          <div className="text-sm text-[#333333] font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-[#3465A4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
            omniroot agent Terminal
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[#555555] text-xs">
          <span className="px-1.5 py-0.5 rounded bg-[#f0f0f0] text-[#333333]">bash</span>
          <span className="text-[#333333]">•</span>
          <span>persistent</span>
        </div>
      </div>
      <div className="h-[calc(100%-2rem)] p-2 bg-[#FFFFFF]">
        <div 
          ref={terminalRef} 
          className="h-full w-full bg-[#FFFFFF] rounded border border-[#e0e0e0] shadow-inner overflow-hidden" 
        />
      </div>
    </div>
  );
};

export default TerminalUI;