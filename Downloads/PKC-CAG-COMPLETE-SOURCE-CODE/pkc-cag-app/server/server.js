// ---------------------------------------------
// LOAD ENV
// ---------------------------------------------
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// ---------------------------------------------
// IMPORTS
// ---------------------------------------------
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");

const connectDB = require("./config/database");
const passport = require("./config/passport");

// ---------------------------------------------
// APP INIT
// ---------------------------------------------
const app = express();
app.set("trust proxy", 1);

// ---------------------------------------------
// DATABASE
// ---------------------------------------------
console.log("📌 Connecting to DB:", process.env.MONGODB_URI);
connectDB();

// ---------------------------------------------
// SECURITY
// ---------------------------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many requests from this IP, please try again later."
});

app.use(helmet());

// ---------------------------------------------
// ✅ FINAL CORS CONFIG
// ---------------------------------------------
const allowedOrigins = [
  "https://pkccag.com",
  "https://www.pkccag.com",
  "https://api.pkccag.com",
  "http://localhost:3000",
  "http://localhost:5000"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (origin.endsWith(".vercel.app")) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ---------------------------------------------
// BODY PARSERS
// ---------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// ---------------------------------------------
// STATIC FILES
// ---------------------------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
console.log("✅ Static uploads folder:", path.join(__dirname, "uploads"));

// ---------------------------------------------
// SESSIONS
// ---------------------------------------------
app.use(
  session({
    name: "pkc-cag.sid",
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

// ---------------------------------------------
// PASSPORT
// ---------------------------------------------
app.use(passport.initialize());
app.use(passport.session());

// ---------------------------------------------
// REQUEST LOGGING
// ---------------------------------------------
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.originalUrl}`);
  next();
});

// ---------------------------------------------
// 🔥 CRITICAL FIX: DOUBLE /api/api REWRITE
// MUST BE BEFORE ROUTES
// ---------------------------------------------
app.use((req, res, next) => {
  if (req.url.startsWith("/api/api/")) {
    console.warn("⚠️ Rewriting double /api:", req.url);
    req.url = req.url.replace("/api/api/", "/api/");
  }
  next();
});

// ---------------------------------------------
// ROUTES
// ---------------------------------------------
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/referral", require("./routes/referralRoutes"));
app.use("/api/withdrawals", require("./routes/withdrawalRoutes"));
app.use("/api/updates", require("./routes/updateRoutes"));
app.use("/api/user-profile", require("./routes/userProfileRoutes"));
// Job Assistant API (kept) - separate from freelancing marketplace
app.use("/api/job-assistant", require("./routes/jobAssistantRoutes"));

app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/referral-advanced", require("./routes/advancedReferralRoutes"));
app.use("/api/admin-enhanced", require("./routes/adminEnhancedRoutes"));
app.use("/api/ebooks", require("./routes/ebookRoutes"));
app.use("/api/export", require("./routes/exportRoutes"));
app.use("/api/level", require("./routes/levelRoutes"));
app.use("/api/activity", require("./routes/activityRoutes"));
app.use("/api/messaging", require("./routes/messagingRoutes"));
// Freelancing marketplace routes disabled
// app.use("/api/marketplace", require("./routes/marketplaceRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

// ---------------------------------------------
// HEALTH CHECK
// ---------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API running",
    time: new Date()
  });
});

// ---------------------------------------------
// ERROR HANDLER
// ---------------------------------------------
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error"
  });
});

// ---------------------------------------------
// 404 HANDLER
// ---------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.path}`
  });
});

// ---------------------------------------------
// START SERVER
// ---------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🌐 Allowed origins:", allowedOrigins);
  console.log("🌐 Vercel previews allowed (*.vercel.app)");
});
