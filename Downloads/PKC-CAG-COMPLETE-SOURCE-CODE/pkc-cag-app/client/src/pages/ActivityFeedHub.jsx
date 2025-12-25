import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ordersAPI } from "../utils/api";
import "./ActivityFeedHub.css";

const ActivityFeedHub = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const ordersRes = await ordersAPI.getMyOrders();
      const orders = ordersRes.data.orders || [];

      const activityList = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((order) => ({
          id: order._id,
          type: "order",
          title: `Order #${order.orderNumber || order._id.slice(0, 8).toUpperCase()}`,
          description: `Service: ${order.serviceName || "Unknown"}`,
          status: order.status,
          timestamp: order.createdAt,
          amount: order.totalPrice,
          icon: getStatusIcon(order.status),
          color: getStatusColor(order.status),
        }));

      setActivities(activityList);
    } catch (err) {
      console.error("Error loading activities:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: "clock",
      processing: "cog",
      completed: "check-circle",
      cancelled: "times-circle",
      failed: "exclamation-triangle",
    };
    return icons[status] || "file-alt";
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      processing: "#3b82f6",
      completed: "#10b981",
      cancelled: "#ef4444",
      failed: "#f97316",
    };
    return colors[status] || "#6366f1";
  };

  const filteredActivities =
    filter === "all"
      ? activities
      : activities.filter((act) => act.status === filter);

  if (loading) {
    return (
      <div className="activity-feed-hub">
        <div className="loading-screen">
          <div className="loader-container">
            <div className="loader-spinner"></div>
            <div className="loader-glow"></div>
          </div>
          <p>Loading your activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-feed-hub">
      {/* Background Effects */}
      <div className="feed-background">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      <div className="container">
        {/* Header */}
        <div className="feed-header">
          <Link to="/user-hub" className="back-btn">
            <i className="fas fa-arrow-left"></i>
            <span>Back to Hub</span>
          </Link>

          <div className="header-content">
            <div className="header-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="header-text">
              <h1>Your Activity Feed</h1>
              <p>Track your recent orders and activities</p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              <i className="fas fa-list"></i>
              <span>All Activities</span>
              <span className="count">{activities.length}</span>
            </button>
            <button
              className={`filter-btn ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              <i className="fas fa-check-circle"></i>
              <span>Completed</span>
              <span className="count">
                {activities.filter((a) => a.status === "completed").length}
              </span>
            </button>
            <button
              className={`filter-btn ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              <i className="fas fa-clock"></i>
              <span>Pending</span>
              <span className="count">
                {activities.filter((a) => a.status === "pending").length}
              </span>
            </button>
            <button
              className={`filter-btn ${filter === "processing" ? "active" : ""}`}
              onClick={() => setFilter("processing")}
            >
              <i className="fas fa-cog"></i>
              <span>Processing</span>
              <span className="count">
                {activities.filter((a) => a.status === "processing").length}
              </span>
            </button>
          </div>
        </div>

        {/* Activities List */}
        <div className="activities-container">
          {filteredActivities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-illustration">
                <div className="empty-bg"></div>
                <i className="fas fa-inbox"></i>
              </div>
              <h3>No activities found</h3>
              <p>
                {filter === "all"
                  ? "You don't have any activities yet"
                  : `No ${filter} activities yet`}
              </p>
            </div>
          ) : (
            <div className="activities-list">
              {filteredActivities.map((activity, index) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-timeline">
                    <div
                      className="timeline-dot"
                      style={{ 
                        background: `linear-gradient(135deg, ${activity.color}, ${activity.color}dd)`,
                        boxShadow: `0 0 20px ${activity.color}66`
                      }}
                    >
                      <i className={`fas fa-${activity.icon}`}></i>
                    </div>
                    {index < filteredActivities.length - 1 && (
                      <div className="timeline-line"></div>
                    )}
                  </div>

                  <div className="activity-content">
                    <div className="activity-header">
                      <h3>{activity.title}</h3>
                      <span
                        className="status-badge"
                        style={{
                          background: `${activity.color}22`,
                          color: activity.color,
                          border: `2px solid ${activity.color}44`
                        }}
                      >
                        <i className={`fas fa-${activity.icon}`}></i>
                        {activity.status}
                      </span>
                    </div>

                    <p className="activity-description">{activity.description}</p>

                    <div className="activity-meta">
                      <div className="meta-item">
                        <i className="fas fa-rupee-sign"></i>
                        <span>₹{activity.amount}</span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-calendar-alt"></i>
                        <span>{formatDate(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
              <i className="fas fa-shopping-bag"></i>
            </div>
            <div className="stat-info">
              <p className="stat-value">{activities.length}</p>
              <p className="stat-label">Total Orders</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }}>
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-info">
              <p className="stat-value">
                {activities.filter((a) => a.status === "completed").length}
              </p>
              <p className="stat-label">Completed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-info">
              <p className="stat-value">
                {activities.filter((a) => a.status === "pending").length}
              </p>
              <p className="stat-label">Pending</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a, #fee140)' }}>
              <i className="fas fa-coins"></i>
            </div>
            <div className="stat-info">
              <p className="stat-value">
                ₹{activities.reduce((sum, a) => sum + a.amount, 0).toLocaleString()}
              </p>
              <p className="stat-label">Total Spent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatDate = (date) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(date).toLocaleDateString("en-US", options);
};

export default ActivityFeedHub;