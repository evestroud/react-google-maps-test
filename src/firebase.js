// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqE9AzzkycrW4qt_pxQLOU7Od-jFS8EKA",
  authDomain: "simple-map-60653.firebaseapp.com",
  projectId: "simple-map-60653",
  storageBucket: "simple-map-60653.appspot.com",
  messagingSenderId: "103498528816",
  appId: "1:103498528816:web:e655cca2382cf3afda95f5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app)
