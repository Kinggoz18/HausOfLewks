export default function CustomButton(props) {
  const { className, label, onClick, isActive = true, ariaLabel, isLoading = false, ...rest } = props;
  return (
    <button
      type="button"
      onClick={isActive && !isLoading ? onClick : null}
      className={`cursor-pointer outline-none text-nowrap ${className} py-1 sm:py-1.5 md:py-2 px-2 sm:px-3 md:px-4 rounded-md text-white text-xs sm:text-sm md:text-base transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-purple disabled:opacity-50 disabled:cursor-not-allowed`}
      disabled={!isActive || isLoading}
      aria-label={ariaLabel || label}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></span>
          <span>{label}</span>
        </span>
      ) : (
        label
      )}
    </button>
  );
}
