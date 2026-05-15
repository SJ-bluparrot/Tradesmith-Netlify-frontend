import { StyleSheet } from "react-native";

export const typography = StyleSheet.create({
  headlineLg: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  headlineMd: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  headlineSm: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  bodyLg: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
  },
  bodyMd: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
  bodySm: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
  },
  labelCaps: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  dataMono: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    fontVariant: ["tabular-nums"],
  },
});
