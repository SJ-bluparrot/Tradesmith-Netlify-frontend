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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProject } from "@/hooks/useProjects";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import type { AppStackParamList } from "@/navigation/types";
import type { ProjectType } from "@/types";

type Nav = StackNavigationProp<AppStackParamList>;

const newProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  type: z.enum(["deck", "remodel", "cabinet", "framing", "finish", "other"]),
  clientName: z.string().optional(),
  address: z.string().optional(),
});
type NewProjectForm = z.infer<typeof newProjectSchema>;

const PROJECT_TYPES: {
  value: ProjectType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "deck", label: "Deck", icon: "construct-outline" },
  { value: "remodel", label: "Remodel", icon: "home-outline" },
  { value: "cabinet", label: "Cabinetry", icon: "albums-outline" },
  { value: "framing", label: "Framing", icon: "grid-outline" },
  { value: "finish", label: "Finish", icon: "brush-outline" },
  { value: "other", label: "Other", icon: "ellipsis-horizontal-circle-outline" },
];

export function NewProjectScreen() {
  const navigation = useNavigation<Nav>();
  const createProject = useCreateProject();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NewProjectForm>({
    resolver: zodResolver(newProjectSchema),
    defaultValues: { name: "", type: "deck", clientName: "", address: "" },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: NewProjectForm) => {
    try {
      const project = await createProject.mutateAsync({
        name: data.name,
        type: data.type,
        clientName: data.clientName || undefined,
        address: data.address || undefined,
      });
      navigation.replace("ProjectDetails", { projectId: project.id });
    } catch {
      // error is surfaced via mutation state
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-back" size={22} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create New Project</Text>
          </View>
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>Step 1 of 2</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {createProject.error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorBannerText}>
                {(createProject.error as { message?: string }).message ??
                  "Failed to create project"}
              </Text>
            </View>
          ) : null}

          {/* Project Name */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Project Name *</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.name ? styles.inputError : null]}
                  placeholder="e.g. Elm Street Renovation"
                  placeholderTextColor={colors.outline}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  returnKeyType="next"
                />
              )}
            />
            {errors.name ? (
              <Text style={styles.fieldError}>{errors.name.message}</Text>
            ) : null}
          </View>

          {/* Project Type */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Project Type</Text>
            <View style={styles.typeGrid}>
              {PROJECT_TYPES.map((pt) => (
                <TouchableOpacity
                  key={pt.value}
                  style={[
                    styles.typeCard,
                    selectedType === pt.value && styles.typeCardActive,
                  ]}
                  onPress={() => setValue("type", pt.value)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={pt.icon}
                    size={28}
                    color={
                      selectedType === pt.value
                        ? colors.primary
                        : colors.onSurfaceVariant
                    }
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      selectedType === pt.value && styles.typeLabelActive,
                    ]}
                  >
                    {pt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Client Name */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Client Name (optional)</Text>
            <Controller
              control={control}
              name="clientName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g. John Smith"
                  placeholderTextColor={colors.outline}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
          </View>

          {/* Address */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Project Address (optional)</Text>
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 123 Main St, Austin, TX"
                  placeholderTextColor={colors.outline}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
          </View>
        </ScrollView>

        {/* Bottom action */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (isSubmitting || createProject.isPending) && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || createProject.isPending}
            activeOpacity={0.85}
          >
            {isSubmitting || createProject.isPending ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Create Project</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  stepBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  stepText: { ...typography.labelCaps, color: colors.onSurfaceVariant },
  progressBar: {
    height: 4,
    backgroundColor: colors.surfaceContainerHigh,
  },
  progressFill: {
    height: 4,
    width: "50%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing["2xl"],
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorBannerText: { ...typography.bodyMd, color: colors.error, flex: 1 },
  field: { gap: spacing.sm },
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
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  typeCard: {
    width: "30%",
    flexGrow: 1,
    minWidth: 90,
    height: 90,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  typeCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.surfaceBright,
  },
  typeLabel: { ...typography.labelCaps, color: colors.onSurfaceVariant },
  typeLabelActive: { color: colors.primary },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { ...typography.labelCaps, color: colors.onPrimary, fontSize: 14 },
});
