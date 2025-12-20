import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import BookingModel from '../models/Bookings.js';
import ScheduleModel from '../models/Schedule.js';
import { ReturnObject } from '../util/returnObject.js';
import { ScheduleService } from './ScheduleService.js';
import UserService from './UserService.js';
import EmailService from './EmailService.js';
import AdminModel from '../models/Admin.js';
import logger from '../util/logger.js';
import dbConnectionPool from '../util/dbConnectionPool.js';
import { 
  sanitizeString, 
  sanitizeEmail, 
  sanitizePhone, 
  validateObjectId, 
  validateNumber,
  validateRequired, 
  validateDate
} from '../util/inputValidator.js';

export class BookingService {
  /**
   * @param {UserService} userService
   * @param {ScheduleService} scheduleService
   */
  constructor(userService, scheduleService) {
    this.userService = userService;
    this.scheduleService = scheduleService;
  }

  /**
   * Get email recipients (Owners only, not Developer or Employee)
   * @returns {Promise<string[]>} Array of owner email addresses
   */
  getOwnerEmails = async () => {
    try {
      const owners = await AdminModel.find({ role: 'Owner' }).select('googleEmail');
      return owners
        .map((owner) => owner.googleEmail)
        .filter((email) => email); // Filter out null/undefined emails
    } catch (error) {
      logger.error('Error getting owner emails', error);
      return [];
    }
  };

