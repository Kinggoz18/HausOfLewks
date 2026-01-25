# Haus of Lewks

Booking system for my friend's hair salon. Handles appointment scheduling, service management, customer bookings, and blog mangment.

## Tech Stack

**Backend:**
- Node.js / Express
- MongoDB / Mongoose
- Passport.js (Google OAuth)
- Nodemailer
- Google Drive API

**Frontend:**
- Remix
- React
- Tailwind CSS
- Formik / Yup

## Running Locally

1. Install dependencies:
   ```bash
   cd Haus_Of_Lewks_API
   npm install
   
   cd ../BookingWebApp
   npm install
   ```

2. Set up environment variables in `Haus_Of_Lewks_API/.env`:
   - `MONGODB_URL`
   - `JWT_SECRET`
   - `PORT`
   - `FRONTEND_URL`
   - `CMS_FRONTEND_URL`
   - `BASE_PATH`
   - Google OAuth credentials
   - Email service config
   - DigitalOcean Spaces config (if using)

3. Build the frontend:
   ```bash
   cd BookingWebApp
   npm run build
   ```

4. Start the server:
   ```bash
   cd Haus_Of_Lewks_API
   npm start
   ```

The app runs on `http://localhost:3000` (or whatever PORT is set to). The Express server handles both API routes (`/api/v1/*`) and serves the Remix frontend.

## Project Structure

- `Haus_Of_Lewks_API/` - Express backend, serves both API and frontend
- `BookingWebApp/` - Remix frontend application
