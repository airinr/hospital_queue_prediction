// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjzrjElyfSJfbWpNcjqsZfzPPxa5UEZJ4",
  authDomain: "hospital-queue-bpjs.firebaseapp.com",
  projectId: "hospital-queue-bpjs",
  storageBucket: "hospital-queue-bpjs.firebasestorage.app",
  messagingSenderId: "20168402822",
  appId: "1:20168402822:web:326a3807e117940fd9ae07",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(
  app,
  "https://hospital-queue-bpjs-default-rtdb.asia-southeast1.firebasedatabase.app"
);
