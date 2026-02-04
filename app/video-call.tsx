import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "@/constants/Colors";
import { useFocusEffect } from "expo-router";

export default function Meeting() {
  const [userData, setUserData] = useState<any>(null);

useFocusEffect(
  React.useCallback(() => {
    const fetchUserById = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;
        const response = await axios.post(
          `http://192.168.1.75:5000/api/webex/users/${userId}`
        );
        setUserData(response.data);
      } catch (error: any) {
        console.error(error.response?.data || error.message);
      }
    };

    fetchUserById();
  }, [])
);


  if (!userData?.user) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: "#888" }}>Loading meetings...</Text>
      </View>
    );
  }

  const meetings = userData.user.meetings || [];

  const joinMeeting = async (url: string) => {
    if (Platform.OS === "web") {
      window.open(url, "_blank");
      return;
    }
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert("Cannot open meeting link");
      return;
    }
    await Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Webex Meetings</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {meetings.length === 0 ? (
          <Text style={styles.noMeetingText}>No meetings found</Text>
        ) : (
          meetings.map((meeting: any, index: number) => {
            const start = new Date(meeting.startTime);
            const end = new Date(meeting.endTime);
            const now = new Date();
            const isEnded = end < now;

            return (
              <View key={index} style={styles.meetingCard}>
                <View style={styles.meetingInfo}>
                  <Text style={styles.meetingTitle}>{meeting.title}</Text>
                  <Text style={styles.meetingTime}>
                    {start.toLocaleDateString()} •{" "}
                    {start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {end.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>

                <View style={styles.actionContainer}>
                  <TouchableOpacity
                    style={[
                      styles.joinBtn,
                      isEnded && styles.joinBtnDisabled,
                    ]}
                    disabled={isEnded}
                    onPress={() => joinMeeting(meeting.meetingLink)}
                  >
                    <Text style={styles.joinText}>Join</Text>
                  </TouchableOpacity>

                  {isEnded && <Text style={styles.endedLabel}>Ended</Text>}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push("/(modal)/selectUser")}
        >
          <Text style={styles.createBtnText}>+ Create Meeting</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // soft light background
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    marginBottom: 16,
  },
  noMeetingText: {
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },

  meetingCard: {
    backgroundColor: "#fff", // white card
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  meetingTime: {
    fontSize: 13,
    color: "#555",
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  joinBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinBtnDisabled: {
    backgroundColor: "#ccc",
  },
  joinText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  endedLabel: {
    color: "#ff4d4d",
    fontWeight: "700",
    fontSize: 13,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  createBtn: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
