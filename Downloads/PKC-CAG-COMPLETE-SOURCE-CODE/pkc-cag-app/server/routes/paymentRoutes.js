const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/auth');

// ===== RAZORPAY PAYMENT ROUTES =====
// Test endpoint - check if Razorpay is configured
router.get('/test', paymentController.testRazorpay);

// Test payment endpoint - for development/testing (updates contract like real payment)
router.post('/test-payment/:contractId', protect, paymentController.testPaymentComplete);

// Create Razorpay order
router.post('/razorpay/create-order/:contractId', protect, paymentController.createPaymentOrder);

// Verify Razorpay payment
router.post('/razorpay/verify/:contractId', protect, paymentController.verifyRazorpayPayment);

// Client routes
// Record payment from client to admin (Legacy - for manual payments)
router.post('/contracts/:contractId/record-payment', protect, paymentController.recordClientPayment);

// Client requests fund release to freelancer
router.post('/contracts/:contractId/release-funds', protect, paymentController.requestFundRelease);

// Client requests refund
router.post('/contracts/:contractId/request-refund', protect, paymentController.requestRefund);

// Get payment status for a contract (for client/freelancer)
router.get('/contracts/:contractId/status', protect, paymentController.getContractPaymentStatus);

// Admin routes
// Get all payment requests (fund releases & refunds)
router.get('/requests', protect, admin, paymentController.getPaymentRequests);

// Approve fund release - pays freelancer
router.put('/requests/:requestId/approve-release', protect, admin, paymentController.approveFundRelease);

// Reject fund release
router.put('/requests/:requestId/reject-release', protect, admin, paymentController.rejectFundRelease);

// Approve refund - returns money to client
router.put('/requests/:requestId/approve-refund', protect, admin, paymentController.approveRefund);

// Deny refund
router.put('/requests/:requestId/deny-refund', protect, admin, paymentController.denyRefund);

// Mark payment as sent to freelancer
router.put('/requests/:requestId/mark-payment-sent', protect, admin, paymentController.markPaymentSent);

// Freelancer Application Routes
// Submit freelancer application with payment details
router.post('/applications/:jobId/apply', protect, paymentController.submitFreelancerApplication);

// Work Submission Routes
// Submit work details after client payment
router.post('/contracts/:contractId/submit-work', protect, paymentController.submitWorkDetails);

// Get all contracts for admin (Work Submissions page)
router.get('/contracts', protect, admin, paymentController.getAllContracts);

// Get single contract by ID for admin
router.get('/contracts/:contractId', protect, admin, paymentController.getContractById);

// Update contract status (approve/reject work)
router.put('/contracts/:contractId/status', protect, admin, paymentController.updateContractStatus);

// TEST: Reassign freelancer on contract (for fixing mismatched contracts)
router.put('/contracts/:contractId/reassign-freelancer', protect, admin, paymentController.reassignFreelancer);

module.exports = router;
