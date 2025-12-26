import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './JobApplicationStatusPage.css';

const JobApplicationStatusPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplicationStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/job-assistant/status/${applicationId}`
        );
        const result = await response.json();

        if (result.success) {
          setApplication(result.application);
          setError(null);
        } else {
          setError(result.message || 'Unable to fetch application status');
        }
      } catch (err) {
        console.error('Error fetching status:', err);
        setError('Error fetching application status. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchApplicationStatus();
    }
  }, [applicationId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'shortlisted':
        return '#10b981';
      case 'contacted':
        return '#3b82f6';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'shortlisted':
        return '⭐';
      case 'contacted':
        return '📞';
      case 'rejected':
        return '❌';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <div className="job-status-container">
        <div className="job-status-wrapper">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your application status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-status-container">
        <div className="job-status-wrapper">
          <div className="error-box">
            <h2>❌ Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/job-assistant')} className="btn-primary">
              Back to Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="job-status-container">
      <div className="job-status-wrapper">
        {/* Success Header */}
        <div className="status-header">
          <div className="success-icon">✅</div>
          <h1>Application Submitted Successfully!</h1>
          <p>Your job assistance application has been received</p>
        </div>

        {/* Application Status */}
        {application && (
          <>
            {/* Current Status */}
            <div className="status-card">
              <div className="status-content">
                <div className="status-badge" style={{ borderColor: getStatusColor(application.status) }}>
                  <span className="status-icon">{getStatusIcon(application.status)}</span>
                  <span className="status-text" style={{ color: getStatusColor(application.status) }}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
                <h2>Current Status</h2>
                <p style={{ color: getStatusColor(application.status) }}>
                  {application.status === 'pending' &&
                    'Your application is under review. We will contact you soon!'}
                  {application.status === 'shortlisted' &&
                    'Great! Your profile has been shortlisted. WorkViaTech may contact you soon.'}
                  {application.status === 'contacted' &&
                    'You have been contacted! Check your email and phone for updates.'}
                  {application.status === 'rejected' &&
                    'Unfortunately, your application was not selected at this time.'}
                </p>
              </div>
            </div>

            {/* Application Details */}
            <div className="details-card">
              <h2>📋 Your Application Details</h2>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Full Name</label>
                  <p>{application.fullName}</p>
                </div>

                <div className="detail-item">
                  <label>Email</label>
                  <p>{application.email}</p>
                </div>

                <div className="detail-item">
                  <label>Phone</label>
                  <p>{application.phone}</p>
                </div>

                <div className="detail-item">
                  <label>Interested Roles</label>
                  <p>{application.interestedRoles}</p>
                </div>

                {application.experience && (
                  <div className="detail-item">
                    <label>Experience Level</label>
                    <p>{application.experience}</p>
                  </div>
                )}

                {application.currentRole && (
                  <div className="detail-item">
                    <label>Current Role</label>
                    <p>{application.currentRole}</p>
                  </div>
                )}

                <div className="detail-item full-width">
                  <label>Skills</label>
                  <p>{application.skills}</p>
                </div>

                {application.linkedinProfile && (
                  <div className="detail-item">
                    <label>LinkedIn Profile</label>
                    <p>
                      <a href={application.linkedinProfile} target="_blank" rel="noreferrer">
                        View Profile
                      </a>
                    </p>
                  </div>
                )}

                {application.portfolio && (
                  <div className="detail-item">
                    <label>Portfolio/GitHub</label>
                    <p>
                      <a href={application.portfolio} target="_blank" rel="noreferrer">
                        View Portfolio
                      </a>
                    </p>
                  </div>
                )}

                {application.bio && (
                  <div className="detail-item full-width">
                    <label>About You</label>
                    <p>{application.bio}</p>
                  </div>
                )}

                <div className="detail-item">
                  <label>Submitted Date</label>
                  <p>{new Date(application.submittedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="timeline-card">
              <h2>📊 Application Timeline</h2>
              <div className="timeline">
                <div className={`timeline-item ${['pending', 'shortlisted', 'contacted', 'rejected'].includes(application.status) ? 'completed' : ''}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h3>Application Submitted</h3>
                    <p>{new Date(application.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className={`timeline-item ${['shortlisted', 'contacted', 'rejected'].includes(application.status) ? 'completed' : ''}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h3>Under Review</h3>
                    <p>Our team is reviewing your profile</p>
                  </div>
                </div>

                <div className={`timeline-item ${['shortlisted', 'contacted'].includes(application.status) ? 'completed' : ''}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h3>Shortlisted</h3>
                    <p>Your profile matches our criteria</p>
                  </div>
                </div>

                <div className={`timeline-item ${application.status === 'contacted' ? 'completed' : ''}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h3>Contact & Updates</h3>
                    <p>WorkViaTech reaches out with opportunities</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Info Box */}
            <div className="info-box">
              <h3>⚠️ Important Information</h3>
              <ul>
                <li>We have sent a confirmation email to <strong>{application.email}</strong></li>
                <li>Your resume has been attached to the confirmation email</li>
                <li><strong>WorkViaTech members</strong> may contact you if shortlisted</li>
                <li><strong>PKC CAG is NOT responsible</strong> for any financial activities</li>
                <li><strong>Verify identity of WorkViaTech</strong> before making any payments</li>
                <li>For concerns, contact <strong>pkccag@gmail.com</strong></li>
              </ul>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={() => navigate('/job-assistant')} className="btn-secondary">
            Submit Another Application
          </button>
          <button onClick={() => navigate('/job-assistant-hub')} className="btn-primary">
            Back to Hub
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationStatusPage;