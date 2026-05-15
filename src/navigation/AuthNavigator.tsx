import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import type { AuthStackParamList } from "./types";
import { SignInScreen } from "@/screens/SignInScreen";

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
    </Stack.Navigator>
  );
}
