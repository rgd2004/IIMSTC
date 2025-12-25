const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://pkc_admin:Abhi%401022@pkc-cag-cluster.eygdwlj.mongodb.net/pkc-cag?retryWrites=true&w=majority';

async function findContract() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to DB:', mongoose.connection.name);
    
    const db = mongoose.connection.db;
    const contracts = await db.collection('contracts').find({}).toArray();
    
    console.log('\n📊 Contracts in DB:', contracts.length);
    
    if (contracts.length > 0) {
      console.log('\n📋 Contracts found:');
      contracts.forEach((c, i) => {
        console.log(`  ${i+1}. _id: ${c._id}`);
      });
      
      // Try to find the specific one
      const target = contracts.find(c => c._id.toString() === '6946b84c2b0a7d2ba1ddb8ee');
      if (target) {
        console.log('\n✅ Found target contract!');
        console.log('   Current freelancerId:', target.freelancerId);
        
        // Update it
        const result = await db.collection('contracts').updateOne(
          { _id: target._id },
          { $set: { freelancerId: mongoose.Types.ObjectId.createFromHexString('6927cc7eaf37c5bfab563a30') } }
        );
        console.log('   Updated:', result.modifiedCount, 'contract(s)');
      } else {
        console.log('\n❌ Target contract not found');
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
