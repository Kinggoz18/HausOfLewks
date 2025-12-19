import axios from "axios";
import { getApiUrl } from "../../app/config/config";

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
      console.error(
        "Error while trying to get blog posts",
        error?.message ?? error
      );
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: `${this.apiUrl}${published !== null ? `?published=${String(published)}` : ''}`
      });
      throw new Error("An error occurred while trying to get blog posts");
    }
  };

  getBlogPostById = async (blogId) => {
    try {
      const response = (await axios.get(`${this.apiUrl}/${blogId}`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to get blog post",
        error?.message ?? error
      );
      throw new Error("An error occurred while trying to get blog post");
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
      console.error(
        "Error while trying to get blog post by slug",
        error?.message ?? error
      );
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
      throw new Error("An error occurred while trying to get blog post");
    }
  };

  createBlogPost = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}`, data)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to create blog post",
        error?.message ?? error
      );
      throw new Error(
        error?.message ?? "An error occurred while trying to create blog post"
      );
    }
  };

  updateBlogPost = async (blogId, data) => {
    try {
      const response = (await axios.put(`${this.apiUrl}/${blogId}`, data)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to update blog post",
        error?.message ?? error
      );
      throw new Error("An error occurred while trying to update blog post");
    }
  };

  deleteBlogPost = async (blogId) => {
    try {
      const response = (await axios.delete(`${this.apiUrl}/${blogId}`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to delete blog post",
        error?.message ?? error
      );
      throw new Error("An error occurred while trying to delete blog post");
    }
  };
}

