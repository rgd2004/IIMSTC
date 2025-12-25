const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://pkc_admin:Abhi%401022@pkc-cag-cluster.eygdwlj.mongodb.net/pkc-cag?retryWrites=true&w=majority';

async function updateContract() {
  try {
    console.log('✅ Connecting to pkc-cag database...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected');
    
    const db = mongoose.connection.db;
    const contracts = await db.collection('contracts').find({}).toArray();
    
    console.log(`\n📊 Found ${contracts.length} contracts in database`);
    
    if (contracts.length === 0) {
      console.log('No contracts found');
      process.exit(1);
    }
    
    // Find the specific contract
    const target = contracts.find(c => c._id.toString() === '6946b84c2b0a7d2ba1ddb8ee');
    
    if (!target) {
      console.log('❌ Contract 6946b84c2b0a7d2ba1ddb8ee not found');
      process.exit(1);
    }
    
    console.log('\n✅ Found target contract!');
    console.log('   Old freelancerId:', target.freelancerId);
    
    // Update it
    const newFreelancerId = mongoose.Types.ObjectId.createFromHexString('6927cc7eaf37c5bfab563a30');
    const result = await db.collection('contracts').updateOne(
      { _id: target._id },
      { $set: { freelancerId: newFreelancerId } }
    );
    
    console.log('   New freelancerId:', newFreelancerId);
    console.log('   Updated:', result.modifiedCount, 'contract(s)');
    console.log('\n✅ Contract freelancer reassigned successfully!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

updateContract();
