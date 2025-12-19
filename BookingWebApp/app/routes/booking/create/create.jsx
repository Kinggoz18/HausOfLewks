import PageHeader from "../../../Components/PageHeader";
import BookingCalendar from "../../../Components/BookingCalendar";
import { useContext, useEffect, useRef, useState } from "react";
import CustomButton from "../../../Components/CustomButton";
import { useNavigate } from "@remix-run/react";

import { AppContext } from "../../../../storage/AppProvider";
import ScheduleAPI from "../../../../storage/APIs/schedule";
import {
  ErrorFeedback,
  SuccessFeedback,
  toggleFeedback,
} from "../../../Components/UIFeedback";

export const meta = () => {
  const title = "Book an Appointment | Haus of Lewks";
  const description =
    "Choose your date and time to book a braids, locs, or protective styling appointment at Haus of Lewks in Peterborough.";

  return [
    { title },
    { name: "description", content: description },
  ];
};

export const links = () => [
  {
    rel: "canonical",
    href: "https://hausoflewks.com/booking/create",
  },
];

/**
 * Renders available slots
 * @param {*} props
 * @returns A JSX list
 */
const RenderAvailableSlots = (props) => {
  const { schedule, setSelected, selected } = props;

  console.log({ schedule });
  return schedule?.availableSlots?.map((slot, index) => (
    <div
      key={index}
      onClick={() => setSelected(schedule, slot)}
      className={`${
        selected === slot ? "bg-primary-green text-white" : "bg-white"
      } px-3 py-1 rounded-2xl cursor-pointer`}
    >
      {slot}
    </div>
  ));
};

export default function CreateBooking() {
  const navigate = useNavigate();
  /********************************** APP Context ********************************/
  const {
    bookingDate,
    bookingSlot,
    bookingSchedule,
    setBookingSchedule,
    setBookingDate,
    setBookingSlot,
    selectedBookingService,
    setSelectedBookingService,
  } = useContext(AppContext);

  const today = new Date();
  const scheduleAPIs = new ScheduleAPI();
  const [selectedDate, setSelectedDate] = useState(bookingDate);
  const [selectedSlot, setSelectedSlot] = useState(bookingSlot);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const successRef = useRef(null);
  const errorRef = useRef(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  /**
   * Format the selected date
   * @param {*} date
   * @param {*} short
   * @returns A date in the format Month day, year
   */
  const formatSelectedDate = (date, short = false) => {
    if (!(date instanceof Date)) return "";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: short ? "short" : "long",
      day: "numeric",
    });
  };

  /**
   * Sets the selected schedule
   * @param {*} schedule
   * @param {*} slot
   */
  const handleSelectSchedule = (schedule, slot) => {
    setBookingSchedule(schedule);
    setSelectedBookingService({
      ...selectedBookingService,
      scheduleId: schedule?._id,
      startTime: slot,
      scheduleInfo: schedule,
    });
    setSelectedSlot(slot);
  };

  console.log({ selectedBookingService });

  const onNextClick = () => {
    setBookingDate(selectedDate);
    setBookingSlot(selectedSlot);
    navigate("/booking/select-service");
  };

  const getScheduleByDate = async (date) => {
    try {
      const schedule = await scheduleAPIs.getByDate(date);
      setSelectedSchedule(schedule);
    } catch (error) {
      setFeedbackMessage(error?.message);
      toggleFeedback(errorRef);
    }
  };

  useEffect(() => {
    getScheduleByDate(selectedDate);
  }, [selectedDate]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
      <PageHeader
        title={"Book an Appointment"}
        subtitle={"Pick a day and time slot for your appointment"}
      />

      <div className="w-full max-w-4xl mt-6 sm:mt-8">
        <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-sm mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Select Date</h2>
          <BookingCalendar
            value={selectedDate}
            onChange={setSelectedDate}
            today={today}
          />
        </div>

        <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            Available Time Slots on {formatSelectedDate(selectedDate)}
          </h3>

          {!selectedSchedule || !selectedSchedule.availableSlots || selectedSchedule.availableSlots.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-neutral-600 text-sm sm:text-base">
              No available time slots for this date. Please select another date.
            </div>
          ) : (
            <div className="flex flex-row gap-x-2 sm:gap-x-3 flex-wrap gap-y-2 sm:gap-y-3">
              <RenderAvailableSlots
                selectedDate={selectedDate}
                selected={selectedSlot}
                schedule={selectedSchedule}
                setSelected={handleSelectSchedule}
              />
            </div>
          )}

          {selectedSlot && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-primary-green/10 rounded-lg border border-primary-green/20">
              <p className="text-xs sm:text-sm text-neutral-700">
                Selected time: <span className="font-semibold text-primary-green">{selectedSlot}</span>
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-row w-full justify-center mt-4 sm:mt-6">
          <CustomButton
            label="Next"
            onClick={onNextClick}
            className="bg-primary-green w-full sm:w-[180px] rounded-lg text-sm sm:text-base"
            isActive={!!selectedSlot}
          />
        </div>
      </div>

      <SuccessFeedback ref={successRef} message={feedbackMessage} />
      <ErrorFeedback ref={errorRef} message={feedbackMessage} />
    </div>
  );
}
