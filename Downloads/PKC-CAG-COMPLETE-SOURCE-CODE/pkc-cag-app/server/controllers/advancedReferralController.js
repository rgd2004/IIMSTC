// server/controllers/advancedReferralController.js
const User = require('../models/User');
const Order = require('../models/Order');
const ReferralCommission = require('../models/ReferralCommission');
const ReferralLeaderboard = require('../models/ReferralLeaderboard');

// Get referral analytics for user
exports.getReferralAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Direct referrals (Tier 1)
    const tier1Referrals = await User.countDocuments({ referredBy: req.user.referralCode });

    // Get tier 1 users
    const tier1Users = await User.find({ referredBy: req.user.referralCode }).select(
      '_id referralCode'
    );

    // Tier 2 referrals (referrals of referrals)
    let tier2Count = 0;
    if (tier1Users.length > 0) {
      const tier1Codes = tier1Users.map((u) => u.referralCode);
      tier2Count = await User.countDocuments({ referredBy: { $in: tier1Codes } });
    }

    // Commission breakdown
    const commissions = await ReferralCommission.aggregate([
      { $match: { referrerId: userId } },
      {
        $group: {
          _id: '$tier',
          total: { $sum: '$commissionAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const commissionByTier = {
      tier1: 0,
      tier2: 0,
      tier3: 0,
    };

    commissions.forEach((c) => {
      commissionByTier[`tier${c._id}`] = c.total;
    });

    // Pending earnings
    const pendingCommissions = await ReferralCommission.aggregate([
      {
        $match: { referrerId: userId, status: 'pending' },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$commissionAmount' },
        },
      },
    ]);

    const pendingEarnings = pendingCommissions[0]?.total || 0;

    // Earned but not withdrawn
    const earnedCommissions = await ReferralCommission.aggregate([
      {
        $match: { referrerId: userId, status: 'earned' },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$commissionAmount' },
        },
      },
    ]);

    const availableEarnings = earnedCommissions[0]?.total || 0;

    res.json({
      success: true,
      data: {
        referralStats: {
          tier1Count: tier1Referrals,
          tier2Count,
          totalReferrals: tier1Referrals + tier2Count,
        },
        commissions: {
          tier1: parseFloat(commissionByTier.tier1.toFixed(2)),
          tier2: parseFloat(commissionByTier.tier2.toFixed(2)),
          tier3: parseFloat(commissionByTier.tier3.toFixed(2)),
          total: parseFloat(
            (commissionByTier.tier1 + commissionByTier.tier2 + commissionByTier.tier3).toFixed(2)
          ),
        },
        pending: parseFloat(pendingEarnings.toFixed(2)),
        available: parseFloat(availableEarnings.toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get referral tree/network
exports.getReferralTree = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('referralCode');

    if (!user || !user.referralCode) {
      return res.json({ success: true, data: { tier1: [], tier2: [] } });
    }

    // Get tier 1 (direct referrals)
    const tier1Users = await User.find({ referredBy: user.referralCode })
      .select('name email referralCode referralEarnings')
      .lean();

    // Get tier 2 (referrals of referrals)
    const tier1Codes = tier1Users.map((u) => u.referralCode);
    const tier2Users = await User.find({ referredBy: { $in: tier1Codes } })
      .select('name email referralCode referredBy')
      .lean();

    // Build tree structure
    const tier2ByReferrer = {};
    tier2Users.forEach((user) => {
      if (!tier2ByReferrer[user.referredBy]) {
        tier2ByReferrer[user.referredBy] = [];
      }
      tier2ByReferrer[user.referredBy].push(user);
    });

    const tier1WithTree = tier1Users.map((t1) => ({
      ...t1,
      tier2: tier2ByReferrer[t1.referralCode] || [],
    }));

    res.json({
      success: true,
      data: {
        tier1: tier1WithTree,
        tier2Count: tier2Users.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get referral leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { period = 'monthly', limit = 10 } = req.query;

    let query = { period };

    if (period === 'monthly') {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      query.month = { $gte: monthStart };
    }

    let leaderboard = await ReferralLeaderboard.findOne(query)
      .sort({ generatedAt: -1 })
      .lean();

    if (!leaderboard) {
      // Generate leaderboard on the fly
      const referralData = await ReferralCommission.aggregate([
        period === 'monthly'
          ? {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
              },
            }
          : { $match: {} },
        {
          $group: {
            _id: '$referrerId',
            totalCommission: { $sum: '$commissionAmount' },
            referralCount: { $sum: 1 },
          },
        },
        { $sort: { totalCommission: -1 } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo',
          },
        },
        { $unwind: '$userInfo' },
        {
          $project: {
            userId: '$_id',
            userName: '$userInfo.name',
            referralCount: 1,
            totalCommission: 1,
          },
        },
      ]);

      leaderboard = {
        period,
        entries: referralData.slice(0, limit).map((entry, idx) => ({
          ...entry,
          rank: idx + 1,
        })),
      };
    }

    res.json({ success: true, data: leaderboard.entries.slice(0, limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's rank on leaderboard
exports.getUserRank = async (req, res) => {
  try {
    const userId = req.user._id;

    const rank = await ReferralCommission.aggregate([
      {
        $group: {
          _id: '$referrerId',
          totalCommission: { $sum: '$commissionAmount' },
        },
      },
      { $sort: { totalCommission: -1 } },
      {
        $facet: {
          userRank: [
            { $match: { _id: userId } },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user',
              },
            },
          ],
          ranking: [
            {
              $group: {
                _id: null,
                usersBefore: { $sum: { $cond: [{ $gt: ['$totalCommission', 0] }, 1, 0] } },
              },
            },
          ],
        },
      },
    ]);

    const userRank = rank[0]?.userRank[0] || null;
    const ranking = rank[0]?.ranking[0]?.usersBefore || 0;

    res.json({
      success: true,
      data: {
        rank: ranking + 1,
        totalEarnings: userRank?.totalCommission || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get achievements/badges
exports.getAchievements = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const tier1Count = await User.countDocuments({ referredBy: user.referralCode });

    const badges = [];

    // Referral milestones
    if (tier1Count >= 1) badges.push({ name: 'First Referral', icon: '🎉', tier: 'bronze' });
    if (tier1Count >= 5) badges.push({ name: 'Referral Booster', icon: '⭐', tier: 'silver' });
    if (tier1Count >= 10)
      badges.push({ name: 'Referral Master', icon: '👑', tier: 'gold' });
    if (tier1Count >= 25)
      badges.push({ name: 'Referral Legend', icon: '🏆', tier: 'platinum' });

    // Earnings milestones
    if (user.referralEarnings >= 1000)
      badges.push({ name: '₹1K Earner', icon: '💰', tier: 'silver' });
    if (user.referralEarnings >= 5000)
      badges.push({ name: '₹5K Earner', icon: '💎', tier: 'gold' });
    if (user.referralEarnings >= 10000)
      badges.push({ name: '₹10K Earner', icon: '🌟', tier: 'platinum' });

    res.json({ success: true, data: badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate referral marketing materials
exports.getMarketingMaterials = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const referralUrl = `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`;
    const socialTexts = {
      twitter: `Join our amazing digital marketing platform and earn 10% commission on every referral! Use my code: ${user.referralCode}`,
      facebook: `Earning passive income has never been easier! Join ${user.name}'s referral network and get up to 10% commission. Link: ${referralUrl}`,
      whatsapp: `Hey! I'm earning great commissions by referring users to a digital marketing platform. Use my code: ${user.referralCode} and start earning too!`,
      email: `Subject: Earn 10% Commission - Join My Referral Network\n\nHi there,\n\nI'm earning amazing commissions by referring users to a digital marketing platform.\n\nUse my referral code: ${user.referralCode}\nOr click here: ${referralUrl}\n\nEarn 10% on every purchase your referrals make!\n\nBest regards`,
    };

    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralUrl,
        socialTexts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get commission history
exports.getCommissionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;

    let query = { referrerId: req.user._id };
    if (status !== 'all') {
      query.status = status;
    }

    const commissions = await ReferralCommission.find(query)
      .populate('referredUserId', 'name email')
      .populate('orderId', '_id amount')
      .sort({ earnedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ReferralCommission.countDocuments(query);

    res.json({
      success: true,
      data: commissions,
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
