require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('../models/Service');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pkc-cag';
  console.log('Connecting to', uri);
  await mongoose.connect(uri);

  try {
    // Find services that either lack a serviceId or have a non-4-digit serviceId
    const services = await Service.find({
      $or: [
        { serviceId: { $exists: false } },
        { serviceId: null },
        { serviceId: '' },
        { serviceId: { $not: /^\d{4}$/ } },
      ],
    });

    console.log(`Found ${services.length} services needing replacement`);

    let updated = 0;
    for (const s of services) {
      let assigned = null;
      for (let attempts = 0; attempts < 12 && !assigned; attempts += 1) {
        const candidate = String(Math.floor(1000 + Math.random() * 9000));
        // eslint-disable-next-line no-await-in-loop
        const exists = await Service.exists({ serviceId: candidate });
        if (!exists) assigned = candidate;
      }

      if (!assigned) {
        // fallback, ensure unique
        let fallback = String(Date.now()).slice(-4);
        let i = 0;
        // eslint-disable-next-line no-await-in-loop
        while (await Service.exists({ serviceId: fallback })) {
          i += 1;
          fallback = String((Number(fallback) + i) % 10000).padStart(4, '0');
        }
        assigned = fallback;
      }

      // set only serviceId to avoid validation
      // eslint-disable-next-line no-await-in-loop
      await Service.updateOne({ _id: s._id }, { $set: { serviceId: assigned } });
      console.log(`Replaced ${s._id} (${s.serviceId || 'missing'}) -> ${assigned}`);
      updated += 1;
    }

    console.log(`Replacement complete. Updated ${updated} services.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('force replace failed', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
