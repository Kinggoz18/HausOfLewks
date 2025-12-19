import BookingStatusEnum from '../../src/util/enums/BookingStatus.js';

// Generate mock bookings with various statuses and dates
const generateMockBookings = (hairServices, schedules, users) => {
  const bookings = [];
  const statuses = BookingStatusEnum; // This is already an array
  
  // Track used scheduleId + startTime combinations to avoid duplicates
  const usedCombinations = new Set();
  
  // Generate bookings over the past 12 months
  const now = new Date();
  
  // Available time slots
  const timeSlots = ['10:00am', '11:00am', '12:00pm', '13:00pm', '14:00pm', '15:00pm', '16:00pm', '17:00pm'];
  
  for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
    const bookingDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    
    // Create 5-10 bookings per month
    const bookingsPerMonth = Math.floor(Math.random() * 6) + 5;
    
    for (let i = 0; i < bookingsPerMonth; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const service = hairServices[Math.floor(Math.random() * hairServices.length)];
      const schedule = schedules[Math.floor(Math.random() * schedules.length)];
      const scheduleId = schedule._id || schedule.id;
      
      // Find an available time slot for this schedule (avoid duplicates)
      let startTime;
      let attempts = 0;
      const maxAttempts = 100;
      
      do {
        startTime = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        attempts++;
        if (attempts > maxAttempts) {
          // If we can't find a unique combination, skip this booking
          break;
        }
      } while (usedCombinations.has(`${scheduleId}-${startTime}`));
      
      // Skip if we couldn't find a unique combination
      if (attempts > maxAttempts) {
        continue;
      }
      
      // Mark this combination as used
      usedCombinations.add(`${scheduleId}-${startTime}`);
      
      // Random day in the month
      const day = Math.floor(Math.random() * 28) + 1;
      const createdAt = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), day);
      
      // More completed bookings in the past
      let status;
      if (monthOffset < 3) {
        // Recent months - mix of statuses
        status = statuses[Math.floor(Math.random() * statuses.length)];
      } else {
        // Older months - mostly completed
        status = Math.random() > 0.3 ? 'Completed' : statuses[Math.floor(Math.random() * statuses.length)];
      }
      
      // Calculate total (service price + addons)
      let total = service.price;
      if (service.addOns && service.addOns.length > 0) {
        const numAddons = Math.floor(Math.random() * service.addOns.length);
        for (let j = 0; j < numAddons; j++) {
          total += service.addOns[j].price;
        }
      }
      
      bookings.push({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        startTime,
        scheduleId,
        service: {
          title: service.title,
          price: service.price,
          category: service.category,
          duration: service.duration,
          hairServiceId: service._id || service.id,
          AddOns: service.addOns || []
        },
        status,
        total: status === 'Completed' ? total : 0,
        createdAt
      });
    }
  }
  
  return bookings;
};

export default generateMockBookings;

