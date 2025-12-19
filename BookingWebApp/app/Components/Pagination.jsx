import React from "react";

const Pagination = (props) => {
  const { currentPage, pageSize, totalItems, onPageChange } = props;

  if (!totalItems || totalItems <= pageSize) {
    return null;
  }

  const totalPages = Math.ceil(totalItems / pageSize);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-neutral-700">
      <div>
        Showing <span className="font-semibold">{start}</span>–
        <span className="font-semibold">{end}</span> of{" "}
        <span className="font-semibold">{totalItems}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-lg border text-sm ${
            currentPage === 1
              ? "border-neutral-200 text-neutral-400 cursor-not-allowed bg-neutral-50"
              : "border-neutral-300 hover:bg-neutral-100"
          }`}
        >
          Previous
        </button>
        <span className="text-xs text-neutral-600">
          Page <span className="font-semibold">{currentPage}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </span>
        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-lg border text-sm ${
            currentPage === totalPages
              ? "border-neutral-200 text-neutral-400 cursor-not-allowed bg-neutral-50"
              : "border-neutral-300 hover:bg-neutral-100"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;


