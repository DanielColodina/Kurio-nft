import axios from "axios";

export const api = axios.create({
  baseURL: `${import.meta.env.BASE_URL}api`,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});
