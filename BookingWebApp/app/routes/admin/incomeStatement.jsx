import React, { useEffect, useState } from "react";
import CustomButton from "../../Components/CustomButton";
import BookingAPI from "../../../storage/APIs/bookings";

const bookingAPI = new BookingAPI();

export default function IncomeStatement() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIncome = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await bookingAPI.getIncomeReport({});
      setSummary(data);
    } catch (err) {
      setError(err?.message ?? "Failed to load income report.");
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  const handleRefresh = () => {
    fetchIncome();
  };

  const totalRevenue = summary?.totalRevenue ?? 0;
  const totalCompleted = summary?.totalCompleted ?? 0;
  const currentMonth = summary?.currentMonth ?? { totalRevenue: 0, totalCompleted: 0 };
  const currentYear = summary?.currentYear ?? { totalRevenue: 0, totalCompleted: 0 };
  const statsPerYear = summary?.statsPerYear ?? [];
  const statsPerMonth = summary?.statsPerMonth ?? [];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col gap-y-4 sm:gap-y-6">
      <h1 className="text-xl sm:text-2xl font-semibold">Income Reporting</h1>
      <p className="text-xs sm:text-sm text-neutral-700 max-w-xl">
        View a summary of completed bookings and total revenue. This report is
        based on booking records marked as completed.
      </p>

      <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-sm max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div className="font-semibold text-base sm:text-lg">Current Overview</div>
          <CustomButton
            label={isLoading ? "Refreshing..." : "Refresh"}
            onClick={handleRefresh}
            isActive={!isLoading}
            className="bg-primary-green w-full sm:w-[140px] rounded-lg"
          />
        </div>

        {error && <div className="text-red-600 mt-3 text-sm">{error}</div>}

        {!error && (
          <>
            {/* All Time Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-neutral-100 rounded-lg p-3 sm:p-4">
                <div className="text-xs text-neutral-600 mb-1">Total Revenue (All Time)</div>
                <div className="text-xl sm:text-2xl font-semibold">${totalRevenue.toFixed(2)}</div>
              </div>
              <div className="bg-neutral-100 rounded-lg p-3 sm:p-4">
                <div className="text-xs text-neutral-600 mb-1">Total Completed Bookings</div>
                <div className="text-xl sm:text-2xl font-semibold">{totalCompleted}</div>
              </div>
            </div>

            {/* Current Month Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-primary-green/10 rounded-lg p-4 border border-primary-green/20">
                <div className="text-xs text-neutral-600 mb-1">Current Month Revenue</div>
                <div className="text-xl font-semibold text-primary-green">
                  ${currentMonth.totalRevenue.toFixed(2)}
                </div>
              </div>
              <div className="bg-primary-green/10 rounded-lg p-4 border border-primary-green/20">
                <div className="text-xs text-neutral-600 mb-1">Current Month Completed</div>
                <div className="text-xl font-semibold text-primary-green">
                  {currentMonth.totalCompleted}
                </div>
              </div>
            </div>

            {/* Current Year Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-secondary-green/10 rounded-lg p-4 border border-secondary-green/20">
                <div className="text-xs text-neutral-600 mb-1">Current Year Revenue</div>
                <div className="text-xl font-semibold text-secondary-green">
                  ${currentYear.totalRevenue.toFixed(2)}
                </div>
              </div>
              <div className="bg-secondary-green/10 rounded-lg p-4 border border-secondary-green/20">
                <div className="text-xs text-neutral-600 mb-1">Current Year Completed</div>
                <div className="text-xl font-semibold text-secondary-green">
                  {currentYear.totalCompleted}
                </div>
              </div>
            </div>

            {/* Stats Per Year */}
            {statsPerYear.length > 0 && (
              <div className="mb-6">
                <div className="font-semibold text-md mb-3">Revenue by Year</div>
                <div className="space-y-2">
                  {statsPerYear.map((yearStat) => (
                    <div key={yearStat.year} className="bg-neutral-50 rounded-lg p-3 flex justify-between items-center">
                      <span className="font-medium">{yearStat.year}</span>
                      <div className="flex gap-6">
                        <span className="text-sm text-neutral-600">
                          {yearStat.totalCompleted} bookings
                        </span>
                        <span className="font-semibold">
                          ${yearStat.totalRevenue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Per Month (Current Year) */}
            {statsPerMonth.length > 0 && (
              <div>
                <div className="font-semibold text-md mb-3">Revenue by Month (Current Year)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {statsPerMonth.map((monthStat) => (
                    <div key={monthStat.month} className="bg-neutral-50 rounded-lg p-2 sm:p-3">
                      <div className="font-medium text-sm mb-1">
                        {monthNames[monthStat.month - 1]}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-neutral-600">
                          {monthStat.totalCompleted} bookings
                        </span>
                        <span className="font-semibold text-sm">
                          ${monthStat.totalRevenue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
