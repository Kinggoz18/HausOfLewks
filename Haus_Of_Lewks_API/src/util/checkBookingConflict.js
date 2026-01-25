import dayjs from 'dayjs';
import BookingModel from '../models/Bookings.js';

const doesConflictExist = async (scheduleId, proposedStart, duration) => {
  const proposedStartTime = dayjs(proposedStart);
  const proposedEndTime = proposedStartTime.add(duration, 'milliseconds');

  const now = dayjs();

  // Only check future bookings on this schedule
  const bookings = await BookingModel.find({
    scheduleId,
    startTime: { $gte: now.toDate() }
  });

  return bookings.some((b) => {
    const existingStart = dayjs(b.startTime);
    const existingEnd = existingStart.add(b.service.duration, 'milliseconds');
    return (
      proposedStartTime.isBefore(existingEnd) &&
      proposedEndTime.isAfter(existingStart)
    );
  });
};
