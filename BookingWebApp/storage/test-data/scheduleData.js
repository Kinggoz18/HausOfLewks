const septemberSchedules = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  const dayString = day.toString().padStart(2, "0"); // e.g., "01", "02", ..., "31"

  return {
    _id: day,
    year: "2025",
    month: "August",
    day: dayString,
    startTime: "10:00am",
    endTime: "18:00pm",
  };
});

export const getScheduleByDate = (date) => {
  if (!(date instanceof Date)) return null;

  const year = date.getFullYear().toString();
  const month = date.toLocaleString("en-US", { month: "long" });
  const day = date.getDate().toString().padStart(2, "0");

  let foundSchedule =
    septemberSchedules.find(
      (schedule) =>
        schedule.year === year &&
        schedule.month === month &&
        schedule.day === day
    ) || null;

  if (foundSchedule) {
    const availableSlots = generateAvailableSlots(
      foundSchedule?.startTime,
      foundSchedule?.endTime
    );

    foundSchedule = {
      ...foundSchedule,
      availableSlots,
    };
  }

  return foundSchedule;
};

export const getScheduleInfoById = (id) => {
  const schedule = septemberSchedules.find((days) => days._id === id);
  return schedule;
};

const generateAvailableSlots = (startTime, endTime) => {
  try {
    const start = Number(startTime.split(":")[0]);
    const end = Number(endTime.split(":")[0]);
    const availableSlots = [startTime];

    let currentSlot = start;

    while (currentSlot < end - 1) {
      currentSlot += 1;

      // Reset to 0 at midnight
      if (currentSlot === 24) currentSlot = 0;
      let postfix = currentSlot < 12 ? "am" : "pm";
      let hour = currentSlot.toString().padStart(2, "0");
      availableSlots.push(`${hour}:00${postfix}`);
    }

    return availableSlots;
  } catch (error) {
    throw new Error(
      error?.message ?? "Something went wrong while generating available slots"
    );
  }
};

export default septemberSchedules;
