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

// Important for Render / reverse proxies
app.set("trust proxy", 1);

// ---------------------------------------------
// DATABASE
// ---------------------------------------------
console.log("📌 Connecting to DB:", process.env.MONGODB_URI);
connectDB();

// ---------------------------------------------
// SECURITY
// ---------------------------------------------

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many requests from this IP, please try again later."
});

app.use(helmet());

// ---------------------------------------------
// ✅ FINAL CORS CONFIG (PRODUCTION + PREVIEWS)
// ---------------------------------------------
const allowedOrigins = [
  "https://pkccag.com",
  "https://www.pkccag.com",
  "https://api.pkccag.com",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / Postman
      if (!origin) return callback(null, true);

      // Allow production domains
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow ALL Vercel preview deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
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
app.use("/api/marketplace", require("./routes/marketplaceRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

// ---------------------------------------------
// TEST EMAIL ENDPOINT (DEBUGGING)
// This endpoint checks email configuration without sending
app.post("/api/test-email-config", (req, res) => {
  try {
    console.log("🧪 Checking email configuration...");
    
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    console.log("EMAIL_USER set:", !!emailUser);
    console.log("EMAIL_PASS set:", !!emailPass);
    console.log("EMAIL_USER value:", emailUser);
    console.log("EMAIL_PASS length:", emailPass ? emailPass.length : 0);
    
    res.json({
      success: true,
      message: "Email configuration check",
      config: {
        EMAIL_USER_SET: !!emailUser,
        EMAIL_USER_VALUE: emailUser || "NOT SET",
        EMAIL_PASS_LENGTH: emailPass ? emailPass.length : 0,
        EMAIL_PASS_SET: !!emailPass
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// TEST EMAIL ENDPOINT (DEBUGGING)
// This endpoint attempts to send a test email
app.post("/api/test-email", async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email address required"
    });
  }

  // Set a response timeout of 35 seconds
  req.setTimeout(35000);
  res.setTimeout(35000);

  try {
    console.log("🧪 Testing email to:", email);
    
    const { sendEmail } = require("./utils/email");
    
    const result = await sendEmail({
      email: email,
      subject: "🧪 PKC CAG Test Email",
      html: `
        <h2>✅ Test Email from PKC CAG</h2>
        <p>If you received this email, the email system is working correctly!</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p>This is a test email from your PKC CAG server.</p>
        <p style="color: #667eea; font-weight: bold;">Email system is operational!</p>
      `
    });

    console.log("✅ Test email result:", result);
    
    res.json({
      success: true,
      message: "Test email sent successfully",
      email: email,
      result: result
    });

  } catch (error) {
    console.error("❌ Test email error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({
      success: false,
      message: "Test email failed",
      error: error.message,
      details: error.toString()
    });
  }
});

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
  console.log("🌐 Allowed production origins:", allowedOrigins);
  console.log("🌐 Allowed preview origins: *.vercel.app");
});
