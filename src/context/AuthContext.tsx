import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User, 
  signInWithPopup, 
  signInAnonymously, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signInAsGuest: () => Promise<User | null>;
  signInWithEmail: (email: string, pass: string) => Promise<User | null>;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<User | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      return res.user;
    } catch (err: any) {
      console.warn("Google sign in popup failed or cancelled, trying anonymous/guest:", err);
      try {
        const res = await signInAnonymously(auth);
        return res.user;
      } catch (guestErr) {
        console.error("Guest login also failed:", guestErr);
        throw err;
      }
    }
  };

  const signInAsGuest = async (): Promise<User | null> => {
    const res = await signInAnonymously(auth);
    return res.user;
  };

  const signInWithEmail = async (email: string, pass: string): Promise<User | null> => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    return res.user;
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string): Promise<User | null> => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user && displayName) {
      await updateProfile(res.user, { displayName });
    }
    return res.user;
  };

  const signOut = async (): Promise<void> => {
    await fbSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInAsGuest,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
