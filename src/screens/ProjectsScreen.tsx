import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useProjects } from "@/hooks/useProjects";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { formatDate, projectTypeLabel } from "@/utils/format";
import type { AppStackParamList, TabParamList } from "@/navigation/types";
import type { Project } from "@/types";

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Projects">,
  StackNavigationProp<AppStackParamList>
>;

type FilterStatus = "all" | "active" | "archived" | "completed";

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
];

export function ProjectsScreen() {
  const navigation = useNavigation<Nav>();
  const { data: projects, isLoading, isError, refetch, isFetching } = useProjects();
  const [filter, setFilter] = useState<FilterStatus>("all");

  const filtered =
    filter === "all"
      ? (projects ?? [])
      : (projects ?? []).filter((p) => p.status === filter);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Projects</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("NewProject")}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.filterChip,
              filter === f.value && styles.filterChipActive,
            ]}
            onPress={() => setFilter(f.value)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f.value && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
        {projects && projects.length > 0 ? (
          <Text style={styles.countText}>{filtered.length} projects</Text>
        ) : null}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.list}>
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </View>
        ) : isError ? (
          <ErrorState message="Failed to load projects" onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="folder-open-outline"
            title={filter === "all" ? "No projects yet" : `No ${filter} projects`}
            description={
              filter === "all"
                ? "Create your first project to get started."
                : undefined
            }
            actionLabel={filter === "all" ? "New Project" : undefined}
            onAction={
              filter === "all"
                ? () => navigation.navigate("NewProject")
                : undefined
            }
          />
        ) : (
          <View style={styles.list}>
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onPress={() =>
                  navigation.navigate("ProjectDetails", {
                    projectId: project.id,
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProjectCard({
  project,
  onPress,
}: {
  project: Project;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.projectName} numberOfLines={1}>
            {project.name}
          </Text>
          <Badge
            label={project.status}
            variant={project.status === "active" ? "success" : "default"}
          />
        </View>

        <View style={styles.cardMeta}>
          <Badge label={projectTypeLabel(project.type)} variant="primary" />
          {project.clientName ? (
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={12} color={colors.outline} />
              <Text style={styles.metaText}>{project.clientName}</Text>
            </View>
          ) : null}
        </View>

        {project.address ? (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color={colors.outline} />
            <Text style={styles.metaText} numberOfLines={1}>
              {project.address}
            </Text>
          </View>
        ) : null}

        <Text style={styles.dateText}>{formatDate(project.createdAt)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.outline} />
    </TouchableOpacity>
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
  headerTitle: { ...typography.headlineLg, color: colors.onSurface },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  filterChipActive: {
    backgroundColor: colors.primaryFixed,
    borderColor: colors.primary,
  },
  filterChipText: { ...typography.labelCaps, color: colors.onSurfaceVariant },
  filterChipTextActive: { color: colors.primary },
  countText: {
    ...typography.bodySm,
    color: colors.outline,
    marginLeft: "auto",
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["2xl"] },
  list: { gap: spacing.md },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.lg,
    shadowColor: "#1c1917",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardBody: { flex: 1, gap: spacing.sm },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  projectName: { ...typography.headlineSm, color: colors.onSurface, flex: 1 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { ...typography.bodySm, color: colors.onSurfaceVariant },
  dateText: { ...typography.bodySm, color: colors.outline },
});
