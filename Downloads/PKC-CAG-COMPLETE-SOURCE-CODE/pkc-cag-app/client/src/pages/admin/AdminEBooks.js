import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/AdminEBooks.css';

const AdminEBooks = () => {
  const navigate = useNavigate();
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technology',
    price: '',
    originalPrice: '',
    discountedPrice: '',
    language: 'English',
    coverImage: '',
    pdfFile: '',
    published: true,
    averageRating: 0,
    totalSales: 0,
    downloads: 0,
    pages: '',
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/ebooks/admin/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEbooks(response.data.ebooks || []);
    } catch (error) {
      console.error('Error fetching e-books:', error);
      setMessage({ type: 'error', text: 'Failed to load e-books' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      console.log(`📁 File selected: ${name} = ${file.name} (${file.size} bytes)`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.pdfFile || !formData.description) {
      setMessage({ type: 'error', text: 'Please fill all required fields: title, description, price, and PDF file' });
      return;
    }

    try {
      setLoading(true);
      const endpoint = editingId ? `/api/ebooks/admin/${editingId}` : '/api/ebooks/admin/create';
      const method = editingId ? 'PUT' : 'POST';

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('author', formData.author || 'Admin');
      submitData.append('category', formData.category);
      submitData.append('price', formData.price);
      submitData.append('originalPrice', formData.originalPrice || formData.price);
      submitData.append('discountedPrice', formData.discountedPrice || formData.price);
      submitData.append('language', formData.language);
      submitData.append('published', formData.published);
      submitData.append('averageRating', formData.averageRating || 0);
      submitData.append('totalSales', formData.totalSales || 0);
      submitData.append('downloads', formData.downloads || 0);

      if (formData.coverImage instanceof File) {
        submitData.append('coverImage', formData.coverImage);
      } else if (typeof formData.coverImage === 'string' && formData.coverImage) {
        submitData.append('coverImage', formData.coverImage);
      }

      if (formData.pdfFile instanceof File) {
        submitData.append('pdfFile', formData.pdfFile);
      } else if (typeof formData.pdfFile === 'string' && formData.pdfFile) {
        submitData.append('pdfFile', formData.pdfFile);
      }

      const response = await axios({
        method,
        url: endpoint,
        data: submitData,
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ 
        type: 'success', 
        text: editingId ? '✨ E-book updated successfully!' : '🎉 E-book created successfully!' 
      });

      resetForm();
      fetchEbooks();
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ebook) => {
    setFormData({
      title: ebook.title,
      description: ebook.description,
      category: ebook.category,
      price: ebook.price,
      originalPrice: ebook.originalPrice || ebook.price,
      discountedPrice: ebook.discountedPrice || ebook.price,
      language: ebook.language || 'English',
      averageRating: ebook.averageRating || 0,
      totalSales: ebook.totalSales || 0,
      downloads: ebook.downloads || 0,
      coverImage: ebook.coverImage,
      pdfFile: ebook.pdfFile,
      published: ebook.published || false,
    });
    setEditingId(ebook._id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this e-book?')) return;

    try {
      setLoading(true);
      await axios.delete(`/api/ebooks/admin/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setMessage({ type: 'success', text: '🗑️ E-book deleted successfully!' });
      fetchEbooks();
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Failed to delete e-book' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Technology',
      price: '',
      originalPrice: '',
      discountedPrice: '',
      language: 'English',
      coverImage: '',
      pdfFile: '',
      published: true,
      averageRating: 0,
      totalSales: 0,
      downloads: 0,
      pages: '',
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const filteredEbooks = ebooks.filter(ebook => {
    const matchesSearch = ebook.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || ebook.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-ebooks-container">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <div className="icon-wrapper">
              <span className="icon">📚</span>
            </div>
            <div>
              <h1>E-Books Management</h1>
              <p>Manage your digital library</p>
            </div>
          </div>
          <button 
            className={`btn-add ${showAddForm ? 'active' : ''}`}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <span className="btn-icon">{showAddForm ? '✕' : '+'}</span>
            <span className="btn-text">{showAddForm ? 'Cancel' : 'Add New E-Book'}</span>
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`message-toast ${message.type}`}>
          <span className="message-icon">{message.type === 'success' ? '✓' : '⚠'}</span>
          <span className="message-text">{message.text}</span>
          <button className="message-close" onClick={() => setMessage({ type: '', text: '' })}>✕</button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="form-container">
          <div className="form-header">
            <h2>{editingId ? '✏️ Edit E-Book' : '📝 Create New E-Book'}</h2>
          </div>
          <form onSubmit={handleSubmit} className="ebook-form">
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Title <span className="required">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter e-book title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Original Price (₹) <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="input-icon">₹</span>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Selling Price (₹) <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="input-icon">₹</span>
                  <input
                    type="number"
                    name="discountedPrice"
                    value={formData.discountedPrice}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Display Price (₹) <span className="required">*</span></label>
                <div className="input-with-icon">
                  <span className="input-icon">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <small>Price shown to customers</small>
              </div>

              <div className="form-group">
                <label>Discount Percentage</label>
                <div className="discount-display">
                  {formData.originalPrice && formData.discountedPrice ? (
                    <span className="discount-badge">
                      {Math.round(((formData.originalPrice - formData.discountedPrice) / formData.originalPrice) * 100)}% OFF
                    </span>
                  ) : (
                    <span className="discount-badge-empty">No discount</span>
                  )}
                </div>
                <small>Auto-calculated from Original and Selling Price</small>
              </div>

              <div className="form-group">
                <label>Category <span className="required">*</span></label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Technology, Business..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Language <span className="required">*</span></label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  placeholder="e.g., English, Hindi..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Average Rating (⭐)</label>
                <input
                  type="number"
                  name="averageRating"
                  value={formData.averageRating}
                  onChange={handleInputChange}
                  placeholder="4.7"
                  min="4.7"
                  max="5"
                  step="0.1"
                />
                <small>Rating between 4.7 - 5.0</small>
              </div>

              <div className="form-group">
                <label>Total Sales</label>
                <input
                  type="number"
                  name="totalSales"
                  value={formData.totalSales}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Downloads</label>
                <input
                  type="number"
                  name="downloads"
                  value={formData.downloads}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Number of Pages</label>
                <input
                  type="number"
                  name="pages"
                  value={formData.pages}
                  onChange={handleInputChange}
                  placeholder="Enter number of pages"
                  min="0"
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your e-book..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Cover Image</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    name="coverImage"
                    onChange={handleFileChange}
                    accept="image/*"
                    id="coverImage"
                  />
                  <label htmlFor="coverImage" className="file-input-label">
                    <span className="file-icon">🖼️</span>
                    <span>Choose Image</span>
                  </label>
                  {formData.coverImage && (
                    <span className="file-name">
                      {formData.coverImage instanceof File ? formData.coverImage.name : 'Current image'}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>PDF File <span className="required">*</span></label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    name="pdfFile"
                    onChange={handleFileChange}
                    accept=".pdf"
                    id="pdfFile"
                    required
                  />
                  <label htmlFor="pdfFile" className="file-input-label">
                    <span className="file-icon">📄</span>
                    <span>Choose PDF</span>
                  </label>
                  {formData.pdfFile && (
                    <span className="file-name">
                      {formData.pdfFile instanceof File ? formData.pdfFile.name : 'Current PDF'}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group full-width">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  />
                  <span className="checkbox-custom"></span>
                  <span>Publish immediately (visible to users)</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <><span className="spinner"></span> Processing...</>
                ) : (
                  <>{editingId ? '💾 Update E-Book' : '➕ Create E-Book'}</>
                )}
              </button>
              <button type="button" className="btn-reset" onClick={resetForm}>
                ↩️ Reset Form
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter */}
      <div className="controls-section">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          <option value="Technology">Technology</option>
          <option value="Business">Business</option>
          <option value="Self-Help">Self-Help</option>
          <option value="Fiction">Fiction</option>
          <option value="Education">Education</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* E-Books Grid */}
      <div className="ebooks-grid">
        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading e-books...</p>
          </div>
        ) : filteredEbooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No e-books found</h3>
            <p>Create your first e-book to get started!</p>
          </div>
        ) : (
          filteredEbooks.map(ebook => (
            <div key={ebook._id} className="ebook-card">
              <div className="ebook-cover">
                {ebook.coverImage ? (
                  <img src={ebook.coverImage} alt={ebook.title} />
                ) : (
                  <div className="cover-placeholder">📖</div>
                )}
                <div className="ebook-overlay">
                  <button className="btn-icon-action edit" onClick={() => handleEdit(ebook)}>
                    <span>✏️</span>
                  </button>
                  <button className="btn-icon-action delete" onClick={() => handleDelete(ebook._id)}>
                    <span>🗑️</span>
                  </button>
                </div>
              </div>
              <div className="ebook-info">
                <h3>{ebook.title}</h3>
                <div className="ebook-meta">
                  <span className="badge">{ebook.category}</span>
                  <span className="price">₹{ebook.price}</span>
                </div>
                <div className="ebook-stats">
                  <div className="stat">
                    <span className="stat-icon">📊</span>
                    <span>{ebook.totalSales || 0} sales</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">💰</span>
                    <span>₹{(ebook.price || 0) * (ebook.totalSales || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Summary */}
      {filteredEbooks.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h4>Total E-Books</h4>
              <p className="stat-value">{filteredEbooks.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h4>Total Revenue</h4>
              <p className="stat-value">₹{filteredEbooks.reduce((sum, e) => sum + ((e.price || 0) * (e.totalSales || 0)), 0)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h4>Total Sales</h4>
              <p className="stat-value">{filteredEbooks.reduce((sum, e) => sum + (e.totalSales || 0), 0)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h4>Avg Rating</h4>
              <p className="stat-value">
                {(filteredEbooks.reduce((sum, e) => sum + (e.averageRating || 0), 0) / filteredEbooks.length).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEBooks;
