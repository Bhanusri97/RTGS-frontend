import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import Colors from "@/constants/Colors";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// You can use axios or fetch. I used fetch here for consistency with the upload function,
// but the logic is identical for axios.

// --- Types ---
type Segment = {
  confidence: number;
  end_time: number;
  language: string;
  speaker: string;
  role?: string; // Added optional role
  start_time: number;
  text: string;
};

// --- Helper: Format Seconds to MM:SS ---
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export default function MeetingAnalyzer() {
  const [loading, setLoading] = useState(false); // Main analysis loading
  const [enrollLoading, setEnrollLoading] = useState(false); // Modal save loading
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  // State for the conversation data
  const [conversation, setConversation] = useState<Segment[] | null>(null);

  // State for Enrollment Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [speakerToEnroll, setSpeakerToEnroll] = useState<Segment | null>(null);
  const [enrollmentIndex, setEnrollmentIndex] = useState<number | null>(null); // Track which index we are editing
  const [newSpeakerName, setNewSpeakerName] = useState("");
  const [newSpeakerRole, setNewSpeakerRole] = useState("");

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      setSelectedFile(result.assets[0]);
      setConversation(null); // Reset previous analysis
    } catch (err) {
      Alert.alert("Error", "Failed to pick file");
    }
  };

  const uploadAndAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setConversation(null);

    const formData = new FormData();
    formData.append("audio", {
      uri: selectedFile.uri,
      name: selectedFile.name,
      type: selectedFile.mimeType || "audio/m4a",
    } as any);

    try {
      const response = await fetch("http://3.107.6.17:5002/analyze_meeting", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          // Do NOT set Content-Type manually for FormData
        },
      });

      const json = await response.json();
      console.log("meeting analyzer response", json)

      if (json.status === "success" && json.conversation) {
        setConversation(json.conversation);
      } else {
        Alert.alert(
          "Analysis Failed",
          "Backend returned an unexpected format.",
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Could not connect to the analysis server.");
    } finally {
      setLoading(false);
    }
  };

  // --- Enrollment Logic ---
  const handleEnrollPress = (segment: Segment, index: number) => {
    setSpeakerToEnroll(segment);
    setEnrollmentIndex(index);
    setNewSpeakerName("");
    setNewSpeakerRole("");
    setModalVisible(true);
  };

  const saveSpeakerName = async () => {
    if (
      !conversation ||
      !speakerToEnroll ||
      !selectedFile ||
      enrollmentIndex === null
    )
      return;
    if (!newSpeakerName.trim() || !newSpeakerRole.trim()) {
      Alert.alert("Missing Info", "Please enter both Name and Role.");
      return;
    }

    setEnrollLoading(true);

    try {
      // 1. Create FormData for Enrollment
      // We send the FULL audio file again so the backend can slice it precisely using start/end times
      const formData = new FormData();

      formData.append("audio_file", {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || "audio/m4a",
      } as any);

      formData.append("name", newSpeakerName);
      formData.append("role", newSpeakerRole);
      formData.append("start_time", speakerToEnroll.start_time.toString());
      formData.append("end_time", speakerToEnroll.end_time.toString());
      formData.append("sample_text", speakerToEnroll.text);

      console.log(
        `Enrolling: ${newSpeakerName} (${newSpeakerRole}) at index ${enrollmentIndex}`,
      );

      // 2. Call Backend
      const response = await fetch("http://3.107.6.17:5002/enroll_speaker", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const json = await response.json();
      console.log("Enrollment Response:", json);

      if (response.ok) {
        // 3. Update UI ONLY for the specific index
        const updatedConversation = [...conversation];
        updatedConversation[enrollmentIndex] = {
          ...updatedConversation[enrollmentIndex],
          speaker: newSpeakerName,
          role: newSpeakerRole, // Store role in the segment for display
        };

        setConversation(updatedConversation);
        setModalVisible(false);
      } else {
        Alert.alert("Enrollment Failed", json.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error in saveSpeakerName: ", error);
      Alert.alert("Error", "Failed to connect to enrollment server.");
    } finally {
      setEnrollLoading(false);
    }
  };

  // --- Render Individual Segment ---
  const renderSegment = ({ item, index }: { item: Segment; index: number }) => {
    // Check if speaker is unknown (and hasn't been manually renamed yet)
    const isUnknown = item.speaker.toLowerCase().includes("unknown");

    return (
      <View style={styles.segmentContainer}>
        {/* Left: Time Stamp */}
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>{formatTime(item.start_time)}</Text>
          <View style={styles.timelineLine} />
        </View>

        {/* Right: Content Bubble */}
        <View
          style={[
            styles.bubble,
            isUnknown ? styles.unknownBubble : styles.knownBubble,
          ]}
        >
          <View style={styles.bubbleHeader}>
            <View>
              <Text
                style={[
                  styles.speakerName,
                  isUnknown && styles.unknownSpeakerName,
                ]}
              >
                {item.speaker}
              </Text>
              {/* Show Role if available */}
              {item.role && <Text style={styles.roleText}>{item.role}</Text>}
            </View>

            {/* Enrollment Button for Unknown Speakers */}
            {isUnknown && (
              <TouchableOpacity
                style={styles.enrollButton}
                onPress={() => handleEnrollPress(item, index)}
              >
                <Ionicons name="person-add" size={12} color="#fff" />
                <Text style={styles.enrollText}>Identify</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.transcriptText}>{item.text}</Text>

          <View style={styles.footer}>
            <Text style={styles.langTag}>{item.language}</Text>
            <Text style={styles.confidenceText}>
              Conf: {(item.confidence * 100).toFixed(0)}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* --- Header --- */}
      <View style={styles.header}>
        <Text style={styles.title}>Meeting Analyzer</Text>
        <Text style={styles.subtitle}>
          {conversation ? "Analysis Complete" : "Upload & Process"}
        </Text>
      </View>

      {/* --- Main Content --- */}
      {!conversation ? (
        // UPLOAD VIEW
        <ScrollView contentContainerStyle={styles.centerContent}>
          <View style={styles.card}>
            <TouchableOpacity onPress={pickAudio} style={styles.uploadArea}>
              <Ionicons name="mic-circle-outline" size={64} color="#4A90E2" />
              <Text style={styles.uploadText}>
                {selectedFile ? selectedFile.name : "Tap to Select Audio File"}
              </Text>
            </TouchableOpacity>

            {selectedFile && (
              <TouchableOpacity
                style={[styles.analyzeButton, loading && styles.disabledButton]}
                onPress={uploadAndAnalyze}
                disabled={loading}
              >
                {loading ? (
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.buttonText}>Processing AI...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Start Analysis</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      ) : (
        // RESULTS VIEW (Timeline)
        <View style={styles.resultsContainer}>
          <FlatList
            data={conversation}
            renderItem={renderSegment}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listContent}
          />
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setConversation(null);
              setSelectedFile(null);
            }}
          >
            <Text style={styles.resetButtonText}>Analyze Another Meeting</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- Enrollment Modal --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Identify Speaker</Text>
            <Text style={styles.modalSubtitle}>
              Who is speaking at{" "}
              {speakerToEnroll ? formatTime(speakerToEnroll.start_time) : ""}?
            </Text>

            <View style={styles.quoteBox}>
              <Text style={styles.quoteText} numberOfLines={2}>
                "{speakerToEnroll?.text}"
              </Text>
            </View>

            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Suranjit Namasudra"
              placeholderTextColor="#666"
              value={newSpeakerName}
              onChangeText={setNewSpeakerName}
            />

            <Text style={styles.inputLabel}>Role</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Research Head"
              placeholderTextColor="#666"
              value={newSpeakerRole}
              onChangeText={setNewSpeakerRole}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                disabled={enrollLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveSpeakerName}
                disabled={enrollLoading}
              >
                {enrollLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Profile</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ---------- BASE ---------- */
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  /* ---------- HEADER ---------- */
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },

  /* ---------- CENTER CONTENT ---------- */
  centerContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  resultsContainer: {
    flex: 1,
  },

  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  /* ---------- UPLOAD CARD ---------- */
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  uploadArea: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
    marginBottom: 20,
  },
  uploadText: {
    color: "#666",
    marginTop: 12,
    fontSize: 14,
  },
  analyzeButton: {
    width: "100%",
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#b0c9ec",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  /* ---------- TIMELINE ---------- */
  segmentContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  timeColumn: {
    width: 48,
    alignItems: "flex-end",
    marginRight: 10,
  },
  timeText: {
    color: "#999",
    fontSize: 12,
    fontFamily: "monospace",
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#eee",
    marginTop: 4,
    marginRight: 8,
  },

  /* ---------- SEGMENT CARD ---------- */
  bubble: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  knownBubble: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  unknownBubble: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.error,
    backgroundColor: "#fff5f5",
  },

  bubbleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  speakerName: {
    color: Colors.light.text,
    fontWeight: "600",
    fontSize: 14,
  },
  unknownSpeakerName: {
    color: Colors.light.error,
  },
  roleText: {
    color: "#777",
    fontSize: 11,
    marginTop: 2,
  },
  transcriptText: {
    color: "#444",
    fontSize: 15,
    lineHeight: 22,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 10,
  },
  langTag: {
    fontSize: 10,
    color: "#666",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 10,
    color: "#888",
  },

  /* ---------- IDENTIFY BUTTON ---------- */
  enrollButton: {
    flexDirection: "row",
    backgroundColor: Colors.light.error,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: "center",
    gap: 4,
  },
  enrollText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  /* ---------- RESET ---------- */
  resetButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 30,
    elevation: 4,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  /* ---------- MODAL ---------- */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 6,
    textAlign: "center",
  },
  modalSubtitle: {
    color: "#777",
    textAlign: "center",
    marginBottom: 16,
  },

  quoteBox: {
    backgroundColor: "#fafafa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.error,
  },
  quoteText: {
    color: "#555",
    fontStyle: "italic",
    fontSize: 12,
  },

  inputLabel: {
    color: "#666",
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fafafa",
    color: Colors.light.text,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 15,
    marginBottom: 14,
  },

  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#eee",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#555",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});


