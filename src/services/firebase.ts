import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged,
  User as FirebaseUser,
  signInAnonymously
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForDevelopment12345",
  authDomain: "lumira-academic.firebaseapp.com",
  projectId: "lumira-academic",
  storageBucket: "lumira-academic.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn("Google popup login failed, falling back to guest scholar mode:", error);
    const guestResult = await signInAnonymously(auth);
    return guestResult.user;
  }
};

export const loginAsGuest = async () => {
  return (await signInAnonymously(auth)).user;
};

export const logout = async () => {
  return await fbSignOut(auth);
};

export const onAuthStateChanged = (cb: (user: FirebaseUser | null) => void) => {
  return fbOnAuthStateChanged(auth, cb);
};

export { type FirebaseUser };
