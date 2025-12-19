/**
 * @readonly
 * @enum
 */
const BookingStatus = Object.freeze({
  Upcoming: "Upcoming",
  Completed: "Completed",
  Missed: "Missed",
  Cancelled: "Cancelled",
});

const BookingStatusEnum = Object.values(BookingStatus);

const TestBookingData = [
  {
    _id: 1,
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Upcoming,
  },
  {
    _id: 1,
    service: {
      title: "Classic Cornrows",
    },
    status: BookingStatus.Missed,
  },
  {
    _id: 1,
    service: {
      title: "Dread Retwist",
    },
    status: BookingStatus.Completed,
  },
  {
    _id: 1,
    service: {
      title: "Dread Retwist",
    },
    status: BookingStatus.Cancelled,
  },
  {
    _id: 1,
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Upcoming,
  },
  {
    _id: 1,
    service: {
      title: "Classic Cornrows",
    },
    status: BookingStatus.Missed,
  },
  {
    _id: 1,
    service: {
      title: "Dread Retwist",
    },
    status: BookingStatus.Completed,
  },
  {
    _id: 1,
    service: {
      title: "Dread Retwist",
    },
    status: BookingStatus.Cancelled,
  },
  {
    _id: 1,
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Upcoming,
  },
  {
    _id: 1,
    service: {
      title: "Classic Cornrows",
    },
    status: BookingStatus.Missed,
  },
  {
    _id: 1,
    service: {
      title: "Dread Retwist",
    },
    status: BookingStatus.Completed,
  },
  {
    _id: 1,
    service: {
      title: "Dread Retwist",
    },
    status: BookingStatus.Cancelled,
  },
];

const TestAppointmentData = [
  {
    _id: "66c5d1b8a21e5d4321f0b123", // MongoDB ObjectId
    firstName: "Chloe",
    lastName: "Anderson",
    phone: "+1-647-555-0123",
    email: "chloe.anderson@example.com",
    startTime: "2025-08-26T14:30:00Z", // ISO date string or custom "2:30pm"
    AdditionalNotes: "Please ensure a quiet room for the appointment.",
    customServiceDetail: null,
    scheduleId: "66c5d1b8a21e5d4321f0b124", // another ObjectId
    service: {
      title: "Deluxe Hair Styling",
      price: 120, // base price without add-ons
      category: "Hair Styling",
      duration: 90, // in minutes (base + add-ons)
      AddOns: [
        {
          title: "Deep Conditioning Treatment",
          price: 25,
        },
        {
          title: "Scalp Massage",
          price: 15,
        },
      ],
      hairServiceId: "66c5d1b8a21e5d4321f0b125", // ObjectId reference to HairService
    },
    status: BookingStatus.Upcoming,
    createdAt: "2025-08-20T10:15:00Z",
    updatedAt: "2025-08-20T10:15:00Z",
  },
  {
    _id: "66c5d1b8a21e5d4321f0b123", // MongoDB ObjectId
    firstName: "Chloe",
    lastName: "Anderson",
    phone: "+1-647-555-0123",
    email: "chloe.anderson@example.com",
    startTime: "2025-08-26T14:30:00Z", // ISO date string or custom "2:30pm"
    AdditionalNotes: "Please ensure a quiet room for the appointment.",
    customServiceDetail:
      "Please ensure a quiet room for the appointment. Please ensure a quiet room for the appointment. Please ensure a quiet room for the appointment. Please ensure a quiet room for the appointment. Please ensure a quiet room for the appointment. Please ensure a quiet room for the appointment. Please ensure a quiet room for the appointment. Please ensure a quiet room for the appointment. Please ensure a quiet room for the appointment. Please ensure a quiet room for the appointment. Please ensure a quiet room for the appointment. Please ensure a quiet room for the appointment. Please ensure a quiet room for the appointment. Please ensure a quiet room for the appointment. Please ensure a quiet room for the appointment. ",
    scheduleId: "66c5d1b8a21e5d4321f0b124", // another ObjectId
    service: {
      title: "Deluxe Hair Styling",
      price: 120, // base price without add-ons
      category: "Hair Styling",
      duration: 90, // in minutes (base + add-ons)
      AddOns: [
        {
          title: "Deep Conditioning Treatment",
          price: 25,
        },
        {
          title: "Scalp Massage",
          price: 15,
        },
      ],
      hairServiceId: "66c5d1b8a21e5d4321f0b125", // ObjectId reference to HairService
    },
    status: BookingStatus.Missed,
    createdAt: "2025-08-20T10:15:00Z",
    updatedAt: "2025-08-20T10:15:00Z",
  },
  {
    _id: 1,
    firstName: "Chigozie",
    lastName: "Muonagolu",
    startTime: "14:00pm",
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Missed,
  },
  {
    _id: 1,
    firstName: "Chigozie",
    lastName: "Muonagolu",
    startTime: "14:00pm",
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Cancelled,
  },
  {
    _id: 1,
    firstName: "Chigozie",
    lastName: "Muonagolu",
    startTime: "14:00pm",
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Cancelled,
  },
  {
    _id: 1,
    firstName: "Chigozie",
    lastName: "Muonagolu",
    startTime: "14:00pm",
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Completed,
  },
  {
    _id: 1,
    firstName: "Chigozie",
    lastName: "Muonagolu",
    startTime: "14:00pm",
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Completed,
  },
  {
    _id: 1,
    firstName: "Chigozie",
    lastName: "Muonagolu",
    startTime: "14:00pm",
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Completed,
  },
  {
    _id: 1,
    firstName: "Chigozie",
    lastName: "Muonagolu",
    startTime: "14:00pm",
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Completed,
  },
  {
    _id: 1,
    firstName: "Chigozie",
    lastName: "Muonagolu",
    startTime: "14:00pm",
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Completed,
  },

  {
    _id: 1,
    firstName: "Chigozie",
    lastName: "Muonagolu",
    startTime: "14:00pm",
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Completed,
  },
  {
    _id: 1,
    firstName: "Chigozie",
    lastName: "Muonagolu",
    startTime: "14:00pm",
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Completed,
  },
  {
    _id: 1,
    firstName: "Chigozie",
    lastName: "Muonagolu",
    startTime: "14:00pm",
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Completed,
  },
  {
    _id: 1,
    firstName: "Chigozie",
    lastName: "Muonagolu",
    startTime: "14:00pm",
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Completed,
  },
  {
    _id: 1,
    firstName: "Chigozie",
    lastName: "Muonagolu",
    startTime: "14:00pm",
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Cancelled,
  },
  {
    _id: 1,
    firstName: "Chigozie",
    lastName: "Muonagolu",
    startTime: "14:00pm",
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Missed,
  },
  {
    _id: 1,
    firstName: "Chigozie",
    lastName: "Muonagolu",
    startTime: "14:00pm",
    service: {
      title: "Two Strand Twists",
    },
    status: BookingStatus.Upcoming,
  },
];

export default TestBookingData;
export { TestAppointmentData };
