## Haus_Of_Lewks_API – Server Analysis (Updated)

### **1. List of Server Functions**

#### **1.1 Booking Service (`src/services/BookingService.js`)**

- `createBooking(req, res)` - Creates a new booking with transaction support, validates user, updates schedule availability, sends email notifications to customer and owners
- `getBookings(req, res)` - Retrieves bookings with filtering (status, creation date range, appointment date range), pagination, and smart sorting (upcoming first, then past)
- `getBookingSummary(req, res)` - Returns booking counts by status (completed, upcoming, cancelled, missed)
- `getBookingById(req, res)` - Gets a single booking by ID
- `updateBookingById(req, res)` - Updates booking status and/or total price, handles blocking users after repeated missed appointments
- `getUserBookings(req, res)` - Finds all bookings for a customer by contact information
- `cancelBookingByUser(req, res)` - Cancels a booking (sets status to Cancelled)
- `getIncomeReport(req, res)` - Generates income report with total revenue, completed count, and counts by status with optional date filtering
- `getOwnerEmails()` - Helper to retrieve owner email addresses for notifications
- `getDbClient()` - Returns MongoDB client instance for transactions

#### **1.2 Schedule Service (`src/services/ScheduleService.js`)**

- `createSchedule(req, res)` - Creates a new schedule for a specific date with time slots
- `updateSchedule(req, res)` - Updates an existing schedule's time slots
- `removeTimeslot(req, res)` - Removes a specific time slot from a schedule
- `deleteSchedule(req, res)` - Deletes an entire schedule
- `getScheduleById(req, res)` - Gets schedule by ID
- `getAllSchedule(req, res)` - Lists all schedules
- `getByDate(req, res)` - Gets schedule for a specific date
- `updateScheduleAfterBooking(scheduleId, startTime, duration)` - Helper to update schedule availability after booking creation

#### **1.3 Hair Services (`src/services/HairServices.js`)**

- `addHairService(req, res)` - Creates a new hair service
- `updateHairService(req, res)` - Updates an existing hair service
- `removeHairService(req, res)` - Deletes a hair service
- `addCategory(req, res)` - Creates a new service category with cover image upload
- `updateCategory(req, res)` - Updates a category with optional cover image
- `removeCategory(req, res)` - Deletes a category
- `addAddOn(req, res)` - Creates a new service add-on
- `updateAddon(req, res)` - Updates an add-on
- `removeAddon(req, res)` - Deletes an add-on
- `getServicesByCategory(req, res)` - Gets all services grouped by category
- `getCategories(req, res)` - Gets all categories
- `getAddons(req, res)` - Gets all add-ons
- `getAvailableHairServicesForSchedule(req, res)` - Computes which services fit in a given schedule time slot

#### **1.4 User Service (`src/services/UserService.js`)**

- `googleAuthHandler(req, res)` - Initiates Google OAuth authentication flow
- `googleAuthHandlerCallback(req, res)` - Handles Google OAuth callback, creates/updates admin users
- `getAuthenticatedUser(req, res)` - Gets authenticated user/admin by ID
- `getAllCustomer(req, res)` - Lists all customer users
- `getCustomerById(req, res)` - Gets a specific customer by ID
- `getCustomerForBooking(firstName, lastName, phone, email)` - Finds or creates customer for booking
- `blockUser(userId)` - Blocks a user (sets isBlocked flag)
- `unBlockUser(req, res)` - Unblocks a user
- `logout(req, res)` - Logs out a user and cleans up session

#### **1.5 Media Service (`src/services/Media.js`)**

- `getAllMedia(req, res)` - Gets all media with optional filtering (tag, type)
- `addMedia(req, res)` - Uploads media file to DigitalOcean Spaces and stores metadata
- `deleteMedia(req, res)` - Deletes media from storage and database

#### **1.6 Blog Service (`src/services/BlogService.js`)**

- `createBlogPost(req, res)` - Creates a new blog post with slug generation
- `getAllBlogPosts(req, res)` - Gets all blog posts with optional published status filter
- `getBlogPostById(req, res)` - Gets a blog post by ID
- `getBlogPostBySlug(req, res)` - Gets a blog post by slug (for public-facing routes)
- `updateBlogPost(req, res)` - Updates an existing blog post
- `deleteBlogPost(req, res)` - Deletes a blog post

#### **1.7 Email Service (`src/services/EmailService.js`)**

- `sendEmail(emailData, template)` - Sends email using configured SMTP transport
- Email templates for booking confirmations and notifications

#### **1.8 Google Drive Manager (`src/services/GoogleDriveManager.js`)**

