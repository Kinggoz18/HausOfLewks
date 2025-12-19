## Haus_Of_Lewks_API – Server Analysis (Updated)

### **1. Main functions of the server**

- **Authentication & users**
  - Google OAuth login/sign-up for admins via Passport.
  - Fetching the authenticated admin by ID.
  - Listing all customers and fetching single customers.
  - Blocking/unblocking customers based on missed bookings.
  - Logging admins out and cleaning up session state.

- **Booking management**
  - Creating bookings (with validation, user resolution, and transactional updates).
  - Listing bookings with advanced filtering:
    - Status filtering
    - Creation date range filtering (`from`, `to`)
    - **Appointment date filtering** (`appointmentDateFrom`, `appointmentDateTo`) - filters by actual schedule date
    - Pagination support (`page`, `pageSize`)
    - Automatic sorting: upcoming appointments first, then past appointments
  - Looking up user bookings by contact info.
  - Fetching a single booking by ID.
  - Updating booking status and total (including logic to block frequent no-shows).
  - Cancelling a booking at the user's request.
  - Aggregating bookings into an **income report** (total revenue, completed count, counts by status).
  - **Booking summary** endpoint providing counts by status (completed, upcoming, cancelled, missed).

- **Schedule management**
  - Creating and updating daily schedules with start/end times.
  - Removing individual slots or deleting entire schedules.
  - Listing schedules and fetching by ID or date.

- **Service catalog**
  - Managing hair service categories with cover images.
  - Managing individual hair services (title, price, duration, category).
  - Managing service add-ons linked to services.
  - Listing/grouping services and add-ons.
  - Computing which services are available for a specific schedule window.

- **Media**
  - Uploading media assets (images) to DigitalOcean Spaces and storing metadata.
  - Deleting media from storage and the database.

- **Content (blog)**
  - **Fully implemented** blog service with CRUD operations:
    - Create, read, update, delete blog posts
    - Get by ID or slug
    - Published/draft status management
    - Cover image support
    - Slug-based routing for SEO-friendly URLs

### **2. Architecture**

- **Runtime & stack**
  - Node.js with Express 5.
  - MongoDB via Mongoose plus the native driver where transactions are needed.
  - Passport (Google OAuth) for admin auth.
  - Multer for file uploads.
  - AWS S3 SDK client configured for DigitalOcean Spaces.

- **Entry & app configuration**
  - `src/server.js`:
    - Connects to MongoDB via `connectToDb`.
    - Bootstraps Express via `initExpressApp`.
    - Listens on the configured `port`.
  - `src/config/app.js`:
    - Validates environment (port, basePath, frontend URLs).
    - Configures CORS for CMS + booking frontends (allows GET, POST, DELETE, PUT; OPTIONS handled automatically by cors middleware).
    - Sets JSON/URL-encoded parsers.
    - Initializes Passport.
    - Creates the composed router via `APIRoutes.initAllRoutes`.
    - Attaches a global error handler.

- **Routing & services**
  - `APIRoutes`:
    - Composes:
      - `UserRoutes` (`/user`)
      - `ScheduleRoute` (`/schedule`)
      - `BookingRoute` (`/booking`)
      - `HairServicesRoute` (`/hair-service`)
      - `MediaRoute` (`/media`)
      - `BlogRoute` (`/blog`) - **Fully implemented**
  - `Services` factory:
    - Instantiates:
      - `DigitalOceanSpacesManager`
      - `MediaService`
      - `UserService`
      - `ScheduleService`
      - `BookingService`
      - `HairServices`
      - `BlogService` - **Fully implemented**

- **Data layer**
  - Mongoose models:
    - `Bookings` (including embedded service + add-ons, booking status, total, unique `(scheduleId, startTime)` index).
    - `HairServices`, `HairCategory`, `ServiceAddOns`.
    - `Schedule`, `Users`, `Media`, `CronJobs`, etc.
    - `Blog` (fully implemented with slug uniqueness).
  - Utilities:
    - Enums for booking status, media type, and user roles.
    - Shared `ReturnObject` helper for consistent `{ isSuccess, content }` responses.

### **3. Detailed functional areas**

#### **3.1 Booking**

- **Routes – `BookingRoutes.js`**
  - `POST /booking` → `createBooking`
  - `POST /booking/get-bookings` → `getBookings` (status, date-range, and appointment date filtering with pagination)
  - `GET /booking/summary` → `getBookingSummary` (counts by status)
  - `GET /booking/:bookingId` → `getBookingById`
  - `POST /booking/update` → `updateBookingById`
  - `POST /booking/find-user-bookings` → `getUserBookings`
  - `POST /booking/cancel` → `cancelBookingByUser`
  - `POST /booking/income-report` → `getIncomeReport`

