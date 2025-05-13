// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFOBPlkUXWazJ7ubY1GoBiGroFm59fUtA",
  authDomain: "skillwave-aa8c9.firebaseapp.com",
  projectId: "skillwave-aa8c9",
  storageBucket: "skillwave-aa8c9.firebasestorage.app",
  messagingSenderId: "679129927772",
  appId: "1:679129927772:web:f6426333daa3e38e2bd699",
  measurementId: "G-FX1YD3HP3M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const  auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export {auth, provider, db, app}