import { AuthProvider } from "@/contexts/AuthContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0A0A0F" },
          animation: "fade_from_bottom",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="interview/[scenarioId]"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="scenarios/create"
          options={{ animation: "slide_from_bottom" }}
        />
      </Stack>
    </AuthProvider>
  );
}
