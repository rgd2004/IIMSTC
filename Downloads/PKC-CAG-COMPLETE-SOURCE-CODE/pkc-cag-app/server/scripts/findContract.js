const mongoose = require('mongoose');
require('dotenv').config();

async function findContract() {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI.substring(0, 100));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB:', mongoose.connection.name);
    
    const db = mongoose.connection.db;
    const contracts = await db.collection('contracts').find({}).toArray();
    
    console.log('\n📊 Contracts in DB:', contracts.length);
    
    if (contracts.length > 0) {
      console.log('\n📋 Contracts found:');
      contracts.forEach((c, i) => {
        console.log(`  ${i+1}. _id: ${c._id}, freelancerId: ${c.freelancerId}`);
      });
      
      // Try to find the specific one
      const target = contracts.find(c => c._id.toString() === '6946b84c2b0a7d2ba1ddb8ee');
      if (target) {
        console.log('\n✅ Found target contract!');
        console.log('   Current freelancerId:', target.freelancerId);
      }
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

findContract();