- `serveImageFileDrive(req, res)` - Serves images from Google Drive for media library

#### **1.9 Route Handlers**

**Booking Routes (`src/routes/BookingRoutes.js`):**
- `POST /booking` - Create booking
- `POST /booking/get-bookings` - Get bookings with filters and pagination
- `GET /booking/summary` - Get booking summary counts
- `GET /booking/:bookingId` - Get booking by ID
- `POST /booking/update` - Update booking
- `POST /booking/find-user-bookings` - Find user bookings
- `POST /booking/cancel` - Cancel booking
- `POST /booking/income-report` - Get income report

**Schedule Routes (`src/routes/ScheduleRoutes.js`):**
- `POST /schedule/create` - Create schedule
- `POST /schedule/update` - Update schedule
- `POST /schedule/remove-slot` - Remove time slot
- `POST /schedule/delete` - Delete schedule
- `GET /schedule/:scheduleId` - Get schedule by ID
- `GET /schedule` - Get all schedules
- `POST /schedule/date` - Get schedule by date

**Hair Services Routes (`src/routes/HairServices.js`):**
- `POST /hair-service/service` - Add service
- `POST /hair-service/category` - Add category
- `POST /hair-service/add-on` - Add add-on
- `POST /hair-service/service/:id` - Remove service
- `POST /hair-service/category/:id` - Remove category
- `POST /hair-service/add-on/:id` - Remove add-on
- `POST /hair-service/update/service` - Update service
- `POST /hair-service/update/category` - Update category
- `POST /hair-service/update/add-on` - Update add-on
- `GET /hair-service` - Get services by category
- `GET /hair-service/category` - Get categories
- `GET /hair-service/add-on` - Get add-ons
- `POST /hair-service/available` - Get available services for schedule

**User Routes (`src/routes/UserRoutes.js`):**
- `GET /user/login` - Initiate Google OAuth
- `GET /user/login/callback` - OAuth callback
- `GET /user/:userId` - Get authenticated user
- `GET /user/customer` - Get all customers
- `GET /user/customer/:customerId` - Get customer by ID
- `GET /user/customer/unblock/:customerId` - Unblock customer
- `GET /user/logout/:userId` - Logout user

**Media Routes (`src/routes/MediaRoutes.js`):**
- `GET /media` - Get all media
- `POST /media/create` - Upload media
- `POST /media/delete` - Delete media
- `GET /media/drive/:id` - Serve image from Google Drive

**Blog Routes (`src/routes/BlogRoutes.js`):**
- `POST /blog` - Create blog post
- `GET /blog` - Get all blog posts
- `GET /blog/:blogId` - Get blog post by ID
- `GET /blog/slug/:slug` - Get blog post by slug
- `PUT /blog/:blogId` - Update blog post
- `DELETE /blog/:blogId` - Delete blog post

#### **1.10 Middleware**

- `authMiddleware.js` - Admin authentication middleware (signupAdminMiddleware)
- `protectMiddleware.js` - Route protection middleware
- Rate limiting middleware (applied to write-heavy endpoints)

#### **1.11 Utilities**

- `errorHandler.js` - Global error handler with ReturnObject format and standardized logging
- `returnObject.js` - ReturnObject helper for consistent API responses
- `generateCode.js` - Code generation utilities
- `checkBookingConflict.js` - Booking conflict detection
- `logger.js` - Centralized logging utility with log levels (ERROR, WARN, INFO, DEBUG) and consistent formatting
- `inputValidator.js` - Input validation and sanitization utilities (XSS prevention, email/phone validation, ObjectId validation, etc.)
- `dbConnectionPool.js` - Database connection pool manager for optimizing MongoDB transaction client reuse
- Enums: `BookingStatus.js`, `MediaType.js`, `UserRoles.js`

### **2. Main functions of the server**

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

### **5. Current Bugs and Issues (Server)**

**Critical Issues:**
- **CORS/Routing configuration**: 
  - Frontend requests may fail if API server is not running on port 3000.
  - Ensure API server is running before frontend attempts API calls.
  - CORS middleware handles OPTIONS preflight automatically (no explicit OPTIONS handlers needed).

**Non-Critical Issues / Technical Nuances:**
- **Mixed MongoDB drivers**: Services use both native MongoDB driver (for transactions) and Mongoose (for models), which increases complexity but is functionally acceptable. Connection pooling now implemented via `dbConnectionPool.js` to optimize transaction client reuse.

