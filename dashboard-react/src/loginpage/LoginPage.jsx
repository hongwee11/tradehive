import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './loginPage.css';
import { auth } from '../firebase'; // Ensure you have initialized Firebase in this file
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';


function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
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

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      alert('Please enter your email address');
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      alert('Error sending password reset email: ' + error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setResetEmail('');
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
          
          {/* Forgot Password Link */}
          <button 
            className="forgot-password-link"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot Password?
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Reset Password</h2>
              <button 
                className="close-btn"
                onClick={closeForgotPasswordModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Enter your email address and we'll send you a link to reset your password.</p>
              <input
                type="email"
                placeholder="Enter your email"
                className="input-field"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button 
                className="action-btn cancel-btn"
                onClick={closeForgotPasswordModal}
              >
                Cancel
              </button>
              <button 
                className="action-btn"
                onClick={handleForgotPassword}
                disabled={resetLoading}
              >
                {resetLoading ? 'Sending...' : 'Send Reset Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .forgot-password-link {
          background: none;
          border: none;
          color: #4a9eff;
          cursor: pointer;
          font-size: 14px;
          margin-top: 15px;
          text-decoration: underline;
          transition: color 0.2s ease;
        }

        .forgot-password-link:hover {
          color: #3a8eef;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: #1E1F3B;
          border-radius: 12px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          color: white;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px 0 24px;
          border-bottom: 1px solid #2A2C4D;
          margin-bottom: 20px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: white;
        }

        .close-btn {
          background: none;
          border: none;
          color: #999;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .close-btn:hover {
          background-color: #2A2C4D;
          color: white;
        }

        .modal-body {
          padding: 0 24px 20px 24px;
        }

        .modal-body p {
          margin-bottom: 15px;
          color: #b0b8d1;
          line-height: 1.4;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          padding: 0 24px 24px 24px;
          justify-content: flex-end;
        }

        .cancel-btn {
          background-color: #6b7280;
        }

        .cancel-btn:hover {
          background-color: #5b6370;
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );  
}

export default LoginPage;
