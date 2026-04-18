import mongoose from 'mongoose';
import { serverEnvVaiables } from './enviornment.js';

const connectToDb = async () => {
  try {
    const url = serverEnvVaiables?.mongoDbUrl;
    if (!url) {
      throw new Error(
        'MongoDB URL is missing. Set MONGODB_URL or DATABASE_URL in the environment (Render dashboard or .env locally).'
      );
    }

    const mongodb = await mongoose.connect(url);
    if (!mongodb)
      throw new Error('connectToDb Func: Failed to create MongoDb Client');

    return mongodb.connection.getClient();
  } catch (error) {
    const message = error?.message ?? String(error);
    if (message.includes('querySrv') || message.includes('ENOTFOUND')) {
      console.error({
        error: message,
        hint:
          'SRV lookup failed (Atlas mongodb+srv). Redeploy with latest code (Render sets RENDER=true so public DNS is used for SRV), set MONGO_DNS_USE_PUBLIC=true, or paste Atlas’s standard (non-+srv) URI into MONGODB_URL.'
      });
    } else {
      console.error({ error: message });
    }
    throw new Error(message);
  }
};

export default connectToDb;
