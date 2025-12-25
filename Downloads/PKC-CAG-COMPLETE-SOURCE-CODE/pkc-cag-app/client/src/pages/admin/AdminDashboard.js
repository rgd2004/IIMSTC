import React, { useState, useEffect } from "react";
import { adminAPI, ordersAPI } from "../../utils/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  /* ================= STATE ================= */
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    totalRevenue: 0,
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  // 🔔 UPDATE STATE
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    title: "",
    message: "",
    type: "info",
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        adminAPI.getStats(),
        ordersAPI.getAllOrders(),
      ]);

      if (statsRes.data?.stats) {
        setStats(statsRes.data.stats);
      }
      setOrders(ordersRes.data.orders || []);
    } catch (err) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ORDER UPDATE ================= */
  const updateOrderStatus = async (orderId, status) => {
    setUpdatingOrder(orderId);
    try {
      await ordersAPI.updateOrderStatus(orderId, { status });
      toast.success("Order updated successfully");

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status } : o
        )
      );
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdatingOrder(null);
    }
  };

  /* ================= POST UPDATE ================= */
  const postUpdate = async (e) => {
    e.preventDefault();

    if (!updateForm.title || !updateForm.message) {
      return toast.error("Title & message required");
    }

    setPostingUpdate(true);
    try {
      await adminAPI.createUpdate(updateForm);
      toast.success("Update posted successfully");

      setUpdateForm({ title: "", message: "", type: "info" });
      setShowUpdateForm(false);
    } catch {
      toast.error("Failed to post update");
    } finally {
      setPostingUpdate(false);
    }
  };

  /* ================= EXPORT CSV ================= */
  const exportOrdersCSV = async () => {
    try {
      const res = await ordersAPI.exportCSV();
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `orders-${new Date().toISOString().slice(0,10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    } catch (err) {
      console.error("Export CSV failed", err);
      toast.error(err?.response?.data?.message || "Export failed");
    }
  };

  /* ================= HELPERS ================= */
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN") : "-";

  const getStatusColor = (s) =>
    ({
      pending: "#f59e0b",
      processing: "#3b82f6",
      completed: "#10b981",
      cancelled: "#ef4444",
    }[s] || "#6b7280");

  const computedRevenue = orders.reduce(
    (sum, o) =>
      o.paymentStatus === "paid" ? sum + (o.amount || 0) : sum,
    0
  );

  const totalRevenue =
    stats.totalRevenue > 0 ? stats.totalRevenue : computedRevenue;

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">

        {/* ===== HEADER ===== */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h1>
                <i className="fas fa-chart-line"></i>
                Admin Dashboard
              </h1>
              <p>Manage your platform operations & analytics</p>
            </div>

            <div className="header-actions">
              <button
                className="action-btn primary"
                onClick={() => setShowUpdateForm(true)}
              >
                <i className="fas fa-bullhorn"></i>
                Post Update
              </button>

              <Link to="/admin/updates" className="action-btn secondary">
                <i className="fas fa-edit"></i>
                Manage Updates
              </Link>

              <Link to="/admin/users" className="action-btn secondary">
                <i className="fas fa-users-cog"></i>
                Manage Users
              </Link>

              <Link to="/admin/logs" className="action-btn secondary">
                <i className="fas fa-clipboard-list"></i>
                Audit Logs
              </Link>

              <Link to="/admin/withdrawals" className="action-btn secondary">
                <i className="fas fa-wallet"></i>
                Withdrawals
              </Link>
              
                <button
                  className="action-btn outlined"
                  onClick={exportOrdersCSV}
                  title="Export all orders as CSV"
                >
                  <i className="fas fa-file-csv"></i>
                  Export Orders
                </button>
              
                <button
                  className="action-btn outlined"
                  onClick={async () => {
                    if (!window.confirm('Backfill missing service IDs now?')) return;
                    try {
                      const res = await adminAPI.backfillServiceIds();
                      toast.success(`Backfilled ${res.data.updated} service IDs`);
                      fetchData();
                    } catch (err) {
                      console.error('backfill error', err);
                      toast.error(err?.response?.data?.message || 'Backfill failed');
                    }
                  }}
                >
                  <i className="fas fa-tools"></i>
                  Backfill
                </button>
            </div>
          </div>
        </div>

        {/* ===== STATS CARDS ===== */}
        <div className="stats-grid">
          <StatCard 
            label="Total Users" 
            value={stats.totalUsers} 
            icon="users" 
            color="#8b5cf6"
            trend="+12%"
          />
          <StatCard 
            label="Total Orders" 
            value={stats.totalOrders} 
            icon="shopping-bag" 
            color="#3b82f6"
            trend="+8%"
          />
          <StatCard 
            label="Completed" 
            value={stats.completedOrders} 
            icon="check-circle" 
            color="#10b981"
            trend="+15%"
          />
          <StatCard 
            label="Pending" 
            value={stats.pendingOrders} 
            icon="clock" 
            color="#f59e0b"
          />
          <StatCard 
            label="Processing" 
            value={stats.processingOrders} 
            icon="cogs" 
            color="#06b6d4"
          />
          <StatCard 
            label="Total Revenue" 
            value={`₹${totalRevenue.toLocaleString()}`} 
            icon="rupee-sign" 
            color="#ec4899"
            trend="+24%"
          />
        </div>

        {/* ===== ORDERS TABLE ===== */}
        <div className="orders-section">
          <div className="section-header">
            <div>
              <h2>
                <i className="fas fa-list-ul"></i>
                Recent Orders
              </h2>
              <p className="section-subtitle">
                {orders.length} total orders
              </p>
            </div>
            <button onClick={fetchData} className="refresh-btn">
              <i className="fas fa-sync-alt"></i>
              Refresh
            </button>
          </div>

          {orders.length ? (
            <div className="table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td>
                        <span className="order-id">#{o._id.slice(-6)}</span>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {(o.userId?.name || "?")[0].toUpperCase()}
                          </div>
                          <span>{o.userId?.name || "N/A"}</span>
                        </div>
                      </td>
                      <td>{o.service?.name || "-"}</td>
                      <td>
                        <span className="amount">₹{o.amount}</span>
                      </td>
                      <td>
                        <span className={`payment-badge ${o.paymentStatus}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ 
                            backgroundColor: `${getStatusColor(o.status)}20`,
                            color: getStatusColor(o.status)
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <span className="date-cell">{formatDate(o.createdAt)}</span>
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={o.status}
                          disabled={updatingOrder === o._id}
                          onChange={(e) =>
                            updateOrderStatus(o._id, e.target.value)
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <h3>No orders yet</h3>
              <p>Orders will appear here once customers start placing them</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== UPDATE MODAL ===== */}
      {showUpdateForm && (
        <div className="modal-overlay" onClick={() => setShowUpdateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-bullhorn"></i>
                Post New Update
              </h2>
              <button 
                className="modal-close"
                onClick={() => setShowUpdateForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={postUpdate} className="update-form">
              <div className="form-group">
                <label>
                  <i className="fas fa-heading"></i>
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter update title"
                  value={updateForm.title}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-align-left"></i>
                  Message
                </label>
                <textarea
                  rows="5"
                  placeholder="Enter update message"
                  value={updateForm.message}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, message: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-tag"></i>
                  Type
                </label>
                <select
                  value={updateForm.type}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, type: e.target.value })
                  }
                >
                  <option value="info">ℹ Info</option>
                  <option value="feature">✨ Feature</option>
                  <option value="offer">🎉 Offer</option>
                  <option value="maintenance">🔧 Maintenance</option>
                  <option value="alert">⚠ Alert</option>
                </select>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowUpdateForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={postingUpdate}
                >
                  {postingUpdate ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Posting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Post Update
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===== STAT CARD COMPONENT ===== */
const StatCard = ({ label, value, icon, color, trend }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ backgroundColor: `${color}20` }}>
      <i className={`fas fa-${icon}`} style={{ color }}></i>
    </div>
    <div className="stat-content">
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
      {trend && (
        <span className="stat-trend positive">
          <i className="fas fa-arrow-up"></i>
          {trend}
        </span>
      )}
    </div>
  </div>
);

export default AdminDashboard;