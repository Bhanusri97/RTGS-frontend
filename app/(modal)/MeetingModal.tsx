import axios from "axios";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "@/constants/Colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  hostUserId: string;
  participantUserId: string;
};

export default function MeetingModal({
  visible,
  onClose,
  hostUserId,
  participantUserId,
}: Props) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(""); // DD-MM-YYYY
  const [time, setTime] = useState(""); // HH:mm
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !date || !time) {
      Alert.alert("Validation", "Title, date and time are required");
      return;
    }

    try {
      setLoading(true);

      const [dd, mm, yyyy] = date.split("-");
      const [hh, min] = time.split(":");

      if (!dd || !mm || !yyyy || !hh || !min) {
        Alert.alert("Invalid Input", "Use DD-MM-YYYY and HH:mm format");
        return;
      }

      const startDate = new Date(
        Number(yyyy),
        Number(mm) - 1,
        Number(dd),
        Number(hh),
        Number(min),
        0
      );

      if (isNaN(startDate.getTime())) {
        Alert.alert("Invalid Date", "Invalid date or time");
        return;
      }

      const payload = {
        hostUserId,
        participantUserId,
        title,
        startTime: startDate.toISOString(),
      };

      await axios.post(
        "http://192.168.1.167:5000/api/webex/create-meeting",
        payload
      );

      Alert.alert("Success", "Meeting created successfully");
      onClose();
      setTitle("");
      setDate("");
      setTime("");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <Text style={styles.heading}>Create Meeting</Text>
          <Text style={styles.subtitle}>Schedule a new Webex meeting</Text>

          {/* Inputs */}
          <TextInput
            placeholder="Meeting title"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <TextInput
            placeholder="Date (DD-MM-YYYY)"
            placeholderTextColor="#888"
            value={date}
            onChangeText={setDate}
            style={styles.input}
          />
          <TextInput
            placeholder="Start time (HH:mm)"
            placeholderTextColor="#888"
            value={time}
            onChangeText={setTime}
            style={styles.input}
          />
          <Text style={styles.helperText}>
            Example: 12-02-2026 • 10:00 (24-hour format)
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createBtn, loading && styles.createBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 18,
  },
  input: {
    backgroundColor: "#f2f2f2",
    color: "#111",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  helperText: {
    color: "#888",
    fontSize: 12,
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  cancelText: {
    color: "#888",
    fontSize: 15,
  },
  createBtn: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  createBtnDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
  },
  createText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
