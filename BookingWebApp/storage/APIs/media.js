import axios from "axios";
import { getApiUrl } from "../../app/config/config";

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
      console.error("Error while trying to get media:", error?.message ?? error);
      throw new Error(error?.response?.data?.content || "An error occurred while trying to get media");
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
      console.error("Error while trying to upload media:", error?.message ?? error);
      throw new Error(error?.response?.data?.content || "An error occurred while trying to upload media");
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
      console.error("Error while trying to delete media:", error?.message ?? error);
      throw new Error(error?.response?.data?.content || "An error occurred while trying to delete media");
    }
  };
}

