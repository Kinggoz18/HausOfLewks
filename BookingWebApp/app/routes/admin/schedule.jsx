import React, { useEffect, useRef, useState } from "react";
import BookingCalendar from "../../Components/BookingCalendar";
import AddIcon from "../../images/AddIcon.svg";
import ExitIcon from "../../images/exitWhite.svg";
import CustomButton from "../../Components/CustomButton";
import ScheduleAPI from "../../../storage/APIs/schedule";
import {
  ErrorFeedback,
  SuccessFeedback,
  toggleFeedback,
} from "../../Components/UIFeedback";

const AddSchedulePopup = (props) => {
  const { handleAddSchedule, onExitClick, selectedDate } = props;
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");

  return (
    <div className="flex flex-col gap-4 absolute bg-white w-[95%] sm:w-[90%] md:w-[500px] max-w-[500px] rounded-xl ml-auto mr-auto left-0 right-0 top-[10%] sm:top-[15%] p-4 sm:p-6 shadow-xl z-50">
      <div className="w-full flex flex-row justify-between items-center">
        <h2 className="text-xl font-semibold">Add Schedule</h2>
        <img
          src={ExitIcon}
          alt="Exit icon"
          onClick={onExitClick}
          className="w-[24px] h-[24px] cursor-pointer opacity-70 hover:opacity-100"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm">Date:</label>
        <input
          type="date"
          readOnly
          disabled
          defaultValue={selectedDate?.toISOString().split("T")[0]}
          className="border border-neutral-300 rounded-lg p-2 bg-neutral-100"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm">Start Time:</label>
        <input
          type="time"
          value={start}
          onChange={(e) => setStart(e?.currentTarget?.value)}
          className="border border-neutral-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-green"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm">End Time:</label>
        <input
          type="time"
          value={end}
          onChange={(e) => setEnd(e?.currentTarget?.value)}
          className="border border-neutral-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-green"
        />
      </div>

      <div className="flex flex-col sm:flex-row w-full justify-end gap-3 pt-2">
        <CustomButton
          label="Cancel"
          onClick={onExitClick}
          isActive={true}
          className="bg-neutral-400 w-full sm:w-[120px] rounded-lg"
        />
        <CustomButton
          label="Create"
          onClick={() => handleAddSchedule(start, end)}
          isActive={true}
          className="bg-primary-green w-full sm:w-[120px] rounded-lg"
        />
      </div>
    </div>
  );
};

