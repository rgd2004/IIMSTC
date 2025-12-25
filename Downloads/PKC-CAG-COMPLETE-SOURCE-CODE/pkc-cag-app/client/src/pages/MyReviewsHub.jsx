// client/src/pages/MyReviewsHub.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ordersAPI, reviewAPI } from "../utils/api";
import Toast from "react-hot-toast";
import "./MyReviewsHub.css";

const MyReviewsHub = () => {
  const { user } = useAuth();
  const [myReviews, setMyReviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's orders
      const ordersRes = await ordersAPI.getMyOrders();
      const completedOrders = ordersRes.data.orders?.filter(
        (o) => o.status === "completed"
      ) || [];
      setOrders(completedOrders);

      // Fetch user's reviews from API
      try {
        const reviewsRes = await reviewAPI.getUserReviews();
        setMyReviews(reviewsRes.data.data || []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setMyReviews([]);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      Toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!selectedOrder) {
      Toast.error("Please select an order");
      return;
    }

    if (!formData.title.trim() || !formData.comment.trim()) {
      Toast.error("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      
      // Call API to create review
      const response = await reviewAPI.createReview({
        orderId: selectedOrder._id,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
      });

      // Add new review to list
      setMyReviews([response.data.data, ...myReviews]);
      setFormData({ rating: 5, title: "", comment: "" });
      setSelectedOrder(null);
      setShowReviewForm(false);
      Toast.success("✅ Review submitted! Awaiting admin moderation.");
    } catch (err) {
      console.error("Error submitting review:", err);
      Toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        // In production, call API to delete: await reviewAPI.deleteReview(reviewId);
        setMyReviews(myReviews.filter((r) => r._id !== reviewId));
        Toast.success("Review deleted");
      } catch (err) {
        Toast.error("Failed to delete review");
      }
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      approved: "#10b981",
      pending: "#f59e0b",
      rejected: "#ef4444",
    };
    return colors[status] || "#6366f1";
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-spinner"></div>
        <p>Loading your reviews...</p>
      </div>
    );
  }

  return (
    <div className="my-reviews-hub">
      <div className="container">
        <Link to="/user-hub" className="back-btn">
          ← Back to Hub
        </Link>

        <div className="reviews-header">
          <h1>My Reviews</h1>
          <p>Write and manage your service reviews</p>
        </div>

        {/* STATS */}
        <div className="reviews-stats">
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <p className="stat-label">Total Reviews</p>
              <p className="stat-value">{myReviews.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <p className="stat-label">Published</p>
              <p className="stat-value">
                {myReviews.filter((r) => r.status === "approved").length}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <p className="stat-label">Pending Review</p>
              <p className="stat-value">
                {myReviews.filter((r) => r.status === "pending").length}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <p className="stat-label">Avg Rating</p>
              <p className="stat-value">
                {myReviews.length > 0
                  ? (
                      myReviews.reduce((sum, r) => sum + r.rating, 0) /
                      myReviews.length
                    ).toFixed(1)
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* NEW REVIEW BUTTON */}
        {!showReviewForm && (
          <button
            className="btn-new-review"
            onClick={() => setShowReviewForm(true)}
          >
            ✍️ Write a Review
          </button>
        )}

        {/* NEW REVIEW FORM */}
        {showReviewForm && (
          <div className="review-form-card">
            <h2>Write a Review</h2>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Select an Order *</label>
                <select
                  value={selectedOrder?._id || ""}
                  onChange={(e) => {
                    const order = orders.find((o) => o._id === e.target.value);
                    setSelectedOrder(order);
                  }}
                  required
                  className="form-input"
                >
                  <option value="">Choose an order...</option>
                  {orders.map((order) => (
                    <option key={order._id} value={order._id}>
                      {order.serviceName} (Order: {order.orderNumber || order._id.slice(0, 8)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Rating *</label>
                <div className="rating-selector">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${formData.rating >= star ? "active" : ""}`}
                      onClick={() => setFormData({ ...formData, rating: star })}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Review Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Excellent Service"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Your Review *</label>
                <textarea
                  placeholder="Share your experience..."
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  className="form-textarea"
                  rows="5"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowReviewForm(false);
                    setFormData({ rating: 5, title: "", comment: "" });
                    setSelectedOrder(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MY REVIEWS LIST */}
        <div className="reviews-list">
          {myReviews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No reviews yet</h3>
              <p>Write your first review to share your experience</p>
            </div>
          ) : (
            <div className="reviews-container">
              {myReviews.map((review) => (
                <div key={review._id} className="review-item">
                  <div className="review-header">
                    <div>
                      <h3>{review.title}</h3>
                      <p className="service-name">{review.serviceId?.name || "Service"}</p>
                    </div>
                    <div className="review-meta">
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusBadgeColor(review.status),
                        }}
                      >
                        {review.status || "pending"}
                      </span>
                    </div>
                  </div>

                  <div className="review-rating">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="star">
                        ⭐
                      </span>
                    ))}
                  </div>

                  <p className="review-comment">{review.comment}</p>

                  <div className="review-footer">
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {review.status !== "approved" && (
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteReview(review._id)}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GUIDELINES */}
        <div className="guidelines-card">
          <h2>Review Guidelines</h2>
          <ul>
            <li>✅ Be honest and fair in your review</li>
            <li>✅ Share your genuine experience with the service</li>
            <li>✅ Provide helpful and constructive feedback</li>
            <li>❌ Don't post offensive or inappropriate content</li>
            <li>❌ Don't include personal information or contact details</li>
            <li>❌ Don't post reviews for services you haven't used</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyReviewsHub;
