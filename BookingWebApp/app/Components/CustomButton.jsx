export default function CustomButton(props) {
  const { className, label, onClick, isActive = true } = props;
  return (
    <button
      type="button"
      onClick={isActive ? onClick : null}
      className={`cursor-pointer outline-none text-nowrap ${className} py-1 sm:py-1.5 md:py-2 px-2 sm:px-3 md:px-4 rounded-md text-white text-xs sm:text-sm md:text-base transition-all`}
      disabled={!isActive}
    >
      {label}
    </button>
  );
}
