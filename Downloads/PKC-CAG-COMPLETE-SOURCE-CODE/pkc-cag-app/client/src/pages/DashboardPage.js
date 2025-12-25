import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ordersAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "./DashboardPage.css";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, processing: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await ordersAPI.getMyOrders();
        const data = res.data.orders || [];

        setOrders(data);

        setStats({
          total: data.length,
          processing: data.filter((o) => o.status === "processing").length,
          completed: data.filter((o) => o.status === "completed").length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <div className="loader-glow"></div>
        </div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }) : "-";

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user?.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="dashboard-page">
      {/* Animated Background */}
      <div className="dashboard-background">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      <div className="container">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-content">
            <div className="welcome-text">
              <span className="greeting">{getGreeting()}</span>
              <h1>
                <span className="wave">👋</span>
                {user?.name}
              </h1>
              <p>Here's what's happening with your orders today</p>
            </div>
            <div className="welcome-actions">
              <button
                className="btn-primary-action"
                onClick={() => navigate('/services')}
              >
                <i className="fas fa-plus"></i>
                New Order
              </button>
              <button
                className="btn-secondary-action"
                onClick={() => navigate('/updates')}
              >
                <i className="fas fa-bullhorn"></i>
                Updates
              </button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="stat-card total">
            <div className="stat-background"></div>
            <div className="stat-icon total-icon">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <div className="stat-content">
              <p className="stat-value">{stats.total}</p>
              <p className="stat-label">Total Orders</p>
            </div>
            <div className="stat-trend">
              <i className="fas fa-chart-line"></i>
            </div>
          </div>

          <div className="stat-card processing">
            <div className="stat-background"></div>
            <div className="stat-icon processing-icon">
              <i className="fas fa-sync-alt"></i>
            </div>
            <div className="stat-content">
              <p className="stat-value">{stats.processing}</p>
              <p className="stat-label">Processing</p>
            </div>
            <div className="stat-pulse"></div>
          </div>

          <div className="stat-card completed">
            <div className="stat-background"></div>
            <div className="stat-icon completed-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <p className="stat-value">{stats.completed}</p>
              <p className="stat-label">Completed</p>
            </div>
            <div className="stat-sparkle">✨</div>
          </div>
        </section>

        {/* Orders Section */}
        <section className="orders-section">
          <div className="section-header">
            <div className="header-left">
              <h2>
                <i className="fas fa-box"></i> Your Orders
              </h2>
              {orders.length > 0 && (
                <span className="order-count">{orders.length} Order{orders.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="no-orders">
              <div className="no-orders-illustration">
                <div className="illustration-bg"></div>
                <i className="fas fa-inbox"></i>
              </div>
              <h3>No orders yet</h3>
              <p>Start exploring our services and place your first order</p>
              <button className="btn-browse" onClick={() => navigate('/services')}>
                <i className="fas fa-compass"></i>
                Browse Services
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-glow"></div>
                  
                  <div className="order-header">
                    <div className="order-info">
                      <h3>{order.service?.name || "Service"}</h3>
                      <p className="order-id">
                        <i className="fas fa-hashtag"></i>
                        {order._id.slice(-8)}
                      </p>
                    </div>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status === 'processing' && <i className="fas fa-spinner fa-spin"></i>}
                      {order.status === 'completed' && <i className="fas fa-check"></i>}
                      {order.status === 'pending' && <i className="fas fa-clock"></i>}
                      {order.status === 'cancelled' && <i className="fas fa-times"></i>}
                      <span>{order.status}</span>
                    </span>
                  </div>

                  <div className="order-details">
                    <div className="detail-item">
                      <div className="detail-icon">
                        <i className="fas fa-rupee-sign"></i>
                      </div>
                      <div className="detail-text">
                        <span className="detail-label">Amount</span>
                        <span className="detail-value">₹{order.amount}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon">
                        <i className="fas fa-cubes"></i>
                      </div>
                      <div className="detail-text">
                        <span className="detail-label">Quantity</span>
                        <span className="detail-value">{order.quantity}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon">
                        <i className="fas fa-calendar-alt"></i>
                      </div>
                      <div className="detail-text">
                        <span className="detail-label">Date</span>
                        <span className="detail-value">{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {order.status === 'completed' && (
                    <div className="order-completion">
                      <i className="fas fa-check-circle"></i>
                      <span>Order completed successfully</span>
                    </div>
                  )}

                  {order.status === 'processing' && (
                    <div className="delivery-estimate">
                      <i className="fas fa-truck"></i>
                      <span>Estimated delivery: 2-3 business days</span>
                    </div>
                  )}

                  <button
                    className="btn-view-order"
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    <span>View Details</span>
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Referral Section */}
        <section className="referral-section">
          <div className="referral-card">
            <div className="referral-background">
              <div className="referral-orb ref-orb-1"></div>
              <div className="referral-orb ref-orb-2"></div>
            </div>

            <div className="referral-header">
              <div className="referral-icon-large">
                <i className="fas fa-gift"></i>
              </div>
              <div className="referral-title">
                <h2>Invite Friends & Earn Rewards</h2>
                <p>Share your unique code and get rewarded</p>
              </div>
            </div>

            <div className="referral-body">
              <div className="referral-code-section">
                <label>Your Referral Code</label>
                <div className="referral-code-box">
                  <span className="code-text">{user?.referralCode}</span>
                  <button 
                    className={`btn-copy-code ${copied ? 'copied' : ''}`}
                    onClick={copyReferralCode}
                    title="Copy code"
                  >
                    {copied ? (
                      <>
                        <i className="fas fa-check"></i>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-copy"></i>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="referral-benefits">
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="fas fa-coins"></i>
                  </div>
                  <div className="benefit-text">
                    <h4>Earn ₹50</h4>
                    <p>For each friend who orders above ₹1500</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="benefit-text">
                    <h4>Unlimited Referrals</h4>
                    <p>No limit on how much you can earn</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="fas fa-bolt"></i>
                  </div>
                  <div className="benefit-text">
                    <h4>Instant Credit</h4>
                    <p>Rewards credited immediately</p>
                  </div>
                </div>
              </div>

              <button
                className="btn-referral-dashboard"
                onClick={() => navigate("/referral")}
              >
                <i className="fas fa-chart-line"></i>
                <span>Open Referral Dashboard</span>
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;