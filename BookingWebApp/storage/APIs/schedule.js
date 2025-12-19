import axios from "axios";
import { getApiUrl } from "../../app/config/config";

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
      console.error(
        "Error while trying to create schedule:",
        error?.message ?? error
      );
      throw new Error("Error while trying to create schedule");
    }
  };

  getByDate = async (date) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/date`, { date })).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to get schedule:",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to get schedule");
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
      console.error(
        "Error while trying to get schedule:",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to get schedule");
    }
  };

  updateSchedule = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/update`, data)).data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to get schedule:",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to get schedule");
    }
  };

  removeSlot = async (data) => {
    try {
      const response = (await axios.post(`${this.apiUrl}/remove-slot`, data))
        .data;
      if (!response.isSuccess) throw new Error(response?.content);
      return response?.content;
    } catch (error) {
      console.error(
        "Error while trying to get schedule:",
        error?.message ?? error
      );
      throw new Error("An error occured while trying to get schedule");
    }
  };
}
