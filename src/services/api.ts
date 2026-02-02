import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Laravel API URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
