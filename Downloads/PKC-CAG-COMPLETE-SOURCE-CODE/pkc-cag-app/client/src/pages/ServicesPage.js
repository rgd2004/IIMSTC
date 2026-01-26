import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { servicesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ServicesPage.css';

const ServicesPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('trending');
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchServices();
  }, [user]);

  const fetchServices = async (opts = {}) => {
    try {
      const params = { ...opts };
      const res = await servicesAPI.getAllServices(params);
      const servicesList = res.data.services || [];
      const activeServices = servicesList.filter(s => s.isActive !== false);
      setServices(activeServices);
    } catch (err) {
      console.error('Services fetch error:', err);
      toast.error(err.response?.data?.message || 'Failed to load services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (searchTerm = search) => {
    // Debounced search (500ms)
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const timeout = setTimeout(async () => {
      if (!searchTerm.trim()) {
        fetchServices({});
        return;
      }
      
      setLoading(true);
      const svcIdMatch = /^[0-9]{4}$/.test(searchTerm.trim());
      if (svcIdMatch) {
        try {
          const res = await servicesAPI.getAllServices({ q: searchTerm.trim() });
          const list = res.data.services || [];
          if (list.length === 1 && list[0].serviceId === searchTerm.trim()) {
            window.location.href = `/services/${list[0]._id}`;
            return;
          }
        } catch (err) {
          console.error('Service search error:', err);
        }
      }
      fetchServices({ q: searchTerm.trim() });
    }, 500);
    
    setSearchTimeout(timeout);
  }, [search, searchTimeout]);

  const handleReset = useCallback(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearch('');
    setFilter('all');
    setSortBy('trending');
    setLoading(true);
    fetchServices({});
  }, [searchTimeout]);

  const sortServices = useCallback((servicesToSort) => {
    const sorted = [...servicesToSort];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => (a.pricePerUnit || a.pricePer1000) - (b.pricePerUnit || b.pricePer1000));
      case 'price-high':
        return sorted.sort((a, b) => (b.pricePerUnit || b.pricePer1000) - (a.pricePerUnit || a.pricePer1000));
      case 'popular':
        return sorted.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
      default:
        return sorted;
    }
  }, [sortBy]);

  const categories = useMemo(() => [
    { key: 'all', label: 'All Services', icon: 'fas fa-th', color: '#6366f1' },
    { key: 'instagram', label: 'Instagram', icon: 'fab fa-instagram', color: '#E4405F' },
    { key: 'facebook', label: 'Facebook', icon: 'fab fa-facebook', color: '#1877F2' },
    { key: 'youtube', label: 'YouTube', icon: 'fab fa-youtube', color: '#FF0000' },
    { key: 'twitter', label: 'Twitter', icon: 'fab fa-twitter', color: '#1DA1F2' },
    { key: 'telegram', label: 'Telegram', icon: 'fab fa-telegram', color: '#0088cc' },
    { key: 'reviews', label: 'Reviews', icon: 'fas fa-star', color: '#F59E0B' },
    { key: 'gmb', label: 'GMB', icon: 'fas fa-map-marker-alt', color: '#34A853' },
    { key: 'website', label: 'Website', icon: 'fas fa-globe', color: '#5B4AFF' },
    { key: 'seo', label: 'SEO', icon: 'fas fa-search', color: '#FF6B6B' }
  ], []);

  const filtered = useMemo(() => 
    filter === 'all' ? services : services.filter((s) => s.category === filter),
    [filter, services]
  );
  
  const sorted = useMemo(() => sortServices(filtered), [sortServices, filtered]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-spinner"></div>
        <p>Loading premium services...</p>
      </div>
    );
  }

  return (
    <div className="services-page">
      {/* Hero Section */}
      <div className="services-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="gradient-text">Premium Services</span>
            </h1>
            <p className="hero-subtitle">
              Boost your online presence with our high-quality, verified services
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <i className="fas fa-lightning-bolt"></i>
                <span>Instant Delivery</span>
              </div>
              <div className="stat-item">
                <i className="fas fa-shield-alt"></i>
                <span>100% Secure</span>
              </div>
              <div className="stat-item">
                <i className="fas fa-star"></i>
                <span>Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Search and Filters Section */}
        <div className="services-controls">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  handleSearch(e.target.value);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
              {search && (
                <button className="clear-search" onClick={() => setSearch('')}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <button className="btn-search" onClick={handleSearch}>
              <i className="fas fa-search"></i>
            </button>
          </div>

          <div className="filter-group">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
              <option value="trending">Trending</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <button className="btn-reset" onClick={handleReset} title="Reset filters">
              <i className="fas fa-redo"></i>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="category-filters">
          <div className="filters-scroll">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`filter-chip ${filter === cat.key ? 'active' : ''}`}
                style={filter === cat.key ? { borderColor: cat.color, backgroundColor: cat.color + '15' } : {}}
              >
                <i className={cat.icon} style={filter === cat.key ? { color: cat.color } : {}}></i>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        {sorted.length > 0 && (
          <div className="results-header">
            <p className="results-count">
              Showing {sorted.length} {sorted.length === 1 ? 'service' : 'services'}
            </p>
          </div>
        )}

        {/* Services Grid */}
        <div className="services-grid">
          {sorted.map((service) => {
            const priceText = service.pricePer1000
              ? `${Number(service.pricePer1000).toLocaleString()}`
              : `${Number(service.pricePerUnit).toLocaleString()}`;

            const categoryObj = categories.find(c => c.key === service.category);

            return (
              <Link 
                key={service._id}
                to={`/services/${service._id}`}
                className="service-card-link"
              >
                <div className="service-card">
                  {/* Icon Section */}
                  <div className="card-icon-wrapper">
                    <div className="icon-background">
                      <i className={service.icon || 'fas fa-star'}></i>
                    </div>
                    {service.isPremium && <div className="premium-badge">👑</div>}
                  </div>

                  {/* Content Section */}
                  <div className="card-content">
                    <div className="service-header">
                      <h3 className="service-title">{service.name}</h3>
                      {categoryObj && (
                        <span className="category-tag" style={{ backgroundColor: categoryObj.color + '20', color: categoryObj.color }}>
                          {service.category}
                        </span>
                      )}
                    </div>

                    <p className="service-description">{service.description}</p>

                    <div className="service-stats">
                      {service.salesCount && (
                        <span className="stat"><i className="fas fa-shopping-cart"></i> {service.salesCount}</span>
                      )}
                      {service.rating && (
                        <span className="stat"><i className="fas fa-star"></i> {service.rating}</span>
                      )}
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="card-footer">
                    <div className="price-section">
                      <span className="price-label">Price</span>
                      <span className="price-amount">₹{priceText}</span>
                    </div>
                    <button className="btn-view">
                      <span>View</span>
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* No Results State */}
        {sorted.length === 0 && (
          <div className="no-results-container">
            <div className="no-results">
              <i className="fas fa-search"></i>
              <h3>No Services Found</h3>
              <p>
                {search
                  ? `No services match your search "${search}"`
                  : filter !== 'all'
                  ? `No services available in ${categories.find(c => c.key === filter)?.label}`
                  : 'No services available yet'}
              </p>
              {(search || filter !== 'all') && (
                <button className="btn-primary" onClick={handleReset}>
                  <i className="fas fa-redo"></i> Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
