import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './MyJobApplications.css';

const MyJobApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyApplications();
  }, [user?.email]);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all applications and filter by user email
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/job-assistant/my-applications`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setApplications(result.applications);
        if (result.applications.length === 0) {
          setError('No applications found. Submit a job assistance application to get started.');
        }
      } else {
        setError(result.message || 'Unable to fetch applications');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error fetching your applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="my-job-applications-container">
        <div className="my-job-applications-wrapper">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-job-applications-container">
      <div className="my-job-applications-wrapper">
        {/* Header */}
        <div className="applications-header">
          <div className="header-content">
            <h1>💼 My Job Applications</h1>
            <p>Track and manage your job assistance applications</p>
          </div>
          <button
            className="btn-new-application"
            onClick={() => navigate('/job-assistant')}
          >
            ➕ New Application
          </button>
        </div>

        {/* Main Content */}
        {error && !applications.length ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No Applications Yet</h2>
            <p>{error}</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/job-assistant')}
            >
              Submit Application
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No Applications Found</h2>
            <p>You haven't submitted any job assistance applications yet.</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/job-assistant')}
            >
              Submit Application
            </button>
          </div>
        ) : (
          <div className="applications-list">
            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-info">
                  <h3>Total Applications</h3>
                  <p className="stat-value">{applications.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>Pending</h3>
                  <p className="stat-value">
                    {applications.filter((a) => a.status === 'pending').length}
                  </p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                  <h3>Shortlisted</h3>
                  <p className="stat-value">
                    {applications.filter((a) => a.status === 'shortlisted').length}
                  </p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📞</div>
                <div className="stat-info">
                  <h3>Contacted</h3>
                  <p className="stat-value">
                    {applications.filter((a) => a.status === 'contacted').length}
                  </p>
                </div>
              </div>
            </div>

            {/* Applications Table */}
            <div className="table-container">
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Interested Roles</th>
                    <th>Skills</th>
                    <th>Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(app.status) }}
                        >
                          {getStatusIcon(app.status)} {app.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="truncate" title={app.interestedRoles}>
                        {app.interestedRoles}
                      </td>
                      <td className="truncate" title={app.skills}>
                        {app.skills}
                      </td>
                      <td>{formatDate(app.submittedAt)}</td>
                      <td>
                        <button
                          className="btn-view"
                          onClick={() =>
                            navigate(`/job-application-status/${app._id}`)
                          }
                        >
                          View Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Applications Cards (Mobile View) */}
            <div className="applications-cards">
              {applications.map((app) => (
                <div key={app._id} className="application-card">
                  <div className="card-header">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(app.status) }}
                    >
                      {getStatusIcon(app.status)} {app.status.toUpperCase()}
                    </span>
                    <span className="submitted-date">{formatDate(app.submittedAt)}</span>
                  </div>

                  <div className="card-body">
                    <div className="card-item">
                      <h4>Interested Roles</h4>
                      <p>{app.interestedRoles}</p>
                    </div>

                    <div className="card-item">
                      <h4>Skills</h4>
                      <p>{app.skills}</p>
                    </div>

                    {app.currentRole && (
                      <div className="card-item">
                        <h4>Current Role</h4>
                        <p>{app.currentRole}</p>
                      </div>
                    )}

                    {app.experience && (
                      <div className="card-item">
                        <h4>Experience</h4>
                        <p>{app.experience}</p>
                      </div>
                    )}
                  </div>

                  <div className="card-footer">
                    <button
                      className="btn-view"
                      onClick={() =>
                        navigate(`/job-application-status/${app._id}`)
                      }
                    >
                      View Full Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="info-box">
          <div className="info-content">
            <h3>ℹ️ How to Track Your Application</h3>
            <ul>
              <li>Click "View Status" to see your complete application details</li>
              <li>View real-time status updates and progress timeline</li>
              <li>Status changes are sent via email automatically</li>
              <li>Keep track of your submitted information anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyJobApplications;