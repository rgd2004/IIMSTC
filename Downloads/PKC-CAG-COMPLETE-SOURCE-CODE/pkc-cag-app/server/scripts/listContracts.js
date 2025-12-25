const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const contracts = await db.collection('contracts').find({}).toArray();
  console.log('\nContracts in DB:', contracts.length);
  contracts.forEach((c, i) => {
    console.log(`${i+1}. _id: ${c._id}, freelancerId: ${c.freelancerId}`);
  });
  
  process.exit(0);
}).catch(e => {
  console.error(e.message);
  process.exit(1);
});
