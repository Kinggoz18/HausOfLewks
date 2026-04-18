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
          'SRV lookup failed (Atlas mongodb+srv). Verify the cluster still exists in Atlas, the hostname in the URI matches Atlas exactly, and try the standard connection string if DNS keeps failing.'
      });
    } else {
      console.error({ error: message });
    }
    throw new Error(message);
  }
};

export default connectToDb;
