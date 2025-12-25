// server/routes/exportRoutes.js
const express = require('express');
const { protect } = require('../middleware/auth');
const {
  requestExport,
  getExportHistory,
  setupScheduledExport,
  cancelScheduledExport,
} = require('../controllers/exportController');

const router = express.Router();

// Protected routes (User must be logged in)
router.post('/request', protect, requestExport);
router.get('/history', protect, getExportHistory);
router.post('/schedule', protect, setupScheduledExport);
router.put('/:exportId/cancel', protect, cancelScheduledExport);

module.exports = router;