  /**
   * Creates a user booking
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns
   */
  createBooking = async (req, res) => {
    // Sanitize and validate input
    const rawData = req.body;
    const firstName = sanitizeString(rawData.firstName, 100);
    const lastName = sanitizeString(rawData.lastName, 100);
    const phone = sanitizePhone(rawData.phone);
    const email = sanitizeEmail(rawData.email);
    const startTime = sanitizeString(rawData.startTime, 20);
    const AdditionalNotes = rawData.AdditionalNotes ? sanitizeString(rawData.AdditionalNotes, 1000) : undefined;
    const customServiceDetail = rawData.customServiceDetail ? sanitizeString(rawData.customServiceDetail, 500) : undefined;
    const scheduleId = validateObjectId(rawData.scheduleId);
    const service = rawData.service;

    try {
      // Validate required fields
      const requiredValidation = validateRequired(
        { firstName, lastName, phone, email, startTime, scheduleId, service },
        ['firstName', 'lastName', 'phone', 'email', 'startTime', 'scheduleId', 'service']
      );

      if (!requiredValidation.valid) {
        logger.warn('Missing required fields in booking creation', { 
          missing: requiredValidation.missing 
        });
        const response = ReturnObject(
          false, 
          `Missing required fields: ${requiredValidation.missing.join(', ')}`
        );
        return res.status(400).send(response);
      }

      if (!service?.duration || !service?.title) {
        logger.warn('Invalid service data in booking creation', { service });
        const response = ReturnObject(false, 'Invalid service data: duration and title are required');
        return res.status(400).send(response);
      }

      //Get the customer
      const user = await this.userService.getCustomerForBooking(
        firstName,
        lastName,
        phone,
        email
      );

      if (!user) {
        logger.error('Failed to get user for booking', { firstName, lastName, phone, email });
        const response = ReturnObject(
          false,
          'Error: Failed to get user for booking'
        );
        return res.status(400).send(response);
      }

      if (user.isBlocked) {
        logger.warn('Blocked user attempted to create booking', { 
          userId: user._id, 
          email 
        });
        const response = ReturnObject(
          false,
          'Cannot proceed with booking, due to missed appointments in the past. Contact directly to proceed with booking.'
        );
        return res.status(400).send(response);
      }

      // Use connection pool for transactions
      const dbClient = await dbConnectionPool.getClient();
      const session = dbClient.startSession();
      let newBookingReference = null;
      const dbName = dbConnectionPool.getDbName();

      //Run in transaction
      try {
        await session.withTransaction(async () => {
          const scheduleCollection = dbClient
            .db(dbName)
            .collection('schedules');

          const userCollection = dbClient.db(dbName).collection('users');

          const bookingCollection = dbClient.db(dbName).collection('bookings');

          // scheduleId is already validated as ObjectId
          const scheduleObjectId = scheduleId;

          //Create the booking
          newBookingReference = await bookingCollection.insertOne(
            {
              firstName,
              lastName,
              phone,
              email,
              startTime,
              AdditionalNotes,
              customServiceDetail,
              scheduleId: scheduleObjectId,
              service,
              status: 'Upcoming'
            },
            { session }
          );

          let totalDuration = Number(service?.duration);
          const addOns = service?.AddOns;

          addOns?.forEach((element) => {
            totalDuration += Number(element?.duration);
          });

          //Update the available schedule
          const updatedSchedule =
            await this.scheduleService.updateScheduleAfterBooking(
              scheduleId,
              {
                _id: newBookingReference?.insertedId,
                duration: totalDuration,
                startTime: startTime
              },
              scheduleCollection,
              session
            );

          //Update the users bookings
          await userCollection.updateOne(
            { _id: user?._id },
            {
              $push: { bookings: newBookingReference?.insertedId }
            },
            { session }
          );

          if (!updatedSchedule) {
            throw new Error('Failed to update schedule after booking');
          }
        });
      } catch (error) {
        logger.error('Error while creating booking', error, {
          firstName,
          lastName,
          email,
          scheduleId: scheduleId?.toString()
        });
        await session.endSession();
        // Don't close the client - it's managed by the connection pool
        const response = ReturnObject(
          false,
          error?.message ?? 'Error while creating booking'
        );
        return res.status(400).send(response);
      } finally {
        await session.endSession();
        // Don't close the client - it's managed by the connection pool
      }

      // Send email notifications to customer and owner
      try {
        const ownerEmails = await this.getOwnerEmails();
        const recipientEmails = [email, ...ownerEmails].filter(Boolean);

        if (recipientEmails.length > 0) {
          // Get schedule details for email
          const schedule = await ScheduleModel.findById(scheduleId);
          const scheduleDate = schedule
            ? `${schedule.month} ${schedule.day}, ${schedule.year}`
            : 'N/A';

          const emailSubject = 'Booking Confirmation - Haus of Lewks';
          const customerEmailHtml = `
            <h2>Booking Confirmation</h2>
            <p>Dear ${firstName} ${lastName},</p>
            <p>Your booking has been confirmed!</p>
            <p><strong>Service:</strong> ${service.title}</p>
            <p><strong>Date:</strong> ${scheduleDate}</p>
            <p><strong>Time:</strong> ${startTime}</p>
            ${AdditionalNotes ? `<p><strong>Additional Notes:</strong> ${AdditionalNotes}</p>` : ''}
            <p>We look forward to seeing you!</p>
            <p>Best regards,<br>Haus of Lewks</p>
          `;

          const ownerEmailHtml = `
            <h2>New Booking Notification</h2>
            <p>A new booking has been created:</p>
            <p><strong>Customer:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Service:</strong> ${service.title}</p>
            <p><strong>Date:</strong> ${scheduleDate}</p>
            <p><strong>Time:</strong> ${startTime}</p>
            ${AdditionalNotes ? `<p><strong>Additional Notes:</strong> ${AdditionalNotes}</p>` : ''}
          `;

          // Send email to customer
          const customerEmailResult = await EmailService.sendEmail(
            {
              to: email,
              subject: emailSubject,
              html: customerEmailHtml
            },
            'booking'
          );

          if (!customerEmailResult.success) {
            logger.warn('Failed to send booking confirmation email to customer', {
              email,
              error: customerEmailResult.error,
              code: customerEmailResult.code,
              limitInfo: customerEmailResult.limitInfo
            });
          }

          // Send email to owners if any
          if (ownerEmails.length > 0) {
            const ownerEmailResult = await EmailService.sendEmail(
              {
                to: ownerEmails,
                subject: 'New Booking - Haus of Lewks',
                html: ownerEmailHtml
              },
              'booking'
            );

            if (!ownerEmailResult.success) {
              logger.warn('Failed to send booking notification email to owners', {
                ownerEmails,
                error: ownerEmailResult.error,
                code: ownerEmailResult.code,
                limitInfo: ownerEmailResult.limitInfo
              });
            }
          }
        }
      } catch (emailError) {
        // Log email error but don't fail the booking creation
        logger.error('Error sending booking confirmation emails', emailError, {
          email,
          bookingId: newBookingReference?.insertedId?.toString()
        });
      }

      logger.info('Booking created successfully', {
        bookingId: newBookingReference?.insertedId?.toString(),
        email,
        service: service?.title
      });

      const response = ReturnObject(true, 'Booking created');
      return res.status(201).send(response);
    } catch (error) {
      logger.error('Unexpected error while creating booking', error, {
        email,
        scheduleId: scheduleId?.toString()
      });
      const response = ReturnObject(
        false,
        'Something went wrong while creating booking'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Get all bookings for a user
   * @param {import('express').Response} req
   * @param {import('express').Request} res
   */
  getUserBookings = async (req, res) => {
    // Sanitize and validate input
    const firstName = sanitizeString(req.body.firstName, 100);
    const lastName = sanitizeString(req.body.lastName, 100);
    const phone = req.body.phone ? sanitizePhone(req.body.phone) : null;
    const email = req.body.email ? sanitizeEmail(req.body.email) : null;

    if (!phone && !email) {
      const response = ReturnObject(false, 'Missing customer phone or email');
      return res.status(400).send(response);
    }

    if (!firstName || !lastName) {
      const response = ReturnObject(false, 'Missing customer name');
      return res.status(400).send(response);
    }

    try {
      let bookings;
      if (phone) {
        bookings = await BookingModel.find({ phone, firstName, lastName });
      } else if (email) {
        bookings = await BookingModel.find({ email, firstName, lastName });
      }

      logger.debug('User bookings retrieved', {
        firstName,
        lastName,
        count: bookings?.length || 0
      });

      const response = ReturnObject(true, bookings);
      return res.status(200).send(response);
    } catch (error) {
      logger.error('Error in getUserBookings', error, {
        firstName,
        lastName,
        hasPhone: !!phone,
        hasEmail: !!email
      });
      const response = ReturnObject(
        false,
        'Something went wrong while getting user bookings'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Get bookings
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getBookings = async (req, res) => {
    try {
      // Sanitize and validate input
      const status = req.body?.status ? sanitizeString(req.body.status, 50) : null;
      const from = req.body?.from ? validateDate(req.body.from) : null;
      const to = req.body?.to ? validateDate(req.body.to) : null;
      const appointmentDateFrom = req.body?.appointmentDateFrom ? validateDate(req.body.appointmentDateFrom) : null;
      const appointmentDateTo = req.body?.appointmentDateTo ? validateDate(req.body.appointmentDateTo) : null;
      const page = validateNumber(req.body?.page, 1);
      const pageSize = validateNumber(req.body?.pageSize, 1, 200);

      const pageNumber = page || 1;
      const limit = pageSize || 100;

      // Validate status if provided
      if (status && !['Upcoming', 'Completed', 'Cancelled', 'Missed'].includes(status)) {
        logger.warn('Invalid booking status in getBookings', { status });
        const response = ReturnObject(false, 'Invalid booking status');
        return res.status(400).send(response);
      }

      const query = {};

      if (status) {
        query.status = status;
      }

      if (from || to) {
        query.createdAt = {};
        if (from) {
          query.createdAt.$gte = from;
        }
        if (to) {
          query.createdAt.$lte = to;
        }
      }

      // Note: total count will be calculated after appointment date filtering
      // since appointment date filtering happens after schedule join

      // Get all bookings
      const allBookings = await BookingModel.find(query).lean();

      // Helper to normalize ObjectId to string
      const toIdString = (id) => {
        if (!id) return null;
        if (typeof id === 'string') return id;
        if (id.toString) return id.toString();
        return String(id);
      };

      // Get all unique schedule IDs
      const scheduleIds = [
        ...new Set(
          allBookings
            .map((b) => b.scheduleId)
            .filter((id) => id)
            .map(toIdString)
        )
      ];

      // Fetch all schedules
      const schedules = await ScheduleModel.find({
        _id: { $in: scheduleIds }
      }).lean();

      // Create a map for quick lookup
      const scheduleMap = new Map();
      schedules.forEach((s) => {
        scheduleMap.set(toIdString(s._id), s);
      });

      // Helper to convert month name to number
      const monthToNumber = (month) => {
        const months = {
          January: 1,
          February: 2,
          March: 3,
          April: 4,
          May: 5,
          June: 6,
          July: 7,
          August: 8,
          September: 9,
          October: 10,
          November: 11,
          December: 12
        };
        return months[month] || 1;
      };

      // Helper to get appointment date
      const getAppointmentDate = (booking) => {
        const scheduleIdStr = toIdString(booking.scheduleId);
        const schedule = scheduleMap.get(scheduleIdStr);
        if (schedule && schedule.year && schedule.month && schedule.day) {
          return new Date(
            parseInt(schedule.year),
            monthToNumber(schedule.month) - 1,
            parseInt(schedule.day)
          );
        }
        return booking.createdAt;
      };

      // Attach schedule and filter by appointment date if specified
      const now = new Date();
      let bookingsWithSchedule = allBookings.map((booking) => {
        const scheduleIdStr = toIdString(booking.scheduleId);
        const schedule = scheduleMap.get(scheduleIdStr);
        const appointmentDate = getAppointmentDate(booking);
        return {
          ...booking,
          schedule: schedule
            ? { year: schedule.year, month: schedule.month, day: schedule.day }
            : null,
          _appointmentDate: appointmentDate // Temporary field for filtering/sorting
        };
      });

      // Filter by appointment date if specified
      if (appointmentDateFrom || appointmentDateTo) {
        // Helper to normalize date to start of day for comparison
        const normalizeToStartOfDay = (date) => {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          return d;
        };

        // Helper to normalize date to end of day for comparison
        const normalizeToEndOfDay = (date) => {
          const d = new Date(date);
          d.setHours(23, 59, 59, 999);
          return d;
        };

        const fromDate = appointmentDateFrom
          ? normalizeToStartOfDay(appointmentDateFrom)
          : null;
        const toDate = appointmentDateTo
          ? normalizeToEndOfDay(appointmentDateTo)
          : null;

        bookingsWithSchedule = bookingsWithSchedule.filter((booking) => {
          const appointmentDate = normalizeToStartOfDay(booking._appointmentDate);
          // Exclude if before fromDate
          if (fromDate && appointmentDate < fromDate) return false;
          // Exclude if after toDate (normalize toDate to start of day for comparison)
          if (toDate) {
            const toDateStart = normalizeToStartOfDay(toDate);
            if (appointmentDate > toDateStart) return false;
          }
          return true;
        });
      }

      // Sort: upcoming appointments first, then past appointments
      bookingsWithSchedule.sort((a, b) => {
        const dateA = a._appointmentDate;
        const dateB = b._appointmentDate;
        const isFutureA = dateA > now;
        const isFutureB = dateB > now;

        // Future appointments come first
        if (isFutureA && !isFutureB) return -1;
        if (!isFutureA && isFutureB) return 1;

        // Within same group, sort by date ascending
        return dateA - dateB;
      });

      // Remove temporary _appointmentDate field
      bookingsWithSchedule = bookingsWithSchedule.map((booking) => {
        const { _appointmentDate, ...rest } = booking;
        return rest;
      });

      // Calculate total after appointment date filtering
      const total = bookingsWithSchedule.length;

      // Apply pagination
      const bookings = bookingsWithSchedule.slice(
        (pageNumber - 1) * limit,
        pageNumber * limit
      );

      const response = ReturnObject(true, {
        items: bookings,
        total,
        page: pageNumber,
        pageSize: limit
      });
      return res.status(200).send(response);
    } catch (error) {
      logger.error('Error in getBookings', error);
      const response = ReturnObject(
        false,
        'Something went wrong while getting all bookings'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Get global booking summary counts by status
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getBookingSummary = async (req, res) => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/dd0cc213-dc1d-4cc3-b500-bf77b0de2dae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingService.js:584',message:'getBookingSummary entry - checking connection state',data:{mongooseReadyState:mongoose.connection.readyState,readyStateName:['disconnected','connected','connecting','disconnecting'][mongoose.connection.readyState],host:mongoose.connection.host,name:mongoose.connection.name,hasConnection:!!mongoose.connection},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,D'})}).catch(()=>{});
      // #endregion
      // #region agent log
      if (mongoose.connection.readyState !== 1) {
        fetch('http://127.0.0.1:7243/ingest/dd0cc213-dc1d-4cc3-b500-bf77b0de2dae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingService.js:587',message:'WARNING: Connection not ready before queries',data:{readyState:mongoose.connection.readyState,readyStateName:['disconnected','connected','connecting','disconnecting'][mongoose.connection.readyState]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,D'})}).catch(()=>{});
      }
      // #endregion
      const [completed, upcoming, cancelled, missed, total] = await Promise.all(
        [
          BookingModel.countDocuments({ status: 'Completed' }),
          BookingModel.countDocuments({ status: 'Upcoming' }),
          BookingModel.countDocuments({ status: 'Cancelled' }),
          BookingModel.countDocuments({ status: 'Missed' }),
          BookingModel.estimatedDocumentCount()
        ]
      );

      const response = ReturnObject(true, {
        completed,
        upcoming,
        cancelled,
        missed,
        total
      });

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/dd0cc213-dc1d-4cc3-b500-bf77b0de2dae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingService.js:603',message:'getBookingSummary success - queries completed',data:{completed,upcoming,cancelled,missed,total,mongooseReadyState:mongoose.connection.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,D'})}).catch(()=>{});
      // #endregion
      return res.status(200).send(response);
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/dd0cc213-dc1d-4cc3-b500-bf77b0de2dae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingService.js:606',message:'getBookingSummary error - connection state at error',data:{errorMessage:error?.message,errorCode:error?.code,errorName:error?.name,mongooseReadyState:mongoose.connection.readyState,readyStateName:['disconnected','connected','connecting','disconnecting'][mongoose.connection.readyState],host:mongoose.connection.host},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
      // #endregion
      logger.error('Error in getBookingSummary', error);
      const response = ReturnObject(
        false,
        'Something went wrong while getting booking summary'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Get aggregated income report
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getIncomeReport = async (req, res) => {
    const { from, to } = req.body ?? {};

    try {
      const match = {};

      // Only count completed bookings for income
      match.status = 'Completed';

      if (from || to) {
        match.createdAt = {};
        if (from) {
          match.createdAt.$gte = new Date(from);
        }
        if (to) {
          match.createdAt.$lte = new Date(to);
        }
      }

      // Get current date for month/year calculations
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 1-12

      // Calculate start of current month and current year
      const startOfCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
      const startOfCurrentYear = new Date(currentYear, 0, 1);

      // Total revenue and completed bookings (all time)
      const [totalResult] = await BookingModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalCompleted: { $sum: 1 }
          }
        }
      ]);

      // Current month stats
      const monthMatch = {
        ...match,
        createdAt: {
          $gte: startOfCurrentMonth,
          $lte: now
        }
      };

      const [currentMonthResult] = await BookingModel.aggregate([
        { $match: monthMatch },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalCompleted: { $sum: 1 }
          }
        }
      ]);

