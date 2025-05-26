import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './loginPage.css';
import { auth } from '../firebase'; // Ensure you have initialized Firebase in this file
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';


function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigate('/dashboard');
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
