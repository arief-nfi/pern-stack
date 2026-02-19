import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { navigation } from '../../config/navigation';
import { TreeView } from './TreeView';
import { cn } from '../../lib/utils';
import { APP_NAME, APP_VERSION, COPYRIGHT } from '../../lib/appInfo';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save collapsed state to localStorage and dispatch event
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    // Dispatch custom event to notify Layout component
    window.dispatchEvent(new Event('sidebar-collapse-change'));
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 flex flex-col h-screen bg-slate-900 border-r border-slate-700 transition-all duration-300 z-40',
        isCollapsed ? 'w-16' : 'w-72',
        className
      )}
    >
      {/* Header - Fixed at top */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Nimbus</h1>
            </div>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation - Scrollable content area */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
        <div className="py-4">
          <TreeView items={navigation.main} isCollapsed={isCollapsed} />
        </div>
      </nav>

      {/* Footer - Fixed at bottom */}
      <div className="p-4 border-t border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-9 h-9 bg-slate-800 rounded-md flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">N</div>
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{APP_NAME}</p>
                <p className="text-xs text-slate-400">{COPYRIGHT}</p>
              </div>
            )}
          </div>

          {!isCollapsed ? (
            <div className="text-right">
              <p className="text-xs text-slate-400">v{APP_VERSION}</p>
            </div>
          ) : (
            <div className="text-slate-500 text-xs">v{APP_VERSION}</div>
          )}
        </div>
      </div>
    </aside>
  );
}