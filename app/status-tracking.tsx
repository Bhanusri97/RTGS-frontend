import { Card } from '@/components/Card';
import Colors from '@/constants/Colors';
import { Stack } from 'expo-router';
import { Calendar, CheckCircle, FileText } from 'lucide-react-native';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

const REQUESTS = [
    {
        id: '1',
        type: 'Appointment',
        title: 'Meeting with Joint Collector',
        date: 'Today, 4 PM',
        status: 'Approved',
        icon: Calendar,
    },
    {
        id: '2',
        type: 'Workflow',
        title: 'AI Waste Management Proposal',
        date: 'Submitted on 18 Nov',
        status: 'Under Review',
        icon: FileText,
    },
    {
        id: '3',
        type: 'Grievance',
        title: 'Land Mutation Issue',
        date: 'Submitted on 15 Nov',
        status: 'Resolved',
        icon: CheckCircle,
    },
];

export default function StatusTrackingScreen() {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return Colors.light.success;
            case 'Resolved': return Colors.light.success;
            case 'Under Review': return Colors.light.warning;
            default: return '#666';
        }
    };

    const renderItem = ({ item }: { item: typeof REQUESTS[0] }) => {
        const Icon = item.icon;
        return (
            <Card style={styles.card}>
                <View style={styles.row}>
                    <View style={styles.iconBox}>
                        <Icon size={24} color={Colors.light.primary} />
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.type}>{item.type}</Text>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.date}>{item.date}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Track Status' }} />
            <FlatList
                data={REQUESTS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    listContent: {
        padding: 20,
    },
    card: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    type: {
        fontSize: 12,
        color: '#666',
        textTransform: 'uppercase',
        fontWeight: '600',
        marginBottom: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#888',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});
