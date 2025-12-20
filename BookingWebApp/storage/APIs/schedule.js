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

export default class ScheduleAPI {
  constructor() {
    this.apiUrl = `${getApiUrl()}/schedule`;
  }

  createSchedule = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/create`, data)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to create schedule");
    }
  };

  getByDate = async (date) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/date`, { date })).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to get schedule");
    }
  };

  deleteSchedule = async (scheduleId) => {
    try {
      const response = (
        await axios.post(`${this.apiUrl}/delete`, { scheduleId })
      ).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to delete schedule");
    }
  };

  updateSchedule = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/update`, data)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to update schedule");
    }
  };

  removeSlot = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/remove-slot`, data))
        .data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to remove time slot");
    }
  };
}
