import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing from backend/.env');
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    const isAtlasUri = process.env.MONGO_URI.includes('mongodb.net');
    const likelyAtlasNetworkIssue =
      isAtlasUri &&
      /IP that isn't whitelisted|ECONNRESET|ETIMEDOUT|ENOTFOUND|ReplicaSetNoPrimary|server selection/i.test(
        error.message
      );

    console.error(`MongoDB connection failed: ${error.message}`);

    if (likelyAtlasNetworkIssue) {
      console.error(
        'Atlas likely blocked this connection. Add your current IP in Atlas Network Access, or temporarily allow 0.0.0.0/0 for development.'
      );
    }

    throw error;
  }
};

export default connectDB;
