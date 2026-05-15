import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useProject } from "@/hooks/useProjects";
import { useEstimate } from "@/hooks/useEstimates";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import {
  formatCurrency,
  formatDate,
  formatConfidence,
  projectTypeLabel,
} from "@/utils/format";
import type { AppStackParamList } from "@/navigation/types";

type Nav = StackNavigationProp<AppStackParamList, "ProjectDetails">;
type Route = RouteProp<AppStackParamList, "ProjectDetails">;

export function ProjectDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { projectId } = params;

  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
    refetch: refetchProject,
  } = useProject(projectId);
  const {
    data: estimate,
    isLoading: estimateLoading,
  } = useEstimate(projectId);

  if (projectError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project</Text>
        </View>
        <ErrorState
          message="Failed to load project"
          onRetry={refetchProject}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {projectLoading ? "Loading…" : (project?.name ?? "Project")}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {projectLoading ? (
          <>
            <View style={styles.skeletonCard}>
              <Skeleton width="70%" height={22} />
              <Skeleton width="40%" height={16} style={{ marginTop: 8 }} />
              <Skeleton width="100%" height={1} style={{ marginTop: 16 }} />
              <Skeleton width="50%" height={14} style={{ marginTop: 16 }} />
              <Skeleton width="60%" height={14} style={{ marginTop: 8 }} />
            </View>
          </>
        ) : project ? (
          <>
            {/* Project Info Card */}
            <Card style={styles.infoCard}>
              <View style={styles.infoTop}>
                <Text style={styles.projectName}>{project.name}</Text>
                <Badge
                  label={project.status}
                  variant={project.status === "active" ? "success" : "default"}
                />
              </View>

              <View style={styles.infoRow}>
                <Badge label={projectTypeLabel(project.type)} variant="primary" />
              </View>

              {project.clientName ? (
                <View style={styles.metaRow}>
                  <Ionicons name="person-outline" size={14} color={colors.outline} />
                  <Text style={styles.metaText}>{project.clientName}</Text>
                </View>
              ) : null}

              {project.address ? (
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={14} color={colors.outline} />
                  <Text style={styles.metaText}>{project.address}</Text>
                </View>
              ) : null}

              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={colors.outline} />
                <Text style={styles.metaText}>
                  Created {formatDate(project.createdAt)}
                </Text>
              </View>
            </Card>

            {/* Estimate Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estimate</Text>

              {estimateLoading ? (
                <View style={styles.skeletonCard}>
                  <Skeleton width="40%" height={36} />
                  <Skeleton width="60%" height={16} style={{ marginTop: 8 }} />
                </View>
              ) : estimate ? (
                <Card style={styles.estimateCard}>
                  <Text style={styles.totalCost}>
                    {formatCurrency(Number(estimate.totalCost))}
                  </Text>
                  {estimate.confidence ? (
                    <View style={styles.confidenceRow}>
                      <Badge
                        label={
                          formatConfidence(Number(estimate.confidence)).label
                        }
                        variant={
                          formatConfidence(Number(estimate.confidence)).variant
                        }
                      />
                    </View>
                  ) : null}
                  <View style={styles.estimateMeta}>
                    <View style={styles.metaRow}>
                      <Ionicons
                        name="list-outline"
                        size={14}
                        color={colors.outline}
                      />
                      <Text style={styles.metaText}>
                        {Array.isArray(estimate.lineItems)
                          ? estimate.lineItems.length
                          : 0}{" "}
                        line items
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={colors.outline}
                      />
                      <Text style={styles.metaText}>
                        {formatDate(estimate.createdAt)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.estimateActions}>
                    <TouchableOpacity
                      style={styles.viewEstimateBtn}
                      onPress={() =>
                        navigation.navigate("EstimateBuilder", { projectId })
                      }
                      activeOpacity={0.85}
                    >
                      <Text style={styles.viewEstimateBtnText}>
                        View Full Estimate
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={14}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.proposalBtn}
                      onPress={() =>
                        navigation.navigate("BidProposal", {
                          projectId,
                          estimateId: estimate.id,
                        })
                      }
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name="document-text"
                        size={16}
                        color={colors.onPrimary}
                      />
                      <Text style={styles.proposalBtnText}>
                        Generate Proposal
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ) : (
                <Card style={styles.emptyEstimateCard}>
                  <View style={styles.emptyEstimateContent}>
                    <Ionicons
                      name="calculator-outline"
                      size={32}
                      color={colors.outline}
                    />
                    <Text style={styles.emptyEstimateTitle}>
                      No estimate yet
                    </Text>
                    <Text style={styles.emptyEstimateDesc}>
                      Generate an AI-powered estimate for this project
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.generateBtn}
                    onPress={() =>
                      navigation.navigate("EstimateBuilder", { projectId })
                    }
                    activeOpacity={0.85}
                  >
                    <Ionicons name="sparkles" size={16} color={colors.onPrimary} />
                    <Text style={styles.generateBtnText}>Generate Estimate</Text>
                  </TouchableOpacity>
                </Card>
              )}
            </View>

            {/* Documents */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Proposals & Documents</Text>
              <Card>
                <View style={styles.emptyDocs}>
                  <Ionicons
                    name="document-outline"
                    size={28}
                    color={colors.outline}
                  />
                  <Text style={styles.emptyDocsText}>
                    No proposals generated yet
                  </Text>
                </View>
              </Card>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    flex: 1,
    textAlign: "center",
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing["2xl"],
  },
  skeletonCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.lg,
  },
  infoCard: { gap: spacing.md },
  infoTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  projectName: {
    ...typography.headlineLg,
    color: colors.onSurface,
    flex: 1,
  },
  infoRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  metaText: { ...typography.bodySm, color: colors.onSurfaceVariant },
  section: { gap: spacing.md },
  sectionTitle: { ...typography.headlineMd, color: colors.onSurface },
  estimateCard: { gap: spacing.md },
  totalCost: {
    ...typography.headlineLg,
    fontSize: 32,
    color: colors.primary,
  },
  confidenceRow: { flexDirection: "row" },
  estimateMeta: { gap: spacing.sm },
  estimateActions: { gap: spacing.md, marginTop: spacing.sm },
  viewEstimateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  viewEstimateBtnText: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: "600",
  },
  proposalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 48,
  },
  proposalBtnText: { ...typography.labelCaps, color: colors.onPrimary, fontSize: 13 },
  emptyEstimateCard: { gap: spacing.lg },
  emptyEstimateContent: { alignItems: "center", gap: spacing.sm },
  emptyEstimateTitle: { ...typography.headlineSm, color: colors.onSurface },
  emptyEstimateDesc: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 48,
  },
  generateBtnText: { ...typography.labelCaps, color: colors.onPrimary, fontSize: 13 },
  emptyDocs: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.lg },
  emptyDocsText: { ...typography.bodyMd, color: colors.onSurfaceVariant },
});
