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

/**
 * Initialize and configure the Express server with Remix integration
 *
 * CRITICAL: Route order matters!
 * 1. Body parsers & middleware
 * 2. Static files
 * 3. API routes (Express) - MUST come BEFORE Remix
 * 4. Remix handler - MUST come LAST
 *
 * @param {MongoClient} databaseClient
 */
const initExpressApp = async (databaseClient) => {
  try {
    // Validate required environment variables
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

    // Create Express app instance
    const app = express();

    /* ============================================
       STEP 1: MIDDLEWARE (must be first)
    ============================================ */

    // CORS configuration
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

    // Body parsers - REQUIRED for POST/PUT requests
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: false, limit: '50mb' }));

    app.set('trust proxy', 1);

    // Passport configuration
    PassportConfig(app);

    /* ============================================
       STEP 2: STATIC FILES
    ============================================ */

    // Serve Remix static assets
    const remixClientPath = path.join(
      __dirname,
      '../../../BookingWebApp/build/client'
    );
    // app.use(
    //   '/assets',
    //   express.static(path.join(remixClientPath, 'assets'), {
    //     immutable: true,
    //     maxAge: '1y'
    //   })
    // );

    // Serve Remix public files (favicon, images, SVGs, etc.)
    app.use(
      express.static(remixClientPath, {
        immutable: true,
        maxAge: '1h'
      })
    );

    /* ============================================
       STEP 3: EXPRESS API ROUTES (before Remix!)
    ============================================ */

    // Health check endpoint
    app.get('/ping', (req, res) => {
      res
        .status(200)
        .json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Initialize API routes
    const routes = new APIRoutes();
    const appRouter = await routes.initAllRoutes(multerConfig);

    // Handle CORS preflight for API routes
    app.options(serverEnvVaiables.basePath + '/*', cors(corsOption));

    // Mount API routes - THIS MUST COME BEFORE REMIX HANDLER
    console.log(
      `[Server] Mounting API routes at: ${serverEnvVaiables.basePath}`
    );
    app.use(serverEnvVaiables.basePath, appRouter);

    // API error handler - catches errors from API routes
    app.use(serverEnvVaiables.basePath, errorHandler);

    /* ============================================
       STEP 4: REMIX HANDLER (must be LAST!)
    ============================================ */

    try {
      const remixServerPath = path.join(
        __dirname,
        '../../../BookingWebApp/build/server/index.js'
      );
      console.log('[Server] Loading Remix build from:', remixServerPath);
      const remixBuild = await import(remixServerPath);

      // Create Remix request handler
      const remixHandler = createRequestHandler({
        build: remixBuild,
        mode: serverEnvVaiables.nodeEnv,
        getLoadContext: () => ({})
      });

      console.log('[Server] Remix handler created successfully');

      // CRITICAL: Remix handles ALL remaining routes with app.all("*")
      // This MUST be after API routes so Express handles /api/* first
      app.all('*', remixHandler);
    } catch (error) {
      console.error('[Server] Failed to load Remix build:', error.message);
      console.warn(
        '[Server] Frontend will not be served. Run: cd BookingWebApp && npm run build'
      );

      // Fallback for non-API routes when Remix is not available
      app.all('*', (req, res) => {
        // Don't catch API routes - they should 404 properly
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
