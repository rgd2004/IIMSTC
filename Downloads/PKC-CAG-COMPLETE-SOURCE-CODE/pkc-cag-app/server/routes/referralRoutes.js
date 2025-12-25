const router = require("express").Router();
const { protect, admin } = require("../middleware/auth");
const {
  getReferralInfo,
  requestWithdrawal,
  approveWithdrawal,
  declineWithdrawal
} = require("../controllers/referralController");

router.get("/info", protect, getReferralInfo);
router.post("/withdraw", protect, requestWithdrawal);
router.put("/approve/:userId/:requestId", protect, admin, approveWithdrawal);
router.put("/decline/:userId/:requestId", protect, admin, declineWithdrawal);

module.exports = router;
