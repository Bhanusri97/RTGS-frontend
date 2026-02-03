import Colors from "@/constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FileText, Search, Upload } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
  const { jobId } = useLocalSearchParams<{
    jobId: string;
  }>();
  console.log(jobId, "job id in the documents is??????");
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  console.log(documents, "get doc response")

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const userId = await AsyncStorage.getItem("userId");
        const response = await axios.post(
          `https://u454afmq1g.execute-api.ap-south-1.amazonaws.com/dev/getUserDocuments?userId=${userId}`,
        );
        console.log(response.data.documents, "docs=========");
        setDocuments(response.data.documents || []);
      } catch (error) {
        console.log("Fetch documents error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

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
      <View style={styles.searchBar}>
        <Search size={18} color="#999" />
        <TextInput
          placeholder="Search documents..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* TABLE */}
      <View style={styles.tableContainer}>
        {/* TABLE HEADER */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 3 }]}>Document Name</Text>
          <Text style={[styles.headerCell, { flex: 1, textAlign: "center" }]}>
            View
          </Text>
        </View>

        {/* TABLE BODY */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Loading documents...</Text>
          </View>
        ) : (
          <FlatList
            data={documents.filter((doc) =>
              doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase()),
            )}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <View style={styles.nameCell}>
                  <FileText size={18} color={Colors.light.primary} />
                  <Text style={styles.rowText} numberOfLines={1}>
                    {item.fileName}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/document-detail",
                      params: {
                        id: item._id,
                        title: item.fileName,
                        status: item.status
                      },
                    })
                  }
                >
                  <Text style={styles.viewText}>View</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No documents found</Text>
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
            contentInsetAdjustmentBehavior="automatic"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContent: {
    paddingBottom: 60,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },

  uploadBtn: {
    flexDirection: "row",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: "center",
  },
  uploadText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 20,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },

  tableContainer: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
  },

  tableHeader: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#f5f7fa",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  headerCell: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  nameCell: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center",
  },

  rowText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },

  viewBtn: {
    flex: 1,
    alignItems: "center",
  },

  viewText: {
    color: Colors.light.primary,
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    padding: 20,
    color: "#666",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
});
