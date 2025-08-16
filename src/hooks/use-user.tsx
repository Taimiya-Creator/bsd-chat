
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string;
  role: string;
  class?: number;
  photoURL?: string;
}

interface UserContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null | undefined;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, loadingAuth] = useAuthState(auth);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loadingAuth) {
      setIsLoading(true);
      return;
    }
    if (!firebaseUser) {
      setAppUser(null);
      setIsLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setAppUser({ uid: docSnap.id, ...docSnap.data() } as AppUser);
        } else {
          // Fallback if doc doesn't exist, though it should after signup
           setAppUser({
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'User',
              email: firebaseUser.email,
              role: 'student', // Default role
              photoURL: firebaseUser.photoURL,
            });
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching user data:", error);
        setAppUser(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser, loadingAuth]);

  const value = {
    user: appUser,
    firebaseUser,
    isLoading: isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
