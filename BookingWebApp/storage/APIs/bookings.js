import axios from "axios";
import { getApiUrl } from "../../app/config/config";

// Helper function to check if we're in development mode
const isDev = () => {
  return typeof window !== 'undefined' 
    ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    : process.env.NODE_ENV !== 'production';
};

// Helper function to handle API errors with user-friendly messages
const handleApiError = (error, defaultMessage) => {
  if (isDev()) {
    console.error(defaultMessage, error?.message ?? error);
  }

  // Check for network errors
  if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
    return new Error("Unable to connect to the server. Please check your internet connection and try again.");
  }

  // Check for timeout errors
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return new Error("Request timed out. Please try again.");
  }

  // Check for HTTP errors
  if (error?.response) {
    const status = error.response.status;
    if (status === 404) {
      return new Error("The requested resource was not found. Please try again.");
    }
    if (status === 500) {
      return new Error("Server error occurred. Please try again later.");
    }
    if (status >= 400 && status < 500) {
      // Use server error message if available, otherwise use default
      return new Error(error.response.data?.content || error.response.data?.message || defaultMessage);
    }
  }

  // Return server message if available, otherwise use default
  return new Error(error?.message || defaultMessage);
};

export default class BookingAPI {
  constructor() {
    this.apiUrl = `${getApiUrl()}/booking`;
  }

  getAllBookings = async (data) => {
    try {
      const response = (
        await axios.post(`${this.apiUrl}/get-bookings`, data)
      ).data;

      if (!response.isSuccess) throw new Error(response?.content);

      // New paginated shape from backend:
      // { items: Booking[], total: number, page: number, pageSize: number }
      const content = response?.content;

      // Backwards compatibility: if backend still returns an array,
      // normalize it into the new shape.
      if (Array.isArray(content)) {
        return {
          items: content,
          total: content.length,
          page: 1,
          pageSize: content.length,
        };
      }

      return content;
    } catch (error) {
      throw handleApiError(error, "Error while trying to get appointments");
    }
  };

  getBookingsSummary = async () => {
    try {
      const response = (await axios.get(`${this.apiUrl}/summary`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to get booking summary");
    }
  };

  updateBookingById = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/update`, data)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to update booking");
    }
  };

  createBooking = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}`, data)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to create booking");
    }
  };

  getIncomeReport = async (data) => {
    try {
      const response = (
        await axios.post(`${this.apiUrl}/income-report`, data ?? {})
      ).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to get income report");
    }
  };
}
