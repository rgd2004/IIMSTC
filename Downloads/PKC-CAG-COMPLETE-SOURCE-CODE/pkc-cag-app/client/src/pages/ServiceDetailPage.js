import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { servicesAPI } from "../utils/api";
import "./ServiceDetailPage.css";

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const res = await servicesAPI.getService(id);

      if (!res.data.service) {
        toast.error("Service not found");
        return navigate("/services");
      }

      setService(res.data.service);
    } catch (err) {
      toast.error("Failed to load service details");
      navigate("/services");
    } finally {
      setLoading(false);
    }
  };

  const buyNow = () => {
    navigate(`/checkout/${service._id || service.id}`);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-spinner"></div>
        <p>Loading service details...</p>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="service-detail-page">
      {/* Header */}
      <div className="detail-header">
        <div className="container">
          <button className="back-button" onClick={() => navigate('/services')}>
            <i className="fas fa-arrow-left"></i>
            <span>Back to Services</span>
          </button>
        </div>
      </div>

      <div className="container">
        {/* Main Grid */}
        <div className="detail-grid">
          {/* Left Content */}
          <div className="detail-main">
            {/* Service Hero */}
            <div className="service-hero-section">
              <div className="service-icon-container">
                <div className="service-icon">
                  <i className={service.icon || 'fas fa-star'}></i>
                </div>
                {service.isPremium && <div className="premium-badge-large">👑 Premium</div>}
              </div>

              <div className="service-info">
                <div className="service-header-top">
                  <h1 className="service-name">{service.name}</h1>
                  <span className="service-category-tag">{service.category}</span>
                </div>

                <p className="service-desc">{service.description}</p>

                <div className="service-stats-row">
                  {service.salesCount && (
                    <div className="stat-badge">
                      <i className="fas fa-shopping-cart"></i>
                      <span>{service.salesCount.toLocaleString()} Sales</span>
                    </div>
                  )}
                  {service.rating && (
                    <div className="stat-badge">
                      <i className="fas fa-star"></i>
                      <span>{service.rating}/5 Rating</span>
                    </div>
                  )}
                  <div className="stat-badge">
                    <i className="fas fa-bolt"></i>
                    <span>Instant Delivery</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs-section">
              <div className="tabs-nav">
                {[
                  { key: 'overview', label: 'Overview', icon: 'fas fa-info-circle' },
                  { key: 'features', label: 'Features', icon: 'fas fa-list' },
                  { key: 'faq', label: 'FAQ', icon: 'fas fa-question-circle' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <i className={tab.icon}></i>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="tabs-content">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="tab-pane">
                    <div className="benefits-grid">
                      {[
                        { icon: '⚡', title: 'Instant Delivery', desc: 'Start within minutes' },
                        { icon: '🔒', title: '100% Secure', desc: 'Safe & protected' },
                        { icon: '✓', title: 'Quality Guaranteed', desc: '30-day guarantee' },
                        { icon: '🎯', title: 'Best Results', desc: 'Real engagement' }
                      ].map((benefit, i) => (
                        <div key={i} className="benefit-card">
                          <div className="benefit-icon">{benefit.icon}</div>
                          <h4>{benefit.title}</h4>
                          <p>{benefit.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="info-box">
                      <h3>Service Details</h3>
                      <dl className="details-list">
                        <div className="detail-item">
                          <dt>Service ID</dt>
                          <dd>{service.serviceId || service._id.slice(0, 8)}</dd>
                        </div>
                        <div className="detail-item">
                          <dt>Category</dt>
                          <dd className="capitalize">{service.category}</dd>
                        </div>
                        <div className="detail-item">
                          <dt>Delivery Time</dt>
                          <dd>{service.deliveryTime || '0-1 hour'}</dd>
                        </div>
                        {service.minQuantity && (
                          <div className="detail-item">
                            <dt>Minimum Order</dt>
                            <dd>{service.minQuantity.toLocaleString()}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                  <div className="tab-pane">
                    <div className="features-list">
                      <h3>What's Included</h3>
                      {(service.features || [
                        '✓ High Quality Service',
                        '✓ Fast Delivery',
                        '✓ 24/7 Support',
                        '✓ Safe & Secure',
                        '✓ 30 Days Guarantee',
                        '✓ Premium Package'
                      ]).map((feature, i) => (
                        <div key={i} className="feature-item">
                          <div className="feature-check">
                            <i className="fas fa-check"></i>
                          </div>
                          <span>{feature.replace(/^✓\s*/, '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FAQ Tab */}
                {activeTab === 'faq' && (
                  <div className="tab-pane">
                    <div className="faq-list">
                      {[
                        { q: 'How long does delivery take?', a: 'Delivery typically starts within 0-1 hours after order confirmation.' },
                        { q: 'Is the service safe?', a: '100% safe, secure, and compliant with all platform policies.' },
                        { q: 'Do you offer refunds/refills?', a: 'Yes, we offer 30-day money-back guarantee and refills.' },
                        { q: 'What payment methods do you accept?', a: 'We accept all major payment methods including cards, UPI, and digital wallets.' },
                        { q: 'Is there customer support?', a: 'Yes, 24/7 customer support available via chat and email.' }
                      ].map((item, i) => (
                        <div key={i} className="faq-item">
                          <div className="faq-question">
                            <i className="fas fa-question-circle"></i>
                            <strong>{item.q}</strong>
                          </div>
                          <p className="faq-answer">{item.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Order Card */}
          <div className="detail-sidebar">
            <div className="order-card">
              {/* Service Provider Info */}
              <div className="provider-section">
                <div className="provider-avatar">
                  <i className="fas fa-user-circle"></i>
                </div>
                <div className="provider-info">
                  <p className="provider-label">Service Provider</p>
                  <h4>{service.createdBy?.name || 'Premium Provider'}</h4>
                  {service.rating && (
                    <div className="provider-rating">
                      <i className="fas fa-star"></i>
                      <span>{service.rating.toFixed(1)} ({service.salesCount || 0} reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Display */}
              <div className="price-display-card">
                <span className="price-label">Starting From</span>
                <div className="price-amount">
                  <span className="currency">₹</span>
                  <span className="amount">{service.pricePer1000 ? service.pricePer1000 : service.pricePerUnit}</span>
                  {service.pricePer1000 && <span className="price-unit">/1000</span>}
                </div>
              </div>

              {/* Key Features Highlights */}
              <div className="highlights-section">
                <h5>What You Get</h5>
                <div className="highlights-list">
                  <div className="highlight-item">
                    <i className="fas fa-bolt"></i>
                    <span>Instant Delivery</span>
                  </div>
                  <div className="highlight-item">
                    <i className="fas fa-shield-alt"></i>
                    <span>100% Secure</span>
                  </div>
                  <div className="highlight-item">
                    <i className="fas fa-redo"></i>
                    <span>30-Day Guarantee</span>
                  </div>
                  <div className="highlight-item">
                    <i className="fas fa-headset"></i>
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <button
                onClick={buyNow}
                className="btn-buy-now"
              >
                <i className="fas fa-shopping-bag"></i>
                <span>Buy Now</span>
              </button>

              <button className="btn-contact">
                <i className="fas fa-envelope"></i>
                <span>Contact Seller</span>
              </button>

              {/* Info Box */}
              <div className="info-footer">
                <p>
                  <i className="fas fa-info-circle"></i>
                  <span>You'll select quantity at checkout</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
