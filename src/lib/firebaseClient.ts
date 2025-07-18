import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDG75Pp9xnJBuBEnzf8gb4XXWKxKy6hSLA",
  authDomain: "my-course-managment-website.firebaseapp.com",
  projectId: "my-course-managment-website",
  storageBucket: "my-course-managment-website.appspot.com",
  messagingSenderId: "631664219620",
  appId: "1:631664219620:web:e664b497458b668b2263f1",
  measurementId: "G-3CLK6D43DT"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const firebaseAuth = getAuth();
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup }; 