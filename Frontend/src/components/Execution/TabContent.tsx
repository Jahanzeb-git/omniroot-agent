import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Code, Terminal, Globe, AppWindow, Loader2, RefreshCw, Server, Clock, Hash, ExternalLink, Activity, Zap, Circle } from 'lucide-react';

const TerminalUI = lazy(() => import('./TerminalUI'));

interface TabContentProps {
  activeTab: 'vscode' | 'terminal' | 'app' | 'browser';
}

interface AppViewState {
  servers: Array<{
    port: number;
    pid: number;
    timestamp: number;
    uptime: number;
  }>;
  current_frontend: {
    port: number;
    pid: number;
    timestamp: number;
  } | null;
}

const PlaceholderContent: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  bgColor?: string;
  iconColor?: string;
}> = ({ 
  icon, 
  title, 
  description, 
  bgColor = "bg-gradient-to-br from-slate-50 via-white to-slate-50",
  iconColor = "text-blue-600"
}) => (
  <div className={`flex flex-col items-center justify-center h-full ${bgColor} relative overflow-hidden`}>
    {/* Subtle background pattern */}
    <div className="absolute inset-0 opacity-[0.02]">
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 25px 25px, #000 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }}></div>
    </div>
    
    <div className="relative z-10 flex flex-col items-center">
      <div className="mb-8 p-6 rounded-2xl bg-white shadow-lg border border-slate-200/50 backdrop-blur-sm">
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          {React.cloneElement(icon as React.ReactElement, { 
            size: 40, 
            className: `${iconColor} drop-shadow-sm`
          })}
        </div>
      </div>
      <h3 className="text-2xl font-semibold text-slate-800 mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-600 text-center max-w-md leading-relaxed px-4 text-sm">
        {description}
      </p>
    </div>
  </div>
);

const ServerCard: React.FC<{ server: AppViewState['servers'][0] }> = ({ server }) => {
  const formatUptime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (uptime: number) => {
    if (isNaN(uptime)) return 'text-slate-500';
    if (uptime > 3600) return 'text-emerald-600'; // > 1 hour
    if (uptime > 300) return 'text-blue-600';    // > 5 minutes
    return 'text-amber-600';                     // < 5 minutes
  };

  const safeUptime = isNaN(server.uptime) ? 0 : server.uptime;

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200/60 hover:border-slate-300/60 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100/50">
                <Server className="text-emerald-600" size={20} />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Server</h3>
              <p className="text-sm text-slate-500 font-medium">Port {server.port}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-full border border-emerald-100/50">
            <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700 tracking-wide">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 pb-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Process ID */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100/50 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Hash className="text-slate-400" size={14} />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PID</span>
            </div>
            <p className="text-sm font-mono text-slate-800 font-semibold">{server.pid}</p>
          </div>

          {/* Uptime */}
          <div className="p-3 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-xl border border-blue-100/50 hover:from-blue-50 hover:to-indigo-50 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <Activity className={`${getStatusColor(safeUptime)}`} size={14} />
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Uptime</span>
            </div>
            <p className={`text-sm font-mono font-semibold ${getStatusColor(safeUptime)}`}>
              {formatUptime(safeUptime)}
            </p>
          </div>
        </div>

        {/* Started Time */}
        <div className="p-3 bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-xl border border-amber-100/50 hover:from-amber-50 hover:to-orange-50 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="text-amber-500" size={14} />
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Started</span>
          </div>
          <p className="text-sm text-slate-800 font-medium">{formatTimestamp(server.timestamp)}</p>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};

