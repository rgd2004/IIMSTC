import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData(s => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('📧 Attempting login with:', { email: formData.email });
      console.log('🌐 API URL:', process.env.REACT_APP_API_URL);
      const res = await authAPI.login(formData);
      console.log('✅ Login response:', res.data);

      if (res.data.success) {
        login(res.data.token, res.data.user);
        toast.success('Login successful!');
        navigate('/dashboard');
        return;
      }

      if (res.data.requiresVerification) {
        toast.error('Verify your email first!');
        navigate('/verify-otp', { state: { userId: res.data.userId } });
        return;
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const googleUrl = `${process.env.REACT_APP_API_URL}/auth/google`;
    console.log("🔐 Google Login Initiating");
    console.log("   URL:", googleUrl);
    console.log("   API Base:", process.env.REACT_APP_API_URL);
    window.location.href = googleUrl;
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-shape shape-1"></div>
        <div className="auth-shape shape-2"></div>
        <div className="auth-shape shape-3"></div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          {/* Logo Section */}
          <div className="auth-logo">
            <img
              src="https://res.cloudinary.com/dgrpzfiz7/image/upload/v1765725814/logo_hhyaop.jpg"
              alt="PKC CAG"
              className="auth-logo-img"
            />
          </div>

          <div className="auth-header">
            <h1>Welcome Back!</h1>
            <p>Login to continue to PKC CAG</p>
          </div>

          <button className="google-btn" onClick={handleGoogleLogin}>
            <i className="fab fa-google" />
            Continue with Google
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i>
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="forgot-password-link">
              <Link to="/forgot-password">
                <i className="fas fa-question-circle"></i>
                Forgot your password?
              </Link>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Logging in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Login
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register">Register here</Link>
            </p>
          </div>
        </div>

        {/* Features Side Panel (Optional - visible on larger screens) */}
        <div className="auth-features">
          <h2>Why Choose PKC CAG?</h2>
          <div className="feature-item">
            <i className="fas fa-star"></i>
            <div>
              <h3>Trusted by 500+ Businesses</h3>
              <p>Join our growing community of satisfied clients</p>
            </div>
          </div>
          <div className="feature-item">
            <i className="fas fa-shield-alt"></i>
            <div>
              <h3>100% Secure & Safe</h3>
              <p>Your data is protected with enterprise-grade security</p>
            </div>
          </div>
          <div className="feature-item">
            <i className="fas fa-rocket"></i>
            <div>
              <h3>Fast Delivery</h3>
              <p>Get results within 24-72 hours guaranteed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;