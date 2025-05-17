console.log('Script loaded successfully! Ready to build!');


//Firebase configuration
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAexmdZbQHchTeluN-DUcXrP20yzFFUzOQ",
  authDomain: "tradehive-669db.firebaseapp.com",
  projectId: "tradehive-669db",
  storageBucket: "tradehive-669db.firebasestorage.app",
  messagingSenderId: "187487667012",
  appId: "1:187487667012:web:4d2d2acc9d9c90551f4d11",
  measurementId: "G-ZJN18NGJ5W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Login with email and password
document.getElementById('loginBtn').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert('Login successful!');
    })
    .catch((error) => {
      alert('Login failed: ' + error.message);
    });
});

// Sign up with email and password
document.getElementById('signupBtn').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert('Signup successful!');
    })
    .catch((error) => {
      alert('Signup failed: ' + error.message);
    });
});