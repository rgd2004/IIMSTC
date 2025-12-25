// server/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTPEmail, sendPasswordResetEmail, generateTemporaryPassword } = require('../utils/email');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ======================================================================
// ⭐ REGISTER (Normal users) - accepts optional referralCode
// ======================================================================
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, businessName, referralCode } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    console.log("📝 Registration attempt:", { name, email });

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.warn("⚠️ Email already exists:", email);
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Create user record. We pass referredBy only if provided.
    const payload = {
      name,
      email,
      password,
      phone,
      businessName,
    };

    if (referralCode && String(referralCode).trim() !== "") {
      payload.referredBy = String(referralCode).trim();
    }

    console.log("🔧 Creating user with payload:", payload);
    const user = await User.create(payload);
    console.log("✓ User created:", user._id);

    // generate OTP and save
    const otp = user.generateOTP();
    await user.save();
    console.log("✓ OTP generated for user:", email);

    // send OTP
    try {
      console.log("📧 Sending OTP email to:", email);
      await sendOTPEmail(email, otp, name);
      console.log("✓ OTP email sent successfully");
    } catch (err) {
      console.error("❌ OTP send failed during registration:", err.message);
      // do not fail registration just because email failed; but warn
    }

    res.status(201).json({
      success: true,
      message: "Registration successful. Check email for OTP.",
      userId: user._id
    });
  } catch (err) {
    console.error("❌ REGISTER ERROR:", err);
    res.status(500).json({ success: false, message: err.message || "Registration failed" });
  }
};

// ======================================================================
// ⭐ VERIFY OTP
// ======================================================================
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!user.verifyOTP(otp)) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Email verified",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified
      }
    });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ success: false, message: "OTP verification failed" });
  }
};

// ======================================================================
// ⭐ RESEND OTP
// ======================================================================
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = user.generateOTP();
    await user.save();

    await sendOTPEmail(user.email, otp, user.name);

    res.json({ success: true, message: "OTP resent" });
  } catch (err) {
    console.error("RESEND OTP ERROR:", err);
    res.status(500).json({ success: false, message: "Could not resend OTP" });
  }
};

// ======================================================================
// ⭐ LOGIN  – unchanged (keeps Google checks/admin behavior)
// ======================================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('📧 Login attempt:', { email, passwordLength: password?.length });

    // 1. Check email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    console.log('✅ User found:', email, 'isAdmin:', user.isAdmin);
    
    // 2. If admin → SKIP OTP & GOOGLE RESTRICTIONS
    if (user.isAdmin) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch)
        return res.status(401).json({ success: false, message: "Invalid email or password" });

      const token = generateToken(user._id);

      return res.json({
        success: true,
        message: "Admin login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          isVerified: true
        }
      });
    }

    // 3. If Google-only account
    if (user.googleId && !user.password) {
      return res.status(400).json({
        success: false,
        message: "Please login using Google"
      });
    }

    // 4. Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    // 5. If not verified → send OTP again
    if (!user.isVerified) {
      const otp = user.generateOTP();
      await user.save();
      await sendOTPEmail(user.email, otp, user.name);

      return res.status(403).json({
        success: false,
        message: "Please verify your email. OTP sent.",
        userId: user._id,
        requiresVerification: true
      });
    }

    // 6. Normal user login
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// ======================================================================
// ⭐ GET LOGGED-IN USER
// ======================================================================
exports.getMe = async (req, res) => {
  try {
    console.debug('getMe called, req.user:', req.user?.id);
    const user = await User.findById(req.user.id).select("-password");
    console.debug('getMe returning user:', user?._id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error loading user" });
  }
};

// ======================================================================
// ⭐ GOOGLE SUCCESS REDIRECT
// ======================================================================
exports.googleAuthSuccess = async (req, res) => {
  try {
    console.log("\n🔐 ========== GOOGLE AUTH SUCCESS ==========");
    
    if (!req.user) {
      console.error("❌ No user in req.user after Passport auth");
      console.error("   req.isAuthenticated():", req.isAuthenticated?.());
      console.error("   req.user:", req.user);
      const redirectUrl = `${process.env.FRONTEND_URL}/login?error=no_user`;
      console.log("🔐 ==========================================\n");
      return res.redirect(redirectUrl);
    }

    console.log("✅ User authenticated:", req.user.email);
    console.log("   User ID:", req.user._id);
    console.log("   Name:", req.user.name);
    
    const token = generateToken(req.user._id);
    console.log("✅ JWT token generated");
    
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/google/success?token=${token}`;
    console.log("✅ Redirecting to:", redirectUrl.substring(0, 50) + "...");
    console.log("🔐 ==========================================\n");
    
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("❌ Google auth success error:", err.message);
    console.error("   Stack:", err.stack);
    const redirectUrl = `${process.env.FRONTEND_URL}/login?error=auth_failed`;
    console.log("🔐 ==========================================\n");
    return res.redirect(redirectUrl);
  }
};

// ======================================================================
// ⭐ CHANGE PASSWORD (Authenticated User)
// ======================================================================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Current password and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "New password must be at least 6 characters" 
      });
    }

    // Get user from request (set by protect middleware)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Current password is incorrect" 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save(); // Pre-save hook will hash the new password

    console.log("✓ Password changed for user:", user.email);
    res.json({ 
      success: true, 
      message: "Password changed successfully" 
    });

  } catch (err) {
    console.error("❌ CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to change password" });
  }
};

// ======================================================================
// ⭐ FORGOT PASSWORD (Send reset email with temporary password)
// ======================================================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists (security best practice)
      return res.json({ 
        success: true, 
        message: "If an account with this email exists, a password reset link has been sent." 
      });
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Save temporary password (hashed) to user record
    user.password = temporaryPassword;
    await user.save(); // Pre-save hook will hash the password

    console.log("✓ Temporary password generated for:", email);

    // Send email with temporary password
    const emailResult = await sendPasswordResetEmail(user.email, user.name, temporaryPassword);

    if (!emailResult.success) {
      console.warn("⚠️ Email send failed, but temporary password was saved:", email);
      // Still return success because password was set
    }

    res.json({ 
      success: true, 
      message: "Password reset instructions have been sent to your email. Check your inbox for your temporary password." 
    });

  } catch (err) {
    console.error("❌ FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to process password reset" });
  }
};

// ======================================================================
// ⭐ RESET PASSWORD (Deprecated - now user changes via profile)
// ⭐ Kept for backward compatibility but recommend using change-password
// ======================================================================
exports.resetPassword = async (req, res) => {
  try {
    const { email, temporaryPassword, newPassword } = req.body;

    if (!email || !temporaryPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, temporary password, and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "New password must be at least 6 characters" 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify temporary password
    const isMatch = await user.comparePassword(temporaryPassword);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Temporary password is incorrect" 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save(); // Pre-save hook will hash the new password

    console.log("✓ Password reset successful for user:", user.email);
    res.json({ 
      success: true, 
      message: "Password reset successful. You can now login with your new password." 
    });

  } catch (err) {
    console.error("❌ RESET PASSWORD ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};
