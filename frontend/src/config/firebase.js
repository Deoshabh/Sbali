// Firebase Configuration and Initialization
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "",
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
let analyticsInitPromise;

if (typeof window !== "undefined") {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
}

// Lazily initialize analytics only when explicitly requested.
export async function initFirebaseAnalytics() {
  if (typeof window === "undefined" || !app) {
    return undefined;
  }
  if (analytics) {
    return analytics;
  }
  if (analyticsInitPromise) {
    return analyticsInitPromise;
  }

  analyticsInitPromise = import("firebase/analytics")
    .then(async ({ getAnalytics, isSupported }) => {
      const supported = await isSupported();
      analytics = supported ? getAnalytics(app) : undefined;
      return analytics;
    })
    .catch(() => {
      analytics = undefined;
      return analytics;
    })
    .finally(() => {
      analyticsInitPromise = undefined;
    });

  return analyticsInitPromise;
}

export { app, auth, analytics };
export default firebaseConfig;
