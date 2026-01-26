import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';
import './AuthPages.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    referralCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Prefill referralCode from URL query param
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const ref = params.get('ref');
      if (ref && ref.trim() !== '') {
        setFormData((f) => ({ ...f, referralCode: ref.trim() }));
      }
    } catch (err) {
      // ignore
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Name, email, and password are required');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone?.trim() || '',
      };

      if (formData.referralCode && formData.referralCode.trim() !== '') {
        payload.referralCode = formData.referralCode.trim();
      }

      console.log('📝 Sending registration request:', { name: payload.name, email: payload.email });
      const response = await authAPI.register(payload);

      if (response.data.success) {
        console.log('✓ Registration successful, userId:', response.data.userId);
        toast.success('Registration successful! Please verify your email.');
        navigate('/verify-otp', { state: { userId: response.data.userId, email: formData.email } });
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const googleUrl = `${process.env.REACT_APP_API_URL}/auth/google`;
    console.log("🔐 Google Signup Initiating");
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
            <h1>Get Started</h1>
            <p>Create your PKC CAG account</p>
          </div>

          <button className="google-btn" onClick={handleGoogleSignup}>
            <i className="fab fa-google" />
            Sign up with Google
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">
                <i className="fas fa-user"></i>
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>

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
                  placeholder="Create a password (min 6 characters)"
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

            <div className="form-group">
              <label htmlFor="phone">
                <i className="fas fa-phone"></i>
                Phone (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="referralCode">
                <i className="fas fa-gift"></i>
                Referral Code (Optional)
              </label>
              <input
                id="referralCode"
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                placeholder="Enter referral code (if any)"
              />
              <small className="helper-text">
                <i className="fas fa-info-circle"></i>
                If you have a referral code, enter it here to be associated to the referrer.
              </small>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Creating account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>

        {/* Features Side Panel */}
        <div className="auth-features">
          <h2>Join PKC CAG Today</h2>
          <div className="feature-item">
            <i className="fas fa-rocket"></i>
            <div>
              <h3>Quick Setup</h3>
              <p>Get started in less than 2 minutes</p>
            </div>
          </div>
          <div className="feature-item">
            <i className="fas fa-gift"></i>
            <div>
              <h3>Referral Rewards</h3>
              <p>Earn rewards by referring friends</p>
            </div>
          </div>
          <div className="feature-item">
            <i className="fas fa-headset"></i>
            <div>
              <h3>24/7 Support</h3>
              <p>Our team is always here to help you</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;