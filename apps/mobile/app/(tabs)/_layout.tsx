import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarIcon, PeopleIcon } from "@/icons";
import { fonts, useTheme } from "@/theme";

export default function TabsLayout() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.pineInk,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.card, borderTopColor: t.line, height: 64 + insets.bottom, paddingTop: 6, paddingBottom: insets.bottom + 6 },
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 18, paddingBottom: 2 },
        sceneStyle: { backgroundColor: t.ground },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Upcoming", tabBarIcon: ({ color }) => <CalendarIcon color={String(color)} size={24} /> }} />
      <Tabs.Screen name="people" options={{ title: "People", tabBarIcon: ({ color }) => <PeopleIcon color={String(color)} size={24} /> }} />
    </Tabs>
  );
}
