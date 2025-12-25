// client/src/pages/marketplace/BrowseTalentPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { marketplaceAPI } from "../../utils/api";
import "./BrowseTalentPage.css";
import toast from "react-hot-toast";

const BrowseTalentPage = () => {
  const navigate = useNavigate();
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    skills: "",
    minRating: 0,
    verified: false,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadFreelancers();
  }, [filters, page]);

  const loadFreelancers = async () => {
    try {
      setLoading(true);
      console.log("Loading freelancers with filters:", { page, limit: 12, ...filters });
      const res = await marketplaceAPI.browseTalent({
        page,
        limit: 12,
        ...filters,
      });

      console.log("Browse talent response:", res);
      setFreelancers(res.data?.data || []);
      setTotalPages(res.data?.pagination?.pages || 1);
    } catch (err) {
      console.error("Error loading freelancers:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to load freelancers";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setPage(1);
  };

  const handleContact = (freelancerId) => {
    toast.success("Contact feature coming soon!");
  };

  const handleViewProfile = (freelancerId) => {
    if (!freelancerId) {
      toast.error("Unable to load profile. Please try again.");
      return;
    }
    navigate(`/marketplace/profile/${freelancerId}`);
  };

  return (
    <div className="browse-talent-container">
      {/* Header */}
      <div className="talent-header">
        <h1>👥 Browse Talented Freelancers</h1>
        <p>Find the perfect freelancer for your project</p>
      </div>

      <div className="talent-content">
        {/* Sidebar Filters */}
        <aside className="talent-filters">
          <h3>🔎 Filters</h3>

          {/* Skills */}
          <div className="filter-group">
            <label>Skills</label>
            <input
              type="text"
              name="skills"
              placeholder="e.g., React, Python"
              value={filters.skills}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>

          {/* Minimum Rating */}
          <div className="filter-group">
            <label>Minimum Rating</label>
            <select
              name="minRating"
              value={filters.minRating}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="0">All Ratings</option>
              <option value="3">3.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="4">4.0+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          {/* Verified Only */}
          <div className="filter-group checkbox">
            <label>
              <input
                type="checkbox"
                name="verified"
                checked={filters.verified}
                onChange={handleFilterChange}
              />
              Verified Only
            </label>
          </div>

          <button
            className="reset-filters-btn"
            onClick={() =>
              setFilters({ skills: "", minRating: 0, verified: false })
            }
          >
            Reset Filters
          </button>
        </aside>

        {/* Main Content */}
        <main className="talent-list-section">
          {loading ? (
            <div className="loading-state">
              <div className="loader-spinner"></div>
              <p>Loading freelancers...</p>
            </div>
          ) : freelancers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <h3>No freelancers found</h3>
              <p>Try adjusting your filters or check back later</p>
            </div>
          ) : (
            <>
              <div className="talent-grid">
                {freelancers.map((freelancer) => (
                  <div key={freelancer._id} className="talent-card">
                    <div className="talent-header-card">
                      <div className="talent-avatar">
                        <img
                          src={`https://ui-avatars.com/api/?name=${freelancer.userId?.firstName || "User"}&background=667eea&color=fff`}
                          alt={freelancer.userId?.firstName}
                        />
                        {freelancer.isVerified && (
                          <span className="verified-badge">✓</span>
                        )}
                      </div>
                      <div className="talent-info">
                        <h3>{freelancer.userId?.firstName || "Freelancer"}</h3>
                        <p className="talent-title">{freelancer.experience}</p>
                      </div>
                    </div>

                    <div className="talent-bio">
                      <p>
                        {freelancer.bio ||
                          "No bio available"}
                      </p>
                    </div>

                    <div className="talent-skills">
                      {freelancer.skills?.slice(0, 4).map((skill) => (
                        <span key={skill} className="skill-badge">
                          {skill}
                        </span>
                      ))}
                      {freelancer.skills?.length > 4 && (
                        <span className="skill-badge more">
                          +{freelancer.skills.length - 4}
                        </span>
                      )}
                    </div>

                    <div className="talent-stats">
                      <div className="stat">
                        <span className="stat-label">⭐ Rating</span>
                        <span className="stat-value">
                          {freelancer.averageRating?.toFixed(1) || "N/A"}/5
                        </span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">📋 Jobs</span>
                        <span className="stat-value">
                          {freelancer.completedJobs || 0}
                        </span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">💰 Rate</span>
                        <span className="stat-value">
                          ₹{freelancer.hourlyRate}/hr
                        </span>
                      </div>
                    </div>

                    <div className="talent-footer">
                      <span className="success-rate">
                        {freelancer.successRate || 0}% Success Rate
                      </span>
                    </div>

                    <div className="talent-actions">
                      <button
                        className="view-profile-btn"
                        onClick={() => handleViewProfile(freelancer.userId?._id)}
                        disabled={!freelancer.userId?._id}
                        title={!freelancer.userId?._id ? "Profile data incomplete" : "View Profile"}
                      >
                        View Profile
                      </button>
                      <button
                        className="contact-btn"
                        onClick={() => handleContact(freelancer._id)}
                      >
                        Message
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

export default BrowseTalentPage;
