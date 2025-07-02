import { useAuth } from "@/lib/auth-context";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from "expo-router";
import { useCallback } from "react";
import { Button } from "react-native-paper";

export default function TabsLayout() {
  const { signOut, user } = useAuth();
  const handleSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  const username = user?.email ? user.email.split('@')[0] : '';

  return (
    <Tabs screenOptions={{ headerStyle: { backgroundColor: "transparent"}, headerShadowVisible: false , 
    tabBarStyle: { backgroundColor: "#f5f5f5" , borderTopWidth: 1, height: 65, paddingTop: 5, paddingBottom: 20, shadowOpacity:0, elevation:5}, 
    tabBarActiveTintColor:"#704cac", tabBarInactiveTintColor:"grey"}}>
      <Tabs.Screen name="index" options={{ 
        headerTitle: `Welcome ${username}!`,
        title: "Today's Habits",
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="calendar-today" size={size} color={color} />, 
        headerRight: () => (
          <Button
            mode="text"
            icon="logout"
            onPress={handleSignOut}
            compact
            style={{ marginRight: 8 }}
          >
            Sign Out
          </Button>
        ) 
      }} />
      <Tabs.Screen name="streaks" options={{ title: "Streaks", tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-timeline-variant-shimmer" size={size} color={color} /> }} />
      <Tabs.Screen name="add-habit" options={{ title: "Add Habit", tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="plus-circle-outline" size={size} color={color} /> }} />
    </Tabs>
  )
}
