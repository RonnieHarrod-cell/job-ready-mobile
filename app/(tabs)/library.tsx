import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPublicScenarios } from "@/lib/firebase";
import { CATEGORY_META, DIFFICULTY_META } from "@/constants/scenarios";
import { colors, spacing, radius, fontSize } from "@/constants/theme";
import type { Scenario } from "@/types";

type CategoryFilter = "all" | Scenario["category"];
type DifficultyFilter = "all" | Scenario["difficulty"];

export default function LibraryScreen() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getPublicScenarios();
    setScenarios(data);
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const filtered = scenarios.filter((s) => {
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
        <Text style={styles.title}>🌐 Library</Text>
        <Text style={styles.subtitle}>Community scenarios</Text>
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
        <View style={styles.content}>
          {/* Search */}
          <View style={styles.searchRow}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search library..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Category filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            style={{ marginBottom: spacing.sm }}
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
                        isActive && { color: meta?.color ?? colors.accent },
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
            style={{ marginBottom: spacing.lg }}
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

          {/* Content */}
          {loading ? (
            <ActivityIndicator
              color={colors.accent}
              style={{ marginTop: 40 }}
            />
          ) : filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🌐</Text>
              <Text style={styles.emptyTitle}>
                {scenarios.length === 0
                  ? "No public scenarios yet"
                  : "No results"}
              </Text>
              <Text style={styles.emptyText}>
                {scenarios.length === 0
                  ? "Be the first! Create a scenario and make it public."
                  : "Try adjusting your filters."}
              </Text>
            </View>
          ) : (
            filtered.map((scenario) => (
              <TouchableOpacity
                key={scenario.id}
                style={styles.card}
                onPress={() => router.push(`/interview/${scenario.id}`)}
                activeOpacity={0.75}
              >
                {/* Badges */}
                <View style={styles.cardBadges}>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: CATEGORY_META[scenario.category].bg,
                        borderColor: CATEGORY_META[scenario.category].border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: CATEGORY_META[scenario.category].color },
                      ]}
                    >
                      {CATEGORY_META[scenario.category].emoji}{" "}
                      {CATEGORY_META[scenario.category].label}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          DIFFICULTY_META[scenario.difficulty].bg,
                        borderColor: "transparent",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: DIFFICULTY_META[scenario.difficulty].color },
                      ]}
                    >
                      {DIFFICULTY_META[scenario.difficulty].label}
                    </Text>
                  </View>
                  <View style={[styles.badge, styles.publicBadge]}>
                    <Text style={styles.publicBadgeText}>🌐 Public</Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>{scenario.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {scenario.description}
                </Text>

                <View style={styles.tagRow}>
                  {scenario.tags.slice(0, 4).map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.startText}>Start Interview →</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
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
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  filterRow: { gap: spacing.sm, paddingRight: spacing.lg },
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
  cardBadges: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: "600" },
  publicBadge: {
    backgroundColor: "rgba(108,99,255,0.1)",
    borderColor: "rgba(108,99,255,0.2)",
  },
  publicBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.accent,
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
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  tag: {
    backgroundColor: colors.bgHover,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tagText: { fontSize: 10, color: colors.textMuted },
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
  emptyIcon: { fontSize: 40 },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
});
