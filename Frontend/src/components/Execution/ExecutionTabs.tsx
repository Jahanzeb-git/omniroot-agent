import React from 'react';
import clsx from 'clsx';
import { Code, Terminal, AppWindow, Globe, ExternalLink } from 'lucide-react';
import { TabType } from '../../types';

interface ExecutionTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface TabItemProps {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  hasExternalLink?: boolean;
  onExternalClick?: () => void;
}

const TabItem: React.FC<TabItemProps> = ({ 
  id, 
  label, 
  icon, 
  isActive, 
  onClick, 
  hasExternalLink = false,
  onExternalClick 
}) => {
  return (
    <div className="flex-1 relative group">
      <button
        className={clsx(
          'w-full flex items-center justify-center gap-2 px-4 py-3 border-b-2 transition-all duration-300 ease-in-out relative',
          'hover:bg-opacity-10 hover:bg-gray-100',
          isActive 
            ? 'border-[#3465A4] text-[#3465A4] bg-[#f0f0f0] bg-opacity-30 font-semibold' 
            : 'border-transparent text-[#333333] hover:text-[#000000] hover:border-[#cccccc]'
        )}
        onClick={onClick}
        aria-selected={isActive}
        role="tab"
      >
        <div className="flex items-center gap-2">
          {React.cloneElement(icon as React.ReactElement, { 
            className: clsx(
              "transition-all duration-300",
              isActive ? "text-[#3465A4]" : "text-[#333333] group-hover:text-[#000000]"
            )
          })}
          <span className="text-sm font-medium">{label}</span>
        </div>
        
        {hasExternalLink && (
          <button
            className={clsx(
              'ml-2 p-1 rounded-md transition-all duration-200',
              'opacity-0 group-hover:opacity-100',
              'hover:bg-[#f0f0f0] hover:text-[#3465A4]',
              isActive ? 'text-[#3465A4]' : 'text-[#333333]'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onExternalClick?.();
            }}
            title={`Open ${label} in new tab`}
          >
            <ExternalLink size={14} />
          </button>
        )}
      </button>
      
      {/* Separator line */}
      {id !== 'browser' && (
        <div className="absolute right-0 top-3 bottom-3 w-px bg-[#e0e0e0]"></div>
      )}
      
      {/* Active tab indicator */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3465A4] opacity-80"></div>
      )}
    </div>
  );
};

const ExecutionTabs: React.FC<ExecutionTabsProps> = ({ activeTab, onTabChange }) => {
  const handleVSCodeExternalClick = () => {
    window.open('http://127.0.0.1:8080', '_blank', 'noopener,noreferrer');
  };

  const tabs = [
    { 
      id: 'vscode' as TabType, 
      label: 'VS Code', 
      icon: <Code size={18} />,
      hasExternalLink: true,
      onExternalClick: handleVSCodeExternalClick
    },
    { 
      id: 'terminal' as TabType, 
      label: 'Terminal', 
      icon: <Terminal size={18} /> 
    },
    { 
      id: 'app' as TabType, 
      label: 'App Preview', 
      icon: <AppWindow size={18} /> 
    },
    { 
      id: 'browser' as TabType, 
      label: 'Browser', 
      icon: <Globe size={18} /> 
    },
  ];
  
  return (
    <div className="flex border-b border-[#e0e0e0] bg-[#FFFFFF] shadow-md">
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          id={tab.id}
          label={tab.label}
          icon={tab.icon}
          isActive={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          hasExternalLink={tab.hasExternalLink}
          onExternalClick={tab.onExternalClick}
        />
      ))}
    </div>
  );
};

export default ExecutionTabs;