const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const queryUsers = async () => {
  try {
    // Find admin user
    const admin = await User.findOne({ isAdmin: true });
    console.log('\n📌 Admin user:');
    console.log('  ID:', admin?._id);
    console.log('  Email:', admin?.email);
    console.log('  Name:', admin?.firstName, admin?.lastName);

    // Find the current user (the one who is trying to submit work)
    const currentUser = await User.findById('6927cc7eaf37c5bfab563a30');
    console.log('\n📌 Current user (trying to submit work):');
    console.log('  ID:', currentUser?._id);
    console.log('  Email:', currentUser?.email);
    console.log('  Name:', currentUser?.firstName, currentUser?.lastName);

    // Find the wrong freelancer
    const wrongFreelancer = await User.findById('693c42648ede38ec21efbb97');
    console.log('\n📌 Wrong freelancer (currently on contract):');
    console.log('  ID:', wrongFreelancer?._id);
    console.log('  Email:', wrongFreelancer?.email);
    console.log('  Name:', wrongFreelancer?.firstName, wrongFreelancer?.lastName);

    // Find the contract
    const Contract = require('../models/Contract');
    const contract = await Contract.findById('6946b84c2b0a7d2ba1ddb8ee').populate('clientId freelancerId jobId');
    console.log('\n📌 Contract:');
    console.log('  ID:', contract?._id);
    console.log('  Client:', contract?.clientId?.email);
    console.log('  Freelancer:', contract?.freelancerId?.email);
    console.log('  Job:', contract?.jobId?.title);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

connectDB().then(queryUsers);
