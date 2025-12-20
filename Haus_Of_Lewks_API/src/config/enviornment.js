import dotenv from 'dotenv';
dotenv.config();

const serverEnvVaiables = {
  mongoDbUrl: process.env.MONGODB_URL ?? null,
  basePath: process.env.BASE_PATH ?? null,
  databaseName: process.env.DATABASE_NAME ?? null,
  testDatabaseName: process.env.TEST_DATABASE_NAME ?? null,
  frontendUrl: process.env.FRONTEND_URL ?? null,
  cmsFrontendUrl: process.env.CRM_FRONTEND_URL ?? null,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ?? 3000,
  signupSecret: process.env.SIGNUP_SECRET ?? null,
  jwtSecret: process.env.JWT_SECRET ?? null
};

const googleEnvVariables = {
  googleServiceAccountJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? '',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL ?? '',
  googleEmail: process.env.GOOGLE_SERVICE_EMAIL ?? '',
  googleAppPassword: process.env.GOOGLE_APP_PASSWORD ?? '',
  driveImagesFolderId: process.env.DRIVE_IMAGES_FOLDER_ID ?? '',
  driveVideosFolderId: process.env.DRIVE_VIDEOS_FOLDER_ID ?? '',
  // Gmail account type: 'personal' (500 limit) or 'workspace' (2000 limit)
  googleAccountType: process.env.GOOGLE_ACCOUNT_TYPE ?? 'personal'
};

const digitaloceanEnvVariables = {
  spacesKey: process.env.DO_SPACES_KEY,
  spacesSecret: process.env.DO_SPACES_SECRET,
  spacesBucket: process.env.DO_BUCKET_NAME
};

export { serverEnvVaiables, googleEnvVariables, digitaloceanEnvVariables };
