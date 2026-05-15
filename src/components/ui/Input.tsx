import React, { forwardRef, useState } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  type TextInputProps,
} from "react-native";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";
import { typography } from "@/theme/typography";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, style, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={ref}
        style={[
          styles.input,
          focused && styles.focused,
          error ? styles.errored : null,
          style,
        ]}
        placeholderTextColor={colors.outline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    ...typography.labelCaps,
    color: colors.onSurfaceVariant,
    marginLeft: spacing.xs,
  },
  input: {
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.surfaceContainerLowest,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  focused: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  errored: {
    borderColor: colors.error,
  },
  error: {
    ...typography.bodySm,
    color: colors.error,
    marginLeft: spacing.xs,
  },
});
