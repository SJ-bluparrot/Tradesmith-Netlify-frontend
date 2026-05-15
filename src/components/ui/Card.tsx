import React from "react";
import {
  View,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: keyof typeof spacing | number;
}

export function Card({ children, style, padding = "lg" }: CardProps) {
  const paddingValue =
    typeof padding === "number" ? padding : spacing[padding];
  return (
    <View style={[styles.card, { padding: paddingValue }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: "#1c1917",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
});
