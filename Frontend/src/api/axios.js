import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000, https://bytetools-mu.vercel.app/",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
