// server/routes/activityRoutes.js
const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getActivityFeed,
  getFollowingFeed,
  getPersonalActivities,
  likeActivity,
  commentActivity,
  deleteComment,
  followUser,
  getFollowers,
  getFollowing,
  toggleActivityVisibility,
} = require('../controllers/activityFeedController');

const router = express.Router();

// Public routes
router.get('/feed', getActivityFeed);
router.get('/user/:userId/followers', getFollowers);
router.get('/user/:userId/following', getFollowing);

// Protected routes (User must be logged in)
router.get('/feed/following', protect, getFollowingFeed);
router.get('/my-activities', protect, getPersonalActivities);
router.post('/activity/:activityId/like', protect, likeActivity);
router.post('/activity/:activityId/comment', protect, commentActivity);
router.delete('/activity/:activityId/comment/:commentId', protect, deleteComment);
router.post('/user/:targetUserId/follow', protect, followUser);
router.put('/activity/:activityId/visibility', protect, toggleActivityVisibility);

module.exports = router;
