import React, { useContext, useEffect, useState } from "react";
import PageHeader from "../../../Components/PageHeader";
import CustomButton from "../../../Components/CustomButton";
import { useNavigate } from "@remix-run/react";

import LeafBanner from "../../../images/leaf_banner_background.png";
import { AppContext } from "../../../../storage/AppProvider";

import useValidateBookingState from "../useValidateBookingState";

const formatDate = (day, month, year) => {
  const monthMap = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  const dayFormatted = String(day).padStart(2, "0");
  return `${year}-${monthMap[month]}-${dayFormatted}`;
};

const bookingEndtime = (bookingDetails, selectedAddons, bookingStartTime) => {
  if (!bookingDetails || !bookingStartTime) return null;

  let duration = Number(bookingDetails?.service?.duration) || 0;

  // Add addon durations
  selectedAddons?.forEach((addon) => {
    duration += Number(addon?.duration) || 0;
  });

  const start = Number(bookingStartTime.split(":")[0]); // hour only
  const end = (start + duration) % 24;

  let suffix = "pm";
  if (end === 0) {
    suffix = "am"; // midnight
  } else if (end < 12) {
    suffix = "am";
  }

  // Pad single digits like 3 → 03
  const formattedHour = end.toString().padStart(2, "0");

  return `${formattedHour}:00 ${suffix}`;
};

export default function ConfrimBooking() {
  const navigate = useNavigate();
  const [AddToCalendarComponent, setAddToCalendarComponent] = useState(null);
  /********************************** APP Context ********************************/
  const { selectedBookingService } = useContext(AppContext);
  const bookingName = `${selectedBookingService?.firstName} ${selectedBookingService?.lastName}`;
  const phone = `${selectedBookingService?.phone}`;

  const scheduleInfo = selectedBookingService?.scheduleInfo;
  const bookingDate = formatDate(
    scheduleInfo?.day,
    scheduleInfo?.month,
    scheduleInfo?.year
  );
  const selectedAddons = selectedBookingService?.service?.AddOns;
  const bookingStartTime = selectedBookingService?.startTime;

  const bookingEndTime = bookingEndtime(
    selectedBookingService,
    selectedAddons,
    bookingStartTime
  );

  const onReturnClick = async () => {
    navigate("/booking/create");
  };

  // Load add-to-calendar button only on the client to avoid SSR/hydration issues
  useEffect(() => {
    let isMounted = true;

if (typeof window !== "undefined") {
      import("add-to-calendar-button-react")
        .then((mod) => {
          if (isMounted) {
            setAddToCalendarComponent(() => mod.AddToCalendarButton);
          }
        })
        .catch((err) => {
          console.error("Failed to load add-to-calendar-button-react", err);
        });
    }    

    return () => {
      isMounted = false;
    };
  }, []);
  /********************************* {UseEffect Hooks} ***************************************/
  useValidateBookingState();

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 min-h-screen w-full bg-neutral-100 relative overflow-y-auto">
      <img
        src={LeafBanner}
        className="w-full h-full fixed top-0 left-0 object-cover opacity-20 z-0"
        alt=""
      />

      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
        <div className="bg-white/90 rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg w-full">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-green mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-base sm:text-lg font-semibold text-neutral-700">
              Hi {bookingName}
            </p>
          </div>

          <div className="bg-primary-green/10 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-primary-green/20">
            <div className="text-center mb-3 sm:mb-4">
              <p className="text-lg sm:text-xl font-semibold text-primary-green mb-2">
                Thank you for your booking!
              </p>
              <p className="text-xs sm:text-sm text-neutral-700">
                We'll contact you at <span className="font-semibold">{phone}</span> to confirm your appointment and
                request any additional information, if needed.
              </p>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Booking Details</h2>
            <div className="space-y-3">
              {selectedBookingService?.service?.title && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Service:</span>
                  <span className="font-medium">{selectedBookingService.service.title}</span>
                </div>
              )}
              {bookingStartTime && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Date & Time:</span>
                  <span className="font-medium">
                    {new Date(bookingDate).toLocaleDateString()} at {bookingStartTime}
                  </span>
                </div>
              )}
              {selectedBookingService?.service?.price && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Price:</span>
                  <span className="font-medium">
                    ${selectedBookingService.service.price.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            {AddToCalendarComponent &&
              bookingDate &&
              bookingStartTime &&
              bookingEndTime && (
                <AddToCalendarComponent
                  name={`Hair appointment for ${selectedBookingService?.service?.title}`}
                  options={["Apple", "Google"]}
                  location="Peterborough, Ontario"
                  startDate={bookingDate}
                  endDate={bookingDate}
                  startTime={bookingStartTime}
                  endTime={bookingEndTime}
                  timeZone="America/Toronto"
                />
              )}

            <CustomButton
              label="Book Another Appointment"
              onClick={onReturnClick}
              className="bg-primary-green w-full sm:w-[200px] rounded-lg text-sm sm:text-base"
              isActive={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
