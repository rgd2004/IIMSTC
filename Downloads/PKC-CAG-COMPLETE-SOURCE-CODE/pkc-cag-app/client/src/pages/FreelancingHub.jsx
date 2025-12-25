import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { marketplaceAPI, adminAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './FreelancingHub.css';

const FreelancingHub = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeContracts: 0,
    completedJobs: 0,
    totalEarnings: 0,
    avgRating: 0,
    pendingApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchFreelancingStats();
  }, []);

  const fetchFreelancingStats = async () => {
    setLoading(true);
    try {
      // Fetch contracts
      const contractsRes = await marketplaceAPI.getMyContracts();
      const contracts = contractsRes?.data || [];
      
      const active = contracts.filter(c => c.status === 'active').length;
      const completed = contracts.filter(c => c.status === 'completed').length;
      const total = contracts.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
      const avgRating = contracts.length > 0 
        ? contracts.reduce((sum, c) => sum + (c.rating || 0), 0) / contracts.length 
        : 0;

      setStats({
        activeContracts: active,
        completedJobs: completed,
        totalEarnings: total,
        avgRating: avgRating.toFixed(1),
        pendingApplications: contracts.filter(c => c.status === 'active' && !c.workSubmission).length,
      });
    } catch (error) {
      console.error('Error fetching freelancing stats:', error);
      // Set default stats on error instead of showing error toast
      setStats({
        activeContracts: 0,
        completedJobs: 0,
        totalEarnings: 0,
        avgRating: 0,
        pendingApplications: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const menuOptions = [
    {
      id: 1,
      title: 'Browse Jobs',
      icon: '🔍',
      description: 'Find new freelancing opportunities',
      link: '/marketplace/browse',
      color: '#667eea',
    },
    {
      id: 2,
      title: 'Browse Talent',
      icon: '👥',
      description: 'Find and hire skilled freelancers',
      link: '/marketplace/talent',
      color: '#764ba2',
    },
    {
      id: 3,
      title: 'My Jobs',
      icon: '📝',
      description: 'Manage jobs you posted',
      link: '/marketplace/my-jobs',
      color: '#f093fb',
    },
    {
      id: 4,
      title: 'My Contracts',
      icon: '📜',
      description: 'View and manage your contracts',
      link: '/marketplace/contracts',
      color: '#4facfe',
    },
    {
      id: 5,
      title: 'View Profile',
      icon: '👤',
      description: 'View and edit your profile',
      link: '/marketplace/profile',
      color: '#43e97b',
    },
    {
      id: 6,
      title: 'Disputes',
      icon: '⚠️',
      description: 'Manage contract disputes',
      link: '/marketplace/disputes',
      color: '#fa709a',
    },
  ];

  if (loading) {
    return <div className="freelancing-hub-container"><p>Loading freelancing hub...</p></div>;
  }

  return (
    <div className="freelancing-hub-container">
      {/* Header Section */}
      <div className="freelancing-hub-header">
        <div className="header-content">
          <h1>💼 Freelancing Hub</h1>
          <p>Manage your freelancing career and opportunities</p>
        </div>
        <button 
          className="switch-hub-btn"
          onClick={() => navigate('/user-hub')}
          title="Switch to Main User Hub"
        >
          🏠 Back to Hub
        </button>
      </div>

      {/* Quick Stats */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-value">{stats.activeContracts}</div>
          <div className="stat-label">Active Contracts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completedJobs}</div>
          <div className="stat-label">Completed Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">₹{stats.totalEarnings.toLocaleString()}</div>
          <div className="stat-label">Total Earnings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">⭐ {stats.avgRating}</div>
          <div className="stat-label">Avg Rating</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-section">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Available Jobs
        </button>
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Work ({stats.pendingApplications})
        </button>
      </div>

      {/* Content */}
      <div className="content-section">
        {activeTab === 'overview' && (
          <div className="menu-grid">
            {menuOptions.map((option) => (
              <Link
                key={option.id}
                to={option.link}
                className="menu-card"
                style={{ borderTopColor: option.color }}
              >
                <div className="menu-icon">{option.icon}</div>
                <div className="menu-content">
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="jobs-section">
            <h2>Available Freelancing Opportunities</h2>
            <p>Browse and apply for freelancing jobs that match your skills.</p>
            <Link to="/marketplace/browse" className="browse-jobs-btn">
              Browse Jobs
            </Link>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="pending-section">
            <h2>Pending Work Submissions</h2>
            <p>You have {stats.pendingApplications} contracts awaiting work submission.</p>
            <Link to="/marketplace/my-contracts" className="view-contracts-btn">
              View Contracts
            </Link>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <Link to="/marketplace/browse" className="action-btn primary">
            🔍 Find Jobs
          </Link>
          <Link to="/marketplace/contracts" className="action-btn">
            📜 My Contracts
          </Link>
          <Link to="/marketplace/profile" className="action-btn">
            👤 My Profile
          </Link>
          <button className="action-btn" onClick={() => navigate(-1)}>
            ← Back to Main Hub
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreelancingHub;
