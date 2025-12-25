import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import './AdminWorkReviewPage.css';

const AdminWorkReviewPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    fetchContractDetails();
  }, [contractId]);

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching contract:', contractId);
      
      // Set a timeout for the request
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout - server is not responding')), 10000)
      );
      
      const response = await Promise.race([
        adminAPI.getContractById(contractId),
        timeoutPromise
      ]);
      
      console.log('✅ Contract fetched:', response.data);
      setContract(response.data);
    } catch (error) {
      console.error('❌ Error fetching contract:', error);
      console.error('❌ Error details:', error.response?.data);
      setError(error.response?.data?.message || error.message || 'Failed to load work submission');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWork = async () => {
    if (!window.confirm('Approve this work submission? You can send it to client for verification.')) return;

    try {
      setActionInProgress(true);
      await adminAPI.updateContractStatus(contractId, {
        workCompletionStatus: 'in_progress',
        adminApprovalStatus: 'approved',
        adminReviewNotes: adminNotes,
      });
      alert('✓ Work approved! Client can now complete the contract.');
      fetchContractDetails();
      setAdminNotes('');
    } catch (error) {
      console.error('Error approving work:', error);
      alert(error.response?.data?.message || 'Failed to approve work');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRejectWork = async () => {
    if (!adminNotes.trim()) {
      alert('Please provide a reason for rejecting the work');
      return;
    }

    if (!window.confirm('Reject this work submission? Freelancer will see your feedback.')) return;

    try {
      setActionInProgress(true);
      await adminAPI.updateContractStatus(contractId, {
        workCompletionStatus: 'disputed',
        adminApprovalStatus: 'rejected',
        revisionReason: adminNotes,
      });
      alert('✓ Work rejected. Freelancer has been notified to revise.');
      fetchContractDetails();
      setAdminNotes('');
    } catch (error) {
      console.error('Error rejecting work:', error);
      alert(error.response?.data?.message || 'Failed to reject work');
    } finally {
      setActionInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="work-review-page">
        <div className="loading-state" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="loader-spinner"></div>
          <p>Loading work submission...</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>Contract ID: {contractId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="work-review-page">
        <div className="error-state" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#dc2626', fontWeight: 'bold' }}>❌ Error: {error}</p>
          <button 
            onClick={() => navigate('/admin/contracts')}
            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Back to Contracts
          </button>
        </div>
      </div>
    );
  }

  if (!contract || !contract.workSubmission) {
    return (
      <div className="work-review-page">
        <div className="error-state">
          <p>Work submission not found</p>
          <button onClick={() => navigate('/admin/freelancing-hub')} className="btn-back">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const work = contract.workSubmission;
  const adminStatus = contract.paymentWorkflow?.adminApprovalStatus;
  const isApproved = adminStatus === 'approved';
  const isRejected = adminStatus === 'rejected';
  const isPending = adminStatus === 'pending_approval' || !adminStatus; // Treat undefined as pending

  console.log('📊 Work Review Page - Status:', { adminStatus, isPending, isApproved, isRejected });

  return (
    <div className="work-review-page">
      <div className="review-header">
        <button className="back-btn" onClick={() => navigate('/admin/contracts')}>
          ← Back to Contracts
        </button>
        <h1>Work Review & Approval</h1>
        <div className="status-indicator">
          {isPending && <span className="status pending">⏳ Pending Review</span>}
          {isApproved && <span className="status approved">✓ Approved</span>}
          {isRejected && <span className="status rejected">✗ Rejected</span>}
        </div>
      </div>

      <div className="review-container">
        {/* Job & Contract Info */}
        <div className="info-panel">
          <div className="info-section">
            <h3>📋 Job Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Job Title</span>
                <p className="value">{contract.jobId?.title || 'N/A'}</p>
              </div>
              <div className="info-item">
                <span className="label">Client</span>
                <p className="value">{contract.clientId?.name || 'Unknown'}</p>
              </div>
              <div className="info-item">
                <span className="label">Freelancer</span>
                <p className="value">{contract.freelancerId?.name || 'Unknown'}</p>
              </div>
              <div className="info-item">
                <span className="label">Contract Amount</span>
                <p className="value highlight">₹{contract.totalAmount}</p>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>📅 Timeline</h3>
            <div className="timeline-compact">
              <div className="timeline-point">
                <span className="point-label">Work Submitted:</span>
                <span className="point-date">{new Date(work.submittedAt).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="timeline-point">
                <span className="point-label">Submitted By:</span>
                <span className="point-date">{work.submittedBy}</span>
              </div>
            </div>
          </div>

          {/* Freelancer Payment Details */}
          {contract.freelancerApplication && (
            <div className="info-section">
              <h3>💳 Freelancer Payment Details</h3>
              <div className="payment-grid">
                {contract.freelancerApplication.upiId && (
                  <div className="payment-item">
                    <span className="label">UPI ID</span>
                    <p className="value">{contract.freelancerApplication.upiId}</p>
                  </div>
                )}
                {contract.freelancerApplication.bankName && (
                  <div className="payment-item">
                    <span className="label">Bank Name</span>
                    <p className="value">{contract.freelancerApplication.bankName}</p>
                  </div>
                )}
                {contract.freelancerApplication.accountHolderName && (
                  <div className="payment-item">
                    <span className="label">Account Holder</span>
                    <p className="value">{contract.freelancerApplication.accountHolderName}</p>
                  </div>
                )}
                {contract.freelancerApplication.accountNumber && (
                  <div className="payment-item">
                    <span className="label">Account Number</span>
                    <p className="value">****{contract.freelancerApplication.accountNumber.slice(-4)}</p>
                  </div>
                )}
                {contract.freelancerApplication.ifscCode && (
                  <div className="payment-item">
                    <span className="label">IFSC Code</span>
                    <p className="value">{contract.freelancerApplication.ifscCode}</p>
                  </div>
                )}
                {contract.freelancerApplication.workReceivingEmail && (
                  <div className="payment-item">
                    <span className="label">Work Receiving Email</span>
                    <p className="value">{contract.freelancerApplication.workReceivingEmail}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Work Submission Details */}
        <div className="work-panel">
          <h3>📝 Work Submission Details</h3>

          <div className="work-section">
            <h4>Description</h4>
            <div className="work-content">{work.description}</div>
          </div>

          <div className="work-section">
            <h4>Deliverables</h4>
            <div className="work-content">{work.deliverables}</div>
          </div>

          <div className="work-section">
            <h4>Timeline</h4>
            <div className="work-content">{work.timeline}</div>
          </div>

          {work.additionalNotes && (
            <div className="work-section">
              <h4>Additional Notes</h4>
              <div className="work-content">{work.additionalNotes}</div>
            </div>
          )}

          {work.attachmentUrl && (
            <div className="work-section">
              <h4>📎 Attachment</h4>
              <a href={work.attachmentUrl} target="_blank" rel="noopener noreferrer" className="attachment-link">
                View Attachment →
              </a>
            </div>
          )}
        </div>

        {/* Review Actions */}
        {isPending && (
          <div className="review-actions-panel">
            <h3>🎯 Your Review</h3>

            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '6px', fontSize: '0.9rem' }}>
              <p style={{ margin: 0 }}>Status: <strong>{adminStatus || 'pending_approval'}</strong></p>
            </div>

            <div className="notes-section">
              <label>Admin Notes (Optional for approval, Required for rejection)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add your review comments, feedback, or reason for rejection..."
                className="admin-notes"
                rows="6"
              />
            </div>

            <div className="action-buttons">
              <button
                className="btn-approve"
                onClick={handleApproveWork}
                disabled={actionInProgress}
              >
                {actionInProgress ? '⏳ Processing...' : '✓ Approve Work'}
              </button>
              <button
                className="btn-reject"
                onClick={handleRejectWork}
                disabled={actionInProgress}
              >
                {actionInProgress ? '⏳ Processing...' : '✗ Reject & Request Revision'}
              </button>
            </div>
          </div>
        )}

        {/* Already Reviewed Status */}
        {!isPending && (
          <div className="review-actions-panel">
            <h3>ℹ️ Review Status</h3>
            {isApproved && (
              <div className="status-message success">
                <p>✓ This work has been approved and is ready to send to client for final verification.</p>
              </div>
            )}
            {isRejected && (
              <div className="status-message rejected">
                <p>✗ This work has been rejected. Freelancer has been notified to revise.</p>
              </div>
            )}
            <button
              className="btn-back-full"
              onClick={() => navigate('/admin/freelancing-hub')}
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWorkReviewPage;