      // Current year stats
      const yearMatch = {
        ...match,
        createdAt: {
          $gte: startOfCurrentYear,
          $lte: now
        }
      };

      const [currentYearResult] = await BookingModel.aggregate([
        { $match: yearMatch },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalCompleted: { $sum: 1 }
          }
        }
      ]);

      // Stats per year (all completed bookings grouped by year)
      const statsPerYear = await BookingModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $year: '$createdAt' },
            totalRevenue: { $sum: '$total' },
            totalCompleted: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } }
      ]);

      // Stats per month (for current year, completed bookings grouped by month)
      const statsPerMonth = await BookingModel.aggregate([
        {
          $match: {
            ...match,
            createdAt: {
              $gte: startOfCurrentYear,
              $lte: now
            }
          }
        },
        {
          $group: {
            _id: { $month: '$createdAt' },
            totalRevenue: { $sum: '$total' },
            totalCompleted: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const response = ReturnObject(true, {
        totalRevenue: totalResult?.totalRevenue ?? 0,
        totalCompleted: totalResult?.totalCompleted ?? 0,
        currentMonth: {
          totalRevenue: currentMonthResult?.totalRevenue ?? 0,
          totalCompleted: currentMonthResult?.totalCompleted ?? 0
        },
        currentYear: {
          totalRevenue: currentYearResult?.totalRevenue ?? 0,
          totalCompleted: currentYearResult?.totalCompleted ?? 0
        },
        statsPerYear: statsPerYear.map((item) => ({
          year: item._id,
          totalRevenue: item.totalRevenue,
          totalCompleted: item.totalCompleted
        })),
        statsPerMonth: statsPerMonth.map((item) => ({
          month: item._id,
          totalRevenue: item.totalRevenue,
          totalCompleted: item.totalCompleted
        }))
      });

      return res.status(200).send(response);
    } catch (error) {
      logger.error('Error in getIncomeReport', error);
      const response = ReturnObject(
        false,
        'Something went wrong while getting income report'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Get booking by id
   * @param {import('express').Response} req
   * @param {import('express').Request} res
   */
  getBookingById = async (req, res) => {
    const { bookingId } = req.params;

    try {
      const booking = await BookingModel.findById(bookingId);

      if (!booking) {
        const response = ReturnObject(false, 'Booking not found');
        return res.status(404).send(response);
      }

      const response = ReturnObject(true, booking);
      return res.status(200).send(response);
    } catch (error) {
      logger.error('Error in getBookingById', error);
      const response = ReturnObject(
        false,
        'Something went wrong while getting booking by id'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Update a booking status to: Pending, Completed, Missed, Cancelled
   * ADMIN-ONLY: This endpoint should only be accessible by admin users.
   * Regular users cannot update their bookings directly.
   * @param {import('express').Response} req
   * @param {import('express').Request} res
   */
  updateBookingById = async (req, res) => {
    try {
      // Validate and sanitize input
      const bookingId = validateObjectId(req.body.bookingId);
      const status = req.body.status ? sanitizeString(req.body.status, 50) : null;
      const price = req.body.price ? validateNumber(req.body.price, 0) : null;

      if (!bookingId) {
        logger.warn('Invalid booking ID in updateBookingById', { 
          bookingId: req.body.bookingId 
        });
        const response = ReturnObject(false, 'Invalid booking ID');
        return res.status(400).send(response);
      }

      if (!status && !price) {
        logger.warn('Missing update fields in updateBookingById', { bookingId: bookingId?.toString() });
        const response = ReturnObject(false, 'Must provide status or price to update');
        return res.status(400).send(response);
      }

      // Validate status if provided
      if (status && !['Upcoming', 'Completed', 'Cancelled', 'Missed'].includes(status)) {
        logger.warn('Invalid booking status in updateBookingById', { status });
        const response = ReturnObject(false, 'Invalid booking status');
        return res.status(400).send(response);
      }

      const booking = await BookingModel.findById(bookingId);
      if (!booking) {
        const response = ReturnObject(false, 'Booking not found');
        return res.status(404).send(response);
      }

      if (status === 'Missed') {
        //Get the customer
        const bookingUser = await this.userService.getCustomerForBooking(
          booking.firstName,
          booking.lastName,
          booking.phone,
          booking.email
        );

        if (bookingUser) {
          // Check their past missed bookings
          const missedBookings = await BookingModel.find({
            email: bookingUser.email,
            firstName: bookingUser.firstName,
            lastName: bookingUser.lastName,
            status: 'Missed'
          });

          if (missedBookings.length >= 2) {
            //Block the user after repeated missed bookings
            await this.userService.blockUser(bookingUser?._id);
          }
        }
      }

      const oldStatus = booking.status;
      booking.status = status ? status : booking.status;
      booking.total = price ? price : booking.total;

      await booking.save();

      // Send email notification if status changed and customer should be notified
      if (status && status !== oldStatus && booking.email) {
        try {
          const statusEmails = ['Completed', 'Cancelled', 'Missed'];
          if (statusEmails.includes(status)) {
            // Get schedule details for email
            const schedule = await ScheduleModel.findById(booking.scheduleId);
            const scheduleDate = schedule
              ? `${schedule.month} ${schedule.day}, ${schedule.year}`
              : 'N/A';

            let emailSubject = '';
            let emailHtml = '';

            if (status === 'Completed') {
              emailSubject = 'Booking Completed - Haus of Lewks';
              emailHtml = `
                <h2>Booking Completed</h2>
                <p>Dear ${booking.firstName} ${booking.lastName},</p>
                <p>Your booking has been marked as completed.</p>
                <p><strong>Service:</strong> ${booking.service?.title || 'N/A'}</p>
                <p><strong>Date:</strong> ${scheduleDate}</p>
                <p><strong>Time:</strong> ${booking.startTime}</p>
                <p>Thank you for choosing Haus of Lewks!</p>
                <p>Best regards,<br>Haus of Lewks</p>
              `;
            } else if (status === 'Cancelled') {
              emailSubject = 'Booking Cancelled - Haus of Lewks';
              emailHtml = `
                <h2>Booking Cancelled</h2>
                <p>Dear ${booking.firstName} ${booking.lastName},</p>
                <p>Your booking has been cancelled.</p>
                <p><strong>Service:</strong> ${booking.service?.title || 'N/A'}</p>
                <p><strong>Date:</strong> ${scheduleDate}</p>
                <p><strong>Time:</strong> ${booking.startTime}</p>
                <p>If you have any questions, please contact us.</p>
                <p>Best regards,<br>Haus of Lewks</p>
              `;
            } else if (status === 'Missed') {
              emailSubject = 'Missed Appointment - Haus of Lewks';
              emailHtml = `
                <h2>Missed Appointment</h2>
                <p>Dear ${booking.firstName} ${booking.lastName},</p>
                <p>We noticed that you missed your scheduled appointment.</p>
                <p><strong>Service:</strong> ${booking.service?.title || 'N/A'}</p>
                <p><strong>Date:</strong> ${scheduleDate}</p>
                <p><strong>Time:</strong> ${booking.startTime}</p>
                <p>Please contact us to reschedule if needed.</p>
                <p>Best regards,<br>Haus of Lewks</p>
              `;
            }

            if (emailSubject && emailHtml) {
              const emailResult = await EmailService.sendEmail(
                {
                  to: booking.email,
                  subject: emailSubject,
                  html: emailHtml
                },
                'booking'
              );

              if (!emailResult.success) {
                logger.warn('Failed to send booking update email', {
                  bookingId: booking._id?.toString(),
                  email: booking.email,
                  status,
                  error: emailResult.error,
                  code: emailResult.code,
                  limitInfo: emailResult.limitInfo
                });
              }
            }
          }
        } catch (emailError) {
          // Log email error but don't fail the update
          logger.error('Error sending booking update email', emailError, {
            bookingId: booking._id?.toString(),
            status
          });
        }
      }

      const response = ReturnObject(true, 'Booking status updated');
      return res.status(200).send(response);
    } catch (error) {
      logger.error('Error in updateBookingStatusById', error);
      const response = ReturnObject(
        false,
        'Something went wrong while updating booking'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Cancel a booking
   * ADMIN-ONLY: This endpoint should only be accessible by admin users.
   * Regular users cannot cancel their bookings directly (would require email/SMS verification).
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  cancelBookingByUser = async (req, res) => {
    try {
      // Validate and sanitize input
      const bookingId = validateObjectId(req.body.bookingId);

      if (!bookingId) {
        logger.warn('Invalid booking ID in cancelBookingByUser', { 
          bookingId: req.body.bookingId 
        });
        const response = ReturnObject(false, 'Invalid booking ID');
        return res.status(400).send(response);
      }

      const booking = await BookingModel.findById(bookingId);
      if (!booking) {
        const response = ReturnObject(false, 'Booking not found');
        return res.status(404).send(response);
      }

      if (booking.status === 'Cancelled') {
        const response = ReturnObject(true, 'Booking already cancelled');
        return res.status(200).send(response);
      }

      booking.status = 'Cancelled';
      await booking.save();

      // Send email notifications to customer and owner
      try {
        const ownerEmails = await this.getOwnerEmails();
        const schedule = await ScheduleModel.findById(booking.scheduleId);
        const scheduleDate = schedule
          ? `${schedule.month} ${schedule.day}, ${schedule.year}`
          : 'N/A';

        // Email to customer
        if (booking.email) {
          const customerEmailHtml = `
            <h2>Booking Cancelled</h2>
            <p>Dear ${booking.firstName} ${booking.lastName},</p>
            <p>Your booking has been cancelled.</p>
            <p><strong>Service:</strong> ${booking.service?.title || 'N/A'}</p>
            <p><strong>Date:</strong> ${scheduleDate}</p>
            <p><strong>Time:</strong> ${booking.startTime}</p>
            <p>If you have any questions or would like to reschedule, please contact us.</p>
            <p>Best regards,<br>Haus of Lewks</p>
          `;

          await EmailService.sendEmail(
            {
              to: booking.email,
              subject: 'Booking Cancelled - Haus of Lewks',
              html: customerEmailHtml
            },
            'booking'
          );
        }

        // Email to owners
        if (ownerEmails.length > 0) {
          const ownerEmailHtml = `
            <h2>Booking Cancelled</h2>
            <p>A booking has been cancelled:</p>
            <p><strong>Customer:</strong> ${booking.firstName} ${booking.lastName}</p>
            <p><strong>Email:</strong> ${booking.email}</p>
            <p><strong>Phone:</strong> ${booking.phone}</p>
            <p><strong>Service:</strong> ${booking.service?.title || 'N/A'}</p>
            <p><strong>Date:</strong> ${scheduleDate}</p>
            <p><strong>Time:</strong> ${booking.startTime}</p>
          `;

          await EmailService.sendEmail(
            {
              to: ownerEmails,
              subject: 'Booking Cancelled - Haus of Lewks',
              html: ownerEmailHtml
            },
            'booking'
          );
        }
      } catch (emailError) {
        // Log email error but don't fail the cancellation
        logger.error('Error sending cancellation email', emailError);
      }

      const response = ReturnObject(true, 'Booking cancelled');
      return res.status(200).send(response);
    } catch (error) {
      logger.error('Error in cancelBookingByUser', error);
      const response = ReturnObject(
        false,
        'Something went wrong while cancelling booking'
      );
      return res.status(400).send(response);
    }
  };

}
