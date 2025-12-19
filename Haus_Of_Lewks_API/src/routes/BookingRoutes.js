import { BookingService } from '../services/BookingService.js';
import rateLimit from 'express-rate-limit';

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
      router.post(
        `${this.basePath}/update`,
        this.bookingRateLimit,
        this.bookingService.updateBookingById
      );
      router.post(
        `${this.basePath}/find-user-bookings`,
        this.bookingService.getUserBookings
      );
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
      console.error(error?.message ?? error ?? 'Failed to initialize routes');
    }
  }
}
