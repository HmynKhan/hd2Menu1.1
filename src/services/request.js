import axios from "axios";
export const baseURL = "https://api.prismatic-technologies.com.pk";
const axiosInstance = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

const request = axiosInstance.request;

export default request;
