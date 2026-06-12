import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { saveSession, getUserProfile } from "@/lib/firebase";
import { PRESET_SCENARIOS } from "@/constants/scenarios";
import { colors, spacing, radius, fontSize } from "@/constants/theme";
import type { Scenario } from "@/types";

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ?? "https://job-ready-ai.netlify.app";

interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export default function InterviewScreen() {
  const { scenarioId } = useLocalSearchParams<{ scenarioId: string }>();
  const { user, profile } = useAuth();
  const router = useRouter();

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load scenario
  useEffect(() => {
    const preset = PRESET_SCENARIOS.find((s) => s.id === scenarioId);
    if (preset) {
      setScenario(preset);
    } else {
      Alert.alert("Error", "Scenario not found.");
      router.back();
    }
  }, [scenarioId]);

  // Start interview once scenario is loaded
  useEffect(() => {
    if (scenario) sendMessage(null);
  }, [scenario]);

  // Get CV text from profile
  const cvText = profile?.cvText ?? "";

  async function sendMessage(userText: string | null) {
    if (!scenario || streaming || sessionEnded) return;
    if (userText !== null && !userText.trim()) return;

    const newMessages: UIMessage[] = [...messages];

    if (userText) {
      newMessages.push({
        id: Math.random().toString(),
        role: "user",
        content: userText,
        timestamp: Date.now(),
      });
      setMessages(newMessages);
      setInput("");
    }

    const apiMessages = newMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let cvContext = "";
    if (cvText) {
      cvContext = `\n\n[Candidate's CV — tailor your questions to their background]\n${cvText}`;
    }

    setStreaming(true);

    const assistantId = Math.random().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      },
    ]);

    try {
      const res = await fetch(`${API_BASE}/api/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          systemPrompt: scenario.systemPrompt + cvContext,
        }),
      });

      if (!res.ok) throw new Error("Stream failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const current = accumulated;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: current } : m,
            ),
          );
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Something went wrong. Please try again." }
            : m,
        ),
      );
    } finally {
      setStreaming(false);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    }
  }

  async function endSession() {
    if (!user || messages.length < 2) return;

    Alert.alert("End session", "End the interview and get your feedback?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End & get feedback",
        onPress: async () => {
          setSessionEnded(true);
          setFeedbackLoading(true);

          let feedbackText = "";
          try {
            const res = await fetch(`${API_BASE}/api/feedback`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: messages.map((m) => ({
                  role: m.role,
                  content: m.content,
                })),
                scenarioTitle: scenario?.title,
              }),
            });
            const data = await res.json();
            feedbackText = data.feedback;
            setFeedback(feedbackText);
          } catch {
            setFeedback("Unable to generate feedback at this time.");
          } finally {
            setFeedbackLoading(false);
          }

          try {
            await saveSession({
              scenarioId: scenarioId as string,
              userId: user.uid,
              messages: messages.map((m) => ({ ...m })),
              startedAt: messages[0]?.timestamp ?? Date.now(),
              feedback: feedbackText,
            });
          } catch (err) {
            console.error("Failed to save session:", err);
          }
        },
      },
    ]);
  }

  function resetSession() {
    setMessages([]);
    setInput("");
    setSessionEnded(false);
    setFeedback(null);
    setFeedbackLoading(false);
    if (scenario) sendMessage(null);
  }

  function renderMessage({ item }: { item: UIMessage }) {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowAI,
        ]}
      >
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>⚡</Text>
          </View>
        )}
        <View
          style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}
        >
          {item.content === "" && !isUser ? (
            <View style={styles.thinkingRow}>
              <ActivityIndicator size="small" color={colors.textMuted} />
              <Text style={styles.thinkingText}>Thinking...</Text>
            </View>
          ) : (
            <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
              {item.content}
            </Text>
          )}
        </View>
        {isUser && (
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {profile?.displayName?.[0]?.toUpperCase() ?? "U"}
            </Text>
          </View>
        )}
      </View>
    );
  }

  if (!scenario) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {scenario.title}
          </Text>
          <Text style={styles.headerSub}>
            {scenario.difficulty} · {scenario.category}
          </Text>
        </View>
        {!sessionEnded && messages.length >= 2 && (
          <TouchableOpacity onPress={endSession} style={styles.endBtn}>
            <Text style={styles.endBtnText}>End</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.emptyChatText}>Starting interview...</Text>
            </View>
          }
          ListFooterComponent={
            sessionEnded ? (
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackTitle}>✅ Session Complete</Text>
                {feedbackLoading ? (
                  <View style={styles.feedbackLoading}>
                    <ActivityIndicator color={colors.accent} size="small" />
                    <Text style={styles.feedbackLoadingText}>
                      Generating feedback...
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.feedbackText}>{feedback}</Text>
                )}
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={resetSession}
                  activeOpacity={0.8}
                >
                  <Text style={styles.resetBtnText}>↺ Start new session</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />

        {/* Input */}
        {!sessionEnded && (
          <View style={styles.inputArea}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your answer..."
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={2000}
              editable={!streaming}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!input.trim() || streaming) && styles.sendBtnDisabled,
              ]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || streaming}
              activeOpacity={0.8}
            >
              {streaming ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendBtnText}>↑</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  flex: { flex: 1 },
  loading: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    gap: spacing.sm,
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
  backText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  headerInfo: { flex: 1 },
  headerTitle: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  headerSub: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: "capitalize",
  },
  endBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  endBtnText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  messageList: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  messageRowUser: { justifyContent: "flex-end" },
  messageRowAI: { justifyContent: "flex-start" },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(108,99,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(108,99,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  aiAvatarText: { fontSize: 12 },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgHover,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userAvatarText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    padding: spacing.md,
  },
  bubbleUser: {
    backgroundColor: "rgba(108,99,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(108,99,255,0.3)",
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  bubbleTextUser: { color: colors.textPrimary },
  thinkingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  thinkingText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  emptyChat: {
    alignItems: "center",
    paddingTop: 80,
    gap: spacing.md,
  },
  emptyChatText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  feedbackCard: {
    margin: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(108,99,255,0.2)",
    gap: spacing.md,
  },
  feedbackTitle: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  feedbackLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  feedbackLoadingText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  feedbackText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  resetBtn: {
    backgroundColor: colors.bgTertiary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  resetBtnText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.bgPrimary,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.bgTertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    fontSize: fontSize.lg,
    color: "#fff",
    fontWeight: "700",
  },
});
