import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import './EBookDetailPage.css';

const EBookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchEbookDetail();
  }, [id]);

  const fetchEbookDetail = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/ebooks/${id}`);
      const ebookData = response.data.ebook;
      if (!ebookData.language) {
        ebookData.language = 'English';
      }
      setEbook(ebookData);

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const myEbooksRes = await API.get('/ebooks/my-ebooks', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const purchased = myEbooksRes.data.ebooks.some(e => e._id === id);
          setIsPurchased(purchased);
        } catch (err) {
          console.error('Error checking purchase:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching e-book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    navigate('/checkout/ebook', { state: { ebook } });
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out "${ebook?.title}" by ${ebook?.author}`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const getDiscountPercentage = () => {
    if (ebook?.originalPrice && ebook?.discountedPrice && ebook.originalPrice > ebook.discountedPrice) {
      return Math.round(((ebook.originalPrice - ebook.discountedPrice) / ebook.originalPrice) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="detail-loading-container">
        <div className="loading-content">
          <div className="loading-book">
            <div className="book-pages">
              <div className="page"></div>
              <div className="page"></div>
              <div className="page"></div>
            </div>
          </div>
          <p className="loading-text">Loading e-book details...</p>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="detail-error-container">
        <div className="error-content">
          <div className="error-icon">📭</div>
          <h2>E-Book Not Found</h2>
          <p>The e-book you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/ebooks')} className="error-btn">
            <span>← Back to Library</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ebook-detail-page">
      {/* Background Effects */}
      <div className="detail-bg-effects">
        <div className="bg-gradient-1"></div>
        <div className="bg-gradient-2"></div>
        <div className="bg-gradient-3"></div>
        <div className="bg-pattern"></div>
        <div className="floating-particles">
          <span className="particle"></span>
          <span className="particle"></span>
          <span className="particle"></span>
          <span className="particle"></span>
          <span className="particle"></span>
        </div>
      </div>

      {/* Back Button */}
      <button onClick={() => navigate('/browse-ebooks')} className="btn-back-modern">
        <span className="back-icon">←</span>
        <span className="back-text">Back to E-Books</span>
      </button>

      <div className="detail-main-container">
        {/* Left Section - Cover & Purchase */}
        <div className="detail-left-section">
          <div className="cover-wrapper">
            {/* Cover Card */}
            <div className="cover-card">
              <div className="cover-glow"></div>
              <div className="cover-border-glow"></div>
              
              {ebook.coverImage ? (
                <div className="cover-image-container">
                  <img 
                    src={ebook.coverImage} 
                    alt={ebook.title} 
                    className={`cover-image ${imageLoaded ? 'loaded' : ''}`}
                    onLoad={() => setImageLoaded(true)}
                  />
                  {!imageLoaded && <div className="cover-skeleton"></div>}
                </div>
              ) : (
                <div className="default-cover-modern">
                  <span className="default-icon">📖</span>
                  <span className="default-text">{ebook.title}</span>
                </div>
              )}

              {/* Badges */}
              {ebook.featured && (
                <div className="badge featured-badge">
                  <span className="badge-icon">⭐</span>
                  <span className="badge-text">Featured</span>
                  <div className="badge-shine"></div>
                </div>
              )}

              {getDiscountPercentage() > 0 && (
                <div className="badge discount-badge">
                  <span className="sparkle"></span>
                  <span className="sparkle"></span>
                  <span className="sparkle"></span>
                  <span className="discount-value">{getDiscountPercentage()}%</span>
                  <span className="discount-label">OFF</span>
                  <div className="discount-shine"></div>
                </div>
              )}
            </div>

            {/* Price Card */}
            <div className="price-card">
              <div className="price-card-glow"></div>
              <div className="price-header">
                <span className="price-label">Price</span>
                {getDiscountPercentage() > 0 && (
                  <span className="savings-badge">
                    <span className="savings-icon">🎉</span>
                    Save ₹{ebook.originalPrice - ebook.discountedPrice}
                  </span>
                )}
              </div>

              <div className="price-display">
                {getDiscountPercentage() > 0 ? (
                  <>
                    <span className="original-price">₹{ebook.originalPrice}</span>
                    <span className="current-price">₹{ebook.discountedPrice}</span>
                  </>
                ) : (
                  <span className="current-price">₹{ebook.price}</span>
                )}
              </div>

              {isPurchased ? (
                <button className="btn-owned" disabled>
                  <span className="owned-icon">✅</span>
                  <span className="owned-text">You Own This Book</span>
                </button>
              ) : (
                <button className="btn-purchase" onClick={handlePurchase}>
                  <span className="purchase-icon">🛒</span>
                  <span className="purchase-text">Buy Now</span>
                  <div className="btn-shine"></div>
                </button>
              )}

              <div className="guarantee-section">
                <div className="guarantee-item">
                  <span className="guarantee-icon">🔒</span>
                  <span>Secure Payment</span>
                </div>
                <div className="guarantee-item">
                  <span className="guarantee-icon">⚡</span>
                  <span>Instant Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Details */}
        <div className="detail-right-section">
          {/* Title Section */}
          <div className="title-section">
            <div className="title-badge">📚 E-Book</div>
            <h1 className="ebook-title">{ebook.title}</h1>
            <p className="ebook-author">
              <span className="author-prefix">by</span>
              <span className="author-name">{ebook.author}</span>
            </p>
          </div>

          {/* Meta Grid */}
          <div className="meta-grid">
            <div className="meta-card">
              <div className="meta-icon-wrapper">
                <span className="meta-icon">📂</span>
              </div>
              <div className="meta-info">
                <span className="meta-label">Category</span>
                <span className="meta-value">{ebook.category}</span>
              </div>
            </div>
            
            <div className="meta-card">
              <div className="meta-icon-wrapper">
                <span className="meta-icon">🌍</span>
              </div>
              <div className="meta-info">
                <span className="meta-label">Language</span>
                <span className="meta-value">{ebook.language}</span>
              </div>
            </div>
            
            <div className="meta-card">
              <div className="meta-icon-wrapper">
                <span className="meta-icon">📅</span>
              </div>
              <div className="meta-info">
                <span className="meta-label">Published</span>
                <span className="meta-value">
                  {new Date(ebook.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            
            <div className="meta-card">
              <div className="meta-icon-wrapper">
                <span className="meta-icon">📑</span>
              </div>
              <div className="meta-info">
                <span className="meta-label">Format</span>
                <span className="meta-value">PDF</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="description-card">
            <div className="section-header">
              <div className="section-icon-wrapper">
                <span className="section-icon">📝</span>
              </div>
              <h2 className="section-title">About This E-Book</h2>
            </div>
            <p className="description-text">{ebook.description}</p>
          </div>

          {/* Features */}
          <div className="features-card">
            <div className="section-header">
              <div className="section-icon-wrapper">
                <span className="section-icon">✨</span>
              </div>
              <h2 className="section-title">What You'll Get</h2>
            </div>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">📖</span>
                </div>
                <span className="feature-text">Complete digital book in PDF format</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">🔓</span>
                </div>
                <span className="feature-text">Lifetime access and unlimited downloads</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">💾</span>
                </div>
                <span className="feature-text">Download to any device you own</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">🔖</span>
                </div>
                <span className="feature-text">Bookmark and highlight support</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">📧</span>
                </div>
                <span className="feature-text">Instant delivery via email</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">🎧</span>
                </div>
                <span className="feature-text">Read offline, anywhere, anytime</span>
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className="share-card">
            <div className="section-header">
              <div className="section-icon-wrapper">
                <span className="section-icon">🔗</span>
              </div>
              <h2 className="section-title">Share This Book</h2>
            </div>
            <div className="share-buttons">
              <button 
                className="share-btn facebook"
                onClick={() => handleShare('facebook')}
              >
                <span className="share-icon">f</span>
                <span className="share-label">Facebook</span>
              </button>
              <button 
                className="share-btn twitter"
                onClick={() => handleShare('twitter')}
              >
                <span className="share-icon">𝕏</span>
                <span className="share-label">Twitter</span>
              </button>
              <button 
                className="share-btn whatsapp"
                onClick={() => handleShare('whatsapp')}
              >
                <span className="share-icon">💬</span>
                <span className="share-label">WhatsApp</span>
              </button>
              <button 
                className="share-btn copy"
                onClick={() => handleShare('copy')}
              >
                <span className="share-icon">{copied ? '✓' : '📋'}</span>
                <span className="share-label">{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EBookDetailPage;