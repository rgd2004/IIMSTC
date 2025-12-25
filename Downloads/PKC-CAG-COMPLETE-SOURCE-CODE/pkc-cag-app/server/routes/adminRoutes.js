const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  getAllJobs,
  deleteJob,
  deleteContract
} = require('../controllers/adminController');

const { markPaymentDone, closeContract } = require('../controllers/contractController');

const { protect, admin } = require('../middleware/auth');

// Admin-only endpoints
router.get('/stats', protect, admin, getStats);
// Quick admin ping for debugging/verification
router.get('/ping', protect, admin, (req, res) => {
  res.json({ success: true, user: req.user });
});
router.get('/users', protect, admin, getUsers);
router.put('/users/:id', protect, admin, updateUser);
router.delete('/users/:id', protect, admin, deleteUser);

// 🗑️ JOB & CONTRACT MANAGEMENT
router.get('/jobs', protect, admin, getAllJobs);
router.delete('/jobs/:jobId', protect, admin, deleteJob);
router.delete('/contracts/:contractId', protect, admin, deleteContract);

// 💳 PAYMENT & CONTRACT MANAGEMENT
router.put('/contracts/:contractId/mark-payment-done', protect, admin, markPaymentDone);
router.put('/contracts/:contractId/close', protect, admin, closeContract);

const { getLogs } = require('../controllers/auditController');
router.get('/logs', protect, admin, getLogs);

module.exports = router;
