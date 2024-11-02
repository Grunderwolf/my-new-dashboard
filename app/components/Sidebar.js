// app/components/Sidebar.js
'use client'

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { auth } from '@/app/firebase/config';
import { signOut } from 'firebase/auth';

const Sidebar = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useFirebaseAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('authUser'); // Clear cached user data
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Optional: Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* User Info Section */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Goals App</h1>
        {user && (
          <p className="text-sm text-gray-600 mt-1">
            {user.email}
          </p>
        )}
      </div>
      
      {/* Navigation can go here */}
      <div className="flex-1">
        {/* Add your navigation items here */}
      </div>

      {/* Logout Button */}
      <div className="mt-auto p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;