import Colors from "@/constants/Colors";
import { useSelectedDate } from "@/context/selectedContext";
import { socket } from "@/lib/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import {
    Alert,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateEvent() {
  const { date, start, end, mode } = useLocalSearchParams<{
    date?: string;
    start?: string;
    end?: string;
    mode?: "quick" | "date";
  }>();
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();

  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [userId, setUserId] = useState<string | null>(null);
  const [socketReady, setSocketReady] = useState(false);
  const { selectedDate: contextDate } = useSelectedDate();
  
//   /* ---------- INITIALIZE FORM ---------- */
//   useEffect(() => {
//     // Priority: URL param > context > defaults
//     const prefillDate = date || contextDate || "";
//     setSelectedDate(prefillDate);

//     setTitle("");
//     setStartTime(prefillDate ? "09:00" : "");
//     setEndTime(prefillDate ? "10:00" : "");
//     setAllDay(false);
//     setLocation("");
//     setDescription("");
//   }, [mode, date, contextDate]);

//   /* ---------- INITIALIZE FORM ---------- */

//   useEffect(() => {
//     if (!mode) return;

//     if (mode === "date" && date) {
//       setTitle("");
//       setSelectedDate(date);
//       setStartTime("09:00");
//       setEndTime("10:00");
//       setAllDay(false);
//       setLocation("");
//       setDescription("");
//       return;
//     }

//     if (mode === "quick") {
//       setTitle("");
//       setSelectedDate("");
//       setStartTime("");
//       setEndTime("");
//       setAllDay(false);
//       setLocation("");
//       setDescription("");
//     }
//   }, [mode, date]);

//   /* ---------- RESET FORM ON FOCUS ONLY FOR QUICK MODE ---------- */
//   useFocusEffect(() => {
//     if (mode === "quick") {
//       setTitle("");
//       setSelectedDate("");
//       setStartTime("");
//       setEndTime("");
//       setAllDay(false);
//       setLocation("");
//       setDescription("");
//     }
//   });

//   /* ---------- PREFILL ONLY WHEN DATE IS PROVIDED ---------- */
//   useEffect(() => {
//     if (date) {
//       setSelectedDate(date);
//       // Prefill with start/end if available, otherwise default
//       setStartTime(start || "");
//       setEndTime(end || "");
//     }
//   }, [date, start, end]);

//   /* ---------- RESET FORM ON FOCUS IF NO DATE INTENDED ---------- */
//   useFocusEffect(() => {
//     if (!date && mode === "quick") {
//       setTitle("");
//       setSelectedDate("");
//       setStartTime("");
//       setEndTime("");
//       setAllDay(false);
//       setLocation("");
//       setDescription("");
//     }
//   });

// useEffect(() => {
//   // Prefill from URL params first
//   if (date) setSelectedDate(date);
//   if (start) setStartTime(start);
//   if (end) setEndTime(end);

//   // Defaults if nothing provided
//   if (!date) setSelectedDate(new Date().toISOString().split("T")[0]); // YYYY-MM-DD
//   if (!start) setStartTime("09:00");
//   if (!end) setEndTime("10:00");
// }, [date, start, end]);

// Load existing event if eventId exists

useEffect(() => {
  // EDIT MODE — do nothing
  if (eventId) return;

  // If date comes from any calendar view (Day / Week / 3-Days / Month)
  if (date) {
    setSelectedDate(date);

    // Day view gives exact slot
    if (start && end) {
      setStartTime(start);
      setEndTime(end);
    }
    // Week & 3-Days fallback
    else {
      setStartTime("09:00");
      setEndTime("10:00");
    }

    return;
  }

  // Default create
  const today = new Date().toISOString().split("T")[0];
  setSelectedDate(today);
  setStartTime("09:00");
  setEndTime("10:00");
}, [date, start, end, eventId]);


useEffect(() => {
  if (!eventId) return;

  axios
    .get(`http://192.168.1.167:5000/api/events/getEventById/${eventId}`)
    .then((res) => {
      const e = res.data;
      const start = new Date(e.startTime);
      const end = new Date(e.endTime);

      setTitle(e.title || "");
      setSelectedDate(start.toISOString().split("T")[0]); // YYYY-MM-DD
      setStartTime(start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }));
      setEndTime(end.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }));
      setAllDay(!!e.allDay);
      setLocation(e.location || "");
      setDescription(e.description || "");
    })
    .catch(console.error);
}, [eventId]);



  useEffect(() => {
    AsyncStorage.getItem("userId").then(setUserId);
  }, []);
  /* ---------- SAVE ---------- */
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

    const start = new Date(selectedDate);
    const end = new Date(selectedDate);

    if (allDay) {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);

      start.setHours(sh, sm, 0, 0);
      end.setHours(eh, em, 0, 0);

      if (end < start) {
        Alert.alert("Validation Error", "End time cannot be before start time");
        return;
      }
    }

    const payload = {
      userId,
      title,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      allDay,
      location,
      description,
    };

    if (eventId) {
      const payloadEdit = {
        eventId,
        userId,
        title,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        allDay,
        location,
        description,
      };
      socket.emit("updateEvent", payloadEdit, (response: any) => {
        if (response.success) {
          Alert.alert("Success", "Event updated!");
          router.back();
        } else {
          Alert.alert("Error", response.error || "Update failed");
        }
      });

      Alert.alert("Success", "Event updated successfully!");
      router.back();
      return;
    }

    // ====== fronted triggering listen event in line 258 =====//
    console.log("listen event triggereed in line 259: ", payload);
    socket.emit("listenEvent", payload, (response: any) => {
      if (!response) {
        Alert.alert("Error", "No response from server");
        return;
      }

      if (response.success) {
        Alert.alert("Success", "Event created successfully!");
        console.log(
          response,
          "event creation successfull==============??? 265 line number",
        );
        router.back();
      } else {
        Alert.alert("Error", response.error || "Failed to create event");
      }
    });
  }



// Replace your current return with this:
return (
  <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.action}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {eventId ? "Edit Event" : "New Event"}
          </Text>

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
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);

}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9f9f9" }, // light background
  container: { flex: 1, padding: 16 },
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
    borderColor: "#ddd",
    marginBottom: 24,
  },
  label: { color: "#555", marginBottom: 6 }, // dark gray for labels
  input: {
    backgroundColor: "#fff", // white input
    color: "#000", // text dark
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd", // subtle border
  },
  multiline: { height: 80, textAlignVertical: "top" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
});

