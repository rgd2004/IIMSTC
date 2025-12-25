import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, marketplaceAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminJobs.css';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setcategoryFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllJobs();
      console.log('Jobs loaded:', response.data);
      const jobsData = response.data?.data || response.data || [];
      setJobs(jobsData);
      setFilteredJobs(jobsData);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      toast.error(err.response?.data?.message || 'Failed to load jobs');
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = Array.isArray(jobs) ? jobs : [];

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(job => job.category === categoryFilter);
    }

    // Filter by search term (title, description, client name)
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [searchTerm, categoryFilter, jobs]);

  const handleDeleteJob = async (jobId, jobTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this job?\n\nTitle: ${jobTitle}\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(jobId);
    try {
      await adminAPI.deleteJobAdmin(jobId);
      toast.success('Job deleted successfully');
      setJobs(jobs.filter(j => j._id !== jobId));
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete job');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="admin-jobs-container"><p>Loading jobs...</p></div>;
  }

  return (
    <div className="admin-jobs-container">
      <div className="jobs-header">
        <h1>💼 Job Management</h1>
        <p>View and manage all posted jobs</p>
      </div>

      <div className="jobs-controls">
        <input
          type="text"
          placeholder="Search by job title, description, or client name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setcategoryFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          <option value="design">Design</option>
          <option value="development">Development</option>
          <option value="writing">Writing</option>
          <option value="marketing">Marketing</option>
          <option value="business">Business</option>
        </select>
      </div>

      <div className="jobs-stats">
        <div className="stat-card">
          <span className="stat-label">Total Jobs:</span>
          <span className="stat-value">{jobs.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Listings:</span>
          <span className="stat-value">{filteredJobs.length}</span>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="no-jobs">
          <p>No jobs found</p>
        </div>
      ) : (
        <div className="jobs-list">
          {filteredJobs.map((job) => (
            <div key={job._id} className="job-card">
              <div className="job-header">
                <div className="job-title-section">
                  <h3>{job.title}</h3>
                  <span className="category-badge">{job.category}</span>
                </div>
                <span className={`status-badge status-${job.status || 'active'}`}>
                  {job.status === 'closed' ? '❌ CLOSED' : '✅ ACTIVE'}
                </span>
              </div>

              <div className="job-details">
                <div className="detail-row">
                  <span className="label">💰 Budget:</span>
                  <span className="value">₹{job.budget}</span>
                </div>
                <div className="detail-row">
                  <span className="label">👤 Posted By:</span>
                  <span className="value">{job.clientId?.name || 'Unknown'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">📅 Posted On:</span>
                  <span className="value">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">📝 Proposals:</span>
                  <span className="value">{job.proposals?.length || 0}</span>
                </div>
              </div>

              <div className="job-description">
                <p>{job.description?.substring(0, 150)}...</p>
              </div>

              <div className="job-actions">
                <Link
                  to={`/service/${job._id}`}
                  className="view-btn"
                >
                  View Job
                </Link>
                <button
                  onClick={() => handleDeleteJob(job._id, job.title)}
                  disabled={deleting === job._id}
                  className="delete-btn"
                  title="Delete this job"
                >
                  {deleting === job._id ? '🔄 Deleting...' : '🗑️ Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminJobs;
