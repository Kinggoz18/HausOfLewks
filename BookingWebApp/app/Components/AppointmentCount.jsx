const AppointmentCount = (props) => {
  const { subtitle, count } = props;

  return (
    <div className="bg-white/80 rounded-xl p-3 sm:p-4 shadow-sm flex flex-col gap-y-1 sm:gap-y-2">
      <div className="text-xs sm:text-sm text-neutral-600 line-clamp-2">{subtitle}</div>
      <div className="text-xl sm:text-2xl md:text-3xl font-semibold">{count}</div>
    </div>
  );
};

export default AppointmentCount;
