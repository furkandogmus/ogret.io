import axios from "axios";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8080/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if ((error.response?.status === 401 || error.response?.status === 403) && !original._retry) {
      original._retry = true;
      const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );
          await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
          await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          await SecureStore.deleteItemAsync(REFRESH_KEY);
        }
      }
    }
    return Promise.reject(error);
  }
);

export { api, TOKEN_KEY, REFRESH_KEY };
