/*
  Script: backfillServiceIds.js
  Purpose: Populate missing 4-digit `serviceId` values for existing services.
  Usage:
    - ensure server/.env has MONGODB_URI set, then run from server folder:
        node scripts/backfillServiceIds.js
*/

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const Service = require('../models/Service');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pkc-cag';
  console.log('Connecting to', uri);
  // Newer mongodb drivers don't accept deprecated options; pass uri only
  await mongoose.connect(uri);

  try {
    const services = await Service.find({ $or: [{ serviceId: { $exists: false } }, { serviceId: null }, { serviceId: '' }] });
    console.log(`Found ${services.length} services missing serviceId`);

    let updated = 0;
    for (const s of services) {
      let attempts = 0;
      let assignedId = null;
      while (attempts < 6 && !assignedId) {
        const candidate = String(Math.floor(1000 + Math.random() * 9000));
        // eslint-disable-next-line no-await-in-loop
        const exists = await Service.exists({ serviceId: candidate });
        if (!exists) {
          assignedId = candidate;
          break;
        }
        attempts += 1;
      }
      if (!assignedId) assignedId = String(Date.now()).slice(-4);

      // Use direct update to avoid triggering full document validation (some old
      // documents may have enum values that now fail validation). This sets only
      // the serviceId field.
      // eslint-disable-next-line no-await-in-loop
      await Service.updateOne({ _id: s._id }, { $set: { serviceId: assignedId } });
      updated += 1;
      console.log(`Updated service ${s._id} -> ${assignedId}`);
    }

    console.log(`Backfill complete. Updated ${updated} services.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Backfill failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
