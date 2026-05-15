import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSignIn } from "@clerk/clerk-expo";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";
import { typography } from "@/theme/typography";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type SignInForm = z.infer<typeof signInSchema>;

const { width } = Dimensions.get("window");
const isWide = width >= 768;

export function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInForm) => {
    if (!isLoaded || !signIn) return;
    setAuthError(null);
    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      const message =
        clerkError.errors?.[0]?.message ?? "Sign in failed. Please try again.";
      setAuthError(message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.container, isWide && styles.containerWide]}>
            {/* Left branding panel (wide screens) */}
            {isWide && (
              <View style={styles.brandPanel}>
                <View>
                  <View style={styles.logoRow}>
                    <Ionicons
                      name="construct"
                      size={32}
                      color={colors.primaryFixed}
                    />
                    <Text style={styles.brandName}>TradeSmith</Text>
                  </View>
                  <Text style={styles.brandTagline}>
                    Your AI-powered trade partner, engineered for precision and
                    built for scale.
                  </Text>
                </View>

                <View style={styles.features}>
                  {[
                    {
                      icon: "flash" as const,
                      title: "⚡ AI Estimates",
                      desc: "Generate accurate takeoff lists in seconds, not hours.",
                    },
                    {
                      icon: "document-text" as const,
                      title: "📄 Bid Proposals",
                      desc: "Create professional, client-ready proposals instantly.",
                    },
                    {
                      icon: "analytics" as const,
                      title: "🔨 Trade Intelligence",
                      desc: "Real-time material pricing and labor tracking.",
                    },
                  ].map((f, i) => (
                    <View key={i} style={styles.featureItem}>
                      <View style={styles.featureIcon}>
                        <Ionicons name={f.icon} size={20} color={colors.primaryFixed} />
                      </View>
                      <View style={styles.featureText}>
                        <Text style={styles.featureTitle}>{f.title}</Text>
                        <Text style={styles.featureDesc}>{f.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <Text style={styles.copyright}>
                  © 2024 TradeSmith Systems Inc.
                </Text>
              </View>
            )}

            {/* Auth card */}
            <View style={[styles.authPanel, isWide && styles.authPanelWide]}>
              <View style={styles.authCard}>
                {/* Mobile logo */}
                {!isWide && (
                  <View style={styles.mobileLogo}>
                    <Ionicons
                      name="construct"
                      size={28}
                      color={colors.primary}
                    />
                    <Text style={styles.mobileLogoText}>TradeSmith</Text>
                  </View>
                )}

                <Text style={styles.heading}>Sign in</Text>
                <Text style={styles.subheading}>
                  Access your trade dashboard
                </Text>

                {authError ? (
                  <View style={styles.errorBanner}>
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color={colors.error}
                    />
                    <Text style={styles.errorBannerText}>{authError}</Text>
                  </View>
                ) : null}

                {/* Email */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          errors.email ? styles.inputError : null,
                        ]}
                        placeholder="you@company.com"
                        placeholderTextColor={colors.outline}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                      />
                    )}
                  />
                  {errors.email ? (
                    <Text style={styles.fieldError}>{errors.email.message}</Text>
                  ) : null}
                </View>

                {/* Password */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          errors.password ? styles.inputError : null,
                        ]}
                        placeholder="••••••••"
                        placeholderTextColor={colors.outline}
                        secureTextEntry
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                      />
                    )}
                  />
                  {errors.password ? (
                    <Text style={styles.fieldError}>
                      {errors.password.message}
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    isSubmitting && styles.submitBtnDisabled,
                  ]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={colors.onPrimary} />
                  ) : (
                    <Text style={styles.submitBtnText}>Sign in</Text>
                  )}
                </TouchableOpacity>

                <Text style={styles.footerText}>
                  New to TradeSmith? Contact your administrator for access.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  container: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: colors.background,
  },
  containerWide: {
    flexDirection: "row",
  },
  // Brand panel
  brandPanel: {
    flex: 1,
    backgroundColor: colors.inverseSurface,
    padding: spacing["2xl"],
    justifyContent: "space-between",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  brandName: {
    ...typography.headlineLg,
    color: colors.surfaceContainerLowest,
  },
  brandTagline: {
    ...typography.bodyLg,
    color: colors.outlineVariant,
    maxWidth: 300,
  },
  features: { gap: spacing.xl, marginTop: spacing["2xl"] },
  featureItem: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { flex: 1 },
  featureTitle: {
    ...typography.dataMono,
    color: colors.surfaceContainerLowest,
    marginBottom: 2,
  },
  featureDesc: { ...typography.bodySm, color: colors.outlineVariant },
  copyright: {
    ...typography.bodySm,
    color: colors.outline,
    marginTop: spacing["2xl"],
  },
  // Auth panel
  authPanel: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  authPanelWide: { padding: spacing["2xl"] },
  authCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: "#1c1917",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  mobileLogo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  mobileLogoText: { ...typography.headlineLg, color: colors.onSurface },
  heading: { ...typography.headlineLg, color: colors.onSurface, marginBottom: spacing.xs },
  subheading: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xl,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorBannerText: { ...typography.bodyMd, color: colors.error, flex: 1 },
  fieldGroup: { gap: spacing.xs, marginBottom: spacing.lg },
  fieldLabel: {
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
  inputError: { borderColor: colors.error, borderWidth: 2 },
  fieldError: { ...typography.bodySm, color: colors.error, marginLeft: spacing.xs },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: {
    ...typography.labelCaps,
    color: colors.onPrimary,
    fontSize: 14,
  },
  footerText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
