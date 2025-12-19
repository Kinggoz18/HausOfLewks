import AdminModel from '../models/Admin.js';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import UserRolesEnum from '../util/enums/UserRoles.js';
import GoogleDriveModel from '../models/GoogleDrive.js';

// const applePrivateKeyPath = path.join(process.env.APPLE_PRIVATE_KEY);

const PassportConfig = (app) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRegisterCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

  console.log({ googleRegisterCallbackUrl });
  app.use(passport.initialize());

  //Passport google
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleSecret,
        callbackURL: googleRegisterCallbackUrl,
        passReqToCallback: true, // Pass the request to the callback to access query parameters
        scope: [
          'openid',
          'profile',
          'email',
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive.metadata'
        ],
        includeGrantedScopes: false,
        approvalPrompt: 'force',
        accessType: 'offline',
        prompt: 'select_account'
      },
      async function (req, accessToken, refreshToken, profile, cb) {
        console.log('Passport google strategy');

        try {
          console.log(req.query);
          const state = req.query.state ? JSON.parse(req.query.state) : {};
          const { mode } = state;
          const searchUser = await AdminModel.findOne({
            googleId: profile.id
          }).select('-password');

          console.log({ accessToken, refreshToken });

          // Login mode - user must already exist
          if (mode === 'login') {
            if (searchUser?._id) {
              await GoogleDriveModel.deleteMany({}); // Delete previous refresh tokens
              await GoogleDriveModel.create({ refreshToken }); // Create new refresh token
              return cb(null, searchUser);
            } else {
              throw new Error('User not found. Please sign up first.');
            }
          }

          // Signup mode - create new user
          if (mode === 'signup') {
            if (searchUser?._id) {
              throw new Error('User already exists. Please login instead.');
            }

            const user = await AdminModel.create({
              googleId: profile.id,
              googleEmail: profile.emails[0].value,
              role: 'Employee'
            });

            await GoogleDriveModel.deleteMany({}); // Delete previous refresh tokens

            await GoogleDriveModel.create({ refreshToken }); // Create new refresh token

            return cb(null, user);
          }

          // No valid mode provided
          throw new Error('Invalid authentication mode');
        } catch (error) {
          console.log('Error in Google Passport authentication', error);
          return cb(error);
        }
      }
    )
  );
};

export default PassportConfig;
