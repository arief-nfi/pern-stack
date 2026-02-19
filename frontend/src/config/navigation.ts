import {
  LayoutDashboard,
  LogOut,
  Settings,
  User
} from 'lucide-react';

export interface NavigationItem {
  title: string;
  href?: string;
  items?: NavigationItem[];
  icon?: React.ComponentType<any>;
  description?: string;
}

export const navigation = {
  main: [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview and analytics',
      items: [
        { title: 'Main Dashboard', href: '/', icon: LayoutDashboard },        
      ]
    },
    {
      title: 'User Management',
      icon: User,
      description: 'User and role management',
      items: [
        { title: 'Users', href: '/users', icon: User },
        { title: 'Roles', href: '/roles', icon: User },
        { title: 'Permissions', href: '/permissions', icon: User },
      ]
    },
  ] as NavigationItem[],
};

export const userMenu = [
  { title: 'Profile', href: '/profile', icon: User },
  { title: 'Settings', href: '/settings', icon: Settings },
  { title: 'Logout', href: '/logout', icon: LogOut },
];

export function getBreadcrumbPath(pathname: string): { title: string; href: string }[] {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { title: string; href: string }[] = [];
  
  // Add home
  breadcrumbs.push({ title: 'Home', href: '/' });
  
  // Build breadcrumb path
  let currentPath = '';
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    
    // Find matching navigation item
    let foundTitle = segment;
    for (const section of navigation.main) {
      if (section.items) {
        const item = section.items.find(item => item.href === currentPath);
        if (item) {
          foundTitle = item.title;
          break;
        }
        // Check nested items
        for (const subItem of section.items) {
          if (subItem.items) {
            const nestedItem = subItem.items.find(nestedItem => nestedItem.href === currentPath);
            if (nestedItem) {
              foundTitle = nestedItem.title;
              break;
            }
          }
        }
      }
    }
    
    breadcrumbs.push({ title: foundTitle, href: currentPath });
  }
  
  return breadcrumbs;
}