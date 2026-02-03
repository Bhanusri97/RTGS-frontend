import Colors from '@/constants/Colors';
import { Calendar, FileText, MessageSquare } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ACTIVITIES = [
    { id: '1', type: 'instruction', text: 'Minister sent new instruction: "Review pending infrastructure projects"', time: '5 min ago', icon: MessageSquare, color: Colors.light.primary },
    { id: '2', type: 'document', text: 'Document analysis complete: "Drought Management Report"', time: '15 min ago', icon: FileText, color: Colors.light.success },
    { id: '3', type: 'meeting', text: 'Meeting rescheduled by AI: "Transport meeting moved to avoid conflict"', time: '1 hour ago', icon: Calendar, color: Colors.light.warning },
];

export const ActivityFeed = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Recent Activity</Text>
            <View style={styles.list}>
                {ACTIVITIES.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <View key={item.id} style={styles.item}>
                            <View style={styles.timeline}>
                                <View style={[styles.dot, { backgroundColor: item.color }]} />
                                {index !== ACTIVITIES.length - 1 && <View style={styles.line} />}
                            </View>
                            <View style={styles.content}>
                                <View style={styles.header}>
                                    <Icon size={14} color={item.color} style={styles.icon} />
                                    <Text style={styles.time}>{item.time}</Text>
                                </View>
                                <Text style={styles.text}>{item.text}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 16,
    },
    list: {
        paddingLeft: 8,
    },
    item: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    timeline: {
        alignItems: 'center',
        marginRight: 12,
        width: 16,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 4,
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: '#f0f0f0',
        marginTop: 4,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    icon: {
        marginRight: 6,
    },
    time: {
        fontSize: 12,
        color: '#888',
    },
    text: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
});
