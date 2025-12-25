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
          <div className="loader-container">
            <div className="loader-spinner"></div>
            <div className="loader-glow"></div>
          </div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="profile-page">Profile not found</div>;
  }

  return (
    <div className="profile-page">
      {/* Background Effects */}
      <div className="profile-background">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      <div className="container">
        {/* Header */}
        <div className="profile-header-section">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <span>{profile.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="avatar-glow"></div>
          </div>
          <div className="profile-header-info">
            <h1>{profile.name}</h1>
            <p className="email">
              <i className="fas fa-envelope"></i>
              {profile.email}
            </p>
            <p className="member-since">
              <i className="fas fa-calendar-alt"></i>
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <i className="fas fa-user"></i>
            <span>Account</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <i className="fas fa-star"></i>
            <span>Reviews ({reviews.length})</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="fas fa-shopping-bag"></i>
            <span>Orders ({orders.length})</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <i className="fas fa-shield-alt"></i>
            <span>Security</span>
          </button>
        </div>

        {/* ACCOUNT TAB */}
        {activeTab === 'account' && (
          <div className="tab-content">
            {!editMode ? (
              <>
                {/* Stats Grid */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                      <i className="fas fa-shopping-bag"></i>
                    </div>
                    <div className="stat-info">
                      <p className="stat-value">{profile.totalOrders || 0}</p>
                      <p className="stat-label">Total Orders</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
                      <i className="fas fa-star"></i>
                    </div>
                    <div className="stat-info">
                      <p className="stat-value">{profile.totalReviews || 0}</p>
                      <p className="stat-label">Reviews</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }}>
                      <i className="fas fa-coins"></i>
                    </div>
                    <div className="stat-info">
                      <p className="stat-value">₹{(profile.referralEarnings || 0).toLocaleString()}</p>
                      <p className="stat-label">Referral Earnings</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-info">
                      <p className="stat-value">{profile.isVerified ? 'Verified' : 'Pending'}</p>
                      <p className="stat-label">Status</p>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="profile-details-card">
                  <h3>
                    <i className="fas fa-user-circle"></i>
                    Profile Information
                  </h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="label">Full Name</span>
                      <span className="value">{profile.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Email</span>
                      <span className="value">{profile.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone</span>
                      <span className="value">{profile.phone || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Account Status</span>
                      <span className="value status-active">
                        <i className="fas fa-check-circle"></i>
                        Active
                      </span>
                    </div>
                  </div>

                  <button onClick={() => setEditMode(true)} className="btn-edit">
                    <i className="fas fa-edit"></i>
                    Edit Profile
                  </button>
                </div>
              </>
            ) : (
              <div className="edit-form-card">
                <h3>
                  <i className="fas fa-edit"></i>
                  Edit Profile
                </h3>
                <form onSubmit={handleUpdateProfile} className="profile-form">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-user"></i>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-phone"></i>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-save">
                      <i className="fas fa-check"></i>
                      Save Changes
                    </button>
                    <button type="button" onClick={() => setEditMode(false)} className="btn-cancel">
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
          <div className="tab-content">
            <div className="content-card">
              <h3>
                <i className="fas fa-star"></i>
                My Reviews
              </h3>
              {reviews.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fas fa-star"></i>
                  </div>
                  <p>No reviews yet</p>
                  <Link to="/services" className="btn-primary">
                    <i className="fas fa-shopping-bag"></i>
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review._id} className="review-item">
                      <div className="review-header">
                        <h4>{review.serviceId?.name}</h4>
                        <div className="rating">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fas fa-star ${i < review.rating ? 'active' : ''}`}></i>
                          ))}
                        </div>
                      </div>
                      <p className="review-title">{review.title}</p>
                      <p className="review-comment">{review.comment}</p>
                      <div className="review-meta">
                        <span className={`status-badge status-${review.status}`}>
                          {review.status}
                        </span>
                        <span className="date">
                          <i className="fas fa-calendar-alt"></i>
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
          <div className="tab-content">
            <div className="content-card">
              <h3>
                <i className="fas fa-shopping-bag"></i>
                My Orders
              </h3>
              {orders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fas fa-shopping-bag"></i>
                  </div>
                  <p>No orders yet</p>
                  <Link to="/services" className="btn-primary">
                    <i className="fas fa-compass"></i>
                    Browse Services
                  </Link>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order._id} className="order-item">
                      <div className="order-header">
                        <h4>{order.service?.name}</h4>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="order-details">
                        <p>
                          <i className="fas fa-rupee-sign"></i>
                          <strong>Amount:</strong> ₹{(order.amount || 0).toLocaleString()}
                        </p>
                        <p>
                          <i className="fas fa-calendar-alt"></i>
                          <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link to={`/orders/${order._id}`} className="btn-view-order">
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
          <div className="tab-content">
            {/* Change Password */}
            <div className="security-card">
              <div className="security-header">
                <div className="security-icon">
                  <i className="fas fa-lock"></i>
                </div>
                <div>
                  <h3>Change Password</h3>
                  <p>Update your account password to keep it secure</p>
                </div>
              </div>
              {!showPasswordForm ? (
                <button onClick={() => setShowPasswordForm(true)} className="btn-action">
                  <i className="fas fa-key"></i>
                  Change Password
                </button>
              ) : (
                <form onSubmit={handleChangePassword} className="password-form">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-lock"></i>
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-key"></i>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-check"></i>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-save" disabled={changingPassword}>
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
                      className="btn-cancel"
                    >
                      <i className="fas fa-times"></i>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Download Data */}
            <div className="security-card">
              <div className="security-header">
                <div className="security-icon">
                  <i className="fas fa-download"></i>
                </div>
                <div>
                  <h3>Download Your Data</h3>
                  <p>Download a copy of all your account data (GDPR compliant)</p>
                </div>
              </div>
              <button onClick={handleDownloadData} className="btn-action">
                <i className="fas fa-download"></i>
                Download Account Data
              </button>
            </div>

            {/* Delete Account */}
            <div className="security-card danger">
              <div className="security-header">
                <div className="security-icon danger">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div>
                  <h3>Delete Account</h3>
                  <p>Permanently delete your account and all data. This cannot be undone.</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger"
              >
                <i className="fas fa-trash-alt"></i>
                Delete My Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <i className="fas fa-exclamation-triangle"></i>
              <h3>Delete Account?</h3>
            </div>
            <p className="modal-text">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div className="form-group">
              <label>Enter your password to confirm:</label>
              <input
                type="password"
                placeholder="Enter password"
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
                className="btn-cancel"
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