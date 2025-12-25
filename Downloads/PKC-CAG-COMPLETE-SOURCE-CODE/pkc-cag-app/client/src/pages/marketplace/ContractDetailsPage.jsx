// client/src/pages/marketplace/ContractDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketplaceAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import ClientPayment from '../../components/ClientPayment';
import ClientReleaseFunds from '../../components/ClientReleaseFunds';
import WorkSubmissionPage from '../WorkSubmissionPage';
import RaiseDisputeModal from '../../components/RaiseDisputeModal';
import './ContractDetailsPage.css';
import toast from 'react-hot-toast';

const ContractDetailsPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  useEffect(() => {
    fetchContractDetails();
  }, [contractId]);

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching contract with ID:', contractId);
      const res = await marketplaceAPI.getContractById(contractId);
      console.log('📍 Contract Details Response:', res.data);
      setContract(res.data);
    } catch (err) {
      console.error('❌ Error loading contract:', err);
      if (err.response?.status === 403) {
        toast.error('You do not have permission to view this contract');
      } else if (err.response?.status === 404) {
        toast.error('Contract not found');
      } else {
        toast.error(err.response?.data?.message || 'Failed to load contract details');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="contract-details-page-modern">
        <div className="loading-container">
          <div className="loading-spinner-modern">
            <div className="spinner-modern"></div>
          </div>
          <p className="loading-text-modern">Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="contract-details-page-modern">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>Contract Not Found</h2>
          <p>The contract you're looking for doesn't exist or you don't have access to it.</p>
          <button className="back-button" onClick={() => navigate('/marketplace/contracts')}>
            ← Back to Contracts
          </button>
        </div>
      </div>
    );
  }

  const pw = contract.paymentWorkflow || {};

  return (
    <div className="contract-details-page-modern">
      {/* Hero Header */}
      <div className="details-hero">
        <button className="back-button-hero" onClick={() => navigate('/marketplace/contracts')}>
          <span className="back-icon">←</span>
          <span>Back to Contracts</span>
        </button>
        <div className="hero-content-details">
          <div className="hero-badge">Contract Details</div>
          <h1 className="hero-title-details">{contract.jobId?.title || 'Contract'}</h1>
          <p className="hero-contract-id">Contract ID: {contract._id}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="details-content-wrapper">
        <div className="details-layout">
          {/* Left Column - Information */}
          <div className="details-left-column">
            {/* Contract Overview Card */}
            <div className="info-card overview-card">
              <div className="card-header-icon">
                <span className="header-icon">📋</span>
                <h2>Contract Overview</h2>
              </div>
              <div className="overview-grid">
                <div className="overview-item">
                  <div className="item-label">Job Title</div>
                  <div className="item-value">{contract.jobId?.title || 'N/A'}</div>
                </div>
                <div className="overview-item">
                  <div className="item-label">Freelancer</div>
                  <div className="item-value">{contract.freelancerId?.name || 'Unknown'}</div>
                </div>
                <div className="overview-item">
                  <div className="item-label">Client</div>
                  <div className="item-value">{contract.clientId?.name || 'Unknown'}</div>
                </div>
                <div className="overview-item">
                  <div className="item-label">Start Date</div>
                  <div className="item-value">{new Date(contract.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="info-card financial-card">
              <div className="card-header-icon">
                <span className="header-icon">💰</span>
                <h2>Financial Breakdown</h2>
              </div>
              <div className="financial-breakdown">
                <div className="breakdown-item total">
                  <div className="breakdown-label">Total Contract Amount</div>
                  <div className="breakdown-value">₹{contract.totalAmount?.toLocaleString()}</div>
                </div>
                <div className="breakdown-divider"></div>
                <div className="breakdown-item">
                  <div className="breakdown-label">Freelancer Receives</div>
                  <div className="breakdown-value freelancer">₹{contract.freelancerAmount?.toLocaleString()}</div>
                </div>
                <div className="breakdown-item">
                  <div className="breakdown-label">Platform Commission</div>
                  <div className="breakdown-value commission">₹{contract.platformCommission?.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Status Dashboard */}
            <div className="info-card status-card">
              <div className="card-header-icon">
                <span className="header-icon">📊</span>
                <h2>Progress Dashboard</h2>
              </div>
              <div className="status-dashboard">
                <div className={`status-item ${pw.clientPaymentStatus === 'paid_to_admin' ? 'completed' : 'pending'}`}>
                  <div className="status-icon-wrapper">
                    {pw.clientPaymentStatus === 'paid_to_admin' ? '✅' : '⏳'}
                  </div>
                  <div className="status-info">
                    <div className="status-title">Client Payment</div>
                    <div className="status-subtitle">
                      {pw.clientPaymentStatus === 'paid_to_admin' ? 'Payment Received' : 'Awaiting Payment'}
                    </div>
                  </div>
                </div>
                <div className="status-connector"></div>
                <div className={`status-item ${pw.workCompletionStatus === 'completed' ? 'completed' : pw.workCompletionStatus === 'in_progress' ? 'in-progress' : 'pending'}`}>
                  <div className="status-icon-wrapper">
                    {pw.workCompletionStatus === 'completed' ? '✅' : pw.workCompletionStatus === 'in_progress' ? '⚡' : '⏳'}
                  </div>
                  <div className="status-info">
                    <div className="status-title">Work Status</div>
                    <div className="status-subtitle">
                      {pw.workCompletionStatus === 'completed' ? 'Completed' : pw.workCompletionStatus === 'in_progress' ? 'In Progress' : 'Not Started'}
                    </div>
                  </div>
                </div>
                <div className="status-connector"></div>
                <div className={`status-item ${pw.adminApprovalStatus === 'approved' ? 'completed' : pw.adminApprovalStatus === 'rejected' ? 'rejected' : 'pending'}`}>
                  <div className="status-icon-wrapper">
                    {pw.adminApprovalStatus === 'approved' ? '✅' : pw.adminApprovalStatus === 'rejected' ? '❌' : '⏳'}
                  </div>
                  <div className="status-info">
                    <div className="status-title">Admin Review</div>
                    <div className="status-subtitle">
                      {pw.adminApprovalStatus === 'approved' ? 'Approved' : pw.adminApprovalStatus === 'rejected' ? 'Rejected' : 'Pending Review'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {(pw.clientPaymentDate || contract.workSubmission?.submittedAt || pw.clientFundsReleasedAt) && (
              <div className="info-card timeline-card">
                <div className="card-header-icon">
                  <span className="header-icon">🕐</span>
                  <h2>Timeline</h2>
                </div>
                <div className="timeline-modern">
                  {pw.clientPaymentDate && (
                    <div className="timeline-event">
                      <div className="event-marker"></div>
                      <div className="event-content">
                        <div className="event-title">💳 Payment Received</div>
                        <div className="event-date">{new Date(pw.clientPaymentDate).toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                  {contract.workSubmission?.submittedAt && (
                    <div className="timeline-event">
                      <div className="event-marker"></div>
                      <div className="event-content">
                        <div className="event-title">📝 Work Order Submitted</div>
                        <div className="event-date">{new Date(contract.workSubmission.submittedAt).toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                  {pw.clientFundsReleasedAt && (
                    <div className="timeline-event completed-event">
                      <div className="event-marker"></div>
                      <div className="event-content">
                        <div className="event-title">🎉 Contract Completed</div>
                        <div className="event-date">{new Date(pw.clientFundsReleasedAt).toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Work Submission Details */}
            {contract.workSubmission && (
              <div className="info-card work-submission-card">
                <div className="card-header-icon">
                  <span className="header-icon">📄</span>
                  <h2>Work Order Details</h2>
                </div>
                <div className="work-details-grid">
                  <div className="work-detail-section">
                    <div className="work-detail-label">Description</div>
                    <div className="work-detail-content">{contract.workSubmission.description}</div>
                  </div>
                  <div className="work-detail-section">
                    <div className="work-detail-label">Deliverables</div>
                    <div className="work-detail-content">{contract.workSubmission.deliverables}</div>
                  </div>
                  <div className="work-detail-section">
                    <div className="work-detail-label">Timeline</div>
                    <div className="work-detail-content">{contract.workSubmission.timeline}</div>
                  </div>
                  {contract.workSubmission.additionalNotes && (
                    <div className="work-detail-section">
                      <div className="work-detail-label">Additional Notes</div>
                      <div className="work-detail-content">{contract.workSubmission.additionalNotes}</div>
                    </div>
                  )}
                  {contract.workSubmission.attachmentUrl && (
                    <div className="work-detail-section">
                      <div className="work-detail-label">Attachment</div>
                      <a href={contract.workSubmission.attachmentUrl} target="_blank" rel="noopener noreferrer" className="attachment-link-modern">
                        <span>📎</span>
                        <span>View Attachment</span>
                        <span>→</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="details-right-column">
            {/* Payment Action */}
            {pw.clientPaymentStatus === 'awaiting_payment' && (
              <div className="action-card payment-action">
                <div className="action-card-header">
                  <span className="action-step">Step 1</span>
                  <h3>💳 Make Payment</h3>
                </div>
                <p className="action-description">Pay the contract amount to proceed</p>
                <div className="action-body">
                  <ClientPayment
                    contract={contract}
                    onPaymentSuccess={() => {
                      toast.success('Payment successful!');
                      fetchContractDetails();
                    }}
                  />
                </div>
              </div>
            )}

            {/* Work Submission Action */}
            {pw.clientPaymentStatus === 'paid_to_admin' && 
             pw.workCompletionStatus === 'not_started' &&
             contract.clientId?._id?.toString() === currentUser?._id?.toString() && (
              <div className="action-card work-action">
                <div className="action-card-header">
                  <span className="action-step">Step 2</span>
                  <h3>📝 Submit Work Order</h3>
                </div>
                <p className="action-description">Provide detailed work requirements</p>
                <div className="action-body">
                  <WorkSubmissionPage
                    contract={contract}
                    onSubmitSuccess={() => {
                      toast.success('Work order submitted!');
                      fetchContractDetails();
                    }}
                  />
                </div>
              </div>
            )}

            {/* Waiting for Client */}
            {pw.clientPaymentStatus === 'paid_to_admin' && 
             pw.workCompletionStatus === 'not_started' &&
             contract.freelancerId?._id === currentUser?._id && (
              <div className="status-card-action waiting-card">
                <div className="status-icon-large">⏳</div>
                <h3>Waiting for Client</h3>
                <p>Payment received! Waiting for client to submit work order details.</p>
              </div>
            )}

            {/* Admin Review */}
            {pw.clientPaymentStatus === 'paid_to_admin' && 
             pw.workCompletionStatus === 'in_progress' && 
             pw.adminApprovalStatus === 'pending_approval' && (
              <div className="status-card-action review-card">
                <div className="status-icon-large">📋</div>
                <h3>Under Admin Review</h3>
                <p>Work order is being reviewed by admin. You'll be notified once approved.</p>
              </div>
            )}

            {/* Release Funds */}
            {pw.clientPaymentStatus === 'paid_to_admin' && 
             pw.workCompletionStatus === 'in_progress' &&
             pw.adminApprovalStatus === 'approved' && 
             !pw.clientFundsReleasedAt && (
              <div className="action-card release-action">
                <div className="action-card-header">
                  <span className="action-step">Step 4</span>
                  <h3>✅ Release Funds</h3>
                </div>
                <p className="action-description">Admin approved! Confirm and release payment</p>
                <div className="action-body">
                  <ClientReleaseFunds
                    contract={contract}
                    onReleaseSuccess={() => {
                      toast.success('Fund release requested!');
                      fetchContractDetails();
                    }}
                  />
                </div>
              </div>
            )}

            {/* Completed */}
            {pw.clientFundsReleasedAt && (
              <div className="status-card-action completed-card">
                <div className="status-icon-large">🎉</div>
                <h3>Contract Completed!</h3>
                <p>All payments processed successfully.</p>
                <div className="completion-stats">
                  <div className="completion-stat">
                    <div className="stat-label">Your Earnings</div>
                    <div className="stat-amount">₹{contract.freelancerAmount?.toLocaleString()}</div>
                  </div>
                  <div className="completion-stat">
                    <div className="stat-label">Completed On</div>
                    <div className="stat-date">{new Date(pw.clientFundsReleasedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Rejected */}
            {pw.adminApprovalStatus === 'rejected' && (
              <div className="status-card-action rejected-card">
                <div className="status-icon-large">❌</div>
                <h3>Work Rejected</h3>
                <p>Admin requested revisions. Please review and submit updated work.</p>
                <button className="action-btn-modern" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  View Requirements
                </button>
              </div>
            )}

            {/* Dispute Button */}
            {contract?.status !== 'completed' && contract?.status !== 'refunded' && (
              <div className="dispute-card">
                <button 
                  className="dispute-btn-modern"
                  onClick={() => setShowDisputeModal(true)}
                >
                  <span>⚖️</span>
                  <span>Raise Dispute</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dispute Modal */}
      <RaiseDisputeModal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        contractId={contractId}
        onDisputeCreated={fetchContractDetails}
      />
    </div>
  );
};

export default ContractDetailsPage;
