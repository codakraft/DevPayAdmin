// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
 apiKey: "AIzaSyBMUvvkwm1vtVnD58wKbQ_38SAf1KOVgW8",
  authDomain: "japaflex-system-prod.firebaseapp.com",
  projectId: "japaflex-system-prod",
  storageBucket: "japaflex-system-prod.firebasestorage.app",
  messagingSenderId: "459874533903",
  appId: "1:459874533903:web:c0817bdfadab60fd24d97a",
  measurementId: "G-NG2KMZV1Q3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
