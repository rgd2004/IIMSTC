// client/src/pages/marketplace/JobDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { marketplaceAPI } from "../../utils/api";
import toast from "react-hot-toast";
import "./JobDetailsPage.css";

const JobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const response = await marketplaceAPI.getJobById(jobId);
      setJob(response.data?.data || response.data);
      console.log("Job details loaded:", response.data);
    } catch (err) {
      console.error("Error loading job details:", err);
      toast.error("Failed to load job details");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    navigate(`/marketplace/apply/${jobId}`);
  };

  if (loading) {
    return (
      <div className="job-details-page">
        <div className="loading">
          <div className="loader-spinner"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-details-page">
        <div className="error-state">
          <h2>Job not found</h2>
          <button onClick={() => navigate(-1)}>← Go Back</button>
        </div>
      </div>
    );
  }

  const getBudgetLabel = () => {
    if (job.budget < 1000) return `₹${job.budget}`;
    if (job.budget < 100000) return `₹${(job.budget / 1000).toFixed(1)}K`;
    return `₹${(job.budget / 100000).toFixed(1)}L`;
  };

  const getDurationLabel = () => {
    const durations = {
      "one-time": "One-time project",
      "short-term": "Short-term (1-3 months)",
      "long-term": "Long-term (3+ months)",
    };
    return durations[job.duration] || job.duration;
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: "#90EE90",
      medium: "#FFD700",
      high: "#FF6B6B",
    };
    return colors[urgency] || "#ccc";
  };

  return (
    <div className="job-details-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="job-details-container">
        {/* Header */}
        <div className="job-header">
          <div className="job-title-section">
            <h1>{job.title}</h1>
            <div className="job-meta">
              <span className="category-badge">{job.category}</span>
              <span className="status-badge" data-status={job.status}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
              <span className="urgency-badge" style={{ borderColor: getUrgencyColor(job.urgency) }}>
                {job.urgency.charAt(0).toUpperCase() + job.urgency.slice(1)} Priority
              </span>
            </div>
          </div>

          <div className="job-budget">
            <div className="budget-amount">{getBudgetLabel()}</div>
            <div className="budget-label">Budget</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="job-content">
          {/* Left Column - Details */}
          <div className="job-details-main">
            {/* Description */}
            <section className="section">
              <h2>About this job</h2>
              <div className="description">
                {job.description?.split("\n").map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </section>

            {/* Project Details */}
            <section className="section">
              <h2>Project Details</h2>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Duration</label>
                  <p>{getDurationLabel()}</p>
                </div>
                <div className="detail-item">
                  <label>Delivery Timeline</label>
                  <p>{job.deliveryTime} days</p>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <p>{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</p>
                </div>
                <div className="detail-item">
                  <label>Applications</label>
                  <p>{job.applicationsCount || 0} applications</p>
                </div>
              </div>
            </section>

            {/* Required Skills */}
            {job.skills && job.skills.length > 0 && (
              <section className="section">
                <h2>Required Skills</h2>
                <div className="skills-list">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Attachments */}
            {job.attachments && job.attachments.length > 0 && (
              <section className="section">
                <h2>Attachments</h2>
                <div className="attachments-list">
                  {job.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="attachment-link"
                    >
                      📎 {att.filename}
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="job-sidebar">
            {/* Client Info */}
            {job.clientId && (
              <div className="sidebar-card">
                <h3>Client Info</h3>
                <div className="client-info">
                  {job.clientId.avatar && (
                    <img src={job.clientId.avatar} alt={job.clientId.firstName} className="client-avatar" />
                  )}
                  <div>
                    <p className="client-name">
                      {job.clientId.firstName} {job.clientId.lastName}
                    </p>
                    <p className="client-email">{job.clientId.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Apply Button */}
            {job.status === "open" && (
              <button className="apply-btn-large" onClick={handleApply}>
                Apply Now →
              </button>
            )}

            {job.status !== "open" && (
              <div className="job-closed-notice">
                <p>This job is {job.status}</p>
              </div>
            )}

            {/* Job Stats */}
            <div className="sidebar-card">
              <h3>Job Stats</h3>
              <div className="stats">
                <div className="stat">
                  <span className="stat-label">Views</span>
                  <span className="stat-value">{job.views || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Applications</span>
                  <span className="stat-value">{job.applicationsCount || 0}</span>
                </div>
                {job.deadline && (
                  <div className="stat">
                    <span className="stat-label">Deadline</span>
                    <span className="stat-value">
                      {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Posted Info */}
            <div className="sidebar-card">
              <h3>Posted</h3>
              <p className="posted-date">
                {new Date(job.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              {job.completedAt && (
                <p className="completed-date">
                  Completed: {new Date(job.completedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
