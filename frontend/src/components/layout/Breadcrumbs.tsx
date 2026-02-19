import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { getBreadcrumbPath } from '../../config/navigation';
import { cn } from '../../lib/utils';

export function Breadcrumbs({ className }: { className?: string }) {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbPath(location.pathname);

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className={cn('flex items-center space-x-1 text-sm text-slate-400', className)}>
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <div key={item.href} className="flex items-center">
            {index === 0 && (
              <Home className="h-4 w-4 mr-2" />
            )}
            
            {isLast ? (
              <span className="text-white font-medium">{item.title}</span>
            ) : (
              <Link
                to={item.href}
                className="hover:text-white transition-colors"
              >
                {item.title}
              </Link>
            )}
            
            {!isLast && (
              <ChevronRight className="h-4 w-4 mx-2 text-slate-600" />
            )}
          </div>
        );
      })}
    </nav>
  );
}