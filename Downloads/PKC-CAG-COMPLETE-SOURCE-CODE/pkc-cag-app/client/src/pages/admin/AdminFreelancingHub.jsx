import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminFreelancingHub.css';

const AdminFreelancingHub = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalContracts: 0,
    activeContracts: 0,
    pendingWorkSubmissions: 0,
    totalFreelancers: 0,
    totalCommissionEarned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingReviewContracts, setPendingReviewContracts] = useState([]);

  useEffect(() => {
    fetchFreelancingStats();
  }, []);

  const fetchFreelancingStats = async () => {
    setLoading(true);
    try {
      const contractsRes = await adminAPI.getContracts();
      const contracts = contractsRes?.data || [];
      
      const active = contracts.filter(c => c.status === 'active').length;
      const pendingWork = contracts.filter(c => c.paymentWorkflow?.clientPaymentStatus === 'paid_to_admin' && !c.workSubmission).length;
      const commission = contracts.reduce((sum, c) => sum + (c.platformCommission || 0), 0);
      
      // Get contracts pending admin review (submitted work but not yet approved)
      const pending = contracts.filter(c => 
        c.paymentWorkflow?.workCompletionStatus === 'in_progress' && 
        c.paymentWorkflow?.adminApprovalStatus === 'pending_approval' &&
        c.workSubmission
      );
      
      // Count unique freelancers
      const freelancerIds = new Set(contracts.map(c => c.freelancerId?._id || c.freelancerId).filter(Boolean));

      setStats({
        totalContracts: contracts.length,
        activeContracts: active,
        pendingWorkSubmissions: pendingWork,
        totalFreelancers: freelancerIds.size,
        totalCommissionEarned: commission,
      });
      
      setPendingReviewContracts(pending);
    } catch (error) {
      console.error('Error fetching freelancing stats:', error);
      // Set default stats on error instead of showing error toast
      setStats({
        totalContracts: 0,
        activeContracts: 0,
        pendingWorkSubmissions: 0,
        totalFreelancers: 0,
        totalCommissionEarned: 0,
      });
      setPendingReviewContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const menuOptions = [
    {
      id: 1,
      title: 'All Contracts',
      icon: '📜',
      description: 'View and manage all freelancing contracts',
      link: '/admin/contracts',
      color: '#667eea',
    },
    {
      id: 2,
      title: 'All Jobs',
      icon: '💼',
      description: 'View and delete posted jobs',
      link: '/admin/jobs',
      color: '#764ba2',
    },
    {
      id: 3,
      title: 'Work Submissions',
      icon: '📝',
      description: 'Review work submitted by freelancers',
      link: '/admin/contracts',
      color: '#764ba2',
    },
    {
      id: 5,
      title: 'Applicants Payment Details',
      icon: '💳',
      description: 'View all applicants\' payment & contact information',
      link: '/admin/applicants-payment',
      color: '#10b981',
    },
    {
      id: 6,
      title: 'Payment Requests',
      icon: '💰',
      description: 'Review fund releases and payments',
      link: '/admin/payments',
      color: '#4facfe',
    },
    {
      id: 7,
      title: 'Refund Approvals',
      icon: '🔄',
      description: 'Approve or deny client refund requests',
      link: '/admin/refunds',
      color: '#ff9ff3',
    },
    {
      id: 8,
      title: 'Freelancer Reviews',
      icon: '⭐',
      description: 'Moderate freelancer ratings and reviews',
      link: '/admin/reviews',
      color: '#fee140',
    },
  ];

  if (loading) {
    return <div className="admin-freelancing-hub-container"><p>Loading freelancing hub...</p></div>;
  }

  return (
    <div className="admin-freelancing-hub-container">
      {/* Header Section */}
      <div className="admin-freelancing-hub-header">
        <div className="header-content">
          <h1>💼 Freelancing Hub (Admin)</h1>
          <p>Monitor and manage all freelancing activities on your platform</p>
        </div>
        <button 
          className="switch-hub-btn"
          onClick={() => navigate('/admin/hub')}
          title="Switch to Main Admin Hub"
        >
          🏠 Back to Hub
        </button>
      </div>

      {/* Quick Stats */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-value">{stats.totalContracts}</div>
          <div className="stat-label">Total Contracts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.activeContracts}</div>
          <div className="stat-label">Active Contracts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalFreelancers}</div>
          <div className="stat-label">Active Freelancers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">💰 ₹{stats.totalCommissionEarned.toLocaleString()}</div>
          <div className="stat-label">Commission Earned</div>
        </div>
      </div>

      {/* Alert for Pending Work */}
      {stats.pendingWorkSubmissions > 0 && (
        <div className="alert-section">
          <div className="alert-card warning">
            <span className="alert-icon">⚠️</span>
            <div className="alert-content">
              <h4>Pending Work Submissions</h4>
              <p>{stats.pendingWorkSubmissions} contracts are awaiting work submission from freelancers</p>
            </div>
            <Link to="/admin/contracts" className="alert-link">
              Review Now →
            </Link>
          </div>
        </div>
      )}

      {/* Alert for Work Pending Review */}
      {pendingReviewContracts.length > 0 && (
        <div className="alert-section">
          <div className="alert-card error">
            <span className="alert-icon">🔥</span>
            <div className="alert-content">
              <h4>Work Submissions Pending Review!</h4>
              <p>{pendingReviewContracts.length} work submission(s) waiting for your approval</p>
            </div>
            <button 
              className="alert-link"
              onClick={() => setActiveTab('pending')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}
            >
              Review Now →
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-section">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          🔥 Pending Review ({pendingReviewContracts.length})
        </button>
        <button 
          className={`tab ${activeTab === 'contracts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contracts')}
        >
          Contracts & Work
        </button>
        <button 
          className={`tab ${activeTab === 'freelancers' ? 'active' : ''}`}
          onClick={() => setActiveTab('freelancers')}
        >
          Freelancers
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

        {activeTab === 'pending' && (
          <div className="pending-review-section">
            <h2>🔥 Work Submissions Pending Your Review</h2>
            {pendingReviewContracts.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#f0fdf4', borderRadius: '8px' }}>
                <p style={{ fontSize: '16px', color: '#166534' }}>✅ No pending work submissions!</p>
              </div>
            ) : (
              <div className="pending-list">
                {pendingReviewContracts.map((contract) => (
                  <div key={contract._id} className="pending-card">
                    <div className="pending-header">
                      <div>
                        <h3>{contract.jobId?.title || 'Job'}</h3>
                        <p style={{ fontSize: '12px', color: '#666' }}>
                          Client: {contract.clientId?.name} | Freelancer: {contract.freelancerId?.name}
                        </p>
                      </div>
                      <div className="pending-amount">₹{contract.totalAmount?.toLocaleString()}</div>
                    </div>
                    <div className="pending-submitted">
                      Submitted: {new Date(contract.workSubmission?.submittedAt).toLocaleDateString()}
                    </div>
                    <div className="pending-actions">
                      <button 
                        className="btn-view"
                        onClick={() => navigate(`/admin/review-work/${contract._id}`)}
                      >
                        ✓ Approve / Reject Work
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="contracts-section">
            <h2>Contracts & Work Management</h2>
            <div className="section-grid">
              <Link to="/admin/contracts" className="section-card">
                <div className="card-icon">📜</div>
                <h3>View All Contracts</h3>
                <p>Manage {stats.totalContracts} contracts</p>
              </Link>
              <Link to="/admin/contracts" className="section-card highlight">
                <div className="card-icon">📝</div>
                <h3>Pending Work</h3>
                <p>{stats.pendingWorkSubmissions} awaiting submission</p>
              </Link>
              <Link to="/admin/payments" className="section-card">
                <div className="card-icon">💳</div>
                <h3>Payment Requests</h3>
                <p>Review fund releases & refunds</p>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'freelancers' && (
          <div className="freelancers-section">
            <h2>Freelancer Management</h2>
            <div className="section-grid">
              <Link to="/admin/users" className="section-card">
                <div className="card-icon">👥</div>
                <h3>Active Freelancers</h3>
                <p>Manage {stats.totalFreelancers} freelancers</p>
              </Link>
              <Link to="/admin/reviews" className="section-card">
                <div className="card-icon">⭐</div>
                <h3>Reviews & Ratings</h3>
                <p>Moderate freelancer reviews</p>
              </Link>
              <Link to="/admin/logs" className="section-card">
                <div className="card-icon">📋</div>
                <h3>Activity Logs</h3>
                <p>View freelancer activities</p>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <Link to="/admin/contracts" className="action-btn primary">
            📜 All Contracts
          </Link>
          <Link to="/admin/payments" className="action-btn">
            💳 Payment Requests
          </Link>
          <Link to="/admin/users" className="action-btn">
            👥 Freelancers
          </Link>

          <button className="action-btn" onClick={() => navigate('/admin')}>
            ← Back to Admin Hub
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminFreelancingHub;
