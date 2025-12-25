const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = require('../models/User');
    
    const users = await User.find().select('_id email isAdmin firstName lastName');
    console.log('\nUsers in DB:');
    users.forEach(u => {
      console.log(`  ${u._id}: ${u.email} (admin: ${u.isAdmin})`);
    });
    
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

checkUsers();
