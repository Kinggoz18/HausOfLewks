import axios from "axios";
import { getApiUrl } from "../../app/config/config";

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
      console.error(
        "Error while trying to add service:",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to add service");
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
      console.error(
        "Error while trying to add service:",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to add service");
    }
  };

  addAddon = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/add-on`, data)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to add service:",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to add service");
    }
  };

  /***************************************************************{DELETE Routes}*********************************************************************/
  removeHairService = async (id) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/service/${id}`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to remove service:",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to remove service");
    }
  };

  removeCategory = async (id) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/category/${id}`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to remove service:",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to remove service");
    }
  };

  removeAddon = async (id) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/add-on/${id}`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to remove service:",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to remove service");
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
      console.error(
        "Error while trying to update service:",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to update service");
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
      console.error(
        "Error while trying to update service:",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to update service");
    }
  };

  updateAddon = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/update/add-on`, data))
        .data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to update service:",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to update service");
    }
  };

  /***************************************************************{GET Routes}*********************************************************************/

  getServicesByCategory = async () => {
    try {
      const response = (await axios.get(`${this.apiUrl}`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to get service:",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to get service");
    }
  };

  getAvailableHairServicesForSchedule = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/available`, data)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to get available services for schedule:",
        error?.message ?? error
      );
      throw new Error(
        "An error occured while trying to get available services for schedule"
      );
    }
  };

  getCategories = async () => {
    try {
      const response = (await axios.get(`${this.apiUrl}/category`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to get categories:",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to get categories");
    }
  };

  getAddons = async () => {
    try {
      const response = (await axios.get(`${this.apiUrl}/add-on`)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to get addons:",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to get addons");
    }
  };
}
