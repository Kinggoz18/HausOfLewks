import React, { useEffect, useState } from "react";
import AppointmentCount from "../../Components/AppointmentCount";
import BookingCalendar from "../../Components/BookingCalendar";
import RenderAppointments from "../../Components/RenderAppointments";
import ExpandedAppointment from "../../Components/ExpandedAppointment";
import BookingAPI from "../../../storage/APIs/bookings";
import ScheduleAPI from "../../../storage/APIs/schedule";
import useValidateAdmin from "./useValidateAdmin";

export default function Dashboard() {
  const date = new Date();
  const [selectedDate, setSelectedDate] = useState(date);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingSummary, setBookingSummary] = useState(null);

  const bookingAPI = new BookingAPI();
  const scheduleAPI = new ScheduleAPI();

  const monthMap = [
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

  /************************************************************************************************************************/
  /*******************************************************{ Methods }******************************************************/
  /************************************************************************************************************************/
  const formatDate = (date) => {
    const options = { weekday: "long", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const getAppointmentsTitle = (selected) => {
    if (!selected) return "Appointments";

    const today = new Date();
    const normalize = (d) => {
      const copy = new Date(d);
      copy.setHours(0, 0, 0, 0);
      return copy;
    };

    const selectedDay = normalize(selected);
    const todayDay = normalize(today);

    const diffMs = selectedDay.getTime() - todayDay.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today's Appointments";
    if (diffDays === -1) return "Yesterday's Appointments";
    if (diffDays === 1) return "Tomorrow's Appointments";

    const label = selectedDay.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return `${label} Appointments`;
  };

  const handleSetDateValue = (value, event) => {
    setSelectedDate(value);
  };

  const getMonth = (index) => {
    if (index > 11) return "January";
    else return monthMap[index];
  };

  const fetchAppointments = async (forDate) => {
    try {
      setIsLoading(true);
      setError(null);
      const target = forDate ? new Date(forDate) : new Date();
      target.setHours(0, 0, 0, 0);
      const startOfDay = new Date(target);
      const endOfDay = new Date(target);
      endOfDay.setHours(23, 59, 59, 999);

      // Get bookings for the selected day using appointment date from schedule
      const result = await bookingAPI.getAllBookings({
        page: 1,
        pageSize: 200,
        appointmentDateFrom: startOfDay.toISOString(),
        appointmentDateTo: endOfDay.toISOString(),
      });

      const allBookings = result?.items ?? [];

      setAppointments(allBookings || []);
    } catch (err) {
      setError(err?.message ?? "Failed to load appointments");
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookingSummary = async () => {
    try {
      const data = await bookingAPI.getBookingsSummary();
      setBookingSummary(data);
    } catch (err) {
      console.error(err?.message ?? err);
    }
  };

  const getScheduleByDate = async (date) => {
    try {
      const schedule = await scheduleAPI.getByDate(date);
      setSelectedSchedule(schedule);
    } catch (err) {
      // Schedule might not exist for this date, that's okay
      setSelectedSchedule(null);
    }
  };

  useEffect(() => {
    fetchAppointments(selectedDate);
    getScheduleByDate(selectedDate);
  }, [selectedDate]);
  useEffect(() => {
    fetchBookingSummary();
  }, []);

  const completedCount = bookingSummary?.completed ?? 0;
  const upcomingCount = bookingSummary?.upcoming ?? 0;
  const cancelledCount = bookingSummary?.cancelled ?? 0;
  const missedCount = bookingSummary?.missed ?? 0;

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col gap-y-6">
      {selectedAppointment && (
        <div className="z-20 fixed h-screen w-screen overflow-hidden bg-neutral-950/30 top-0 left-0">
          <ExpandedAppointment
            appointment={selectedAppointment}
            onExitClick={() => setSelectedAppointment(null)}
          />
        </div>
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-semibold mb-2">Dashboard</h1>
        <p className="text-xs sm:text-sm text-neutral-700 max-w-xl">
          Overview of appointments and schedule for {formatDate(selectedDate)}.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AppointmentCount
          subtitle={"Total Appointments Completed"}
          count={completedCount}
        />
        <AppointmentCount
          subtitle={"Total Appointments Upcoming"}
          count={upcomingCount}
        />
        <AppointmentCount
          subtitle={"Total Appointments Cancelled"}
          count={cancelledCount}
        />
        <AppointmentCount
          subtitle={"Total Appointments Missed"}
          count={missedCount}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold mb-4">
            {getAppointmentsTitle(selectedDate)}
          </h2>
          {isLoading ? (
            <div className="text-center py-8 text-neutral-600">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-neutral-600">
              No appointments for this day
            </div>
          ) : (
            <RenderAppointments
              appointments={appointments}
              setSelectedAppointment={setSelectedAppointment}
            />
          )}
        </div>

        <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold mb-4">
            {getMonth(date?.getMonth())} Schedule
          </h2>
          <BookingCalendar
            value={selectedDate}
            onChange={handleSetDateValue}
            today={null}
            className="items-start"
          />

          {selectedSchedule && (
            <div className="mt-6 bg-neutral-50 rounded-lg p-4">
              <div className="font-semibold text-sm mb-3">
                Schedule for {formatDate(selectedDate)}
              </div>
              <div className="flex flex-row items-center gap-x-6 text-sm">
                <div>
                  <span className="text-neutral-600">Start: </span>
                  <span className="font-medium">{selectedSchedule?.startTime}</span>
                </div>
                <div>
                  <span className="text-neutral-600">End: </span>
                  <span className="font-medium">{selectedSchedule?.endTime}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
