import { Link } from 'react-router-dom';
import { UserMenu } from './UserMenu';
import { MobileNavButton } from './MobileNav';
import { Breadcrumbs } from './Breadcrumbs';

interface HeaderProps {
  onMobileNavToggle: () => void;
}

export function Header({ onMobileNavToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <MobileNavButton onClick={onMobileNavToggle} />
          <Link to="/" className="flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block text-xl">
              Nimbus
            </span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center space-x-4 justify-end">
          <nav className="flex items-center space-x-2">
            <Breadcrumbs />
          </nav>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}