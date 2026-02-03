import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Colors from "@/constants/Colors";
import { documentAPI } from "@/services/api";

interface QueryModalProps {
  visible: boolean;
  jobId: string | null;
  onClose: () => void;
}

export default function QueryModal({ visible, jobId, onClose }: QueryModalProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const submitQuery = async () => {
    if (!jobId) return;
    if (!question.trim()) {
      return alert("Please enter a question.");
    }

    try {
      setLoading(true);
      const data = await documentAPI.submitQuery(jobId, question.trim());
      setAnswer(data.answer || "No answer returned");
    } catch (err) {
      alert("Failed to get answer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Ask a Question</Text>

            <TextInput
              placeholder="Type your question..."
              value={question}
              onChangeText={setQuestion}
              style={styles.input}
              multiline
            />

            {loading && (
              <ActivityIndicator
                color={Colors.light.primary}
                size="small"
                style={{ marginTop: 12 }}
              />
            )}

            {answer ? <Text style={styles.answer}>{answer}</Text> : null}
          </ScrollView>

          {/* Fixed action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.close]}
              onPress={() => {
                setQuestion("");
                setAnswer("");
                onClose();
              }}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={submitQuery}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Submitting..." : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 16,
  },
  container: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "85%",   
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: Colors.light.text,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
  answer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    marginTop: 12,
  },
  button: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  close: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
