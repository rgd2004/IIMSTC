require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('../models/Service');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pkc-cag';
  console.log('Connecting to', uri);
  await mongoose.connect(uri);

  try {
    const services = await Service.find({}).sort({ createdAt: -1 });
    console.log(`Total services: ${services.length}`);
    for (const s of services) {
      console.log(`${s._id}  -> serviceId: ${s.serviceId || '(missing)'}  name: ${s.name}`);
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('list failed', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
