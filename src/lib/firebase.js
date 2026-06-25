import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Config is read from environment variables (see .env.example).
// Locally: copy .env.example to .env and fill in your values.
// On Vercel: set these same names under Project Settings -> Environment Variables.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const UNDEFINED_ENV = [
  ["apiKey", "VITE_FIREBASE_API_KEY"],
  ["authDomain", "VITE_FIREBASE_AUTH_DOMAIN"],
  ["projectId", "VITE_FIREBASE_PROJECT_ID"],
  ["storageBucket", "VITE_FIREBASE_STORAGE_BUCKET"],
  ["messagingSenderId", "VITE_FIREBASE_MESSAGING_SENDER_ID"],
  ["appId", "VITE_FIREBASE_APP_ID"],
].filter(([k]) => !firebaseConfig[k]);

if (UNDEFINED_ENV.length) {
  console.error(
    `[firebase.js] ${UNDEFINED_ENV.length} env var(s) missing — check .env or Vercel env vars:\n` +
      UNDEFINED_ENV.map(([, name]) => `  ${name}`).join("\n")
  );
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