const TimeslotList = (props) => {
  const { schedule, onRemoveClick } = props;
  return (
    <div className="space-y-2">
      {schedule?.availableSlots?.map((element, index) => (
        <div
          key={index}
          className="flex flex-row w-full p-3 bg-white rounded-lg border border-neutral-200 justify-between items-center hover:bg-neutral-50"
        >
          <span className="font-medium">{element}</span>
          <button
            onClick={() => onRemoveClick(element)}
            className="bg-red-600 hover:bg-red-700 rounded-lg text-neutral-100 px-2 sm:px-3 py-1 text-xs sm:text-sm cursor-pointer transition-colors"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default function Schedule() {
  const scheduleAPIs = new ScheduleAPI();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [schedule, setSchedule] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isAddSchedule, setIsAddSchedule] = useState(false);

  const successRef = useRef(null);
  const errorRef = useRef(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  /************************************************************************************************************************/
  /*******************************************************{ Methods }******************************************************/
  /************************************************************************************************************************/
  const formatDate = (date) => {
    const options = { weekday: "long", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const formatDateParts = (date) => {
    if (!(date instanceof Date)) return null;

    const day = String(date.getDate()).padStart(2, "0"); // "27"
    const year = date.getFullYear(); // 2025

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = monthNames[date.getMonth()]; // "August"

    return { day, month, year };
  };

  const handleSetDateValue = async (value, event) => {
    setSelectedDate(value);
    await getScheduleByDate(value);
  };

  const getScheduleByDate = async (date) => {
    try {
      const schedule = await scheduleAPIs.getByDate(date);
      setSelectedSchedule({
        year: schedule?.year,
        month: schedule?.month,
        day: schedule?.day,
      });
      setSchedule(schedule);
    } catch (error) {
      setFeedbackMessage(error?.message);
      toggleFeedback(errorRef);
    }
  };

  const removeTimeSlot = async (slot) => {
    try {
      const data = {
        scheduleId: schedule?._id,
        slot: slot,
      };

      const updatedSchedule = await scheduleAPIs.removeSlot(data);
      setFeedbackMessage("Timeslot removed");
      toggleFeedback(successRef);
      setSchedule(updatedSchedule);
    } catch (error) {
      setFeedbackMessage(error?.message);
      toggleFeedback(errorRef);
    }
  };

  const clearTimeSlot = async () => {
    if (!schedule?._id) return;
    try {
      await scheduleAPIs.deleteSchedule(schedule?._id);
      setFeedbackMessage("Schedule deleted");
      toggleFeedback(successRef);
      setSchedule(null);
    } catch (error) {
      setFeedbackMessage(error?.message);
      toggleFeedback(errorRef);
      setSchedule(null);
    }
  };

  const closeAddSchedulePopup = () => {
    setIsAddSchedule(false);
  };

  const handleAddSchedule = async (start, end) => {
    const dateParts = formatDateParts(selectedDate);
    const data = {
      day: dateParts?.day,
      month: dateParts?.month,
      year: dateParts?.year,
      startTime: start,
      endTime: end,
    };

    try {
      const response = await scheduleAPIs.createSchedule(data);
      setFeedbackMessage("Schedule Added!");
      toggleFeedback(successRef);
      setIsAddSchedule(false);
      setSchedule(response);
    } catch (error) {
      setFeedbackMessage(
        "Sorry, something went wrong while trying to add schedule."
      );
      toggleFeedback(errorRef);
    }
  };

  /************************************************************************************************************************/
  /****************************************************{ UseEffects }******************************************************/
  /************************************************************************************************************************/
  useEffect(() => {
    getScheduleByDate(selectedDate);
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col gap-y-6">
      {isAddSchedule && (
        <div className="z-[20] fixed h-screen w-screen overflow-hidden bg-neutral-950/30 top-0 left-0">
          <AddSchedulePopup
            onExitClick={closeAddSchedulePopup}
            selectedDate={selectedDate}
            handleAddSchedule={handleAddSchedule}
          />
        </div>
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-semibold mb-2">Schedule Management</h1>
        <p className="text-xs sm:text-sm text-neutral-700 max-w-xl">
          Create and manage daily schedules. Select a date to view or edit its schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold mb-4">{formatDate(today)}</h2>
          <BookingCalendar
            value={selectedDate}
            onChange={handleSetDateValue}
            today={today}
            className="!items-start"
          />
        </div>

        <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
            <h2 className="text-base sm:text-lg font-semibold">Schedule Details</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <CustomButton
                label="Add Schedule"
                onClick={() => setIsAddSchedule(true)}
                isActive={true}
                className="bg-primary-green w-full sm:w-[140px] rounded-lg flex items-center justify-center gap-2"
              >
                <img src={AddIcon} alt="Add" className="h-3 w-3 sm:h-4 sm:w-4" />
              </CustomButton>
              {schedule?._id && (
                <CustomButton
                  label="Clear Schedule"
                  onClick={clearTimeSlot}
                  isActive={true}
                  className="bg-red-600 w-full sm:w-[140px] rounded-lg"
                />
              )}
            </div>
          </div>

          {schedule?._id ? (
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="font-semibold text-sm mb-3">
                Schedule for {formatDate(selectedDate)}
              </div>
              <div className="mb-3">
                <span className="text-sm text-neutral-600">Start Time: </span>
                <span className="font-medium">{schedule?.startTime || 'N/A'}</span>
              </div>
              <div className="mb-4">
                <span className="text-sm text-neutral-600">End Time: </span>
                <span className="font-medium">{schedule?.endTime || 'N/A'}</span>
              </div>
              {schedule?.availableSlots && schedule.availableSlots.length > 0 && (
                <div>
                  <div className="font-semibold text-sm mb-2">Available Time Slots</div>
                  <TimeslotList schedule={schedule} onRemoveClick={removeTimeSlot} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-600">
              No schedule for this date. Click "Add Schedule" to create one.
            </div>
          )}
        </div>
      </div>

      <SuccessFeedback
        ref={successRef}
        message={feedbackMessage}
      />

      <ErrorFeedback
        ref={errorRef}
        message={feedbackMessage}
      />
    </div>
  );
}
