// client/src/pages/DataExportHub.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ordersAPI } from "../utils/api";
import "./DataExportHub.css";

const DataExportHub = () => {
  const { user } = useAuth();
  const [exportFormat, setExportFormat] = useState("pdf");
  const [exportData, setExportData] = useState({
    orders: true,
    profile: true,
    referrals: false,
  });
  const [exporting, setExporting] = useState(false);
  const [orderStats, setOrderStats] = useState(null);

  useEffect(() => {
    loadOrderStats();
  }, []);

  const loadOrderStats = async () => {
    try {
      const ordersRes = await ordersAPI.getMyOrders();
      const orders = ordersRes.data.orders || [];
      setOrderStats({
        total: orders.length,
        completed: orders.filter((o) => o.status === "completed").length,
        pending: orders.filter((o) => o.status !== "completed").length,
        totalSpent: orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
      });
    } catch (err) {
      console.error("Error loading order stats:", err);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      // Simulate export delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate mock data based on selected options
      const exportContent = {
        timestamp: new Date().toISOString(),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          level: user.level,
        },
        selectedFormat: exportFormat,
        dataIncluded: exportData,
      };

      if (exportData.orders && orderStats) {
        exportContent.orders = orderStats;
      }

      // Create download
      const dataStr = JSON.stringify(exportContent, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," +
        encodeURIComponent(dataStr);
      const exportFileDefaultName = `pck-cag-export-${new Date().toISOString().split("T")[0]}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      setExporting(false);
    } catch (err) {
      console.error("Error exporting data:", err);
      setExporting(false);
    }
  };

  return (
    <div className="data-export-hub">
      <div className="container">
        <Link to="/user-hub" className="back-btn">
          ← Back to Hub
        </Link>

        <div className="export-header">
          <h1>Data Export & Download</h1>
          <p>Export your data in various formats for backup or analysis</p>
        </div>

        <div className="export-grid">
          {/* EXPORT OPTIONS */}
          <div className="export-card">
            <h2>Export Options</h2>

            {/* FORMAT SELECTOR */}
            <div className="option-group">
              <label htmlFor="format">Export Format</label>
              <div className="format-selector">
                <button
                  className={`format-btn ${exportFormat === "pdf" ? "active" : ""}`}
                  onClick={() => setExportFormat("pdf")}
                >
                  📄 PDF
                </button>
                <button
                  className={`format-btn ${exportFormat === "csv" ? "active" : ""}`}
                  onClick={() => setExportFormat("csv")}
                >
                  📊 CSV
                </button>
                <button
                  className={`format-btn ${exportFormat === "json" ? "active" : ""}`}
                  onClick={() => setExportFormat("json")}
                >
                  ⚙️ JSON
                </button>
                <button
                  className={`format-btn ${exportFormat === "excel" ? "active" : ""}`}
                  onClick={() => setExportFormat("excel")}
                >
                  📈 Excel
                </button>
              </div>
            </div>

            {/* DATA SELECTION */}
            <div className="option-group">
              <label>Data to Include</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={exportData.profile}
                    onChange={(e) =>
                      setExportData({
                        ...exportData,
                        profile: e.target.checked,
                      })
                    }
                  />
                  <span>Profile Information</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={exportData.orders}
                    onChange={(e) =>
                      setExportData({ ...exportData, orders: e.target.checked })
                    }
                  />
                  <span>Order History</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={exportData.referrals}
                    onChange={(e) =>
                      setExportData({
                        ...exportData,
                        referrals: e.target.checked,
                      })
                    }
                  />
                  <span>Referral Data</span>
                </label>
              </div>
            </div>

            {/* EXPORT BUTTON */}
            <button
              className="btn-export"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <span className="spinner"></span> Preparing Export...
                </>
              ) : (
                <>
                  📥 Download Data ({exportFormat.toUpperCase()})
                </>
              )}
            </button>

            <p className="export-info">
              Your data will be securely downloaded to your device. No data is
              stored on our servers.
            </p>
          </div>

          {/* DATA STATISTICS */}
          <div className="stats-card">
            <h2>Your Data Statistics</h2>
            {orderStats ? (
              <div className="stats-list">
                <div className="stat-item">
                  <span className="stat-icon">📦</span>
                  <div>
                    <p className="stat-label">Total Orders</p>
                    <p className="stat-value">{orderStats.total}</p>
                  </div>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">✅</span>
                  <div>
                    <p className="stat-label">Completed Orders</p>
                    <p className="stat-value">{orderStats.completed}</p>
                  </div>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">⏳</span>
                  <div>
                    <p className="stat-label">Pending Orders</p>
                    <p className="stat-value">{orderStats.pending}</p>
                  </div>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">💰</span>
                  <div>
                    <p className="stat-label">Total Amount Spent</p>
                    <p className="stat-value">₹{orderStats.totalSpent}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading statistics...</p>
            )}
          </div>
        </div>

        {/* PRIVACY & INFO SECTION */}
        <div className="info-card">
          <h2>About Data Export</h2>
          <div className="info-content">
            <div className="info-item">
              <div className="info-icon">🔒</div>
              <div>
                <h4>Privacy & Security</h4>
                <p>
                  Your exported data is encrypted and will be deleted
                  automatically after 30 days if not downloaded.
                </p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">📋</div>
              <div>
                <h4>Available Formats</h4>
                <p>
                  Choose from PDF for printable reports, CSV/Excel for
                  spreadsheets, or JSON for technical use.
                </p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">⏰</div>
              <div>
                <h4>Data Retention</h4>
                <p>
                  We keep your data for 7 years as per regulatory requirements.
                  You can request permanent deletion anytime.
                </p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">✉️</div>
              <div>
                <h4>Need Help?</h4>
                <p>
                  If you have questions about your data or need assistance,
                  contact our support team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExportHub;
