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

const checkDB = async () => {
  try {
    const Contract = require('../models/Contract');
    
    // Find all contracts
    const allContracts = await Contract.find().lean();
    console.log(`\n📊 Total contracts in DB: ${allContracts.length}`);
    
    if (allContracts.length > 0) {
      console.log('\n📋 Contracts:');
      allContracts.forEach((c, i) => {
        console.log(`  ${i+1}. ID: ${c._id}, Amount: ${c.totalAmount}`);
      });
    }
    
    // Look for the specific contract
    const contractId = '6946b84c2b0a7d2ba1ddb8ee';
    const specific = await Contract.findById(contractId);
    console.log(`\n🔍 Searching for contract ${contractId}:`);
    console.log('   Found:', specific ? 'YES' : 'NO');
    
    // Try ObjectId conversion
    const ObjectId = mongoose.Types.ObjectId;
    if (ObjectId.isValid(contractId)) {
      const specific2 = await Contract.findById(new ObjectId(contractId));
      console.log('   Found (with ObjectId):', specific2 ? 'YES' : 'NO');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

connectDB().then(checkDB);
