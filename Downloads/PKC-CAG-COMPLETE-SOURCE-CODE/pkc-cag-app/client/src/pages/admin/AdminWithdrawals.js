import React, { useEffect, useState } from "react";
import { withdrawalAPI } from "../../utils/api";
import toast from "react-hot-toast";
import "./AdminWithdrawals.css";

const AdminWithdrawals = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    try {
      setLoading(true);
      const res = await withdrawalAPI.getAll();
      setList(res.data.withdrawals);
    } catch (err) {
      toast.error("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    try {
      await withdrawalAPI.approve(id, "Paid Successfully");
      toast.success("Withdrawal Approved!");
      load();
    } catch (err) {
      toast.error("Failed to approve");
    }
  };

  const reject = async (id) => {
    try {
      await withdrawalAPI.reject(id, "Rejected by admin");
      toast.success("Withdrawal Rejected!");
      load();
    } catch (err) {
      toast.error("Failed to reject");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { className: "badge-pending", icon: "⏳", text: "Pending" },
      approved: { className: "badge-approved", icon: "✅", text: "Approved" },
      rejected: { className: "badge-rejected", icon: "❌", text: "Rejected" },
      paid: { className: "badge-paid", icon: "💰", text: "Paid" },
    };
    const badge = badges[status.toLowerCase()] || badges.pending;
    return (
      <span className={`status-badge ${badge.className}`}>
        <span className="badge-icon">{badge.icon}</span>
        {badge.text}
      </span>
    );
  };

  const filteredList = list.filter((w) => {
    if (filter === "all") return true;
    return w.status.toLowerCase() === filter;
  });

  const stats = {
    total: list.length,
    pending: list.filter((w) => w.status === "pending").length,
    approved: list.filter((w) => w.status === "approved" || w.status === "paid").length,
    totalAmount: list.reduce((sum, w) => sum + w.amount, 0),
  };

  return (
    <div className="admin-withdrawals">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">💳 Withdrawal Requests</h1>
          <p className="page-subtitle">Manage and process user withdrawal requests</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Requests</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">💰</div>
          <div className="stat-content">
            <div className="stat-value">₹{stats.totalAmount.toLocaleString()}</div>
            <div className="stat-label">Total Amount</div>
          </div>
        </div>
      </div>

      <div className="table-controls">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({list.length})
          </button>
          <button
            className={`filter-tab ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending ({stats.pending})
          </button>
          <button
            className={`filter-tab ${filter === "approved" ? "active" : ""}`}
            onClick={() => setFilter("approved")}
          >
            Approved ({stats.approved})
          </button>
        </div>

        <button className="refresh-btn" onClick={load} disabled={loading}>
          {loading ? "🔄 Loading..." : "🔄 Refresh"}
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading withdrawals...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Withdrawals Found</h3>
            <p>There are no withdrawal requests to display</p>
          </div>
        ) : (
          <table className="withdrawals-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>UPI ID</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredList.map((w) => (
                <tr key={w._id} className="table-row">
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {w.userId?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{w.userId?.name || "Unknown"}</div>
                        <div className="user-email">{w.userId?.email || "N/A"}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="amount-cell">₹{w.amount.toLocaleString()}</div>
                  </td>

                  <td>
                    <div className="upi-cell">
                      <span className="upi-icon">💳</span>
                      {w.paymentDetails?.upiId || "N/A"}
                    </div>
                  </td>

                  <td>{getStatusBadge(w.status)}</td>

                  <td>
                    <div className="date-cell">
                      {new Date(w.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>

                  <td>
                    {w.status === "pending" ? (
                      <div className="action-buttons">
                        <button
                          className="btn-approve"
                          onClick={() => approve(w._id)}
                          title="Approve withdrawal"
                        >
                          <span className="btn-icon">✓</span>
                          Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => reject(w._id)}
                          title="Reject withdrawal"
                        >
                          <span className="btn-icon">✕</span>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="processed-label">
                        {w.status === "approved" || w.status === "paid" ? "✅ Processed" : "❌ Rejected"}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminWithdrawals;