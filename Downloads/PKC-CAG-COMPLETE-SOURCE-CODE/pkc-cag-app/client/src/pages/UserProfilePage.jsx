import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [activeTab, setActiveTab] = useState('account');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, reviewsRes, ordersRes] = await Promise.all([
        API.get('/user-profile/me'),
        API.get('/user-profile/reviews'),
        API.get('/user-profile/orders'),
      ]);

      setProfile(profileRes.data.data);
      setReviews(reviewsRes.data.data);
      setOrders(ordersRes.data.data);
      setFormData({
        name: profileRes.data.data.name,
        phone: profileRes.data.data.phone,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await API.put('/user-profile/update', formData);
      toast.success('Profile updated successfully');
      setEditMode(false);
      fetchProfileData();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleDownloadData = async () => {
    try {
      const response = await API.get('/user-profile/download-data', {
        responseType: 'json',
      });

      const jsonString = JSON.stringify(response.data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `account-data-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('✅ Account data downloaded successfully');
    } catch (error) {
      console.error('Error downloading data:', error);
      toast.error('Failed to download account data');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password');
      return;
    }

    try {
      setDeleting(true);
      await API.post('/user-profile/delete-account', {
        password: deletePassword,
      });

      toast.success('🗑️ Account deleted successfully');
      setTimeout(() => {
        logout();
        navigate('/');
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setChangingPassword(true);
      await API.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success('✓ Password changed successfully');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-screen">
          <div className="loading-content">
            <div className="loader-wrapper">
              <div className="loader-ring"></div>
              <div className="loader-ring"></div>
              <div className="loader-ring"></div>
              <div className="loader-core"></div>
            </div>
            <p className="loading-text">Loading your profile</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="error-state">
          <i className="fas fa-user-slash"></i>
          <p>Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="mesh-gradient"></div>
      </div>

      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <h2>My Profile</h2>
        <button className="settings-btn">
          <i className="fas fa-cog"></i>
        </button>
      </div>

      <div className="profile-container">
        {/* Profile Hero Card */}
        <div className="profile-hero">
          <div className="hero-bg-pattern"></div>
          <div className="hero-content">
            <div className="profile-avatar-wrapper">
              <div className="avatar-ring"></div>
              <div className="avatar-glow-effect"></div>
              <div className="profile-avatar-circle">
                <span>{profile.name?.charAt(0).toUpperCase()}</span>
              </div>
              {profile.isVerified && (
                <div className="verified-badge">
                  <i className="fas fa-check"></i>
                </div>
              )}
            </div>
            
            <div className="hero-info">
              <h1 className="profile-name">{profile.name}</h1>
              <p className="profile-email">
                <i className="fas fa-envelope"></i>
                {profile.email}
              </p>
              <div className="profile-stats-mini">
                <div className="stat-mini">
                  <i className="fas fa-calendar-check"></i>
                  <span>Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="quick-stats">
            <div className="quick-stat-item" style={{'--stat-color': '#667eea'}}>
              <div className="stat-icon-wrapper">
                <i className="fas fa-shopping-bag"></i>
              </div>
              <div className="stat-details">
                <span className="stat-number">{profile.totalOrders || 0}</span>
                <span className="stat-label">Orders</span>
              </div>
            </div>
            
            <div className="quick-stat-item" style={{'--stat-color': '#f5576c'}}>
              <div className="stat-icon-wrapper">
                <i className="fas fa-star"></i>
              </div>
              <div className="stat-details">
                <span className="stat-number">{profile.totalReviews || 0}</span>
                <span className="stat-label">Reviews</span>
              </div>
            </div>
            
            <div className="quick-stat-item" style={{'--stat-color': '#38f9d7'}}>
              <div className="stat-icon-wrapper">
                <i className="fas fa-coins"></i>
              </div>
              <div className="stat-details">
                <span className="stat-number">₹{(profile.referralEarnings || 0).toLocaleString()}</span>
                <span className="stat-label">Earned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="tab-navigation">
          <div className="tab-scroll-wrapper">
            <button
              className={`nav-tab ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              <div className="tab-icon">
                <i className="fas fa-user"></i>
              </div>
              <span>Account</span>
            </button>
            
            <button
              className={`nav-tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <div className="tab-icon">
                <i className="fas fa-star"></i>
              </div>
              <span>Reviews</span>
              {reviews.length > 0 && <span className="tab-badge">{reviews.length}</span>}
            </button>
            
            <button
              className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <div className="tab-icon">
                <i className="fas fa-shopping-bag"></i>
              </div>
              <span>Orders</span>
              {orders.length > 0 && <span className="tab-badge">{orders.length}</span>}
            </button>
            
            <button
              className={`nav-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <div className="tab-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <span>Security</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content-wrapper">
          {/* ACCOUNT TAB */}
          {activeTab === 'account' && (
            <div className="tab-panel fade-in">
              {!editMode ? (
                <>
                  {/* Profile Information Card */}
                  <div className="info-card">
                    <div className="card-header">
                      <h3>
                        <i className="fas fa-user-circle"></i>
                        Profile Information
                      </h3>
                      <button className="icon-btn" onClick={() => setEditMode(true)}>
                        <i className="fas fa-edit"></i>
                      </button>
                    </div>
                    
                    <div className="info-grid">
                      <div className="info-item">
                        <div className="info-icon">
                          <i className="fas fa-user"></i>
                        </div>
                        <div className="info-content">
                          <span className="info-label">Full Name</span>
                          <span className="info-value">{profile.name}</span>
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-icon">
                          <i className="fas fa-envelope"></i>
                        </div>
                        <div className="info-content">
                          <span className="info-label">Email Address</span>
                          <span className="info-value">{profile.email}</span>
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-icon">
                          <i className="fas fa-phone"></i>
                        </div>
                        <div className="info-content">
                          <span className="info-label">Phone Number</span>
                          <span className="info-value">{profile.phone || 'Not provided'}</span>
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-icon">
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="info-content">
                          <span className="info-label">Account Status</span>
                          <span className="info-value status-badge status-success">
                            <i className="fas fa-check"></i>
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Stats */}
                  <div className="info-card">
                    <div className="card-header">
                      <h3>
                        <i className="fas fa-chart-line"></i>
                        Activity Overview
                      </h3>
                    </div>
                    
                    <div className="activity-stats">
                      <div className="activity-item">
                        <div className="activity-bar" style={{width: `${Math.min((profile.totalOrders || 0) * 10, 100)}%`, background: 'linear-gradient(90deg, #667eea, #764ba2)'}}></div>
                        <div className="activity-info">
                          <span className="activity-label">Total Orders</span>
                          <span className="activity-value">{profile.totalOrders || 0}</span>
                        </div>
                      </div>
                      
                      <div className="activity-item">
                        <div className="activity-bar" style={{width: `${Math.min((profile.totalReviews || 0) * 20, 100)}%`, background: 'linear-gradient(90deg, #f093fb, #f5576c)'}}></div>
                        <div className="activity-info">
                          <span className="activity-label">Total Reviews</span>
                          <span className="activity-value">{profile.totalReviews || 0}</span>
                        </div>
                      </div>
                      
                      <div className="activity-item">
                        <div className="activity-bar" style={{width: `${Math.min((profile.referralEarnings || 0) / 100, 100)}%`, background: 'linear-gradient(90deg, #43e97b, #38f9d7)'}}></div>
                        <div className="activity-info">
                          <span className="activity-label">Referral Earnings</span>
                          <span className="activity-value">₹{(profile.referralEarnings || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="info-card">
                  <div className="card-header">
                    <h3>
                      <i className="fas fa-edit"></i>
                      Edit Profile
                    </h3>
                  </div>
                  
                  <form onSubmit={handleUpdateProfile} className="profile-form">
                    <div className="form-field">
                      <label>
                        <i className="fas fa-user"></i>
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div className="form-field">
                      <label>
                        <i className="fas fa-phone"></i>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div className="form-actions-group">
                      <button type="submit" className="btn-primary">
                        <i className="fas fa-check"></i>
                        Save Changes
                      </button>
                      <button type="button" onClick={() => setEditMode(false)} className="btn-secondary">
                        <i className="fas fa-times"></i>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="tab-panel fade-in">
              <div className="info-card">
                <div className="card-header">
                  <h3>
                    <i className="fas fa-star"></i>
                    My Reviews
                  </h3>
                </div>
                
                {reviews.length === 0 ? (
                  <div className="empty-state-modern">
                    <div className="empty-illustration">
                      <i className="fas fa-star"></i>
                    </div>
                    <h4>No Reviews Yet</h4>
                    <p>Start shopping to leave your first review</p>
                    <Link to="/services" className="btn-primary">
                      <i className="fas fa-shopping-bag"></i>
                      Browse Services
                    </Link>
                  </div>
                ) : (
                  <div className="reviews-grid">
                    {reviews.map((review) => (
                      <div key={review._id} className="review-card">
                        <div className="review-card-header">
                          <h4>{review.serviceId?.name}</h4>
                          <div className="rating-stars">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`fas fa-star ${i < review.rating ? 'filled' : ''}`}></i>
                            ))}
                          </div>
                        </div>
                        
                        <p className="review-title">{review.title}</p>
                        <p className="review-text">{review.comment}</p>
                        
                        <div className="review-footer">
                          <span className={`status-badge status-${review.status}`}>
                            {review.status}
                          </span>
                          <span className="review-date">
                            <i className="fas fa-clock"></i>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="tab-panel fade-in">
              <div className="info-card">
                <div className="card-header">
                  <h3>
                    <i className="fas fa-shopping-bag"></i>
                    My Orders
                  </h3>
                </div>
                
                {orders.length === 0 ? (
                  <div className="empty-state-modern">
                    <div className="empty-illustration">
                      <i className="fas fa-shopping-bag"></i>
                    </div>
                    <h4>No Orders Yet</h4>
                    <p>Explore our services and place your first order</p>
                    <Link to="/services" className="btn-primary">
                      <i className="fas fa-compass"></i>
                      Explore Services
                    </Link>
                  </div>
                ) : (
                  <div className="orders-grid">
                    {orders.map((order) => (
                      <div key={order._id} className="order-card">
                        <div className="order-card-header">
                          <h4>{order.service?.name}</h4>
                          <span className={`status-badge status-${order.status}`}>
                            {order.status}
                          </span>
                        </div>
                        
                        <div className="order-info-grid">
                          <div className="order-info-item">
                            <i className="fas fa-rupee-sign"></i>
                            <div>
                              <span className="order-info-label">Amount</span>
                              <span className="order-info-value">₹{(order.amount || 0).toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="order-info-item">
                            <i className="fas fa-calendar"></i>
                            <div>
                              <span className="order-info-label">Order Date</span>
                              <span className="order-info-value">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Link to={`/orders/${order._id}`} className="btn-view-details">
                          View Details
                          <i className="fas fa-arrow-right"></i>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="tab-panel fade-in">
              {/* Change Password */}
              <div className="info-card">
                <div className="card-header">
                  <div className="header-with-icon">
                    <div className="feature-icon" style={{'--feature-color': '#667eea'}}>
                      <i className="fas fa-lock"></i>
                    </div>
                    <div>
                      <h3>Change Password</h3>
                      <p>Keep your account secure with a strong password</p>
                    </div>
                  </div>
                </div>
                
                {!showPasswordForm ? (
                  <button onClick={() => setShowPasswordForm(true)} className="btn-primary">
                    <i className="fas fa-key"></i>
                    Change Password
                  </button>
                ) : (
                  <form onSubmit={handleChangePassword} className="profile-form">
                    <div className="form-field">
                      <label>
                        <i className="fas fa-lock"></i>
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                    
                    <div className="form-field">
                      <label>
                        <i className="fas fa-key"></i>
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Minimum 6 characters"
                        required
                      />
                    </div>
                    
                    <div className="form-field">
                      <label>
                        <i className="fas fa-check"></i>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Re-enter new password"
                        required
                      />
                    </div>
                    
                    <div className="form-actions-group">
                      <button type="submit" className="btn-primary" disabled={changingPassword}>
                        {changingPassword ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Changing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check"></i>
                            Change Password
                          </>
                        )}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }} 
                        className="btn-secondary"
                      >
                        <i className="fas fa-times"></i>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Download Data */}
              <div className="info-card">
                <div className="card-header">
                  <div className="header-with-icon">
                    <div className="feature-icon" style={{'--feature-color': '#38f9d7'}}>
                      <i className="fas fa-download"></i>
                    </div>
                    <div>
                      <h3>Download Your Data</h3>
                      <p>Get a copy of your account data (GDPR compliant)</p>
                    </div>
                  </div>
                </div>
                
                <button onClick={handleDownloadData} className="btn-primary">
                  <i className="fas fa-download"></i>
                  Download Account Data
                </button>
              </div>

              {/* Delete Account */}
              <div className="info-card danger-card">
                <div className="card-header">
                  <div className="header-with-icon">
                    <div className="feature-icon danger" style={{'--feature-color': '#ef4444'}}>
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div>
                      <h3>Delete Account</h3>
                      <p>Permanently delete your account and all data</p>
                    </div>
                  </div>
                </div>
                
                <div className="danger-warning">
                  <i className="fas fa-info-circle"></i>
                  <p>This action cannot be undone. All your data will be permanently deleted.</p>
                </div>
                
                <button onClick={() => setShowDeleteModal(true)} className="btn-danger">
                  <i className="fas fa-trash-alt"></i>
                  Delete My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Delete Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrapper danger">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            
            <h3 className="modal-title">Delete Account?</h3>
            <p className="modal-description">
              This will permanently delete your account and all associated data. 
              This action cannot be undone.
            </p>
            
            <div className="form-field">
              <label>
                <i className="fas fa-lock"></i>
                Enter your password to confirm
              </label>
              <input
                type="password"
                placeholder="Password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </div>
            
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="btn-danger"
              >
                {deleting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt"></i>
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;