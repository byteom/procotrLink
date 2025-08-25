// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxNrPzv3KY5CIAj275BOaJbBmuhzRTEmc",
  authDomain: "steel-ridge-437016-h3.firebaseapp.com",
  projectId: "steel-ridge-437016-h3",
  storageBucket: "steel-ridge-437016-h3.appspot.com",
  messagingSenderId: "468926585357",
  appId: "1:468926585357:web:bf1d70991b3e52d405d344",
  measurementId: "G-4SDK14BP5Y"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
