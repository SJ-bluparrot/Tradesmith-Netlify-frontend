import "./src/global.css";
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, ClerkLoaded, ClerkLoading, useAuth } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { RootNavigator } from "@/navigation/RootNavigator";
import { ENV } from "@/constants/env";
import { setClerkTokenGetter } from "@/api/client";

// Registers Clerk's getToken with the Axios client so every request
// automatically gets a fresh, non-expired Bearer token.
function ClerkTokenSync() {
  const { getToken } = useAuth();
  useEffect(() => {
    setClerkTokenGetter(() => getToken());
  }, [getToken]);
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Clerk token cache using SecureStore (or localStorage on web)
const tokenCache = {
  async getToken(key: string) {
    try {
      if (Platform.OS === "web") {
        return localStorage.getItem(key);
      }
      return SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch {
      // ignore
    }
  },
  async clearToken(key: string) {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore
    }
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider
        publishableKey={ENV.CLERK_PUBLISHABLE_KEY}
        tokenCache={tokenCache}
      >
        <ClerkLoading>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff8f5" }}>
            <ActivityIndicator size="large" color="#b45309" />
          </View>
        </ClerkLoading>
        <ClerkLoaded>
          <ClerkTokenSync />
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              <NavigationContainer>
                <StatusBar style="dark" backgroundColor="#fff8f5" />
                <RootNavigator />
              </NavigationContainer>
            </SafeAreaProvider>
          </QueryClientProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
