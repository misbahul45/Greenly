import axios from "axios";

export const createApi = (cookie?: string) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_URL ||  process.env.API_URL,
    withCredentials: true,
    headers: cookie ? { cookie } : {},
  });