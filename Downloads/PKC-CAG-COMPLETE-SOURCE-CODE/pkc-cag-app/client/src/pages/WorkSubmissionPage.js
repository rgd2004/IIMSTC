import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './WorkSubmissionPage.css';

const WorkSubmissionPage = ({ contract, onSubmitSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [workDetails, setWorkDetails] = useState({
    description: '',
    deliverables: '',
    timeline: '',
    additionalNotes: '',
    attachmentUrl: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWorkDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!workDetails.description.trim()) {
        toast.error('Please provide a description of the work/services');
        setLoading(false);
        return;
      }

      if (!workDetails.deliverables.trim()) {
        toast.error('Please specify expected deliverables');
        setLoading(false);
        return;
      }

      if (!workDetails.timeline.trim()) {
        toast.error('Please mention timeline/deadline');
        setLoading(false);
        return;
      }

      // Submit work details to backend
      console.log('📤 Submitting work order details...');
      const response = await adminAPI.submitWorkDetails(contract._id, workDetails);

      console.log('✅ Work details submitted:', response.data);
      toast.success('✅ Work order submitted! Admin will review and approve shortly.');

      // Call onSubmitSuccess callback to reload contracts
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error('❌ Error submitting work order:', error);
      toast.error(error.response?.data?.message || 'Error submitting work order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="work-submission-container">
      <div className="submission-card">
        <div className="header">
          <h1>� Submit Your Work Order</h1>
          <p className="subtitle">Payment verified! Now describe the work/services you want completed</p>
        </div>

        <div className="contract-info">
          <div className="info-row">
            <span className="label">Contract ID:</span>
            <span className="value">{contract._id}</span>
          </div>
          <div className="info-row">
            <span className="label">Service Provider:</span>
            <span className="value">{contract.freelancerId?.name}</span>
          </div>
          <div className="info-row">
            <span className="label">Amount:</span>
            <span className="value">₹{contract.totalAmount}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="description">Work Description *</label>
            <textarea
              id="description"
              name="description"
              value={workDetails.description}
              onChange={handleInputChange}
              placeholder="Describe the work/services you need done, scope, requirements, and specifications..."
              rows="4"
              required
            />
            <small>Provide detailed description of the work</small>
          </div>

          <div className="form-group">
            <label htmlFor="deliverables">Deliverables *</label>
            <textarea
              id="deliverables"
              name="deliverables"
              value={workDetails.deliverables}
              onChange={handleInputChange}
              placeholder="List what will be delivered (e.g., Source code, documentation, files, etc.)"
              rows="3"
              required
            />
            <small>Specify what the freelancer will deliver</small>
          </div>

          <div className="form-group">
            <label htmlFor="timeline">Timeline/Deadline *</label>
            <input
              type="text"
              id="timeline"
              name="timeline"
              value={workDetails.timeline}
              onChange={handleInputChange}
              placeholder="e.g., 5 days, By Dec 25, 2025, etc."
              required
            />
            <small>When should the work be completed?</small>
          </div>

          <div className="form-group">
            <label htmlFor="additionalNotes">Additional Notes</label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={workDetails.additionalNotes}
              onChange={handleInputChange}
              placeholder="Any additional requirements or specifications..."
              rows="3"
            />
            <small>Optional: Add any other important details</small>
          </div>

          <div className="form-group">
            <label htmlFor="attachmentUrl">Reference/Attachment URL</label>
            <input
              type="url"
              id="attachmentUrl"
              name="attachmentUrl"
              value={workDetails.attachmentUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/reference-file"
            />
            <small>Optional: Link to reference materials or attachment</small>
          </div>

          <div className="info-box">
            <h4>📧 Email Notification</h4>
            <p>All work details will be sent to: <strong>pkccag@gmail.com</strong></p>
            <p>Admin will review and contact the freelancer with next steps.</p>
          </div>

          <div className="button-group">
            <button 
              type="button" 
              onClick={() => navigate('/dashboard')}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-submit"
            >
              {loading ? '⏳ Submitting...' : '✅ Submit Work Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkSubmissionPage;
