// client/src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../utils/api';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const response = await API.post('/auth/forgot-password', { email });

      if (response.data.success) {
        setSubmitted(true);
        toast.success('✓ Password reset email sent!');
        
        // Redirect to login after 5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Failed to process password reset');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="forgot-password-card success-state">
            <div className="success-icon">✓</div>
            <h2>Password Reset Email Sent!</h2>
            
            <div className="success-message">
              <p>We've sent a temporary password to <strong>{email}</strong></p>
              <p>Check your inbox and spam folder for the email.</p>
            </div>

            <div className="next-steps-box">
              <h3>📋 What to do next:</h3>
              <ol>
                <li><strong>Check your email</strong> for the temporary password</li>
                <li><strong>Log in</strong> using the temporary password</li>
                <li><strong>Go to your profile</strong> (click your name in top right)</li>
                <li><strong>Open "Security & Data" tab</strong></li>
                <li><strong>Click "Change Password"</strong></li>
                <li><strong>Enter new password</strong> and save it</li>
              </ol>
            </div>

            <div className="security-tip">
              <strong>💡 Tip:</strong> Make sure to change your password immediately after logging in for security.
            </div>

            <Link to="/login" className="btn-back-to-login">
              ← Back to Login
            </Link>

            <p className="auto-redirect">Redirecting to login in 5 seconds...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <h1>🔐 Reset Your Password</h1>
            <p>Enter your email address and we'll send you a temporary password</p>
          </div>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Temporary Password'}
            </button>
          </form>

          <div className="info-box">
            <h4>📧 How it works:</h4>
            <ol>
              <li>Enter your email address</li>
              <li>We'll send you a temporary password</li>
              <li>Log in with the temporary password</li>
              <li>Change to your new password in your profile</li>
            </ol>
          </div>

          <div className="form-footer">
            <p>Remember your password? <Link to="/login">Go back to login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
