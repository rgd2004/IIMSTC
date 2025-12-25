// client/src/pages/marketplace/ContractsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { marketplaceAPI } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import ClientPayment from "../../components/ClientPayment";
import ClientReleaseFunds from "../../components/ClientReleaseFunds";
import WorkSubmissionPage from "../WorkSubmissionPage";
import "./ContractsPage.css";
import toast from "react-hot-toast";

const ContractsPage = () => {
  const navigate = useNavigate();
  const { user: contextUser } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const getCurrentUser = () => {
    if (contextUser) {
      console.log('📌 User from context:', { 
        id: contextUser._id || contextUser.id, 
        email: contextUser.email,
        keys: Object.keys(contextUser)
      });
      return contextUser;
    }
    
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        console.log('📌 User from localStorage:', { 
          id: user._id || user.id, 
          email: user.email,
          keys: Object.keys(user)
        });
        return user;
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    return null;
  };

  useEffect(() => {
    loadContracts();
  }, [filter, contextUser]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      console.log('📍 Loading contracts from API...');
      console.log('📍 Current user (final):', currentUser?._id, currentUser?.email);
      
      const res = await marketplaceAPI.getMyContracts({ status: filter !== "all" ? filter : undefined });
      console.log('📍 API Response:', res.data);
      console.log('📍 Contracts data:', res.data?.contracts);
      
      const contractsList = res.data?.contracts || [];
      console.log('📍 Setting contracts:', contractsList);
      
      const processedContracts = contractsList.map(contract => {
        const currentUser = getCurrentUser();
        const clientId = contract.clientId?._id || contract.clientId;
        const currentUserId = currentUser?._id || currentUser?.id;
        const isClientMatch = currentUser && clientId && currentUserId && currentUserId.toString() === clientId.toString();
        console.log('📋 Contract check:', {
          contractId: contract._id,
          fullPaymentWorkflow: JSON.stringify(contract.paymentWorkflow, null, 2),
          paymentStatus: contract.paymentWorkflow?.clientPaymentStatus,
          workStatus: contract.paymentWorkflow?.workCompletionStatus,
          currentUserId: currentUserId,
          clientId: clientId,
          isClientMatch,
          shouldShowWorkSubmissionForm: contract.paymentWorkflow?.clientPaymentStatus === 'paid_to_admin' && 
                         contract.paymentWorkflow?.workCompletionStatus === 'not_started' &&
                         isClientMatch
        });
        
        return {
          ...contract,
          jobId: contract.jobId || contract.job,
          status: contract.status || 'active',
          paymentWorkflow: contract.paymentWorkflow || {
            clientPaymentStatus: 'awaiting_payment',
            workCompletionStatus: 'not_started',
            adminApprovalStatus: 'pending_approval',
            refundStatus: 'no_refund'
          }
        };
      });
      
      setContracts(processedContracts);
      
      if (contractsList.length === 0) {
        console.log('ℹ️ No contracts found');
      } else {
        console.log(`✅ Loaded ${contractsList.length} contracts`);
      }
    } catch (err) {
      console.error('❌ Error loading contracts:', err);
      console.error('❌ Error response:', err.response?.data);
      toast.error("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = filter === "all" ? contracts : contracts.filter((c) => c.status === filter);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: '#f59e0b', bg: '#fef3c7', label: 'Pending' },
      active: { color: '#10b981', bg: '#d1fae5', label: 'Active' },
      completed: { color: '#8b5cf6', bg: '#ede9fe', label: 'Completed' },
      cancelled: { color: '#ef4444', bg: '#fee2e2', label: 'Cancelled' },
    };
    return badges[status] || { color: '#6b7280', bg: '#f3f4f6', label: status };
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    if (paymentStatus === 'paid_to_admin') {
      return { icon: '✅', text: 'Paid', color: '#10b981', bg: '#d1fae5' };
    } else if (paymentStatus === 'awaiting_payment') {
      return { icon: '⏳', text: 'Awaiting Payment', color: '#f59e0b', bg: '#fef3c7' };
    }
    return { icon: '⏳', text: 'Pending', color: '#6b7280', bg: '#f3f4f6' };
  };

  return (
    <div className="contracts-page">
      {/* Hero Header */}
      <div className="contracts-hero">
        <div className="hero-content">
          <div className="hero-icon">💼</div>
          <h1 className="hero-title">My Contracts</h1>
          <p className="hero-subtitle">Manage your freelance contracts and track project progress</p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-value">{contracts.length}</div>
            <div className="stat-label">Total Contracts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{contracts.filter(c => c.status === 'active').length}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{contracts.filter(c => c.status === 'completed').length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs-container">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            <span className="tab-icon">📋</span>
            <span>All</span>
            <span className="tab-count">{contracts.length}</span>
          </button>
          <button
            className={`filter-tab ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            <span className="tab-icon">⏳</span>
            <span>Pending</span>
            <span className="tab-count">{contracts.filter(c => c.status === 'pending').length}</span>
          </button>
          <button
            className={`filter-tab ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            <span className="tab-icon">🚀</span>
            <span>Active</span>
            <span className="tab-count">{contracts.filter(c => c.status === 'active').length}</span>
          </button>
          <button
            className={`filter-tab ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            <span className="tab-icon">✅</span>
            <span>Completed</span>
            <span className="tab-count">{contracts.filter(c => c.status === 'completed').length}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="contracts-content-wrapper">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <p className="loading-text">Loading your contracts...</p>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <div className="empty-circle">📄</div>
            </div>
            <h3 className="empty-title">No Contracts Found</h3>
            <p className="empty-description">
              {filter === "all" 
                ? "You don't have any contracts yet. Start by browsing available jobs!"
                : `No ${filter} contracts at the moment.`}
            </p>
            <button className="empty-cta" onClick={() => navigate("/marketplace/browse")}>
              <span>Browse Jobs</span>
              <span className="cta-arrow">→</span>
            </button>
          </div>
        ) : (
          <div className="contracts-grid">
            {filteredContracts.map((contract) => {
              const statusBadge = getStatusBadge(contract.status);
              const paymentBadge = getPaymentStatusBadge(contract.paymentWorkflow?.clientPaymentStatus);
              const currentUser = getCurrentUser();
              const paymentStatus = contract.paymentWorkflow?.clientPaymentStatus;
              const workStatus = contract.paymentWorkflow?.workCompletionStatus;
              const adminStatus = contract.paymentWorkflow?.adminApprovalStatus;
              const clientId = contract.clientId?._id || contract.clientId;
              const currentUserId = currentUser?._id || currentUser?.id;
              const isClient = clientId && currentUserId && clientId.toString() === currentUserId.toString();

              return (
                <div key={contract._id} className="contract-card-modern">
                  {/* Card Header */}
                  <div className="card-header-modern">
                    <div className="header-top">
                      <h3 className="contract-title">{contract.jobId?.title || contract.job?.title || "Untitled Job"}</h3>
                      <span 
                        className="status-badge"
                        style={{ 
                          color: statusBadge.color, 
                          backgroundColor: statusBadge.bg 
                        }}
                      >
                        {statusBadge.label}
                      </span>
                    </div>
                    <div className="contract-meta">
                      <span className="meta-item">
                        <span className="meta-icon">🆔</span>
                        {contract._id.slice(-8)}
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">📅</span>
                        {new Date(contract.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Financial Overview */}
                  <div className="financial-overview">
                    <div className="financial-grid">
                      <div className="financial-item primary">
                        <div className="financial-label">Total Amount</div>
                        <div className="financial-value">₹{contract.totalAmount?.toLocaleString()}</div>
                      </div>
                      <div className="financial-item">
                        <div className="financial-label">You Receive</div>
                        <div className="financial-value highlight">₹{contract.freelancerAmount?.toLocaleString()}</div>
                      </div>
                      <div className="financial-item">
                        <div className="financial-label">Platform Fee</div>
                        <div className="financial-value">₹{contract.platformCommission?.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status Banner */}
                  <div className="payment-status-banner" style={{ backgroundColor: paymentBadge.bg }}>
                    <span className="payment-icon">{paymentBadge.icon}</span>
                    <span className="payment-text" style={{ color: paymentBadge.color }}>
                      {paymentBadge.text}
                    </span>
                  </div>

                  {/* Action Sections */}
                  <div className="contract-actions-section">
                    {/* Payment Section */}
                    {paymentStatus === 'awaiting_payment' && (
                      <div className="action-block payment-block">
                        <div className="action-header">
                          <span className="action-icon">💳</span>
                          <span className="action-title">Payment Required</span>
                        </div>
                        <ClientPayment 
                          contract={contract} 
                          onPaymentSuccess={() => {
                            toast.success('✅ Payment successful!');
                            setTimeout(() => loadContracts(), 1000);
                          }}
                        />
                      </div>
                    )}

                    {/* Work Submission Section */}
                    {(() => {
                      const showForm = paymentStatus === 'paid_to_admin' && workStatus === 'not_started' && isClient;
                      
                      if (showForm) {
                        return (
                          <div className="action-block work-submission-block">
                            <div className="action-header">
                              <span className="action-icon">📝</span>
                              <span className="action-title">Submit Work Order</span>
                            </div>
                            <WorkSubmissionPage 
                              contract={contract}
                              onSubmitSuccess={() => {
                                toast.success('Work details submitted successfully!');
                                loadContracts();
                              }}
                            />
                          </div>
                        );
                      }
                      
                      if (paymentStatus === 'paid_to_admin' && workStatus === 'not_started') {
                        return (
                          <div className="info-block waiting-block">
                            <div className="info-icon">✅</div>
                            <div className="info-content">
                              <h4>Payment Received!</h4>
                              <p>{!isClient ? 'Waiting for client to submit work order' : 'Please refresh to see the work submission form'}</p>
                              {isClient && (
                                <button className="refresh-btn" onClick={() => window.location.reload()}>
                                  Refresh Page
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      }
                      
                      return null;
                    })()}

                    {/* Admin Review Status */}
                    {paymentStatus === 'paid_to_admin' && 
                     workStatus === 'in_progress' && 
                     adminStatus === 'pending_approval' && (
                      <div className="info-block review-block">
                        <div className="info-icon">⏳</div>
                        <div className="info-content">
                          <h4>Under Admin Review</h4>
                          <p>
                            {isClient 
                              ? 'Your work order is being reviewed. You\'ll be notified once approved.' 
                              : 'Client submitted work order. Waiting for admin approval.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Release Funds Section */}
                    {paymentStatus === 'paid_to_admin' && 
                     workStatus === 'in_progress' &&
                     adminStatus === 'approved' && (
                      <div className="action-block release-block">
                        <div className="action-header">
                          <span className="action-icon">💰</span>
                          <span className="action-title">Ready for Completion</span>
                        </div>
                        <ClientReleaseFunds 
                          contract={contract} 
                          onReleaseSuccess={() => {
                            toast.success('Request submitted successfully!');
                            loadContracts();
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="card-footer-modern">
                    <button
                      className="view-details-btn"
                      onClick={() => navigate(`/marketplace/contracts/${contract._id}`)}
                    >
                      <span>View Full Details</span>
                      <span className="btn-arrow">→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractsPage;
