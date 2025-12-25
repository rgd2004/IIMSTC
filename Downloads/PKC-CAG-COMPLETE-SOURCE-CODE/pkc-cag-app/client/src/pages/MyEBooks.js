import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyEBooks.css';

const MyEBooks = () => {
  const navigate = useNavigate();
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMyEBooks();
  }, []);

  const fetchMyEBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/ebooks/my-ebooks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEbooks(response.data.ebooks || []);
    } catch (error) {
      console.error('Error fetching my e-books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (purchaseId) => {
    try {
      const response = await axios.get(
        `/api/ebooks/purchase/${purchaseId}/download`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.downloadUrl) {
        // Build full URL for the PDF
        const baseURL = window.location.origin;
        const pdfUrl = response.data.downloadUrl.startsWith('http') 
          ? response.data.downloadUrl 
          : `${baseURL}${response.data.downloadUrl}`;
        
        console.log('📥 Downloading from:', pdfUrl);
        
        // Download the PDF as blob
        const pdfResponse = await axios.get(pdfUrl, { 
          responseType: 'blob'
        });
        
        // Create blob URL and download
        const blobUrl = window.URL.createObjectURL(new Blob([pdfResponse.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${response.data.ebookTitle || 'ebook'}.pdf`;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
        
        console.log('✅ Download completed');
      } else {
        alert('Download URL not provided');
      }
    } catch (error) {
      console.error('Error downloading e-book:', error);
      alert('Failed to download e-book: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredEbooks = ebooks.filter(item => {
    const matchesSearch = item.ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.ebook.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'recent') {
      return matchesSearch && new Date(item.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    return matchesSearch;
  });

  return (
    <div className="my-ebooks-container">
      <div className="my-ebooks-header">
        <h1>📚 My E-Books</h1>
        <p>Your collection of purchased e-books</p>
      </div>

      {/* Search & Filter */}
      <div className="ebooks-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search your e-books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-options">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'recent' ? 'active' : ''}`}
            onClick={() => setFilter('recent')}
          >
            Recent (30 days)
          </button>
        </div>
      </div>

      {/* E-Books List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner">⏳</div>
          <p>Loading your e-books...</p>
        </div>
      ) : filteredEbooks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No e-books found</h3>
          <p>Start exploring our digital library and purchase your first e-book!</p>
          <button 
            className="btn-explore"
            onClick={() => navigate('/ebooks')}
          >
            Explore E-Books Library
          </button>
        </div>
      ) : (
        <div className="ebooks-list">
          {filteredEbooks.map(item => (
            <div key={item._id} className="ebook-list-item">
              {/* Cover */}
              <div className="item-cover">
                {item.ebook.coverImage ? (
                  <img src={item.ebook.coverImage} alt={item.ebook.title} />
                ) : (
                  <div className="default-cover">📖</div>
                )}
              </div>

              {/* Content */}
              <div className="item-content">
                <div className="item-main">
                  <h3 className="item-title">{item.ebook.title}</h3>
                  <p className="item-author">by {item.ebook.author}</p>
                  
                  <div className="item-meta">
                    <span className="meta-badge">{item.ebook.category}</span>
                    <span className="meta-text">📄 {item.ebook.pages} pages</span>
                    <span className="meta-text">🌍 {item.ebook.language}</span>
                  </div>

                  <div className="item-description">
                    {item.ebook.description}
                  </div>
                </div>

                {/* Purchase Info */}
                <div className="item-purchase-info">
                  <div className="info-row">
                    <span className="label">Purchased:</span>
                    <span className="value">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Downloaded:</span>
                    <span className="value">
                      {item.downloadsCount} time{item.downloadsCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {item.lastDownloadedAt && (
                    <div className="info-row">
                      <span className="label">Last Download:</span>
                      <span className="value">
                        {new Date(item.lastDownloadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="item-actions">
                <button 
                  className="btn-download"
                  onClick={() => handleDownload(item._id)}
                  title="Download E-Book"
                >
                  📥 Download
                </button>
                <button 
                  className="btn-view-detail"
                  onClick={() => navigate(`/ebook/${item.ebook._id}`)}
                  title="View Details"
                >
                  👁️ View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {filteredEbooks.length > 0 && (
        <div className="my-ebooks-stats">
          <div className="stat-card">
            <span className="stat-icon">📚</span>
            <div>
              <p className="stat-label">Total E-Books</p>
              <p className="stat-value">{filteredEbooks.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💾</span>
            <div>
              <p className="stat-label">Total Downloads</p>
              <p className="stat-value">
                {filteredEbooks.reduce((sum, item) => sum + item.downloadsCount, 0)}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <div>
              <p className="stat-label">Amount Spent</p>
              <p className="stat-value">
                ₹{filteredEbooks.reduce((sum, item) => sum + item.amount, 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEBooks;
