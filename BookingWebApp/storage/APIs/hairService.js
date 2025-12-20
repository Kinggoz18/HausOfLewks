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

export default class HairServiceAPI {
  constructor() {
    this.apiUrl = `${getApiUrl()}/hair-service`;
  }

  /***************************************************************{POST Routes}*********************************************************************/
  addHairService = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/service`, data)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to add service");
    }
  };

  addCategory = async (data) => {
    try {
      const response = (
        await axios.post(`${this.apiUrl}/category`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      ).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to add category");
    }
  };

  addAddon = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/add-on`, data)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to add add-on");
    }
  };

  /***************************************************************{DELETE Routes}*********************************************************************/
  removeHairService = async (id) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/service/${id}`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to remove service");
    }
  };

  removeCategory = async (id) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/category/${id}`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to remove category");
    }
  };

  removeAddon = async (id) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/add-on/${id}`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to remove add-on");
    }
  };

  /***************************************************************{Update Routes}*********************************************************************/
  updateHairService = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/update/service`, data))
        .data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to update service");
    }
  };

  updateCategory = async (data) => {
    try {
      const response = (
        await axios.post(`${this.apiUrl}/update/category`, data)
      ).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to update category");
    }
  };

  updateAddon = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/update/add-on`, data))
        .data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to update add-on");
    }
  };

  /***************************************************************{GET Routes}*********************************************************************/

  getServicesByCategory = async () => {
    try {
      const response = (await axios.get(`${this.apiUrl}`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to get services");
    }
  };

  getAvailableHairServicesForSchedule = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/available`, data)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to get available services for schedule");
    }
  };

  getCategories = async () => {
    try {
      const response = (await axios.get(`${this.apiUrl}/category`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to get categories");
    }
  };

  getAddons = async () => {
    try {
      const response = (await axios.get(`${this.apiUrl}/add-on`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to get add-ons");
    }
  };
}
