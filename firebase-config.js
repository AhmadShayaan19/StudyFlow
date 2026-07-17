

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDFmRfcKoB70rk5_nTUd36wgJS7_Soyd4o",
  authDomain: "studyflow-8b846.firebaseapp.com",
  projectId: "studyflow-8b846",
  storageBucket: "studyflow-8b846.firebasestorage.app",
  messagingSenderId: "465553104556",
  appId: "1:465553104556:web:55fe904babfb6aca664909",
  measurementId: "G-76W69T0Q7F"
};
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();


export const db = getFirestore(app);
