import { Card } from '@/components/Card';
import { InstructionInput } from '@/components/InstructionInput';
import Colors from '@/constants/Colors';
import { taskAPI } from '@/services/api';
import { useRouter } from 'expo-router';
import { AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TasksScreen() {
    const [filter, setFilter] = useState('All');
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const data = await taskAPI.getAll();
            setTasks(data);
        } catch (error) {
            console.log('Error loading tasks:', error);
            // Optional: Fallback to mock data if needed, or show empty state
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

    const handleCreateTask = async (text: string, type: string) => {
        if (!text.trim()) {
            Alert.alert("Error", "Please enter an instruction.");
            return;
        }

        try {
            // AI Prediction
            const prediction = await taskAPI.predictDuration(text);
            const predictedDuration = prediction.predicted_duration || '1 day';

            // In a real AI flow, we would send this text to the ML service to extract title, priority, etc.
            // For now, we'll create a basic task and let the backend/ML handle it later if implemented.
            const newTask = {
                title: text.length > 30 ? text.substring(0, 30) + '...' : text,
                description: text,
                status: 'Pending',
                priority: 'Medium', // Default
                deadline: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                type: 'Task',
                estimatedDuration: predictedDuration // Add this field
            };

            await taskAPI.create(newTask);

            Alert.alert(
                "AI Processing",
                `Converting ${type} instruction to Task:\n\n"${text}"\n\nPredicted Duration: ${predictedDuration}\n\nTask created successfully!`,
                [{ text: "OK", onPress: () => loadTasks() }]
            );
        } catch (error) {
            Alert.alert("Error", "Failed to create task.");
            console.log(error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle size={16} color={Colors.light.success} />;
            case 'Pending': return <Clock size={16} color={Colors.light.warning} />;
            default: return <AlertCircle size={16} color={Colors.light.error} />;
        }
    };

    const renderTaskItem = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => router.push({ pathname: '/task-detail', params: { id: item._id || item.id } })}>
            <Card style={styles.taskCard}>
                <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>{item.title}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: item.priority === 'High' ? '#ffebee' : '#e3f2fd' }]}>
                        <Text style={[styles.priorityText, { color: item.priority === 'High' ? '#c62828' : '#1565c0' }]}>
                            {item.priority}
                        </Text>
                    </View>
                </View>
                <Text style={styles.taskDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.taskFooter}>
                    <View style={styles.metaItem}>
                        {getStatusIcon(item.status)}
                        <Text style={styles.metaText}>{item.status}</Text>
                    </View>
                    <Text style={styles.metaText}>Due: {new Date(item.deadline).toLocaleDateString()}</Text>
                </View>
            </Card>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Tasks</Text>
                <TouchableOpacity style={styles.filterButton}>
                    <Filter size={20} color={Colors.light.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <InstructionInput onSend={handleCreateTask} />

                <View style={styles.tabs}>
                    {['All', 'Pending', 'Completed'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, filter === tab && styles.activeTab]}
                            onPress={() => setFilter(tab)}
                        >
                            <Text style={[styles.tabText, filter === tab && styles.activeTabText]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredTasks}
                    renderItem={renderTaskItem}
                    keyExtractor={item => item._id || item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No tasks found. Create one above!</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.light.background,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    filterButton: {
        padding: 8,
    },
    content: {
        paddingHorizontal: 16,
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
    },
    activeTab: {
        backgroundColor: Colors.light.primary,
    },
    tabText: {
        color: '#666',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#fff',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
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
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        color: '#888',
        marginLeft: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
    },
});
