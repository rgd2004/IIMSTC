// client/src/pages/marketplace/MyJobsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { marketplaceAPI } from "../../utils/api";
import "./MyJobsPage.css";
import toast from "react-hot-toast";

const MyJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadJobs();
  }, [filter, page]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
      };
      if (filter !== "all") {
        params.status = filter;
      }
      const res = await marketplaceAPI.getMyJobs(params);
      console.log('My Jobs loaded:', res.data);

      setJobs(res.data?.data || []);
      setTotalPages(res.data?.pagination?.pages || 1);
    } catch (err) {
      console.error("Error loading my jobs:", err);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      await marketplaceAPI.deleteJob(jobId);
      toast.success("Job deleted successfully");
      loadJobs();
    } catch (err) {
      console.error("Error deleting job:", err);
      toast.error("Failed to delete job");
    }
  };

  const handleDeleteAllJobs = async () => {
    if (jobs.length === 0) {
      toast.error("No jobs to delete");
      return;
    }

    const message = `Are you sure you want to delete all ${filter === "all" ? jobs.length : filter} jobs? This action cannot be undone.`;
    if (!window.confirm(message)) return;

    try {
      setLoading(true);
      let successCount = 0;
      let errorCount = 0;

      // Delete each job
      for (const job of jobs) {
        try {
          await marketplaceAPI.deleteJob(job._id);
          successCount++;
        } catch (error) {
          console.error(`Error deleting job ${job._id}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`✅ Successfully deleted ${successCount} job${successCount !== 1 ? 's' : ''}`);
      }
      if (errorCount > 0) {
        toast.error(`⚠️ Failed to delete ${errorCount} job${errorCount !== 1 ? 's' : ''}`);
      }

      loadJobs();
    } catch (err) {
      console.error("Error deleting all jobs:", err);
      toast.error("Failed to delete jobs");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "#4CAF50",
      "in-progress": "#2196F3",
      completed: "#9C27B0",
      cancelled: "#F44336",
    };
    return colors[status] || "#666";
  };

  const getStatusLabel = (status) => {
    const labels = {
      open: "🟢 Open",
      "in-progress": "🔵 In Progress",
      completed: "✅ Completed",
      cancelled: "❌ Cancelled",
    };
    return labels[status] || status;
  };

  return (
    <div className="my-jobs-container">
      {/* Header */}
      <div className="my-jobs-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1>📋 My Posted Jobs</h1>
            <p>Manage your job postings and track applications</p>
          </div>
          {jobs.length > 0 && (
            <button 
              className="delete-all-btn"
              onClick={handleDeleteAllJobs}
              disabled={loading}
              title="Delete all posted jobs"
            >
              🗑️ Delete All Jobs
            </button>
          )}
        </div>
      </div>

      <div className="my-jobs-content">
        {/* Filter Tabs */}
        <div className="filter-tabs">
          {["all", "open", "in-progress", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? "active" : ""}`}
              onClick={() => {
                setFilter(status);
                setPage(1);
              }}
            >
              {status === "all"
                ? "All Jobs"
                : status === "in-progress"
                ? "In Progress"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Jobs List */}
        <main className="jobs-main">
          {loading ? (
            <div className="loading">
              <div className="loader-spinner"></div>
              <p>Loading your jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No jobs posted yet</h3>
              <p>
                {filter === "all"
                  ? "Create your first job to get started"
                  : `No ${filter} jobs found`}
              </p>
              {filter === "all" && (
                <button
                  className="create-btn"
                  onClick={() => navigate("/marketplace/post-job")}
                >
                  Post a Job →
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="jobs-list">
                {jobs.map((job) => (
                  <div key={job._id} className="job-item">
                    <div className="job-item-header">
                      <div className="job-title-section">
                        <h3>{job.title}</h3>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(job.status) }}
                        >
                          {getStatusLabel(job.status)}
                        </span>
                      </div>
                      <div className="job-date">
                        {new Date(job.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <p className="job-description">{job.description}</p>

                    <div className="job-meta">
                      <div className="meta-item">
                        <span className="meta-label">Category:</span>
                        <span className="meta-value">{job.category}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Budget:</span>
                        <span className="meta-value">
                          ₹{job.budget?.toLocaleString()}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Duration:</span>
                        <span className="meta-value">{job.duration}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Applications:</span>
                        <span className="meta-value">
                          {job.applicationsCount || 0}
                        </span>
                      </div>
                    </div>

                    <div className="job-skills">
                      {job.skills?.map((skill) => (
                        <span key={skill} className="skill-badge">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="job-actions">
                      <button
                        className="view-btn"
                        onClick={() => navigate(`/marketplace/jobs/${job._id}`)}
                      >
                        View Details
                      </button>
                      {job.status === "open" && (
                        <button
                          className="edit-btn"
                          onClick={() =>
                            navigate(`/marketplace/jobs/${job._id}/edit`)
                          }
                        >
                          Edit
                        </button>
                      )}
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteJob(job._id)}
                        title={job.status === "open" ? "Delete this job" : "Delete this job (will fail if active contracts exist)"}
                      >
                        🗑️ Delete
                      </button>
                      {job.applicationsCount > 0 && (
                        <button
                          className="applications-btn"
                          onClick={() =>
                            navigate(`/marketplace/jobs/${job._id}/applications`)
                          }
                        >
                          View {job.applicationsCount} Application
                          {job.applicationsCount !== 1 ? "s" : ""}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="pagination-btn"
                  >
                    ← Previous
                  </button>
                  <div className="pagination-info">
                    Page {page} of {totalPages}
                  </div>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="pagination-btn"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyJobsPage;
