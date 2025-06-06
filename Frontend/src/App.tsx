import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ConversationContainer from './components/Conversation/ConversationContainer';
import ExecutionContainer from './components/Execution/ExecutionContainer';
import ResizablePanel from './components/SplitPane/ResizablePanel';
import { SessionProvider } from './contexts/SessionContext';
import { useTaskStore } from './store/taskStore';

function App() {
  const [activeItem, setActiveItem] = useState('new');
  const { tasks, currentTaskId } = useTaskStore();
  
  // Find current task
  const currentTask = tasks.find(task => task.id === currentTaskId) || null;
  
  return (
    <SessionProvider>
      <div className="flex h-screen bg-neutral-50">
        {/* Sidebar */}
        <div className="w-20 flex-shrink-0">
          <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanel
            leftPanel={<ConversationContainer task={currentTask} />}
            rightPanel={<ExecutionContainer />}
            initialSplit={40}
            minLeftWidth={30}
            maxLeftWidth={70}
          />
        </div>
      </div>
    </SessionProvider>
  );
}

export default App;