import React from "react";
import { useUser } from "@clerk/clerk-expo";
import { createStackNavigator } from "@react-navigation/stack";
import type { RootStackParamList } from "./types";
import { AppNavigator } from "./AppNavigator";
import { AuthNavigator } from "./AuthNavigator";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/theme/colors";

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
