import { serverEnvVaiables } from './enviornment.js';
import cors from 'cors';
import express from 'express';
import errorHandler from '../util/errorHandler.js';
import { APIRoutes } from '../routes/Routes.js';
import PassportConfig from './passport.js';
import multerConfig from './mutler.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequestHandler } from '@remix-run/express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route order is critical: middleware → static files → API routes → Remix handler (last)
const initExpressApp = async (databaseClient) => {
  try {
    if (!serverEnvVaiables?.port)
      throw new Error('startExpressServer function: Port is undefined');

    if (!serverEnvVaiables?.basePath)
      throw new Error(
        'startExpressServer function: Base path URL is undefined'
      );

    if (!serverEnvVaiables?.cmsFrontendUrl)
      throw new Error(
        'startExpressServer function: CMS Frontend URL is undefined'
      );

    if (!serverEnvVaiables?.frontendUrl)
      throw new Error('startExpressServer function: Frontend URL is undefined');

    if (!databaseClient)
      throw new Error('startExpressServer function: Failed to load database');

    const app = express();

    const corsOption = {
      origin: [
        serverEnvVaiables.cmsFrontendUrl,
        serverEnvVaiables.frontendUrl,
        'https://images.unsplash.com',
        'https://drive.google.com',
        'lh3.googleusercontent.com'
      ].filter(Boolean),
      methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
      credentials: true,
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Origin',
        'X-Requested-With',
        'Accept'
      ]
    };

    app.use(cors(corsOption));

    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: false, limit: '50mb' }));

    app.set('trust proxy', 1);

    PassportConfig(app);

    const remixClientPath = path.join(
      __dirname,
      '../../../BookingWebApp/build/client'
    );

    app.use(
      express.static(remixClientPath, {
        immutable: true,
        maxAge: '1h'
      })
    );

    app.get('/ping', (req, res) => {
      res
        .status(200)
        .json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    const routes = new APIRoutes();
    const appRouter = await routes.initAllRoutes(multerConfig);

    app.options(serverEnvVaiables.basePath + '/*', cors(corsOption));

    console.log(
      `[Server] Mounting API routes at: ${serverEnvVaiables.basePath}`
    );
    app.use(serverEnvVaiables.basePath, appRouter);

    app.use(serverEnvVaiables.basePath, errorHandler);

    try {
      const remixServerPath = path.join(
        __dirname,
        '../../../BookingWebApp/build/server/index.js'
      );
      console.log('[Server] Loading Remix build from:', remixServerPath);
      const remixBuild = await import(remixServerPath);

      const remixHandler = createRequestHandler({
        build: remixBuild,
        mode: serverEnvVaiables.nodeEnv,
        getLoadContext: () => ({})
      });

      console.log('[Server] Remix handler created successfully');

      // Must be last so API routes are handled first
      app.all('*', remixHandler);
    } catch (error) {
      console.error('[Server] Failed to load Remix build:', error.message);
      console.warn(
        '[Server] Frontend will not be served. Run: cd BookingWebApp && npm run build'
      );

      app.all('*', (req, res) => {
        if (req.path.startsWith(serverEnvVaiables.basePath)) {
          return res.status(404).json({
            error: 'API route not found',
            path: req.path
          });
        }
        res.status(503).json({
          error: 'Frontend not available. Please build the frontend first.',
          path: req.path
        });
      });
    }

    return app;
  } catch (error) {
    console.error({ error: error?.message });
    throw new Error(error.message);
  }
};

export default initExpressApp;
