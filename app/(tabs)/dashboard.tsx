import {
  CATEGORY_META,
  DIFFICULTY_META,
  PRESET_SCENARIOS,
} from "@/constants/scenarios";
import { colors, fontSize, radius, spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { getUserScenarios } from "@/lib/firebase";
import type { Scenario } from "@/types";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabKey = "preset" | "custom";
type CategoryFilter = "all" | Scenario["category"];
type DifficultyFilter = "all" | Scenario["difficulty"];

export default function DashboardScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("preset");
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>([]);
  const [customLoading, setCustomLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");

  useEffect(() => {
    if (user) loadCustom();
  }, [user]);

  async function loadCustom() {
    if (!user) return;
    setCustomLoading(true);
    const data = await getUserScenarios(user.uid);
    setCustomScenarios(data);
    setCustomLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadCustom();
    setRefreshing(false);
  }

  const source = activeTab === "preset" ? PRESET_SCENARIOS : customScenarios;

  const filtered = source.filter((s) => {
    const matchCat = categoryFilter === "all" || s.category === categoryFilter;
    const matchDiff =
      difficultyFilter === "all" || s.difficulty === difficultyFilter;
    const matchSearch =
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchDiff && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {profile?.displayName
              ? `Hey, ${profile.displayName.split(" ")[0]} 👋`
              : "Dashboard"}
          </Text>
          <Text style={styles.subtext}>
            {profile?.sessionsCompleted
              ? `${profile.sessionsCompleted} sessions completed`
              : "Pick a scenario to start"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push("/scenarios/create")}
          activeOpacity={0.8}
        >
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Tabs */}
        <View style={styles.tabRow}>
          {(["preset", "custom"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab === "preset" ? "Preset" : "My Scenarios"}
              </Text>
              <View
                style={[
                  styles.tabCount,
                  activeTab === tab && styles.tabCountActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabCountText,
                    activeTab === tab && styles.tabCountTextActive,
                  ]}
                >
                  {tab === "preset"
                    ? PRESET_SCENARIOS.length
                    : customScenarios.length}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {/* Search */}
          <View style={styles.searchRow}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search scenarios..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Category filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterRow}
          >
            {(["all", "frontend", "backend", "designer"] as const).map(
              (cat) => {
                const meta = cat !== "all" ? CATEGORY_META[cat] : null;
                const isActive = categoryFilter === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategoryFilter(cat)}
                    style={[
                      styles.filterChip,
                      isActive && {
                        backgroundColor: meta?.bg ?? "rgba(108,99,255,0.15)",
                        borderColor: meta?.border ?? "rgba(108,99,255,0.3)",
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isActive && {
                          color: meta?.color ?? colors.accent,
                        },
                      ]}
                    >
                      {cat === "all" ? "All" : `${meta?.emoji} ${meta?.label}`}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </ScrollView>

          {/* Difficulty filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            style={{ marginBottom: spacing.md }}
          >
            {(["all", "junior", "mid", "senior"] as const).map((diff) => {
              const meta = diff !== "all" ? DIFFICULTY_META[diff] : null;
              const isActive = difficultyFilter === diff;
              return (
                <TouchableOpacity
                  key={diff}
                  onPress={() => setDifficultyFilter(diff)}
                  style={[
                    styles.filterChip,
                    isActive && {
                      backgroundColor: meta?.bg ?? "rgba(108,99,255,0.15)",
                      borderColor: colors.accent,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && { color: meta?.color ?? colors.accent },
                    ]}
                  >
                    {diff === "all" ? "Any level" : meta?.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Scenario list */}
          {activeTab === "custom" && customLoading ? (
            <ActivityIndicator
              color={colors.accent}
              style={{ marginTop: 40 }}
            />
          ) : filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>
                {activeTab === "custom" ? "✨" : "🔍"}
              </Text>
              <Text style={styles.emptyTitle}>
                {activeTab === "custom"
                  ? "No custom scenarios yet"
                  : "No results"}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === "custom"
                  ? "Tap + New to create your first scenario"
                  : "Try adjusting your filters"}
              </Text>
            </View>
          ) : (
            filtered.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onPress={() => router.push(`/interview/${scenario.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ScenarioCard({
  scenario,
  onPress,
}: {
  scenario: Scenario;
  onPress: () => void;
}) {
  const catMeta = CATEGORY_META[scenario.category];
  const diffMeta = DIFFICULTY_META[scenario.difficulty];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Badges */}
      <View style={styles.cardBadges}>
        <View
          style={[
            styles.badge,
            { backgroundColor: catMeta.bg, borderColor: catMeta.border },
          ]}
        >
          <Text style={[styles.badgeText, { color: catMeta.color }]}>
            {catMeta.emoji} {catMeta.label}
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: diffMeta.bg, borderColor: "transparent" },
          ]}
        >
          <Text style={[styles.badgeText, { color: diffMeta.color }]}>
            {diffMeta.label}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.cardTitle}>{scenario.title}</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>
        {scenario.description}
      </Text>

      {/* Tags */}
      <View style={styles.tagRow}>
        {scenario.tags.slice(0, 4).map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.startText}>Start Interview →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  newBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  newBtnText: {
    color: "#fff",
    fontSize: fontSize.sm,
    fontWeight: "700",
  },
  tabRow: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tabActive: {
    backgroundColor: "rgba(108,99,255,0.15)",
    borderColor: "rgba(108,99,255,0.3)",
  },
  tabText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  tabTextActive: {
    color: colors.accent,
    fontWeight: "600",
  },
  tabCount: {
    backgroundColor: colors.bgHover,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabCountActive: {
    backgroundColor: "rgba(108,99,255,0.2)",
  },
  tabCountText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
  },
  tabCountTextActive: {
    color: colors.accent,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgTertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  filterScroll: {
    marginBottom: spacing.sm,
  },
  filterRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.bgHover,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: "600",
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.sm,
  },
  cardBadges: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.bgHover,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tagText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  startText: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: "600",
    textAlign: "right",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: spacing.sm,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
  },
});
