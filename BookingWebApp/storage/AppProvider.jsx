import { createContext, useState } from "react";

// Create context
export const AppContext = createContext();

// AppProvider component
export const AppProvider = ({ children }) => {
  /************************** Booking States *****************************/
  const [bookingDate, setBookingDate] = useState(new Date());
  const [bookingSchedule, setBookingSchedule] = useState(null);
  const [bookingSlot, setBookingSlot] = useState(null);
  const [selectedBookingService, setSelectedBookingService] = useState(null);

  return (
    <AppContext.Provider
      value={{
        bookingDate,
        setBookingDate,
        bookingSchedule,
        setBookingSchedule,
        bookingSlot,
        setBookingSlot,
        selectedBookingService,
        setSelectedBookingService,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
