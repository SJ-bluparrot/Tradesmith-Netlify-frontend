import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import type { AppStackParamList, TabParamList } from "./types";

// Screens
import { DashboardScreen } from "@/screens/DashboardScreen";
import { ProjectsScreen } from "@/screens/ProjectsScreen";
import { PlaygroundScreen } from "@/screens/PlaygroundScreen";
import { NewProjectScreen } from "@/screens/NewProjectScreen";
import { ProjectDetailsScreen } from "@/screens/ProjectDetailsScreen";
import { EstimateBuilderScreen } from "@/screens/EstimateBuilderScreen";
import { BidProposalScreen } from "@/screens/BidProposalScreen";

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<AppStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          borderTopColor: colors.outlineVariant,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: {
          ...typography.labelCaps,
          fontSize: 10,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Playground"
        component={PlaygroundScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flask-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="NewProject"
        component={NewProjectScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
      <Stack.Screen
        name="EstimateBuilder"
        component={EstimateBuilderScreen}
      />
      <Stack.Screen name="BidProposal" component={BidProposalScreen} />
    </Stack.Navigator>
  );
}
