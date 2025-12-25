const express = require("express");
const router = express.Router();

const {
  requestWithdrawal,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
} = require("../controllers/withdrawalController"); // ✅ EXACT MATCH

const { protect, admin } = require("../middleware/auth");

// USER → Request withdrawal
router.post("/request", protect, requestWithdrawal);

// ADMIN → Get all withdrawal requests
router.get("/all", protect, admin, getAllWithdrawals);

// ADMIN → Approve withdrawal
router.put("/approve/:id", protect, admin, approveWithdrawal);

// ADMIN → Reject withdrawal
router.put("/reject/:id", protect, admin, rejectWithdrawal);

module.exports = router;
