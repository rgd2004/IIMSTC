import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminOrderManagement.css';

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getAllOrders();
      setOrders(res.data.orders || []);
    } catch (err) {
      toast.error('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      console.log('Updating order:', orderId, 'to status:', newStatus);
      const response = await ordersAPI.updateOrderStatus(orderId, { status: newStatus });
      console.log('Update response:', response.data);
      toast.success('Order status updated');
      
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error response:', err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    const matchSearch =
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchStatus && matchPayment && matchSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getPaymentColor = (status) => {
    const colors = {
      paid: '#10b981',
      unpaid: '#ef4444',
      pending: '#f59e0b',
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="admin-order-management loading">
        <div className="loader-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-order-management">
      {/* Header */}
      <div className="order-header">
        <div className="header-content">
          <h1>
            <i className="fas fa-shopping-bag"></i>
            Order Management
          </h1>
          <p>View and manage all customer orders</p>
        </div>
        <button onClick={fetchOrders} className="refresh-btn">
          <i className="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Payment Status</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by Order ID, Email or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="order-stats">
        <div className="stat-card">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">{filteredOrders.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Revenue</span>
          <span className="stat-value">
            ₹{filteredOrders
              .filter(o => o.paymentStatus === 'paid')
              .reduce((sum, o) => sum + (o.amount || 0), 0)
              .toLocaleString()}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Completed</span>
          <span className="stat-value">
            {filteredOrders.filter(o => o.status === 'completed').length}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending</span>
          <span className="stat-value">
            {filteredOrders.filter(o => o.status === 'pending').length}
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-container">
        {filteredOrders.length ? (
          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-id">{order._id?.slice(-8)}</td>
                    <td className="customer-name">
                      <div>
                        <strong>{order.userId?.name || 'Unknown'}</strong>
                        <small>{order.userId?.email || '-'}</small>
                      </div>
                    </td>
                    <td className="service-name">
                      {order.serviceId?.name || 'N/A'}
                    </td>
                    <td className="amount">₹{(order.amount || 0).toLocaleString()}</td>
                    <td>
                      <span
                        className="badge payment"
                        style={{ backgroundColor: getPaymentColor(order.paymentStatus) }}
                      >
                        {order.paymentStatus || 'pending'}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge status"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="date">{formatDate(order.createdAt)}</td>
                    <td className="actions">
                      <button
                        className="action-btn view"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailModal(true);
                        }}
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-orders">
            <i className="fas fa-inbox"></i>
            <p>No orders found</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Order Info */}
              <div className="detail-section">
                <h3>Order Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Order ID</label>
                    <value>{selectedOrder._id}</value>
                  </div>
                  <div className="detail-item">
                    <label>Order Date</label>
                    <value>
                      {formatDate(selectedOrder.createdAt)} at{' '}
                      {formatTime(selectedOrder.createdAt)}
                    </value>
                  </div>
                  <div className="detail-item">
                    <label>Current Status</label>
                    <value>
                      <span
                        className="badge"
                        style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                      >
                        {selectedOrder.status}
                      </span>
                    </value>
                  </div>
                  <div className="detail-item">
                    <label>Payment Status</label>
                    <value>
                      <span
                        className="badge"
                        style={{ backgroundColor: getPaymentColor(selectedOrder.paymentStatus) }}
                      >
                        {selectedOrder.paymentStatus}
                      </span>
                    </value>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <value>{selectedOrder.userId?.name || '-'}</value>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <value>{selectedOrder.userId?.email || '-'}</value>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <value>{selectedOrder.userId?.phone || '-'}</value>
                  </div>
                  <div className="detail-item">
                    <label>User Level</label>
                    <value>{selectedOrder.userId?.userLevel || 'Standard'}</value>
                  </div>
                </div>
              </div>

              {/* Service Info */}
              <div className="detail-section">
                <h3>Service Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Service Name</label>
                    <value>{selectedOrder.serviceId?.name || '-'}</value>
                  </div>
                  <div className="detail-item">
                    <label>Category</label>
                    <value>{selectedOrder.serviceId?.category || '-'}</value>
                  </div>
                  <div className="detail-item">
                    <label>Price</label>
                    <value>₹{(selectedOrder.amount || 0).toLocaleString()}</value>
                  </div>
                  <div className="detail-item">
                    <label>Quantity</label>
                    <value>{selectedOrder.quantity || 1}</value>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              {selectedOrder.deliveryDetails && (
                <div className="detail-section">
                  <h3>Delivery Details</h3>
                  <div className="detail-grid">
                    <div className="detail-item full">
                      <label>Address</label>
                      <value>{selectedOrder.deliveryDetails.address || '-'}</value>
                    </div>
                    <div className="detail-item">
                      <label>City</label>
                      <value>{selectedOrder.deliveryDetails.city || '-'}</value>
                    </div>
                    <div className="detail-item">
                      <label>Postal Code</label>
                      <value>{selectedOrder.deliveryDetails.postalCode || '-'}</value>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div className="detail-section">
                <h3>Payment Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Transaction ID</label>
                    <value>{selectedOrder.transactionId || '-'}</value>
                  </div>
                  <div className="detail-item">
                    <label>Payment Method</label>
                    <value>{selectedOrder.paymentMethod || '-'}</value>
                  </div>
                  <div className="detail-item">
                    <label>Amount Paid</label>
                    <value>₹{(selectedOrder.amount || 0).toLocaleString()}</value>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="detail-section">
                <h3>Update Status</h3>
                <div className="status-buttons">
                  {['pending', 'processing', 'completed', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      className={`status-btn ${selectedOrder.status === status ? 'active' : ''}`}
                      onClick={() => updateOrderStatus(selectedOrder._id, status)}
                      disabled={updatingStatus === selectedOrder._id}
                      style={{
                        backgroundColor:
                          selectedOrder.status === status
                            ? getStatusColor(status)
                            : 'rgba(99, 102, 241, 0.1)',
                        color: selectedOrder.status === status ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="detail-section">
                  <h3>Notes</h3>
                  <div className="notes-box">{selectedOrder.notes}</div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="close-modal-btn"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderManagement;
