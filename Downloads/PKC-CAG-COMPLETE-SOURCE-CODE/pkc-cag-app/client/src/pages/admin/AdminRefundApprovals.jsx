import React, { useState, useEffect } from 'react';
import './AdminRefundApprovals.css';
import { adminAPI } from '../../utils/api';

const AdminRefundApprovals = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [action, setAction] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchRefunds();
  }, [filter, sortBy]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching payment requests...');
      const response = await adminAPI.getPaymentRequests();
      console.log('✅ Raw response:', response);
      
      // Handle different response formats
      let paymentRequests = [];
      
      if (Array.isArray(response)) {
        paymentRequests = response;
      } else if (response && typeof response === 'object') {
        // Check for requests property
        if (Array.isArray(response.requests)) {
          paymentRequests = response.requests;
        } else if (response.data && Array.isArray(response.data)) {
          paymentRequests = response.data;
        } else if (response.data && response.data.requests) {
          paymentRequests = response.data.requests;
        }
      }
      
      console.log('📋 Payment requests extracted:', paymentRequests);
      
      // Filter for refunds only
      const refundRequests = paymentRequests.filter(req => req.type === 'refund');
      console.log('🔄 Refund requests:', refundRequests);
      
      // Apply status filter
      let filtered = refundRequests;
      if (filter !== 'all') {
        filtered = refundRequests.filter(req => req.status === filter);
      }
      
      // Sort
      if (sortBy === 'newest') {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortBy === 'amount_high') {
        filtered.sort((a, b) => b.amount - a.amount);
      } else if (sortBy === 'amount_low') {
        filtered.sort((a, b) => a.amount - b.amount);
      }
      
      console.log('✨ Final filtered refunds:', filtered);
      setRefunds(filtered);
    } catch (error) {
      console.error('❌ Error fetching refunds:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Failed to load refunds: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRefund = async () => {
    if (!window.confirm(`Approve refund of ₹${selectedRefund.amount.toLocaleString()}?`)) return;

    try {
      setActionLoading(true);
      await adminAPI.approveRefund(selectedRefund._id, {
        notes: approvalNotes,
      });
      
      alert('✅ Refund approved! Funds will be returned to client.');
      setAction(null);
      setSelectedRefund(null);
      setApprovalNotes('');
      fetchRefunds();
    } catch (error) {
      console.error('Error approving refund:', error);
      alert(error.response?.data?.message || 'Failed to approve refund');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDenyRefund = async () => {
    if (!approvalNotes.trim()) {
      alert('Please provide a reason for denial');
      return;
    }

    if (!window.confirm(`Deny refund of ₹${selectedRefund.amount.toLocaleString()}?`)) return;

    try {
      setActionLoading(true);
      await adminAPI.denyRefund(selectedRefund._id, {
        reason: approvalNotes,
      });
      
      alert('❌ Refund denied. Freelancer notified.');
      setAction(null);
      setSelectedRefund(null);
      setApprovalNotes('');
      fetchRefunds();
    } catch (error) {
      console.error('Error denying refund:', error);
      alert(error.response?.data?.message || 'Failed to deny refund');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badgeClasses = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
    };
    
    const badgeText = {
      pending: '⏳ Pending',
      approved: '✅ Approved',
      rejected: '❌ Rejected',
    };
    
    return <span className={`badge ${badgeClasses[status]}`}>{badgeText[status]}</span>;
  };

  const closeModal = () => {
    setAction(null);
    setSelectedRefund(null);
    setApprovalNotes('');
  };

  if (loading) {
    return (
      <div className="admin-refund-container">
        <p>Loading refunds...</p>
        <button onClick={fetchRefunds} style={{ marginTop: '10px', padding: '10px', cursor: 'pointer' }}>
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-refund-container">
      <div className="refund-header">
        <h1>💰 Refund Approval Management</h1>
        <p className="subtitle">Review and process client refund requests</p>
        <button 
          onClick={() => {
            setRefunds([]);
            fetchRefunds();
          }} 
          style={{ 
            marginTop: '10px', 
            padding: '8px 16px', 
            cursor: 'pointer', 
            background: '#27ae60', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="pending">⏳ Pending</option>
            <option value="approved">✅ Approved</option>
            <option value="rejected">❌ Rejected</option>
            <option value="all">All Refunds</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="amount_high">Amount (High to Low)</option>
            <option value="amount_low">Amount (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{refunds.filter(r => r.status === 'pending').length}</div>
          <div className="stat-label">Pending Refunds</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">₹{refunds.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}</div>
          <div className="stat-label">Pending Amount</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{refunds.filter(r => r.status === 'approved').length}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{refunds.filter(r => r.status === 'rejected').length}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {/* Refunds List */}
      {refunds.length === 0 ? (
        <div className="empty-state">
          <p>✨ No refunds to display</p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            {filter === 'pending' ? 'No pending refund requests yet.' : `No ${filter} refunds found.`}
          </p>
          <button onClick={fetchRefunds} style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}>
            🔄 Refresh
          </button>
        </div>
      ) : (
        <div className="refunds-list">
          {refunds.map((refund) => (
            <div key={refund._id} className="refund-card">
              <div className="refund-header-row">
                <div className="refund-amount">
                  <div className="amount-value">₹{refund.amount.toLocaleString()}</div>
                  <div className="amount-label">Refund Amount</div>
                </div>

                <div className="refund-details">
                  <div className="detail-item">
                    <span className="label">Client:</span>
                    <span className="value">{refund.clientId?.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Contract ID:</span>
                    <span className="value mono">{refund.contractId?._id.slice(0, 8)}...</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Requested:</span>
                    <span className="value">{new Date(refund.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {getStatusBadge(refund.status)}
              </div>

              <div className="refund-reason">
                <p><strong>📝 Refund Reason:</strong></p>
                <p className="reason-text">{refund.reason || 'No reason provided'}</p>
              </div>

              {refund.status === 'pending' && (
                <div className="refund-actions">
                  <button
                    className="btn-approve"
                    onClick={() => {
                      setSelectedRefund(refund);
                      setAction('approve');
                    }}
                  >
                    ✅ Approve Refund
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => {
                      setSelectedRefund(refund);
                      setAction('deny');
                    }}
                  >
                    ❌ Deny Refund
                  </button>
                </div>
              )}

              {refund.status !== 'pending' && refund.adminNotes && (
                <div className="refund-notes">
                  <p><strong>📌 Admin Notes:</strong></p>
                  <p>{refund.adminNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for Approval/Denial */}
      {selectedRefund && action && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {action === 'approve'
                  ? `✅ Approve Refund`
                  : `❌ Deny Refund`}
              </h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="refund-summary">
                <p><strong>Client:</strong> {selectedRefund.clientId?.name}</p>
                <p><strong>Refund Amount:</strong> <span className="amount">₹{selectedRefund.amount.toLocaleString()}</span></p>
                <p><strong>Reason:</strong> {selectedRefund.reason}</p>
                <p><strong>Requested:</strong> {new Date(selectedRefund.createdAt).toLocaleString()}</p>
              </div>

              <div className="form-group">
                <label>
                  {action === 'approve' ? 'Approval Notes (Optional):' : 'Denial Reason (Required):'}
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder={
                    action === 'approve'
                      ? 'Add any notes about the approval...'
                      : 'Explain why this refund is being denied...'
                  }
                  required={action === 'deny'}
                  rows="4"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal} disabled={actionLoading}>
                Cancel
              </button>
              <button
                className={action === 'approve' ? 'btn-approve' : 'btn-reject'}
                onClick={action === 'approve' ? handleApproveRefund : handleDenyRefund}
                disabled={actionLoading || (action === 'deny' && !approvalNotes.trim())}
              >
                {actionLoading ? '⏳ Processing...' : (action === 'approve' ? '✅ Confirm Approval' : '❌ Confirm Denial')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRefundApprovals;
