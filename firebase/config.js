import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);