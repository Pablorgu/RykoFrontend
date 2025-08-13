import axios, {
  AxiosInstance,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "@env";
import { Platform } from "react-native";

function isFormDataPayload(data: unknown): boolean {
  if (!data) return false;
  if (typeof FormData !== "undefined" && data instanceof FormData) return true;
  return typeof data === "object" && typeof (data as any).append === "function";
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Token
    let token: string | null = null;
    token =
      Platform.OS === "web"
        ? sessionStorage.getItem("userToken")
        : await SecureStore.getItemAsync("userToken");

    // Use AxiosHeaders to avoid type errors
    const headers = new AxiosHeaders(config.headers ?? {});

    if (token) headers.set("Authorization", `Bearer ${token}`);

    if (isFormDataPayload(config.data)) {
      // Let axios/browser set the multipart boundary
      headers.delete("Content-Type");
    } else {
      headers.set("Content-Type", "application/json");
    }

    config.headers = headers;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
