import type { NavigatorScreenParams } from "@react-navigation/native";

export type TabParamList = {
  Dashboard: undefined;
  Projects: undefined;
  Playground: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  NewProject: undefined;
  ProjectDetails: { projectId: string };
  EstimateBuilder: { projectId: string };
  BidProposal: { projectId: string; estimateId: string };
};

export type AuthStackParamList = {
  SignIn: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};
