const User = require("../models/User");

// GET REFERRAL DASHBOARD INFO
exports.getReferralInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "referralCode referralEarnings referredBy withdrawalRequests"
    );

    res.json({ success: true, user });
  } catch (err) {
    res.json({ success: false, message: "Failed to load referral info" });
  }
};

// USER REQUESTS WITHDRAWAL
exports.requestWithdrawal = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { upiId } = req.body;

    if (!upiId) {
      return res.json({ success: false, message: "UPI ID required" });
    }

    if (user.referralEarnings < 100) {
      return res.json({
        success: false,
        message: "Minimum ₹100 required to withdraw",
      });
    }

    user.withdrawalRequests.push({
      amount: user.referralEarnings,
      upiId,
      status: "pending",
    });

    await user.save();

    return res.json({
      success: true,
      message: "Withdrawal request sent successfully",
    });
  } catch (err) {
    res.json({ success: false, message: "Failed to send request" });
  }
};

// ADMIN APPROVES WITHDRAWAL
exports.approveWithdrawal = async (req, res) => {
  try {
    const { userId, requestId } = req.params;
    const user = await User.findById(userId);

    const request = user.withdrawalRequests.id(requestId);
    if (!request) return res.json({ success: false, message: "Request not found" });

    request.status = "approved";
    user.referralEarnings = 0;
    await user.save();

    res.json({ success: true, message: "Withdrawal approved" });
  } catch (err) {
    res.json({ success: false, message: "Approval failed" });
  }
};

// ADMIN DECLINES WITHDRAWAL
exports.declineWithdrawal = async (req, res) => {
  try {
    const { userId, requestId } = req.params;
    const user = await User.findById(userId);

    const request = user.withdrawalRequests.id(requestId);
    if (!request) return res.json({ success: false, message: "Request not found" });

    request.status = "declined";
    await user.save();

    res.json({ success: true, message: "Withdrawal declined" });
  } catch {
    res.json({ success: false, message: "Decline failed" });
  }
};
