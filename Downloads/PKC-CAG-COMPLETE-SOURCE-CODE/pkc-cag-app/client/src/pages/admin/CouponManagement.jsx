// client/src/pages/admin/CouponManagement.jsx
import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './CouponManagement.css';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscount: '',
    minPurchaseAmount: '',
    expiryDate: '',
    maxUsages: '',
    maxUsagePerUser: 1,
    campaignName: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, [page, filter]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await API.get(
        `/coupons/all?status=${filter}&page=${page}&limit=10`
      );
      setCoupons(response.data.data);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        minPurchaseAmount: parseFloat(formData.minPurchaseAmount) || 0,
        maxUsages: formData.maxUsages ? parseInt(formData.maxUsages) : null,
        maxUsagePerUser: parseInt(formData.maxUsagePerUser),
      };

      const response = await API.post('/coupons/create', payload);

      toast.success('Coupon created successfully');
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        maxDiscount: '',
        minPurchaseAmount: '',
        expiryDate: '',
        maxUsages: '',
        maxUsagePerUser: 1,
        campaignName: '',
      });
      setShowForm(false);
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await API.delete(`/coupons/${couponId}`);
        toast.success('Coupon deleted');
        fetchCoupons();
      } catch (error) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  return (
    <div className="coupon-management">
      <h1>🎟️ Coupon Management</h1>

      <div className="coupon-header">
        <div className="filter-group">
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
            <option value="all">All Coupons</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <button className="btn-create" onClick={() => setShowForm(!showForm)}>
          ➕ Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="coupon-form">
          <h2>Create New Coupon</h2>
          <form onSubmit={handleCreateCoupon}>
            <div className="form-grid">
              <div className="form-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., SAVE20"
                  required
                  maxLength="20"
                />
              </div>

              <div className="form-group">
                <label>Campaign Name</label>
                <input
                  type="text"
                  name="campaignName"
                  value={formData.campaignName}
                  onChange={handleInputChange}
                  placeholder="e.g., Holiday Sale"
                />
              </div>

              <div className="form-group">
                <label>Discount Type *</label>
                <select name="discountType" value={formData.discountType} onChange={handleInputChange}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Discount Value *</label>
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  placeholder={formData.discountType === 'percentage' ? '0-100' : 'Amount in ₹'}
                  step={formData.discountType === 'percentage' ? '1' : '0.01'}
                  required
                />
              </div>

              {formData.discountType === 'percentage' && (
                <div className="form-group">
                  <label>Max Discount (₹)</label>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={formData.maxDiscount}
                    onChange={handleInputChange}
                    placeholder="Cap on discount amount"
                    step="0.01"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Min Purchase Amount (₹)</label>
                <input
                  type="number"
                  name="minPurchaseAmount"
                  value={formData.minPurchaseAmount}
                  onChange={handleInputChange}
                  placeholder="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Expiry Date *</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Max Total Usages</label>
                <input
                  type="number"
                  name="maxUsages"
                  value={formData.maxUsages}
                  onChange={handleInputChange}
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="form-group">
                <label>Max Uses Per User *</label>
                <input
                  type="number"
                  name="maxUsagePerUser"
                  value={formData.maxUsagePerUser}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Coupon description..."
                  rows="3"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                Create Coupon
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading coupons...</p>
      ) : (
        <div className="coupons-list">
          {coupons.length === 0 ? (
            <p className="empty-state">No coupons found</p>
          ) : (
            <table className="coupons-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Campaign</th>
                  <th>Discount</th>
                  <th>Min Purchase</th>
                  <th>Expires</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id}>
                    <td><strong>{coupon.code}</strong></td>
                    <td>{coupon.campaignName || '-'}</td>
                    <td>
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`}
                    </td>
                    <td>₹{coupon.minPurchaseAmount}</td>
                    <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                    <td>
                      {coupon.currentUsages}/{coupon.maxUsages || '∞'}
                    </td>
                    <td>
                      {new Date() > new Date(coupon.expiryDate) ? (
                        <span className="status-expired">Expired</span>
                      ) : (
                        <span className="status-active">Active</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteCoupon(coupon._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponManagement;
