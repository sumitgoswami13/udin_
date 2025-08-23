import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://onezeddeveloper:cClQrqx3ZRweWSyu@onezeddb.upjh6dt.mongodb.net/udin_production?retryWrites=true&w=majority&appName=oneZedDb';

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      dbName: 'udin_production',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Atlas connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB Atlas disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB Atlas reconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error);
    
    // More detailed error logging for Atlas connection issues
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        console.error('🔑 Authentication failed - check username/password');
      } else if (error.message.includes('network')) {
        console.error('🌐 Network error - check internet connection');
      } else if (error.message.includes('timeout')) {
        console.error('⏱️ Connection timeout - check network or Atlas status');
      }
    }
    
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('🔄 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Closing database connections...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Closing database connections...');
  await disconnectDatabase();
  process.exit(0);
});