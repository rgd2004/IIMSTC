import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import './AdminPaymentRequests.css';

const AdminPaymentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [action, setAction] = useState(null); // 'approve_release', 'reject_release', 'approve_refund', 'deny_refund'
  const [paymentSentData, setPaymentSentData] = useState({
    transactionId: '',
    notes: '',
    showForm: false,
  });

  useEffect(() => {
    fetchRequests();
  }, [filter, typeFilter, page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        limit: 10,
      };

      if (filter !== 'all') params.status = filter;
      if (typeFilter !== 'all') params.type = typeFilter;

      const response = await adminAPI.getPaymentRequests(params);
      setRequests(response.data.requests || []);
      setTotal(response.data.pagination.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching payment requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRelease = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);

    try {
      await adminAPI.approveFundRelease(selectedRequest._id, {
        notes: actionNotes,
      });

      setSelectedRequest(null);
      setActionNotes('');
      setAction(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving release');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRelease = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);

    try {
      await adminAPI.rejectFundRelease(selectedRequest._id, {
        reason: actionNotes,
      });

      setSelectedRequest(null);
      setActionNotes('');
      setAction(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error rejecting release');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveRefund = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);

    try {
      await adminAPI.approveRefund(selectedRequest._id, {
        notes: actionNotes,
      });

      setSelectedRequest(null);
      setActionNotes('');
      setAction(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving refund');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDenyRefund = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);

    try {
      await adminAPI.denyRefund(selectedRequest._id, {
        reason: actionNotes,
      });

      setSelectedRequest(null);
      setActionNotes('');
      setAction(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error denying refund');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaymentSent = async () => {
    if (!selectedRequest || !paymentSentData.transactionId) {
      alert('Please enter a transaction ID');
      return;
    }

    setActionLoading(true);
    try {
      await adminAPI.markPaymentSent(selectedRequest._id, {
        transactionId: paymentSentData.transactionId,
        notes: paymentSentData.notes,
      });

      setSelectedRequest(null);
      setActionNotes('');
      setAction(null);
      setPaymentSentData({ transactionId: '', notes: '', showForm: false });
      fetchRequests();
      alert('✅ Payment marked as sent successfully! Freelancer notification sent.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error marking payment as sent');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-pending', text: '⏳ Pending' },
      approved: { class: 'badge-approved', text: '✅ Approved' },
      rejected: { class: 'badge-rejected', text: '❌ Rejected' },
      completed: { class: 'badge-completed', text: '✔️ Completed' },
    };
    return badges[status] || badges.pending;
  };

  const getTypeIcon = (type) => {
    return type === 'fund_release' ? '💰 Release' : '🔄 Refund';
  };

  if (selectedRequest && action) {
    return (
      <div className="payment-requests-container">
        <div className="action-modal">
          <div className="modal-header">
            <h2>{action === 'approve_release' ? '✅ Approve Fund Release' : action === 'approve_refund' ? '✅ Approve Refund' : '❌ Reject / Deny'}</h2>
            <button onClick={() => { setSelectedRequest(null); setAction(null); }} className="btn-close">×</button>
          </div>

          <div className="modal-body">
            <div className="request-details">
              {/* Payment Request Basic Info */}
              <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #e0e0e0' }}>
                <h4 style={{ marginBottom: '10px' }}>📋 Payment Request Details</h4>
                <div className="detail-row">
                  <span className="label">Type:</span>
                  <span>{getTypeIcon(selectedRequest.type)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span>{selectedRequest.status}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Total Amount:</span>
                  <span className="amount">₹{selectedRequest.amount}</span>
                </div>
                {selectedRequest.type === 'fund_release' && (
                  <>
                    <div className="detail-row">
                      <span className="label">💰 Freelancer Gets (90%):</span>
                      <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>₹{selectedRequest.freelancerAmount}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">💼 Admin Commission (10%):</span>
                      <span style={{ color: '#FF9800', fontWeight: 'bold' }}>₹{selectedRequest.adminCommission}</span>
                    </div>
                  </>
                )}
                <div className="detail-row">
                  <span className="label">Reason:</span>
                  <span>{selectedRequest.reason || 'N/A'}</span>
                </div>
              </div>

              {/* Contract Details */}
              {selectedRequest.contractId && (
                <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #e0e0e0' }}>
                  <h4 style={{ marginBottom: '10px' }}>📑 Contract Details</h4>
                  <div className="detail-row">
                    <span className="label">Contract ID:</span>
                    <span style={{ fontSize: '0.85em', fontFamily: 'monospace' }}>{selectedRequest.contractId?._id || selectedRequest.contractId}</span>
                  </div>
                  {selectedRequest.jobId && (
                    <div className="detail-row">
                      <span className="label">Job:</span>
                      <span>{selectedRequest.jobId?.title || 'N/A'}</span>
                    </div>
                  )}
                  {selectedRequest.clientId && (
                    <div className="detail-row">
                      <span className="label">Client:</span>
                      <span>{selectedRequest.clientId?.name || 'N/A'}</span>
                    </div>
                  )}
                  {selectedRequest.freelancerId && (
                    <div className="detail-row">
                      <span className="label">Freelancer:</span>
                      <span>{selectedRequest.freelancerId?.name || 'N/A'}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span>{selectedRequest.contractStatus || 'N/A'}</span>
                  </div>
                </div>
              )}

              {/* Freelancer Payment Receiving Details */}
              {selectedRequest.freelancerPaymentDetails && (
                <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #e0e0e0', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '6px' }}>
                  <h4 style={{ marginBottom: '10px', color: '#1976D2' }}>💳 Freelancer Payment Receiving Details</h4>
                  <div className="detail-row">
                    <span className="label">Payment Method:</span>
                    <span>
                      {selectedRequest.freelancerPaymentDetails.paymentMethod === 'upi' ? '📱 UPI Transfer' : '🏦 Bank Transfer'}
                    </span>
                  </div>
                  
                  {selectedRequest.freelancerPaymentDetails.paymentMethod === 'upi' && (
                    <div className="detail-row">
                      <span className="label">UPI ID:</span>
                      <span style={{ fontSize: '0.9em', fontFamily: 'monospace', backgroundColor: '#e3f2fd', padding: '4px 8px', borderRadius: '3px' }}>
                        {selectedRequest.freelancerPaymentDetails.upiId}
                      </span>
                    </div>
                  )}

                  {selectedRequest.freelancerPaymentDetails.paymentMethod === 'bank_transfer' && (
                    <>
                      <div className="detail-row">
                        <span className="label">Account Holder:</span>
                        <span>{selectedRequest.freelancerPaymentDetails.accountHolderName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Bank Name:</span>
                        <span>{selectedRequest.freelancerPaymentDetails.bankName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Account Number:</span>
                        <span style={{ fontSize: '0.9em', fontFamily: 'monospace', backgroundColor: '#e3f2fd', padding: '4px 8px', borderRadius: '3px' }}>
                          {selectedRequest.freelancerPaymentDetails.accountNumber}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">IFSC Code:</span>
                        <span style={{ fontSize: '0.9em', fontFamily: 'monospace', backgroundColor: '#e3f2fd', padding: '4px 8px', borderRadius: '3px' }}>
                          {selectedRequest.freelancerPaymentDetails.ifscCode}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {selectedRequest.freelancerPaymentDetails.addedAt && (
                    <div className="detail-row">
                      <span className="label">Details Added:</span>
                      <span>{new Date(selectedRequest.freelancerPaymentDetails.addedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Payment Sent Status */}
              {selectedRequest.adminPaymentSent && (
                <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #e0e0e0', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '6px' }}>
                  <h4 style={{ marginBottom: '10px', color: '#388E3C' }}>✅ Admin Payment Sent Status</h4>
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '3px',
                      backgroundColor: selectedRequest.adminPaymentSent.status === 'sent' ? '#4CAF50' : '#FF9800',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {selectedRequest.adminPaymentSent.status?.toUpperCase()}
                    </span>
                  </div>
                  {selectedRequest.adminPaymentSent.transactionId && (
                    <div className="detail-row">
                      <span className="label">Transaction ID:</span>
                      <span style={{ fontSize: '0.9em', fontFamily: 'monospace' }}>{selectedRequest.adminPaymentSent.transactionId}</span>
                    </div>
                  )}
                  {selectedRequest.adminPaymentSent.sentAt && (
                    <div className="detail-row">
                      <span className="label">Sent At:</span>
                      <span>{new Date(selectedRequest.adminPaymentSent.sentAt).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedRequest.adminPaymentSent.sentBy && (
                    <div className="detail-row">
                      <span className="label">Sent By:</span>
                      <span>{selectedRequest.adminPaymentSent.sentBy}</span>
                    </div>
                  )}
                  {selectedRequest.adminPaymentSent.notes && (
                    <div className="detail-row">
                      <span className="label">Notes:</span>
                      <span>{selectedRequest.adminPaymentSent.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Sent Form */}
            {paymentSentData.showForm && (
              <div style={{ background: '#f0f7f4', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #4CAF50' }}>
                <h4 style={{ marginBottom: '15px', color: '#4CAF50' }}>💰 Mark Payment as Sent</h4>
                <div className="form-group">
                  <label htmlFor="transactionId">
                    Transaction ID * <span style={{ color: '#999', fontSize: '0.9em' }}>(Required)</span>
                  </label>
                  <input
                    id="transactionId"
                    type="text"
                    value={paymentSentData.transactionId}
                    onChange={(e) => setPaymentSentData({ ...paymentSentData, transactionId: e.target.value })}
                    placeholder="Enter transaction ID, reference number, or UTR..."
                    required
                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'monospace' }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="paymentNotes">Optional Notes:</label>
                  <textarea
                    id="paymentNotes"
                    value={paymentSentData.notes}
                    onChange={(e) => setPaymentSentData({ ...paymentSentData, notes: e.target.value })}
                    placeholder="Add any additional notes or information about this payment..."
                    rows="2"
                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
            )}

            {/* Show form toggle for approved releases */}
            {selectedRequest?.status === 'approved' && selectedRequest?.type === 'fund_release' && !selectedRequest?.adminPaymentSent && !paymentSentData.showForm && (
              <button
                onClick={() => setPaymentSentData({ ...paymentSentData, showForm: true })}
                style={{
                  background: '#4CAF50',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                💳 Mark Payment as Sent to Freelancer
              </button>
            )}

            <div className="form-group">
              <label htmlFor="actionNotes">
                {action === 'approve_release' || action === 'approve_refund' ? 'Approval Notes:' : 'Rejection Reason:'}
              </label>
              <textarea
                id="actionNotes"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={action === 'approve_release' ? 'Optional notes for approval...' : 'Provide reason for rejection...'}
                rows="3"
                required={action === 'reject_release' || action === 'deny_refund'}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button 
              onClick={() => { 
                setSelectedRequest(null); 
                setAction(null); 
                setPaymentSentData({ transactionId: '', notes: '', showForm: false }); 
              }} 
              className="btn-cancel"
            >
              Cancel
            </button>
            
            {paymentSentData.showForm && (
              <>
                <button
                  onClick={() => setPaymentSentData({ ...paymentSentData, showForm: false })}
                  className="btn-cancel"
                >
                  Back
                </button>
                <button
                  onClick={handleMarkPaymentSent}
                  disabled={actionLoading}
                  className="btn-approve"
                  style={{ background: '#4CAF50' }}
                >
                  {actionLoading ? '⏳ Processing...' : '✅ Confirm Payment Sent'}
                </button>
              </>
            )}
            
            {!paymentSentData.showForm && action && (
              <button
                onClick={
                  action === 'approve_release'
                    ? handleApproveRelease
                    : action === 'reject_release'
                    ? handleRejectRelease
                    : action === 'approve_refund'
                    ? handleApproveRefund
                    : handleDenyRefund
                }
                disabled={actionLoading}
                className={`btn-action ${action.includes('approve') ? 'btn-approve' : 'btn-reject'}`}
              >
                {actionLoading ? '⏳ Processing...' : action === 'approve_release' || action === 'approve_refund' ? '✅ Confirm Approval' : '❌ Confirm Rejection'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-requests-container">
      <h1>💳 Payment Requests Management</h1>

      <div className="filters">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
            <option value="all">All Statuses</option>
            <option value="pending">⏳ Pending</option>
            <option value="approved">✅ Approved</option>
            <option value="rejected">❌ Rejected</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="all">All Types</option>
            <option value="fund_release">💰 Fund Releases</option>
            <option value="refund">🔄 Refunds</option>
          </select>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">⏳ Loading payment requests...</div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <p>No payment requests found</p>
        </div>
      ) : (
        <>
          <div className="requests-grid">
            {requests.map((req) => (
              <div key={req._id} className="request-card">
                <div className="card-header">
                  <span className="type-badge">{getTypeIcon(req.type)}</span>
                  <span className={`status-badge ${getStatusBadge(req.status).class}`}>
                    {getStatusBadge(req.status).text}
                  </span>
                </div>

                <div className="card-content">
                  <div className="info-row">
                    <span>Amount:</span>
                    <span className="amount">₹{req.amount}</span>
                  </div>

                  {req.type === 'fund_release' && (
                    <>
                      <div className="info-row">
                        <span>Freelancer:</span>
                        <span>₹{req.freelancerAmount}</span>
                      </div>
                      <div className="info-row">
                        <span>Commission:</span>
                        <span>₹{req.adminCommission}</span>
                      </div>
                    </>
                  )}

                  <div className="info-row">
                    <span>Reason:</span>
                    <span className="reason-text">{req.reason || 'N/A'}</span>
                  </div>

                  <div className="info-row">
                    <span>Requested:</span>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {req.status === 'pending' && (
                  <div className="card-actions">
                    {req.type === 'fund_release' ? (
                      <>
                        <button
                          onClick={() => { setSelectedRequest(req); setAction('approve_release'); setActionNotes(''); }}
                          className="btn-action-small btn-approve"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => { setSelectedRequest(req); setAction('reject_release'); setActionNotes(''); }}
                          className="btn-action-small btn-reject"
                        >
                          ❌ Reject
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setSelectedRequest(req); setAction('approve_refund'); setActionNotes(''); }}
                          className="btn-action-small btn-approve"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => { setSelectedRequest(req); setAction('deny_refund'); setActionNotes(''); }}
                          className="btn-action-small btn-reject"
                        >
                          ❌ Deny
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {Math.ceil(total / 10) > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-pagination"
              >
                ← Previous
              </button>
              <span>Page {page} of {Math.ceil(total / 10)}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 10)}
                className="btn-pagination"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPaymentRequests;
