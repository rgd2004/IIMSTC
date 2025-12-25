require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Debug logs
console.log("\n🔐 ========== PASSPORT GOOGLE CONFIG ==========");
console.log("   GOOGLE_CLIENT_ID =", process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing");
console.log("   GOOGLE_CLIENT_SECRET =", process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing");
console.log("   GOOGLE_CALLBACK_URL =", process.env.GOOGLE_CALLBACK_URL || "❌ Missing");
console.log("   FRONTEND_URL =", process.env.FRONTEND_URL || "❌ Missing");
console.log("🔐 ==========================================\n");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("\n🔐 ========== GOOGLE OAUTH CALLBACK ==========");
        console.log("✅ Google OAuth callback received");
        console.log("   Display Name:", profile.displayName);
        console.log("   ID:", profile.id);
        const email = profile.emails?.[0]?.value;
        console.log("   Email:", email || "❌ NOT FOUND");

        if (!email) {
          console.error("❌ No email in Google profile:", profile);
          return done(new Error("No email in Google profile"), null);
        }

        // Find existing user
        let user = await User.findOne({ email });

        if (!user) {
          console.log("📝 Creating new Google user:", email);
          // Create new Google user
          user = await User.create({
            name: profile.displayName,
            email: email,
            googleId: profile.id,
            isVerified: true,
            avatar: profile.photos?.[0]?.value || ""
          });
          console.log("✅ New user created:", user._id);
        } else {
          console.log("✅ Found existing user:", email);
          // Update googleId if not set
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
            console.log("✅ Updated googleId for user");
          }
        }

        console.log("🔐 ==========================================\n");
        return done(null, user);
      } catch (error) {
        console.error("❌ Google OAuth error:", error.message);
        console.error("   Stack:", error.stack);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      console.warn("⚠️ User not found during deserialization:", id);
      return done(new Error("User not found"));
    }
    done(null, user);
  } catch (err) {
    console.error("❌ Deserialization error:", err);
    done(err, null);
  }
});

module.exports = passport;
