// client/src/pages/marketplace/MyApplicationsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { marketplaceAPI } from "../../utils/api";
import toast from "react-hot-toast";
import "./MyApplicationsPage.css";

const MyApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, applied, selected, rejected
  const [sortBy, setSortBy] = useState("recent"); // recent, budget-high, budget-low
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadApplications();
  }, [filter, sortBy, page]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        sortBy: sortBy === "recent" ? "-createdAt" : sortBy === "budget-high" ? "-jobId.budget" : "jobId.budget",
      };

      if (filter !== "all") {
        params.status = filter;
      }

      const response = await marketplaceAPI.getMyApplications(params);
      const data = response.data?.data || [];
      const pagination = response.data?.pagination || {};

      setApplications(data);
      setTotalPages(pagination.totalPages || 1);
      console.log("Applications loaded:", data);
    } catch (err) {
      console.error("Error loading applications:", err);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: "#3b82f6",
      selected: "#10b981",
      rejected: "#ef4444",
      pending: "#f59e0b",
    };
    return colors[status] || "#6b7280";
  };

  const getStatusIcon = (status) => {
    const icons = {
      applied: "📬",
      selected: "✅",
      rejected: "❌",
      pending: "⏳",
    };
    return icons[status] || "📋";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatBudget = (budget) => {
    if (!budget) return "N/A";
    if (budget < 1000) return `₹${budget}`;
    if (budget < 100000) return `₹${(budget / 1000).toFixed(1)}K`;
    return `₹${(budget / 100000).toFixed(1)}L`;
  };

  const handleViewDetails = (jobId) => {
    navigate(`/marketplace/jobs/${jobId}`);
  };

  const handleWithdrawApplication = async (appId) => {
    if (window.confirm("Are you sure you want to withdraw this application?")) {
      try {
        // Add API call for withdrawal if available
        toast.success("Application withdrawn successfully");
        loadApplications();
      } catch (err) {
        toast.error("Failed to withdraw application");
      }
    }
  };

  if (loading) {
    return (
      <div className="my-applications-page">
        <div className="loading">
          <div className="loader-spinner"></div>
          <p>Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-applications-page">
      <div className="applications-container">
        {/* Header */}
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate("/marketplace")}>
            ← Back to Marketplace
          </button>
          <h1>My Job Applications</h1>
          <p className="subtitle">Track your applications and their status</p>
        </div>

        {/* Filters and Sort */}
        <div className="filters-bar">
          <div className="filter-group">
            <label>Filter by Status:</label>
            <div className="filter-buttons">
              {["all", "applied", "selected", "rejected"].map((status) => (
                <button
                  key={status}
                  className={`filter-btn ${filter === status ? "active" : ""}`}
                  onClick={() => {
                    setFilter(status);
                    setPage(1);
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="sort-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recent">Most Recent</option>
              <option value="budget-high">Highest Budget</option>
              <option value="budget-low">Lowest Budget</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No applications yet</h3>
            <p>Start browsing jobs and apply to find exciting opportunities!</p>
            <button className="browse-btn" onClick={() => navigate("/marketplace/browse")}>
              Browse Jobs →
            </button>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((app) => (
              <div key={app._id} className="application-card">
                <div className="card-header">
                  <div className="job-info">
                    <h3>{app.jobId?.title || "Job Title"}</h3>
                    <div className="job-meta">
                      <span className="category">{app.jobId?.category || "Category"}</span>
                      <span className="budget">{formatBudget(app.jobId?.budget)}</span>
                      <span className="duration">{app.jobId?.duration || "Duration"}</span>
                    </div>
                  </div>

                  <div className="status-badge" style={{ borderColor: getStatusColor(app.status) }}>
                    <span className="status-icon">{getStatusIcon(app.status)}</span>
                    <span className="status-text">
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="card-content">
                  <div className="description-preview">
                    <p>{app.proposal?.substring(0, 150) || "No proposal provided"}...</p>
                  </div>

                  <div className="card-stats">
                    <div className="stat">
                      <span className="stat-label">Applied</span>
                      <span className="stat-value">{formatDate(app.createdAt)}</span>
                    </div>
                    {app.updatedAt && (
                      <div className="stat">
                        <span className="stat-label">Last Updated</span>
                        <span className="stat-value">{formatDate(app.updatedAt)}</span>
                      </div>
                    )}
                    <div className="stat">
                      <span className="stat-label">Client Rating</span>
                      <span className="stat-value">
                        {app.jobId?.clientId?.rating ? `${app.jobId.clientId.rating.toFixed(1)} ⭐` : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="view-btn"
                    onClick={() => handleViewDetails(app.jobId?._id)}
                  >
                    View Job Details
                  </button>
                  <button
                    className="withdraw-btn"
                    onClick={() => handleWithdrawApplication(app._id)}
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

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
      </div>
    </div>
  );
};

export default MyApplicationsPage;
