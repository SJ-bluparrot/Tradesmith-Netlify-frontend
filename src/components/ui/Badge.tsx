import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";
import { typography } from "@/theme/typography";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "error";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant]]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  default: { backgroundColor: colors.surfaceContainerHigh },
  primary: { backgroundColor: colors.primaryFixed },
  success: { backgroundColor: "#d1fae5" },
  warning: { backgroundColor: "#fef3c7" },
  error: { backgroundColor: colors.errorContainer },
  text: { ...typography.labelCaps },
  defaultText: { color: colors.onSurfaceVariant },
  primaryText: { color: colors.onPrimaryFixed },
  successText: { color: "#065f46" },
  warningText: { color: "#92400e" },
  errorText: { color: colors.onErrorContainer },
});
