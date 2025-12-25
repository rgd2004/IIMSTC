// client/src/pages/marketplace/ApplyJobPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { marketplaceAPI } from "../../utils/api";
import "./ApplyJobPage.css";
import toast from "react-hot-toast";

const ApplyJobPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    coverLetter: "",
    proposedBudget: "",
    deliveryDays: "",
    portfolio: [],
    upiId: "",
    paymentDetails: "",
    workReceivingEmail: "",
  });

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const res = await marketplaceAPI.getJobById(jobId);
      setJob(res.data);
    } catch (err) {
      console.error("Error loading job:", err);
      toast.error("Failed to load job details");
      navigate("/marketplace/jobs/browse");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.coverLetter.trim() ||
      !formData.proposedBudget ||
      !formData.deliveryDays ||
      !formData.upiId.trim() ||
      !formData.paymentDetails.trim() ||
      !formData.workReceivingEmail.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.workReceivingEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setSubmitting(true);
      const applicationData = {
        jobId,
        coverLetter: formData.coverLetter,
        proposedBudget: Number(formData.proposedBudget),
        deliveryDays: Number(formData.deliveryDays),
        portfolio: formData.portfolio,
        upiId: formData.upiId.trim(),
        paymentDetails: formData.paymentDetails.trim(),
        workReceivingEmail: formData.workReceivingEmail.trim(),
      };

      console.log("Submitting application:", applicationData);
      const res = await marketplaceAPI.submitApplication(applicationData);
      console.log("Application submitted:", res.data);

      toast.success("Application submitted successfully!");
      navigate("/marketplace/my-applications");
    } catch (err) {
      console.error("Error submitting application:", err);
      const errorMsg = err.response?.data?.message || "Failed to submit application";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="apply-job-container">
        <div className="loading">
          <div className="loader-spinner"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="apply-job-container">
        <div className="error-state">
          <p>Job not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-job-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="apply-job-wrapper">
        {/* Job Details */}
        <aside className="job-details-sidebar">
          <div className="job-details-card">
            <h3>{job.title}</h3>
            <p className="job-category">📂 {job.category}</p>

            <div className="job-detail-item">
              <span className="detail-label">Budget:</span>
              <span className="detail-value">₹{job.budget?.toLocaleString()}</span>
            </div>

            <div className="job-detail-item">
              <span className="detail-label">Duration:</span>
              <span className="detail-value">{job.duration}</span>
            </div>

            <div className="job-detail-item">
              <span className="detail-label">Estimated Days:</span>
              <span className="detail-value">{job.deliveryTime} days</span>
            </div>

            <div className="job-description-section">
              <h4>Description</h4>
              <p>{job.description}</p>
            </div>

            {job.skills && job.skills.length > 0 && (
              <div className="job-skills-section">
                <h4>Required Skills</h4>
                <div className="skills-list">
                  {job.skills.map((skill) => (
                    <span key={skill} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.clientId && (
              <div className="client-info">
                <h4>Client</h4>
                <div className="client-details">
                  <p>
                    <strong>
                      {job.clientId.firstName} {job.clientId.lastName}
                    </strong>
                  </p>
                  <p className="client-email">{job.clientId.email}</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Application Form */}
        <main className="application-form-section">
          <h2>📝 Submit Your Application</h2>

          <form onSubmit={handleSubmit} className="application-form">
            {/* Cover Letter */}
            <div className="form-group">
              <label htmlFor="coverLetter">Cover Letter *</label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                placeholder="Tell the client why you're the best fit for this job..."
                value={formData.coverLetter}
                onChange={handleChange}
                rows="6"
                maxLength="2000"
                required
              />
              <small>
                {formData.coverLetter.length}/2000 characters
              </small>
            </div>

            {/* Proposed Budget */}
            <div className="form-group">
              <label htmlFor="proposedBudget">Your Proposed Budget (₹) *</label>
              <input
                type="number"
                id="proposedBudget"
                name="proposedBudget"
                placeholder="Enter your proposed budget"
                value={formData.proposedBudget}
                onChange={handleChange}
                min="0"
                required
              />
              <small>
                {job.budget && (
                  <span>
                    Project budget: ₹{job.budget.toLocaleString()}
                  </span>
                )}
              </small>
            </div>

            {/* Delivery Days */}
            <div className="form-group">
              <label htmlFor="deliveryDays">Delivery Timeline (Days) *</label>
              <input
                type="number"
                id="deliveryDays"
                name="deliveryDays"
                placeholder="How many days to complete?"
                value={formData.deliveryDays}
                onChange={handleChange}
                min="1"
                max="365"
                required
              />
              <small>
                Estimated timeline: {job.deliveryTime} days
              </small>
            </div>

            {/* Payment Details Section */}
            <div className="payment-section-divider">
              <h3>💳 Payment Details (Admin Only)</h3>
              <p className="section-note">These details will only be visible to admins and are required for payment processing.</p>
            </div>

            {/* UPI ID */}
            <div className="form-group">
              <label htmlFor="upiId">UPI ID *</label>
              <input
                type="text"
                id="upiId"
                name="upiId"
                placeholder="e.g., yourname@upi"
                value={formData.upiId}
                onChange={handleChange}
                required
              />
              <small>Your UPI ID for receiving payments</small>
            </div>

            {/* Payment Details */}
            <div className="form-group">
              <label htmlFor="paymentDetails">Bank/Payment Details *</label>
              <textarea
                id="paymentDetails"
                name="paymentDetails"
                placeholder="Account number, IFSC code, bank name, etc."
                value={formData.paymentDetails}
                onChange={handleChange}
                rows="4"
                required
              />
              <small>Provide your complete bank account details for receiving payments</small>
            </div>

            {/* Work Receiving Email */}
            <div className="form-group">
              <label htmlFor="workReceivingEmail">Work Receiving Email *</label>
              <input
                type="email"
                id="workReceivingEmail"
                name="workReceivingEmail"
                placeholder="e.g., yourwork@gmail.com"
                value={formData.workReceivingEmail}
                onChange={handleChange}
                required
              />
              <small>Email address where you'll receive project files and communications</small>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="submit-btn"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>

          {/* Tips */}
          <div className="tips-section">
            <h4>💡 Tips for Success</h4>
            <ul>
              <li>Write a compelling cover letter that addresses the job requirements</li>
              <li>Be realistic with your budget and timeline</li>
              <li>Highlight relevant experience and past projects</li>
              <li>Respond quickly to increase your chances</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApplyJobPage;
