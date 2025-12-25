import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import './AdminApplications.css';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, accepted

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getContracts();
      
      // Filter contracts that have freelancerApplication
      const apps = response.data
        .filter(contract => contract.freelancerApplication)
        .map(contract => ({
          ...contract,
          id: contract._id,
          applicationId: contract._id,
        }));
      
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const maskPaymentDetails = (details) => {
    if (!details) return 'N/A';
    if (details.includes('@')) {
      // UPI ID
      const parts = details.split('@');
      return `${parts[0].substring(0, 3)}****@${parts[1]}`;
    } else if (details.length > 4) {
      // Account number
      return `****${details.slice(-4)}`;
    }
    return details;
  };

  const getFilteredApplications = () => {
    return applications.filter(app => {
      if (filter === 'all') return true;
      if (filter === 'pending') return app.applicationStatus !== 'accepted';
      if (filter === 'accepted') return app.applicationStatus === 'accepted';
      return true;
    });
  };

  const filteredApps = getFilteredApplications();

  if (loading) {
    return (
      <div className="admin-applications">
        <div className="loading-spinner">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="admin-applications">
      <div className="applications-header">
        <h1>👨‍💼 Freelancer Applications</h1>
        <p className="subtitle">Manage all freelancer job applications</p>
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Applications ({applications.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({applications.filter(a => a.applicationStatus !== 'accepted').length})
        </button>
        <button
          className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
          onClick={() => setFilter('accepted')}
        >
          Accepted ({applications.filter(a => a.applicationStatus === 'accepted').length})
        </button>
      </div>

      {filteredApps.length === 0 ? (
        <div className="empty-state">
          <p>No applications found</p>
        </div>
      ) : (
        <div className="applications-list">
          {filteredApps.map(app => (
            <div key={app.id} className="application-card">
              {/* Header Section */}
              <div className="app-header">
                <div className="app-title">
                  <h3>{app.jobId?.title || 'Unknown Job'}</h3>
                  <span className={`status-badge ${app.applicationStatus || 'pending'}`}>
                    {app.applicationStatus === 'accepted' ? '✓ Accepted' : '⏳ Pending'}
                  </span>
                </div>
                <button
                  className="expand-btn"
                  onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                >
                  {selectedApp?.id === app.id ? '▼ Hide Details' : '▶ View Details'}
                </button>
              </div>

              {/* Quick Info */}
              <div className="app-quick-info">
                <div className="info-item">
                  <span className="label">Freelancer:</span>
                  <span className="value">{app.freelancerId?.name}</span>
                </div>
                <div className="info-item">
                  <span className="label">Proposed Budget:</span>
                  <span className="value highlight">₹{app.freelancerApplication?.proposedBudget}</span>
                </div>
                <div className="info-item">
                  <span className="label">Delivery Days:</span>
                  <span className="value">{app.freelancerApplication?.deliveryDays}</span>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedApp?.id === app.id && (
                <div className="app-details-expanded">
                  {/* Application Section */}
                  <div className="detail-section">
                    <h4>📋 Application Details</h4>
                    <div className="detail-group">
                      <p><strong>Cover Letter:</strong></p>
                      <p className="detail-text">{app.freelancerApplication?.coverLetter}</p>
                    </div>
                    <div className="detail-group">
                      <p><strong>Portfolio/Links:</strong></p>
                      <p className="detail-text">{app.freelancerApplication?.portfolio || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Payment Details Section */}
                  <div className="detail-section payment-section">
                    <h4>💳 Payment Details</h4>
                    <div className="detail-group">
                      <p><strong>Payment Method:</strong> {app.freelancerApplication?.paymentMethod}</p>
                    </div>

                    {app.freelancerApplication?.paymentMethod === 'upi' ? (
                      <div className="detail-group">
                        <p><strong>UPI ID:</strong> <code>{maskPaymentDetails(app.freelancerApplication?.upiId)}</code></p>
                      </div>
                    ) : (
                      <div className="detail-group bank-details">
                        <p><strong>Bank Details:</strong></p>
                        <div className="bank-info">
                          <div>Bank: {app.freelancerApplication?.bankName}</div>
                          <div>Account Holder: {app.freelancerApplication?.accountHolderName}</div>
                          <div>Account: {maskPaymentDetails(app.freelancerApplication?.accountNumber)}</div>
                          <div>IFSC: {app.freelancerApplication?.ifscCode}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Email Section */}
                  <div className="detail-section email-section">
                    <h4>📧 Work Receiving Email</h4>
                    <p><code>{app.freelancerApplication?.workReceivingEmail}</code></p>
                    <small>Client will send work details to this email</small>
                  </div>

                  {/* Contract Status */}
                  <div className="detail-section contract-status">
                    <h4>📊 Contract Status</h4>
                    <div className="status-info">
                      <div className="status-item">
                        <span>Total Amount:</span>
                        <strong>₹{app.totalAmount}</strong>
                      </div>
                      <div className="status-item">
                        <span>Payment Status:</span>
                        <strong>{app.paymentWorkflow?.clientPaymentStatus || 'pending'}</strong>
                      </div>
                      <div className="status-item">
                        <span>Applied On:</span>
                        <strong>{new Date(app.freelancerApplication?.appliedAt).toLocaleDateString()}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="app-actions">
                    {app.applicationStatus !== 'accepted' && (
                      <button className="btn-accept">✓ Accept Application</button>
                    )}
                    <button className="btn-view">View Contract Details</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
