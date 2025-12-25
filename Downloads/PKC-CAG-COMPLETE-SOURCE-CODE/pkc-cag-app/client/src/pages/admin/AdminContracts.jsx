import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminContracts.css';

const AdminContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getContracts();
      setContracts(response.data || []);
      setFilteredContracts(response.data || []);
    } catch (err) {
      toast.error('Failed to load contracts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContract = async (contractId, jobTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this contract?\n\nJob: ${jobTitle}\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await adminAPI.deleteContract(contractId);
      toast.success('Contract deleted successfully');
      setContracts(contracts.filter(c => c._id !== contractId));
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete contract');
    }
  };

  const handleMarkPaymentDone = async (contractId) => {
    const confirmed = window.confirm(
      `Mark payment as completed?\n\nPlease confirm you have transferred funds externally to the freelancer.`
    );

    if (!confirmed) return;

    setProcessingId(contractId);
    try {
      await adminAPI.markPaymentDone(contractId);
      toast.success('✅ Payment marked as completed!');
      setContracts(contracts.map(c => 
        c._id === contractId 
          ? { ...c, paymentWorkflow: { ...c.paymentWorkflow, clientFundsReleasedAt: new Date() } }
          : c
      ));
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(err.response?.data?.message || 'Failed to mark payment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCloseContract = async (contractId) => {
    const confirmed = window.confirm(
      `Close this contract?\n\nThis will mark the contract as completed and finalize all transactions.`
    );

    if (!confirmed) return;

    setProcessingId(contractId);
    try {
      await adminAPI.closeContract(contractId);
      toast.success('✅ Contract closed successfully!');
      setContracts(contracts.map(c => 
        c._id === contractId 
          ? { ...c, status: 'completed' }
          : c
      ));
    } catch (err) {
      console.error('Close error:', err);
      toast.error(err.response?.data?.message || 'Failed to close contract');
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    let filtered = contracts;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(contract =>
        contract.paymentWorkflow?.clientPaymentStatus === statusFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.freelancerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredContracts(filtered);
  }, [searchTerm, statusFilter, contracts]);

  if (loading) {
    return (
      <div className="admin-contracts-container">
        <div className="loading-screen">
          <div className="loader-container">
            <div className="loader-spinner"></div>
            <div className="loader-glow"></div>
          </div>
          <p>Loading contracts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-contracts-container">
      <div className="contracts-background">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      <div className="contracts-content">
        <div className="contracts-header">
          <div className="header-info">
            <div className="header-icon">
              <i className="fas fa-file-contract"></i>
            </div>
            <div>
              <h1>Work Submissions & Contracts</h1>
              <p>Review work submitted by freelancers and manage contracts</p>
            </div>
          </div>
        </div>

        <div className="contracts-controls">
          <div className="search-wrapper">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by job title, freelancer, or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="awaiting_payment">Awaiting Payment</option>
            <option value="paid_to_admin">Paid to Admin</option>
            <option value="payment_failed">Payment Failed</option>
          </select>
        </div>

        {filteredContracts.length === 0 ? (
          <div className="no-contracts">
            <div className="empty-icon">
              <i className="fas fa-inbox"></i>
            </div>
            <h3>No contracts found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="contracts-grid">
            {filteredContracts.map((contract) => (
              <div key={contract._id} className="contract-card">
                <div className="card-glow"></div>
                
                <div className="contract-header">
                  <h3>{contract.jobId?.title || 'Untitled Job'}</h3>
                  <span className={`status-badge status-${contract.paymentWorkflow?.clientPaymentStatus}`}>
                    {contract.paymentWorkflow?.clientPaymentStatus === 'paid_to_admin' ? (
                      <>
                        <i className="fas fa-check-circle"></i>
                        PAID
                      </>
                    ) : contract.paymentWorkflow?.clientPaymentStatus === 'awaiting_payment' ? (
                      <>
                        <i className="fas fa-clock"></i>
                        AWAITING
                      </>
                    ) : (
                      <>
                        <i className="fas fa-times-circle"></i>
                        FAILED
                      </>
                    )}
                  </span>
                </div>

                <div className="contract-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <i className="fas fa-user"></i>
                      <div>
                        <span className="label">Client</span>
                        <span className="value">{contract.clientId?.name || 'Unknown'}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-user-tie"></i>
                      <div>
                        <span className="label">Freelancer</span>
                        <span className="value">{contract.freelancerId?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-item">
                      <i className="fas fa-coins"></i>
                      <div>
                        <span className="label">Amount</span>
                        <span className="value amount">₹{contract.totalAmount}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-calendar-alt"></i>
                      <div>
                        <span className="label">Date</span>
                        <span className="value">{new Date(contract.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {contract.freelancerApplication && (
                  <div className="payment-details-section">
                    <div className="section-header">
                      <i className="fas fa-credit-card"></i>
                      <h4>Payment Details (Admin Only)</h4>
                    </div>
                    <div className="payment-info">
                      {contract.freelancerApplication.upiId && (
                        <div className="payment-row">
                          <span className="payment-label">UPI ID:</span>
                          <span className="payment-value">{contract.freelancerApplication.upiId}</span>
                        </div>
                      )}
                      {contract.freelancerApplication.workReceivingEmail && (
                        <div className="payment-row">
                          <span className="payment-label">Work Email:</span>
                          <span className="payment-value">{contract.freelancerApplication.workReceivingEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="work-status">
                  {contract.workSubmission ? (
                    <>
                      <div className="status-indicator success">
                        <i className="fas fa-check-circle"></i>
                        <div>
                          <strong>Work Submitted</strong>
                          <p>on {new Date(contract.workSubmission.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {contract.paymentWorkflow?.adminApprovalStatus === 'pending_approval' && (
                        <div className="approval-alert">
                          <i className="fas fa-exclamation-circle"></i>
                          <span>Pending Admin Review</span>
                        </div>
                      )}
                      
                      {contract.paymentWorkflow?.adminApprovalStatus === 'approved' && (
                        <div className="approval-alert success">
                          <i className="fas fa-check-circle"></i>
                          <span>Approved by Admin</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="status-indicator pending">
                      <i className="fas fa-clock"></i>
                      <div>
                        <strong>Awaiting Submission</strong>
                        <p>Waiting for freelancer to submit work</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="contract-actions">
                  <Link to={`/admin/contract/${contract._id}`} className="action-btn primary">
                    <i className="fas fa-eye"></i>
                    View Details
                  </Link>

                  {contract.workSubmission && 
                   contract.paymentWorkflow?.adminApprovalStatus === 'pending_approval' && (
                    <Link to={`/admin/review-work/${contract._id}`} className="action-btn warning">
                      <i className="fas fa-clipboard-check"></i>
                      Review Work
                    </Link>
                  )}

                  {contract.paymentWorkflow?.clientPaymentStatus === 'paid_to_admin' && 
                   contract.workSubmission && 
                   contract.paymentWorkflow?.adminApprovalStatus === 'approved' &&
                   !contract.paymentWorkflow?.clientFundsReleasedAt && (
                    <button
                      onClick={() => handleMarkPaymentDone(contract._id)}
                      disabled={processingId === contract._id}
                      className="action-btn success"
                    >
                      {processingId === contract._id ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-money-check-alt"></i>
                          Payment Done
                        </>
                      )}
                    </button>
                  )}

                  {contract.paymentWorkflow?.clientFundsReleasedAt && 
                   contract.status !== 'completed' && (
                    <button
                      onClick={() => handleCloseContract(contract._id)}
                      disabled={processingId === contract._id}
                      className="action-btn info"
                    >
                      {processingId === contract._id ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Closing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check-double"></i>
                          Close Contract
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteContract(contract._id, contract.jobId?.title)}
                    className="action-btn danger"
                  >
                    <i className="fas fa-trash-alt"></i>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContracts;