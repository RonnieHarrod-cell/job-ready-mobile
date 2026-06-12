import { colors } from "@/constants/theme";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgSecondary,
          borderTopColor: colors.borderSubtle,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <TabIcon emoji="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => <TabIcon emoji="🌐" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabIcon emoji="⚡" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require("react-native");
  return (
    <Text style={{ fontSize: 20, opacity: color === colors.accent ? 1 : 0.4 }}>
      {emoji}
    </Text>
  );
}
