import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { colors, spacing, fontSize, radius } from "@/constants/theme";

type Mode = "landing" | "signin" | "signup";

export default function LandingScreen() {
  const { user, loading, signIn, signUp } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("landing");

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/(tabs)/dashboard");
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)/dashboard");
    } catch (e: any) {
      Alert.alert("Sign in failed", friendlyError(e.code));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignUp() {
    if (!email.trim() || !password.trim() || !displayName.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      router.replace("/(tabs)/dashboard");
    } catch (e: any) {
      Alert.alert("Sign up failed", friendlyError(e.code));
    } finally {
      setSubmitting(false);
    }
  }

  function friendlyError(code: string): string {
    switch (code) {
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/email-already-in-use":
        return "An account already exists with this email.";
      case "auth/weak-password":
        return "Password is too weak.";
      case "auth/invalid-credential":
        return "Incorrect email or password.";
      default:
        return "Something went wrong. Please try again.";
    }
  }

  // ── Landing ────────────────────────────────────────────────────────────────
  if (mode === "landing") {
    return (
      <View style={styles.container}>
        <View style={styles.glowOrb} />

        <View style={styles.hero}>
          <View style={styles.logoMark}>
            <Text style={styles.logoIcon}>⚡</Text>
          </View>
          <Text style={styles.title}>
            Job<Text style={styles.titleAccent}>Ready</Text>
          </Text>
          <Text style={styles.subtitle}>
            AI-powered interview practice.{"\n"}
            Frontend, backend, design and more.
          </Text>
        </View>

        <View style={styles.features}>
          {[
            { icon: "🎯", text: "9 preset interview scenarios" },
            { icon: "🤖", text: "Streaming AI interviewer" },
            { icon: "📊", text: "Feedback and scoring after every session" },
            { icon: "🎮", text: "Rank up from E to SSS" },
          ].map((item) => (
            <View key={item.text} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{item.icon}</Text>
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setMode("signup")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Get started — it's free</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={() => setMode("signin")}
            activeOpacity={0.85}
          >
            <Text style={styles.ghostBtnText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Sign in / Sign up ──────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.formContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <TouchableOpacity
          onPress={() => setMode("landing")}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.formHeader}>
          <View style={styles.logoMarkSm}>
            <Text style={{ fontSize: 20 }}>⚡</Text>
          </View>
          <Text style={styles.formTitle}>
            {mode === "signin" ? "Welcome back" : "Create account"}
          </Text>
          <Text style={styles.formSubtitle}>
            {mode === "signin"
              ? "Sign in to your JobReady account"
              : "Start practising interviews for free"}
          </Text>
        </View>

        {/* Fields */}
        <View style={styles.fields}>
          {mode === "signup" && (
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder={
                mode === "signup" ? "At least 6 characters" : "Your password"
              }
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.primaryBtn, submitting && { opacity: 0.6 }]}
          onPress={mode === "signin" ? handleSignIn : handleSignUp}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>
              {mode === "signin" ? "Sign in" : "Create account"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Switch mode */}
        <TouchableOpacity
          onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
          style={{ marginTop: spacing.lg, alignItems: "center" }}
        >
          <Text style={styles.switchText}>
            {mode === "signin"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    paddingHorizontal: spacing.lg,
    paddingTop: 80,
    paddingBottom: 48,
  },
  glowOrb: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(108,99,255,0.08)",
    top: 40,
    alignSelf: "center",
  },
  hero: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoIcon: { fontSize: 32 },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -1,
    marginBottom: spacing.md,
  },
  titleAccent: { color: colors.accent },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  features: {
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  featureIcon: { fontSize: 18 },
  featureText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    marginTop: "auto",
    gap: spacing.md,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: "#fff",
  },
  ghostBtn: {
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  ghostBtnText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  // Form styles
  formContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: 48,
  },
  backBtn: { marginBottom: spacing.xl },
  backText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: "500",
  },
  formHeader: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logoMarkSm: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  formTitle: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
  },
  fields: { gap: spacing.md, marginBottom: spacing.lg },
  field: { gap: spacing.xs },
  label: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  switchText: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: "500",
  },
});
