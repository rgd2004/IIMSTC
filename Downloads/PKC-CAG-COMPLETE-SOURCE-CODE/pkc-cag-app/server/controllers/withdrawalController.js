const WithdrawalRequest = require("../models/WithdrawalRequest");
const User = require("../models/User");
const { sendWithdrawalApprovedEmail, sendWithdrawalRejectedEmail } = require("../utils/email");

/* -------------------------------------------------------
   1️⃣ USER REQUESTS WITHDRAWAL
-------------------------------------------------------- */
exports.requestWithdrawal = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.referralEarnings < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum ₹100 referral earnings required to withdraw",
      });
    }

    const { upiId, bankName, accountNumber, ifscCode } = req.body;

    const withdrawal = await WithdrawalRequest.create({
      userId: user._id,
      amount: user.referralEarnings,
      paymentDetails: { upiId, bankName, accountNumber, ifscCode },
    });

    return res.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      withdrawal,
    });
  } catch (err) {
    console.error("Withdrawal request error:", err);
    res.status(500).json({ success: false, message: "Failed to request withdrawal" });
  }
};

/* -------------------------------------------------------
   2️⃣ ADMIN GET ALL WITHDRAWAL REQUESTS
-------------------------------------------------------- */
exports.getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await WithdrawalRequest.find()
      .populate("userId", "name email referralEarnings")
      .sort({ createdAt: -1 });

    res.json({ success: true, withdrawals });
  } catch (err) {
    console.error("Get withdrawals error:", err);
    res.status(500).json({ success: false, message: "Failed to load withdrawals" });
  }
};

/* -------------------------------------------------------
   3️⃣ ADMIN APPROVES WITHDRAWAL
-------------------------------------------------------- */
exports.approveWithdrawal = async (req, res) => {
  try {
    const withdrawal = await WithdrawalRequest.findById(req.params.id);

    if (!withdrawal)
      return res.status(404).json({ success: false, message: "Request not found" });

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ success: false, message: "Already processed" });
    }

    const user = await User.findById(withdrawal.userId);

    // Deduct earnings
    user.referralEarnings -= withdrawal.amount;
    await user.save();

    withdrawal.status = "approved";
    withdrawal.adminNote = req.body.adminNote || "Payment completed";
    await withdrawal.save();

    // 📧 Send approval email notification
    await sendWithdrawalApprovedEmail(user.email, user.name, withdrawal.amount);

    res.json({ success: true, message: "Withdrawal approved", withdrawal });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ success: false, message: "Failed to approve withdrawal" });
  }
};

/* -------------------------------------------------------
   4️⃣ ADMIN REJECTS WITHDRAWAL
-------------------------------------------------------- */
exports.rejectWithdrawal = async (req, res) => {
  try {
    const withdrawal = await WithdrawalRequest.findById(req.params.id);

    if (!withdrawal)
      return res.status(404).json({ success: false, message: "Request not found" });

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ success: false, message: "Already processed" });
    }

    const user = await User.findById(withdrawal.userId);
    withdrawal.status = "rejected";
    withdrawal.adminNote = req.body.adminNote || "Rejected by admin";
    await withdrawal.save();

    // 📧 Send rejection email notification
    await sendWithdrawalRejectedEmail(user.email, user.name, withdrawal.amount, withdrawal.adminNote);

    res.json({ success: true, message: "Withdrawal rejected", withdrawal });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ success: false, message: "Failed to reject withdrawal" });
  }
};
