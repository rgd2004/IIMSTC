import React, { useState, useEffect } from "react";
import { adminAPI } from "../../utils/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import "./AdminUpdates.css";

const AdminUpdates = () => {
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "info",
  });

  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUpdates();
      setUpdates(res.data.updates || []);
    } catch (err) {
      console.error("admin get updates error:", err);
      toast.error(err?.response?.data?.message || "Failed to load updates");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.message.trim()) {
      return toast.error("Title and message are required");
    }

    setSubmitting(true);
    try {
      const res = await adminAPI.createUpdate(form);
      toast.success(res.data?.message || "Update posted successfully");
      setForm({ title: "", message: "", type: "info" });
      await loadUpdates();
    } catch (err) {
      console.error("Create update error:", err);
      const msg = err?.response?.data?.message || err.message || "Failed to post update";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this update? This action cannot be undone.')) return;

    setDeletingId(id);
    try {
      console.debug('Deleting update id=', id);
      const res = await adminAPI.deleteUpdate(id);
      console.debug('Delete response:', res);
      toast.success(res.data?.message || 'Update deleted successfully');
      await loadUpdates();
    } catch (err) {
      console.error('Delete update failed:', err);
      // Provide more detailed feedback to help debugging
      const status = err?.response?.status;
      const data = err?.response?.data;
      const msg = data?.message || err.message || 'Failed to delete update';
      toast.error(`Delete failed (${status || 'error'}): ${msg}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getUpdateIcon = (type) => {
    const icons = {
      info: "info-circle",
      feature: "star",
      offer: "gift",
      maintenance: "tools",
      alert: "exclamation-triangle"
    };
    return icons[type] || "bell";
  };

  const getUpdateColor = (type) => {
    const colors = {
      info: "#3b82f6",
      feature: "#8b5cf6",
      offer: "#ec4899",
      maintenance: "#f59e0b",
      alert: "#ef4444"
    };
    return colors[type] || "#6b7280";
  };

  return (
    <div className="admin-updates-page">
      <div className="updates-container">
        
        {/* ===== HEADER ===== */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1>
                <i className="fas fa-bell"></i>
                Manage Updates
              </h1>
              <p>Create and manage platform updates & announcements</p>
            </div>
            <Link to="/admin" className="back-link">
              <i className="fas fa-arrow-left"></i>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* ===== CREATE FORM ===== */}
        <div className="create-section">
          <div className="section-title">
            <h2>
              <i className="fas fa-plus-circle"></i>
              Create New Update
            </h2>
          </div>

          <form onSubmit={submit} className="create-form">
            <div className="form-row">
              <div className="form-group">
                <label>
                  <i className="fas fa-heading"></i>
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter update title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-tag"></i>
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="info">ℹ Info</option>
                  <option value="feature">✨ Feature</option>
                  <option value="offer">🎉 Offer</option>
                  <option value="maintenance">🔧 Maintenance</option>
                  <option value="alert">⚠ Alert</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-align-left"></i>
                Message
              </label>
              <textarea
                rows="5"
                placeholder="Enter detailed message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Posting Update...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Post Update
                </>
              )}
            </button>
          </form>
        </div>

        {/* ===== UPDATES LIST ===== */}
        <div className="updates-list-section">
          <div className="section-title">
            <h2>
              <i className="fas fa-list"></i>
              Recent Updates
              <span className="count-badge">{updates.length}</span>
            </h2>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading updates...</p>
            </div>
          ) : updates.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <h3>No updates yet</h3>
              <p>Create your first update to keep users informed</p>
            </div>
          ) : (
            <div className="updates-grid">
              {updates.map((update) => (
                <div 
                  key={update._id} 
                  className="update-card"
                  style={{ 
                    borderLeftColor: getUpdateColor(update.type)
                  }}
                >
                  <div className="update-header">
                    <div className="update-type-badge" style={{
                      backgroundColor: `${getUpdateColor(update.type)}20`,
                      color: getUpdateColor(update.type)
                    }}>
                      <i className={`fas fa-${getUpdateIcon(update.type)}`}></i>
                      {update.type}
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => { console.log('Delete button clicked for', update._id); window.alert('Delete clicked for ' + update._id); handleDelete(update._id); }}
                      title="Delete update"
                      disabled={deletingId === update._id}
                    >
                      {deletingId === update._id ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-trash-alt"></i>
                      )}
                    </button>
                  </div>

                  <h3 className="update-title">{update.title}</h3>
                  <p className="update-message">{update.message}</p>

                  <div className="update-footer">
                    <div className="update-meta">
                      <i className="fas fa-clock"></i>
                      {new Date(update.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
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

export default AdminUpdates;