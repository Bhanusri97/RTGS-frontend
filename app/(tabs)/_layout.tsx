import { Tabs } from "expo-router";
import {
  Calendar,
  CheckSquare,
  FileText,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react-native";
import React from "react";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import CalendarHeader from "@/components/calanderHeader";

function TabBarIcon(props: { icon: React.ElementType; color: string }) {
  const Icon = props.icon;
  return <Icon size={24} color={props.color} style={{ marginBottom: -3 }} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeColor = Colors[colorScheme ?? "light"].tint;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors[colorScheme ?? "light"].border,
        },
        headerTitleStyle: {
          fontWeight: "bold",
          color: Colors[colorScheme ?? "light"].text,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <TabBarIcon icon={LayoutDashboard} color={color} />
          ),
          headerTitle: "RTGS Assistant",
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => (
            <TabBarIcon icon={CheckSquare} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon icon={Calendar} color={color} />
          ),
          headerTitle: () => <CalendarHeader headerTitle="Schedule" />,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: "Docs",
          tabBarIcon: ({ color }) => (
            <TabBarIcon icon={FileText} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ color }) => (
            <TabBarIcon icon={MessageSquare} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null, // Hide the default "two" screen
        }}
      />
    </Tabs>
  );
}
