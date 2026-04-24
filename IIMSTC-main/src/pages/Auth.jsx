import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone } from 'lucide-react';
import OTPVerification from '../components/OTPVerification';
import { sendOTPEmail, completeSignup } from '../services/emailService';
import { generateOTP, storeOTPTemporarily } from '../utils/otpUtils';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showOTP, setShowOTP] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignupWithOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send OTP
      const result = await sendOTPEmail(email, 'user');
      if (result.success) {
        setShowOTP(true);
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Error sending OTP. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = async (verifiedEmail) => {
    try {
      // Complete signup
      const result = await completeSignup({
        name,
        email: verifiedEmail,
        password,
        phone
      });

      if (result.success) {
        // Call the auth context signup function
        signup(name, verifiedEmail, password, phone);
        navigate('/');
      } else {
        setError(result.message || 'Failed to complete signup');
      }
    } catch (err) {
      setError('Error completing signup. Please try again.', err);
      setShowOTP(false);
    }
  };

  const handleResendOTP = async (verifiedEmail) => {
    try {
      const result = await sendOTPEmail(verifiedEmail, 'user');
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError('Error resending OTP. Please try again.');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const loggedUser = login(email, password);

    if (!loggedUser) {
      setError('Invalid admin credentials. Please try again.');
      setLoading(false);
      return;
    }

    if (loggedUser.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  if (showOTP) {
    return (
      <div className="container animate-fade-up perspective-container" style={{ maxWidth: '500px', marginTop: '4rem', marginBottom: '4rem' }}>
        <OTPVerification 
          email={email} 
          onVerified={handleOTPVerified}
          onResend={handleResendOTP}
          userType="user"
        />
      </div>
    );
  }

  return (
    <div className="container animate-fade-up perspective-container" style={{ maxWidth: '500px', marginTop: '4rem', marginBottom: '4rem' }}>
      <div className="glass-panel preserve-3d" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', transform: 'translateZ(20px)' }}>
          {isLogin ? 'Welcome Back' : 'Join Us'}
        </h1>
        <p className="text-muted" style={{ marginBottom: '2.5rem', transform: 'translateZ(10px)' }}>
          {isLogin ? 'Login to continue exploring authentic crafts.' : 'Create an account to support rural artisans.'}
        </p>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : handleSignupWithOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', transform: 'translateZ(30px)' }}>
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
              <input 
                type="text" 
                placeholder="Full Name" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '3rem', width: '100%' }}
                disabled={loading}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '3rem', width: '100%' }}
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <Phone style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                required 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '3rem', width: '100%' }}
                disabled={loading}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '3rem', width: '100%' }}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', marginTop: '1rem', fontSize: '1.1rem' }} disabled={loading}>
            {loading ? (isLogin ? 'Logging in...' : 'Sending OTP...') : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <p style={{ marginTop: '2rem', transform: 'translateZ(10px)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ 
              background: 'none', border: 'none', color: 'var(--color-primary)', 
              fontWeight: 600, cursor: 'pointer', outline: 'none' 
            }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
