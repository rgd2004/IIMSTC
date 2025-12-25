// server/controllers/activityFeedController.js
const ActivityFeed = require('../models/ActivityFeed');
const User = require('../models/User');

// =============================
// CREATE ACTIVITY
// =============================
exports.createActivity = async (userId, activityData) => {
  try {
    const activity = new ActivityFeed({
      userId,
      ...activityData,
    });
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
  }
};

// =============================
// GET PUBLIC ACTIVITY FEED
// =============================
exports.getActivityFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const activities = await ActivityFeed.find({ isPublic: true })
      .populate('userId', 'name email photo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ActivityFeed.countDocuments({ isPublic: true });

    res.json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity feed',
    });
  }
};

// =============================
// GET FOLLOWING USERS' ACTIVITIES
// =============================
exports.getFollowingFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id);
    const followingIds = user.following || [];

    const activities = await ActivityFeed.find({
      userId: { $in: followingIds },
      isPublic: true,
    })
      .populate('userId', 'name email photo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ActivityFeed.countDocuments({
      userId: { $in: followingIds },
      isPublic: true,
    });

    res.json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch following feed',
    });
  }
};

// =============================
// GET PERSONAL ACTIVITIES
// =============================
exports.getPersonalActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const activities = await ActivityFeed.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ActivityFeed.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch personal activities',
    });
  }
};

// =============================
// LIKE ACTIVITY
// =============================
exports.likeActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user.id;

    const activity = await ActivityFeed.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    const likeIndex = activity.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      activity.likes.splice(likeIndex, 1);
    } else {
      // Like
      activity.likes.push(userId);
    }

    activity.likeCount = activity.likes.length;
    await activity.save();

    res.json({
      success: true,
      message: likeIndex > -1 ? 'Unliked' : 'Liked',
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to like activity',
    });
  }
};

// =============================
// COMMENT ON ACTIVITY
// =============================
exports.commentActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    const activity = await ActivityFeed.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    const comment = {
      userId,
      text,
      createdAt: new Date(),
    };

    activity.comments.push(comment);
    await activity.save();
    await activity.populate('userId', 'name email photo');

    res.json({
      success: true,
      message: 'Comment added',
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
    });
  }
};

// =============================
// DELETE COMMENT
// =============================
exports.deleteComment = async (req, res) => {
  try {
    const { activityId, commentId } = req.params;
    const userId = req.user.id;

    const activity = await ActivityFeed.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    const comment = activity.comments.find((c) => c._id.toString() === commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    activity.comments = activity.comments.filter((c) => c._id.toString() !== commentId);
    await activity.save();

    res.json({
      success: true,
      message: 'Comment deleted',
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
    });
  }
};

// =============================
// FOLLOW USER
// =============================
exports.followUser = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user.id;

    if (userId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself',
      });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.following) user.following = [];
    if (!targetUser.followers) targetUser.followers = [];

    const followIndex = user.following.indexOf(targetUserId);

    if (followIndex > -1) {
      // Unfollow
      user.following.splice(followIndex, 1);
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== userId);
    } else {
      // Follow
      user.following.push(targetUserId);
      targetUser.followers.push(userId);
    }

    await user.save();
    await targetUser.save();

    // Create activity for follow
    if (followIndex === -1) {
      // Only create activity when following, not unfollowing
      await exports.createActivity(userId, {
        activityType: 'follower',
        title: `Started following ${targetUser.name}`,
        description: `Now following @${targetUser.name}`,
        metadata: {
          followedUserId: targetUserId,
        },
        isPublic: true,
      });
    }

    res.json({
      success: true,
      message: followIndex > -1 ? 'Unfollowed' : 'Followed',
      data: {
        isFollowing: followIndex === -1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to follow user',
    });
  }
};

// =============================
// GET USER FOLLOWERS
// =============================
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate('followers', 'name email photo');

    res.json({
      success: true,
      data: {
        followers: user.followers || [],
        followerCount: user.followers?.length || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch followers',
    });
  }
};

// =============================
// GET USER FOLLOWING
// =============================
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate('following', 'name email photo');

    res.json({
      success: true,
      data: {
        following: user.following || [],
        followingCount: user.following?.length || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch following',
    });
  }
};

// =============================
// TOGGLE ACTIVITY VISIBILITY
// =============================
exports.toggleActivityVisibility = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user.id;

    const activity = await ActivityFeed.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    if (activity.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    activity.isPublic = !activity.isPublic;
    await activity.save();

    res.json({
      success: true,
      message: `Activity is now ${activity.isPublic ? 'public' : 'private'}`,
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle visibility',
    });
  }
};
