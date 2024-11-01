// app/components/ProtectedRoute.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
//import { useAuth } from '../context/AuthContext';
// app/components/ProtectedRoute.js
import { useAuth } from '@/app/context/AuthContext';  // Updated path

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return isAuthenticated ? children : null;
}