const BrowserView: React.FC<{ port: number }> = ({ port }) => {
  const [url, setUrl] = useState(`http://localhost:${port}`);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleGo = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGo();
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Enhanced Browser Header */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200/80 shadow-sm">
        <div className="p-4">
          <div className="flex items-center gap-3">
            {/* URL Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                value={url} 
                onChange={handleUrlChange}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-slate-50/50 hover:bg-white"
                placeholder="Enter URL or localhost:port..."
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleGo}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <span>Go</span>
              </button>
              <button 
                onClick={handleRefresh}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                title="Refresh"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <button 
                onClick={() => window.open(url, '_blank')}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                title="Open in new tab"
              >
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative bg-slate-50">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <div className="relative">
                <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
              </div>
              <p className="text-sm text-slate-600 font-medium">Loading application...</p>
            </div>
          </div>
        )}
        <iframe 
          key={iframeKey}
          src={url}
          className="w-full h-full border-0 rounded-lg"
          sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups allow-downloads"
          title="Application Preview"
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
};

const TabContent: React.FC<TabContentProps> = ({ activeTab }) => {
  const [appViewState, setAppViewState] = useState<AppViewState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:5001/api/appview/events');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Fix uptime calculation - ensure timestamp is treated as number
        const serversWithUptime = data.servers.map((server: any) => {
          const timestamp = Number(server.timestamp);
          const currentTime = Math.floor(Date.now() / 1000);
          const uptime = currentTime - timestamp;
          
          return {
            ...server,
            timestamp: timestamp,
            uptime: Math.max(0, uptime) // Ensure uptime is never negative
          };
        });
        
        setAppViewState({
          servers: serversWithUptime,
          current_frontend: data.current_frontend ? {
            ...data.current_frontend,
            timestamp: Number(data.current_frontend.timestamp)
          } : null
        });
        setIsLoading(false);
        setConnectionError(false);
      } catch (error) {
        console.error('Error parsing AppView data:', error);
        setConnectionError(true);
        setIsLoading(false);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      setConnectionError(true);
      setIsLoading(false);
    };
    
    return () => {
      eventSource.close();
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'vscode':
        return (
          <div className="h-full w-full relative bg-slate-50">
            <iframe
              src="http://127.0.0.1:8080"
              className="w-full h-full border-0 bg-white rounded-lg"
              title="VS Code Editor"
              sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups allow-downloads"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        );
        
      case 'terminal':
        return (
          <Suspense fallback={
            <div className="flex items-center justify-center h-full bg-slate-50">
              <div className="text-center">
                <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                <p className="text-slate-600 font-medium">Loading terminal...</p>
              </div>
            </div>
          }>
            <TerminalUI />
          </Suspense>
        );
        
      case 'app':
        if (isLoading) {
          return (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-600 font-medium">Connecting to servers...</p>
              </div>
            </div>
          );
        }
        
        if (connectionError) {
          return (
            <PlaceholderContent 
              icon={<Zap />} 
              title="Connection Error" 
              description="Unable to connect to the server monitoring service. Please ensure the backend is running."
              iconColor="text-amber-500"
            />
          );
        }
        
        if (appViewState && appViewState.servers.length > 0) {
          return (
            <div className="h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-auto">
              <div className="p-6 lg:p-8">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <Server className="text-blue-600" size={20} />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Running Servers</h2>
                  </div>
                  <p className="text-slate-600">Monitor and manage your active server instances</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {appViewState.servers.map((server) => (
                    <ServerCard key={`${server.port}-${server.pid}`} server={server} />
                  ))}
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <PlaceholderContent 
              icon={<AppWindow />} 
              title="No Active Servers" 
              description="Your servers will appear here once they're started by the agent. Use the terminal or agent commands to create and run applications."
            />
          );
        }
        
      case 'browser':
        if (isLoading) {
          return (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-600 font-medium">Loading browser preview...</p>
              </div>
            </div>
          );
        }
        
        if (appViewState && appViewState.current_frontend && appViewState.current_frontend.port) {
          return <BrowserView port={appViewState.current_frontend.port} />;
        } else {
          return (
            <PlaceholderContent 
              icon={<Globe />} 
              title="No Frontend Available" 
              description="Your web applications will appear here once they're running. Ask the agent to start a frontend server or application."
            />
          );
        }
        
      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-hidden bg-white">
      {renderContent()}
    </div>
  );
};

export default TabContent;