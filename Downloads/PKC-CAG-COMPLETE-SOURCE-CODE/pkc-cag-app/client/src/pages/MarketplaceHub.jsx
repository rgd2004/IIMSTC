// client/src/pages/MarketplaceHub.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { marketplaceAPI } from "../utils/api";
import "./MarketplaceHub.css";
import toast from "react-hot-toast";

const MarketplaceHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    myJobs: 0,
    myApplications: 0,
    activeContracts: 0,
    earnings: 0,
    profileComplete: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Load jobs
      const jobsRes = await marketplaceAPI.getMyJobs({ limit: 1 });
      const jobsCount = jobsRes.data?.pagination?.total || 0;

      // Load applications
      const appsRes = await marketplaceAPI.getMyApplications({ limit: 1 });
      const appsCount = appsRes.data?.pagination?.total || 0;

      // Load contracts
      const contractsRes = await marketplaceAPI.getMyContracts({ limit: 1 });
      const contracts = contractsRes.data?.data || [];
      const activeCount = contracts.filter((c) => c.status === "active").length;
      const totalEarnings = contracts.reduce((sum, c) => sum + (c.freelancerAmount || 0), 0);

      // Check if freelancer profile exists
      let profileComplete = false;
      try {
        await marketplaceAPI.getMyProfile();
        profileComplete = true;
      } catch (err) {
        profileComplete = false;
      }

      setStats({
        myJobs: jobsCount,
        myApplications: appsCount,
        activeContracts: activeCount,
        earnings: totalEarnings,
        profileComplete,
      });
    } catch (err) {
      console.error("Error loading marketplace stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const marketplaceOptions = [
    {
      id: 1,
      title: "🔍 Browse Jobs",
      icon: "📋",
      description: "Find freelance jobs that match your skills",
      link: "/marketplace/browse",
      action: "browse",
      color: "#667eea",
      badge: stats.myApplications > 0 ? `${stats.myApplications} Applied` : null,
    },
    {
      id: 1.5,
      title: "📬 My Applications",
      icon: "📨",
      description: "Track your job applications and their status",
      link: "/marketplace/my-applications",
      action: "applications",
      color: "#06b6d4",
      badge: stats.myApplications > 0 ? `${stats.myApplications} Total` : null,
    },
    {
      id: 2,
      title: "📝 Post a Job",
      icon: "✏️",
      description: "Post a job and hire freelancers",
      link: "/marketplace/post-job",
      action: "post",
      color: "#764ba2",
      badge: `${stats.myJobs} Posted`,
    },
    {
      id: 3,
      title: "💼 My Contracts",
      icon: "📄",
      description: "Manage active contracts and payments",
      link: "/marketplace/contracts",
      action: "contracts",
      color: "#f093fb",
      badge: `${stats.activeContracts} Active`,
    },
    {
      id: 4,
      title: "👨‍💻 My Profile",
      icon: "🎯",
      description: stats.profileComplete
        ? "Update your freelancer profile"
        : "⚠️ Complete your profile to get hired",
      link: "/marketplace/profile",
      action: "profile",
      color: stats.profileComplete ? "#f5af19" : "#ff6b6b",
      isIncomplete: !stats.profileComplete,
    },
    {
      id: 5,
      title: "⚖️ Disputes",
      icon: "🔔",
      description: "Manage contract disputes and resolutions",
      link: "/marketplace/disputes",
      action: "disputes",
      color: "#ee0979",
    },
    {
      id: 6,
      title: "👥 Browse Freelancers",
      icon: "🏆",
      description: "Find and hire talented freelancers",
      link: "/marketplace/talent",
      action: "talent",
      color: "#4facfe",
    },
  ];

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-spinner"></div>
        <p>Loading marketplace...</p>
      </div>
    );
  }

  return (
    <div className="marketplace-hub-container">
      {/* Animated Background */}
      <div className="animated-bg-hub">
        <div className="gradient-sphere sphere-hub-1"></div>
        <div className="gradient-sphere sphere-hub-2"></div>
        <div className="gradient-sphere sphere-hub-3"></div>
      </div>

      {/* Header Section */}
      <div className="marketplace-hub-header">
        <h1>💼 Freelancer Marketplace</h1>
        <p>Post jobs, find freelancers, and manage contracts - all in one place</p>
      </div>

      {/* Profile Alert */}
      {!stats.profileComplete && (
        <div className="profile-alert">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <h3>Complete Your Profile</h3>
            <p>Your freelancer profile is incomplete. Complete it to get hired by clients.</p>
            <Link to="/marketplace/profile" className="alert-button">
              Complete Profile →
            </Link>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="marketplace-stats">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>Posted Jobs</h3>
            <p className="stat-number">{stats.myJobs}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📨</div>
          <div className="stat-info">
            <h3>Applications</h3>
            <p className="stat-number">{stats.myApplications}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Active Contracts</h3>
            <p className="stat-number">{stats.activeContracts}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Earnings</h3>
            <p className="stat-number">₹{stats.earnings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Marketplace Options Grid */}
      <div className="marketplace-options-grid">
        {marketplaceOptions.map((option) => (
          <Link
            to={option.link}
            key={option.id}
            className={`marketplace-option-card ${option.isIncomplete ? "incomplete" : ""}`}
            style={{
              "--accent-color": option.color,
            }}
          >
            {option.badge && <div className="card-badge">{option.badge}</div>}
            {option.isIncomplete && (
              <div className="card-ribbon">⚠️ Incomplete</div>
            )}
            <div className="card-icon">{option.icon}</div>
            <h3>{option.title}</h3>
            <p>{option.description}</p>
            <div className="card-footer">
              <span className="arrow">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Start Guide */}
      <div className="marketplace-quick-guide">
        <h2>🚀 Quick Start Guide</h2>
        <div className="guide-steps">
          <div className="guide-step">
            <div className="step-number">1</div>
            <h4>Complete Your Profile</h4>
            <p>Add skills, portfolio, and certifications to stand out</p>
          </div>
          <div className="guide-step">
            <div className="step-number">2</div>
            <h4>Browse or Post Jobs</h4>
            <p>Find projects that match your skills or post your own</p>
          </div>
          <div className="guide-step">
            <div className="step-number">3</div>
            <h4>Submit Applications</h4>
            <p>Apply with a compelling proposal and pricing</p>
          </div>
          <div className="guide-step">
            <div className="step-number">4</div>
            <h4>Create Contract</h4>
            <p>Get hired and create a contract with agreed terms</p>
          </div>
          <div className="guide-step">
            <div className="step-number">5</div>
            <h4>Complete & Get Paid</h4>
            <p>Finish the work and receive 90% of earnings</p>
          </div>
        </div>
      </div>

      {/* Commission Info */}
      <div className="commission-info">
        <h3>💸 How Payments Work</h3>
        <div className="commission-breakdown">
          <div className="commission-item">
            <span className="label">Total Contract Amount:</span>
            <span className="value">100%</span>
          </div>
          <div className="commission-item">
            <span className="label">Platform Commission (10%):</span>
            <span className="value">10%</span>
          </div>
          <div className="commission-item highlight">
            <span className="label">Your Earnings:</span>
            <span className="value">90% ✅</span>
          </div>
        </div>
      </div>

      {/* Help & Support */}
      <div className="marketplace-footer">
        <div className="help-section">
          <h3>📞 Need Help?</h3>
          <div className="help-links">
            <Link to="/terms" className="help-link">
              📋 Terms & Conditions
            </Link>
            <Link to="/messages" className="help-link">
              💬 Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHub;
