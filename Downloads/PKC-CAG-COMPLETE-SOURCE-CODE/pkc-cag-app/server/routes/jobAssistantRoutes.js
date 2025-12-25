const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const jobAssistantController = require('../controllers/jobAssistantController');
const { upload } = require('../config/multer');

// Middleware to check if admin
const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  next();
};

// Public route - submit application
router.post(
  '/submit',
  upload.single('resume'),
  jobAssistantController.submitJobApplication
);

// Public route - get application status by ID
router.get(
  '/status/:id',
  jobAssistantController.getApplicationStatus
);

// Protected route - get user's own applications
router.get(
  '/my-applications',
  protect,
  jobAssistantController.getMyApplications
);

// Admin routes
router.get(
  '/admin/all',
  protect,
  adminOnly,
  jobAssistantController.getAllApplications
);

router.get(
  '/admin/stats',
  protect,
  adminOnly,
  jobAssistantController.getApplicationStats
);

router.get(
  '/admin/:id',
  protect,
  adminOnly,
  jobAssistantController.getApplicationById
);

router.patch(
  '/admin/:id/status',
  protect,
  adminOnly,
  jobAssistantController.updateApplicationStatus
);

router.patch(
  '/admin/:id/contacted',
  protect,
  adminOnly,
  jobAssistantController.markAsContacted
);

router.get(
  '/admin/:id/download-resume',
  protect,
  adminOnly,
  jobAssistantController.downloadResume
);

router.delete(
  '/admin/:id',
  protect,
  adminOnly,
  jobAssistantController.deleteApplication
);

module.exports = router;
