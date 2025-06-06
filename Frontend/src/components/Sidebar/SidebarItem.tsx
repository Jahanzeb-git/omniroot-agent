import React from 'react';
import clsx from 'clsx';
import { LucideIcon, Loader2 } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  isActive = false,
  isLoading = false,
  onClick,
  disabled = false,
}) => {
  return (
    <div className="relative group">
      <button
        className={clsx(
          'w-full flex flex-col items-center justify-center py-4 px-3 relative',
          'transition-all duration-300 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          {
            // Active state
            'text-primary-600 bg-primary-50 shadow-sm': isActive,
            // Inactive state
            'text-slate-600 hover:text-primary-600 hover:bg-slate-50': !isActive && !disabled,
            // Loading state
            'cursor-wait': isLoading,
          }
        )}
        onClick={onClick}
        disabled={disabled || isLoading}
        aria-label={label}
        aria-pressed={isActive}
      >
        {/* Icon with loading state */}
        <div className="relative flex items-center justify-center mb-2">
          {isLoading ? (
            <Loader2 size={22} className="animate-spin text-primary-600" />
          ) : (
            <Icon 
              size={22} 
              strokeWidth={isActive ? 2.5 : 2}
              className="transition-all duration-200 group-hover:scale-110"
            />
          )}
        </div>
        
        {/* Label */}
        <span className={clsx(
          'text-xs font-medium transition-all duration-200',
          'leading-tight text-center',
          {
            'text-primary-600': isActive,
            'text-slate-600 group-hover:text-primary-600': !isActive,
          }
        )}>
          {label}
        </span>
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <div className="w-1 h-10 bg-primary-600 rounded-r-sm shadow-sm" />
          </div>
        )}
        
        {/* Click ripple effect */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-active:opacity-20 group-active:bg-primary-600 transition-opacity duration-150" />
      </button>
      
      {/* Enhanced tooltip */}
      <div className={clsx(
        'absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50',
        'px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-lg',
        'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
        'transition-all duration-200 ease-out transform group-hover:translate-x-0 -translate-x-2',
        'pointer-events-none whitespace-nowrap'
      )}>
        {label}
        {/* Tooltip arrow */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
      </div>
    </div>
  );
};

export default SidebarItem;