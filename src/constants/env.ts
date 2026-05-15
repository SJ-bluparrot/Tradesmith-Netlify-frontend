import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

export const ENV = {
  API_BASE_URL: extra.API_BASE_URL ?? "http://localhost:3000",
  AI_SERVICE_URL: extra.AI_SERVICE_URL ?? "http://localhost:8000",
  CLERK_PUBLISHABLE_KEY:
    extra.CLERK_PUBLISHABLE_KEY ??
    "pk_test_bm90ZWQtbWFzdG9kb24tMjcuY2xlcmsuYWNjb3VudHMuZGV2JA",
} as const;
