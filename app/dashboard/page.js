// app/dashboard/page.js
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    LogOut, 
    LayoutDashboard, 
    Target, 
    BookOpen, 
    Archive,
    Settings,
    Menu,
    ChevronRight,
    RefreshCw
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/app/firebase/config';
import ProtectedRoute from '../components/ProtectedRoute';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '#' },
    { icon: Target, label: 'Goals', href: '#' },
    { icon: BookOpen, label: 'Success Journal', href: '#' },
    { icon: Archive, label: 'Archive', href: '#' },
    { icon: Settings, label: 'Settings', href: '#' }
];

function Sidebar() {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('auth_user');
            router.push('/auth/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-4 left-4 z-20">
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
                >
                    <Menu className="w-6 h-6 text-gray-700" />
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full w-64 bg-white shadow-lg
                transform transition-transform duration-300 ease-in-out z-10
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">Goals Dashboard</h1>
                    <button 
                        className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col h-[calc(100%-4rem)]">
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <a 
                                    key={index}
                                    href={item.href}
                                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <Icon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700" />
                                    <span className="font-medium">{item.label}</span>
                                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            );
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

function DashboardContent() {
    return (
        <main className="lg:pl-64 min-h-screen bg-gray-50">
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header Stats */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">My Goals Dashboard</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Total Goals Card */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                                    <Target className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Goals</p>
                                    <p className="text-2xl font-bold text-gray-900">2</p>
                                </div>
                            </div>
                        </div>

                        {/* In Progress Card */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-3 bg-orange-100 rounded-lg mr-4">
                                    <Target className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">In Progress</p>
                                    <p className="text-2xl font-bold text-gray-900">2</p>
                                </div>
                            </div>
                        </div>

                        {/* Completed Card */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 rounded-lg mr-4">
                                    <Target className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900">0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daily Reflection */}
                <div className="mb-8 bg-blue-500 p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                        <div className="text-white">
                            <h2 className="text-xl font-semibold mb-3">Daily Reflection</h2>
                            <p className="text-lg opacity-90">
                                "What am I willing to sacrifice to achieve my dreams?"
                            </p>
                        </div>
                        <button 
                            className="p-2 hover:bg-blue-600/50 rounded-full transition-colors"
                            aria-label="Get new quote"
                        >
                            <RefreshCw className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Your existing content */}
                {/* Copy your existing charts, category analytics, etc. here */}
            </div>
        </main>
    );
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <div className="relative min-h-screen bg-gray-50">
                <Sidebar />
                <DashboardContent />
            </div>
        </ProtectedRoute>
    );
}