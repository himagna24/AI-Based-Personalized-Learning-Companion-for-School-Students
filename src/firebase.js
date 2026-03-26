// Firebase configuration check — used to determine offline vs Firebase mode.
// The actual Firebase SDK is loaded dynamically in AuthContext only when needed.

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';
const appId = import.meta.env.VITE_FIREBASE_APP_ID || '';

// Return true when ALL required Firebase fields look like real values (not placeholders)
export const isFirebaseConfigured = () =>
  apiKey.length > 20 &&
  !apiKey.startsWith('your_') &&
  !!projectId &&
  !projectId.startsWith('your_') &&
  appId.length > 10 &&
  !appId.startsWith('your_');

// These are null by default — Firebase is only initialized in AuthContext via dynamic imports
export const app  = null;
export const auth = null;
export const db   = null;
export default null;
