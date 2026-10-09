import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';

let connection: mongoose.Connection;

export const connectDB = async (): Promise<void> => {
  try {
    if (connection && connection.readyState === 1) {
      console.log('Already connected to MongoDB');
      return;
    }
    
    connection = mongoose.connection;
    
    await mongoose.connect(MONGODB_URI);
    
    console.log(`MongoDB connected: ${connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (err) {
    console.error('MongoDB disconnection error:', err);
    process.exit(1);
  }
};
