import Colors from "@/constants/Colors";
import { Stack, useLocalSearchParams } from "expo-router";
import { FileText, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { documentAPI } from "@/services/api";
import { stat } from "fs";
import QueryModal from "./(modal)/queryModal";

type ListType = "to_list" | "copy_to_list" | null;

export default function DocumentDetailScreen() {
  const { id, title, status } = useLocalSearchParams<{
    id: string;
    title?: string;
    status?: string;
  }>();

  const jobId = id;
  console.log(jobId, "jobId is????")
  console.log(status, "status is????")

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(status || "");
  const [docData, setDocData] = useState<any>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [activeList, setActiveList] = useState<ListType>(null);
  const [queryModalVisible, setQueryModalVisible] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, [jobId]);

  const fetchStatus = async () => {
    if (!jobId) return;

    try {
      setLoading(true);

      const res = await documentAPI.checkStatus(jobId);
      console.log("STATUS RESPONSE:", res);

      setStatusMessage(res.status);

      if (res.status === "COMPLETED" && res.data) {
        setDocData(res.data);
      }
    } catch (err) {
      setStatusMessage("Error fetching status");
    } finally {
      setLoading(false);
    }
  };


  const openListModal = (type: ListType) => {
    setActiveList(type);
    setModalVisible(true);
  };

  const listData =
    activeList === "to_list"
      ? docData?.distribution?.to_list
      : docData?.distribution?.copy_to_list;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Document Detail" }} />

      {/* ICON */}
      <View style={styles.headerBox}>
        <View style={styles.iconBox}>
          <FileText size={36} color={Colors.light.primary} />
        </View>

        <Text style={styles.headerTitle} numberOfLines={2} ellipsizeMode="tail">
          {title || "Document Status"}
        </Text>
      </View>

      {/* GET STATUS BUTTON */}
      {!docData && statusMessage !== "COMPLETED" && !loading && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => fetchStatus()}
        >
          <Text style={styles.primaryText}>Get Status</Text>
        </TouchableOpacity>
      )}

      {/* LOADING INDICATOR */}
      {loading && !docData && (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.statusMessage}>Fetching document details...</Text>
        </View>
      )}

      {/* STATUS */}
      {statusMessage !== "" && !loading && !docData && (
        <Text style={styles.statusMessage}>{statusMessage}</Text>
      )}

      {/* COMPLETED CONTENT */}
      {docData && (
        <View style={styles.card}>
          <Text style={styles.docTitle}>{docData.title_of_doc}</Text>
          <Text style={styles.docSummary}>{docData.summary_doc}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => openListModal("to_list")}
            >
              <Text style={styles.secondaryText}>To List</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => openListModal("copy_to_list")}
            >
              <Text style={styles.secondaryText}>Copy To List</Text>
            </TouchableOpacity>
          </View>

          {/* ASK QUESTION BUTTON */}
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 16 }]}
            onPress={() => setQueryModalVisible(true)}
          >
            <Text style={styles.primaryText}>Ask a Question</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {activeList === "to_list" ? "To List" : "Copy To List"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {listData?.map((item: any, index: number) => (
              <View key={index} style={styles.listCard}>
                <Text style={styles.listName}>{item.name_or_designation}</Text>
                <Text style={styles.listDept}>{item.department}</Text>
                <Text style={styles.listLocation}>{item.location}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* QUERY MODAL */}
      <QueryModal
        visible={queryModalVisible}
        jobId={jobId}
        onClose={() => setQueryModalVisible(false)}
      />
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.light.background,
  },

  iconBox: {
    alignSelf: "center",
    backgroundColor: "#e3f2fd",
    width: 72,
    height: 72,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  statusMessage: {
    textAlign: "center",
    marginTop: 10,
    color: "#555",
  },

  card: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
  },

  docTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: Colors.light.text,
  },

  docSummary: {
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
    marginBottom: 16,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },

  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  secondaryText: {
    fontWeight: "600",
    color: Colors.light.primary,
  },

  /* MODAL */
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },

  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  modalContent: {
    padding: 16,
  },

  listCard: {
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  listName: {
    fontWeight: "700",
    marginBottom: 4,
  },
  listDept: {
    color: "#555",
  },
  listLocation: {
    color: "#777",
    fontSize: 13,
  },
  headerBox: {
    alignItems: "center",
    marginBottom: 20,
  },

  headerTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    color: Colors.light.text,
    paddingHorizontal: 10,
  },
});
