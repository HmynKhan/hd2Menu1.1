import axios from "axios";

export const baseURL = "https://dev.app.hd2.menu"; // Base URL updated

const axiosInstance = axios.create({
  baseURL: `${baseURL}/api`, // Base URL for API calls
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

const request = axiosInstance;

export default request;
