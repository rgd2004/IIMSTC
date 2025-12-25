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
  const [quantity, setQuantity] = useState(1000);
  const [activeTab, setActiveTab] = useState('features');

  useEffect(() => {
    fetchService();
    // eslint-disable-next-line
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

  const calculatePrice = () => {
    if (!service) return 0;
    
    if (service.pricePer1000) {
      return ((quantity / 1000) * service.pricePer1000).toFixed(2);
    }
    return (quantity * service.pricePerUnit).toFixed(2);
  };

  const handleQuantityChange = (value) => {
    const num = parseInt(value) || 0;
    setQuantity(Math.max(0, num));
  };

  const quickQuantities = service?.pricePer1000 
    ? [1000, 2500, 5000, 10000, 25000]
    : [10, 25, 50, 100, 500];

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
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-container">
        <div className="container">
          <div className="breadcrumb">
            <button onClick={() => navigate('/')} className="breadcrumb-item">
              <i className="fas fa-home"></i> Home
            </button>
            <i className="fas fa-chevron-right breadcrumb-separator"></i>
            <button onClick={() => navigate('/services')} className="breadcrumb-item">
              Services
            </button>
            <i className="fas fa-chevron-right breadcrumb-separator"></i>
            <span className="breadcrumb-item active">{service.name}</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="service-detail-grid">
          {/* Left Column - Service Info */}
          <div className="service-info-column">
            {/* Service Header Card */}
            <div className="info-card service-header-card">
              <div className="service-header">
                <div className="service-icon-large">
                  <i className={service.icon || 'fas fa-star'}></i>
                </div>

                <div className="header-content">
                  <div className="badges-row">
                    <span className="premium-badge">
                      <i className="fas fa-crown"></i> PREMIUM
                    </span>
                    <span className="category-badge">{service.category}</span>
                  </div>

                  <h1 className="service-title">{service.name}</h1>
                  <p className="service-description">{service.description}</p>

                  <div className="service-meta-row">
                    <div className="meta-item">
                      <i className="fas fa-hashtag"></i>
                      <span>ID: {service.serviceId || service._id?.slice(-8)}</span>
                    </div>
                    {service.deliveryTime && (
                      <div className="meta-item">
                        <i className="fas fa-clock"></i>
                        <span>{service.deliveryTime}</span>
                      </div>
                    )}
                    <div className="meta-item">
                      <i className="fas fa-shield-check"></i>
                      <span>Guaranteed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="info-card tabs-card">
              <div className="tabs-header">
                <button
                  className={`tab-button ${activeTab === 'features' ? 'active' : ''}`}
                  onClick={() => setActiveTab('features')}
                >
                  <i className="fas fa-list-check"></i>
                  Features
                </button>
                <button
                  className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  <i className="fas fa-info-circle"></i>
                  Details
                </button>
                <button
                  className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`}
                  onClick={() => setActiveTab('faq')}
                >
                  <i className="fas fa-question-circle"></i>
                  FAQ
                </button>
              </div>

              <div className="tabs-content">
                {activeTab === 'features' && (
                  <div className="tab-panel">
                    <h3>What's Included:</h3>
                    <ul className="features-list">
                      {(service.features || [
                        'High Quality Service',
                        'Fast Delivery',
                        '24/7 Support',
                        'No Password Required',
                        'Safe & Secure'
                      ]).map((f, i) => (
                        <li key={i}>
                          <div className="feature-icon">
                            <i className="fas fa-check-circle"></i>
                          </div>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="tab-panel">
                    <h3>Service Details:</h3>
                    <div className="details-grid">
                      <div className="detail-item">
                        <i className="fas fa-bolt"></i>
                        <div>
                          <strong>Start Time</strong>
                          <p>Instant - 1 Hour</p>
                        </div>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-rocket"></i>
                        <div>
                          <strong>Speed</strong>
                          <p>Fast Delivery</p>
                        </div>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-shield-alt"></i>
                        <div>
                          <strong>Quality</strong>
                          <p>Premium Quality</p>
                        </div>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-sync"></i>
                        <div>
                          <strong>Refill</strong>
                          <p>30 Days Guarantee</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'faq' && (
                  <div className="tab-panel">
                    <h3>Frequently Asked Questions:</h3>
                    <div className="faq-list">
                      <div className="faq-item">
                        <h4><i className="fas fa-question-circle"></i> How long does delivery take?</h4>
                        <p>Delivery starts within 0-1 hours and completes based on the quantity ordered.</p>
                      </div>
                      <div className="faq-item">
                        <h4><i className="fas fa-question-circle"></i> Is it safe to use?</h4>
                        <p>Yes, absolutely! Our services are 100% safe and compliant with platform guidelines.</p>
                      </div>
                      <div className="faq-item">
                        <h4><i className="fas fa-question-circle"></i> Do you offer refills?</h4>
                        <p>Yes, we provide 30 days refill guarantee on all our premium services.</p>
                      </div>
                      <div className="faq-item">
                        <h4><i className="fas fa-question-circle"></i> What payment methods do you accept?</h4>
                        <p>We accept all major payment methods including UPI, cards, and wallets.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="info-card trust-card">
              <h3>Why Choose Us?</h3>
              <div className="trust-grid">
                <div className="trust-item">
                  <i className="fas fa-shield-check"></i>
                  <h4>100% Safe</h4>
                  <p>Secure & Reliable</p>
                </div>
                <div className="trust-item">
                  <i className="fas fa-headset"></i>
                  <h4>24/7 Support</h4>
                  <p>Always Here to Help</p>
                </div>
                <div className="trust-item">
                  <i className="fas fa-bolt"></i>
                  <h4>Instant Start</h4>
                  <p>Quick Processing</p>
                </div>
                <div className="trust-item">
                  <i className="fas fa-award"></i>
                  <h4>Premium Quality</h4>
                  <p>Best Results</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Card (Sticky) */}
          <div className="order-column">
            <div className="order-card sticky-card">
              <div className="order-card-header">
                <h2>Place Your Order</h2>
                <p>Choose quantity and proceed to checkout</p>
              </div>

              <div className="order-card-body">
              
                {/* Order Button */}
                <button
                  className="btn-order-now"
                  onClick={() => navigate(`/checkout/${service._id || service.id}`)}
                  disabled={quantity <= 0}
                >
                  <i className="fas fa-shopping-cart"></i>
                  <span>Proceed to Checkout</span>
                  <i className="fas fa-arrow-right"></i>
                </button>

                {/* Additional Info */}
                <div className="order-info">
                  <div className="info-item">
                    <i className="fas fa-lock"></i>
                    <span>Secure Payment</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-undo"></i>
                    <span>Money Back Guarantee</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info Banner */}
              {service.deliveryTime && (
                <div className="delivery-banner">
                  <i className="fas fa-truck"></i>
                  <div>
                    <strong>Fast Delivery</strong>
                    <p>{service.deliveryTime}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Need Help Card */}
            <div className="help-card">
              <i className="fas fa-headset"></i>
              <h3>Need Help?</h3>
              <p>Our support team is available 24/7 to assist you</p>
              <button className="btn-contact">
                <i className="fas fa-comment"></i>
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
