const mongoose = require("mongoose");
const Service = require("../server/models/Service");
require("dotenv").config();

async function clear() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Service.deleteMany({});
  console.log("🔥 Deleted all services");
  process.exit();
}

clear();
