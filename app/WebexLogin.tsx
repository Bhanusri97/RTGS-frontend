import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import WebexAudioCall from "./(tabs)/audio-call";

export default function WebLogin() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {

  }, []);

  const handleLogin = async () => {
    const url = "http://192.168.1.75:5000/auth/webex";
    await Linking.openURL(url);
  };

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Webex Audio Call</Text>
        <Text style={styles.subtitle}>Please login using Webex</Text>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login with Webex</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <WebexAudioCall token={token} />;
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
