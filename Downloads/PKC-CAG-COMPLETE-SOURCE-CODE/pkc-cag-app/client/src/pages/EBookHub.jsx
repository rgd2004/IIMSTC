import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/EBookHub.css';

const EBookHub = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ browse: 0, library: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const ebooksRes = await axios.get('/api/ebooks');
      const browseCount = ebooksRes.data.ebooks?.length || 0;

      let libraryCount = 0;
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const myEbooksRes = await axios.get('/api/ebooks/my-ebooks', {
            headers: { Authorization: `Bearer ${token}` }
          });
          libraryCount = myEbooksRes.data.ebooks?.length || 0;
        }
      } catch (err) {
        console.warn('Could not fetch library count');
      }

      setStats({ browse: browseCount, library: libraryCount });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ebook-hub-wrapper">
      {/* Animated Background */}
      <div className="hub-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="floating-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}></div>
          ))}
        </div>
      </div>

      <div className="ebook-hub-container">
        {/* Header Section */}
        <header className="hub-main-header">
          <div className="header-content-wrapper">
            <div className="header-icon-circle">
              <span className="header-main-icon">📚</span>
              <div className="icon-pulse"></div>
            </div>
            <h1 className="hub-main-title">
              <span className="title-gradient">E-Books Hub</span>
            </h1>
            <p className="hub-main-subtitle">
              Discover, collect, and explore your digital library
            </p>
            <div className="header-decorative-line">
              <span className="line-dot"></span>
              <span className="line-segment"></span>
              <span className="line-dot"></span>
            </div>
          </div>
        </header>

        {/* Navigation Cards */}
        {loading ? (
          <div className="hub-loading">
            <div className="loading-spinner-hub">
              <div className="spinner-circle"></div>
              <span className="loading-icon">📖</span>
            </div>
            <p className="loading-text">Loading your hub...</p>
          </div>
        ) : (
          <div className="hub-cards-grid">
            {/* Browse Card */}
            <div className="hub-nav-card browse-card" onClick={() => navigate('/browse-ebooks')}>
              <div className="card-glow-effect"></div>
              <div className="card-inner">
                <div className="card-header-section">
                  <div className="card-icon-wrapper">
                    <span className="card-icon">🛍️</span>
                    <div className="icon-bg-circle"></div>
                  </div>
                  <div className="card-badge">
                    <span className="badge-text">Explore</span>
                  </div>
                </div>

                <div className="card-content-section">
                  <h2 className="card-title">Browse E-Books</h2>
                  <p className="card-description">
                    Discover thousands of amazing digital books across multiple genres and categories
                  </p>

                  <div className="card-stats-display">
                    <div className="stat-circle">
                      <svg className="stat-progress" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" className="stat-bg"></circle>
                        <circle cx="50" cy="50" r="45" className="stat-fill" 
                          style={{ strokeDashoffset: 283 - (283 * 0.75) }}></circle>
                      </svg>
                      <div className="stat-content">
                        <span className="stat-number">{stats.browse}</span>
                        <span className="stat-label">Books</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-features">
                    <span className="feature-tag">✨ New Arrivals</span>
                    <span className="feature-tag">🔥 Popular</span>
                    <span className="feature-tag">🎯 Curated</span>
                  </div>
                </div>

                <div className="card-footer-section">
                  <button className="card-action-btn">
                    <span className="btn-text">Explore Now</span>
                    <span className="btn-arrow">→</span>
                    <div className="btn-shimmer"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Library Card */}
            <div className="hub-nav-card library-card" onClick={() => navigate('/my-library')}>
              <div className="card-glow-effect"></div>
              <div className="card-inner">
                <div className="card-header-section">
                  <div className="card-icon-wrapper">
                    <span className="card-icon">📖</span>
                    <div className="icon-bg-circle"></div>
                  </div>
                  <div className="card-badge library-badge">
                    <span className="badge-text">Personal</span>
                  </div>
                </div>

                <div className="card-content-section">
                  <h2 className="card-title">My Library</h2>
                  <p className="card-description">
                    Access and download your purchased e-books anytime, anywhere
                  </p>

                  <div className="card-stats-display">
                    <div className="stat-circle">
                      <svg className="stat-progress" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" className="stat-bg"></circle>
                        <circle cx="50" cy="50" r="45" className="stat-fill" 
                          style={{ strokeDashoffset: 283 - (283 * 0.6) }}></circle>
                      </svg>
                      <div className="stat-content">
                        <span className="stat-number">{stats.library}</span>
                        <span className="stat-label">Owned</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-features">
                    <span className="feature-tag">📥 Downloads</span>
                    <span className="feature-tag">🔖 Saved</span>
                    <span className="feature-tag">⚡ Instant</span>
                  </div>
                </div>

                <div className="card-footer-section">
                  <button className="card-action-btn">
                    <span className="btn-text">View Library</span>
                    <span className="btn-arrow">→</span>
                    <div className="btn-shimmer"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="hub-info-section">
          <div className="info-card">
            <span className="info-icon">🔒</span>
            <p className="info-text">Secure payments powered by Razorpay</p>
          </div>
          <div className="info-card">
            <span className="info-icon">📱</span>
            <p className="info-text">Access on any device, anytime</p>
          </div>
          <div className="info-card">
            <span className="info-icon">💎</span>
            <p className="info-text">Premium quality digital content</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EBookHub;
