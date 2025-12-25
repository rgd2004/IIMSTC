const express = require('express');
const router = express.Router();

const {
  getAllServices,
  getService,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');

const { protect, admin } = require('../middleware/auth');

// -------------------------------
// ⭐ PUBLIC ROUTES
// -------------------------------
router.get('/', getAllServices);
router.get('/:id', getService);

// Admin utility: backfill missing serviceIds
router.post('/admin/backfill-ids', protect, admin, require('../controllers/serviceController').backfillServiceIds);

// -------------------------------
// ⭐ ADMIN ROUTES
// -------------------------------
router.post('/', protect, admin, createService);
router.put('/:id', protect, admin, updateService);
router.delete('/:id', protect, admin, deleteService);

module.exports = router;
