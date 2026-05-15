require("dotenv").config();

module.exports = {
  expo: {
    name: "TradeSmith",
    slug: "tradesmith",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#fff8f5",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.tradesmith.app",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#fff8f5",
      },
      package: "com.tradesmith.app",
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
      output: "single",
    },
    plugins: [
      "expo-secure-store",
      [
        "expo-web-browser",
        {
          experimentalLaunchMethod: "system",
        },
      ],
    ],
    scheme: "tradesmith",
    extra: {
      API_BASE_URL: process.env.API_BASE_URL ?? "http://localhost:3000",
      AI_SERVICE_URL: process.env.AI_SERVICE_URL ?? "http://localhost:8000",
      CLERK_PUBLISHABLE_KEY:
        process.env.CLERK_PUBLISHABLE_KEY ??
        "pk_test_bm90ZWQtbWFzdG9kb24tMjcuY2xlcmsuYWNjb3VudHMuZGV2JA",
    },
  },
};
