import { BookingService } from '../services/BookingService.js';
import rateLimit from 'express-rate-limit';
import logger from '../util/logger.js';

export class BookingRoute {
  bookingRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5
  });

  basePath = '/booking';

  /**
   * Default constructor
   * @param {BookingService} bookingService
   */
  constructor(bookingService) {
    this.bookingService = bookingService;
  }

  /**
   * Initialize Booking routes
   * @param {Router} router
   */
  async initRoutes(router) {
    try {
      router.post(`${this.basePath}`, this.bookingRateLimit, this.bookingService.createBooking);
      router.post(
        `${this.basePath}/get-bookings`,
        this.bookingService.getBookings
      );
      router.get(
        `${this.basePath}/summary`,
        this.bookingService.getBookingSummary
      );
      router.get(
        `${this.basePath}/:bookingId`,
        this.bookingService.getBookingById
      );
      // Admin-only: Update booking (status, price) - requires admin authentication
      router.post(
        `${this.basePath}/update`,
        this.bookingRateLimit,
        this.bookingService.updateBookingById
      );
      // Public: Users can find their bookings by providing their contact info
      router.post(
        `${this.basePath}/find-user-bookings`,
        this.bookingService.getUserBookings
      );
      // Admin-only: Cancel booking - requires admin authentication (users cannot cancel directly)
      router.post(
        `${this.basePath}/cancel`,
        this.bookingRateLimit,
        this.bookingService.cancelBookingByUser
      );
      router.post(
        `${this.basePath}/income-report`,
        this.bookingService.getIncomeReport
      );
    } catch (error) {
      logger.error('Failed to initialize booking routes', error);
    }
  }
}
