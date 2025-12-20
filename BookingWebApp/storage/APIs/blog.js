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
    if (error?.response) {
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
    }
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
      const errorMessage = error.response.data?.content || error.response.data?.message || defaultMessage;
      const apiError = new Error(errorMessage);
      if (status === 404) {
        apiError.status = 404;
      }
      return apiError;
    }
  }

  // Preserve status if already set
  if (error?.status) {
    const apiError = new Error(error?.message || defaultMessage);
    apiError.status = error.status;
    return apiError;
  }

  // Return server message if available, otherwise use default
  return new Error(error?.message || defaultMessage);
};

export default class BlogAPI {
  constructor() {
    this.apiUrl = `${getApiUrl()}/blog`;
  }

  getAllBlogPosts = async (published = null) => {
    try {
      const params = published !== null ? `?published=${String(published)}` : '';
      const response = await axios.get(`${this.apiUrl}${params}`);
      
      if (!response.data.isSuccess) {
        throw new Error(response.data?.content || "Failed to get blog posts");
      }
      
      return response.data?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to get blog posts");
    }
  };

  getBlogPostById = async (blogId) => {
    try {
      const response = (await axios.get(`${this.apiUrl}/${blogId}`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to get blog post");
    }
  };

  getBlogPostBySlug = async (slug) => {
    try {
      const response = await axios.get(`${this.apiUrl}/slug/${slug}`);
      if (!response.data.isSuccess) {
        const error = new Error(response.data?.content || "Blog post not found");
        error.status = response.status || 404;
        throw error;
      }
      return response.data?.content;
    } catch (error) {
      // Preserve the original error status if available
      if (error.response) {
        const apiError = new Error(error.response.data?.content || "Blog post not found");
        apiError.status = error.response.status;
        throw apiError;
      }
      // If it's already an Error with status, re-throw it
      if (error.status) {
        throw error;
      }
      throw handleApiError(error, "An error occurred while trying to get blog post");
    }
  };

  createBlogPost = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}`, data)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to create blog post");
    }
  };

  updateBlogPost = async (blogId, data) => {
    try {
      const response = (await axios.put(`${this.apiUrl}/${blogId}`, data)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to update blog post");
    }
  };

  deleteBlogPost = async (blogId) => {
    try {
      const response = (await axios.delete(`${this.apiUrl}/${blogId}`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to delete blog post");
    }
  };
}