- **Key service methods – `BookingService.js`**
  - `createBooking(req, res)`:
    - Validates input.
    - Resolves customer via `UserService.getCustomerForBooking`.
    - Rejects bookings for blocked users.
    - Uses a MongoDB transaction to:
      - Insert a booking document.
      - Compute total duration (service + add-ons) and update schedule availability.
      - Push the booking reference to the user's document.
    - Returns a success/failure `ReturnObject`.
    - TODO (still open): send admin notification email after a successful booking.

  - `getUserBookings(req, res)`:
    - Requires first/last name plus either phone or email.
    - Returns all matching bookings for that customer.

  - `getBookings(req, res)`:
    - Accepts `status`, `from`, `to`, `appointmentDateFrom`, `appointmentDateTo`, `page`, `pageSize` in the body.
    - Filters by status and `createdAt` (for date-range reporting).
    - **NEW**: Filters by appointment date (`appointmentDateFrom`, `appointmentDateTo`) by joining with schedule data.
    - **NEW**: Implements pagination with configurable page size (default 100, max 200).
    - **NEW**: Sorts results: upcoming appointments first, then past appointments (ascending by date within each group).
    - Returns paginated response: `{ items: Booking[], total: number, page: number, pageSize: number }`.

  - `getBookingSummary(req, res)`:
    - Returns counts by booking status: `{ completed, upcoming, cancelled, missed }`.
    - Used by admin dashboard for quick overview.

  - `getBookingById(req, res)`:
    - Looks up booking by `_id`.
    - Returns 404 if not found.

  - `updateBookingById(req, res)`:
    - Updates `status` and/or `total` (price).
    - For status `Missed`:
      - Retrieves the booking's customer.
      - Counts the customer's missed bookings using `BookingModel`.
      - Blocks the user via `userService.blockUser` after repeated missed appointments.

  - `cancelBookingByUser(req, res)`:
    - Validates `bookingId`.
    - Loads the booking, returns 404 if missing.
    - Sets status to `Cancelled` (if not already) and saves.

  - `getIncomeReport(req, res)`:
    - Computes income reporting **from bookings** (no separate model):
      - Filters completed bookings (and optional `from`/`to` date filter).
      - Aggregates:
        - `totalRevenue` (sum of `total`).
        - `totalCompleted`.
      - Also returns `countsByStatus` for further breakdown.

  - `getDbClient()`:
    - Wraps the MongoDB client creation for transactional use.

#### **3.2 Schedule**

- **Routes – `ScheduleRoutes.js`**
  - Creation, updating, removing slots, deleting schedules.
  - Listing all schedules, getting by ID, and looking up by date.

- **Service – `ScheduleService.js`**
  - Manages the availability window for each day.
  - Cooperates with `BookingService` to shrink available slots as bookings are made.

#### **3.3 Hair services & add-ons**

- **Routes – `HairServices.js`**
  - Add/update/remove categories, services, add-ons.
  - List categories, services (grouped by category), and add-ons.
  - Compute available services for a schedule slot using service duration and schedule windows.

- **Models**
  - `HairServices`, `HairCategory`, and `ServiceAddOns` model the catalog that the frontend uses.

#### **3.4 Media**

- **Routes – `MediaRoutes.js`**
  - `POST /media/create` (upload) and `POST /media/delete`.

- **Service – `Media.js`**
  - Wraps DigitalOcean Spaces operations via `DigitalOceanSpacesManager`.
  - Manages media metadata documents in MongoDB.

#### **3.5 Users & auth**

- **Routes – `UserRoutes.js`**
  - `GET /user/login` → Google OAuth entry, guarded by `signupAdminMiddleware`.
  - `GET /user/login/callback` → OAuth callback handler.
  - `GET /user/:userId` → get authenticated admin/user.
  - `GET /user/customer` → list all customers.
  - `GET /user/customer/:customerId` → get a specific customer.
  - `GET /user/customer/unblock/:customerId` → unblock user.
  - `GET /user/logout/:userId` → logout.

- **Service – `UserService.js`**
  - Orchestrates Passport for Google OAuth.
  - Creates/updates admin user records.
  - Provides customer lookup and blocking/unblocking helpers used by `BookingService`.

#### **3.6 Blog**

- **Routes – `BlogRoutes.js`** (Fully implemented)
  - `POST /blog` → `createBlogPost`
  - `GET /blog` → `getAllBlogPosts` (supports `?published=true/false` query param)
  - `GET /blog/:blogId` → `getBlogPostById`
  - `GET /blog/slug/:slug` → `getBlogPostBySlug` (for public-facing routes)
  - `PUT /blog/:blogId` → `updateBlogPost`
  - `DELETE /blog/:blogId` → `deleteBlogPost`

