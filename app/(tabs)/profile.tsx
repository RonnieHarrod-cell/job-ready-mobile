import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { getUserSessions } from "@/lib/firebase";
import {
  getRankMeta,
  getNextRank,
  getXPProgress,
  getXPToNextRank,
  RANKS,
} from "@/constants/ranks";
import type { InterviewSession } from "@/types";
import { colors, spacing, radius, fontSize } from "@/constants/theme";

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserSessions(user.uid)
      .then(setSessions)
      .finally(() => setSessionsLoading(false));
  }, [user]);

  async function handleSignOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/");
        },
      },
    ]);
  }

  const xp = profile?.xp ?? 0;
  const rank = profile?.rank ?? "E";
  const rankMeta = getRankMeta(rank);
  const nextRank = getNextRank(rank);
  const progress = getXPProgress(xp, rank);
  const xpToNext = getXPToNextRank(xp, rank);
  const isMaxRank = rank === "SSS";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>⚡ Profile</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* Hero card */}
        <View style={[styles.heroCard, { borderColor: rankMeta.border }]}>
          {/* Glow */}
          <View style={[styles.heroGlow, { backgroundColor: rankMeta.glow }]} />

          {/* Avatar */}
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { borderColor: rankMeta.border }]}>
              <Text style={styles.avatarText}>
                {profile?.displayName?.[0]?.toUpperCase() ?? "?"}
              </Text>
              {/* Rank badge */}
              <View
                style={[
                  styles.rankBadge,
                  {
                    backgroundColor: rankMeta.bg,
                    borderColor: rankMeta.border,
                  },
                ]}
              >
                <Text style={[styles.rankBadgeText, { color: rankMeta.color }]}>
                  {rank}
                </Text>
              </View>
            </View>

            <View style={styles.avatarInfo}>
              <Text style={styles.displayName}>
                {profile?.displayName ?? "—"}
              </Text>
              <Text style={styles.email}>{user?.email}</Text>
              <View
                style={[
                  styles.rankPill,
                  {
                    backgroundColor: rankMeta.bg,
                    borderColor: rankMeta.border,
                  },
                ]}
              >
                <Text style={[styles.rankPillText, { color: rankMeta.color }]}>
                  {rankMeta.rank} — {rankMeta.description}
                </Text>
              </View>
            </View>
          </View>

          {/* XP bar */}
          <View style={styles.xpSection}>
            <View style={styles.xpLabels}>
              <Text style={styles.xpValue}>{xp.toLocaleString()} XP</Text>
              {isMaxRank ? (
                <Text style={[styles.xpNext, { color: colors.rankSSS }]}>
                  MAX RANK
                </Text>
              ) : (
                <Text style={styles.xpNext}>
                  {xpToNext} XP to {nextRank?.rank}
                </Text>
              )}
            </View>
            <View style={styles.xpBarBg}>
              <View
                style={[
                  styles.xpBarFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: rankMeta.color,
                  },
                ]}
              />
            </View>
            <View style={styles.xpRankLabels}>
              <Text style={[styles.xpRankLabel, { color: rankMeta.color }]}>
                {rankMeta.rank}
              </Text>
              {!isMaxRank && (
                <Text style={styles.xpRankLabel}>{nextRank?.rank}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Sessions", value: profile?.sessionsCompleted ?? 0 },
            { label: "Total XP", value: xp.toLocaleString() },
            { label: "Rank", value: rank },
          ].map(({ label, value }) => (
            <View key={label} style={styles.statCard}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Rank ladder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Rank Ladder</Text>
          <View style={styles.ladder}>
            {[...RANKS].reverse().map((r) => {
              const isCurrentRank = r.rank === rank;
              const isAchieved = xp >= r.minXP;
              return (
                <View
                  key={r.rank}
                  style={[
                    styles.ladderRow,
                    isCurrentRank && {
                      borderColor: r.border,
                      backgroundColor: r.bg,
                    },
                    !isAchieved && styles.ladderRowLocked,
                  ]}
                >
                  <View
                    style={[
                      styles.ladderBadge,
                      {
                        backgroundColor: isAchieved ? r.bg : colors.bgHover,
                        borderColor: isAchieved
                          ? r.border
                          : colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.ladderBadgeText,
                        { color: isAchieved ? r.color : colors.textMuted },
                      ]}
                    >
                      {isAchieved ? r.rank : "🔒"}
                    </Text>
                  </View>

                  <View style={styles.ladderInfo}>
                    <View style={styles.ladderTitleRow}>
                      <Text
                        style={[
                          styles.ladderRank,
                          {
                            color: isAchieved
                              ? colors.textPrimary
                              : colors.textMuted,
                          },
                        ]}
                      >
                        Rank {r.rank}
                      </Text>
                      <Text
                        style={[
                          styles.ladderDesc,
                          {
                            color: isAchieved
                              ? colors.textSecondary
                              : colors.textMuted,
                          },
                        ]}
                      >
                        — {r.description}
                      </Text>
                      {isCurrentRank && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.ladderXP}>
                      {r.maxXP === Infinity
                        ? `${r.minXP.toLocaleString()}+ XP`
                        : `${r.minXP.toLocaleString()} – ${r.maxXP.toLocaleString()} XP`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent sessions */}
        <View style={[styles.section, { marginBottom: spacing.xxl }]}>
          <Text style={styles.sectionTitle}>📋 Recent Sessions</Text>
          {sessionsLoading ? (
            <ActivityIndicator
              color={colors.accent}
              style={{ marginTop: 20 }}
            />
          ) : sessions.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No sessions yet. Start an interview to earn XP!
              </Text>
            </View>
          ) : (
            sessions.slice(0, 5).map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionTitle}>
                    {session.scenarioId.replace(/-/g, " ")}
                  </Text>
                  <Text style={styles.sessionDate}>
                    {new Date(session.startedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </Text>
                </View>
                {session.feedback && (
                  <Text style={styles.sessionFeedback} numberOfLines={2}>
                    {session.feedback}
                  </Text>
                )}
              </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  signOutBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  signOutText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  heroCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    opacity: 0.15,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.bgTertiary,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  rankBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeText: {
    fontSize: 9,
    fontWeight: "900",
  },
  avatarInfo: { flex: 1, gap: 4 },
  displayName: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  email: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  rankPill: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    marginTop: 4,
  },
  rankPillText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
  },
  xpSection: { gap: spacing.xs },
  xpLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  xpValue: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  xpNext: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  xpBarBg: {
    height: 8,
    backgroundColor: colors.bgTertiary,
    borderRadius: radius.full,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  xpBarFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  xpRankLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  xpRankLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 4,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  ladder: { gap: spacing.sm },
  ladderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgTertiary,
  },
  ladderRowLocked: { opacity: 0.45 },
  ladderBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  ladderBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: "900",
  },
  ladderInfo: { flex: 1, gap: 2 },
  ladderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  ladderRank: {
    fontSize: fontSize.sm,
    fontWeight: "700",
  },
  ladderDesc: {
    fontSize: fontSize.xs,
  },
  currentBadge: {
    backgroundColor: "rgba(108,99,255,0.2)",
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  currentBadgeText: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: "600",
  },
  ladderXP: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  sessionCard: {
    backgroundColor: colors.bgTertiary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.xs,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionTitle: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 1,
    textTransform: "capitalize",
  },
  sessionDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  sessionFeedback: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  empty: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
  },
});