**Security Considerations (Intentionally Deferred):**
- Cookie flags (`HttpOnly`, `Secure`, `SameSite`) need review before production.
- CSRF protection not yet implemented.
- Admin route protection could be more centralized.
- Input sanitization could be enhanced for XSS prevention.

**Fixed Issues (Not to be included in current bugs):**
- ✅ **User route path bug**: `GET /user/customer/:customerId` path corrected.
- ✅ **Missed-booking blocking logic**: Now properly uses `BookingModel` and compares `missedBookings.length`.
- ✅ **`cancelBookingByUser`**: Implemented with validation and error handling.
- ✅ **DB URL logging**: Replaced raw connection string logging with neutral log message.
- ✅ **Appointment date filtering**: Implemented filtering by actual schedule date.
- ✅ **Pagination**: Added pagination support to `getBookings` endpoint.
- ✅ **Booking sorting**: Implemented smart sorting (upcoming first, then past).
- ✅ **Error handling standardization**: `errorHandler` now uses `ReturnObject` format consistently.
- ✅ **Rate limiting**: All write-heavy endpoints now have rate limiting applied.
  - Write operations: 5 requests per 15 minutes
  - Media image serving: 25 requests per 15 minutes
  - Blog operations: 10 requests per 15 minutes
- ✅ **Spelling/typo fixes**: Fixed "messsage" → "message" and "occured" → "occurred" typos across all files.
- ✅ **Admin notification emails**: Email notifications to customers and owners implemented in booking creation.
- ✅ **Logging standardization**: Created centralized `logger.js` utility with consistent formatting, log levels (ERROR, WARN, INFO, DEBUG), and contextual information. All `console.log/error` statements replaced with standardized logger calls.
- ✅ **Database connection management**: Implemented connection pool manager (`dbConnectionPool.js`) to reuse MongoDB clients for transactions instead of creating/closing per transaction. Reuses existing mongoose connections when available.
- ✅ **Email service error handling**: Enhanced error handling in `EmailService.js` with specific error codes (LIMIT_EXCEEDED, SMTP_LIMIT_EXCEEDED, AUTH_ERROR, CONNECTION_ERROR, SEND_ERROR) and detailed logging. Email failures are now properly logged with context but don't fail booking operations.
- ✅ **Input validation and sanitization**: Created comprehensive `inputValidator.js` utility with functions for:
  - String sanitization (XSS prevention, HTML tag removal, length limits)
  - Email validation and sanitization
  - Phone number validation and sanitization
  - ObjectId validation and conversion
  - Number validation with range checks
  - Date validation
  - Required field validation
  - Recursive object sanitization
- ✅ **Input validation in BookingService**: Added robust input validation and sanitization to `createBooking`, `getUserBookings`, `getBookings`, `updateBookingById`, and `cancelBookingByUser` methods.

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

### **7. Tasks Left to Complete (Server)**

**Remaining Development Tasks:**
- **Income reporting enhancements** (future improvements):
    - Category-level and service-level revenue breakdowns.
  - Per-period comparisons (e.g., month-over-month, year-over-year).
  - Integration with tax/fees calculations.
  - Export formats (CSV, PDF) for income reports.
  - Advanced analytics and reporting dashboards.

- **Search & filtering enhancements** (future improvements):
  - Additional filters: customer name, service category, price bands.
  - Full-text search for bookings and customer information.
  - Advanced sorting options (by price, duration, service type).
  - Export filtered booking lists to CSV.

- **Security / production readiness** (intentionally deferred):
  - Cookie flags hardening (`HttpOnly`, `Secure`, `SameSite`).
    - Centralized auth guards for admin-only routes.
  - Rate-limiting strategy review and fine-tuning.
  - CSRF protection implementation.
  - Input sanitization and validation improvements.
  - API key authentication for service-to-service calls.

- **Performance optimizations**:
  - Database indexing on frequently queried fields:
    - Appointment dates, booking status
    - Customer email, phone for lookup queries
    - Schedule dates and time slots
    - Blog post slugs for slug-based queries
  - Caching strategy:
    - Cache schedule and service catalog data (low-frequency changes)
    - Cache blog posts with TTL
    - Redis integration for session management
  - Database query optimization:
    - Optimize booking aggregation queries
    - Consider database connection pooling tuning
    - Evaluate query performance for large datasets

- **Additional features** (future considerations):
  - Booking reminders (email/SMS notifications before appointment)
  - Customer feedback/rating system
  - Loyalty program or rewards system
  - Multi-location support (if needed)
  - Staff management and scheduling
  - Inventory management for products

**Note:** Admin notification emails are ✅ **COMPLETE** - Email notifications to both customers and owners are implemented in `createBooking`.
