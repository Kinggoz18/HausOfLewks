import axios from "axios";
import { getApiUrl } from "../../app/config/config";

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
      console.error(
        "Error while trying to create schedule",
        error?.message ?? error
      );
      throw new Error("Error while trying to get appointments");
    }
  };

  getBookingsSummary = async () => {
    try {
      const response = (await axios.get(`${this.apiUrl}/summary`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to get booking summary",
        error?.message ?? error
      );
      throw new Error("An error occurred while trying to get booking summary");
    }
  };

  updateBookingById = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/update`, data)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to update booking",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to update booking");
    }
  };

  createBooking = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}`, data)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to create booking",
        error?.message ?? error
      );
      throw new Error(
        error?.message ?? "An error occured while trying to create booking"
      );
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
      console.error(
        "Error while trying to get income report",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to get income report");
    }
  };
}
