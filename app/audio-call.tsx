import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  useColorScheme,
  ScrollView,
  Alert,
} from "react-native";
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  Phone,
  Info,
  Shield,
} from "lucide-react-native";
import Colors from "@/constants/Colors";
import * as Linking from "expo-linking";
import { Platform } from "react-native";
import axios from "axios";

export default function AudioCall() {
  const [visible, setVisible] = useState(false);
  const scheme = useColorScheme() ?? "light";
  const theme = Colors[scheme];
  const [loading, setLoading] = useState(false);

  const createAndJoinCall = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://192.168.1.167:5000/api/webex/audioCall", 
        {
          title: "Audio Call",
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min call
        }
      );

      const meetingLink = response.data.meetingLink;
      if (!meetingLink) throw new Error("Meeting link missing");

      // Open the meeting link
      if (Platform.OS === "web") {
        window.open(meetingLink, "_blank");
      } else {
        await Linking.openURL(meetingLink);
      }

      // Show call UI
      setVisible(true);
    } catch (err: any) {
      console.error("Join audio call failed:", err);
      Alert.alert("Error", err.message || "Failed to start call");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Audio Call</Text>
        <Text style={[styles.subtitle, { color: theme.tabIconDefault }]}>
          Secure voice communication
        </Text>
      </View>

      {/* START CALL BUTTON */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.startCard, { backgroundColor: theme.primary }]}
        onPress={createAndJoinCall}
        disabled={loading}
      >
        <View style={styles.startIcon}>
          <Phone size={22} color={theme.primary} />
        </View>
        <View>
          <Text style={styles.startTitle}>
            {loading ? "Starting..." : "Start Audio Call"}
          </Text>
          <Text style={styles.startSub}>Tap to connect instantly</Text>
        </View>
      </TouchableOpacity>

      {/* INFO CARDS */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Shield size={20} color={theme.success} />
          <Text style={[styles.infoText, { color: theme.text }]}>
            Your calls are encrypted and secure
          </Text>
        </View>

        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Mic size={20} color={theme.info} />
          <Text style={[styles.infoText, { color: theme.text }]}>
            Use mute and hold controls during the call
          </Text>
        </View>

        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Info size={20} color={theme.warning} />
          <Text style={[styles.infoText, { color: theme.text }]}>
            Ensure microphone permission is enabled
          </Text>
        </View>
      </ScrollView>

      {/* CALL MODAL */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.card }]}>
            <View style={styles.handle} />

            <View
              style={[
                styles.avatarOuter,
                { backgroundColor: theme.primary + "20" },
              ]}
            >
              <View
                style={[styles.avatarInner, { backgroundColor: theme.primary }]}
              >
                <Volume2 size={34} color="#fff" />
              </View>
            </View>

            <Text style={[styles.heading, { color: theme.text }]}>Audio Call</Text>
            <Text style={[styles.timer, { color: theme.secondary }]}>00:00</Text>

            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.circleBtn, { backgroundColor: theme.background }]}
              >
                <Mic size={22} color={theme.primary} />
                <Text style={[styles.btnLabel, { color: theme.text }]}>Mute</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.circleBtn, styles.endBtn, { backgroundColor: theme.error }]}
                onPress={() => setVisible(false)}
              >
                <PhoneOff size={24} color="#fff" />
                <Text style={[styles.btnLabel, { color: "#fff" }]}>End</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.circleBtn, { backgroundColor: theme.background }]}
              >
                <MicOff size={22} color={theme.primary} />
                <Text style={[styles.btnLabel, { color: theme.text }]}>Hold</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 4 },
  startCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    gap: 14,
    marginBottom: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  startIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  startTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  startSub: { color: "#ffffffcc", fontSize: 12, marginTop: 2 },
  infoCard: { flexDirection: "row", gap: 12, padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 14 },
  infoText: { fontSize: 14, flex: 1, lineHeight: 20 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#ccc", alignSelf: "center", marginBottom: 20 },
  avatarOuter: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 12 },
  avatarInner: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  heading: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  timer: { fontSize: 14, textAlign: "center", marginBottom: 28 },
  controls: { flexDirection: "row", justifyContent: "space-between" },
  circleBtn: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", elevation: 3 },
  endBtn: { transform: [{ scale: 1.05 }] },
  btnLabel: { fontSize: 11, marginTop: 6, fontWeight: "600" },
});
