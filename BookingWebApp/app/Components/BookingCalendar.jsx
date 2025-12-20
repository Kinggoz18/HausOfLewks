import "react-calendar/dist/Calendar.css";
import Calendar from "react-calendar";

export default function BookingCalendar(props) {
  const { value, onChange, today, className } = props;

  return (
    <div
      className={`w-full items-center flex flex-col mt-[40px] ${className}`}
    >
      <Calendar
        onChange={onChange}
        value={value}
        minDate={today}
        className={"!rounded-lg py-[20px]"}
      />
    </div>
  );
}
