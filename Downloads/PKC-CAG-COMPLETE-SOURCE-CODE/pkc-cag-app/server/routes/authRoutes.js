const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const passport = require('passport');
const { protect } = require('../middleware/auth');

// AUTH ROUTES
router.post('/register', auth.register);
router.post('/verify-otp', auth.verifyOTP);
router.post('/resend-otp', auth.resendOTP);
router.post('/login', auth.login);
router.get('/me', protect, auth.getMe);

// PASSWORD MANAGEMENT
router.post('/change-password', protect, auth.changePassword); // For authenticated users
router.post('/forgot-password', auth.forgotPassword); // Send temp password via email
router.post('/reset-password', auth.resetPassword); // Alternative method (backward compatibility)

// Google OAuth
router.get('/google', (req, res, next) => {
  console.log("🔐 Google OAuth route hit - starting Passport auth");
  console.log("   Callback URL configured:", process.env.GOOGLE_CALLBACK_URL);
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  (req, res, next) => {
    console.log("🔐 Google callback route hit - processing...");
    next();
  },
  passport.authenticate('google', { failureRedirect: '/login' }),
  auth.googleAuthSuccess
);

module.exports = router;