- **Service – `BlogService.js`** (Fully implemented)
  - Full CRUD operations for blog posts.
  - Slug uniqueness validation.
  - Published/draft status management.
  - Automatic `publishedAt` timestamp when publishing.

### **4. Flows (server perspective)**

- **Customer booking flow**
  1. Frontend calls `POST /schedule/date` to get a schedule for a selected date.
  2. Frontend calls `POST /hair-service/available` with schedule/time to get valid services.
  3. Frontend posts `POST /booking` with customer/service/schedule data.
  4. Server runs validation, user lookup, and transactional updates (booking, schedule, user bookings).
  5. Admin and customer can later view/update booking state through booking and user routes.

- **Admin operational flow**
  1. Admin authenticates via `/user/login` (Google).
  2. Configures availability via `/schedule/*`.
  3. Maintains the service catalog via `/hair-service/*`.
  4. Uses `/booking/get-bookings` with appointment date filters for dashboard view.
  5. Uses `/booking/update`, `/booking/cancel`, and `/booking/income-report` for operational control and reporting.
  6. Manages media assets via `/media/*`.
  7. Manages blog content via `/blog/*`.

### **5. Bugs & issues (server)**

- **Fixed since initial analysis**
  - **User route path bug**: `GET /user/customer/:customerId` path corrected.
  - **Missed-booking blocking logic**: Now properly uses `BookingModel` and compares `missedBookings.length`.
  - **`cancelBookingByUser`**: Implemented with validation and error handling.
  - **DB URL logging**: Replaced raw connection string logging with a neutral log message.
  - **Appointment date filtering**: Implemented filtering by actual schedule date (not just creation date).
  - **Pagination**: Added pagination support to `getBookings` endpoint.
  - **Booking sorting**: Implemented smart sorting (upcoming first, then past).
  - **Error handling standardization**: ✅ **FIXED** - `errorHandler` now uses `ReturnObject` format consistently.
  - **Rate limiting**: ✅ **FIXED** - All write-heavy endpoints now have rate limiting applied:
    - Booking routes: create, update, cancel
    - Blog routes: create, update, delete
    - Schedule routes: create, update, remove-slot, delete
    - Hair services routes: all add/update/delete operations
    - Media routes: create, delete
  - **Spelling/typo fixes**: ✅ **FIXED** - Fixed "messsage" → "message" typos in error handlers across route files.

- **Current issues / technical nuances**
  - **CORS/Routing issue**: 
    - Frontend requests may be hitting Remix server instead of Express API server if API server is not running.
    - Ensure API server is running on port 3000 (or update frontend config).
    - CORS middleware automatically handles OPTIONS preflight requests (no explicit OPTIONS method needed).
  - Mixed use of the native Mongo driver and Mongoose in the same service increases mental overhead but is functionally acceptable.
  - **Security hardening** (intentionally not changed as per instructions):
    - CSRF/cookie flags/middleware standardization still need a deeper review before production.

### **6. Completed work (recent additions)**

- **Blog feature** ✅ **COMPLETE**
  - Blog model, service, and routes fully implemented.
  - Full CRUD operations available.
  - Frontend blog pages now consume the API (no longer static).
  - Admin blog management interface implemented.

- **Booking filtering enhancements** ✅ **COMPLETE**
  - Appointment date filtering by schedule date (not just creation date).
  - Pagination support with configurable page size.
  - Smart sorting: upcoming appointments first, then past appointments.
  - Booking summary endpoint for dashboard statistics.

### **7. Tasks left to complete**

- **Admin notification emails**
  - TODO remains in `createBooking` to send admin emails on new bookings using nodemailer + SMTP.

- **Income reporting enhancements** ✅ **COMPLETE**
  - Basic income reporting (total revenue + completed count + counts by status) is implemented and wired to the frontend.
  - Date range filtering supported for income reports.
  - Future enhancements could include:
    - Category-level and service-level revenue breakdowns.
    - Per-period comparisons (e.g., month-over-month).
    - Integration with tax/fees or export formats (CSV).

- **Search & filtering** ✅ **COMPLETE**
  - Bookings now support status + date-range + appointment date filtering.
  - Pagination implemented for large result sets.
  - Smart sorting (upcoming first, then past) implemented.
  - Additional filters (by customer name, service category, or price bands) can be added as future enhancements if needed.

- **Security / production readiness**
  - A dedicated pass to harden security:
    - Cookie flags (`HttpOnly`, `Secure`).
    - Centralized auth guards for admin-only routes.
    - Rate-limiting strategy review.
  - This is intentionally deferred, per the "do not fix stronger security hardening yet" requirement.

- **Performance optimizations**
  - Consider indexing on frequently queried fields (appointment dates, status).
  - Evaluate caching strategy for schedule and service catalog data.
  - Consider database query optimization for large booking datasets.
