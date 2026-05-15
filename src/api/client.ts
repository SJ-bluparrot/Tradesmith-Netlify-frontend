import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { ENV } from "@/constants/env";

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 120_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Clerk token factory ──────────────────────────────────────────────────────
// Set by ClerkTokenSync in App.tsx using useAuth().getToken().
// This is called fresh on every request so tokens are never stale.

type TokenGetter = () => Promise<string | null>;
let _getToken: TokenGetter | null = null;

export function setClerkTokenGetter(fn: TokenGetter): void {
  _getToken = fn;
}

// ─── Request interceptor: attach Clerk session token ─────────────────────────

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = _getToken ? await _getToken() : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore token retrieval errors — request will proceed unauthenticated
    }
    return config;
  }
);

// ─── Response interceptor: normalize errors ───────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as Record<string, string>)?.message ??
      error.message ??
      "An unexpected error occurred";
    const status = error.response?.status;
    return Promise.reject({ message, status, original: error });
  }
);
