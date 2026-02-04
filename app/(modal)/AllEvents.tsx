import { socket } from "@/lib/socket";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router"; // ✅ Correct way

export default function AllEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const router = useRouter(); // ✅ Initialize router here

  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        "http://192.168.1.75:5000/api/events/getEvents"
      );
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEdit = async (eventId: string) => {
    try {
      const res = await axios.get(
        `http://192.168.1.75:5000/api/events/getEventById/${eventId}`
      );
      const eventData = res.data;

      // ✅ Use router.push() correctly
      router.push({
        pathname: "/(modal)/createEvent",
        params: {
          eventId: eventData._id,
          title: eventData.title,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          allDay: eventData.allDay,
          location: eventData.location,
          description: eventData.description,
          date: eventData.startTime.split("T")[0],
          mode: "edit",
        },
      });
    } catch (err) {
      console.error("Failed to fetch event:", err);
      Alert.alert("Error", "Failed to fetch event details");
    }
  };

  const handleDelete = (eventId: string) => {
    Alert.alert("Delete Event", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          socket.emit("deleteEvent", { eventId });
        },
      },
    ]);
  };

  useEffect(() => {
    socket.on("eventCreated", (newEvent) => {
      setEvents((prev) => [...prev, newEvent]);
    });

    socket.on("eventUpdated", (updatedEvent) => {
      setEvents((prev) =>
        prev.map((e) => (e._id === updatedEvent._id ? updatedEvent : e))
      );
    });

    socket.on("eventDeleted", ({ id }) => {
      setEvents((prev) => prev.filter((e) => e._id !== id));
    });

    return () => {
      socket.off("eventCreated");
      socket.off("eventUpdated");
      socket.off("eventDeleted");
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>All Events</Text>
        <ScrollView contentContainerStyle={styles.scroll}>
          {events.map((event) => (
            <View key={event._id} style={styles.eventBox}>
              {/* Icons */}
              <View style={styles.iconsRow}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleEdit(event._id)}
                >
                  <Ionicons name="pencil-outline" size={20} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconButton, { marginLeft: 8 }]}
                  onPress={() => handleDelete(event._id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff4d4d" />
                </TouchableOpacity>
              </View>

              {/* Event Info */}
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>
                  {event.startTime
                    ? new Date(event.startTime).toLocaleDateString()
                    : ""}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#f9f9f9" },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16, color: "#000" },
  scroll: { paddingBottom: 50 },
  eventBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    shadowColor: "#aaa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  iconsRow: { flexDirection: "row", marginRight: 12 },
  iconButton: {
    padding: 6,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0e0e0",
  },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: "600", color: "#000" },
  eventDate: { fontSize: 12, marginTop: 2, color: "#555" },
});
