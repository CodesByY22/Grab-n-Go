const mongoose = require('mongoose');
require('dotenv').config();

let mongoMemoryServer = null;

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;

  // Disable bufferCommands to fail fast if DB connection is unavailable
  mongoose.set('bufferCommands', false);

  // 1. Try Remote / Atlas MongoDB
  if (uri && (uri.startsWith('mongodb+srv://') || (!uri.includes('127.0.0.1') && !uri.includes('localhost')))) {
    try {
      console.log('📡 Connecting to Cloud MongoDB Atlas...');
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      if (mongoose.connection.readyState === 1) {
        console.log(`🍃 Connected to Cloud/Remote MongoDB: ${mongoose.connection.host}`);
        return;
      }
    } catch (err) {
      console.warn(`⚠️ Could not connect to MongoDB Atlas (${err.message}).`);
      console.warn(`👉 TIP FOR MONGODB ATLAS: Make sure your IP address is whitelisted in MongoDB Atlas:`);
      console.warn(`   Go to Atlas Dashboard -> Network Access -> Add IP Address -> "Allow Access From Anywhere" (0.0.0.0/0).`);
      console.warn(`🔄 Falling back to zero-setup In-Memory MongoDB...`);
      try { await mongoose.disconnect(); } catch (e) {}
    }
  }

  // Re-enable buffering for memory server
  mongoose.set('bufferCommands', true);

  // 2. Fallback to MongoMemoryServer for 100% zero-dependency execution
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    
    await mongoose.connect(memoryUri);
    console.log(`⚡ Connected to In-Memory MongoDB Instance at ${memoryUri}`);
    return;
  } catch (error) {
    console.error(`❌ MongoDB Connection Failure: ${error.message}`);
    process.exit(1);
  }
};

const User = require('./models/User');
const Cafeteria = require('./models/Cafeteria');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const Notification = require('./models/Notification');

module.exports = {
  connectDB,
  User,
  Cafeteria,
  Category,
  MenuItem,
  Order,
  Notification
};
