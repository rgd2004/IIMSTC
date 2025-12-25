import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { marketplaceAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminDisputes.css';

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [filteredDisputes, setFilteredDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveData, setResolveData] = useState({
    resolution: 'refund',
    amount: '',
    reason: '',
    adminNotes: ''
  });
  const [assigningTo, setAssigningTo] = useState(null);
  const [adminId, setAdminId] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const response = await marketplaceAPI.getAllDisputes({
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      const disputesData = response.data?.disputes || response.data || [];
      setDisputes(disputesData);
      setFilteredDisputes(disputesData);
    } catch (err) {
      console.error('Failed to load disputes:', err);
      toast.error(err.response?.data?.message || 'Failed to load disputes');
      setDisputes([]);
      setFilteredDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = Array.isArray(disputes) ? disputes : [];

    if (searchTerm) {
      filtered = filtered.filter(dispute =>
        dispute.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dispute.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dispute.clientId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dispute.freelancerId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDisputes(filtered);
  }, [searchTerm, disputes]);

  const handleAssignDispute = async (disputeId) => {
    if (!adminId.trim()) {
      toast.error('Please enter an admin ID');
      return;
    }

    setProcessingId(disputeId);
    try {
      await marketplaceAPI.assignDispute(disputeId, { adminId });
      toast.success('Dispute assigned successfully');
      setDisputes(disputes.map(d =>
        d._id === disputeId
          ? { ...d, assignedTo: adminId, status: 'in-review' }
          : d
      ));
      setAssigningTo(null);
      setAdminId('');
    } catch (err) {
      console.error('Assign error:', err);
      toast.error(err.response?.data?.message || 'Failed to assign dispute');
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolveDispute = async () => {
    if (!resolveData.resolution) {
      toast.error('Please select a resolution type');
      return;
    }

    if (!resolveData.amount) {
      toast.error('Please enter an amount');
      return;
    }

    setProcessingId(selectedDispute._id);
    try {
      await marketplaceAPI.resolveDispute(selectedDispute._id, {
        resolution: resolveData.resolution,
        amount: parseFloat(resolveData.amount),
        reason: resolveData.reason,
        adminNotes: resolveData.adminNotes
      });
      toast.success('Dispute resolved successfully');
      setDisputes(disputes.map(d =>
        d._id === selectedDispute._id
          ? {
              ...d,
              status: 'resolved',
              resolutionDetails: {
                type: resolveData.resolution,
                amount: parseFloat(resolveData.amount),
                reason: resolveData.reason,
                adminNotes: resolveData.adminNotes
              }
            }
          : d
      ));
      setShowResolveModal(false);
      setSelectedDispute(null);
      setResolveData({
        resolution: 'refund',
        amount: '',
        reason: '',
        adminNotes: ''
      });
    } catch (err) {
      console.error('Resolve error:', err);
      toast.error(err.response?.data?.message || 'Failed to resolve dispute');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { color: '#f5576c', label: 'OPEN', icon: '🔴' },
      'in-review': { color: '#fbbf24', label: 'IN REVIEW', icon: '🟡' },
      resolved: { color: '#10b981', label: 'RESOLVED', icon: '🟢' }
    };
    return badges[status] || badges.open;
  };

  const getResolutionColor = (resolution) => {
    const colors = {
      refund: '#ef4444',
      'partial-refund': '#f97316',
      pay: '#10b981',
      'no-action': '#6b7280'
    };
    return colors[resolution] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="admin-disputes-container">
        <div className="loading-state">
          <div className="loader-spinner"></div>
          <p>Loading disputes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-disputes-container">
      {/* Header */}
      <div className="disputes-header">
        <div>
          <h1>⚖️ Dispute Management</h1>
          <p>Review and resolve all contract disputes</p>
        </div>
        <Link to="/admin" className="back-link">← Back to Admin Hub</Link>
      </div>

      {/* Stats */}
      <div className="disputes-stats">
        <div className="stat-card">
          <div className="stat-icon">🔴</div>
          <div className="stat-info">
            <h3>Open Disputes</h3>
            <p>{disputes.filter(d => d.status === 'open').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟡</div>
          <div className="stat-info">
            <h3>In Review</h3>
            <p>{disputes.filter(d => d.status === 'in-review').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-info">
            <h3>Resolved</h3>
            <p>{disputes.filter(d => d.status === 'resolved').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Disputes</h3>
            <p>{disputes.length}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="disputes-controls">
        <input
          type="text"
          placeholder="Search by job title, reason, client, or freelancer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-review">In Review</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Disputes Table */}
      <div className="disputes-table-wrapper">
        {filteredDisputes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">😊</div>
            <h3>No disputes found</h3>
            <p>There are no disputes matching your criteria</p>
          </div>
        ) : (
          <table className="disputes-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Reason</th>
                <th>Client</th>
                <th>Freelancer</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Raised On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDisputes.map((dispute) => {
                const statusBadge = getStatusBadge(dispute.status);
                return (
                  <tr key={dispute._id} className={`dispute-row status-${dispute.status}`}>
                    <td className="job-title">
                      <strong>{dispute.jobId?.title || 'N/A'}</strong>
                    </td>
                    <td className="reason">
                      {dispute.reason ? dispute.reason.replace('-', ' ').toUpperCase() : 'N/A'}
                    </td>
                    <td className="participant">
                      {dispute.clientId?.firstName} {dispute.clientId?.lastName}
                    </td>
                    <td className="participant">
                      {dispute.freelancerId?.firstName} {dispute.freelancerId?.lastName}
                    </td>
                    <td className="status">
                      <span className="status-badge" style={{ backgroundColor: statusBadge.color }}>
                        {statusBadge.icon} {statusBadge.label}
                      </span>
                    </td>
                    <td className="assigned-to">
                      {dispute.assignedTo ? (
                        <span className="assigned-badge">{dispute.assignedTo}</span>
                      ) : (
                        <span className="unassigned">Unassigned</span>
                      )}
                    </td>
                    <td className="created-date">
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </td>
                    <td className="actions">
                      <button
                        className="action-btn view-btn"
                        onClick={() => setSelectedDispute(dispute)}
                        title="View Details"
                      >
                        👁️ View
                      </button>
                      {dispute.status !== 'resolved' && (
                        <>
                          <button
                            className="action-btn assign-btn"
                            onClick={() => setAssigningTo(dispute._id)}
                            disabled={processingId === dispute._id}
                            title="Assign to Admin"
                          >
                            🎯 Assign
                          </button>
                          <button
                            className="action-btn resolve-btn"
                            onClick={() => {
                              setSelectedDispute(dispute);
                              setShowResolveModal(true);
                            }}
                            disabled={processingId === dispute._id}
                            title="Resolve Dispute"
                          >
                            ✅ Resolve
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Assign Modal */}
      {assigningTo && (
        <div className="modal-overlay" onClick={() => setAssigningTo(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🎯 Assign Dispute</h2>
            <input
              type="text"
              placeholder="Enter admin ID or email"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              className="modal-input"
            />
            <div className="modal-buttons">
              <button
                className="btn-cancel"
                onClick={() => {
                  setAssigningTo(null);
                  setAdminId('');
                }}
              >
                Cancel
              </button>
              <button
                className="btn-assign"
                onClick={() => handleAssignDispute(assigningTo)}
                disabled={processingId === assigningTo}
              >
                {processingId === assigningTo ? 'Assigning...' : '🎯 Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && selectedDispute && (
        <div className="modal-overlay" onClick={() => setShowResolveModal(false)}>
          <div className="modal-content resolve-modal" onClick={(e) => e.stopPropagation()}>
            <h2>✅ Resolve Dispute</h2>
            
            <div className="modal-section">
              <h3>Dispute Details</h3>
              <p><strong>Job:</strong> {selectedDispute.jobId?.title}</p>
              <p><strong>Reason:</strong> {selectedDispute.reason?.replace('-', ' ').toUpperCase()}</p>
              <p><strong>Description:</strong> {selectedDispute.description}</p>
            </div>

            <div className="modal-section">
              <label>Resolution Type *</label>
              <select
                value={resolveData.resolution}
                onChange={(e) => setResolveData({ ...resolveData, resolution: e.target.value })}
                className="modal-select"
              >
                <option value="refund">Full Refund to Client</option>
                <option value="partial-refund">Partial Refund</option>
                <option value="pay">Pay Freelancer</option>
                <option value="no-action">No Action</option>
              </select>
            </div>

            <div className="modal-section">
              <label>Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter amount"
                value={resolveData.amount}
                onChange={(e) => setResolveData({ ...resolveData, amount: e.target.value })}
                className="modal-input"
              />
            </div>

            <div className="modal-section">
              <label>Reason</label>
              <textarea
                placeholder="Reason for this resolution..."
                value={resolveData.reason}
                onChange={(e) => setResolveData({ ...resolveData, reason: e.target.value })}
                rows="3"
                className="modal-textarea"
              />
            </div>

            <div className="modal-section">
              <label>Admin Notes</label>
              <textarea
                placeholder="Internal notes about this resolution..."
                value={resolveData.adminNotes}
                onChange={(e) => setResolveData({ ...resolveData, adminNotes: e.target.value })}
                rows="3"
                className="modal-textarea"
              />
            </div>

            <div className="modal-buttons">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowResolveModal(false);
                  setResolveData({
                    resolution: 'refund',
                    amount: '',
                    reason: '',
                    adminNotes: ''
                  });
                }}
              >
                Cancel
              </button>
              <button
                className="btn-resolve"
                onClick={handleResolveDispute}
                disabled={processingId === selectedDispute._id}
              >
                {processingId === selectedDispute._id ? 'Resolving...' : '✅ Resolve Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedDispute && !showResolveModal && (
        <div className="modal-overlay" onClick={() => setSelectedDispute(null)}>
          <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedDispute(null)}>✕</button>
            
            <div className="detail-section">
              <h2>📋 Dispute Details</h2>
              <div className="status-bar">
                <span className="status-badge" style={{ backgroundColor: getStatusBadge(selectedDispute.status).color }}>
                  {getStatusBadge(selectedDispute.status).icon} {getStatusBadge(selectedDispute.status).label}
                </span>
                {selectedDispute.assignedTo && (
                  <span className="assigned-badge">Assigned to: {selectedDispute.assignedTo}</span>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h3>Job Information</h3>
              <p><strong>Title:</strong> {selectedDispute.jobId?.title}</p>
              <p><strong>Description:</strong> {selectedDispute.jobId?.description}</p>
              <p><strong>Contract ID:</strong> {selectedDispute.contractId?._id}</p>
            </div>

            <div className="detail-section">
              <h3>Dispute Information</h3>
              <p><strong>Reason:</strong> {selectedDispute.reason?.replace('-', ' ').toUpperCase()}</p>
              <p><strong>Description:</strong> {selectedDispute.description}</p>
              <p><strong>Raised By:</strong> {selectedDispute.raisedBy?.firstName} {selectedDispute.raisedBy?.lastName}</p>
              <p><strong>Date:</strong> {new Date(selectedDispute.createdAt).toLocaleString()}</p>
            </div>

            <div className="detail-section">
              <h3>Participants</h3>
              <div className="participants">
                <div className="participant-card">
                  <h4>👨‍💼 Client</h4>
                  <p><strong>Name:</strong> {selectedDispute.clientId?.firstName} {selectedDispute.clientId?.lastName}</p>
                  <p><strong>Email:</strong> {selectedDispute.clientId?.email}</p>
                </div>
                <div className="participant-card">
                  <h4>🚀 Freelancer</h4>
                  <p><strong>Name:</strong> {selectedDispute.freelancerId?.firstName} {selectedDispute.freelancerId?.lastName}</p>
                  <p><strong>Email:</strong> {selectedDispute.freelancerId?.email}</p>
                </div>
              </div>
            </div>

            {selectedDispute.attachments?.length > 0 && (
              <div className="detail-section">
                <h3>Attachments</h3>
                <div className="attachments-list">
                  {selectedDispute.attachments.map((attachment, idx) => (
                    <a
                      key={idx}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="attachment-link"
                    >
                      📎 Evidence {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {selectedDispute.resolutionDetails && (
              <div className="detail-section resolution-section">
                <h3>✅ Resolution</h3>
                <p><strong>Type:</strong> <span style={{ color: getResolutionColor(selectedDispute.resolutionDetails.type) }}>{selectedDispute.resolutionDetails.type}</span></p>
                <p><strong>Amount:</strong> ${selectedDispute.resolutionDetails.amount}</p>
                <p><strong>Reason:</strong> {selectedDispute.resolutionDetails.reason}</p>
                <p><strong>Admin Notes:</strong> {selectedDispute.resolutionDetails.adminNotes}</p>
              </div>
            )}

            <div className="modal-buttons">
              <button
                className="btn-cancel"
                onClick={() => setSelectedDispute(null)}
              >
                Close
              </button>
              {selectedDispute.status !== 'resolved' && (
                <>
                  <button
                    className="btn-assign"
                    onClick={() => setAssigningTo(selectedDispute._id)}
                    disabled={processingId === selectedDispute._id}
                  >
                    🎯 Assign
                  </button>
                  <button
                    className="btn-resolve"
                    onClick={() => setShowResolveModal(true)}
                    disabled={processingId === selectedDispute._id}
                  >
                    ✅ Resolve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
