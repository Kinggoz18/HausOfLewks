import React from "react";

/**
 * Toggle error component
 * @returns
 */
const toggleFeedback = (ref) => {
  const feedbackRef = ref.current;
  if (!feedbackRef) return;

  feedbackRef.classList.remove("opacity-0");
  feedbackRef.classList.remove("!z-[-10]");
  feedbackRef.classList.add("z-30");

  setTimeout(() => {
    feedbackRef.classList.add("opacity-0");
    feedbackRef.classList.add("!z-[-10]");
    feedbackRef.classList.remove("z-30");
  }, 3000);
};

const SuccessFeedback = React.forwardRef(({ message, className }, ref) => {
  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed ml-auto mr-auto left-0 right-0 w-fit max-w-[90%] h-fit text-wrap bg-green-500 rounded-lg bottom-[20%] text-center p-4 text-white opacity-0 transition-opacity transform duration-300 ease-in-out !z-[-10] ${className}`}
    >
      <span className="sr-only">Success: </span>
      {message}
    </div>
  );
});

const ErrorFeedback = React.forwardRef(({ message, className }, ref) => {
  return (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`fixed ml-auto mr-auto left-0 right-0 w-fit max-w-[90%] h-fit text-wrap bg-red-500 rounded-lg bottom-[20%] text-center p-4 text-white opacity-0 transition-opacity transform duration-300 ease-in-out !z-[-10] ${className}`}
    >
      <span className="sr-only">Error: </span>
      {message}
    </div>
  );
});

export { toggleFeedback, SuccessFeedback, ErrorFeedback };
