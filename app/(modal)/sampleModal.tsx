import { socket } from "@/lib/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { EventType } from "./dayCalander";
import Colors from "@/constants/Colors";

export default function SampleModal({
  event,
  onClose,
  onUpdateEvent,
}: {
  event?: EventType | null;
  onClose: () => void;
  onUpdateEvent?: (updatedEvent: EventType) => void;
}) {
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("userId").then(setUserId);
  }, []);

  // Prefill event details when editing
  useEffect(() => {
    if (!event) return;

    axios
      .get(`http://192.168.1.167:5000/api/events/getEventById/${event.id}`)
      .then((res) => {
        const e = res.data;

        const start = new Date(e.startTime);
        const end = new Date(e.endTime);

        setTitle(e.title || "");

        // ✅ UTC-safe date
        setSelectedDate(start.toISOString().slice(0, 10));

        // ✅ local date (calendar date)
        setSelectedDate(
          `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(
            2,
            "0",
          )}-${String(start.getDate()).padStart(2, "0")}`,
        );

        // ✅ local time (same as Day Calendar)
        setStartTime(
          `${String(start.getHours()).padStart(2, "0")}:${String(
            start.getMinutes(),
          ).padStart(2, "0")}`,
        );

        setEndTime(
          `${String(end.getHours()).padStart(2, "0")}:${String(
            end.getMinutes(),
          ).padStart(2, "0")}`,
        );

        setAllDay(!!e.allDay);
        setLocation(e.location || "");
        setDescription(e.description || "");
      })
      .catch(console.error);
  }, [event]);

  // Get userId from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem("userId").then(setUserId);
  }, []);

  // Handle save (edit only)
  function handleSave() {
    if (!socket.connected) {
      Alert.alert("Please wait", "Connecting to server...");
      return;
    }
    if (!userId) {
      Alert.alert("Error", "User ID missing");
      return;
    }
    if (!title.trim() || !selectedDate) {
      Alert.alert("Validation Error", "Title and date are required");
      return;
    }

    let start: Date;
    let end: Date;

    if (allDay) {
      // all-day event
      start = new Date(`${selectedDate}T00:00:00.000Z`);
      end = new Date(`${selectedDate}T23:59:59.999Z`);
    } else {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);

      // Use Date.UTC to prevent local timezone shift
      const [year, month, day] = selectedDate.split("-").map(Number);
      start = new Date(year, month - 1, day, sh, sm, 0, 0);
      end = new Date(year, month - 1, day, eh, em, 0, 0);

      if (end < start) {
        Alert.alert("Validation Error", "End time cannot be before start time");
        return;
      }
    }

    const payload = {
      eventId: event?.id,
      userId,
      title,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      allDay,
      location,
      description,
    };

    // Update UI
    if (onUpdateEvent && event) {
      const startSlot = Math.floor(
        (start.getHours() * 60 + start.getMinutes()) / 30,
      );
      const endSlot = Math.floor((end.getHours() * 60 + end.getMinutes()) / 30);

      onUpdateEvent({
        id: event.id,
        title,
        startSlot,
        endSlot,
        start: startTime,
        end: endTime,
        color: "#1a73e8",
        location,
        description,
        allDay,
        dayIndex: event.dayIndex,
      });
    }
    onClose();
    // Emit to server
    socket.emit("updateEvent", payload, (response: any) => {
      if (response.success) {
        Alert.alert("Success", "Event updated!");
      } else {
        Alert.alert("Error", response.error || "Update failed");
      }
    });
  }

  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const SHEET_MAX = SCREEN_HEIGHT * 0.85;
  const SHEET_MIN = 90;
  const translateY = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(true);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120) {
          Animated.spring(translateY, {
            toValue: SHEET_MAX - SHEET_MIN,
            useNativeDriver: true,
          }).start();
          setExpanded(false);
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          setExpanded(true);
        }
      },
    }),
  ).current;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
        pointerEvents={expanded ? "auto" : "box-none"}
      >
        <View style={styles.container}>
          <View {...panResponder.panHandlers} style={styles.dragHandle}>
            <View style={styles.dragBar} />
          </View>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.action}>Cancel</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Edit Event</Text>

            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.action}>Save</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Event title"
            placeholderTextColor="#777"
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
          />

          <Text style={styles.label}>Date</Text>
          <TextInput
            value={selectedDate}
            editable
            onChangeText={setSelectedDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#777"
            style={styles.input}
          />

          {!allDay && (
            <>
              <Text style={styles.label}>Start Time</Text>
              <TextInput
                value={startTime}
                onChangeText={setStartTime}
                style={styles.input}
              />
              <Text style={styles.label}>End Time</Text>
              <TextInput
                value={endTime}
                onChangeText={setEndTime}
                style={styles.input}
              />
            </>
          )}

          <View style={styles.row}>
            <Text style={styles.label}>All Day</Text>
            <Switch value={allDay} onValueChange={setAllDay} />
          </View>

          <Text style={styles.label}>Location</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            style={styles.input}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.multiline]}
            multiline
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" }, // light background

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: { color: "#000", fontSize: 18, fontWeight: "600" }, // dark text
  action: { color: Colors.light.primary, fontSize: 16 },

  titleInput: {
    color: "#000",
    fontSize: 22,
    borderBottomWidth: 1,
    borderColor: "#ccc", // light border
    marginBottom: 24,
  },

  label: { color: "#555", marginBottom: 6 }, // dark gray labels

  input: {
    backgroundColor: "#f2f2f2", // light input background
    color: "#000", // text black
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  multiline: { height: 80 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  dragHandle: {
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  dragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#aaa", // light theme bar
  },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.1)" }, // lighter overlay

  sheet: {
    pointerEvents: "auto",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff", // light sheet background
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderColor: "#ccc",
    borderWidth: 1,
  },
});

