// app/hooks/useFirebaseAuth.js
import { useState, useEffect } from 'react';
//import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
// app/hooks/useFirebaseAuth.js
import { auth } from '@/app/firebase/config';  // Updated path

export function useFirebaseAuth() {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        isLoading: true,
        user: null
    });

    useEffect(() => {
        // Use local storage to cache auth state
        const cachedUser = localStorage.getItem('authUser');
        if (cachedUser) {
            setAuthState({
                isAuthenticated: true,
                isLoading: false,
                user: JSON.parse(cachedUser)
            });
        }

        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Cache user data in localStorage
                localStorage.setItem('authUser', JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName
                }));
            } else {
                localStorage.removeItem('authUser');
            }

            setAuthState({
                isAuthenticated: !!user,
                isLoading: false,
                user
            });
        });

        // Cleanup subscription and cache
        return () => {
            unsubscribe();
        };
    }, []);

    return authState;
}