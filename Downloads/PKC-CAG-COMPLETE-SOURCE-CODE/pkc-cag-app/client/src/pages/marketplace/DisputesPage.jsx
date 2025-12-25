// client/src/pages/marketplace/DisputesPage.jsx
import React, { useState, useEffect } from "react";
import { marketplaceAPI } from "../../utils/api";
import "./DisputesPage.css";
import toast from "react-hot-toast";

const DisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [responseText, setResponseText] = useState({});

  useEffect(() => {
    loadDisputes();
  }, [filter]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const res = await marketplaceAPI.getMyDisputes({
        status: filter !== "all" ? filter : undefined,
      });
      setDisputes(res.data?.disputes || []);
    } catch (err) {
      console.error("Error loading disputes:", err);
      toast.error("Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (disputeId) => {
    if (!responseText[disputeId]?.trim()) {
      toast.error("Please enter a response");
      return;
    }

    try {
      await marketplaceAPI.submitDisputeResponse(disputeId, {
        response: responseText[disputeId],
      });
      toast.success("Response submitted!");
      setResponseText((prev) => ({ ...prev, [disputeId]: "" }));
      loadDisputes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit response");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { color: "#f5576c", label: "OPEN" },
      "in-review": { color: "#fbbf24", label: "IN REVIEW" },
      resolved: { color: "#10b981", label: "RESOLVED" },
    };
    return badges[status] || badges.open;
  };

  return (
    <div className="disputes-container">
      {/* Header */}
      <div className="disputes-header">
        <h1>⚖️ Disputes</h1>
        <p>Manage and resolve contract disputes</p>
      </div>

      {/* Filters */}
      <div className="disputes-filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({disputes.length})
        </button>
        <button
          className={`filter-btn ${filter === "open" ? "active" : ""}`}
          onClick={() => setFilter("open")}
        >
          Open
        </button>
        <button
          className={`filter-btn ${filter === "in-review" ? "active" : ""}`}
          onClick={() => setFilter("in-review")}
        >
          In Review
        </button>
        <button
          className={`filter-btn ${filter === "resolved" ? "active" : ""}`}
          onClick={() => setFilter("resolved")}
        >
          Resolved
        </button>
      </div>

      {/* Content */}
      <div className="disputes-content">
        {loading ? (
          <div className="loading-state">
            <div className="loader-spinner"></div>
            <p>Loading disputes...</p>
          </div>
        ) : disputes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">😊</div>
            <h3>No disputes</h3>
            <p>Great! You don't have any ongoing disputes</p>
          </div>
        ) : (
          <div className="disputes-list">
            {disputes.map((dispute) => {
              const badge = getStatusBadge(dispute.status);
              return (
                <div key={dispute._id} className="dispute-card">
                  <div className="dispute-header">
                    <div>
                      <h3>Dispute #{dispute._id.slice(-6)}</h3>
                      <p className="dispute-job">
                        Job: {dispute.contract?.job?.title || "Unknown"}
                      </p>
                    </div>
                    <span
                      className="dispute-status"
                      style={{ backgroundColor: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="dispute-issue">
                    <h4>Issue Description</h4>
                    <p>{dispute.issue}</p>
                  </div>

                  <div className="dispute-details">
                    <div className="detail-item">
                      <span className="label">Party Involved:</span>
                      <span className="value">
                        {dispute.party === "client" ? "Client" : "Freelancer"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Amount in Dispute:</span>
                      <span className="value">
                        ₹{dispute.contract?.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Filed Date:</span>
                      <span className="value">
                        {new Date(dispute.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {dispute.status !== "resolved" && (
                    <div className="dispute-response">
                      <h4>Add Your Response</h4>
                      <textarea
                        placeholder="Provide your response or evidence..."
                        value={responseText[dispute._id] || ""}
                        onChange={(e) =>
                          setResponseText({
                            ...responseText,
                            [dispute._id]: e.target.value,
                          })
                        }
                        rows="4"
                      />
                      <button
                        className="submit-response-btn"
                        onClick={() => handleSubmitResponse(dispute._id)}
                      >
                        Submit Response
                      </button>
                    </div>
                  )}

                  {dispute.resolutionDetails && (
                    <div className="resolution-box">
                      <h4>✅ Resolution</h4>
                      <p>
                        <strong>Type:</strong> {dispute.resolutionDetails.type}
                      </p>
                      <p>
                        <strong>Details:</strong>{" "}
                        {dispute.resolutionDetails.details}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputesPage;
