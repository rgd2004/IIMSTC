// ---------------------------------------------
// LOAD ENV
// ---------------------------------------------
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

console.log("🔑 RAZORPAY KEY:", process.env.RAZORPAY_KEY_ID);
console.log("🔐 RAZORPAY SECRET:", process.env.RAZORPAY_SECRET);

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const connectDB = require('./config/database');
const passport = require('./config/passport');

const app = express();

// Enable proxy support (for production hosting)
app.set("trust proxy", 1);

console.log("📌 Connecting to DB:", process.env.MONGODB_URI);
connectDB();

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased from 100 to 500 requests per 15 minutes for development
  message: 'Too many requests from this IP, please try again later.'
});

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000 }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('✅ Static uploads folder configured:', path.join(__dirname, 'uploads'));

// REQUEST LOGGING - Log original URL
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.originalUrl}`);
  if (req.method === 'POST' && req.originalUrl.includes('/orders/create')) {
    console.log("   Body received:", JSON.stringify(req.body, null, 2).substring(0, 500));
  }
  next();
});

// ROUTES
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use("/api/referral", require("./routes/referralRoutes"));
app.use("/api/withdrawals", require("./routes/withdrawalRoutes"));
app.use("/api/updates", require("./routes/updateRoutes"));
app.use('/api/user-profile', require('./routes/userProfileRoutes'));
app.use('/api/job-assistant', require('./routes/jobAssistantRoutes'));

// NEW ROUTES (Features Implementation)
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/referral-advanced', require('./routes/advancedReferralRoutes'));
app.use('/api/admin-enhanced', require('./routes/adminEnhancedRoutes'));
app.use('/api/ebooks', require('./routes/ebookRoutes'));

// NEW ROUTES (Advanced Engagement Features)
app.use('/api/export', require('./routes/exportRoutes'));
app.use('/api/level', require('./routes/levelRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));
app.use('/api/messaging', require('./routes/messagingRoutes'));

// NEW ROUTES (Freelancer Marketplace)
app.use('/api/marketplace', require('./routes/marketplaceRoutes'));

// 💳 PAYMENT SYSTEM ROUTES
app.use('/api/payments', require('./routes/paymentRoutes'));

// 💼 JOB ASSISTANT ROUTES
app.use('/api/job-assistant', require('./routes/jobAssistantRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API running', time: new Date() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("🔥 FULL ERROR:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error'
  });
});

// 404 handler
app.use((req, res) => {
  console.error(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  console.error('Available routes start with: /api/auth, /api/services, /api/orders, /api/admin, etc.');
  res.status(404).json({
    success: false,
    message: 'Route not found: ' + req.path
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
});
