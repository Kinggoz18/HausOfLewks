import React, { useEffect, useRef, useState } from "react";
import AppointmentCount from "../../Components/AppointmentCount";
import RenderAppointments from "../../Components/RenderAppointments";
import AppointmentList from "../../Components/AppointmentList";
import BookingAPI from "../../../storage/APIs/bookings";
import {
  ErrorFeedback,
  SuccessFeedback,
  toggleFeedback,
} from "../../Components/UIFeedback";

import ExitIcon from "../../images/exitWhite.svg";
import { BookingStatus } from "../../util/BookingStatus";
import CustomButton from "../../Components/CustomButton";
import Pagination from "../../Components/Pagination";
import { InlineLoader, EmptyState } from "../../Components/LoadingStates";

const addOnPrice = (selectedAddons) => {
  let start = 0;
  selectedAddons?.forEach((addon) => {
    start += Number(addon?.price);
  });
  return start;
};

const UpdateAppointment = (props) => {
  const { appointment, onExitClick, onUpdateClick } = props;
  const addOns = appointment?.service?.AddOns || [];
  const totalPrice = Number(appointment?.service?.price) + addOnPrice(addOns);

  const [newPrice, setNewPrice] = useState(totalPrice);
  const [status, setStatus] = useState(appointment?.status || null);

  // Get appointment date from schedule if available, otherwise use createdAt
  const getAppointmentDate = (appointment) => {
    if (appointment?.schedule?.year && appointment?.schedule?.month && appointment?.schedule?.day) {
      const monthMap = {
        January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
        July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
      };
      const year = parseInt(appointment.schedule.year);
      const month = monthMap[appointment.schedule.month] ?? 0;
      const day = parseInt(appointment.schedule.day);
      return new Date(year, month, day);
    }
    return appointment?.createdAt ? new Date(appointment.createdAt) : null;
  };

  const bookingDate = getAppointmentDate(appointment);

  const handleSetPrice = (event) => {
    const value = event.target.value;

    // Only allow digits and decimal points
    if ((/^\d*\.?\d*$/.test(value) || value === "") && value.length <= 10) {
      setNewPrice(value);
    }
  };

  const handleUpdateAppointment = (price, status) => {
    const finalPrice = Number(price) >= 0 ? Number(price) : totalPrice;
    onUpdateClick(finalPrice, status || appointment?.status);
    handleClose();
  };

  const handleClose = () => {
    setStatus(null);
    setNewPrice(totalPrice);
    onExitClick();
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4 absolute bg-white w-[95%] sm:w-[90%] md:w-[500px] max-w-[500px] rounded-xl ml-auto mr-auto left-0 right-0 top-[8%] sm:top-[12%] md:top-[15%] mt-4 sm:mt-6 md:mt-8 p-4 sm:p-6 shadow-xl z-50 max-h-[85vh] overflow-y-auto">
      <div className="w-full flex flex-row justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold">Update Appointment</h2>
        <img
          src={ExitIcon}
          alt="Exit icon"
          onClick={handleClose}
          className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer opacity-90 hover:opacity-100 bg-neutral-800 rounded-full p-1 shrink-0"
        />
      </div>

      <div className="bg-neutral-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div>
          <span className="text-xs sm:text-sm text-neutral-600">Customer: </span>
          <span className="text-sm sm:text-base font-medium">{appointment?.firstName} {appointment?.lastName}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
          <div>
            <span className="text-xs sm:text-sm text-neutral-600">Date: </span>
            <span className="text-sm sm:text-base font-medium">
              {bookingDate
                ? bookingDate.toLocaleDateString("en-CA")
                : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-xs sm:text-sm text-neutral-600">Start Time: </span>
            <span className="text-sm sm:text-base font-medium">{appointment?.startTime}</span>
          </div>
        </div>
        {appointment?.email && (
          <div>
            <span className="text-xs sm:text-sm text-neutral-600">Email: </span>
            <span className="text-sm sm:text-base font-medium break-all">{appointment?.email}</span>
          </div>
        )}
        {appointment?.phone && (
          <div>
            <span className="text-xs sm:text-sm text-neutral-600">Phone: </span>
            <span className="text-sm sm:text-base font-medium">{appointment?.phone}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm">Status:</label>
        <select
          name="status"
          id="booking_status"
          value={status || ''}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-neutral-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-green"
        >
          <option value="">Select status</option>
          <option value={BookingStatus.Cancelled}>{BookingStatus.Cancelled}</option>
          <option value={BookingStatus.Completed}>{BookingStatus.Completed}</option>
          <option value={BookingStatus.Upcoming}>{BookingStatus.Upcoming}</option>
          <option value={BookingStatus.Missed}>{BookingStatus.Missed}</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm">Total Price ($):</label>
        <input
          type="text"
          value={newPrice}
          onChange={handleSetPrice}
          className="border border-neutral-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-green"
          placeholder="0.00"
        />
      </div>

      <div className="bg-neutral-50 rounded-lg p-3 sm:p-4 max-h-[180px] sm:max-h-[200px] overflow-y-scroll">
        <div className="font-semibold text-xs sm:text-sm mb-2">Service Details:</div>
        {appointment?.customServiceDetail ? (
          <div className="text-xs sm:text-sm">
            <span className="text-neutral-600">Custom Service: </span>
            <span className="break-words">{appointment.customServiceDetail}</span>
          </div>
        ) : (
          <>
            <div className="text-xs sm:text-sm mb-2">
              <span className="text-neutral-600">Service: </span>
              <span className="font-medium">{appointment?.service?.title}</span>
              <span className="text-neutral-600 ml-2">(${appointment?.service?.price})</span>
            </div>
            {addOns.length > 0 && (
              <div className="ml-2 sm:ml-4 mt-2">
                <div className="text-xs sm:text-sm font-medium mb-1">Add-Ons:</div>
                {addOns.map((element, index) => (
                  <div key={index} className="text-xs sm:text-sm text-neutral-700">
                    • {element.title} – ${element.price}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row w-full justify-end gap-3 pt-2">
        <CustomButton
          label="Cancel"
          onClick={handleClose}
          isActive={true}
          className="bg-neutral-400 w-full sm:w-[120px] rounded-lg"
        />
        <CustomButton
          label="Update"
          onClick={() => handleUpdateAppointment(newPrice, status)}
          isActive={true}
          className="bg-primary-green w-full sm:w-[120px] rounded-lg"
        />
      </div>
    </div>
  );
};

export default function Appointments() {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [filteredBookings, setFilteredBookings] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalBookings, setTotalBookings] = useState(0);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  
  const bookingAPIs = new BookingAPI();
  const date = new Date();

  const successRef = useRef(null);
  const errorRef = useRef(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const formatDate = (date) => {
    const options = { weekday: "long", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const getAllBookings = async () => {
    setIsLoading(true);
    try {
      const result = await bookingAPIs.getAllBookings({
        page: currentPage,
        pageSize,
      });

      const items = result?.items ?? [];
      setBookings(items);
      setFilteredBookings(items);
      setTotalBookings(result?.total ?? items.length);
    } catch (error) {
      setFeedbackMessage(error?.message);
      toggleFeedback(errorRef);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBookings = () => {
    if (!bookings) return;
    
    let filtered = [...bookings];
    
    // Search filter (name, email, phone)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((booking) => {
        const fullName = `${booking.firstName || ''} ${booking.lastName || ''}`.toLowerCase();
        const email = (booking.email || '').toLowerCase();
        const phone = (booking.phone || '').toLowerCase();
        const serviceName = (booking.service?.title || '').toLowerCase();
        return fullName.includes(term) || email.includes(term) || phone.includes(term) || serviceName.includes(term);
      });
    }
    
    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }
    
    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((booking) => {
        if (!booking.schedule) return false;
        const bookingDate = `${booking.schedule.year}-${String(getMonthNumber(booking.schedule.month)).padStart(2, '0')}-${String(booking.schedule.day).padStart(2, '0')}`;
        return bookingDate === dateFilter;
      });
    }
    
    setFilteredBookings(filtered);
  };
  
  const getMonthNumber = (monthName) => {
    const months = {
      January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
      July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
    };
    return months[monthName] || 1;
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setDateFilter("");
  };

  const getBookingSummary = async () => {
    try {
      const data = await bookingAPIs.getBookingsSummary();
      setSummary(data);
    } catch (error) {
      // If summary fails, don't block the page; just log and continue
      console.error(error?.message ?? error);
    }
  };

  const handleUpdateAppointment = async (price, status) => {
    try {
      const data = {
        bookingId: selectedAppointment?._id,
        status: status,
        price: price,
      };

      await bookingAPIs.updateBookingById(data);
      setFeedbackMessage("Schedule updated!");
      toggleFeedback(successRef);
      setSelectedAppointment(null);
    } catch (error) {
      setFeedbackMessage(error?.message);
      toggleFeedback(errorRef);
      setSelectedAppointment(null);
    }
  };

  /************************************************************************************************************************/
  /****************************************************{ UseEffects }******************************************************/
  /************************************************************************************************************************/
  useEffect(() => {
    getAllBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  useEffect(() => {
    getBookingSummary();
  }, []);
  
  // Apply filters when filter state changes
  useEffect(() => {
    filterBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, dateFilter, bookings]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const completedCount = summary?.completed ?? 0;
  const upcomingCount = summary?.upcoming ?? 0;
  const cancelledCount = summary?.cancelled ?? 0;
  const missedCount = summary?.missed ?? 0;

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col gap-y-6">
      {selectedAppointment && (
        <div className="z-20 fixed h-screen w-screen overflow-hidden bg-neutral-950/30 top-0 left-0">
          <UpdateAppointment
            appointment={selectedAppointment}
            onExitClick={() => setSelectedAppointment(null)}
            onUpdateClick={handleUpdateAppointment}
          />
        </div>
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-semibold mb-2">Appointments</h1>
        <p className="text-xs sm:text-sm text-neutral-700 max-w-xl">
          Manage and view all appointments. Click on an appointment to update its status or price.
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

      <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-base sm:text-lg font-semibold">All Appointments</h2>
          
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 pl-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green text-sm"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green text-sm bg-white"
            >
              <option value="">All Status</option>
              <option value={BookingStatus.Upcoming}>{BookingStatus.Upcoming}</option>
              <option value={BookingStatus.Completed}>{BookingStatus.Completed}</option>
              <option value={BookingStatus.Cancelled}>{BookingStatus.Cancelled}</option>
              <option value={BookingStatus.Missed}>{BookingStatus.Missed}</option>
            </select>
            
            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green text-sm"
            />
            
            {/* Clear Filters */}
            {(searchTerm || statusFilter || dateFilter) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-primary-purple hover:bg-primary-purple/10 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        {/* Results count */}
        {filteredBookings && bookings && filteredBookings.length !== bookings.length && (
          <div className="text-sm text-neutral-600 mb-4">
            Showing {filteredBookings.length} of {bookings.length} appointments
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12" role="status" aria-live="polite">
            <InlineLoader size="lg" />
            <span className="sr-only">Loading appointments...</span>
          </div>
        ) : !filteredBookings || filteredBookings.length === 0 ? (
          <EmptyState
            title={searchTerm || statusFilter || dateFilter 
              ? "No appointments match your filters" 
              : "No appointments found"}
            description={searchTerm || statusFilter || dateFilter 
              ? "Try adjusting your filters to see more results." 
              : "New appointments will appear here once created."}
            action={searchTerm || statusFilter || dateFilter ? clearFilters : undefined}
            actionLabel={searchTerm || statusFilter || dateFilter ? "Clear Filters" : undefined}
          />
        ) : (
          <>
            <AppointmentList
              appointments={filteredBookings}
              setSelectedAppointment={setSelectedAppointment}
            />
            {!searchTerm && !statusFilter && !dateFilter && (
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={totalBookings}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
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
