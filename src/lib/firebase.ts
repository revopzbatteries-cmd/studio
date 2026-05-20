import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Define the Firebase configuration using environment variables
// These variables must be set in the .env.local file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Initialize Firebase App
 * We check if an app instance already exists to avoid duplicate initializations,
 * which is especially important in Next.js development with Fast Refresh.
 */
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/**
 * Configure Firebase Authentication
 * Exporting the auth instance for use across the application,
 * particularly for features like Phone OTP verification.
 */
const auth: Auth = getAuth(app);

/**
 * Configure Firestore
 * Exporting the Firestore database instance.
 */
const db: Firestore = getFirestore(app);

// Exporting reusable instances to maintain a clean and scalable architecture
export { app, auth, db };
