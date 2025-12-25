const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =============================
// 🔒 PROTECT MIDDLEWARE
// =============================
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Get Bearer Token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Access denied.",
      });
    }

    // 2️⃣ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.warn("Auth middleware: token verification failed:", err.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // 3️⃣ Fetch real user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    console.debug(`Auth middleware: authenticated user id=${user._id}, isAdmin=${user.isAdmin}`);

    req.user = user; // store full user object
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ success: false, message: "Authentication failed" });
  }
};

// =============================
// 👑 ADMIN MIDDLEWARE
// =============================
exports.admin = (req, res, next) => {
  try {
    console.log('🔒 Admin middleware check:');
    console.log('  - User ID:', req.user?._id);
    console.log('  - isAdmin:', req.user?.isAdmin);
    console.log('  - Type:', typeof req.user?.isAdmin);
    
    if (!req.user || !req.user.isAdmin) {
      console.warn('❌ Admin access denied for user:', req.user?._id);
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }
    console.log('✅ Admin access granted');
    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ success: false, message: "Admin authorization failed" });
  }
};

// =============================
// ✉ VERIFIED USERS ONLY
// =============================
exports.verified = (req, res, next) => {
  if (!req.user?.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email to continue",
    });
  }
  next();
};
