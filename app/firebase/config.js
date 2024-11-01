// app/firebase/config.js
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAsTcU2NZx_z5dtOceJexIq0nbT0i-NrdQ",
    authDomain: "dream-goals-tracker.firebaseapp.com",
    projectId: "dream-goals-tracker",
    storageBucket: "dream-goals-tracker.appspot.com",
    messagingSenderId: "579988689947",
    appId: "1:579988689947:web:d1e97c15749eab07fe14be",
    measurementId: "G-9ECXCKXBQT"
};

// Initialize Firebase only if no apps exist
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore with optimized settings
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Only run persistence initialization in browser environment
if (typeof window !== 'undefined') {
    // Enable Firestore persistence with optimized settings
    enableMultiTabIndexedDbPersistence(db, {
        synchronizeTabs: true,
        cacheSizeBytes: 5242880 // 5MB cache size
    }).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Firestore persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
            console.warn('Firestore persistence not supported');
        }
    });

    // Set auth persistence to local to reduce re-authentication needs
    setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.error('Auth persistence error:', error);
    });
}

export { db, auth };