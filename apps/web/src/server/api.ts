import axios from "axios";


export const createApi = (
  accessToken?: string,
  refreshToken?: string
) => {
  const api = axios.create({
    baseURL: process.env.API_URL,
  });

  api.interceptors.request.use((config) => {

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (refreshToken) {
      config.headers["x-refresh-token"] = refreshToken;
    }

    return config;
  });

  return api;
};