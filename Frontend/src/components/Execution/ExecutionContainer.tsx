import React, { useState, useEffect } from 'react';
import ExecutionTabs from './ExecutionTabs';
import TabContent from './TabContent';
import { TabType } from '../../types';

interface ExecutionContainerProps {
  // Additional props as needed
}

const ExecutionContainer: React.FC<ExecutionContainerProps> = () => {
  const [activeTab, setActiveTab] = useState<TabType>('vscode');

  // Load Google Fonts for Ubuntu Mono
  useEffect(() => {
    // Check if the font is already loaded
    if (!document.querySelector('link[href*="Ubuntu+Mono"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Ubuntu+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  // Persist active tab to localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('active-execution-tab') as TabType;
    if (savedTab && ['vscode', 'terminal', 'app', 'browser'].includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem('active-execution-tab', tab);
  };
  
  return (
    <div className="flex flex-col h-full border-l border-[#e0e0e0] bg-[#FFFFFF] shadow-md">
      <ExecutionTabs activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex-1 overflow-hidden">
        <TabContent activeTab={activeTab} />
      </div>
    </div>
  );
};

export default ExecutionContainer;