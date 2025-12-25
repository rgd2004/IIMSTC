import React, { useEffect, useState } from "react";
import { adminAPI } from "../../utils/api";
import toast from "react-hot-toast";
import "./AdminActivityMonitor.css";

const AdminActivityMonitor = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, freelancer, client, contract, payment, dispute
  const [searchEmail, setSearchEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async (email = "", type = "all", start = "", end = "") => {
    try {
      setLoading(true);
      console.log('🔄 [ActivityMonitor] Loading activities with:', { email, type, start, end });
      
      // Filter locally based on email and type since backend endpoint doesn't support user activity filtering
      const res = await adminAPI.getActivities({
        page: 1,
        limit: 500,
      });
      
      console.log('✅ [ActivityMonitor] Loaded from backend:', res.data);
      
      let activities = res.data?.data || res.data || [];
      
      // Frontend filtering based on search parameters
      if (email || type !== "all") {
        activities = activities.filter(activity => {
          let matches = true;
          
          // Filter by email if provided
          if (email && activity.adminId?.email) {
            matches = matches && activity.adminId.email.toLowerCase().includes(email.toLowerCase());
          }
          
          // Filter by type/action if provided
          if (type !== "all") {
            matches = matches && activity.action?.includes(type);
          }
          
          return matches;
        });
      }
      
      console.log('📍 [ActivityMonitor] After filtering:', activities.length, 'activities');
      setActivities(activities);
    } catch (err) {
      console.error('❌ [ActivityMonitor] Error loading activities:', err);
      console.error('❌ [ActivityMonitor] Error details:', err.response?.data);
      toast.error("Failed to load activities: " + (err.response?.data?.message || err.message));
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    console.log('🔍 [ActivityMonitor] Search clicked with:', { searchEmail, filter, startDate, endDate });
    loadActivities(searchEmail, filter, startDate, endDate);
  };

  const handleReset = () => {
    setSearchEmail("");
    setFilter("all");
    setStartDate("");
    setEndDate("");
    loadActivities();
  };

  const getActivityIcon = (type) => {
    const icons = {
      login: "🔓",
      profile_update: "✏️",
      job_apply: "📋",
      contract_created: "📝",
      payment_processed: "💰",
      dispute_filed: "⚠️",
      message_sent: "💬",
      review_posted: "⭐",
      withdrawal_requested: "🏦",
      profile_created: "👤",
      verification: "✅",
      logout: "🔐",
      default: "📌",
    };
    return icons[type] || icons.default;
  };

  const getActivityLabel = (type) => {
    const labels = {
      login: "User Login",
      logout: "User Logout",
      profile_update: "Profile Updated",
      job_apply: "Applied for Job",
      contract_created: "Contract Created",
      payment_processed: "Payment Processed",
      dispute_filed: "Dispute Filed",
      message_sent: "Message Sent",
      review_posted: "Review Posted",
      withdrawal_requested: "Withdrawal Requested",
      profile_created: "Profile Created",
      verification: "Account Verified",
    };
    return labels[type] || type;
  };

  const getActivityColor = (type) => {
    const colors = {
      login: "#4facfe",
      logout: "#a0aec0",
      profile_update: "#667eea",
      job_apply: "#f093fb",
      contract_created: "#10b981",
      payment_processed: "#f5576c",
      dispute_filed: "#fbbf24",
      message_sent: "#06b6d4",
      review_posted: "#ec4899",
      withdrawal_requested: "#8b5cf6",
      profile_created: "#f59e0b",
      verification: "#10b981",
    };
    return colors[type] || "#9ca3af";
  };

  const filteredActivities = activities.filter((activity) => {
    if (filter !== "all") {
      return activity.type.startsWith(filter);
    }
    return true;
  });

  if (loading && activities.length === 0) {
    return <div className="monitor loading">Loading activities...</div>;
  }

  return (
    <div className="admin-activity-monitor">
      {/* Header */}
      <div className="monitor-header">
        <h1>👁️ Activity Monitor</h1>
        <p>Track all user activities and freelancer actions</p>
      </div>

      {/* Search & Filter */}
      <div className="search-section">
        <div className="search-form">
          <div className="form-group">
            <label>Search by Email</label>
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="freelancer@email.com"
            />
          </div>

          <div className="form-group">
            <label>Activity Type</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Activities</option>
              <option value="freelancer">Freelancer Activities</option>
              <option value="client">Client Activities</option>
              <option value="contract">Contract Events</option>
              <option value="payment">Payment Events</option>
              <option value="dispute">Disputes</option>
            </select>
          </div>

          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button className="btn-search" onClick={handleSearch}>
              🔍 Search
            </button>
            <button className="btn-reset" onClick={handleReset}>
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="activity-stats">
        <div className="stat-card">
          <div className="stat-label">Total Activities</div>
          <div className="stat-value">{filteredActivities.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today</div>
          <div className="stat-value">
            {
              filteredActivities.filter((a) => {
                const date = new Date(a.createdAt);
                const today = new Date();
                return date.toDateString() === today.toDateString();
              }).length
            }
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">This Week</div>
          <div className="stat-value">
            {
              filteredActivities.filter((a) => {
                const date = new Date(a.createdAt);
                const now = new Date();
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return date >= weekAgo;
              }).length
            }
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unique Users</div>
          <div className="stat-value">
            {new Set(filteredActivities.map((a) => a.email || a.adminId?.email)).size}
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="activity-list">
        {filteredActivities.length === 0 ? (
          <div className="empty-state">
            <p>📭 No activities found</p>
            <small>Try adjusting your search filters</small>
          </div>
        ) : (
          <div className="activities-timeline">
            {filteredActivities.map((activity) => {
              // Handle both old format (type, name, email) and new format (action, adminId)
              const activityType = activity.type || activity.action || 'default';
              const userEmail = activity.email || activity.adminId?.email || 'Unknown';
              const userName = activity.name || activity.adminId?.name || 'Unknown User';
              
              return (
                <div
                  key={activity._id}
                  className="activity-item"
                  style={{
                    borderLeftColor: getActivityColor(activityType),
                  }}
                >
                  <div className="activity-icon" style={{ color: getActivityColor(activityType) }}>
                    {getActivityIcon(activityType)}
                  </div>

                  <div className="activity-content">
                    <div className="activity-header">
                      <span className="activity-title">
                        {getActivityLabel(activityType)}
                      </span>
                      <span className="activity-time">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="activity-user">
                      <strong>{userName}</strong>
                      <span className="user-email">{userEmail}</span>
                    </div>
                    {(activity.description || activity.resourceType) && (
                      <div className="activity-description">
                        {activity.description || `Resource Type: ${activity.resourceType}`}
                      </div>
                    )}

                    {activity.details && (
                      <div className="activity-details">
                        {Object.entries(activity.details).map(([key, value]) => (
                          <div key={key} className="detail-item">
                            <span className="detail-key">{key}:</span>
                            <span className="detail-value">{String(value).substring(0, 50)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="activity-badge">
                    <span className="badge-type">{activityType.replace(/_/g, " ")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivityMonitor;
