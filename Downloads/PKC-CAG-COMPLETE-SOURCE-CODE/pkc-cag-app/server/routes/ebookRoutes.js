const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { ebookUpload } = require('../config/multer');
const ebookController = require('../controllers/ebookController');

// Add logging middleware
router.use((req, res, next) => {
  console.log(`📚 EBook route: ${req.method} ${req.originalUrl} | Path: ${req.path}`);
  next();
});

// ==========================================
// ADMIN ROUTES (MUST BE BEFORE GENERIC ROUTES)
// ==========================================
router.post('/admin/create', protect, admin, ebookUpload.fields([
  { name: 'pdfFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), ebookController.createEBook);
router.get('/admin/all', protect, admin, (req, res, next) => {
  console.log('✅ MATCHED: GET /admin/all route');
  next();
}, ebookController.getAllEBooksAdmin);
router.put('/admin/:id', protect, admin, ebookUpload.fields([
  { name: 'pdfFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), ebookController.updateEBook);
router.delete('/admin/:id', protect, admin, ebookController.deleteEBook);
router.get('/admin/analytics', protect, admin, ebookController.getEbookAnalytics);

// ==========================================
// DEBUG ROUTE
// ==========================================
router.get('/debug/all', ebookController.debugAllEBooks);

// ==========================================
// USER ROUTES (SPECIFIC ROUTES BEFORE GENERIC)
// ==========================================
// Purchase e-book
router.post('/purchase/create', protect, ebookController.createPurchaseOrder);

// Verify payment
router.post('/purchase/verify', protect, ebookController.verifyPayment);

// Get user's purchased e-books
router.get('/my-ebooks', protect, ebookController.getMyEBooks);

// Download e-book
router.get('/purchase/:purchaseId/download', protect, ebookController.downloadEBook);

// Get all published e-books (storefront)
router.get('/', ebookController.getAllEBooks);

// Get single e-book details (MUST BE LAST)
router.get('/:id', ebookController.getEBook);

module.exports = router;
