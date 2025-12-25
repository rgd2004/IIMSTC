// server/routes/marketplaceRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

// Import controllers
const jobController = require('../controllers/jobController');
const applicationController = require('../controllers/applicationController');
const contractController = require('../controllers/contractController');
const freelancerProfileController = require('../controllers/freelancerProfileController');
const disputeController = require('../controllers/disputeController');

// ============ JOB ROUTES ============

// Client: Post a job
router.post('/jobs/create', protect, jobController.createJob);

// Client: Get my jobs
router.get('/jobs/my-jobs', protect, jobController.getMyJobs);

// Client: Update job
router.put('/jobs/:jobId', protect, jobController.updateJob);

// Client: Delete job
router.delete('/jobs/:jobId', protect, jobController.deleteJob);

// Freelancer: Browse jobs
router.get('/jobs/browse', jobController.browseJobs);

// Get job by ID
router.get('/jobs/:jobId', jobController.getJobById);

// Client: Get job applications
router.get('/jobs/:jobId/applications', protect, jobController.getJobApplications);

// Client: Select freelancer
router.post('/jobs/select-freelancer', protect, jobController.selectFreelancer);

// Client: Complete job
router.put('/jobs/:jobId/complete', protect, jobController.completeJob);

// Client: Cancel job
router.put('/jobs/:jobId/cancel', protect, jobController.cancelJob);

// ============ APPLICATION ROUTES ============

// Freelancer: Submit application
router.post('/applications/submit', protect, applicationController.submitApplication);

// Freelancer: Get my applications
router.get('/applications/my-applications', protect, applicationController.getMyApplications);

// Get application by ID
router.get('/applications/:applicationId', protect, applicationController.getApplicationById);

// Freelancer: Withdraw application
router.put('/applications/:applicationId/withdraw', protect, applicationController.withdrawApplication);

// Client: Reject application
router.put('/applications/:applicationId/reject', protect, applicationController.rejectApplication);

// Rate application (after contract completion)
router.post('/applications/:applicationId/rate', protect, applicationController.rateApplication);

// ============ CONTRACT ROUTES ============

// Create contract (when freelancer is selected)
router.post('/contracts/create', protect, contractController.createContract);

// Get my contracts
router.get('/contracts/my-contracts', protect, contractController.getMyContracts);

// Get contract by ID
router.get('/contracts/:contractId', protect, contractController.getContractById);

// Process payment
router.post('/contracts/:contractId/payment', protect, contractController.processPayment);

// Complete contract
router.put('/contracts/:contractId/complete', protect, contractController.completeContract);

// Cancel contract
router.put('/contracts/:contractId/cancel', protect, contractController.cancelContract);

// Rate freelancer
router.post('/contracts/:contractId/rate', protect, contractController.rateFreelancer);

// ============ FREELANCER PROFILE ROUTES ============

// Get my profile
router.get('/profile/my-profile', protect, freelancerProfileController.getMyProfile);

// Create profile
router.post('/profile/create', protect, freelancerProfileController.createProfile);

// Update profile
router.put('/profile/update', protect, freelancerProfileController.updateProfile);

// Browse talent (must be BEFORE /:userId route)
router.get('/profile/browse-talent', freelancerProfileController.browseTalent);

// Add portfolio item
router.post('/profile/portfolio/add', protect, freelancerProfileController.addPortfolio);

// Remove portfolio item
router.delete('/profile/portfolio/:portfolioId', protect, freelancerProfileController.removePortfolio);

// Add certification
router.post('/profile/certification/add', protect, freelancerProfileController.addCertification);

// Get freelancer stats
router.get('/profile/stats', protect, freelancerProfileController.getFreelancerStats);

// Get profile by user ID (must be LAST for this group)
router.get('/profile/:userId', freelancerProfileController.getProfileById);

// ============ DISPUTE ROUTES ============

// Create dispute
router.post('/disputes/create', protect, disputeController.createDispute);

// Get my disputes
router.get('/disputes/my-disputes', protect, disputeController.getMyDisputes);

// Get dispute by ID
router.get('/disputes/:disputeId', protect, disputeController.getDisputeById);

// Submit response to dispute
router.post('/disputes/:disputeId/respond', protect, disputeController.submitResponse);

// ============ ADMIN: DISPUTE MANAGEMENT ============

// Admin: Get all disputes
router.get('/admin/disputes', protect, admin, disputeController.getAllDisputes);

// Admin: Assign dispute
router.put('/admin/disputes/:disputeId/assign', protect, admin, disputeController.assignDispute);

// Admin: Resolve dispute
router.put('/admin/disputes/:disputeId/resolve', protect, admin, disputeController.resolveDispute);

// Admin: Get dispute stats
router.get('/admin/disputes/stats', protect, admin, disputeController.getDisputeStats);

module.exports = router;
