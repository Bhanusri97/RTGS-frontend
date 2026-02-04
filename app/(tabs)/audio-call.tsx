import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

type WebexAudioCallProps = {
  token: string;
};

export default function WebexAudioCall({ token }: WebexAudioCallProps) {
  const [webex, setWebex] = useState<any>(null);
  const [meeting, setMeeting] = useState<any>(null);
  const [calling, setCalling] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initWebex = async () => {
      try {
        const Webex = (await import("webex")).default;

        const webexInstance = Webex.init({
          credentials: {
            access_token: token,
          },
        });

        webexInstance.once("ready", async () => {
          await webexInstance.meetings.register();

          if (mounted) {
            setWebex(webexInstance);
            setReady(true);
          }

          console.log("Webex ready");
        });
      } catch (error) {
        console.error("Webex init failed", error);
        Alert.alert("Error", "Webex initialization failed");
      }
    };

    initWebex();

    return () => {
      mounted = false;
    };
  }, [token]);

  const startCall = async () => {
    if (!webex || !ready) {
      Alert.alert("Please wait", "Webex is not ready yet");
      return;
    }


    const email = "test@example.com"; 

    try {
      const meeting = await webex.meetings.create(email);

      await meeting.join({
        audioMuted: false,
        videoMuted: true,
      });

      await meeting.addMedia({
        audio: true,
        video: false,
      });

      setMeeting(meeting);
      setCalling(true);
    } catch (error) {
      console.error("Call failed", error);
      Alert.alert("Error", "Call failed");
    }
  };

  const endCall = async () => {
    if (!meeting) return;

    try {
      await meeting.leave();
    } catch (e) {
      console.error("Leave failed", e);
    }

    setMeeting(null);
    setCalling(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Webex Audio Call</Text>

      {!calling ? (
        <TouchableOpacity
          style={[styles.button, !ready && styles.disabled]}
          onPress={startCall}
          disabled={!ready}
        >
          <Text style={styles.buttonText}>
            {ready ? "Start Audio Call" : "Initializing..."}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.endButton} onPress={endCall}>
          <Text style={styles.buttonText}>End Call</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  endButton: {
    backgroundColor: "#FF3B30",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
