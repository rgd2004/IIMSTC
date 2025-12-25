import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EBookCheckoutPage.css';

const EBookCheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({
    email: '',
    name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (location.state?.ebook) {
      setEbook(location.state.ebook);
    }

    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserDetails({
        email: userData.email || '',
        name: userData.name || '',
        phone: userData.phone || ''
      });
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async () => {
    try {
      if (!userDetails.email || !userDetails.name) {
        setError('Please fill in all required fields');
        return;
      }

      if (!agreedToTerms) {
        setError('Please agree to the terms and conditions');
        return;
      }

      setLoading(true);
      setError('');

      const response = await axios.post('/api/ebooks/purchase/create', {
        ebookId: ebook._id,
        email: userDetails.email,
        name: userDetails.name,
        phone: userDetails.phone
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const { order, razorpayKey } = response.data;

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: 'PKC CAG - E-Books',
        description: `Purchase: ${ebook.title}`,
        order_id: order.id,
        image: ebook.coverImage || '/logo.png',
        handler: function (response) {
          verifyPayment(response, order.id);
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone
        },
        theme: {
          color: '#4f7cff'
        },
        modal: {
          ondismiss: function () {
            setError('Payment cancelled');
            setLoading(false);
          }
        }
      };

      if (window.Razorpay) {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        setError('Payment gateway not available');
      }
    } catch (err) {
      console.error('Error initiating payment:', err);
      setError(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentResponse, orderId) => {
    try {
      setLoading(true);

      const response = await axios.post('/api/ebooks/purchase/verify', {
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpaySignature: paymentResponse.razorpay_signature,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      navigate('/payment-success/ebook', { 
        state: { 
          purchase: response.data.purchase,
          ebook: response.data.ebook
        } 
      });
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError(err.response?.data?.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!ebook) {
    return (
      <div className="checkout-loading-screen">
        <div className="loading-spinner-checkout">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <span className="loading-emoji">💳</span>
        </div>
        <p className="loading-message">Preparing checkout...</p>
      </div>
    );
  }

  const gstAmount = (ebook.price * 0.18).toFixed(2);
  const totalAmount = (ebook.price * 1.18).toFixed(2);

  return (
    <div className="checkout-page-wrapper">
      {/* Background Elements */}
      <div className="checkout-background">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
        <div className="floating-shapes">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="shape" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 8}s`
            }}></div>
          ))}
        </div>
      </div>

      <div className="checkout-container-main">
        {/* Back Button */}
        <button className="back-to-browse" onClick={() => navigate('/browse-ebooks')}>
          <span className="back-arrow">←</span>
          <span className="back-label">Back to Browse</span>
        </button>

        <div className="checkout-grid">
          {/* LEFT: Order Summary */}
          <div className="checkout-section order-summary-section">
            <div className="section-header">
              <div className="section-icon">📦</div>
              <h2 className="section-title">Order Summary</h2>
            </div>

            <div className="summary-card">
              <div className="ebook-preview">
                <div className="preview-image">
                  {ebook.coverImage ? (
                    <img src={ebook.coverImage} alt={ebook.title} />
                  ) : (
                    <div className="preview-placeholder">
                      <span className="placeholder-icon">📖</span>
                    </div>
                  )}
                  <div className="image-overlay">
                    <span className="digital-badge">Digital</span>
                  </div>
                </div>

                <div className="preview-details">
                  <h3 className="ebook-title">{ebook.title}</h3>
                  <p className="ebook-author">
                    <span className="author-icon">✍️</span>
                    {ebook.author}
                  </p>
                  <div className="ebook-meta">
                    <span className="meta-badge">{ebook.category}</span>
                    <span className="meta-info">📄 {ebook.pages} pages</span>
                  </div>
                </div>
              </div>

              <div className="price-breakdown-wrapper">
                <div className="breakdown-header">
                  <span className="breakdown-icon">💰</span>
                  <h4>Price Breakdown</h4>
                </div>

                <div className="breakdown-list">
                  <div className="breakdown-item">
                    <span className="item-label">E-Book Price</span>
                    <span className="item-value">₹{ebook.price}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="item-label">GST (18%)</span>
                    <span className="item-value">₹{gstAmount}</span>
                  </div>

                  <div className="breakdown-divider"></div>

                  <div className="breakdown-item total-item">
                    <span className="item-label">Total Amount</span>
                    <span className="item-value total-value">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="security-badges">
                <div className="security-badge">
                  <span className="badge-icon">🔒</span>
                  <span className="badge-text">Secure Payment</span>
                </div>
                <div className="security-badge">
                  <span className="badge-icon">✅</span>
                  <span className="badge-text">Encrypted</span>
                </div>
                <div className="security-badge">
                  <span className="badge-icon">⚡</span>
                  <span className="badge-text">Instant Access</span>
                </div>
              </div>

              <div className="razorpay-powered">
                <span className="powered-text">Powered by</span>
                <span className="razorpay-logo">Razorpay</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Checkout Form */}
          <div className="checkout-section checkout-form-section">
            <div className="section-header">
              <div className="section-icon">💳</div>
              <h2 className="section-title">Payment Details</h2>
            </div>

            {error && (
              <div className="alert-banner error-banner">
                <span className="alert-icon">⚠️</span>
                <span className="alert-message">{error}</span>
                <button className="alert-close" onClick={() => setError('')}>✕</button>
              </div>
            )}

            <form className="payment-form" onSubmit={(e) => {
              e.preventDefault();
              handlePayment();
            }}>
              {/* Personal Information */}
              <div className="form-block">
                <div className="block-header">
                  <span className="block-icon">👤</span>
                  <h3 className="block-title">Personal Information</h3>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="name" className="field-label">
                      Full Name <span className="required-star">*</span>
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">👤</span>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={userDetails.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="email" className="field-label">
                      Email Address <span className="required-star">*</span>
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">📧</span>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={userDetails.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        className="form-input"
                        required
                      />
                    </div>
                    <p className="field-hint">Your e-book will be sent to this email</p>
                  </div>

                  <div className="form-field">
                    <label htmlFor="phone" className="field-label">
                      Phone Number <span className="optional-tag">(Optional)</span>
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">📱</span>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={userDetails.phone}
                        onChange={handleInputChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-block">
                <div className="block-header">
                  <span className="block-icon">💰</span>
                  <h3 className="block-title">Payment Method</h3>
                </div>

                <div className="payment-methods-grid">
                  <label className="payment-method-option active">
                    <input type="radio" name="payment" value="razorpay" defaultChecked />
                    <div className="option-content">
                      <span className="option-icon">💳</span>
                      <div className="option-text">
                        <span className="option-title">Card / UPI / Wallet</span>
                        <span className="option-subtitle">Via Razorpay</span>
                      </div>
                      <span className="option-checkmark">✓</span>
                    </div>
                  </label>
                </div>

                <div className="payment-info-box">
                  <span className="info-icon">ℹ️</span>
                  <p className="info-text">
                    After clicking "Pay Now", you'll be redirected to Razorpay's secure payment gateway 
                    where you can choose your preferred payment method.
                  </p>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="form-block">
                <label className="checkbox-field">
                  <input 
                    type="checkbox" 
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    required 
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label">
                    I agree to the <a href="/terms" target="_blank">Terms & Conditions</a> and 
                    <a href="/privacy" target="_blank"> Privacy Policy</a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="submit-payment-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span className="btn-icon">💳</span>
                    <span>Pay ₹{totalAmount}</span>
                    <span className="btn-arrow">→</span>
                  </>
                )}
                <div className="btn-shine"></div>
              </button>

              {/* Alternative Actions */}
              <div className="alternative-actions">
                <button 
                  type="button" 
                  className="secondary-btn"
                  onClick={() => navigate('/browse-ebooks')}
                >
                  <span>←</span> Continue Shopping
                </button>
              </div>
            </form>

            {/* Support Section */}
            <div className="support-box">
              <div className="support-icon">💬</div>
              <div className="support-content">
                <h4 className="support-title">Need Help?</h4>
                <p className="support-text">Our support team is here to assist you</p>
                <a href="mailto:support@pkccag.com" className="support-link">
                  support@pkccag.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EBookCheckoutPage;
