// client/src/pages/admin/ReviewModeration.jsx
import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './ReviewModeration.css';

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [response, setResponse] = useState('');
  const [page, setPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchPendingReviews();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchPendingReviews, 5000);
    return () => clearInterval(interval);
  }, [page]);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/reviews/admin/pending?page=${page}&limit=10`);
      console.log('📋 Fetched reviews:', res.data);
      setReviews(res.data.data || []);
      setTotalReviews(res.data.pagination?.total || 0);
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      toast.error('Failed to load reviews: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      await API.put(`/reviews/admin/${reviewId}/approve`, {});
      toast.success('✅ Review approved');
      fetchPendingReviews();
      setSelectedReview(null);
    } catch (error) {
      console.error('❌ Approve error:', error);
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (reviewId) => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason) {
      try {
        await API.put(`/reviews/admin/${reviewId}/reject`, { reason });
        toast.success('✅ Review rejected');
        fetchPendingReviews();
        setSelectedReview(null);
      } catch (error) {
        console.error('❌ Reject error:', error);
        toast.error('Failed to reject review');
      }
    }
  };

  const handleRespond = async (reviewId) => {
    if (!response.trim()) {
      toast.error('Response cannot be empty');
      return;
    }

    try {
      await API.put(`/reviews/admin/${reviewId}/respond`, { response });
      toast.success('✅ Response added');
      setResponse('');
      fetchPendingReviews();
    } catch (error) {
      console.error('❌ Response error:', error);
      toast.error('Failed to add response');
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="review-moderation">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div className="loader-spinner"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-moderation">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>⭐ Review Moderation</h1>
        <div style={{ color: '#666' }}>
          <strong>Total Pending:</strong> {totalReviews}
          <button 
            onClick={fetchPendingReviews}
            style={{
              marginLeft: '15px',
              padding: '8px 15px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="review-container">
        {reviews.length === 0 ? (
          <p className="empty-state">
            ✅ No pending reviews - all caught up!
            {totalReviews === 0 && ' Reviews will appear here when users submit them.'}
          </p>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="review-card"
                onClick={() => setSelectedReview(review)}
                style={{ cursor: 'pointer' }}
              >
                <div className="review-header">
                  <strong>{review.userId?.name || 'Anonymous'}</strong>
                  <span className="rating">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="review-title">{review.title}</p>
                <p className="review-comment">{review.comment.substring(0, 100)}...</p>
                <div className="review-meta">
                  <small>{review.serviceId?.name || 'Service'}</small>
                  <small>{new Date(review.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedReview && (
          <div className="review-detail-modal">
            <div className="modal-content">
              <button className="close-btn" onClick={() => setSelectedReview(null)}>
                ×
              </button>
              <div className="detail-header">
                <h2>{selectedReview.title}</h2>
                <div className="rating-display">{'⭐'.repeat(selectedReview.rating)}</div>
              </div>

              <div className="detail-body">
                <p>
                  <strong>User:</strong> {selectedReview.userId?.name || 'Unknown'}
                </p>
                <p>
                  <strong>Email:</strong> {selectedReview.userId?.email || 'N/A'}
                </p>
                <p>
                  <strong>Service:</strong> {selectedReview.serviceId?.name || 'Unknown'}
                </p>
                <p>
                  <strong>Status:</strong> <span style={{ color: '#f59e0b' }}>{selectedReview.status}</span>
                </p>
                <div className="review-text">
                  <strong>Review:</strong>
                  <p>{selectedReview.comment}</p>
                </div>

                <div className="admin-response-section">
                  <h3>Add Response</h3>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Your response..."
                    rows="4"
                  />
                  <button
                    className="btn-respond"
                    onClick={() => handleRespond(selectedReview._id)}
                  >
                    Post Response
                  </button>
                </div>
              </div>

              <div className="detail-actions">
                <button
                  className="btn-approve"
                  onClick={() => handleApprove(selectedReview._id)}
                >
                  ✓ Approve
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleReject(selectedReview._id)}
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewModeration;
