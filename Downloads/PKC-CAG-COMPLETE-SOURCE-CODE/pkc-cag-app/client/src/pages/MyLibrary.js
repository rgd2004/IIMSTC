import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import '../styles/EBookHub.css';

const MyLibrary = () => {
  const navigate = useNavigate();
  const [myEbooks, setMyEbooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchMyEbooks();
  }, []);

  const fetchMyEbooks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login to view your library');
        navigate('/login');
        return;
      }

      const myEbooksRes = await API.get('/ebooks/my-ebooks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('📖 My e-books fetched:', myEbooksRes.data);
      setMyEbooks(myEbooksRes.data.ebooks || []);
    } catch (error) {
      console.error('❌ Error fetching my e-books:', error);
      alert('Failed to load your library');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (purchaseId) => {
    try {
      const response = await API.get(
        `/ebooks/purchase/${purchaseId}/download`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.downloadUrl) {
        const baseURL = window.location.origin;
        const pdfUrl = response.data.downloadUrl.startsWith('http') 
          ? response.data.downloadUrl 
          : `${baseURL}${response.data.downloadUrl}`;
        
        const pdfResponse = await axios.get(pdfUrl, { responseType: 'blob' });
        const blobUrl = window.URL.createObjectURL(new Blob([pdfResponse.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${response.data.ebookTitle || 'ebook'}.pdf`;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download e-book');
    }
  };

  const filteredEbooks = myEbooks.filter(item => {
    const matchesSearch = item.ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.ebook.author && item.ebook.author.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || item.ebook.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'Technology', 'Science', 'Business', 'Self-Help', 'Fiction', 'Non-Fiction', 'Education'];

  return (
    <div className="ebook-hub-container">
      {/* Header */}
      <div className="hub-header">
        <div className="header-content">
          <h1>📖 My Library</h1>
          <p>Manage and download your purchased e-books</p>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="hub-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search e-books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-bar">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="category-filter"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <button 
          className="btn-back"
          onClick={() => navigate('/ebooks-hub')}
        >
          ← Back to Hub
        </button>
      </div>

      {/* Content */}
      <div className="tab-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your library...</p>
          </div>
        ) : (
          <div className="library-tab">
            {filteredEbooks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>Your library is empty</h3>
                <p>Browse and purchase e-books to add them to your library</p>
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/browse-ebooks')}
                >
                  Browse E-Books
                </button>
              </div>
            ) : (
              <div className="library-list">
                {filteredEbooks.map(item => (
                  <div key={item._id} className="library-item">
                    {item.ebook.coverImage && (
                      <div className="item-cover">
                        <img src={item.ebook.coverImage} alt={item.ebook.title} />
                      </div>
                    )}
                    <div className="item-content">
                      <h3>{item.ebook.title}</h3>
                      <p className="item-author">{item.ebook.author || 'Unknown Author'}</p>
                      <div className="item-stats">
                        <span>📅 Purchased: {new Date(item.createdAt).toLocaleDateString()}</span>
                        <span>📥 Downloaded: {item.downloadsCount} times</span>
                        {item.lastDownloadedAt && (
                          <span>⏰ Last: {new Date(item.lastDownloadedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                      <p className="item-category">{item.ebook.category}</p>
                    </div>
                    <div className="item-actions">
                      <button 
                        className="btn-download"
                        onClick={() => handleDownload(item._id)}
                        title="Download E-Book"
                      >
                        📥 Download
                      </button>
                      <button 
                        className="btn-view"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLibrary;
