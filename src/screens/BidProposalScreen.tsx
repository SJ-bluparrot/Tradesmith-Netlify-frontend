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
  Linking,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import { useEstimate } from "@/hooks/useEstimates";
import { useGenerateProposal } from "@/hooks/useProposals";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { formatCurrency, formatDate } from "@/utils/format";
import type { AppStackParamList } from "@/navigation/types";

type Nav = StackNavigationProp<AppStackParamList, "BidProposal">;
type Route = RouteProp<AppStackParamList, "BidProposal">;

type Trade = "carpenter" | "electrician" | "plumber" | "painter" | "other";

const TRADES: { label: string; value: Trade }[] = [
  { label: "Carpenter", value: "carpenter" },
  { label: "Electrician", value: "electrician" },
  { label: "Plumber", value: "plumber" },
  { label: "Painter", value: "painter" },
  { label: "Other", value: "other" },
];

export function BidProposalScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { projectId } = params;

  const [timeline, setTimeline] = useState("3-4 weeks");
  const [trade, setTrade] = useState<Trade>("carpenter");

  const { height: windowHeight } = useWindowDimensions();

  const { data: estimate, isLoading: estimateLoading } = useEstimate(projectId);
  const generateProposal = useGenerateProposal(projectId);

  const proposalResult = generateProposal.data;
  const isGenerating = generateProposal.isPending;

  const handleGenerate = () => {
    generateProposal.mutate({ timeline, trade });
  };

  const handleDownload = async () => {
    if (!proposalResult?.url) return;
    try {
      await Linking.openURL(proposalResult.url);
    } catch {
      // fallback
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        Platform.OS === "web" ? { height: windowHeight } : { flex: 1 },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Generate Proposal</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled={Platform.OS !== "web"}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Estimate Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Source Estimate</Text>
            {estimateLoading ? (
              <Card>
                <Skeleton width="40%" height={24} />
                <Skeleton width="60%" height={14} style={{ marginTop: 8 }} />
              </Card>
            ) : estimate ? (
              <Card style={styles.estimateSummaryCard}>
                <View style={styles.estimateSummaryTop}>
                  <View style={styles.estimateIdTag}>
                    <Ionicons name="pricetag-outline" size={14} color={colors.onSurfaceVariant} />
                    <Text style={styles.estimateIdText}>
                      EST-{estimate.id.slice(-8).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.totalValueBox}>
                    <Text style={styles.totalValueLabel}>Total Value</Text>
                    <Text style={styles.totalValue}>
                      {formatCurrency(Number(estimate.totalCost))}
                    </Text>
                  </View>
                </View>
                <View style={styles.estimateDivider} />
                <View style={styles.estimateMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.outline} />
                    <Text style={styles.metaText}>
                      {formatDate(estimate.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="list-outline" size={14} color={colors.outline} />
                    <Text style={styles.metaText}>
                      {Array.isArray(estimate.lineItems) ? estimate.lineItems.length : 0} line items
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("EstimateBuilder", { projectId })}
                  >
                    <Text style={styles.viewLink}>View estimate →</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ) : (
              <Card>
                <View style={styles.noEstimate}>
                  <Ionicons name="calculator-outline" size={24} color={colors.outline} />
                  <Text style={styles.noEstimateText}>
                    No estimate found. Generate an estimate first.
                  </Text>
                </View>
              </Card>
            )}
          </View>

          {/* Success State */}
          {proposalResult ? (
            <Card style={styles.successCard}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={48} color="#10b981" />
              </View>
              <Text style={styles.successTitle}>Proposal Ready!</Text>
              <Text style={styles.successFilename}>{proposalResult.filename}</Text>
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={handleDownload}
                activeOpacity={0.85}
              >
                <Ionicons name="download-outline" size={18} color={colors.onPrimary} />
                <Text style={styles.downloadBtnText}>Download PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.regenerateBtn}
                onPress={() => generateProposal.reset()}
                activeOpacity={0.85}
              >
                <Text style={styles.regenerateBtnText}>Generate Another</Text>
              </TouchableOpacity>
            </Card>
          ) : (
            /* Generation Hub */
            <Card style={styles.hubCard}>
              <Text style={styles.hubTitle}>Proposal Configuration</Text>

              {/* Timeline */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Timeline</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 3-4 weeks, starting Nov 1"
                  placeholderTextColor={colors.outline}
                  value={timeline}
                  onChangeText={setTimeline}
                />
              </View>

              {/* Trade */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Trade</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tradeChips}
                >
                  {TRADES.map((t) => (
                    <TouchableOpacity
                      key={t.value}
                      style={[
                        styles.tradeChip,
                        trade === t.value && styles.tradeChipActive,
                      ]}
                      onPress={() => setTrade(t.value)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.tradeChipText,
                          trade === t.value && styles.tradeChipTextActive,
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Progress bar while generating */}
              {isGenerating ? (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={styles.progressFill} />
                  </View>
                  <Text style={styles.progressText}>Generating your proposal…</Text>
                </View>
              ) : null}

              {generateProposal.error ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorText}>
                    {(generateProposal.error as { message?: string }).message ??
                      "Failed to generate proposal"}
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.generateBtn,
                  (!estimate || isGenerating) && styles.generateBtnDisabled,
                ]}
                onPress={handleGenerate}
                disabled={!estimate || isGenerating}
                activeOpacity={0.85}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color={colors.onPrimary} />
                ) : (
                  <>
                    <Ionicons name="document-text" size={18} color={colors.onPrimary} />
                    <Text style={styles.generateBtnText}>
                      Generate PDF Proposal
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, overflow: "hidden" },
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing["2xl"],
  },
  section: { gap: spacing.sm },
  sectionLabel: {
    ...typography.labelCaps,
    color: colors.onSurfaceVariant,
    marginLeft: spacing.xs,
  },
  estimateSummaryCard: { gap: spacing.md },
  estimateSummaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  estimateIdTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  estimateIdText: { ...typography.dataMono, color: colors.onSurface },
  totalValueBox: { alignItems: "flex-end" },
  totalValueLabel: { ...typography.labelCaps, color: colors.outline },
  totalValue: { ...typography.headlineMd, color: colors.primary },
  estimateDivider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    opacity: 0.5,
  },
  estimateMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { ...typography.bodySm, color: colors.onSurfaceVariant },
  viewLink: { ...typography.bodySm, color: colors.primary, fontWeight: "600" },
  noEstimate: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.lg },
  noEstimateText: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: "center" },
  // Success
  successCard: { alignItems: "center", gap: spacing.lg, paddingVertical: spacing["2xl"] },
  successIcon: { alignItems: "center" },
  successTitle: { ...typography.headlineLg, color: colors.onSurface },
  successFilename: { ...typography.dataMono, color: colors.onSurfaceVariant, textAlign: "center" },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 52,
    paddingHorizontal: spacing.xl,
  },
  downloadBtnText: { ...typography.labelCaps, color: colors.onPrimary, fontSize: 14 },
  regenerateBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  regenerateBtnText: { ...typography.bodyMd, color: colors.primary },
  // Hub
  hubCard: { gap: spacing.xl },
  hubTitle: { ...typography.headlineSm, color: colors.onSurface },
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
  tradeChips: { flexDirection: "row", gap: spacing.sm },
  tradeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  tradeChipActive: { backgroundColor: colors.primaryFixed, borderColor: colors.primary },
  tradeChipText: { ...typography.labelCaps, color: colors.onSurfaceVariant },
  tradeChipTextActive: { color: colors.primary },
  progressContainer: { gap: spacing.sm },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    width: "70%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: { ...typography.bodySm, color: colors.onSurfaceVariant, textAlign: "center" },
  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { ...typography.bodyMd, color: colors.error, flex: 1 },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 56,
  },
  generateBtnDisabled: { opacity: 0.5 },
  generateBtnText: { ...typography.labelCaps, color: colors.onPrimary, fontSize: 14 },
});
