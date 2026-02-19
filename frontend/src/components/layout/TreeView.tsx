import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { NavigationItem } from '../../config/navigation';
import { cn } from '../../lib/utils';

interface TreeViewProps {
  items: NavigationItem[];
  level?: number;
  isCollapsed?: boolean;
}

interface TreeItemProps {
  item: NavigationItem;
  level: number;
  isCollapsed: boolean;
}

function TreeItem({ item, level, isCollapsed }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const hasChildren = item.items && item.items.length > 0;

  // Auto-expand if any child is active
  if (hasChildren && !isExpanded) {
    const hasActiveChild = item.items!.some(child => 
      child.href === location.pathname || 
      (child.items && child.items.some(nestedChild => nestedChild.href === location.pathname))
    );
    if (hasActiveChild) {
      setIsExpanded(true);
    }
  }

  const toggleExpand = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const paddingLeft = `${level * 12 + 12}px`;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={toggleExpand}
          className={cn(
            'w-full flex items-center py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
            'text-slate-300 hover:text-white hover:bg-slate-800',
            isCollapsed && 'justify-center px-2'
          )}
          style={{ paddingLeft: isCollapsed ? '8px' : paddingLeft }}
          title={isCollapsed ? item.title : undefined}
        >
          <div className="flex items-center flex-1">
            {item.icon && (
              <item.icon className="flex-shrink-0 mr-3 h-5 w-5" />
            )}
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.title}</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </>
            )}
          </div>
        </button>
        
        {!isCollapsed && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.items!.map((child, index) => (
              <TreeItem 
                key={`${child.title}-${level}-${index}`} 
                item={child} 
                level={level + 1} 
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href || '#'}
      className={({ isActive }) =>
        cn(
          'flex items-center py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200',
          isActive
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white',
          isCollapsed && 'justify-center px-2'
        )
      }
      style={{ paddingLeft: isCollapsed ? '8px' : paddingLeft }}
      title={isCollapsed ? item.title : undefined}
    >
      {item.icon && (
        <item.icon className="flex-shrink-0 mr-3 h-4 w-4" />
      )}
      {!isCollapsed && (
        <span className="truncate">{item.title}</span>
      )}
    </NavLink>
  );
}

export function TreeView({ items, level = 0, isCollapsed = false }: TreeViewProps) {
  return (
    <div className="px-3 space-y-1">
      {items.map((item, index) => (
        <TreeItem 
          key={`${item.title}-${level}-${index}`} 
          item={item} 
          level={level} 
          isCollapsed={isCollapsed}
        />
      ))}
    </div>
  );
}