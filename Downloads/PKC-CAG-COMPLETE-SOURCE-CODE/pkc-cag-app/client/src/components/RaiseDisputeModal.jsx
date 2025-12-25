import React, { useState } from 'react';
import { marketplaceAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './RaiseDisputeModal.css';

const RaiseDisputeModal = ({ isOpen, onClose, contractId, onDisputeCreated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    attachments: []
  });

  const reasons = [
    { value: 'quality-issue', label: '⭐ Quality Issue - Work doesn\'t meet standards' },
    { value: 'not-delivered', label: '📦 Not Delivered - Work not delivered on time' },
    { value: 'miscommunication', label: '💬 Miscommunication - Unclear requirements' },
    { value: 'payment-issue', label: '💳 Payment Issue - Payment problems' },
    { value: 'other', label: '❓ Other - Something else' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.reason.trim()) {
      toast.error('Please select a reason');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please provide a detailed description');
      return;
    }

    if (formData.description.trim().length < 20) {
      toast.error('Description must be at least 20 characters');
      return;
    }

    try {
      setLoading(true);
      console.log('📝 Creating dispute with:', { contractId, ...formData });

      await marketplaceAPI.createDispute({
        contractId,
        reason: formData.reason,
        description: formData.description,
        attachments: formData.attachments
      });

      toast.success('✅ Dispute created successfully!');
      
      // Reset form
      setFormData({
        reason: '',
        description: '',
        attachments: []
      });

      // Callback to refresh disputes
      if (onDisputeCreated) {
        onDisputeCreated();
      }

      onClose();
    } catch (err) {
      console.error('Error creating dispute:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create dispute';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      reason: '',
      description: '',
      attachments: []
    });
  };

  if (!isOpen) return null;

  return (
    <div className="dispute-modal-overlay">
      <div className="dispute-modal">
        {/* Header */}
        <div className="dispute-modal-header">
          <h2>⚖️ Raise a Dispute</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="dispute-form">
          {/* Reason */}
          <div className="form-group">
            <label>
              <span className="label-text">Reason for Dispute</span>
              <span className="required">*</span>
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="form-input"
              disabled={loading}
            >
              <option value="">-- Select a reason --</option>
              {reasons.map(r => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {formData.reason && (
              <p className="reason-hint">
                Selected: {reasons.find(r => r.value === formData.reason)?.label}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label>
              <span className="label-text">Detailed Description</span>
              <span className="required">*</span>
              <span className="char-count">
                ({formData.description.length}/2000)
              </span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Please provide detailed information about the dispute. Include specific details, dates, and evidence references..."
              className="form-textarea"
              rows="6"
              maxLength="2000"
              disabled={loading}
            />
            <p className="helper-text">
              ℹ️ Be specific and detailed. This helps admins resolve the dispute faster.
            </p>
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label>
              <span className="label-text">Attach Evidence (Optional)</span>
            </label>
            <div className="file-upload-box">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="file-input"
                accept="image/*,.pdf,.doc,.docx"
                disabled={loading}
              />
              <div className="file-upload-icon">📎</div>
              <p className="file-upload-text">
                Click to select files or drag and drop
              </p>
              <p className="file-upload-hint">
                Supported: Images, PDF, Documents (Max 5MB each)
              </p>
            </div>

            {/* Selected Files */}
            {formData.attachments.length > 0 && (
              <div className="selected-files">
                <p className="files-title">Selected Files ({formData.attachments.length}):</p>
                <ul className="files-list">
                  {formData.attachments.map((file, idx) => (
                    <li key={idx} className="file-item">
                      📄 {file.name}
                      <span className="file-size">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Important Info */}
          <div className="important-box">
            <h4>⚠️ Important</h4>
            <ul>
              <li>False disputes may result in account suspension</li>
              <li>Both parties will be notified and can respond</li>
              <li>Admin will review and make a final decision</li>
              <li>Resolution process typically takes 3-5 business days</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="dispute-modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={loading}
            >
              Clear Form
            </button>
            <button
              type="button"
              className="btn btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Creating Dispute...
                </>
              ) : (
                '⚖️ Submit Dispute'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseDisputeModal;
