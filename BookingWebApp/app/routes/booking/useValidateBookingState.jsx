import { useLocation, useNavigate } from "@remix-run/react";
import { useContext, useEffect } from "react";
import { AppContext } from "../../../storage/AppProvider";

export default function useValidateBookingState() {
  /********************************** APP Context ********************************/
  const { selectedBookingService } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const scheduleId = selectedBookingService?.scheduleId;
  const startTime = selectedBookingService?.startTime;
  const service = selectedBookingService?.service;
  const serviceTitle = selectedBookingService?.service?.title;

  useEffect(() => {
    if (!scheduleId || !startTime) {
      navigate("/booking/create");
    }

    if (
      path.includes("/booking/select-service") &&
      (!scheduleId || !startTime)
    ) {
      navigate("/booking/create");
    }

    if (
      (path.includes("/booking/select-add-ons") ||
        path.includes("/booking/customer-info")) &&
      (!scheduleId || !startTime || !serviceTitle || !service)
    ) {
      navigate("/booking/create");
    }
  }, [navigate, path, scheduleId, startTime, serviceTitle, service]);
}
