console.log('Script loaded successfully! Ready to build!');


//Firebase configuration

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
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const auth = firebase.auth();

// Login with email and password
document.getElementById('loginBtn').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "../dashboard/dashboard.html";
    })
    .catch((error) => {
      alert('Login failed: ' + error.message);
    });
});

// Sign up with email and password
document.getElementById('signupBtn').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert('Signup successful!');
    })
    .catch((error) => {
      alert('Signup failed: ' + error.message);
    });
});