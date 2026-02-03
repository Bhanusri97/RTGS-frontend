import { Card } from "@/components/Card";
import Colors from "@/constants/Colors";
import QueryModal from "@/app/(modal)/queryModal";
import { documentAPI } from "@/services/api";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  FileText,
  Filter,
  MoreVertical,
  Search,
  Upload,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DocumentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ jobId?: string }>();

  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [jobId] = useState<string | null>(params.jobId || null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  console.log(documents, "documents response==========??");

  const fetchStatus = async () => {
    if (!jobId) return;

    try {
      setStatusLoading(true);
      const data = await documentAPI.checkStatus(jobId);
      console.log(data, "===============");
      setSummary(data.data);

      setStatusMessage(data.message || data.status || "");
      setIsCompleted(data.status?.toLowerCase() === "completed");
    } catch (err) {
      console.log("Status error:", err);
      setStatusMessage("Error fetching status");
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const userid = await AsyncStorage.getItem("userId");
        const response = await axios.post(
          `https://u454afmq1g.execute-api.ap-south-1.amazonaws.com/dev/getUserDocuments?userId=${userid}`,
        );
        // console.log("All documents", response);
        setDocuments(response.data.documents)
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchDocuments();
  },[]);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Documents</Text>

        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => router.push("/document-upload")}
        >
          <Upload size={18} color="#fff" />
          <Text style={styles.uploadText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {documents.length === 0 ? (
        /* EMPTY STATE */
        <View style={styles.emptyContainer}>
          {!jobId && (
            <Text style={styles.emptyText}>
              No documents uploaded yet. Upload your first document to get
              started!
            </Text>
          )}

          {jobId && (
            <View style={styles.statusContainer}>
              {statusLoading ? (
                <ActivityIndicator color={Colors.light.primary} size="small" />
              ) : isCompleted && summary ? (
                <>
                  {/* SCROLLABLE CONTENT */}
                  <ScrollView
                    style={styles.completedScroll}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator
                  >
                    <Text style={styles.docTitleCompleted}>
                      {summary.title_of_doc}
                    </Text>

                    {summary.subtitle_of_doc && (
                      <Text style={styles.docSubtitle}>
                        {summary.subtitle_of_doc}
                      </Text>
                    )}

                    <Text style={styles.docSummary}>{summary.summary_doc}</Text>

                    {summary.information && summary.information.length > 0 && (
                      <View style={styles.infoList}>
                        {summary.information.map((info: any, index: number) => (
                          <Text key={index} style={styles.infoItem}>
                            • {info.summary || info.text || info}
                          </Text>
                        ))}
                      </View>
                    )}
                  </ScrollView>

                  {/* ASK QUESTION — ONLY AFTER COMPLETION */}
                  <TouchableOpacity
                    style={[styles.statusButton, { marginTop: 16 }]}
                    onPress={() => setModalVisible(true)}
                  >
                    <Text style={styles.statusText}>Ask a Question</Text>
                  </TouchableOpacity>
                </>
              ) : (
                /* BEFORE COMPLETION */
                <TouchableOpacity
                  style={styles.statusButton}
                  onPress={fetchStatus}
                >
                  <Text style={styles.statusText}>Check Status</Text>
                </TouchableOpacity>
              )}

              {statusMessage.length > 0 && (
                <Text style={styles.statusMessage}>{statusMessage}</Text>
              )}
            </View>
          )}
        </View>
      ) : (
        /* DOCUMENT LIST */
        <FlatList
          data={documents.filter(
            (doc) =>
              doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              doc.type?.toLowerCase().includes(searchQuery.toLowerCase()),
          )}
          keyExtractor={(item, index) =>
            item._id?.toString() || item.id?.toString() || index.toString()
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/document-detail",
                  params: { id: item._id || item.id },
                })
              }
            >
              <Card style={styles.docCard}>
                <View style={styles.docIcon}>
                  <FileText size={24} color="#007bff" />
                </View>

                <View style={styles.docInfo}>
                  <Text style={styles.docTitle}>{item.title}</Text>

                  <View style={styles.metaRow}>
                    <Text style={styles.docMeta}>{item.type}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.docMeta}>{item.size || "2MB"}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.docMeta}>
                      {new Date(item.date || Date.now()).toLocaleDateString()}
                    </Text>
                  </View>

                  {item.summary && (
                    <View style={styles.summaryContainer}>
                      <Text style={styles.summaryLabel}>AI Summary:</Text>
                      <Text style={styles.summaryText} numberOfLines={2}>
                        {item.summary}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity style={styles.moreBtn}>
                  <MoreVertical size={20} color="#999" />
                </TouchableOpacity>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      {jobId && (
        <QueryModal
          visible={modalVisible}
          jobId={jobId}
          onClose={() => setModalVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 24, fontWeight: "700" },

  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  uploadText: { color: "#fff", fontWeight: "600", marginLeft: 6 },

  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },

  listContent: { paddingHorizontal: 20, paddingBottom: 120 },

  docCard: {
    flexDirection: "row",
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  docIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },

  metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  docMeta: { fontSize: 12, color: "#666" },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    marginHorizontal: 6,
  },

  summaryContainer: { backgroundColor: "#f5f5f5", padding: 8, borderRadius: 8 },
  summaryLabel: { fontSize: 11, fontWeight: "700" },
  summaryText: { fontSize: 13, lineHeight: 18 },

  moreBtn: { padding: 4 },

  statusContainer: { alignItems: "center" },
  statusButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  statusText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  statusMessage: { marginTop: 6, fontSize: 14 },
  completedContainer: { marginTop: 20, width: "100%" },
  docTitleCompleted: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: Colors.light.text,
  },
  docSubtitle: { fontSize: 14, color: "#666", marginBottom: 12 },
  docSummary: { fontSize: 15, lineHeight: 20, marginBottom: 12 },
  infoList: { marginBottom: 16 },
  infoItem: { fontSize: 14, lineHeight: 20, color: "#444", marginBottom: 4 },
  completedScroll: {
    flex: 1,
    width: "100%",
  },
});
