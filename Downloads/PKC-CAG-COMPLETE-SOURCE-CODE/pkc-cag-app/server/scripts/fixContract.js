const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const fixContract = async () => {
  try {
    const Contract = require('../models/Contract');
    
    const contractId = '6946b84c2b0a7d2ba1ddb8ee';
    const newFreelancerId = '6927cc7eaf37c5bfab563a30'; // Current user who wants to submit work
    
    console.log(`\n🔄 Updating contract ${contractId}...`);
    console.log(`   Old freelancer: 693c42648ede38ec21efbb97`);
    console.log(`   New freelancer: ${newFreelancerId}`);
    
    const result = await Contract.findByIdAndUpdate(
      contractId,
      { freelancerId: newFreelancerId },
      { new: true }
    ).populate('clientId freelancerId jobId');
    
    if (result) {
      console.log('\n✅ Contract updated successfully!');
      console.log('   Contract ID:', result._id);
      console.log('   Client:', result.clientId?.email);
      console.log('   Freelancer:', result.freelancerId?.email);
      console.log('   Freelancer ID:', result.freelancerId?._id);
      console.log('   Total Amount:', result.totalAmount);
    } else {
      console.log('❌ Contract not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

connectDB().then(fixContract);
