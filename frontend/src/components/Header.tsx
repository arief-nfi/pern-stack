import { UserMenu } from './layout/UserMenu';
import { MobileNavButton } from './layout/MobileNav';
import { Breadcrumbs } from './layout/Breadcrumbs';
import { Bell } from 'lucide-react';

interface HeaderProps {
  onMobileNavToggle: () => void;
}

export function Header({ onMobileNavToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-800 border-b border-slate-700 shadow-sm">
      <div className="flex h-16 items-center justify-between w-full px-4 sm:px-4 lg:px-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <MobileNavButton onClick={onMobileNavToggle} />
          {/* <Link to="/" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="hidden font-bold text-xl text-white sm:inline-block">
              Nimbus Admin
            </span>
          </Link> */}
          {/* Breadcrumbs - hidden on smaller screens */}
          <nav className="hidden lg:flex items-center space-x-2">
            <Breadcrumbs />
          </nav>
        </div>
        
        {/* Center - Empty space (removed search) */}
        <div className="flex-1"></div>
        
        {/* Right side */}
        <div className="flex items-center space-x-3">
          
          
          {/* Notifications */}
          <button className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}