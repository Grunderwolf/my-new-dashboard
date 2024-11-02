// app/firebase/config.js
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
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

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Get Auth instance
const auth = getAuth(app);

// Set auth persistence to local to reduce re-authentication needs
if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.error('Auth persistence error:', error);
    });
}

// Get Firestore instance
const db = getFirestore(app);

export { auth, db };
export default app;