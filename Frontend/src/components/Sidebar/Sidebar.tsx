import React, { useState } from 'react';
import { Bot, History, Book, Settings, User, Plus, Sparkles } from 'lucide-react';
import SidebarItem from './SidebarItem';
import SettingsModal from './SettingsModal';
import HistoryModal from './HistoryModal';
import DocumentationModal from './DocumentationModal';
import { useSession } from '../../contexts/SessionContext';
import { useTaskStore } from '../../store/taskStore';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

interface SessionData {
  session_id: string;
  workflows: Array<{
    query: string;
    start_time: string;
    workflow_id: string;
    steps: Array<{
      action: string;
      action_input: string;
      observation: string;
      thought: string;
    }>;
  }>;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick }) => {
  const { resetSession } = useSession();
  const { clearTasks, createTask, addEventToTask, setTaskStatus } = useTaskStore();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDocumentationModalOpen, setIsDocumentationModalOpen] = useState(false);
  const [isNewSessionLoading, setIsNewSessionLoading] = useState(false);
  
  const handleNewSession = async () => {
    try {
      setIsNewSessionLoading(true);
      
      // First reset the session via API
      await resetSession();
      
      // After successful API response, clear all tasks to reset conversation UI
      clearTasks();
      
      onItemClick('new');
    } catch (error) {
      console.error('Failed to create new session:', error);
      // UI remains unchanged on error - don't clear tasks
    } finally {
      setIsNewSessionLoading(false);
    }
  };
  
  const handleHistoryClick = () => {
    setIsHistoryModalOpen(true);
    onItemClick('history');
  };
  
  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true);
    onItemClick('settings');
  };
  
  const handleDocumentationClick = () => {
    setIsDocumentationModalOpen(true);
    onItemClick('docs');
  };
  
  const handleCloseSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
  };

  const handleCloseDocumentationModal = () => {
    setIsDocumentationModalOpen(false);
  };

  // Transform API data to TaskEvents for conversation UI
  const transformWorkflowToTasks = (sessionData: SessionData) => {
    clearTasks(); // Clear existing tasks first

    sessionData.workflows.forEach((workflow) => {
      // Create a new task for each workflow
      const taskId = createTask(workflow.query);
      
      workflow.steps.forEach((step, stepIndex) => {
        const isLastStep = stepIndex === workflow.steps.length - 1;
        
        if (step.action === 'Final Answer') {
          // Handle final answer
          addEventToTask(taskId, {
            type: 'final_answer',
            thought: step.thought,
            answer: step.observation
          });
        } else {
          // Handle regular step
          addEventToTask(taskId, {
            type: 'step',
            thought: step.thought,
            action: step.action,
            action_input: step.action_input,
            observation: step.observation
          });
        }
      });

      // Add execution time event (simulate end of workflow)
      addEventToTask(taskId, {
        type: 'execution_time',
        time: 1.5 // Default execution time, you can calculate actual if needed
      });

      // Set task as completed
      setTaskStatus(taskId, 'completed');
    });
  };

  const handleSessionSelect = (sessionId: string, sessionData: SessionData) => {
    // Transform and populate the conversation UI
    transformWorkflowToTasks(sessionData);
    
    // Switch to conversation view
    onItemClick('new');
  };
  
  return (
    <>
      <div className="h-sidebar flex flex-col bg-white border-r border-slate-200 shadow-sm">
        {/* Logo/Brand Section */}
        <div className="flex items-center justify-center h-16 border-b border-slate-200 bg-gradient-to-br from-primary-50 to-white">
          <div className="relative">
            <Bot size={28} className="text-primary-600" />
            <div className="absolute -top-1 -right-1">
              <Sparkles size={12} className="text-primary-400 animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Main Navigation */}
        <div className="flex flex-col flex-1 py-2 space-y-1">
          <SidebarItem 
            icon={Plus} 
            label="New Chat" 
            isActive={activeItem === 'new'}
            isLoading={isNewSessionLoading}
            onClick={handleNewSession}
          />
          <SidebarItem 
            icon={History} 
            label="History" 
            isActive={activeItem === 'history'}
            onClick={handleHistoryClick}
          />
          <SidebarItem 
            icon={Book} 
            label="Knowledge" 
            isActive={activeItem === 'docs'}
            onClick={handleDocumentationClick}
          />
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            isActive={activeItem === 'settings'}
            onClick={handleSettingsClick}
          />
        </div>
        
        {/* User Section */}
        <div className="py-2 border-t border-slate-200 bg-slate-50/50">
          <SidebarItem 
            icon={User} 
            label="Profile" 
            isActive={activeItem === 'profile'}
            onClick={() => onItemClick('profile')}
          />
        </div>
      </div>
      
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={handleCloseSettingsModal}
      />
      
      <HistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={handleCloseHistoryModal}
        onSessionSelect={handleSessionSelect}
      />
      
      <DocumentationModal 
        isOpen={isDocumentationModalOpen}
        onClose={handleCloseDocumentationModal}
      />
    </>
  );
};

export default Sidebar;