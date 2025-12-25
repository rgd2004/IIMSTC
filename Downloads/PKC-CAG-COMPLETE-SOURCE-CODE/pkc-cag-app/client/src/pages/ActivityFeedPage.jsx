// client/src/pages/ActivityFeedPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import Toast from 'react-hot-toast';
import '../pages/ActivityFeedPage.css';

const ActivityFeedPage = () => {
  const [activeTab, setActiveTab] = useState('explore');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchActivities();
  }, [activeTab, page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let endpoint = '/activity/feed';

      if (activeTab === 'following') {
        endpoint = '/activity/feed/following';
      } else if (activeTab === 'personal') {
        endpoint = '/activity/my-activities';
      }

      const response = await API.get(endpoint, {
        params: { page },
      });

      setActivities(response.data.data);
    } catch (error) {
      Toast.error('Failed to fetch activities');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (activityId, likes) => {
    try {
      const response = await API.post(`/activity/activity/${activityId}/like`);

      if (response.data.success) {
        setActivities((prev) =>
          prev.map((activity) =>
            activity._id === activityId
              ? { ...activity, likes: response.data.data.likes, likeCount: response.data.data.likeCount }
              : activity
          )
        );
      }
    } catch (error) {
      Toast.error('Failed to like activity');
    }
  };

  const handleComment = async (activityId) => {
    const text = prompt('Write a comment:');
    if (!text) return;

    try {
      const response = await API.post(`/activity/activity/${activityId}/comment`, {
        text,
      });

      if (response.data.success) {
        setActivities((prev) =>
          prev.map((activity) =>
            activity._id === activityId ? response.data.data : activity
          )
        );
        Toast.success('Comment added!');
      }
    } catch (error) {
      Toast.error('Failed to add comment');
    }
  };

  const handleFollow = async (userId) => {
    try {
      const response = await API.post(`/activity/user/${userId}/follow`);

      if (response.data.success) {
        Toast.success(response.data.message);
      }
    } catch (error) {
      Toast.error(error.response?.data?.message || 'Failed to follow user');
    }
  };

  const getActivityEmoji = (type) => {
    const emojis = {
      purchase: '🛍️',
      review: '⭐',
      referral: '👥',
      level_up: '🎉',
      achievement: '🏆',
      follower: '👤',
    };
    return emojis[type] || '📌';
  };

  const getActivityColor = (type) => {
    const colors = {
      purchase: '#4caf50',
      review: '#ff9800',
      referral: '#2196f3',
      level_up: '#9c27b0',
      achievement: '#ffc107',
      follower: '#e91e63',
    };
    return colors[type] || '#667eea';
  };

  return (
    <div className="activity-feed-page">
      <div className="feed-container">
        <h1>🌟 Activity Feed</h1>
        <p className="subtitle">See what's happening in the community</p>

        {/* TABS */}
        <div className="feed-tabs">
          <button
            className={`tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('explore');
              setPage(1);
            }}
          >
            🌍 Explore
          </button>
          <button
            className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('following');
              setPage(1);
            }}
          >
            👥 Following
          </button>
          <button
            className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('personal');
              setPage(1);
            }}
          >
            📝 My Activities
          </button>
        </div>

        {/* ACTIVITIES LIST */}
        {loading ? (
          <div className="loading">⏳ Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="empty-state">
            <p>📭 No activities yet</p>
            <p>
              {activeTab === 'following'
                ? 'Start following people to see their activities!'
                : 'Be the first to make a move!'}
            </p>
          </div>
        ) : (
          <div className="activities-list">
            {activities.map((activity) => (
              <div
                key={activity._id}
                className="activity-item"
                style={{
                  borderLeftColor: getActivityColor(activity.activityType),
                }}
              >
                {/* ACTIVITY HEADER */}
                <div className="activity-header">
                  <div className="activity-user-info">
                    <span className="activity-emoji">
                      {getActivityEmoji(activity.activityType)}
                    </span>
                    <div className="activity-text">
                      <h3>{activity.title}</h3>
                      <p>{activity.description}</p>
                    </div>
                  </div>
                  <span className="activity-time">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* ACTIVITY ENGAGEMENT */}
                <div className="activity-engagement">
                  <button
                    className="engagement-btn like-btn"
                    onClick={() => handleLike(activity._id, activity.likes)}
                  >
                    👍 {activity.likeCount || 0} Likes
                  </button>
                  <button
                    className="engagement-btn comment-btn"
                    onClick={() => handleComment(activity._id)}
                  >
                    💬 {activity.comments?.length || 0} Comments
                  </button>
                  {activity.metadata?.followedUserId && (
                    <button
                      className="engagement-btn follow-btn"
                      onClick={() => handleFollow(activity.metadata.followedUserId)}
                    >
                      ➕ Follow Back
                    </button>
                  )}
                </div>

                {/* COMMENTS PREVIEW */}
                {activity.comments && activity.comments.length > 0 && (
                  <div className="comments-preview">
                    {activity.comments.slice(0, 2).map((comment, idx) => (
                      <div key={idx} className="comment-item">
                        <strong>{comment.userId?.name || 'Anonymous'}:</strong>
                        <p>{comment.text}</p>
                      </div>
                    ))}
                    {activity.comments.length > 2 && (
                      <p className="more-comments">
                        +{activity.comments.length - 2} more comments
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {!loading && activities.length > 0 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              ← Previous
            </button>
            <span className="page-info">Page {page}</span>
            <button
              className="pagination-btn"
              onClick={() => setPage(page + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeedPage;
