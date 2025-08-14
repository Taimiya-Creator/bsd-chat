'use client';

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDLw47EiWI4pFPhQd0WuUCSp7ZxC-DzYKs",
  authDomain: "bsdchat-78e02.firebaseapp.com",
  projectId: "bsdchat-78e02",
  storageBucket: "bsdchat-78e02.appspot.com",
  messagingSenderId: "635105284266",
  appId: "1:635105284266:web:39a4f381e0e258662c80d3",
  measurementId: "G-ND6Y7L1PMY"
};

// Initialize Firebase
export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
