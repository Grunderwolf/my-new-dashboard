'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/app/firebase/config';
import { setCookie } from 'cookies-next';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);

    useEffect(() => {
        const cachedUser = localStorage.getItem('auth_user');
        if (cachedUser) {
            router.push('/');
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                localStorage.setItem('auth_user', JSON.stringify({
                    uid: user.uid,
                    email: user.email
                }));
                router.push('/');
            }
            setInitialAuthCheckDone(true);
        });

        return () => {
            unsubscribe();
            setInitialAuthCheckDone(false);
        };
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        
        if (!trimmedEmail || !trimmedPassword) {
            setError('Please fill in all fields');
            return;
        }

        setError('');
        setLoading(true);

        try {
            let userCredential;
            
            if (isRegistering) {
                userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
                console.log('Registration successful');
            } else {
                userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
                console.log('Login successful');
            }

            if (userCredential.user) {
                localStorage.setItem('auth_user', JSON.stringify({
                    uid: userCredential.user.uid,
                    email: userCredential.user.email
                }));
                
                setCookie('session', userCredential.user.stsTokenManager.accessToken, { maxAge: 60 * 60 * 24 });
            }

            setEmail('');
            setPassword('');
            router.push('/dashboard');
        } catch (err) {
            console.error('Auth error:', err.code, err.message);
            setError(getReadableError(err.code));
            localStorage.removeItem('auth_user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {isRegistering ? 'Create your account' : 'Sign in to your account'}
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : isRegistering ? (
                                    <>
                                        <UserPlus className="w-5 h-5 mr-2" />
                                        Register
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5 mr-2" />
                                        Sign in
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Toggle between Login and Register */}
                    <div className="mt-6">
                        <button
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setError('');
                                setEmail('');
                                setPassword('');
                            }}
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Register'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
