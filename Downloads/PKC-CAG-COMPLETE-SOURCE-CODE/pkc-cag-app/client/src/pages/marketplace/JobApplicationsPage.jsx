// client/src/pages/marketplace/JobApplicationsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { marketplaceAPI, messagingAPI } from "../../utils/api";
import "./JobApplicationsPage.css";
import toast from "react-hot-toast";

const JobApplicationsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load job details
      const jobRes = await marketplaceAPI.getJobById(jobId);
      setJob(jobRes.data);
      console.log("Job loaded:", jobRes.data);

      // Load applications
      const appsRes = await marketplaceAPI.getJobApplications(jobId);
      console.log("Applications loaded:", appsRes.data);
      setApplications(appsRes.data?.data || []);
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error("Failed to load job or applications");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFreelancer = async (applicationId) => {
    try {
      console.log('🔄 Selecting freelancer with:', { jobId, applicationId });
      const response = await marketplaceAPI.selectFreelancer({
        jobId,
        applicationId,
      });
      console.log('✅ Freelancer selected, response:', response.data);
      
      toast.success("Freelancer selected successfully! Redirecting to contract...");
      
      // Wait 1 second then navigate to contracts page
      setTimeout(() => {
        navigate("/marketplace/contracts", { replace: true });
      }, 1000);
    } catch (err) {
      console.error("❌ Error selecting freelancer:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      toast.error(err.response?.data?.message || "Failed to select freelancer: " + err.message);
    }
  };

  const handleSendMessage = async (freelancerId) => {
    try {
      console.log("[sendMessage] Creating conversation with freelancer:", freelancerId);
      
      // Create conversation with required subject field
      const convRes = await messagingAPI.createConversation({
        participantId: freelancerId,
        subject: `Job: ${job?.title || "Project Discussion"}`,
        category: "job-discussion",
      });
      
      console.log("[sendMessage] Conversation created:", convRes.data);
      const conversationId = convRes.data.data._id;
      
      // Navigate to messaging page
      navigate(`/messaging/${conversationId}`);
      toast.success("Opening conversation...");
    } catch (err) {
      console.error("Error creating conversation:", err);
      console.error("Error details:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to start messaging");
    }
  };

  if (loading) {
    return (
      <div className="applications-page">
        <div className="loading">
          <div className="loader-spinner"></div>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="applications-wrapper">
        {/* Job Summary */}
        {job && (
          <div className="job-summary">
            <h1>{job.title}</h1>
            <div className="job-meta">
              <span>📂 {job.category}</span>
              <span>💰 ₹{job.budget?.toLocaleString()}</span>
              <span>📊 {applications.length} Applications</span>
            </div>
          </div>
        )}

        {/* Applications List */}
        <div className="applications-container">
          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No applications yet</h3>
              <p>Applications will appear here when freelancers apply for your job</p>
            </div>
          ) : (
            <div className="applications-list">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className={`application-card ${
                    selectedApp?._id === app._id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedApp(app)}
                >
                  {/* Freelancer Info */}
                  {app.freelancerId && (
                    <div className="freelancer-header">
                      <div className="freelancer-avatar">
                        {app.freelancerId.avatar ? (
                          <img src={app.freelancerId.avatar} alt={app.freelancerId.firstName} />
                        ) : (
                          <div className="avatar-placeholder">
                            {app.freelancerId.firstName?.charAt(0) ||
                              app.freelancerId.email?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="freelancer-info">
                        <h3>
                          {app.freelancerId.firstName} {app.freelancerId.lastName}
                        </h3>
                        <p className="freelancer-email">{app.freelancerId.email}</p>
                      </div>
                    </div>
                  )}

                  {/* Application Details */}
                  <div className="application-details">
                    <div className="detail-row">
                      <span className="label">Proposed Budget:</span>
                      <span className="value">₹{app.proposedBudget?.toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Delivery Timeline:</span>
                      <span className="value">{app.deliveryDays} days</span>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="cover-letter">
                    <h4>Cover Letter</h4>
                    <p>{app.coverLetter}</p>
                  </div>

                  {/* Application Date */}
                  <div className="app-date">
                    Applied on{" "}
                    {new Date(app.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  {/* Actions */}
                  <div className="app-actions">
                    <button
                      className="profile-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/marketplace/profile/${app.freelancerId._id}`);
                      }}
                      title="View freelancer profile"
                    >
                      👤 View Profile
                    </button>
                    <button
                      className="select-btn"
                      onClick={() => handleSelectFreelancer(app._id)}
                    >
                      Select Freelancer
                    </button>
                    <button 
                      className="message-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendMessage(app.freelancerId._id);
                      }}
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobApplicationsPage;
