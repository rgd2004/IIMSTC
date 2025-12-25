// client/src/pages/marketplace/BrowseJobsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { marketplaceAPI } from "../../utils/api";
import "./BrowseJobsPage.css";
import toast from "react-hot-toast";

const BrowseJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    minBudget: 0,
    maxBudget: 100000,
    search: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadJobs();
  }, [filters, page]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await marketplaceAPI.browseJobs({
        page,
        limit: 12,
        ...filters,
      });

      setJobs(res.data?.data || []);
      setTotalPages(res.data?.pagination?.pages || 1);
    } catch (err) {
      console.error("Error loading jobs:", err);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1);
  };

  const handleApply = (jobId) => {
    navigate(`/marketplace/apply/${jobId}`);
  };

  const categories = [
    "Web Development",
    "Mobile App",
    "UI/UX Design",
    "Data Science",
    "Cloud Computing",
    "DevOps",
    "AI/ML",
    "Other",
  ];

  return (
    <div className="browse-jobs-container">
      {/* Header */}
      <div className="browse-header">
        <h1>🔍 Browse Freelance Jobs</h1>
        <p>Find the perfect project that matches your skills</p>
      </div>

      <div className="browse-content">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <h3>🔎 Filters</h3>

          {/* Search */}
          <div className="filter-group">
            <label>Search Keywords</label>
            <input
              type="text"
              name="search"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>

          {/* Category */}
          <div className="filter-group">
            <label>Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Range */}
          <div className="filter-group">
            <label>Budget Range</label>
            <div className="budget-inputs">
              <input
                type="number"
                name="minBudget"
                placeholder="Min"
                value={filters.minBudget}
                onChange={handleFilterChange}
                className="filter-input"
              />
              <span>-</span>
              <input
                type="number"
                name="maxBudget"
                placeholder="Max"
                value={filters.maxBudget}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>
          </div>

          <button
            className="reset-filters-btn"
            onClick={() =>
              setFilters({
                category: "",
                minBudget: 0,
                maxBudget: 100000,
                search: "",
              })
            }
          >
            Reset Filters
          </button>
        </aside>

        {/* Main Content */}
        <main className="jobs-list-section">
          {loading ? (
            <div className="loading-state">
              <div className="loader-spinner"></div>
              <p>Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No jobs found</h3>
              <p>Try adjusting your filters or check back later</p>
            </div>
          ) : (
            <>
              <div className="jobs-grid">
                {jobs.map((job) => (
                  <div key={job._id} className="job-card">
                    <div className="job-header">
                      <div>
                        <h3>{job.title}</h3>
                        <p className="job-category">📂 {job.category}</p>
                      </div>
                      <span className={`job-duration ${job.duration}`}>
                        {job.duration}
                      </span>
                    </div>

                    <p className="job-description">{job.description}</p>

                    <div className="job-skills">
                      {job.requiredSkills?.slice(0, 3).map((skill) => (
                        <span key={skill} className="skill-badge">
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills?.length > 3 && (
                        <span className="skill-badge more">
                          +{job.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="job-footer">
                      <div className="job-budget">
                        <span className="budget-label">Budget:</span>
                        <span className="budget-value">
                          ₹{job.budget?.toLocaleString()}
                        </span>
                      </div>
                      <div className="job-applicants">
                        📨 {job.applicants?.length || 0} applications
                      </div>
                    </div>

                    <div className="job-actions">
                      <button
                        className="apply-btn"
                        onClick={() => handleApply(job._id)}
                      >
                        Apply Now →
                      </button>
                      <button
                        className="details-btn"
                        onClick={() => navigate(`/marketplace/jobs/${job._id}`)}
                      >
                        View Details
                      </button>
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

export default BrowseJobsPage;
