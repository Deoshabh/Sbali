// Firebase Configuration and Initialization
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyCeJlh4NvXuFFAt_rpgdYnRpqLeE-LznNk",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "sbali-46feb.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sbali-46feb",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "sbali-46feb.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "86030091394",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:86030091394:web:9bdefdc12b0fccbe35a09b",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-HCDN6GPD3Q",
};

// Validate critical Firebase config (only on client — SSR will have undefined values
// since NEXT_PUBLIC_* is inlined at build time, which is fine for the server).
if (typeof window !== "undefined" && !firebaseConfig.apiKey) {
  console.error(
    "⚠️ Firebase API key is missing! Ensure NEXT_PUBLIC_FIREBASE_API_KEY " +
    "is set at BUILD TIME in your Dokploy/Nixpacks environment variables."
  );
}

// Initialize Firebase (singleton pattern — client-side only)
let app;
let auth;
let analytics;

if (typeof window !== "undefined") {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);

  // Analytics is only available in supported browser environments.
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      analytics = undefined;
    });
}

export { app, auth, analytics };
export default firebaseConfig;
