import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  BarChart2, 
  Target, 
  CheckSquare, 
  Calendar,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useFirebaseAuth';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const router = useRouter();
  const { logout } = useAuth();

  // Navigation items configuration
  const navItems = [
    {
      title: 'Dashboard',
      icon: <BarChart2 className="w-5 h-5" />,
      path: '/dashboard'
    },
    {
      title: 'Goals',
      icon: <Target className="w-5 h-5" />,
      path: '/dashboard/goals'
    },
    {
      title: 'Tasks',
      icon: <CheckSquare className="w-5 h-5" />,
      path: '/dashboard/tasks'
    },
    {
      title: 'Calendar',
      icon: <Calendar className="w-5 h-5" />,
      path: '/dashboard/calendar'
    },
    {
      title: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      path: '/dashboard/settings'
    }
  ];

  // Handle logout action
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={`flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-gray-800">Goals App</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <span className={`flex items-center px-4 py-2 cursor-pointer transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                    {item.icon}
                    {!isCollapsed && (
                      <span className="ml-3">{item.title}</span>
                    )}
                    {isActive && !isCollapsed && (
                      <div className="w-1 h-full bg-blue-600 absolute right-0" />
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;