import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDXduFWAAcqYDB0BnVso-WSWPaLhOuUu84",
    authDomain: "visamasterr-11d5d.firebaseapp.com",
    projectId: "visamasterr-11d5d",
    storageBucket: "visamasterr-11d5d.firebasestorage.app",
    messagingSenderId: "1085062759850",
    appId: "1:1085062759850:web:e5d183aa1dd8ee053f17d3",
    measurementId: "G-NR9EHNXX8L"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let analytics;

if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
