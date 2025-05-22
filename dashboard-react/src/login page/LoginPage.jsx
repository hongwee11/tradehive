import React, { useState } from 'react';
import './loginPage.css';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAexmdZb0HchetLuN-DUcXrP29yzFFUzOQ",
    authDomain: "tradehive-669db.firebaseapp.com",
    projectId: "tradehive-669db",
    storageBucket: "tradehive-669db.appspot.com",
    messagingSenderId: "187487667012",
    appId: "1:187487667012:web:4d2d2acc9d9c90551f4d11",
    measurementId: "G-ZJN8NGJ5W"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
const auth = getAuth(app);

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        window.location.href = "/dashboard";
      })
      .catch((error) => {
        alert('Login failed: ' + error.message);
      });
  };

  const handleSignup = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert('Signup successful!');
      })
      .catch((error) => {
        alert('Signup failed: ' + error.message);
      });
  };

  return (
    <div className="page-wrapper">
      <div className="login-box">
        <img src="/tradehive.png" alt="TradeHive Logo" className="logo" />
        <h1>Welcome to TradeHive!</h1>
        <div className="login-container">
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="action-btn" onClick={handleLogin}>Login</button>
          <button className="action-btn" onClick={handleSignup}>Sign Up</button>
        </div>
      </div>
    </div>
  );  
}

export default LoginPage;
