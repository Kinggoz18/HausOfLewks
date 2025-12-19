// Income reporting is computed dynamically from bookings and is not persisted
// in its own collection. This file is kept for clarity and potential future
// extension, but does not define a Mongoose model.

export const IncomeReportingInfo = {
  description:
    'Income reporting is derived from Booking documents (status, total, and createdAt). No dedicated IncomeStatement collection is used.',
};