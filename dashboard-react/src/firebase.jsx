
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Assuming you use Auth
import { getFirestore } from "firebase/firestore"; // <-- Add this import!
// Import other services as needed (Storage, Functions, etc.)

// Your web app's Firebase configuration
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

// Get service instances
const auth = getAuth(app); // Get Auth instance
const db = getFirestore(app); // <-- (use this whenever you need to pull or insert data)

// Export the app and the service instances so other files can use them
export { app, auth, db };
