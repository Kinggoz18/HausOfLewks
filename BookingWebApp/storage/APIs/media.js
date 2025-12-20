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

export default class MediaAPI {
  constructor() {
    this.apiUrl = `${getApiUrl()}/media`;
  }

  /**
   * Get all media with optional filters
   * @param {Object} filters - Optional filters (tag, type)
   */
  getAllMedia = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.tag) params.append('tag', filters.tag);
      if (filters.type) params.append('type', filters.type);
      
      const queryString = params.toString();
      const url = queryString ? `${this.apiUrl}?${queryString}` : this.apiUrl;
      
      const response = (await axios.get(url)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to get media");
    }
  };

  /**
   * Upload new media
   * @param {FormData} formData - Form data with file, type, and tags
   */
  uploadMedia = async (formData) => {
    try {
      const response = (
        await axios.post(`${this.apiUrl}/create`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      ).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to upload media");
    }
  };

  /**
   * Delete media by ID
   * @param {string} id - Media ID
   */
  deleteMedia = async (id) => {
    try {
      const response = (
        await axios.post(`${this.apiUrl}/delete`, { id })
      ).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to delete media");
    }
  };
}

