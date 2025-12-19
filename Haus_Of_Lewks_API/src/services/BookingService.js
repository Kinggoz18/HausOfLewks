import { MongoClient, ObjectId } from 'mongodb';
import BookingModel from '../models/Bookings.js';
import ScheduleModel from '../models/Schedule.js';
import { ReturnObject } from '../util/returnObject.js';
import { ScheduleService } from './ScheduleService.js';
import UserService from './UserService.js';
import { serverEnvVaiables } from '../config/enviornment.js';

export class BookingService {
  dbUrl = serverEnvVaiables.mongoDbUrl;

  /**
   * @param {UserService} userService
   * @param {ScheduleService} scheduleService
   */
  constructor(userService, scheduleService) {
    this.userService = userService;
    this.scheduleService = scheduleService;
  }

  /**
   * Creates a user booking
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns
   */
  createBooking = async (req, res) => {
    const {
      firstName,
      lastName,
      phone,
      email,
      startTime,
      AdditionalNotes,
      customServiceDetail,
      scheduleId,
      service
    } = req.body;

    try {
      if (
        !firstName ||
        !lastName ||
        !phone ||
        !email ||
        !startTime ||
        !service ||
        !service?.duration ||
        !service?.title
      ) {
        console.error('Invalid request argument');
        const response = ReturnObject(false, 'Invalid request argument');
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
        console.error('Failed to get user for booking');
        const response = ReturnObject(
          false,
          'Error: Failed to get user for booking'
        );
        return res.status(400).send(response);
      }

      if (user.isBlocked) {
        console.error(
          'Cannot proceed with booking, due to missed appointments in the past. Contact directly to proceed with booking.'
        );
        const response = ReturnObject(
          false,
          'Cannot proceed with booking, due to missed appointments in the past. Contact directly to proceed with booking.'
        );
        return res.status(400).send(response);
      }

      const dbClient = this.getDbClient();
      const session = dbClient.startSession();
      let newBookingReference = null;

      //Run in transaction
      try {
        await session.withTransaction(async () => {
          const scheduleCollection = dbClient
            .db('test')
            .collection('schedules');

          const userCollection = dbClient.db('test').collection('users');

          const bookingCollection = dbClient.db('test').collection('bookings');

          // Convert scheduleId to ObjectId if it's a string
          const scheduleObjectId =
            scheduleId instanceof ObjectId
              ? scheduleId
              : ObjectId.createFromHexString(scheduleId);

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
        console.error('Error while creating booking', error?.message ?? error);
        await session.endSession();
        await dbClient.close();
        const response = ReturnObject(
          false,
          error?.message ?? 'Error while creating booking'
        );
        return res.status(400).send(response);
      } finally {
        await session.endSession();
        await dbClient.close();
      }

      /**
       * TODO: Send email to notify the admin
       * Implement with nodemailer and google smtp
       */

      const response = ReturnObject(true, 'Booking created');
      return res.status(201).send(response);
    } catch (error) {
      console.log({ error });
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
    const { firstName, lastName, phone, email } = req.body;
    let bookings;

    if (!phone && !email) {
      const response = ReturnObject(false, 'Missing customers phone or email');
      return res.status(400).send(response);
    }

    if (!firstName || !lastName) {
      const response = ReturnObject(false, 'Missing customers name');
      return res.status(400).send(response);
    }

    try {
      if (phone)
        bookings = await BookingModel.find({ phone, firstName, lastName });
      else if (email) {
        bookings = await BookingModel.find({ email, firstName, lastName });
      }

      const response = ReturnObject(true, bookings);
      return res.status(200).send(response);
    } catch (error) {
      console.log('Error in getUserBookings:', error?.message ?? error);
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
    const {
      status,
      from,
      to,
      appointmentDateFrom,
      appointmentDateTo,
      page,
      pageSize
    } = req.body ?? {};

    const pageNumber = Number(page) && Number(page) > 0 ? Number(page) : 1;
    const limit =
      Number(pageSize) && Number(pageSize) > 0 && Number(pageSize) <= 200
        ? Number(pageSize)
        : 100;

    try {
      const query = {};

      if (status) {
        query.status = status;
      }

      if (from || to) {
        query.createdAt = {};
        if (from) {
          query.createdAt.$gte = new Date(from);
        }
        if (to) {
          query.createdAt.$lte = new Date(to);
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
      console.log('Error in getBookings:', error?.message ?? error);
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

      return res.status(200).send(response);
    } catch (error) {
      console.log('Error in getBookingSummary:', error?.message ?? error);
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
      console.log('Error in getIncomeReport:', error?.message ?? error);
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
      console.log('Error in getBookingById:', error?.message ?? error);
      const response = ReturnObject(
        false,
        'Something went wrong while getting booking by id'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Update a booking status to: Pending, Completed, Missed, Cancelled
   * @param {import('express').Response} req
   * @param {import('express').Request} res
   */
  updateBookingById = async (req, res) => {
    const { bookingId, status, price } = req.body;

    if (!bookingId || (!status && !price)) {
      const response = ReturnObject(false, 'Invalid request arguments');
      return res.status(400).send(response);
    }

    try {
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

      booking.status = status ? status : booking.status;
      booking.total = price ? price : booking.total;

      await booking.save();

      const response = ReturnObject(true, 'Booking status updated');
      return res.status(200).send(response);
    } catch (error) {
      console.log('Error in updateBookingStatusById:', error?.message ?? error);
      const response = ReturnObject(
        false,
        'Something went wrong while updating booking'
      );
      return res.status(400).send(response);
    }
  };

  cancelBookingByUser = async (req, res) => {
    try {
      const { bookingId } = req.body;

      if (!bookingId) {
        const response = ReturnObject(false, 'Invalid request arguments');
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

      const response = ReturnObject(true, 'Booking cancelled');
      return res.status(200).send(response);
    } catch (error) {
      console.log('Error in cancelBookingByUser:', error?.message ?? error);
      const response = ReturnObject(
        false,
        'Something went wrong while cancelling booking'
      );
      return res.status(400).send(response);
    }
  };

  getDbClient = () => {
    console.log('Connecting to MongoDB client for bookings');
    const client = new MongoClient(this.dbUrl);
    return client;
  };
}
