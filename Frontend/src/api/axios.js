// src/api/client.js
import axios from "axios";

const API_BASE_URL = "https://bytetools-mu.vercel.app";

if (!API_BASE_URL) {
  console.error("❌ API_BASE_URL no está definido");
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
