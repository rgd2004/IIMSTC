import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import './FreelancerApplicationForm.css';

const FreelancerApplicationForm = ({ job, onSubmit }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    proposedBudget: '',
    deliveryDays: '',
    portfolio: '',
    
    // Payment receiving details
    paymentMethod: 'upi',
    upiId: '',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    
    // Work receiving email
    workReceivingEmail: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!applicationData.coverLetter.trim()) {
      toast.error('Please write a cover letter');
      return false;
    }

    if (!applicationData.proposedBudget) {
      toast.error('Please enter proposed budget');
      return false;
    }

    if (!applicationData.deliveryDays) {
      toast.error('Please enter delivery days');
      return false;
    }

    if (!applicationData.workReceivingEmail.trim()) {
      toast.error("Please enter email where you'll receive work");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicationData.workReceivingEmail)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Payment method validation
    if (applicationData.paymentMethod === 'upi') {
      if (!applicationData.upiId.trim()) {
        toast.error('Please enter your UPI ID');
        return false;
      }
      if (!applicationData.upiId.includes('@')) {
        toast.error('Invalid UPI ID format (must contain @)');
        return false;
      }
    } else if (applicationData.paymentMethod === 'bank_transfer') {
      if (!applicationData.bankName.trim()) {
        toast.error('Please enter bank name');
        return false;
      }
      if (!applicationData.accountHolderName.trim()) {
        toast.error('Please enter account holder name');
        return false;
      }
      if (!applicationData.accountNumber.trim()) {
        toast.error('Please enter account number');
        return false;
      }
      if (!applicationData.ifscCode.trim()) {
        toast.error('Please enter IFSC code');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Submit application with payment and email details
      console.log('📤 Submitting application...');
      const response = await adminAPI.submitFreelancerApplication(job._id, applicationData);

      console.log('✅ Application submitted:', response.data);
      toast.success('✅ Application submitted successfully!');

      if (onSubmit) {
        onSubmit(response.data);
      }

      // Redirect after success
      setTimeout(() => {
        navigate('/marketplace');
      }, 2000);
    } catch (error) {
      console.error('❌ Error submitting application:', error);
      toast.error(error.response?.data?.message || 'Error submitting application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="application-form-container">
      <div className="form-card">
        <div className="header">
          <h1>💼 Apply for Job</h1>
          <p className="subtitle">Complete this form to apply and set your payment details</p>
        </div>

        <div className="job-info">
          <div className="info-row">
            <span className="label">Job:</span>
            <span className="value">{job?.title}</span>
          </div>
          <div className="info-row">
            <span className="label">Budget:</span>
            <span className="value">₹{job?.budget}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Application Details */}
          <div className="form-section">
            <h2>📝 Application Details</h2>

            <div className="form-group">
              <label htmlFor="coverLetter">Cover Letter *</label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                value={applicationData.coverLetter}
                onChange={handleInputChange}
                placeholder="Tell the client why you're a good fit for this project..."
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="proposedBudget">Proposed Budget *</label>
                <div className="input-group">
                  <span className="currency">₹</span>
                  <input
                    type="number"
                    id="proposedBudget"
                    name="proposedBudget"
                    value={applicationData.proposedBudget}
                    onChange={handleInputChange}
                    placeholder="Your proposed price"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="deliveryDays">Delivery Days *</label>
                <div className="input-group">
                  <input
                    type="number"
                    id="deliveryDays"
                    name="deliveryDays"
                    value={applicationData.deliveryDays}
                    onChange={handleInputChange}
                    placeholder="Days to complete"
                    min="1"
                    required
                  />
                  <span className="unit">days</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="portfolio">Portfolio Link</label>
              <input
                type="url"
                id="portfolio"
                name="portfolio"
                value={applicationData.portfolio}
                onChange={handleInputChange}
                placeholder="https://yourportfolio.com"
              />
              <small>Optional: Link to your portfolio or previous work</small>
            </div>
          </div>

          {/* Work Receiving Email */}
          <div className="form-section">
            <h2>📧 Work Receiving Email</h2>
            <p className="section-subtitle">Where should the client send work details after payment?</p>

            <div className="form-group">
              <label htmlFor="workReceivingEmail">Email Address *</label>
              <input
                type="email"
                id="workReceivingEmail"
                name="workReceivingEmail"
                value={applicationData.workReceivingEmail}
                onChange={handleInputChange}
                placeholder="your.email@gmail.com"
                required
              />
              <small>You'll receive work details at this email after client makes payment</small>
            </div>
          </div>

          {/* Payment Details */}
          <div className="form-section">
            <h2>💳 Payment Receiving Details</h2>
            <p className="section-subtitle">How should we send you payment after project completion?</p>

            <div className="form-group">
              <label>Payment Method *</label>
              <select
                name="paymentMethod"
                value={applicationData.paymentMethod}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Payment Method</option>
                <option value="upi">📱 UPI Transfer (Instant)</option>
                <option value="bank_transfer">🏦 Bank Transfer (1-3 days)</option>
              </select>
            </div>

            {applicationData.paymentMethod === 'upi' && (
              <div className="form-group">
                <label htmlFor="upiId">UPI ID *</label>
                <input
                  type="text"
                  id="upiId"
                  name="upiId"
                  value={applicationData.upiId}
                  onChange={handleInputChange}
                  placeholder="e.g., yourname@upi"
                  required
                />
                <small>Your UPI ID (e.g., name@icici, name@bank)</small>
              </div>
            )}

            {applicationData.paymentMethod === 'bank_transfer' && (
              <>
                <div className="form-group">
                  <label htmlFor="accountHolderName">Account Holder Name *</label>
                  <input
                    type="text"
                    id="accountHolderName"
                    name="accountHolderName"
                    value={applicationData.accountHolderName}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bankName">Bank Name *</label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    value={applicationData.bankName}
                    onChange={handleInputChange}
                    placeholder="e.g., HDFC Bank"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="accountNumber">Account Number *</label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={applicationData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="12-18 digit account number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ifscCode">IFSC Code *</label>
                  <input
                    type="text"
                    id="ifscCode"
                    name="ifscCode"
                    value={applicationData.ifscCode}
                    onChange={handleInputChange}
                    placeholder="e.g., HDFC0000123"
                    required
                  />
                </div>
              </>
            )}
          </div>

          <div className="info-box">
            <h4>✅ What Happens Next?</h4>
            <ul>
              <li>Client reviews your application</li>
              <li>Client selects you and makes payment</li>
              <li>You receive work details at your email</li>
              <li>Complete the work as per requirements</li>
              <li>Admin approves and sends payment to your account</li>
            </ul>
          </div>

          <div className="button-group">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-submit"
            >
              {loading ? '⏳ Submitting...' : '✅ Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FreelancerApplicationForm;
