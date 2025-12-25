import React, { useEffect, useState } from 'react';
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
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchServices();
  }, [user]);

  const fetchServices = async (opts = {}) => {
    try {
      // Don't filter by isActive on initial load - get all services
      const params = { ...opts };
      const res = await servicesAPI.getAllServices(params);
      console.log('Services response:', res.data);
      const servicesList = res.data.services || [];
      // Filter to only active services on client side
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

  const handleSearch = async () => {
    setLoading(true);
    const svcIdMatch = /^[0-9]{4}$/.test(search.trim());
    if (svcIdMatch) {
      try {
        const res = await servicesAPI.getAllServices({ q: search.trim() });
        const list = res.data.services || [];
        if (list.length === 1 && list[0].serviceId === search.trim()) {
          window.location.href = `/services/${list[0]._id}`;
          return;
        }
      } catch (err) {
        console.error('Service search error:', err);
      }
    }
    fetchServices({ q: search.trim() });
  };

  const handleReset = () => {
    setSearch('');
    setFilter('all');
    setLoading(true);
    fetchServices({});
  };

  // Category configuration with icons
  const categories = [
    { key: 'all', label: 'All Services', icon: 'fas fa-th' },
    { key: 'instagram', label: 'Instagram', icon: 'fab fa-instagram' },
    { key: 'facebook', label: 'Facebook', icon: 'fab fa-facebook' },
    { key: 'youtube', label: 'YouTube', icon: 'fab fa-youtube' },
    { key: 'twitter', label: 'Twitter', icon: 'fab fa-twitter' },
    { key: 'telegram', label: 'Telegram', icon: 'fab fa-telegram' },
    { key: 'reviews', label: 'Reviews', icon: 'fas fa-star' },
    { key: 'gmb', label: 'GMB', icon: 'fas fa-map-marker-alt' },
    { key: 'website', label: 'Website', icon: 'fas fa-globe' },
    { key: 'seo', label: 'SEO', icon: 'fas fa-search' }
  ];

  if (!user) {
    console.warn('ServicesPage: user not logged in — redirecting to /login');
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

  if (!loading && services.length === 0 && !search) {
    return (
      <div className="services-page error-state">
        <div className="container">
          <div className="error-card">
            <i className="fas fa-exclamation-circle"></i>
            <h1>No Services Available</h1>
            <p>There are currently no services available on the platform.</p>
            <p className="user-info">Logged in as: <strong>{user?.email}</strong></p>
            <button onClick={() => { setLoading(true); fetchServices(); }} className="btn-primary">
              <i className="fas fa-redo"></i> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filtered = filter === 'all' ? services : services.filter((s) => s.category === filter);

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
              Boost your social media presence with our high-quality premium packages
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <i className="fas fa-check-circle"></i>
                <span>Instant Delivery</span>
              </div>
              <div className="stat-item">
                <i className="fas fa-shield-alt"></i>
                <span>100% Safe</span>
              </div>
              <div className="stat-item">
                <i className="fas fa-users"></i>
                <span>Real Engagement</span>
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
                placeholder="Search by service name or 4-digit ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
              <i className="fas fa-search"></i> Search
            </button>
            <button className="btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i> Reset
            </button>
          </div>

          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <i className="fas fa-th"></i>
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <i className="fas fa-list"></i>
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
              >
                <i className={cat.icon}></i>
                <span>{cat.label}</span>
                {filter === cat.key && (
                  <span className="chip-count">
                    {filter === 'all' ? services.length : filtered.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="results-header">
          <p className="results-count">
            {filtered.length} {filtered.length === 1 ? 'service' : 'services'} found
            {filter !== 'all' && ` in ${categories.find(c => c.key === filter)?.label}`}
          </p>
        </div>

        {/* Services Grid/List */}
        <div className={`services-container ${viewMode}-view`}>
          {filtered.map((service) => {
            const priceText = service.pricePer1000
              ? `₹${Number(service.pricePer1000).toLocaleString()}`
              : `₹${Number(service.pricePerUnit).toLocaleString()}`;

            const priceUnit = service.pricePer1000 ? '/ 1000' : '/ each';

            return (
              <div key={service._id} className="service-card">
                <div className="card-header">
                  <div className="premium-badge">
                    <i className="fas fa-crown"></i> PREMIUM
                  </div>
                  <div className="service-category">{service.category}</div>
                </div>

                <div className="card-body">
                  <div className="service-icon-wrapper">
                    <i className={service.icon || 'fas fa-star'}></i>
                  </div>

                  <h3 className="service-title">{service.name}</h3>
                  <p className="service-description">{service.description}</p>

                  <div className="service-meta">
                    <span className="service-id">
                      <i className="fas fa-hashtag"></i>
                      {service.serviceId || service._id.slice(-8)}
                    </span>
                  </div>

                  <div className="pricing-section">
                    <div className="price-tag">
                      <span className="price-label">Starting at</span>
                      <div className="price-amount">
                        <span className="price">{priceText}</span>
                        <span className="price-unit">{priceUnit}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <Link to={`/services/${service._id}`} className="btn-view-service">
                    <span>View Details</span>
                    <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="no-results">
              <i className="fas fa-search"></i>
              <h3>No Services Found</h3>
              <p>
                {search
                  ? `No services match your search "${search}"`
                  : `No services available in the ${categories.find(c => c.key === filter)?.label} category`}
              </p>
              <button className="btn-primary" onClick={handleReset}>
                <i className="fas fa-redo"></i> View All Services
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
