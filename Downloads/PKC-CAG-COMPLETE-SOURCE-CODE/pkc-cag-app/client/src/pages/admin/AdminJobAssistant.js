import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './AdminJobAssistant.css';

const AdminJobAssistant = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    rejected: 0,
    contacted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [filterStatus]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/job-assistant/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        const filtered =
          filterStatus === 'all'
            ? result.applications
            : result.applications.filter((app) => app.status === filterStatus);
        setApplications(filtered);
      } else {
        toast.error(result.message || 'Error fetching applications');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Error fetching applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/job-assistant/admin/stats`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  const handleStatusChange = async (id, newStatus, newNotes = '') => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/job-assistant/admin/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ status: newStatus, notes: newNotes }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success('Status updated successfully');
        fetchApplications();
        fetchStats();
        setShowModal(false);
      } else {
        toast.error(result.message || 'Error updating status');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error updating status');
    }
  };

  const handleMarkContacted = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/job-assistant/admin/${id}/contacted`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success('Marked as contacted');
        fetchApplications();
        fetchStats();
      } else {
        toast.error(result.message || 'Error updating');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error marking as contacted');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/job-assistant/admin/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success('Application deleted');
        fetchApplications();
        fetchStats();
      } else {
        toast.error(result.message || 'Error deleting');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error deleting application');
    }
  };

  const handleDownloadResume = async (applicationId, resumeFileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/job-assistant/admin/${applicationId}/download-resume`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = resumeFileName || 'resume';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
      toast.success('Resume downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Error downloading resume');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'shortlisted':
        return 'status-shortlisted';
      case 'contacted':
        return 'status-contacted';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading-message">Loading applications...</div>;
  }

  return (
    <div className="admin-job-assistant">
      {/* Header */}
      <div className="admin-header">
        <h1>💼 Job Assistant Applications</h1>
        <p>Manage and review job assistance applications</p>
      </div>

      {/* Statistics */}
      <div className="statistics-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card shortlisted">
          <div className="stat-number">{stats.shortlisted}</div>
          <div className="stat-label">Shortlisted</div>
        </div>
        <div className="stat-card contacted">
          <div className="stat-number">{stats.contacted}</div>
          <div className="stat-label">Contacted</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-number">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['all', 'pending', 'shortlisted', 'contacted', 'rejected'].map(
          (status) => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Applications Table */}
      <div className="applications-container">
        {applications.length === 0 ? (
          <div className="no-applications">No applications found</div>
        ) : (
          <div className="applications-table-wrapper">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Position</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td className="name">{app.fullName}</td>
                    <td>{app.email}</td>
                    <td>{app.position}</td>
                    <td>{app.experience}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(app.status)}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td className="date">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="actions">
                      <button
                        className="action-btn view"
                        onClick={() => {
                          setSelectedApplication(app);
                          setShowModal(true);
                        }}
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button
                        className="action-btn download"
                        onClick={() => handleDownloadResume(app._id, app.resumeFileName)}
                        title="Download Resume"
                      >
                        📥
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(app._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Application Details */}
      {showModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <div className="modal-header">
              <h2>{selectedApplication.fullName}</h2>
              <span
                className={`status-badge ${getStatusColor(
                  selectedApplication.status
                )}`}
              >
                {selectedApplication.status.charAt(0).toUpperCase() +
                  selectedApplication.status.slice(1)}
              </span>
            </div>

            <div className="modal-body">
              {/* Contact Info */}
              <div className="modal-section">
                <h3>Contact Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Email:</label>
                    <a href={`mailto:${selectedApplication.email}`}>
                      {selectedApplication.email}
                    </a>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <a href={`tel:${selectedApplication.phone}`}>
                      {selectedApplication.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="modal-section">
                <h3>Job Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Position:</label>
                    <span>{selectedApplication.position}</span>
                  </div>
                  <div className="info-item">
                    <label>Experience:</label>
                    <span>{selectedApplication.experience}</span>
                  </div>
                  <div className="info-item">
                    <label>Current Company:</label>
                    <span>{selectedApplication.currentCompany}</span>
                  </div>
                  <div className="info-item">
                    <label>Current Role:</label>
                    <span>{selectedApplication.currentRole}</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="modal-section">
                <h3>Skills</h3>
                <p>{selectedApplication.skills}</p>
              </div>

              {/* Bio */}
              {selectedApplication.bio && (
                <div className="modal-section">
                  <h3>About Applicant</h3>
                  <p>{selectedApplication.bio}</p>
                </div>
              )}

              {/* Links */}
              <div className="modal-section">
                <h3>Online Profiles</h3>
                <div className="info-grid">
                  {selectedApplication.linkedinProfile && (
                    <div className="info-item">
                      <label>LinkedIn:</label>
                      <a
                        href={selectedApplication.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit Profile
                      </a>
                    </div>
                  )}
                  {selectedApplication.portfolio && (
                    <div className="info-item">
                      <label>Portfolio:</label>
                      <a
                        href={selectedApplication.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit Portfolio
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Resume */}
              <div className="modal-section">
                <h3>Resume</h3>
                <button
                  onClick={() => handleDownloadResume(selectedApplication._id, selectedApplication.resumeFileName)}
                  className="download-link"
                >
                  📥 Download CV ({selectedApplication.resumeFileName})
                </button>
              </div>

              {/* Notes */}
              {selectedApplication.notes && (
                <div className="modal-section">
                  <h3>Notes</h3>
                  <p>{selectedApplication.notes}</p>
                </div>
              )}

              {/* Action Section */}
              <div className="modal-section">
                <h3>Update Status</h3>
                <div className="status-update-form">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="status-select"
                  >
                    <option value="">-- Select Status --</option>
                    <option value="pending">Pending</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="contacted">Contacted</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <textarea
                    placeholder="Add notes (optional)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="notes-input"
                    rows="3"
                  />

                  <div className="button-group">
                    <button
                      className="btn-update"
                      onClick={() =>
                        handleStatusChange(
                          selectedApplication._id,
                          selectedStatus,
                          notes
                        )
                      }
                      disabled={!selectedStatus}
                    >
                      Update Status
                    </button>

                    {selectedApplication.status !== 'contacted' && (
                      <button
                        className="btn-contacted"
                        onClick={() =>
                          handleMarkContacted(selectedApplication._id)
                        }
                      >
                        Mark as Contacted
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobAssistant;
