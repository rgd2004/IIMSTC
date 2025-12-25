require('dotenv').config();
const connectDB = require('../config/database');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'pkccag@gmail.com';
const NEW_PASSWORD = process.env.ADMIN_NEW_PASSWORD || 'Smitha@1022';

(async () => {
  try {
    await connectDB();

    const user = await User.findOne({ email: ADMIN_EMAIL });
    if (!user) {
      console.log('❌ No user found with email:', ADMIN_EMAIL);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(NEW_PASSWORD, 10);
    user.password = hashed;
    user.isAdmin = true;
    user.isVerified = true;
    await user.save();

    console.log('✅ Admin updated successfully!');
    console.log('📧 Email:', ADMIN_EMAIL);
    console.log('🔑 New Password:', NEW_PASSWORD);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
