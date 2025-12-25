/* server/scripts/resetAdmin.js */
require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function run() {
  try {
    console.log("🔌 Connecting to MongoDB…");
    await mongoose.connect(process.env.MONGODB_URI);

    const email = "pkccag@gmail.com";
    const newPassword = "Smitha@1022";

    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ Admin not found!");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    user.password = hash;
    user.isAdmin = true;
    user.isVerified = true;

    await user.save();

    console.log("✅ Admin password reset successfully!");
    console.log("📌 Login email:", email);
    console.log("📌 New Password:", newPassword);
    process.exit(0);

  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

run();
