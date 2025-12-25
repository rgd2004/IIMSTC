import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../pages/EBooksPage.css';

const EBooksPage = () => {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/ebooks', {
        params: {
          search: searchTerm,
          category: selectedCategory,
          sort: sortBy
        }
      });
      setEbooks(response.data.ebooks || []);
    } catch (error) {
      console.error('Error fetching e-books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEbooks();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, sortBy]);

  const categories = [
    'All',
    'Technology',
    'Business',
    'Self-Help',
    'Fiction',
    'Education',
    'Other'
  ];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars && hasHalf) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">★</span>);
      }
    }
    return stars;
  };

  return (
    <div className="ebooks-page">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
        <div className="gradient-sphere sphere-3"></div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">📚 Digital Library</div>
          <h1 className="hero-title">
            Discover Your Next
            <span className="gradient-text"> Great Read</span>
          </h1>
          <p className="hero-subtitle">
            Expand your knowledge with our curated collection of premium e-books
          </p>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="filter-section">
        <div className="search-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-controls">
          <div className="category-filter">
            <label className="filter-label">Categories</label>
            <div className="category-buttons">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === (category === 'All' ? '' : category) ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="sort-filter">
            <label className="filter-label">Sort By</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* E-Books Grid */}
      <div className="ebooks-container">
        {loading ? (
          <div className="loading-state">
            <div className="loader-spinner"></div>
            <p>Loading amazing books...</p>
          </div>
        ) : ebooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">📚</div>
            <h3>No Books Found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="ebooks-grid">
            {ebooks.map(ebook => (
              <Link 
                to={`/ebook/${ebook._id}`} 
                key={ebook._id}
                className="ebook-card-link"
              >
                <div className="ebook-card">
                  {/* Cover Image */}
                  <div className="ebook-cover">
                    {ebook.coverImage ? (
                      <img src={ebook.coverImage} alt={ebook.title} />
                    ) : (
                      <div className="default-cover">
                        <span className="cover-icon">📖</span>
                      </div>
                    )}
                    {ebook.featured && (
                      <div className="featured-badge">
                        <span className="badge-icon">⭐</span>
                        <span>Featured</span>
                      </div>
                    )}
                    <div className="card-overlay">
                      <span className="view-btn">View Details →</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="ebook-content">
                    <h3 className="ebook-title">{ebook.title}</h3>
                    <p className="ebook-author">by {ebook.author}</p>

                    {/* Rating */}
                    <div className="rating-section">
                      <div className="stars">
                        {renderStars(ebook.analytics?.averageRating || 0)}
                      </div>
                      <span className="rating-value">
                        {(ebook.analytics?.averageRating || 0).toFixed(1)}
                      </span>
                      {ebook.analytics?.totalSales > 0 && (
                        <span className="sales-count">
                          ({ebook.analytics.totalSales} sold)
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="ebook-meta">
                      <span className="meta-badge category-badge">{ebook.category}</span>
                      <span className="meta-badge language-badge">{ebook.language}</span>
                    </div>

                    {/* Info */}
                    <div className="ebook-info">
                      {ebook.pages && (
                        <span className="info-item">
                          <span className="info-icon">📄</span>
                          {ebook.pages} pages
                        </span>
                      )}
                      <span className="info-item">
                        <span className="info-icon">📥</span>
                        {ebook.analytics?.downloads || 0} downloads
                      </span>
                    </div>

                    {/* Price */}
                    <div className="ebook-footer">
                      <div className="price-container">
                        <span className="price">₹{ebook.price}</span>
                      </div>
                      <div className="action-btn">
                        <span>Buy Now</span>
                        <span className="arrow">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Stats Section */}
      {ebooks.length > 0 && (
        <div className="stats-section">
          <div className="stat-item">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <span className="stat-number">{ebooks.length}</span>
              <span className="stat-label">Books Available</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <span className="stat-number">
                ₹{ebooks.reduce((sum, e) => sum + e.price, 0)}
              </span>
              <span className="stat-label">Total Value</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <span className="stat-number">
                {ebooks.reduce((sum, e) => sum + (e.analytics?.totalSales || 0), 0)}
              </span>
              <span className="stat-label">Total Sales</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EBooksPage;
