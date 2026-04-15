const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    // Safety check: ensure env is loaded or retry loading it
    if (!process.env.MONGO_URI) {
      require('dotenv').config();
    }

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is still undefined. Please check your .env file.');
    }

    console.log('⏳ Attempting to connect to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log('📌 Data will now be saved PERMANENTLY in the cloud.');
  } catch (atlasError) {
    console.warn('⚠️  MONGODB ATLAS CONNECTION FAILED!');
    console.warn('   Common cause: Your IP is not whitelisted or credentials in .env are wrong.');
    console.error(`   Error: ${atlasError.message}`);
    
    console.log('\n⏳ Falling back to local MongoDB Memory Server...');
    try {
      mongoServer = await MongoMemoryServer.create();
      const localUri = mongoServer.getUri();
      await mongoose.connect(localUri);
      console.log('✅ Local Memory Server active.');
      console.log('🚨 WARNING: Data created now will be LOST when the server restarts.');
    } catch (localError) {
      console.error('❌ Critical: Failed to start any database:', localError.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
