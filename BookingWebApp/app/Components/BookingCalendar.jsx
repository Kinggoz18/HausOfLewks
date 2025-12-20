import "react-calendar/dist/Calendar.css";
import Calendar from "react-calendar";

export default function BookingCalendar(props) {
  const { value, onChange, today, className, ariaLabel } = props;

  return (
    <div 
      className={`w-full items-center flex flex-col mt-4 sm:mt-6 md:mt-[40px] ${className}`}
      role="application"
      aria-label={ariaLabel || "Calendar for selecting appointment date"}
    >
      <Calendar
        onChange={onChange}
        value={value}
        minDate={today}
        className={"!rounded-lg py-4 sm:py-5 md:py-[20px] w-full max-w-full"}
        calendarType="US"
        aria-label={ariaLabel || "Select appointment date"}
      />
    </div>
  );
}
