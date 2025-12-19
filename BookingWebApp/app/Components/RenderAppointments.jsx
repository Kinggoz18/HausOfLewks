const RenderAppointments = (props) => {
  const { appointments, setSelectedAppointment } = props;

  const generateClass = (status) => {
    if (status === "Upcoming") {
      return "bg-yellow-300 !text-neutral-700";
    } else if (status === "Completed") {
      return "bg-green-500";
    } else if (status === "Missed") {
      return "bg-red-500";
    } else if (status === "Cancelled") {
      return "bg-orange-500";
    }
  };

  return (
    appointments.length > 0 && (
      <>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-3 bg-gray-300 rounded-lg p-2">
            <thead>
              <tr>
                <th className="text-left p-2 text-sm">Status</th>
                <th className="text-left p-2 text-sm">Service</th>
                <th className="text-left p-2 text-sm">Client</th>
                <th className="text-left p-2 text-sm">Timeslot</th>
              </tr>
            </thead>
            <tbody>
              {appointments?.map((element, index) => (
                <tr
                  key={index}
                  onClick={() => setSelectedAppointment(element)}
                  className="bg-neutral-100 rounded-2xl cursor-pointer hover:bg-neutral-200 transition-colors"
                >
                  <td className="p-2 max-w-[150px] align-top text-center font-semibold">
                    <div
                      className={`h-full text-neutral-100 font-semibold p-[5px] w-full rounded-md text-xs ${generateClass(
                        element?.status
                      )}`}
                    >
                      {element?.status}
                    </div>
                  </td>
                  <td className="p-2 max-w-[150px] align-top text-sm">
                    {element?.service?.title}
                  </td>
                  <td className="p-2 max-w-[150px] align-top text-sm">{`${element?.firstName} ${element?.lastName}`}</td>
                  <td className="p-2 max-w-[150px] align-top text-sm">
                    {element?.startTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="md:hidden space-y-3">
          {appointments?.map((element, index) => (
            <div
              key={index}
              onClick={() => setSelectedAppointment(element)}
              className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`text-neutral-100 font-semibold px-3 py-1 rounded-md text-xs ${generateClass(
                      element?.status
                    )}`}
                  >
                    {element?.status}
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-neutral-600">Service:</span>
                    <p className="text-sm font-medium">{element?.service?.title}</p>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-600">Client:</span>
                    <p className="text-sm font-medium">{`${element?.firstName} ${element?.lastName}`}</p>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-600">Timeslot:</span>
                    <p className="text-sm font-medium">{element?.startTime}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  );
};

export default RenderAppointments;
