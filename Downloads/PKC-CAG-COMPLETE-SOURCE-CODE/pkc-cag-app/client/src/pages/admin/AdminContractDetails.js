import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import './AdminContractDetails.css';

const AdminContractDetails = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchContractDetails();
  }, [contractId]);

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getContractById(contractId);
      setContract(response.data);
    } catch (error) {
      console.error('Error fetching contract:', error);
      alert('Failed to load contract details');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWork = async () => {
    if (!window.confirm('Approve this work submission and send to freelancer?')) return;

    try {
      setLoading(true);
      await adminAPI.updateContractStatus(contractId, {
        workCompletionStatus: 'in_progress',
        adminApprovalStatus: 'approved',
      });
      alert('Work approved! Sending to client for completion...');
      fetchContractDetails();
    } catch (error) {
      console.error('Error approving work:', error);
      alert(error.response?.data?.message || 'Failed to approve work');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToClient = async () => {
    if (!window.confirm('Send approved work to client for final verification?')) return;

    try {
      setLoading(true);
      await adminAPI.updateContractStatus(contractId, {
        adminApprovalStatus: 'approved',
        adminApprovedAt: new Date().toISOString(),
      });
      alert('Work sent to client for final review!');
      fetchContractDetails();
    } catch (error) {
      console.error('Error sending to client:', error);
      alert(error.response?.data?.message || 'Failed to send to client');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWorkCompleted = async () => {
    const clientNotes = prompt('Enter notes for client (optional):', '');
    if (clientNotes === null) return; // User cancelled

    try {
      setLoading(true);
      await adminAPI.updateContractStatus(contractId, {
        adminApprovalStatus: 'approved',
        clientFundsReleasedAt: new Date().toISOString(),
        clientReleaseNotes: clientNotes || 'Work completed and verified by admin',
        paymentCompleted: true,
        paymentCompletedAt: new Date().toISOString(),
      });
      alert('Work marked complete! Funds released and payment processed to freelancer.');
      fetchContractDetails();
    } catch (error) {
      console.error('Error completing work:', error);
      alert(error.response?.data?.message || 'Failed to complete work');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    const reason = prompt('Enter reason for requesting revision:');
    if (!reason) return;

    try {
      setLoading(true);
      await adminAPI.updateContractStatus(contractId, {
        workCompletionStatus: 'disputed',
        revisionReason: reason,
      });
      alert('Revision request sent to freelancer!');
      fetchContractDetails();
    } catch (error) {
      console.error('Error requesting revision:', error);
      alert(error.response?.data?.message || 'Failed to request revision');
    } finally {
      setLoading(false);
    }
  };

  const maskPaymentDetails = (details) => {
    if (!details) return 'N/A';
    if (details.includes('@')) {
      const parts = details.split('@');
      return `${parts[0].substring(0, 3)}****@${parts[1]}`;
    } else if (details.length > 4) {
      return `****${details.slice(-4)}`;
    }
    return details;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="contract-details">
        <div className="loading-spinner">Loading contract details...</div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="contract-details">
        <div className="error-state">
          <p>Contract not found</p>
          <button onClick={() => navigate('/admin/contracts')}>Back to Contracts</button>
        </div>
      </div>
    );
  }

  return (
    <div className="contract-details">
      {/* Header */}
      <div className="contract-header">
        <div className="header-top">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <h1>Contract Details</h1>
          <div className="header-status">
            <span className={`status-badge ${contract.paymentWorkflow?.clientPaymentStatus || 'pending'}`}>
              {contract.paymentWorkflow?.clientPaymentStatus || 'pending'}
            </span>
          </div>
        </div>
        <p className="contract-id">Contract ID: <code>{contract._id}</code></p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📋 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'freelancer' ? 'active' : ''}`}
          onClick={() => setActiveTab('freelancer')}
        >
          👨‍💼 Freelancer
        </button>
        <button
          className={`tab-btn ${activeTab === 'work' ? 'active' : ''}`}
          onClick={() => setActiveTab('work')}
        >
          📝 Work Submission
        </button>
        <button
          className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          💳 Payment
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-pane">
            <div className="content-card">
              <h3>Contract Information</h3>
              <div className="info-grid">
                <div className="info-box">
                  <span className="label">Job Title</span>
                  <p className="value">{contract.jobId?.title || 'N/A'}</p>
                </div>
                <div className="info-box">
                  <span className="label">Client</span>
                  <p className="value">{contract.clientId?.name || 'Unknown'}</p>
                </div>
                <div className="info-box">
                  <span className="label">Freelancer</span>
                  <p className="value">{contract.freelancerId?.name || 'Unknown'}</p>
                </div>
                <div className="info-box">
                  <span className="label">Total Amount</span>
                  <p className="value highlight">₹{contract.totalAmount}</p>
                </div>
              </div>
            </div>

            <div className="content-card">
              <h3>Timeline</h3>
              <div className="timeline">
                <div className={`timeline-item ${contract.freelancerApplication?.appliedAt ? 'completed' : ''}`}>
                  <span className="timeline-marker"></span>
                  <div className="timeline-content">
                    <h4>Application Submitted</h4>
                    <p>{formatDate(contract.freelancerApplication?.appliedAt)}</p>
                  </div>
                </div>

                <div className={`timeline-item ${contract.paymentWorkflow?.clientPaymentStatus === 'paid_to_admin' ? 'completed' : ''}`}>
                  <span className="timeline-marker"></span>
                  <div className="timeline-content">
                    <h4>Payment Received</h4>
                    <p>{contract.paymentWorkflow?.clientPaymentDate ? formatDate(contract.paymentWorkflow.clientPaymentDate) : 'Pending'}</p>
                  </div>
                </div>

                <div className={`timeline-item ${contract.workSubmission?.submittedAt ? 'completed' : ''}`}>
                  <span className="timeline-marker"></span>
                  <div className="timeline-content">
                    <h4>Work Submitted</h4>
                    <p>{contract.workSubmission?.submittedAt ? formatDate(contract.workSubmission.submittedAt) : 'Pending'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Freelancer Tab */}
        {activeTab === 'freelancer' && (
          <div className="tab-pane">
            <div className="content-card">
              <h3>Freelancer Information</h3>
              <div className="info-grid">
                <div className="info-box">
                  <span className="label">Name</span>
                  <p className="value">{contract.freelancerId?.name}</p>
                </div>
                <div className="info-box">
                  <span className="label">Email</span>
                  <p className="value">{contract.freelancerId?.email}</p>
                </div>
                <div className="info-box admin-only">
                  <span className="label">🔒 Work Receiving Email (Admin Only)</span>
                  <p className="value">{contract.freelancerApplication?.workReceivingEmail || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="content-card admin-section">
              <h3>🔒 Payment & Payment Details (Admin Only)</h3>
              <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '15px' }}>These details are confidential and only visible to admin</p>
              {contract.freelancerApplication?.paymentMethod === 'upi' ? (
                <div className="payment-method-card">
                  <div className="payment-icon">📱</div>
                  <div className="payment-info">
                    <h4>UPI Payment</h4>
                    <p><strong>UPI ID:</strong> <code>{maskPaymentDetails(contract.freelancerApplication?.upiId)}</code></p>
                  </div>
                </div>
              ) : (
                <div className="payment-method-card">
                  <div className="payment-icon">🏦</div>
                  <div className="payment-info">
                    <h4>Bank Transfer</h4>
                    <div className="bank-details-box">
                      <p><strong>Bank Name:</strong> {contract.freelancerApplication?.bankName}</p>
                      <p><strong>Account Holder:</strong> {contract.freelancerApplication?.accountHolderName}</p>
                      <p><strong>Account Number:</strong> <code>{maskPaymentDetails(contract.freelancerApplication?.accountNumber)}</code></p>
                      <p><strong>IFSC Code:</strong> {contract.freelancerApplication?.ifscCode}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="content-card">
              <h3>Application Details</h3>
              <div className="details-box">
                <div className="detail-item">
                  <strong>Cover Letter:</strong>
                  <p>{contract.freelancerApplication?.coverLetter}</p>
                </div>
                <div className="detail-item">
                  <strong>Portfolio/Links:</strong>
                  <p>{contract.freelancerApplication?.portfolio || 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <strong>Proposed Budget:</strong>
                  <p>₹{contract.freelancerApplication?.proposedBudget}</p>
                </div>
                <div className="detail-item">
                  <strong>Delivery Days:</strong>
                  <p>{contract.freelancerApplication?.deliveryDays} days</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Work Submission Tab */}
        {activeTab === 'work' && (
          <div className="tab-pane">
            {contract.workSubmission ? (
              <>
                <div className="content-card">
                  <h3>Work Submission Details</h3>
                  <div className="work-info-grid">
                    <div className="work-info-box">
                      <span className="label">Submitted By</span>
                      <p>{contract.workSubmission.submittedBy}</p>
                    </div>
                    <div className="work-info-box">
                      <span className="label">Submitted On</span>
                      <p>{formatDate(contract.workSubmission.submittedAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="content-card">
                  <div className="work-section">
                    <h4>Description</h4>
                    <div className="work-content">{contract.workSubmission.description}</div>
                  </div>

                  <div className="work-section">
                    <h4>Deliverables</h4>
                    <div className="work-content">{contract.workSubmission.deliverables}</div>
                  </div>

                  <div className="work-section">
                    <h4>Timeline</h4>
                    <div className="work-content">{contract.workSubmission.timeline}</div>
                  </div>

                  {contract.workSubmission.additionalNotes && (
                    <div className="work-section">
                      <h4>Additional Notes</h4>
                      <div className="work-content">{contract.workSubmission.additionalNotes}</div>
                    </div>
                  )}

                  {contract.workSubmission.attachmentUrl && (
                    <div className="work-section">
                      <h4>Attachment/Reference</h4>
                      <a href={contract.workSubmission.attachmentUrl} target="_blank" rel="noopener noreferrer" className="attachment-link">
                        📎 View Attachment
                      </a>
                    </div>
                  )}
                </div>

                <div className="action-buttons">
                  {contract.paymentWorkflow?.workCompletionStatus === 'in_progress' && 
                   contract.paymentWorkflow?.adminApprovalStatus === 'pending_approval' && (
                    <>
                      <button className="btn-approve" onClick={handleApproveWork} disabled={loading}>
                        ✓ Approve & Send to Freelancer
                      </button>
                      <button className="btn-request-revision" onClick={handleRequestRevision} disabled={loading}>
                        ↻ Request Revision
                      </button>
                    </>
                  )}
                  
                  {contract.paymentWorkflow?.adminApprovalStatus === 'approved' &&
                   !contract.paymentWorkflow?.clientFundsReleasedAt && (
                    <>
                      <button className="btn-send" onClick={handleSendToClient} disabled={loading}>
                        📤 Send to Client
                      </button>
                      <button className="btn-complete" onClick={handleUpdateWorkCompleted} disabled={loading}>
                        ✅ Mark Work Completed & Release Funds
                      </button>
                    </>
                  )}
                  
                  {contract.paymentWorkflow?.clientFundsReleasedAt && (
                    <div className="status-badge success">
                      ✓ Work Completed & Funds Released
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>No work submission yet</p>
              </div>
            )}
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="tab-pane">
            <div className="content-card">
              <h3>Payment Workflow</h3>
              <div className="payment-workflow">
                <div className={`workflow-step ${contract.paymentWorkflow?.clientPaymentStatus ? 'completed' : ''}`}>
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Client Payment to Admin</h4>
                    <p className="step-status">
                      {contract.paymentWorkflow?.clientPaymentStatus === 'paid_to_admin' ? '✓ Completed' : '⏳ Pending'}
                    </p>
                    {contract.paymentWorkflow?.clientPaymentDate && (
                      <p className="step-date">{formatDate(contract.paymentWorkflow.clientPaymentDate)}</p>
                    )}
                  </div>
                </div>

                <div className="workflow-arrow">→</div>

                <div className={`workflow-step ${contract.paymentWorkflow?.paymentCompleted || contract.adminPaymentSent?.status === 'sent' ? 'completed' : contract.paymentWorkflow?.clientFundsReleasedAt ? 'in-progress' : ''}`}>
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Admin Payment to Freelancer</h4>
                    <p className="step-status">
                      {contract.paymentWorkflow?.paymentCompleted || contract.adminPaymentSent?.status === 'sent' ? '✓ Completed' : contract.paymentWorkflow?.clientFundsReleasedAt ? '✅ Approved' : '⏳ Pending'}
                    </p>
                    {contract.paymentWorkflow?.freelancerPaymentDate && (
                      <p className="step-date">{formatDate(contract.paymentWorkflow.freelancerPaymentDate)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="content-card">
              <h3>Transaction Details</h3>
              <div className="transaction-details">
                <div className="transaction-item">
                  <span className="label">Amount</span>
                  <strong className="amount">₹{contract.totalAmount}</strong>
                </div>
                <div className="transaction-item">
                  <span className="label">Client Payment Method</span>
                  <p>{contract.paymentWorkflow?.clientPaymentMethod || 'N/A'}</p>
                </div>
                <div className="transaction-item">
                  <span className="label">Client Transaction ID</span>
                  <code>{contract.paymentWorkflow?.clientTransactionId || 'N/A'}</code>
                </div>
                <div className="transaction-item">
                  <span className="label">Admin Payment Status</span>
                  <p>{contract.paymentWorkflow?.adminPaymentStatus || 'Not sent'}</p>
                </div>
              </div>
            </div>

            {contract.paymentWorkflow?.clientPaymentStatus === 'paid_to_admin' && contract.paymentWorkflow?.freelancerPaymentStatus !== 'paid' && (
              <div className="action-buttons">
                <button className="btn-release-funds">💰 Release Funds to Freelancer</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContractDetails;
