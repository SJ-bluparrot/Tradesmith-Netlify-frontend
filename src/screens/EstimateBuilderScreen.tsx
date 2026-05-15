import React, { useState, useEffect, useCallback } from "react";
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
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import { useEstimate, useGenerateEstimate, useUpdateEstimate } from "@/hooks/useEstimates";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import {
  formatCurrency,
  formatConfidence,
  getLineItemTotal,
  getLineItemDescription,
  getLineItemUnitCost,
} from "@/utils/format";
import type { LineItem } from "@/types";
import type { AppStackParamList } from "@/navigation/types";

type Nav = StackNavigationProp<AppStackParamList, "EstimateBuilder">;
type Route = RouteProp<AppStackParamList, "EstimateBuilder">;

type Trade = "carpenter" | "electrician" | "plumber" | "painter" | "other";

const TRADES: { label: string; value: Trade }[] = [
  { label: "Carpenter", value: "carpenter" },
  { label: "Electrician", value: "electrician" },
  { label: "Plumber", value: "plumber" },
  { label: "Painter", value: "painter" },
  { label: "Other", value: "other" },
];

export function EstimateBuilderScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { projectId } = params;

  const [description, setDescription] = useState("");
  const [trade, setTrade] = useState<Trade>("carpenter");
  const [localItems, setLocalItems] = useState<LineItem[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { height: windowHeight } = useWindowDimensions();

  const { data: existingEstimate, isLoading: loadingExisting } =
    useEstimate(projectId);
  const generateEstimate = useGenerateEstimate(projectId);
  const updateEstimate = useUpdateEstimate(projectId);

  const estimate = generateEstimate.data ?? existingEstimate;
  const isGenerating = generateEstimate.isPending;
  const isSaving = updateEstimate.isPending;

  // Sync localItems and description whenever the server estimate changes
  useEffect(() => {
    if (estimate) {
      setLocalItems((estimate.lineItems ?? []) as LineItem[]);
      setIsDirty(false);
      // Pre-fill the description field so Regenerate always has something to work with
      if (!description.trim() && estimate.description) {
        setDescription(estimate.description);
      }
    }
  }, [estimate?.id]);

  const localTotal = localItems.reduce(
    (sum, li) => sum + Number(getLineItemTotal(li)),
    0
  );

  const addItem = useCallback(() => {
    setLocalItems((prev) => [
      ...prev,
      { name: "", quantity: 1, unit: "ea", unit_price: 0, line_total: 0 },
    ]);
    setIsDirty(true);
    setSaveSuccess(false);
  }, []);

  const removeItem = useCallback((index: number) => {
    setLocalItems((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
    setSaveSuccess(false);
  }, []);

  const patchItem = useCallback(
    (index: number, patch: Partial<LineItem>) => {
      setLocalItems((prev) => {
        const next = prev.map((li, i) => {
          if (i !== index) return li;
          const merged = { ...li, ...patch };
          const qty = Number(merged.quantity ?? 0);
          const cost = Number(
            merged.unit_price ?? merged.unitPrice ?? merged.unit_cost ?? 0
          );
          // Auto-recompute line_total when qty or cost changes, unless total was directly patched
          if (!("line_total" in patch) && !("lineTotal" in patch) && !("total" in patch)) {
            merged.line_total = qty * cost;
            merged.lineTotal = undefined;
            merged.total = undefined;
          }
          return merged;
        });
        return next;
      });
      setIsDirty(true);
      setSaveSuccess(false);
    },
    []
  );

  const handleSave = () => {
    updateEstimate.mutate(localItems, {
      onSuccess: () => {
        setIsDirty(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      },
    });
  };

  const handleGenerate = () => {
    if (!description.trim()) return;
    generateEstimate.mutate(
      { description: description.trim(), trade },
      {
        onSuccess: () => {
          setIsDirty(false);
        },
      }
    );
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
        <Text style={styles.headerTitle}>Estimate Builder</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled={Platform.OS !== "web"}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            !isGenerating && estimate ? styles.scrollContentWithFooter : null,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Input Card */}
          <Card style={styles.inputCard}>
            <Text style={styles.cardTitle}>Describe the project scope</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="e.g. Build a 400 sq ft deck with composite decking, 3 steps, aluminum railing on three sides, footings down to frost line..."
              placeholderTextColor={colors.outline}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            {/* Trade selector */}
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

            <TouchableOpacity
              style={[
                styles.generateBtn,
                (!description.trim() || isGenerating) && styles.generateBtnDisabled,
              ]}
              onPress={handleGenerate}
              disabled={!description.trim() || isGenerating}
              activeOpacity={0.85}
            >
              {isGenerating ? (
                <>
                  <ActivityIndicator size="small" color={colors.onPrimary} />
                  <Text style={styles.generateBtnText}>Generating…</Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color={colors.onPrimary} />
                  <Text style={styles.generateBtnText}>Generate Estimate</Text>
                </>
              )}
            </TouchableOpacity>

            {generateEstimate.error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={styles.errorText}>
                  {(generateEstimate.error as { message?: string }).message ??
                    "Failed to generate estimate"}
                </Text>
              </View>
            ) : null}
          </Card>

          {/* Loading skeleton */}
          {isGenerating && (
            <Card style={styles.resultsCard}>
              <Skeleton width="40%" height={36} />
              <Skeleton width="30%" height={20} style={{ marginTop: 8 }} />
              <View style={styles.divider} />
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.skeletonRow}>
                  <Skeleton width="50%" height={14} />
                  <Skeleton width="20%" height={14} />
                  <Skeleton width="20%" height={14} />
                </View>
              ))}
            </Card>
          )}

          {/* Results */}
          {!isGenerating && estimate ? (
            <Card style={styles.resultsCard}>
              <View style={styles.totalRow}>
                <View>
                  <Text style={styles.totalLabel}>Total Estimate</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(isDirty ? localTotal : Number(estimate.totalCost))}
                  </Text>
                </View>
                {estimate.confidence ? (
                  <Badge
                    label={formatConfidence(Number(estimate.confidence)).label}
                    variant={formatConfidence(Number(estimate.confidence)).variant}
                  />
                ) : null}
              </View>

              {loadingExisting ? null : (
                <>
                  <View style={styles.divider} />

                  {/* Table header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.colDescription, styles.tableHeaderText]}>
                      Description
                    </Text>
                    <Text style={[styles.colQty, styles.tableHeaderText]}>Qty</Text>
                    <Text style={[styles.colUnit, styles.tableHeaderText]}>Unit</Text>
                    <Text style={[styles.colCost, styles.tableHeaderText]}>Cost</Text>
                    <Text style={[styles.colTotal, styles.tableHeaderText]}>Total</Text>
                    <View style={styles.colDelete} />
                  </View>

                  {/* Editable line items */}
                  {localItems.map((item, i) => (
                    <View
                      key={i}
                      style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}
                    >
                      <TextInput
                        style={[styles.colDescription, styles.editCell, styles.editCellDescription]}
                        value={getLineItemDescription(item)}
                        onChangeText={(v) =>
                          patchItem(i, { name: v, description: v })
                        }
                        multiline
                        returnKeyType="done"
                        blurOnSubmit
                        placeholder="Item description"
                        placeholderTextColor={colors.outline}
                      />
                      <TextInput
                        style={[styles.colQty, styles.editCell, styles.editCellRight]}
                        value={String(item.quantity)}
                        onChangeText={(v) =>
                          patchItem(i, { quantity: parseFloat(v) || 0 })
                        }
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        selectTextOnFocus
                      />
                      <TextInput
                        style={[styles.colUnit, styles.editCell, styles.editCellCenter]}
                        value={item.unit}
                        onChangeText={(v) => patchItem(i, { unit: v })}
                        returnKeyType="done"
                        selectTextOnFocus
                      />
                      <TextInput
                        style={[styles.colCost, styles.editCell, styles.editCellRight]}
                        value={String(getLineItemUnitCost(item))}
                        onChangeText={(v) =>
                          patchItem(i, { unit_price: parseFloat(v) || 0 })
                        }
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        selectTextOnFocus
                      />
                      <TextInput
                        style={[styles.colTotal, styles.editCell, styles.editCellRight]}
                        value={String(getLineItemTotal(item))}
                        onChangeText={(v) =>
                          patchItem(i, { line_total: parseFloat(v) || 0 })
                        }
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        selectTextOnFocus
                      />
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => removeItem(i)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={15} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Add item row */}
                  <TouchableOpacity
                    style={styles.addItemBtn}
                    onPress={addItem}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                    <Text style={styles.addItemText}>Add Item</Text>
                  </TouchableOpacity>

                  <View style={styles.divider} />

                  {/* Save edits row */}
                  <View style={styles.saveRow}>
                    {updateEstimate.error ? (
                      <Text style={styles.saveError}>
                        {(updateEstimate.error as { message?: string }).message ?? "Save failed"}
                      </Text>
                    ) : saveSuccess ? (
                      <View style={styles.saveSuccessRow}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                        <Text style={styles.saveSuccessText}>Saved</Text>
                      </View>
                    ) : null}
                    <TouchableOpacity
                      style={[
                        styles.saveBtn,
                        (!isDirty || isSaving) && styles.saveBtnDisabled,
                      ]}
                      onPress={handleSave}
                      disabled={!isDirty || isSaving}
                      activeOpacity={0.85}
                    >
                      {isSaving ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Ionicons name="save-outline" size={16} color={isDirty ? colors.primary : colors.outline} />
                      )}
                      <Text style={[styles.saveBtnText, !isDirty && styles.saveBtnTextDisabled]}>
                        {isSaving ? "Saving…" : "Save Edits"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Actions */}
                  <View style={styles.resultActions}>
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
                    <TouchableOpacity
                      style={[
                        styles.regenerateBtn,
                        isGenerating && styles.generateBtnDisabled,
                      ]}
                      onPress={handleGenerate}
                      disabled={isGenerating}
                      activeOpacity={0.85}
                    >
                      {isGenerating ? (
                        <ActivityIndicator size="small" color={colors.onSurfaceVariant} />
                      ) : (
                        <Ionicons name="refresh" size={16} color={colors.onSurfaceVariant} />
                      )}
                      <Text style={styles.regenerateBtnText}>
                        {isGenerating ? "Generating…" : "Regenerate"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Card>
          ) : !isGenerating && !loadingExisting && !estimate ? (
            <View style={styles.hintBox}>
              <Ionicons name="information-circle-outline" size={18} color={colors.outline} />
              <Text style={styles.hintText}>
                Describe your project above to generate an AI-powered cost estimate.
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Sticky proposal CTA pinned to bottom — shown whenever an estimate is ready */}
        {!isGenerating && estimate ? (
          <View style={styles.proposalFooter}>
            <TouchableOpacity
              style={styles.proposalFooterBtn}
              onPress={() =>
                navigation.navigate("BidProposal", {
                  projectId,
                  estimateId: estimate.id,
                })
              }
              activeOpacity={0.85}
            >
              <Ionicons name="document-text-outline" size={20} color={colors.onPrimary} />
              <Text style={styles.proposalFooterBtnText}>Create Bid Proposal</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
        ) : null}
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
  scrollContentWithFooter: {
    paddingBottom: 88,
  },
  inputCard: { gap: spacing.lg },
  cardTitle: { ...typography.headlineSm, color: colors.onSurface },
  descriptionInput: {
    minHeight: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.background,
    ...typography.bodyMd,
    color: colors.onSurface,
    textAlignVertical: "top",
  },
  fieldLabel: {
    ...typography.labelCaps,
    color: colors.onSurfaceVariant,
    marginLeft: spacing.xs,
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
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 52,
  },
  generateBtnDisabled: { opacity: 0.5 },
  generateBtnText: { ...typography.labelCaps, color: colors.onPrimary, fontSize: 14 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { ...typography.bodyMd, color: colors.error, flex: 1 },
  resultsCard: { gap: spacing.md },
  totalRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  totalLabel: { ...typography.labelCaps, color: colors.onSurfaceVariant, marginBottom: 4 },
  totalValue: { ...typography.headlineLg, fontSize: 30, color: colors.primary },
  divider: { height: 1, backgroundColor: colors.outlineVariant, marginVertical: spacing.sm },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  tableHeaderText: { ...typography.labelCaps, color: colors.onSurfaceVariant },
  tableRow: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  tableRowAlt: { backgroundColor: colors.surfaceContainerLow },
  tableCell: { ...typography.bodySm, color: colors.onSurface },
  colDescription: { flex: 3, paddingRight: spacing.sm },
  colQty: { flex: 1, textAlign: "right" },
  colUnit: { flex: 1, textAlign: "center" },
  colCost: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  colDelete: { width: 28 },
  deleteBtn: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  addItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginTop: spacing.xs,
  },
  addItemText: {
    ...typography.labelCaps,
    color: colors.primary,
    fontSize: 12,
  },
  skeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  editCell: {
    ...typography.bodySm,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: Platform.OS === "ios" ? spacing.xs : 2,
    backgroundColor: colors.surfaceContainerLowest,
    minHeight: 32,
  },
  editCellDescription: {
    flex: 3,
    marginRight: spacing.xs,
    textAlignVertical: "top",
  },
  editCellRight: {
    textAlign: "right",
  },
  editCellCenter: {
    textAlign: "center",
  },
  saveRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  saveBtnDisabled: {
    borderColor: colors.outlineVariant,
  },
  saveBtnText: {
    ...typography.labelCaps,
    color: colors.primary,
    fontSize: 12,
  },
  saveBtnTextDisabled: {
    color: colors.outline,
  },
  saveError: {
    ...typography.bodySm,
    color: colors.error,
    flex: 1,
  },
  saveSuccessRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  saveSuccessText: {
    ...typography.bodySm,
    color: colors.primary,
  },
  resultActions: { flexDirection: "row", gap: spacing.md, flexWrap: "wrap" },
  proposalBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 48,
    minWidth: 120,
  },
  proposalBtnText: { ...typography.labelCaps, color: colors.onPrimary, fontSize: 12 },
  regenerateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    height: 48,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  regenerateBtnText: { ...typography.labelCaps, color: colors.onSurfaceVariant, fontSize: 12 },
  hintBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  hintText: { ...typography.bodyMd, color: colors.onSurfaceVariant, flex: 1 },
  proposalFooter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  proposalFooterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 52,
  },
  proposalFooterBtnText: {
    ...typography.labelCaps,
    color: colors.onPrimary,
    fontSize: 14,
    flex: 1,
    textAlign: "center",
  },
});
