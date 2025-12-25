import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../pages/PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { purchase, ebook } = location.state || {};

  useEffect(() => {
    if (!purchase || !ebook) {
      navigate('/');
    }
  }, [purchase, ebook, navigate]);

  if (!purchase || !ebook) {
    return null;
  }

  return (
    <div className="payment-success-page">
      <div className="success-container">
        {/* Success Icon */}
        <div className="success-icon">✅</div>

        {/* Success Message */}
        <h1>Payment Successful!</h1>
        <p className="subtitle">Thank you for your purchase</p>

        {/* Order Details */}
        <div className="order-details-card">
          <div className="detail-row">
            <span className="label">E-Book:</span>
            <span className="value">{ebook.title}</span>
          </div>
          <div className="detail-row">
            <span className="label">Author:</span>
            <span className="value">{ebook.author}</span>
          </div>
          <div className="detail-row">
            <span className="label">Amount Paid:</span>
            <span className="value">₹{purchase.amount}</span>
          </div>
          <div className="detail-row">
            <span className="label">Transaction ID:</span>
            <span className="value">{purchase.transactionId}</span>
          </div>
          <div className="detail-row">
            <span className="label">Payment Status:</span>
            <span className="value status-badge">{purchase.paymentStatus}</span>
          </div>
        </div>

        {/* Info Message */}
        <div className="info-box">
          <div className="info-icon">📧</div>
          <p>
            Your e-book has been sent to your email address. 
            <strong> Check your inbox and spam folder</strong> for the download link.
          </p>
        </div>

        {/* Key Information */}
        <div className="key-info">
          <div className="info-item">
            <span className="info-icon-small">📚</span>
            <div>
              <p className="info-title">Access Your E-Book Anytime</p>
              <p className="info-desc">Visit your library to download and read</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon-small">📥</span>
            <div>
              <p className="info-title">Lifetime Access</p>
              <p className="info-desc">You own this e-book forever</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon-small">💬</span>
            <div>
              <p className="info-title">Leave A Review</p>
              <p className="info-desc">Share your thoughts about the e-book</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="btn-primary"
            onClick={() => navigate('/my-ebooks')}
          >
            📚 Go to My E-Books
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate(`/ebook/${ebook._id}`)}
          >
            👁️ View Book Details
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/ebooks')}
          >
            🛒 Continue Shopping
          </button>
        </div>

        {/* Support */}
        <div className="support-box">
          <p>Need help? <a href="mailto:support@pkccag.com">Contact our support team</a></p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
