import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCE5swffVTQossTwVwYS7sHd4DT1qu9Mbo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "movieslogins-1d94e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "movieslogins-1d94e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "movieslogins-1d94e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "671707144859",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:671707144859:web:6fa3eddce66a35304a9c3e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FC1TCPFRS8",
};

// Accounts stay optional: without real credentials the site runs in
// browse-only mode instead of crashing at startup.
export const isFirebaseConfigured = firebaseConfig.projectId !== "not-configured";

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
