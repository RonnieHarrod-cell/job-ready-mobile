import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { createScenario } from "@/lib/firebase";
import { CATEGORY_META, DIFFICULTY_META } from "@/constants/scenarios";
import { colors, spacing, radius, fontSize } from "@/constants/theme";
import type { Scenario } from "@/types";

const STEPS = ["Basics", "Prompt", "Review"];

const LANG_OPTIONS = ["javascript", "typescript", "python", "html", "css"];

const PROMPT_TIPS = [
  'Start with "You are a [role] interviewing a [level] candidate."',
  "Specify topics to cover.",
  'Set response length: "Keep responses under 120 words."',
  'Add wrap-up: "After 8 exchanges, provide feedback."',
];

const EMPTY: Omit<Scenario, "id"> = {
  title: "",
  description: "",
  category: "custom",
  difficulty: "junior",
  hasCode: false,
  language: "javascript",
  starterCode: "",
  systemPrompt: "",
  tags: [],
  isPublic: false,
};

export default function CreateScenarioScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Omit<Scenario, "id">>(EMPTY);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag) && form.tags.length < 8) {
      update("tags", [...form.tags, tag]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    update(
      "tags",
      form.tags.filter((t) => t !== tag),
    );
  }

  function validate(): string | null {
    if (!form.title.trim()) return "Please enter a title.";
    if (!form.description.trim()) return "Please enter a description.";
    if (!form.systemPrompt.trim()) return "Please enter a system prompt.";
    if (form.systemPrompt.trim().length < 50)
      return "System prompt must be at least 50 characters.";
    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) {
      Alert.alert("Missing info", err);
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      const id = await createScenario(form, user.uid);
      Alert.alert("Created!", "Your scenario is ready.", [
        {
          text: "Start interview",
          onPress: () => router.replace(`/interview/${id}`),
        },
        {
          text: "Go to dashboard",
          onPress: () => router.replace("/(tabs)/dashboard"),
        },
      ]);
    } catch {
      Alert.alert("Error", "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Scenario</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        {STEPS.map((s, i) => (
          <TouchableOpacity
            key={s}
            onPress={() => i < step + 1 && setStep(i)}
            style={styles.stepItem}
          >
            <View
              style={[
                styles.stepDot,
                step === i && styles.stepDotActive,
                i < step && styles.stepDotDone,
              ]}
            >
              <Text
                style={[
                  styles.stepDotText,
                  (step === i || i < step) && styles.stepDotTextActive,
                ]}
              >
                {i < step ? "✓" : i + 1}
              </Text>
            </View>
            <Text
              style={[styles.stepLabel, step === i && styles.stepLabelActive]}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Step 0: Basics ──────────────────────────────────────────── */}
          {step === 0 && (
            <View style={styles.stepContent}>
              <Text style={styles.sectionTitle}>Basic details</Text>

              {/* Title */}
              <View style={styles.field}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Senior iOS Engineer"
                  placeholderTextColor={colors.textMuted}
                  value={form.title}
                  onChangeText={(v) => update("title", v)}
                  maxLength={60}
                />
              </View>

              {/* Description */}
              <View style={styles.field}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Brief overview of what this interview covers..."
                  placeholderTextColor={colors.textMuted}
                  value={form.description}
                  onChangeText={(v) => update("description", v)}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
              </View>

              {/* Category */}
              <View style={styles.field}>
                <Text style={styles.label}>Category</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipRow}
                >
                  {(Object.keys(CATEGORY_META) as Scenario["category"][]).map(
                    (cat) => {
                      const meta = CATEGORY_META[cat];
                      const isActive = form.category === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          onPress={() => update("category", cat)}
                          style={[
                            styles.chip,
                            isActive && {
                              backgroundColor: meta.bg,
                              borderColor: meta.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              isActive && { color: meta.color },
                            ]}
                          >
                            {meta.emoji} {meta.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    },
                  )}
                </ScrollView>
              </View>

              {/* Difficulty */}
              <View style={styles.field}>
                <Text style={styles.label}>Difficulty</Text>
                <View style={styles.chipRow}>
                  {(
                    Object.keys(DIFFICULTY_META) as Scenario["difficulty"][]
                  ).map((diff) => {
                    const meta = DIFFICULTY_META[diff];
                    const isActive = form.difficulty === diff;
                    return (
                      <TouchableOpacity
                        key={diff}
                        onPress={() => update("difficulty", diff)}
                        style={[
                          styles.chip,
                          isActive && {
                            backgroundColor: meta.bg,
                            borderColor: meta.color,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isActive && { color: meta.color },
                          ]}
                        >
                          {meta.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Tags */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  Tags <Text style={styles.labelHint}>(optional, max 8)</Text>
                </Text>
                <View style={styles.tagInputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="e.g. Swift"
                    placeholderTextColor={colors.textMuted}
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={addTag}
                    returnKeyType="done"
                    maxLength={30}
                  />
                  <TouchableOpacity
                    onPress={addTag}
                    style={styles.addTagBtn}
                    disabled={!tagInput.trim()}
                  >
                    <Text style={styles.addTagBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
                {form.tags.length > 0 && (
                  <View style={styles.tagList}>
                    {form.tags.map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        onPress={() => removeTag(tag)}
                        style={styles.tagChip}
                      >
                        <Text style={styles.tagChipText}>{tag} ✕</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Public toggle */}
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Make public</Text>
                  <Text style={styles.toggleSub}>
                    Share with all JobReady users
                  </Text>
                </View>
                <Switch
                  value={form.isPublic}
                  onValueChange={(v) => update("isPublic", v)}
                  trackColor={{
                    false: colors.bgHover,
                    true: colors.accent,
                  }}
                  thumbColor="#fff"
                />
              </View>

              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => {
                  if (!form.title.trim() || !form.description.trim()) {
                    Alert.alert(
                      "Missing info",
                      "Please fill in title and description.",
                    );
                    return;
                  }
                  setStep(1);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.nextBtnText}>Next: Write prompt →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Step 1: Prompt ──────────────────────────────────────────── */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.sectionTitle}>System prompt</Text>
              <Text style={styles.sectionSubtitle}>
                This tells the AI how to behave as your interviewer.
              </Text>

              <TextInput
                style={[styles.input, styles.promptInput]}
                placeholder="You are a senior iOS engineer interviewing a candidate for a mobile role..."
                placeholderTextColor={colors.textMuted}
                value={form.systemPrompt}
                onChangeText={(v) => update("systemPrompt", v)}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.charCount}>
                {form.systemPrompt.length} characters
              </Text>

              {/* Tips */}
              <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>💡 Tips</Text>
                {PROMPT_TIPS.map((tip) => (
                  <View key={tip} style={styles.tipRow}>
                    <Text style={styles.tipDot}>·</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>

              {/* Code editor toggle */}
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Include code context</Text>
                  <Text style={styles.toggleSub}>
                    AI will be aware of coding questions
                  </Text>
                </View>
                <Switch
                  value={form.hasCode}
                  onValueChange={(v) => update("hasCode", v)}
                  trackColor={{ false: colors.bgHover, true: colors.accent }}
                  thumbColor="#fff"
                />
              </View>

              {form.hasCode && (
                <View style={styles.field}>
                  <Text style={styles.label}>Language</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipRow}
                  >
                    {LANG_OPTIONS.map((lang) => (
                      <TouchableOpacity
                        key={lang}
                        onPress={() => update("language", lang)}
                        style={[
                          styles.chip,
                          form.language === lang && styles.chipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            form.language === lang && styles.chipTextActive,
                          ]}
                        >
                          {lang}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.backStepBtn}
                  onPress={() => setStep(0)}
                >
                  <Text style={styles.backStepBtnText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.nextBtn, { flex: 1 }]}
                  onPress={() => {
                    if (form.systemPrompt.trim().length < 50) {
                      Alert.alert(
                        "Too short",
                        "System prompt must be at least 50 characters.",
                      );
                      return;
                    }
                    setStep(2);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextBtnText}>Review →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── Step 2: Review ──────────────────────────────────────────── */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.sectionTitle}>Review & create</Text>

              <View style={styles.reviewCard}>
                {[
                  { label: "Title", value: form.title },
                  {
                    label: "Category",
                    value: `${CATEGORY_META[form.category].emoji} ${CATEGORY_META[form.category].label}`,
                  },
                  {
                    label: "Difficulty",
                    value: DIFFICULTY_META[form.difficulty].label,
                  },
                  {
                    label: "Code context",
                    value: form.hasCode ? `Yes (${form.language})` : "No",
                  },
                  {
                    label: "Tags",
                    value: form.tags.length ? form.tags.join(", ") : "—",
                  },
                  {
                    label: "Visibility",
                    value: form.isPublic ? "🌐 Public" : "🔒 Private",
                  },
                ].map(({ label, value }) => (
                  <View key={label} style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>{label}</Text>
                    <Text style={styles.reviewValue}>{value}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.reviewPrompt}>
                <Text style={styles.reviewPromptLabel}>System prompt</Text>
                <Text style={styles.reviewPromptText} numberOfLines={4}>
                  {form.systemPrompt}
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.backStepBtn}
                  onPress={() => setStep(1)}
                >
                  <Text style={styles.backStepBtnText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.nextBtn,
                    { flex: 1 },
                    saving && { opacity: 0.6 },
                  ]}
                  onPress={handleSave}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.nextBtnText}>✨ Create & start</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.bgTertiary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  backText: { fontSize: fontSize.lg, color: colors.textSecondary },
  title: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  stepItem: { alignItems: "center", gap: 4 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgHover,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: "rgba(108,99,255,0.2)",
    borderColor: colors.accent,
  },
  stepDotDone: {
    backgroundColor: "rgba(16,185,129,0.2)",
    borderColor: colors.success,
  },
  stepDotText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: colors.textMuted,
  },
  stepDotTextActive: { color: colors.accent },
  stepLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: "500",
  },
  stepLabelActive: { color: colors.accent },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  stepContent: { gap: spacing.lg },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  field: { gap: spacing.sm },
  label: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  labelHint: {
    color: colors.textMuted,
    textTransform: "none",
    fontWeight: "400",
  },
  input: {
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  promptInput: {
    minHeight: 160,
    textAlignVertical: "top",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: fontSize.xs,
  },
  charCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: "right",
    marginTop: -spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.bgHover,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  chipActive: {
    backgroundColor: "rgba(108,99,255,0.15)",
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: "600",
  },
  chipTextActive: { color: colors.accent },
  tagInputRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  addTagBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  addTagBtnText: {
    color: "#fff",
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  tagChip: {
    backgroundColor: colors.bgHover,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tagChipText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bgTertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
  },
  toggleLabel: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  toggleSub: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  tipsCard: {
    backgroundColor: "rgba(108,99,255,0.08)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(108,99,255,0.2)",
    padding: spacing.md,
    gap: spacing.sm,
  },
  tipsTitle: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.accent,
  },
  tipRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  tipDot: {
    fontSize: fontSize.sm,
    color: colors.accent,
    marginTop: 1,
  },
  tipText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  reviewCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: "hidden",
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  reviewLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  reviewValue: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textPrimary,
    maxWidth: "60%",
    textAlign: "right",
  },
  reviewPrompt: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: spacing.sm,
  },
  reviewPromptLabel: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  reviewPromptText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  nextBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnText: {
    color: "#fff",
    fontSize: fontSize.sm,
    fontWeight: "700",
  },
  backStepBtn: {
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  backStepBtnText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: "600",
  },
});
