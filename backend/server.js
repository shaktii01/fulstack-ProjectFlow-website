import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const REQUIRED_ENV_VARS = ['MONGO_URI', 'JWT_SECRET'];

const validateRequiredEnv = () => {
  const missingVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

const startServer = async () => {
  try {
    validateRequiredEnv();
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
