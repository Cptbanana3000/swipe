// swipe/packages/server/src/config/db.ts
import mongoose from 'mongoose';




const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/swipe';

    if (!mongoURI) {
      console.error('MONGO_URI not found in .env file. Please set it.');
      process.exit(1); // Exit process with failure
    }

    await mongoose.connect(mongoURI);

    console.log('MongoDB Connected Successfully!'); // Added a little Japanese flair for fun :)
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;