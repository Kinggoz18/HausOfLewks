import axios from "axios";
import { getApiUrl } from "../../app/config/config";
import { deletePersistData } from "../persistData";

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

export default class AuthAPI {
  constructor() {
    this.apiUrl = `${getApiUrl()}/user`;
  }

  /**
   * Login or signup a user
   * @param mode signup/login
   * @param signupCode Signup code
   * @param role User role (Owner, Employee, Developer) - only for signup
   */
  async authenticateUser(mode, code, role = null) {
    try {
      if (mode === "signup") {
        const hashedCode = await this.hashCode(code);
        // Build state object with mode and role (role is required for signup)
        const state = { 
          mode, 
          role: role || 'Employee' // Always include role, default to Employee
        };
        if (isDev()) {
          console.log('Signup state with role:', state);
        }
        const stateParam = encodeURIComponent(JSON.stringify(state));
        window.location.assign(
          `${this.apiUrl}/login?mode=${mode}&signupcode=${encodeURIComponent(
            hashedCode
          )}&state=${stateParam}`
        );
      } else {
        // Login mode - no role needed
        const state = { mode };
        const stateParam = encodeURIComponent(JSON.stringify(state));
        window.location.assign(`${this.apiUrl}/login?mode=${mode}&state=${stateParam}`);
      }
    } catch (error) {
      if (isDev()) {
        console.error('Authentication error:', error);
      }
      throw handleApiError(error, "An error occurred while trying to authenticate");
    }
  }

  hashCode = async (code) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashedCode = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashedCode;
  };

  async getAuthenticatedUser(userId) {
    try {
      const response = (await axios.get(`${this.apiUrl}/${userId}`)).data;
      if (!response.isSuccess) {
        throw new Error(response.content);
      }
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to get authenticated user");
    }
  }

  async logoutUser(userId) {
    try {
      const response = (
        await axios.get(`${this.apiUrl}/logout/${userId}`, {
          withCredentials: true,
        })
      ).data;
      if (!response.isSuccess) {
        throw new Error(response.content);
      }
      deletePersistData("user");
      deletePersistData("csrf-token");
      return response?.content;
    } catch (error) {
      throw handleApiError(error, "An error occurred while trying to logout");
    }
  }
}
