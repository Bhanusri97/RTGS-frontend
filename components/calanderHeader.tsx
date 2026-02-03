import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Menu, Save } from "lucide-react-native";
import { useRouter, usePathname } from "expo-router";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

type CalendarHeaderProps = {
  headerTitle: string;
};
export default function CalendarHeader({ headerTitle }: CalendarHeaderProps) {
  const [open, setOpen] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const pathname = usePathname();

// Dynamic header title based on route
const getTitle = () => {
  switch (pathname) {
    case "/(modal)/dayCalander":
      return "Day Calander";
    case "/(modal)/threeDaysCalander":
      return "3 Days Calander";
    case "/(modal)/weekCalander":
      return "Week Calander";
    default:
      return "Schedule";
  }
};

  const title = getTitle();

  // Routes inside modal folder
  type CalendarRoutes =
    | "/(modal)/dayCalander"
    | "/(modal)/threeDaysCalander"
    | "/(modal)/weekCalander";

  const menuRoutes: Record<"Day" | "3 Days" | "Week", CalendarRoutes> = {
    Day: "/(modal)/dayCalander",
    "3 Days": "/(modal)/threeDaysCalander",
    Week: "/(modal)/weekCalander",
  };

  const navigateAndClose = (route: CalendarRoutes) => {
    router.push(route);
    setOpen(false);
  };

  // Navigate to AllEvents screen
  const goToAllEvents = () => {
    router.push("/(modal)/AllEvents");
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: theme.background,
      }}
    >
      {/* Left: Hamburger + Title */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Hamburger icon */}
        <TouchableOpacity
          onPress={() => setOpen(!open)}
          style={{ marginRight: 10 }}
        >
          <Menu size={24} color={theme.text} />
        </TouchableOpacity>

        {/* Header title */}
        <Text style={{ fontWeight: "bold", fontSize: 18, color: theme.text }}>
          {title}
        </Text>
      </View>

      {/* Right: Save icon */}
      <View style={{ marginLeft: 170 }}>
        <TouchableOpacity onPress={goToAllEvents}>
          <Save size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Dropdown menu */}
      {open && (
        <View
          style={{
            position: "absolute",
            top: 50,
            left: 10,
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            zIndex: 999,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          {(["Day", "3 Days", "Week"] as const).map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => navigateAndClose(menuRoutes[item])}
              style={{ paddingVertical: 8, paddingHorizontal: 12 }}
            >
              <Text style={{ color: "black", fontSize: 16 }}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
