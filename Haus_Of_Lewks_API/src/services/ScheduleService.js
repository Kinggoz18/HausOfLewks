const { Collection } = 'mongoose';
import ScheduleModel from '../models/Schedule.js';
import { ReturnObject } from '../util/returnObject.js';
import { ObjectId } from 'mongodb';
import logger from '../util/logger.js';

export class ScheduleService {
  constructor() {}

  createSchedule = async (req, res) => {
    const { year, month, day, startTime, endTime } = req.body;

    try {
      if (!year || !month || !day || !startTime || !endTime) {
        const response = ReturnObject(
          false,
          'Schedule date argument is incomplete'
        );
        logger.warn('Missing schedule argument in request body');
        return res.status(400).send(response);
      }

      const currentDate = new Date();
      const scheduleDate = new Date(year, month - 1, day);

      if (scheduleDate < currentDate.setHours(0, 0, 0, 0)) {
        const response = ReturnObject(false, 'Invalid schedule date');
        logger.warn('Schedule date has already passed');
        return res.status(400).send(response);
      }

      const availableSlots = this.generateAvailableSlots(startTime, endTime);

      const newSchedule = await ScheduleModel.create({
        year,
        month,
        day,
        startTime,
        endTime,
        availableSlots,
        bookings: []
      });

      const response = ReturnObject(true, newSchedule);
      return res.status(201).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Something went wrong while creating schedule'
      );
      logger.error('Error in createSchedule', error);
      return res.status(500).send(response);
    }
  };

  updateSchedule = async (req, res) => {
    const { scheduleId, year, month, day, startTime, endTime } = req.body;

    try {
      const scheduleToUpdate = await ScheduleModel.findById(scheduleId);
      if (!scheduleToUpdate) {
        const response = ReturnObject(false, 'Schedule not found');
        logger.warn('Failed to find the schedule to update');
        return res.status(404).send(response);
      }
      const currentDate = new Date();

      if (year && year >= currentDate.getFullYear()) {
        scheduleToUpdate.year = year;
      }

      const currentMonth = currentDate.getMonth() + 1;

      if (month && month >= currentMonth) {
        scheduleToUpdate.month = month;
      }
      if (day && day >= currentDate.getDate()) {
        scheduleToUpdate.day = day;
      }

      const scheduleEnd = endTime ? endTime : scheduleToUpdate.endTime;
      const scheduleStart = startTime ? startTime : scheduleToUpdate.startTime;

      if (scheduleStart < scheduleEnd) {
        const availableSlots = this.generateAvailableSlots(
          scheduleStart,
          scheduleEnd
        );
        scheduleToUpdate.availableSlots = availableSlots;

        if (startTime) {
          scheduleToUpdate.startTime = startTime;
        }

        if (endTime) {
          scheduleToUpdate.endTime = endTime;
        }
      } else {
        const response = ReturnObject(
          false,
          `Invalid start time ${scheduleStart} and end time ${scheduleEnd}`
        );
        return res.status(400).send(response);
      }

      await scheduleToUpdate.save();
      const updated = await ScheduleModel.findById(scheduleToUpdate._id);
      if (!updated) {
        const response = ReturnObject(false, 'Updated schedule not found');
        logger.warn('Failed to find the updated schedule');
        return res.status(404).send(response);
      }

      const response = ReturnObject(true, updated);
      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Something went wrong while updating schedule'
      );
      logger.error('Error in createSchedule', error);
      return res.status(500).send(response);
    }
  };

  removeTimeslot = async (req, res) => {
    const { scheduleId, slot } = req.body;

    try {
      const scheduleToUpdate = await ScheduleModel.findById(scheduleId);
      if (!scheduleToUpdate) {
        const response = ReturnObject(false, 'Schedule not found');
        logger.warn('Failed to find the schedule to update');
        return res.status(404).send(response);
      }

      if (!Array.isArray(scheduleToUpdate.availableSlots)) {
        scheduleToUpdate.availableSlots = [];
      }

      const updatedSlots = scheduleToUpdate.availableSlots.filter(
        (s) => s !== slot
      );

      if (updatedSlots.length === scheduleToUpdate.availableSlots.length) {
        const response = ReturnObject(false, 'Timeslot not found in schedule');
        return res.status(404).send(response);
      }

      scheduleToUpdate.availableSlots = updatedSlots;
      await scheduleToUpdate.save();

      const updated = await ScheduleModel.findById(scheduleToUpdate._id);
      if (!updated) {
        const response = ReturnObject(false, 'Updated schedule not found');
        logger.warn('Failed to find the updated schedule');
        return res.status(404).send(response);
      }

      const response = ReturnObject(true, updated);
      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Something went wrong while removing timeslot'
      );
      logger.error('Error in createSchedule', error);
      return res.status(500).send(response);
    }
  };

  deleteSchedule = async (req, res) => {
    try {
      const { scheduleId } = req.body;
      if (!scheduleId) {
        const response = ReturnObject(false, 'Invalid request argument');
        return res.status(400).send(response);
      }

      const deletedSchedule = await ScheduleModel.deleteOne({
        _id: scheduleId
      });

      let response;
      if (!deletedSchedule.deletedCount) {
        response = ReturnObject(false, 'No schedule deleted');
      } else {
        response = ReturnObject(true, 'Schedule deleted successfully');
      }

      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Something went wrong while trying to delete schedule'
      );
      return res.status(500).send(response);
    }
  };

  getScheduleById = async (req, res) => {
    try {
      const { scheduleId } = req.params;
      if (!scheduleId) {
        const response = ReturnObject(false, 'Invalid request argument');
        return res.status(400).send(response);
      }

      const schedule = await ScheduleModel.findById(scheduleId);
      if (!schedule) {
        response = ReturnObject(false, 'Schedule not found');
        return res.status(404).send(response);
      }

      response = ReturnObject(true, schedule);
      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Something went wrong while getting schedule'
      );
      return res.status(500).send(response);
    }
  };

  getAllSchedule = async (req, res) => {
    try {
      const allSchedule = await ScheduleModel.find();
      response = ReturnObject(true, allSchedule);
      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Something went wrong while getting all schedule'
      );
      return res.status(500).send(response);
    }
  };

  getByDate = async (req, res) => {
    try {
      const { date } = req.body;

      if (!date) {
        return res.status(400).send(ReturnObject(false, 'Date is required'));
      }

      const jsDate = new Date(date);

      const year = jsDate.getFullYear().toString();
      const month = jsDate.toLocaleString('en-US', { month: 'long' });
      const day = jsDate.getDate().toString().padStart(2, '0');

      const queriedSchedule = await ScheduleModel.findOne({ year, month, day });

      const response = ReturnObject(true, queriedSchedule);
      return res.status(200).send(response);
    } catch (error) {
      logger.error('Error in deleteSchedule', error);
      const response = ReturnObject(
        false,
        'Something went wrong while getting schedule by date'
      );
      return res.status(500).send(response);
    }
  };

  updateScheduleAfterBooking = async (
    scheduleId,
    booking,
    scheduleCollection,
    session
  ) => {
    try {
      logger.debug('Booking made, updating schedule');

      if (!scheduleId || !booking?._id || !booking?.duration) {
        throw new Error('Missing arguments');
      }

      const scheduleObjectId =
        typeof scheduleId === 'string' ? new ObjectId(scheduleId) : scheduleId;

      const scheduleToUpdate = await scheduleCollection.findOne(
        {
          _id: scheduleObjectId
        },
        { session }
      );

      if (!scheduleToUpdate) {
        throw new Error('Schedule to update was not found');
      }

      const bookingStartTime = booking.startTime;
      const bookingId = booking._id;
      const serviceDuration = booking.duration;

      const updatedSlots = this.updateAvailableSlotsAfterBooking(
        bookingStartTime,
        serviceDuration,
        scheduleToUpdate.availableSlots
      );

      const updateResult = await scheduleCollection.updateOne(
        { _id: scheduleObjectId },
        {
          $set: { availableSlots: updatedSlots },
          $push: { bookings: bookingId }
        },
        { session }
      );

      if (updateResult.modifiedCount === 0) {
        throw new Error('Failed to update schedule');
      }

      const updatedSchedule = await scheduleCollection.findOne(
        {
          _id: scheduleObjectId
        },
        { session }
      );

      return updatedSchedule;
    } catch (error) {
      throw new Error(
        error?.message ??
          'Something went wrong while updating schedule after booking was made'
      );
    }
  };

  generateAvailableSlots = (startTime, endTime) => {
    try {
      const start = Number(startTime.split(':')[0]);
      const end = Number(endTime.split(':')[0]);
      const availableSlots = [];

      let currentSlot = start;

      while (true) {
        if (currentSlot === 24) currentSlot = 0;
        let postfix = currentSlot < 12 ? 'am' : 'pm';
        let hour = currentSlot.toString().padStart(2, '0');
        availableSlots.push(`${hour}:00${postfix}`);

        if (currentSlot >= end) break;

        currentSlot += 1;
      }

      return availableSlots;
    } catch (error) {
      throw new Error(
        error?.message ??
          'Something went wrong while generating available slots'
      );
    }
  };

  updateAvailableSlotsAfterBooking = (startTime, duration, availableSlots) => {
    try {
      const startHour = Number(startTime.split(':')[0]);
      const slotsToRemove = Math.ceil(Number(duration));

      const blockedHours = new Set();
      for (let i = 0; i < slotsToRemove; i++) {
        blockedHours.add(startHour + i);
      }

      const newSlots = availableSlots.filter((slot) => {
        const slotHour = Number(slot.split(':')[0]);
        return !blockedHours.has(slotHour);
      });

      return newSlots;
    } catch (error) {
      throw new Error(
        error?.message ?? 'Something went wrong while updating available slots'
      );
    }
  };
}
