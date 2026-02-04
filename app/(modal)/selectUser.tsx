import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "@/constants/Colors";
import MeetingModal from "./MeetingModal";

type User = {
  _id: string;
  name: string;
};

export default function SelectUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [hostId, setHostId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          "http://192.168.1.75:5000/api/auth/getUsers"
        );
        setUsers(res.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const getHostId = async () => {
      const id = await AsyncStorage.getItem("userId");
      setHostId(id);
    };
    getHostId();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select a Participant</Text>
      <Text style={styles.subtitle}>Choose a participant to create a meeting</Text>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {users.length === 0 ? (
          <Text style={styles.noUserText}>No users found</Text>
        ) : (
          users.map((user) => {
            const selected = selectedUserId === user._id;
            return (
              <TouchableOpacity
                key={user._id}
                style={[styles.userCard, selected && styles.userCardSelected]}
                onPress={() => setSelectedUserId(user._id)}
                activeOpacity={0.8}
              >
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.userName}>{user.name}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.createBtn, !selectedUserId && styles.createBtnDisabled]}
          onPress={() => {
            if (!selectedUserId) {
              alert("Please select a user first");
              return;
            }
            setModalVisible(true);
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.createBtnText}>Create Meeting</Text>
        </TouchableOpacity>
      </View>

      <MeetingModal
        visible={modalVisible}
        hostUserId={hostId!}
        participantUserId={selectedUserId!}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#888",
    fontSize: 14,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
  scrollContainer: {
    paddingBottom: 140,
  },
  noUserText: {
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    // subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  userCardSelected: {
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#ccc",
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: Colors.light.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
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
  createBtnDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
