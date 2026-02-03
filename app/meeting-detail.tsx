import Colors from '@/constants/Colors';
import { MEETINGS } from '@/services/mockData';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Clock, Edit2, MapPin, Phone, Video, X } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MeetingDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const meeting = MEETINGS.find(m => m.id === id) || MEETINGS[0]; // Fallback for demo

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <X size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Meeting Details</Text>
                <TouchableOpacity style={styles.editButton}>
                    <Edit2 size={20} color={Colors.light.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>{meeting.title}</Text>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Calendar size={18} color="#666" style={styles.metaIcon} />
                        <Text style={styles.metaText}>Today</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Clock size={18} color="#666" style={styles.metaIcon} />
                        <Text style={styles.metaText}>{meeting.time}</Text>
                    </View>
                </View>

                <View style={styles.locationBox}>
                    <MapPin size={20} color={Colors.light.primary} />
                    <Text style={styles.locationText}>{meeting.location}</Text>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.light.primary }]}>
                        <Video size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.actionBtnText}>Join Video Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#e3f2fd' }]}>
                        <Phone size={20} color={Colors.light.primary} style={{ marginRight: 8 }} />
                        <Text style={[styles.actionBtnText, { color: Colors.light.primary }]}>Call Organizer</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Agenda</Text>
                    <Text style={styles.agendaText}>
                        1. Review of Q3 performance metrics.{'\n'}
                        2. Discussion on upcoming infrastructure projects.{'\n'}
                        3. Budget allocation for next fiscal year.{'\n'}
                        4. Open floor for department heads.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Attendees ({meeting.participants.length})</Text>
                    {meeting.participants.map((participant, index) => (
                        <View key={index} style={styles.attendeeRow}>
                            <View style={styles.attendeeAvatar}>
                                <Text style={styles.avatarText}>{participant.charAt(0)}</Text>
                            </View>
                            <Text style={styles.attendeeName}>{participant}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.aiSection}>
                    <Text style={styles.aiTitle}>✨ AI Insight</Text>
                    <Text style={styles.aiText}>
                        This meeting is critical for the upcoming budget approval. Ensure you have the Q3 report handy.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    editButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    },
    metaIcon: {
        marginRight: 8,
    },
    metaText: {
        fontSize: 16,
        color: '#666',
    },
    locationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
    },
    locationText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
    },
    actionButtons: {
        flexDirection: 'row',
        marginBottom: 32,
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
    },
    actionBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 12,
    },
    agendaText: {
        fontSize: 15,
        color: '#444',
        lineHeight: 24,
    },
    attendeeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    attendeeAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
    },
    attendeeName: {
        fontSize: 16,
        color: '#333',
    },
    aiSection: {
        backgroundColor: '#e8f5e9',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#c8e6c9',
    },
    aiTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 4,
    },
    aiText: {
        fontSize: 14,
        color: '#1b5e20',
        lineHeight: 20,
    },
});
