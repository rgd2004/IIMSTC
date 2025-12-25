// client/src/pages/UserLevelHub.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ordersAPI } from "../utils/api";
import "./UserLevelHub.css";

const UserLevelHub = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await ordersAPI.getMyOrders();
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const nextLevel = (user?.level || 1) + 1;
  const progress = ((user?.level || 1) / 10) * 100;

  return (
    <div className="user-level-hub">
      <div className="container">
        <Link to="/user-hub" className="back-btn">
          ← Back to User Hub
        </Link>

        <div className="level-header">
          <h1>📊 My Level</h1>
          <p>Track your account level and unlock exclusive benefits</p>
        </div>

        <div className="level-main">
          {/* Current Level Card */}
          <div className="level-card">
            <div className="level-display">
              <div className="level-badge">{user?.level || 1}</div>
              <h2>Level {user?.level || 1}</h2>
              <p className="level-subtitle">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Progress Bar */}
            <div className="progress-section">
              <div className="progress-info">
                <span>Progress to Level {nextLevel}</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="progress-percentage">{Math.round(progress)}%</div>
            </div>

            {/* Level Benefits */}
            <div className="benefits-section">
              <h3>🎁 Your Benefits:</h3>
              <ul className="benefits-list">
                <li>✅ Access to all premium services</li>
                <li>✅ 24/7 priority support</li>
                <li>✅ Exclusive discounts up to 20%</li>
                <li>✅ Higher referral commissions</li>
                <li>✅ Exclusive member deals</li>
                <li>✅ Early access to new features</li>
              </ul>
            </div>
          </div>

          {/* Level Tiers */}
          <div className="level-tiers">
            <h3>📈 Level Tiers</h3>
            <div className="tiers-grid">
              {[1, 2, 3, 4, 5].map((level) => (
                <div key={level} className={`tier-card ${level === (user?.level || 1) ? "active" : ""}`}>
                  <div className="tier-number">Level {level}</div>
                  <div className="tier-perks">
                    <p>💰 {level * 5}% Bonus</p>
                    <p>⭐ {level} Badges</p>
                    <p>🎁 {level} Rewards</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders Count */}
          <div className="orders-info">
            <h3>📦 Your Activity</h3>
            <div className="activity-stats">
              <div className="stat">
                <div className="stat-number">{orders.length}</div>
                <div className="stat-label">Total Orders</div>
              </div>
              <div className="stat">
                <div className="stat-number">{orders.filter((o) => o.status === "completed").length}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat">
                <div className="stat-number">{orders.filter((o) => o.status !== "completed").length}</div>
                <div className="stat-label">Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLevelHub;
