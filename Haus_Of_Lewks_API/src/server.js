import connectToDb from './config/database.js';
import initExpressApp from './config/app.js';
import { serverEnvVaiables } from './config/enviornment.js';

const init = async () => {
  try {
    const databaseClient = await connectToDb();
    const app = await initExpressApp(databaseClient);

    app.listen(serverEnvVaiables.port, () => {
      console.log('Express server running on Port:', serverEnvVaiables.port);
    });
  } catch (error) {
    console.error('Error in init:', error?.message ?? error);
  }
};

init();
