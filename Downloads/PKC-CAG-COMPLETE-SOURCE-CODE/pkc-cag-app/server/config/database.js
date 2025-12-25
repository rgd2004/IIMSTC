const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Removed deprecated useNewUrlParser and useUnifiedTopology options
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('\n💡 TROUBLESHOOTING:');
    console.error('1. Check if MONGODB_URI is set in .env file');
    console.error('2. For local MongoDB: Use mongodb://localhost:27017/pkc-cag-platform');
    console.error('3. For MongoDB Atlas: Check connection string format');
    console.error('4. Ensure MongoDB service is running\n');
    process.exit(1);
  }
};

module.exports = connectDB;