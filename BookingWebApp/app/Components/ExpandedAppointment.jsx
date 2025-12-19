import ExitIcon from "../images/exitWhite.svg";

const ExpandedAppointment = (props) => {
  const { appointment, onExitClick } = props;
  const addOns = appointment?.service?.AddOns || [];

  const addOnPrice = (selectedAddons) => {
    let start = 0;
    selectedAddons?.forEach((addon) => {
      start += Number(addon?.price);
    });
    return start;
  };

  const totalPrice = Number(appointment?.service?.price) + addOnPrice(addOns);

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

  return (
    <div className="flex flex-col gap-4 absolute bg-white w-[95%] sm:w-[90%] md:w-[500px] max-w-[500px] rounded-xl ml-auto mr-auto left-0 right-0 top-[8%] sm:top-[12%] md:top-[15%] mt-4 sm:mt-6 md:mt-8 p-4 sm:p-6 shadow-xl z-50 max-h-[85vh] overflow-y-auto">
      <div className="w-full flex flex-row justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold">Appointment Details</h2>
        <img
          src={ExitIcon}
          alt="Exit icon"
          onClick={onExitClick}
          className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer opacity-90 hover:opacity-100 bg-neutral-800 rounded-full p-1 flex-shrink-0"
        />
      </div>

      <div className="bg-neutral-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs sm:text-sm text-neutral-600">Status: </span>
          <span className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-white font-semibold w-fit">
            {appointment?.status}
          </span>
        </div>
        <div>
          <span className="text-xs sm:text-sm text-neutral-600">Customer: </span>
          <span className="text-sm sm:text-base font-medium">
            {appointment?.firstName} {appointment?.lastName}
          </span>
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

      <div className="bg-neutral-50 rounded-lg p-3 sm:p-4 max-h-[200px] sm:max-h-[220px] overflow-y-auto space-y-2 sm:space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="font-semibold text-xs sm:text-sm">Service Details</div>
          <div className="text-xs sm:text-sm">
            <span className="text-neutral-600">Total: </span>
            <span className="font-semibold">${totalPrice}</span>
          </div>
        </div>

        {appointment?.customServiceDetail ? (
          <div className="text-xs sm:text-sm">
            <span className="text-neutral-600">Custom Service: </span>
            <span className="break-words">{appointment.customServiceDetail}</span>
          </div>
        ) : (
          <>
            <div className="text-xs sm:text-sm mb-1">
              <span className="text-neutral-600">Service: </span>
              <span className="font-medium">
                {appointment?.service?.title}
              </span>
              <span className="text-neutral-600 ml-2">
                (${appointment?.service?.price})
              </span>
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
    </div>
  );
};

export default ExpandedAppointment;
