// client/src/pages/UserHub.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ordersAPI, referralAPI } from "../utils/api";
import "./UserHub.css";

const UserHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    referralCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const ordersRes = await ordersAPI.getMyOrders();
      const orders = ordersRes.data.orders || [];

      setStats({
        totalOrders: orders.length,
        completedOrders: orders.filter((o) => o.status === "completed").length,
        pendingOrders: orders.filter((o) => o.status !== "completed").length,
        referralCount: 0,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const userHubOptions = [
    {
      id: 0,
      title: "Dashboard",
      icon: "📊",
      description: "View your orders and account overview",
      link: "/dashboard",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      iconBg: "#667eea",
    },
    {
      id: 1,
      title: "My Level",
      icon: "🎖️",
      description: "View your account level and unlock benefits",
      link: "/user-hub/level",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      iconBg: "#f093fb",
    },
    {
      id: 2,
      title: "Activity Feed",
      icon: "📝",
      description: "Track all your order and account activities",
      link: "/user-hub/activity",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      iconBg: "#4facfe",
    },
    {
      id: 3,
      title: "Messages",
      icon: "✉️",
      description: "Live chat with support team",
      link: "/messages",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      iconBg: "#43e97b",
    },
    {
      id: 4,
      title: "Referral Dashboard",
      icon: "🚀",
      description: "Manage referrals and earn commissions",
      link: "/referral-dashboard",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      iconBg: "#fa709a",
    },
    {
      id: 5,
      title: "My Reviews",
      icon: "✍️",
      description: "Write and manage your reviews",
      link: "/user-hub/reviews",
      gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      iconBg: "#30cfd0",
    },
    {
      id: 6,
      title: "All Reviews",
      icon: "📢",
      description: "View customer testimonials",
      link: "/reviews",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      iconBg: "#a8edea",
    },
    {
      id: 7,
      title: "Data Export",
      icon: "⬇️",
      description: "Download your personal data",
      link: "/user-hub/export",
      gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      iconBg: "#ff9a9e",
    },
    // Freelancing / marketplace cards removed
  ];

  if (loading) {
    return (
      <div className="hub-loading-screen">
        <div className="hub-loader">
          <div className="hub-loader-circle"></div>
          <div className="hub-loader-circle"></div>
          <div className="hub-loader-circle"></div>
        </div>
        <p className="hub-loading-text">Loading your hub...</p>
      </div>
    );
  }

  return (
    <div className="user-hub-redesign">
      {/* Animated Background */}
      <div className="hub-background">
        <div className="hub-gradient-orb orb-1"></div>
        <div className="hub-gradient-orb orb-2"></div>
        <div className="hub-gradient-orb orb-3"></div>
      </div>

      {/* Hero Header */}
      <div className="hub-hero">
        <div className="hub-hero-content">
          <div className="hub-hero-badge">
            <span className="badge-pulse"></span>
            <span className="badge-text">Welcome Back</span>
          </div>
          <h1 className="hub-hero-title">
            Hello, <span className="highlight">{user?.name}</span> 👋
          </h1>
          <p className="hub-hero-subtitle">
            Your personalized command center for everything PKC-CAG
          </p>
        </div>
        
        {/* Freelancing Hub switch removed */}
      </div>

      <div className="hub-content">
        {/* Stats Dashboard */}
        <div className="hub-stats-section">
          <div className="stats-grid">
            <div className="stat-card-modern total">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">📦</span>
              </div>
              <div className="stat-details">
                <span className="stat-value">{stats.totalOrders}</span>
                <span className="stat-label">Total Orders</span>
              </div>
              <div className="stat-trend up">↑ All time</div>
            </div>

            <div className="stat-card-modern completed">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">✅</span>
              </div>
              <div className="stat-details">
                <span className="stat-value">{stats.completedOrders}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-trend up">↑ Success</div>
            </div>

            <div className="stat-card-modern pending">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">⏳</span>
              </div>
              <div className="stat-details">
                <span className="stat-value">{stats.pendingOrders}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-trend">In progress</div>
            </div>

            <div className="stat-card-modern level">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">👤</span>
              </div>
              <div className="stat-details">
                <span className="stat-value">Level {user?.level || 1}</span>
                <span className="stat-label">{user?.name}</span>
              </div>
              <div className="stat-trend premium">⭐ Member</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-bar">
          <Link to="/dashboard" className="quick-action-btn">
            <span className="qa-icon">📊</span>
            <span>Dashboard</span>
          </Link>
          <Link to="/services" className="quick-action-btn">
            <span className="qa-icon">🛍️</span>
            <span>Services</span>
          </Link>
          <Link to="/profile" className="quick-action-btn">
            <span className="qa-icon">👤</span>
            <span>Profile</span>
          </Link>
        </div>

        {/* Hub Options Grid */}
        <div className="hub-options-container">
          <h2 className="section-heading">
            <span className="heading-icon">🎯</span>
            Explore Your Hub
          </h2>

          <div className="hub-options-grid">
            {userHubOptions.map((option) => (
              <Link
                to={option.link}
                key={option.id}
                className="hub-option-card-modern"
                style={{
                  "--card-gradient": option.gradient,
                }}
              >
                {option.isNew && (
                  <div className="new-badge">
                    <span>NEW</span>
                  </div>
                )}

                <div className="card-background">
                  <div className="card-gradient-overlay"></div>
                </div>

                <div className="card-content">
                  <div 
                    className="card-icon-modern"
                    style={{ background: option.iconBg }}
                  >
                    <span>{option.icon}</span>
                  </div>

                  <div className="card-text">
                    <h3 className="card-title">{option.title}</h3>
                    <p className="card-description">{option.description}</p>
                  </div>

                  <div className="card-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>

                <div className="card-hover-effect"></div>
              </Link>
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <div className="hub-info-banner">
          <div className="banner-icon">💡</div>
          <div className="banner-content">
            <h3>Pro Tip!</h3>
            <p>Complete your profile and verify your email to unlock exclusive features and benefits.</p>
          </div>
          <button className="banner-btn">Get Started →</button>
        </div>
      </div>
    </div>
  );
};

export default UserHub;
