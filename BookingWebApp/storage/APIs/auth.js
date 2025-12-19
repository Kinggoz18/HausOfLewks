import axios from "axios";
import { getApiUrl } from "../../app/config/config";
import { deletePersistData } from "../persistData";

export default class AuthAPI {
  constructor() {
    this.apiUrl = `${getApiUrl()}/user`;
  }

  /**
   * Login or signup a user
   * @param mode signup/login
   * @param signupCode Signup code
   */
  async authenticateUser(mode, code) {
    try {
      if (mode === "signup") {
        const hashedCode = await this.hashCode(code);
        window.location.assign(
          `${this.apiUrl}/login?mode=${mode}&signupcode=${encodeURIComponent(
            hashedCode
          )}`
        );
      } else {
        window.location.assign(`${this.apiUrl}/login?mode=${mode}`);
      }
    } catch (error) {
      console.log({ error });
      throw new Error(
        error?.response?.data?.content ?? error?.message ?? error
      );
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
      throw new Error(error?.response?.data?.data ?? error?.message ?? error);
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
      throw new Error(
        error?.response?.data?.content ?? error?.message ?? error
      );
    }
  }
}
