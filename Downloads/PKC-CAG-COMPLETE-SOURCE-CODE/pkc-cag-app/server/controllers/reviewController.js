// server/controllers/reviewController.js
const Review = require('../models/Review');
const Order = require('../models/Order');
const Service = require('../models/Service');
const User = require('../models/User');

// User: Create/Submit review
exports.createReview = async (req, res) => {
  try {
    const { orderId, rating, title, comment, images } = req.body;
    const userId = req.user._id;

    console.log('📝 Review Submit - orderId:', orderId, 'userId:', userId);

    // Verify order belongs to user
    const order = await Order.findById(orderId).populate('service');
    if (!order) {
      console.log('❌ Order not found:', orderId);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== userId.toString()) {
      console.log('❌ User unauthorized for order');
      return res.status(403).json({ success: false, message: 'Unauthorized: Order not yours' });
    }

    // Check if order is paid (check both paymentStatus and status)
    if (order.paymentStatus !== 'paid' && order.status !== 'completed') {
      console.log('❌ Order not paid/completed:', {
        paymentStatus: order.paymentStatus,
        status: order.status,
      });
      return res.status(400).json({ success: false, message: 'Can only review paid/completed orders' });
    }

    // Check if review already exists for this order
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      console.log('❌ Review already exists for order:', orderId);
      return res.status(400).json({ success: false, message: 'Review already submitted for this order' });
    }

    // SAFE: Handle null service reference
    let serviceId = order.service?._id || order.service || order.serviceId;
    if (!serviceId) {
      console.log('❌ Service not found for order:', orderId);
      return res.status(400).json({ success: false, message: 'Service information is missing for this order' });
    }

    const review = new Review({
      orderId,
      userId,
      serviceId,
      rating,
      title,
      comment,
      images: images || [],
      isVerifiedPurchase: true,
      status: 'pending', // Explicitly set to pending
    });

    await review.save();

    // Populate for response
    await review.populate('userId', 'name email');
    await review.populate('serviceId', 'name');

    console.log('✅ Review created successfully:', review._id);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Awaiting admin approval.',
      data: review,
    });
  } catch (error) {
    console.error('❌ Review creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// User: Get their own reviews
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('serviceId', 'name')
      .populate('orderId', '_id')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get service reviews (published only)
exports.getServiceReviews = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { page = 1, limit = 10, sortBy = 'latest' } = req.query;

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'helpful') {
      sortOptions = { helpfulCount: -1 };
    } else if (sortBy === 'rating-high') {
      sortOptions = { rating: -1 };
    } else if (sortBy === 'rating-low') {
      sortOptions = { rating: 1 };
    }

    const reviews = await Review.find({
      serviceId,
      status: 'approved',
    })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name avatar')
      .sort(sortOptions);

    const total = await Review.countDocuments({
      serviceId,
      status: 'approved',
    });

    // Calculate average rating
    const ratingStats = await Review.aggregate([
      {
        $match: {
          serviceId: require('mongoose').Types.ObjectId(serviceId),
          status: 'approved',
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating',
          },
        },
      },
    ]);

    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    if (ratingStats[0]) {
      ratingStats[0].ratingDistribution.forEach((rating) => {
        distribution[rating]++;
      });
    }

    res.json({
      success: true,
      data: reviews,
      stats: {
        avgRating: ratingStats[0]?.avgRating || 0,
        totalReviews: total,
        ratingDistribution: distribution,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if already voted
    if (review.helpfulVotes.includes(userId)) {
      return res.status(400).json({ message: 'You already voted helpful' });
    }

    // Remove from unhelpful if previously voted
    if (review.unhelpfulVotes.includes(userId)) {
      review.unhelpfulVotes = review.unhelpfulVotes.filter(
        (id) => id.toString() !== userId.toString()
      );
      review.unhelpfulCount = Math.max(0, review.unhelpfulCount - 1);
    }

    review.helpfulVotes.push(userId);
    review.helpfulCount += 1;

    await review.save();

    res.json({
      success: true,
      message: 'Marked as helpful',
      data: {
        helpfulCount: review.helpfulCount,
        unhelpfulCount: review.unhelpfulCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark review as unhelpful
exports.markUnhelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if already voted
    if (review.unhelpfulVotes.includes(userId)) {
      return res.status(400).json({ message: 'You already voted unhelpful' });
    }

    // Remove from helpful if previously voted
    if (review.helpfulVotes.includes(userId)) {
      review.helpfulVotes = review.helpfulVotes.filter(
        (id) => id.toString() !== userId.toString()
      );
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    }

    review.unhelpfulVotes.push(userId);
    review.unhelpfulCount += 1;

    await review.save();

    res.json({
      success: true,
      message: 'Marked as unhelpful',
      data: {
        helpfulCount: review.helpfulCount,
        unhelpfulCount: review.unhelpfulCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get pending reviews for moderation
exports.getPendingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ status: 'pending' })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .populate('serviceId', 'name')
      .sort({ createdAt: 1 });

    const total = await Review.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Approve review
exports.approveReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status: 'approved' },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({
      success: true,
      message: 'Review approved',
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Reject review
exports.rejectReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        status: 'rejected',
        rejectionReason: reason,
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({
      success: true,
      message: 'Review rejected',
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Add response to review
exports.respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { response } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        adminResponse: {
          respondedBy: req.user._id,
          response,
          respondedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({
      success: true,
      message: 'Response added',
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get review stats for service
exports.getReviewStats = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const stats = await Review.aggregate([
      {
        $match: {
          serviceId: require('mongoose').Types.ObjectId(serviceId),
          status: 'approved',
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          verified: {
            $sum: { $cond: ['$isVerifiedPurchase', 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: '_id',
          pipeline: [
            {
              $match: {
                serviceId: require('mongoose').Types.ObjectId(serviceId),
                status: 'approved',
              },
            },
          ],
          as: 'ratingBreakdown',
        },
      },
    ]);

    const ratingBreakdown = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    if (stats[0]) {
      stats[0].ratingBreakdown.forEach((review) => {
        ratingBreakdown[review.rating]++;
      });
    }

    res.json({
      success: true,
      data: stats[0] || {
        avgRating: 0,
        totalReviews: 0,
        verified: 0,
      },
      ratingBreakdown,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
