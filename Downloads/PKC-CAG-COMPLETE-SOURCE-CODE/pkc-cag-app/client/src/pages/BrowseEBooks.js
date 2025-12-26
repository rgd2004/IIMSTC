import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import './BrowseEBooks.css';

const BrowseEBooks = () => {
const navigate = useNavigate();
const [allEbooks, setAllEbooks] = useState([]);
const [loading, setLoading] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const [filterCategory, setFilterCategory] = useState('all');
const [ebookStats, setEbookStats] = useState({});

const generateRandomStats = (ebookId) => {
if (ebookStats[ebookId]) return ebookStats[ebookId];

const stats = {
  rating: parseFloat((Math.random() * 0.3 + 4.7).toFixed(1)), // 4.7 to 5.0
  sales: Math.floor(Math.random() * 250 + 15), // 15 to 265
  downloads: Math.floor(Math.random() * 500 + 50), // 50 to 550
};

setEbookStats(prev => ({
  ...prev,
  [ebookId]: stats
}));

return stats;
};

useEffect(() => {
fetchEbooks();
}, []);

const fetchEbooks = async () => {
try {
setLoading(true);
const ebooksRes = await API.get('/ebooks');
console.log('📚 All e-books fetched:', ebooksRes.data);
setAllEbooks(ebooksRes.data.ebooks || []);
} catch (error) {
console.error('❌ Error fetching e-books:', error);
alert('Failed to load e-books');
} finally {
setLoading(false);
}
};

const filteredEbooks = allEbooks.filter(ebook => {
const matchesSearch = ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
(ebook.author && ebook.author.toLowerCase().includes(searchTerm.toLowerCase()));
const matchesCategory = filterCategory === 'all' || ebook.category === filterCategory;
return matchesSearch && matchesCategory;
});

const categories = ['all', 'Technology', 'Science', 'Business', 'Self-Help', 'Fiction', 'Non-Fiction', 'Education'];

return (
<div className="ebook-hub-container">
{/* Header */}
<div className="hub-header">
<div className="header-content">
<h1>🛍️ Browse E-Books</h1>
<p>Discover amazing digital books</p>
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
        <p>Loading e-books...</p>
      </div>
    ) : (
      <div className="browse-tab">
        {filteredEbooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No e-books found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="ebook-grid">
            {filteredEbooks.map(ebook => {
              const stats = generateRandomStats(ebook._id);
              const discount = ebook.originalPrice && ebook.discountedPrice && ebook.originalPrice > ebook.discountedPrice 
                ? Math.round(((ebook.originalPrice - ebook.discountedPrice) / ebook.originalPrice) * 100)
                : 0;
              
              return (
              <div key={ebook._id} className="ebook-card" onClick={() => navigate(`/ebook/${ebook._id}`)}>
                {ebook.coverImage && (
                  <div className="ebook-cover">
                    <img src={ebook.coverImage} alt={ebook.title} />
                    {discount > 0 && (
                      <div className="discount-badge">
                        -{discount}% OFF
                      </div>
                    )}
                  </div>
                )}
                <div className="ebook-info">
                  <h3 className="ebook-title">{ebook.title}</h3>
                  <p className="ebook-author">{ebook.author || 'Unknown Author'}</p>
                  
                  {/* Marketing Stats - Random for attraction */}
                  <div className="marketing-stats">
                    <span className="stat-badge">⭐ {stats.rating}/5</span>
                    <span className="stat-badge">🔥 {stats.sales} sold</span>
                    <span className="stat-badge">📥 {stats.downloads} downloads</span>
                  </div>

                  <div className="ebook-meta">
                    <span className="category-badge">{ebook.category}</span>
                    <span className="pages-badge">{ebook.pages || '?'} pages</span>
                  </div>
                  <p className="ebook-description">{ebook.description?.substring(0, 80)}...</p>
                  
                  {/* Pricing Section */}
                  <div className="ebook-footer">
                    <div className="price-section">
                      {ebook.originalPrice && ebook.discountedPrice && discount > 0 ? (
                        <>
                          <div className="price-row">
                            <span className="original-price">₹{ebook.originalPrice}</span>
                            <span className="discounted-price">₹{ebook.discountedPrice}</span>
                          </div>
                        </>
                      ) : (
                        <div className="price">₹{ebook.price}</div>
                      )}
                    </div>
                    <button 
                      className="btn-buy"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/ebook/${ebook._id}`);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    )}
  </div>
</div>
);
};

export default BrowseEBooks;