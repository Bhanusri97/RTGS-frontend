import Colors from "@/constants/Colors";
import { Stack, useRouter } from "expo-router";
import { CheckCircle, FileText, ScanLine, Upload } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { documentAPI } from "@/services/api";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DocumentUploadScreen() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const handleUpload = async () => {
    try {
      const userid = await AsyncStorage.getItem("userId");
      if (!userid) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const selectedFile = result.assets[0];
      const formData = new FormData();

      if (Platform.OS === "web") {
        const response = await fetch(selectedFile.uri);
        const blob = await response.blob();

        const file = new File([blob], selectedFile.name || "document.pdf", {
          type: selectedFile.mimeType || "application/pdf",
        });

        formData.append("file", file);
        formData.append("userid", userid);
      } else {
        formData.append("file", {
          uri: selectedFile.uri,
          name: selectedFile.name || "document.pdf",
          type: selectedFile.mimeType || "application/pdf",
        } as any);

        formData.append("userid", userid);
      }

      setUploading(true);
      setAnalyzing(true);

      const url =
        "https://u454afmq1g.execute-api.ap-south-1.amazonaws.com/dev/PdfProcessing";

      let uploadResp: any;

      if (Platform.OS === "web") {
        const axiosResp = await axios.post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          timeout: 60000,
        });

        uploadResp = axiosResp.data;
      } else {
        const response = await fetch(url, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        uploadResp = await response.json();
      }

      console.log("Upload response:", uploadResp);

      const returnedJobId = uploadResp?.jobId || uploadResp?.data?.jobId;
      console.log(returnedJobId, "returnedJobId????????????????")

      if (!returnedJobId) {
        Alert.alert("Upload Failed", "No jobId returned from server");
        setUploading(false);
        setAnalyzing(false);
        return;
      }

      setJobId(returnedJobId);
      setUploading(false);
      setAnalyzing(false);

      if (Platform.OS === "web") {
        window.alert(
          uploadResp?.message || "Document uploaded and processing started",
        );

        router.replace({
          pathname: "/(tabs)/documents",
          params: { jobId: returnedJobId },
        });
      } else {
        Alert.alert(
          "Upload Successful",
          uploadResp?.message || "Document uploaded and processing started",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace({
                  pathname: "/(tabs)/documents",
                  params: { jobId: returnedJobId },
                });
              },
            },
          ],
        );
      }
    } catch (error: any) {
      console.log("Upload error:", error?.response?.data || error);
      Alert.alert("Upload Failed", "Something went wrong");
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: "Upload Document", presentation: "modal" }}
      />

      <View style={styles.content}>
        <View style={styles.uploadBox}>
          <View style={styles.iconCircle}>
            <Upload size={40} color={Colors.light.primary} />
          </View>
          <Text style={styles.uploadTitle}>Upload Government Order / Memo</Text>
          <Text style={styles.uploadSubtitle}>
            Supported formats: PDF, JPG, PNG
          </Text>

          <TouchableOpacity
            style={[
              styles.browseButton,
              (uploading || analyzing) && { opacity: 0.7 },
            ]}
            onPress={handleUpload}
            disabled={uploading || analyzing}
          >
            {uploading ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.browseText}>Uploading...</Text>
              </View>
            ) : (
              <Text style={styles.browseText}>Upload File</Text>
            )}
          </TouchableOpacity>
        </View>
        {analyzing && (
          <View style={styles.statusContainer}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>AI Analyzing Document...</Text>
              <ActivityIndicator size="small" color={Colors.light.primary} />
            </View>

            <View style={styles.aiSteps}>
              <View style={styles.step}>
                <CheckCircle size={16} color={Colors.light.success} />
                <Text style={styles.stepText}>Text Extraction (OCR)</Text>
              </View>
              <View style={styles.step}>
                <ScanLine size={16} color={Colors.light.primary} />
                <Text style={styles.stepText}>Entity Recognition</Text>
              </View>
              <View style={styles.step}>
                <FileText size={16} color="#666" />
                <Text style={styles.stepText}>Summarization</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Why upload here?</Text>
          <Text style={styles.infoText}>
            • AI automatically extracts deadlines and action items.{"\n"}•
            Documents are tagged by department and location.{"\n"}• Securely
            encrypted and stored in the government cloud.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  uploadBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: "center",
  },
  uploadSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  browseText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  statusContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
  },
  aiSteps: {
    gap: 8,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepText: {
    fontSize: 14,
    color: "#555",
  },
  infoBox: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
});
