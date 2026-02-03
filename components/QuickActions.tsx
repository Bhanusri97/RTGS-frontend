import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Activity, Briefcase, Calendar, CheckSquare, FileText, MessageSquare, Mic, Phone, UserPlus, Video } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ACTIONS = [
    { id: '1', label: 'Schedule', icon: Calendar, route: '/(tabs)/calendar' },
    { id: '2', label: 'Tasks', icon: CheckSquare, route: '/(tabs)/tasks' },
    { id: '3', label: 'Docs', icon: FileText, route: '/(tabs)/documents' },
    { id: '4', label: 'Secure Chat', icon: MessageSquare, route: '/(tabs)/chats' },
    { id: '5', label: 'Video Call', icon: Video, route: '/video-call' },
      { id: '6', label: 'Audio Call', icon: Phone, route: '/audio-call' },
    { id: '6', label: 'New Proposal', icon: Briefcase, route: '/workflow-submission' },
    { id: '7', label: 'Request Appt', icon: UserPlus, route: '/appointment-request' },
    { id: '8', label: 'Track Status', icon: Activity, route: '/status-tracking' },
    { id: '9', label: 'Record', icon: Mic, route: 'record-meeting' },
];

interface QuickActionsProps {
    onRecord?: () => void;
}

export const QuickActions = ({ onRecord }: QuickActionsProps) => {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Quick Actions</Text>
            <View style={styles.grid}>
                {ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                        <TouchableOpacity
                            key={action.id}
                            style={styles.actionItem}
                            onPress={() => {
                                if (action.route === 'record-meeting') {
                                    onRecord?.();
                                } else {
                                    router.push(action.route as any);
                                }
                            }}
                        >
                            <View style={styles.iconBox}>
                                <Icon size={24} color={Colors.light.primary} />
                            </View>
                            <Text style={styles.label}>{action.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionItem: {
        width: '23%',
        alignItems: 'center',
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    label: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        fontWeight: '500',
    },
});
