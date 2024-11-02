// app/auth/AuthContext.js
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/firebase/config';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userContainer, setUserContainer] = useState(null);
  const router = useRouter();
  const db = getFirestore();

  // Initialize or get user container
  const initializeUserContainer = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user container
        const containerData = {
          containerId: userId,
          createdAt: new Date().toISOString(),
          settings: {
            theme: 'light',
            notifications: true
          }
        };

        await setDoc(userDocRef, {
          email: user.email,
          container: containerData
        });

        setUserContainer(containerData);
      } else {
        setUserContainer(userDoc.data().container);
      }
    } catch (error) {
      console.error('Error initializing user container:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await initializeUserContainer(user.uid);
      } else {
        setUser(null);
        setUserContainer(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    userContainer,
    initializeUserContainer
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);