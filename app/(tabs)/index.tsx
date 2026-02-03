import { ActivityFeed } from '@/components/ActivityFeed';
import { AIAssistant } from '@/components/AIAssistant';
import { Card } from '@/components/Card';
import { QuickActions } from '@/components/QuickActions';
import Colors from '@/constants/Colors';
import { DOCUMENTS, MEETINGS, OFFICER_PROFILE, TASKS } from '@/services/mockData';
import { useRouter } from 'expo-router';
import { Bell, Calendar, CheckSquare, FileText, MessageSquare } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Modal, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const [fabVisible, setFabVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [recorderVisible, setRecorderVisible] = useState(false);
  const [aiWidgetY, setAiWidgetY] = useState(0);

  const pendingTasks = TASKS.filter(t => t.status === 'Pending').length;
  const todayMeetings = MEETINGS.length;
  const urgentDocs = DOCUMENTS.filter(d => d.status === 'Action Required').length;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    // Show FAB if scrolled past the AI widget (approx 200px down)
    if (scrollY > 250 && !fabVisible) {
      setFabVisible(true);
    } else if (scrollY <= 250 && fabVisible) {
      setFabVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.profileSection} onPress={() => router.push('/profile')}>
            <Image source={OFFICER_PROFILE.avatar} style={styles.avatar} />
            <View>
              <Text style={styles.greeting}>Good Morning,</Text>
              <Text style={styles.name}>{OFFICER_PROFILE.name}</Text>
              <Text style={styles.designation}>{OFFICER_PROFILE.designation}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color={Colors.light.text} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>

        {/* AI Assistant Widget */}
        <View onLayout={(event) => setAiWidgetY(event.nativeEvent.layout.y)}>
          <AIAssistant onPress={() => setModalVisible(true)} />
        </View>

        {/* Daily Summary */}
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsRow}>
          <Card style={styles.statCard} variant="outlined">
            <CheckSquare size={24} color={Colors.light.primary} />
            <Text style={styles.statValue}>{pendingTasks}</Text>
            <Text style={styles.statLabel}>Pending Tasks</Text>
          </Card>
          <Card style={styles.statCard} variant="outlined">
            <Calendar size={24} color={Colors.light.secondary} />
            <Text style={styles.statValue}>{todayMeetings}</Text>
            <Text style={styles.statLabel}>Meetings</Text>
          </Card>
          <Card style={styles.statCard} variant="outlined">
            <FileText size={24} color={Colors.light.warning} />
            <Text style={styles.statValue}>{urgentDocs}</Text>
            <Text style={styles.statLabel}>Urgent Docs</Text>
          </Card>
        </View>

        {/* Quick Actions */}
      <QuickActions onRecord={() => router.push("/(modal)/MeetingAnalyzer")} />


        {/* Activity Feed */}
        <ActivityFeed />

        {/* Priority Tasks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Priority Tasks</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {TASKS.slice(0, 2).map((task) => (
          <TouchableOpacity key={task.id} onPress={() => router.push({ pathname: '/task-detail', params: { id: task.id } })}>
            <Card style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: task.priority === 'High' ? '#ffebee' : '#e3f2fd' }]}>
                  <Text style={[styles.priorityText, { color: task.priority === 'High' ? '#c62828' : '#1565c0' }]}>
                    {task.priority}
                  </Text>
                </View>
              </View>
              <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>
              <View style={styles.taskFooter}>
                <Text style={styles.taskMeta}>📍 {task.location}</Text>
                <Text style={styles.taskMeta}>⏰ {task.deadline}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* Floating AI Button */}
      {fabVisible && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <MessageSquare size={24} color="#fff" />
          <View style={styles.fabBadge} />
        </TouchableOpacity>
      )}

      {/* AI Assistant Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AIAssistant
              variant="modal"
              onClose={() => setModalVisible(false)}
              style={{ flex: 1, marginBottom: 0, borderRadius: 0 }}
            />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Add padding for FAB
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  designation: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.error,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  taskCard: {
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  taskDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskMeta: {
    fontSize: 12,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.accent,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
});
