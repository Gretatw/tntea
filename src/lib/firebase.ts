import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);

// Helper to bootstrap an admin user - for development/demo
export const checkAndCreateUserRole = async (uid: string, email: string | null) => {
  if (!email) return;
  const roleRef = doc(db, 'userRoles', uid);
  const roleSnap = await getDoc(roleRef);
  if (!roleSnap.exists()) {
     // Usually, we wouldn't set this from the client for security, but we don't have a backend.
     // By default we won't let users make themselves admin, so the rule `allow write: if false;` applies.
     // To test the admin panel, you'd need to manually create the userRoles doc via the Firebase Console:
     // https://console.firebase.google.com/project/gen-lang-client-0226070929/firestore/databases/ai-studio-4b484882-0792-457e-b6ad-e6ee9c5bb923/data
  }
};
