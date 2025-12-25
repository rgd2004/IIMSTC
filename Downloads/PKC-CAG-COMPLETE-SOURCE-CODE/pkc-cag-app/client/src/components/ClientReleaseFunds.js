import React, { useState } from 'react';
import { adminAPI } from '../utils/api';
import './ClientReleaseFunds.css';

const ClientReleaseFunds = ({ contract, onReleaseSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRefundWarning, setShowRefundWarning] = useState(false);
  const [action, setAction] = useState('release'); // 'release' or 'refund'
  const [formData, setFormData] = useState({
    notes: '',
    refundReason: '',
  });

  if (contract.paymentWorkflow?.clientPaymentStatus !== 'paid_to_admin') {
    return (
      <div className="funds-status not-paid">
        <div className="status-icon">⏳</div>
        <h3>Awaiting Payment</h3>
        <p>Payment must be completed first.</p>
      </div>
    );
  }

  if (contract.paymentWorkflow?.clientFundsReleasedAt) {
    return (
      <div className="funds-status released">
        <div className="status-icon">⏳</div>
        <h3>Fund Release Requested</h3>
        <p>Your request has been submitted. Admin will review and transfer funds to freelancer.</p>
        <p className="sub-text">Approval Status: {contract.paymentWorkflow.adminApprovalStatus === 'approved' ? '✅ Approved' : contract.paymentWorkflow.adminApprovalStatus === 'rejected' ? '❌ Rejected' : '⏳ Pending Admin Review'}</p>
      </div>
    );
  }

  const freelancerAmount = Math.round(contract.totalAmount * 0.9);
  const adminCommission = contract.totalAmount - freelancerAmount;

  const handleReleaseClick = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.notes.trim()) {
        setError('Please provide verification notes');
        setLoading(false);
        return;
      }

      const response = await adminAPI.requestFundRelease(contract._id, {
        notes: formData.notes,
      });

      setSuccess('✅ Funds released! Admin will review and pay the freelancer shortly.');
      setFormData({ notes: '', refundReason: '' });
      setAction('release');

      if (onReleaseSuccess) {
        onReleaseSuccess(response);
      }

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error releasing funds');
    } finally {
      setLoading(false);
    }
  };

  const handleRefundClick = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.refundReason.trim() || formData.refundReason.length < 10) {
        setError('Please provide a detailed reason (minimum 10 characters)');
        setLoading(false);
        return;
      }

      const response = await adminAPI.requestRefund(contract._id, {
        reason: formData.refundReason,
      });

      setSuccess('✅ Refund request submitted! Admin will review your case.');
      setFormData({ notes: '', refundReason: '' });
      setAction('release');
      setShowRefundWarning(false);

      if (onReleaseSuccess) {
        onReleaseSuccess(response);
      }

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error requesting refund');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-release-container">
      {showRefundWarning && (
        <div className="refund-confirmation-modal">
          <div className="modal-content">
            <h3>⚠️ Request Refund?</h3>
            <p>You're about to request a refund of ₹{contract.totalAmount}.</p>
            <p>This will be reviewed by the admin, and work will be considered incomplete.</p>
            
            <div className="form-group">
              <label htmlFor="refundReason">Reason for Refund *</label>
              <textarea
                id="refundReason"
                value={formData.refundReason}
                onChange={(e) => setFormData({ ...formData, refundReason: e.target.value })}
                placeholder="Explain why you're requesting a refund (minimum 10 characters)..."
                rows="4"
              />
              <small>{formData.refundReason.length}/200 characters</small>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-buttons">
              <button
                onClick={() => setShowRefundWarning(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleRefundClick}
                disabled={loading}
                className="btn-confirm-refund"
              >
                {loading ? '⏳ Submitting...' : '✅ Submit Refund Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="release-card">
        <h2>🎯 Release Funds to Freelancer</h2>

        <div className="breakdown-box">
          <h3>Payment Breakdown</h3>
          <div className="breakdown-row">
            <span>Total Amount:</span>
            <strong>₹{contract.totalAmount}</strong>
          </div>
          <div className="breakdown-row">
            <span>Freelancer Gets (90%):</span>
            <strong style={{ color: '#51cf66' }}>₹{freelancerAmount}</strong>
          </div>
          <div className="breakdown-row">
            <span>Admin Commission (10%):</span>
            <strong style={{ color: '#ffd700' }}>₹{adminCommission}</strong>
          </div>
        </div>

        <div className="info-section">
          <h4>📋 Before You Release:</h4>
          <ul>
            <li>✓ Review the work completed by freelancer</li>
            <li>✓ Check quality and completeness</li>
            <li>✓ Verify all deliverables are provided</li>
            <li>✓ Confirm no issues or revisions needed</li>
          </ul>
        </div>

        {!showRefundWarning && (
          <form onSubmit={handleReleaseClick}>
            <div className="form-group">
              <label htmlFor="notes">Verification Notes *</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Confirm work quality, deliverables received, any feedback for freelancer..."
                rows="3"
                required
              />
              <small>Help admin verify the work quality</small>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="button-group">
              <button
                type="submit"
                disabled={loading}
                className="btn-release"
              >
                {loading ? '⏳ Processing...' : `✅ Request Fund Release (₹${freelancerAmount} to Freelancer)`}
              </button>

              <button
                type="button"
                onClick={() => setShowRefundWarning(true)}
                className="btn-refund"
              >
                ❌ Request Refund
              </button>
            </div>
          </form>
        )}

        <div className="timeline-info">
          <h4>⏱️ What Happens Next:</h4>
          <div className="timeline">
            <div className="timeline-item active">
              <span>1</span>
              <span>You Request Release</span>
            </div>
            <div className="timeline-item">
              <span>2</span>
              <span>Admin Reviews</span>
            </div>
            <div className="timeline-item">
              <span>3</span>
              <span>Admin Transfers Funds</span>
            </div>
            <div className="timeline-item">
              <span>4</span>
              <span>Contract Complete ✅</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientReleaseFunds;
