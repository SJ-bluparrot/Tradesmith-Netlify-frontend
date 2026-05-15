import React from "react";
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
import { useUser, useClerk } from "@clerk/clerk-expo";
import { useProjects } from "@/hooks/useProjects";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { colors } from "@/theme/colors";
import { spacing, radius } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { formatDate, projectTypeLabel } from "@/utils/format";
import type { AppStackParamList, TabParamList } from "@/navigation/types";
import type { Project } from "@/types";

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Dashboard">,
  StackNavigationProp<AppStackParamList>
>;

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { data: projects, isLoading, isError, refetch, isFetching } = useProjects();

  const recentProjects = (projects ?? []).slice(0, 5);
  const activeCount = (projects ?? []).filter((p) => p.status === "active").length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="construct" size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>TradeSmith</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.newProjectBtn}
            onPress={() => navigation.navigate("NewProject")}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={18} color={colors.onPrimary} />
            <Text style={styles.newProjectBtnText}>New Project</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => signOut()}
            style={styles.avatarBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0] ?? user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() ?? "T"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
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
        {/* Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </Text>
          <Text style={styles.welcomeSub}>Here's your project overview</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {isLoading ? (
            <>
              <View style={styles.statCard}><Skeleton width="60%" height={24} /><Skeleton width="80%" height={14} style={{ marginTop: 6 }} /></View>
              <View style={styles.statCard}><Skeleton width="60%" height={24} /><Skeleton width="80%" height={14} style={{ marginTop: 6 }} /></View>
              <View style={styles.statCard}><Skeleton width="60%" height={24} /><Skeleton width="80%" height={14} style={{ marginTop: 6 }} /></View>
            </>
          ) : (
            <>
              <StatCard value={String(projects?.length ?? 0)} label="Total Projects" icon="folder" />
              <StatCard value={String(activeCount)} label="Active" icon="pulse" />
              <StatCard value="—" label="Proposals" icon="document-text" />
            </>
          )}
        </View>

        {/* Recent Projects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Projects</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Projects")}>
              <Text style={styles.sectionLink}>View all</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.projectsList}>
              {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
            </View>
          ) : isError ? (
            <ErrorState message="Failed to load projects" onRetry={refetch} />
          ) : recentProjects.length === 0 ? (
            <EmptyState
              icon="folder-open-outline"
              title="No projects yet"
              description="Create your first project to get started with AI estimates and proposals."
              actionLabel="New Project"
              onAction={() => navigation.navigate("NewProject")}
            />
          ) : (
            <View style={styles.projectsList}>
              {recentProjects.map((project) => (
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
      style={styles.projectCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.projectCardLeft}>
        <Text style={styles.projectName}>{project.name}</Text>
        <View style={styles.projectMeta}>
          <Badge label={projectTypeLabel(project.type)} variant="primary" />
          {project.clientName ? (
            <Text style={styles.projectClient}>{project.clientName}</Text>
          ) : null}
        </View>
        <Text style={styles.projectDate}>{formatDate(project.createdAt)}</Text>
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  newProjectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  newProjectBtnText: { ...typography.labelCaps, color: colors.onPrimary, fontSize: 12 },
  avatarBtn: {},
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { ...typography.labelCaps, color: colors.onPrimaryFixed },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing["2xl"],
  },
  welcomeSection: { gap: spacing.xs },
  welcomeText: { ...typography.headlineLg, color: colors.onSurface },
  welcomeSub: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    gap: spacing.xs,
    alignItems: "flex-start",
  },
  statValue: { ...typography.headlineLg, color: colors.onSurface },
  statLabel: { ...typography.labelCaps, color: colors.onSurfaceVariant },
  section: { gap: spacing.md },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { ...typography.headlineMd, color: colors.onSurface },
  sectionLink: { ...typography.bodyMd, color: colors.primary },
  projectsList: { gap: spacing.md },
  projectCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  projectCardLeft: { flex: 1, gap: spacing.xs },
  projectName: { ...typography.headlineSm, color: colors.onSurface },
  projectMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  projectClient: { ...typography.bodySm, color: colors.onSurfaceVariant },
  projectDate: { ...typography.bodySm, color: colors.outline },
});
