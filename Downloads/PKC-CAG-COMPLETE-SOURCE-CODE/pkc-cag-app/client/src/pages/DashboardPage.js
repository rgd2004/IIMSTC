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
        {/* Welcome Header - Full Width */}
        <section className="welcome-header">
          <div className="user-greeting">
            <span className="greeting-time">{getGreeting()}</span>
            <h1 className="user-name">
              <span className="wave">👋</span>
              {user?.name}
            </h1>
          </div>
        </section>

        {/* Stats Row - Horizontal Scroll on Mobile */}
        <section className="stats-row">
          <div className="stat-card-compact total">
            <div className="stat-icon-compact">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <div className="stat-info-compact">
              <span className="stat-label-compact">Total</span>
              <span className="stat-value-compact">{stats.total}</span>
            </div>
          </div>

          <div className="stat-card-compact processing">
            <div className="stat-icon-compact">
              <i className="fas fa-sync-alt"></i>
            </div>
            <div className="stat-info-compact">
              <span className="stat-label-compact">Processing</span>
              <span className="stat-value-compact">{stats.processing}</span>
            </div>
          </div>

          <div className="stat-card-compact completed">
            <div className="stat-icon-compact">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-info-compact">
              <span className="stat-label-compact">Completed</span>
              <span className="stat-value-compact">{stats.completed}</span>
            </div>
          </div>
        </section>

        {/* Your Orders Section */}
        <section className="orders-section-compact">
          <div className="section-title">
            <h2>Your Orders</h2>
            {orders.length > 0 && (
              <span className="order-badge">{orders.length}</span>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-icon">
                <i className="fas fa-inbox"></i>
              </div>
              <h3>No orders yet</h3>
              <p>Start exploring our services</p>
              <button className="btn-new-order" onClick={() => navigate('/services')}>
                <i className="fas fa-plus"></i>
                New Order
              </button>
            </div>
          ) : (
            <div className="orders-stack">
              {orders.map((order, index) => (
                <div 
                  key={order._id} 
                  className="order-item"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  <div className="order-main">
                    <div className="order-left">
                      <div className="order-service-name">
                        {order.service?.name || "Service"}
                      </div>
                      <div className="order-meta">
                        <span className="order-id-short">#{order._id.slice(-6)}</span>
                        <span className="order-date">{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="order-right">
                      <div className="order-amount">₹{order.amount}</div>
                      <span className={`status-pill status-${order.status}`}>
                        {order.status === 'processing' && <i className="fas fa-spinner fa-spin"></i>}
                        {order.status === 'completed' && <i className="fas fa-check"></i>}
                        {order.status === 'pending' && <i className="fas fa-clock"></i>}
                        {order.status === 'cancelled' && <i className="fas fa-times"></i>}
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="order-arrow">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Referral Dashboard Section */}
        <section className="referral-section-compact">
          <div className="referral-content">
            <div className="referral-header-row">
              <div className="referral-icon-badge">
                <i className="fas fa-gift"></i>
              </div>
              <div className="referral-text">
                <h3>Referral Dashboard</h3>
                <p>Invite friends & earn rewards</p>
              </div>
            </div>

            <div className="referral-code-display">
              <div className="code-label">Your Referral Code</div>
              <div className="code-box">
                <span className="code">{user?.referralCode}</span>
                <button 
                  className={`btn-copy ${copied ? 'copied' : ''}`}
                  onClick={copyReferralCode}
                >
                  {copied ? (
                    <>
                      <i className="fas fa-check"></i>
                      Copied
                    </>
                  ) : (
                    <>
                      <i className="fas fa-copy"></i>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <button 
              className="btn-open-referral"
              onClick={() => navigate("/referral")}
            >
              <span>Open Referral Dashboard</span>
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </section>

        {/* Quick Actions - Bottom Fixed on Mobile */}
        <div className="quick-actions-mobile">
          <button 
            className="action-btn primary"
            onClick={() => navigate('/services')}
          >
            <i className="fas fa-plus"></i>
            <span>New Order</span>
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => navigate('/updates')}
          >
            <i className="fas fa-bullhorn"></i>
            <span>Updates</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
