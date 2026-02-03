import { Card } from '@/components/Card';
import Colors from '@/constants/Colors';
import { taskAPI } from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Check, FileText, MessageSquare, MoreVertical, Share2, ThumbsUp, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TaskDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [subtasks, setSubtasks] = useState<any[]>([]);

    useEffect(() => {
        loadTaskDetails();
    }, [id]);

    const loadTaskDetails = async () => {
        try {
            const data = await taskAPI.getById(id as string);
            setTask(data);
            // If subtasks are not in the DB model yet, we can mock them or use what's available
            setSubtasks(data.subtasks || [
                { id: '1', title: 'Review initial draft', completed: true },
                { id: '2', title: 'Approve budget allocation', completed: false },
                { id: '3', title: 'Sign final order', completed: false },
            ]);
        } catch (error) {
            console.log('Error loading task details:', error);
            Alert.alert("Error", "Failed to load task details.");
        } finally {
            setLoading(false);
        }
    };

    const toggleSubtask = (subtaskId: string) => {
        setSubtasks(subtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        ));
    };

    const handleApprove = async () => {
        try {
            await taskAPI.update(id as string, { status: 'Completed' });
            setTask({ ...task, status: 'Completed' });
            Alert.alert("Success", "Task marked as completed.");
        } catch (error) {
            Alert.alert("Error", "Failed to update task.");
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!task) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={Colors.light.text} />
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <Text>Task not found.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Share2 size={20} color={Colors.light.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <MoreVertical size={20} color={Colors.light.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.titleSection}>
                    <View style={[styles.statusBadge, { backgroundColor: task.status === 'Completed' ? '#e8f5e9' : '#fff3e0' }]}>
                        <Text style={[styles.statusText, { color: task.status === 'Completed' ? '#2e7d32' : '#ef6c00' }]}>
                            {task.status}
                        </Text>
                    </View>
                    <Text style={styles.title}>{task.title}</Text>
                    <Text style={styles.description}>{task.description}</Text>
                </View>

                <View style={styles.metaGrid}>
                    <View style={styles.metaItem}>
                        <Calendar size={16} color="#666" />
                        <Text style={styles.metaLabel}>Due Date</Text>
                        <Text style={styles.metaValue}>{new Date(task.deadline).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <User size={16} color="#666" />
                        <Text style={styles.metaLabel}>Assignee</Text>
                        <Text style={styles.metaValue}>{task.assignedTo || 'Me'}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <FileText size={16} color="#666" />
                        <Text style={styles.metaLabel}>Priority</Text>
                        <Text style={[styles.metaValue, { color: task.priority === 'High' ? '#c62828' : '#666' }]}>
                            {task.priority}
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Subtasks</Text>
                <Card style={styles.subtasksCard}>
                    {subtasks.map((st) => (
                        <TouchableOpacity key={st.id} style={styles.subtaskItem} onPress={() => toggleSubtask(st.id)}>
                            <View style={[styles.checkbox, st.completed && styles.checkedBox]}>
                                {st.completed && <Check size={12} color="#fff" />}
                            </View>
                            <Text style={[styles.subtaskText, st.completed && styles.completedText]}>{st.title}</Text>
                        </TouchableOpacity>
                    ))}
                </Card>

                <Text style={styles.sectionTitle}>AI Analysis</Text>
                <Card style={styles.aiCard}>
                    <View style={styles.aiHeader}>
                        <MessageSquare size={16} color={Colors.light.secondary} />
                        <Text style={styles.aiTitle}>AI Insight</Text>
                    </View>
                    <Text style={styles.aiText}>
                        This task appears to be related to the recent flood relief operations.
                        Suggested action: Review the attached PDF report before approving.
                    </Text>
                </Card>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Delegate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={handleApprove}>
                    <ThumbsUp size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.primaryButtonText}>Approve & Complete</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    backButton: {
        padding: 8,
    },
    headerActions: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: 8,
        marginLeft: 8,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    titleSection: {
        marginBottom: 24,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    metaGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 12,
    },
    metaItem: {
        alignItems: 'center',
    },
    metaLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
        marginBottom: 2,
    },
    metaValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 12,
    },
    subtasksCard: {
        padding: 0,
        marginBottom: 24,
        overflow: 'hidden',
    },
    subtaskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#ddd',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkedBox: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    subtaskText: {
        fontSize: 16,
        color: Colors.light.text,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    aiCard: {
        backgroundColor: '#e3f2fd',
        borderWidth: 1,
        borderColor: '#bbdefb',
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    aiTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.light.secondary,
        marginLeft: 8,
    },
    aiText: {
        fontSize: 14,
        color: '#0d47a1',
        lineHeight: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        flexDirection: 'row',
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    primaryButton: {
        flex: 2,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.light.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});
