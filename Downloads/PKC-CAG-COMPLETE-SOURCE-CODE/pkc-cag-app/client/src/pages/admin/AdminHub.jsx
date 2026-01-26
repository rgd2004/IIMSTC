// client/src/pages/admin/AdminHub.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminHub.css';

const AdminHub = () => {
  const navigate = useNavigate();
  const adminOptions = [
    {
      id: 1,
      title: 'Analytics Dashboard',
      icon: '📊',
      description: 'View platform statistics and performance metrics',
      link: '/admin/analytics',
      color: '#667eea',
    },
    {
      id: 2,
      title: 'Coupon Management',
      icon: '🎟️',
      description: 'Create and manage promotional coupons',
      link: '/admin/coupons',
      color: '#764ba2',
    },
    {
      id: 3,
      title: 'Review Moderation',
      icon: '⭐',
      description: 'Moderate and manage user reviews',
      link: '/admin/reviews',
      color: '#f093fb',
    },
    {
      id: 4,
      title: 'Role Management',
      icon: '👥',
      description: 'Manage user roles and permissions',
      link: '/admin/roles',
      color: '#4facfe',
    },
    {
      id: 5,
      title: 'Order Management',
      icon: '📦',
      description: 'View and manage all customer orders',
      link: '/admin/orders',
      color: '#ff6b6b',
    },
    {
      id: 6,
      title: 'Customer Messages',
      icon: '📬',
      description: 'Respond to customer inquiries and support tickets',
      link: '/admin/messages',
      color: '#00f2fe',
    },
    {
      id: 7,
      title: 'User Management',
      icon: '👨‍💼',
      description: 'Manage all users on the platform',
      link: '/admin/users',
      color: '#43e97b',
    },
    {
      id: 8,
      title: 'System Logs',
      icon: '📋',
      description: 'View system activity and audit logs',
      link: '/admin/logs',
      color: '#fa709a',
    },
    {
      id: 9,
      title: 'Announcements',
      icon: '📢',
      description: 'Post updates and announcements',
      link: '/admin/updates',
      color: '#fee140',
    },
    {
      id: 10,
      title: 'Withdrawals',
      icon: '💸',
      description: 'Manage user withdrawal requests',
      link: '/admin/withdrawals',
      color: '#30cfd0',
    },
    {
      id: 13,
      title: 'Activity Monitor',
      icon: '👁️',
      description: 'Track all user and admin activities',
      link: '/admin/activities',
      color: '#8b5cf6',
    },
    // Dispute management and freelancing hub options removed (freelancing-only)
    {
      id: 15,
      title: 'E-Books Management',
      icon: '📚',
      description: 'Create, edit, and manage e-books for sale',
      link: '/admin/ebooks',
      color: '#667eea',
    },
    {
      id: 16,
      title: 'Job Assistance Applications',
      icon: '💼',
      description: 'Review and manage job assistance applications',
      link: '/admin/job-applications',
      color: '#667eea',
    },
  ];

  return (
    <div className="admin-hub-container">
      {/* Header Section */}
      <div className="admin-hub-header">
        <div className="header-content">
          <h1>🏛️ Admin Control Center</h1>
          <p>Access all admin management tools and features</p>
        </div>
        {/* Freelancing Hub switch removed */}
      </div>

      {/* Stats Section */}
      <div className="admin-hub-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Admin Tools</h3>
            <p>16 Options Available</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚙️</div>
          <div className="stat-info">
            <h3>System Status</h3>
            <p>✅ All Systems Operational</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <h3>Platform Health</h3>
            <p>📊 Excellent Performance</p>
          </div>
        </div>
      </div>

      {/* Admin Options Grid */}
      <div className="admin-hub-grid">
        {adminOptions.map((option) => (
          <Link
            to={option.link}
            key={option.id}
            className="admin-option-card"
            style={{
              '--accent-color': option.color,
            }}
          >
            <div className="card-icon">{option.icon}</div>
            <h3>{option.title}</h3>
            <p>{option.description}</p>
            <div className="card-footer">
              <span className="arrow">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Access Section */}
      <div className="admin-hub-footer">
        <div className="quick-links">
          <h3>⚡ Quick Actions</h3>
          <div className="quick-links-grid">

            <Link to="/admin/activities" className="quick-link">
              👁️ Monitor Activities
            </Link>
            <Link to="/admin/orders" className="quick-link">
              View Orders
            </Link>
            <Link to="/admin/analytics" className="quick-link">
              View Analytics
            </Link>
            <Link to="/admin/messages" className="quick-link">
              Check Messages
            </Link>
            <Link to="/admin/coupons" className="quick-link">
              Manage Coupons
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHub;
