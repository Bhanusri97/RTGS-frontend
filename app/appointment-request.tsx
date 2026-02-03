import Colors from '@/constants/Colors';
import { Stack, useRouter } from 'expo-router';
import { Clock, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AppointmentRequestScreen() {
    const router = useRouter();
    const [reason, setReason] = useState('');
    const [selectedDate, setSelectedDate] = useState('Tomorrow');
    const [selectedSlot, setSelectedSlot] = useState('');

    const slots = ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];

    const handleSubmit = () => {
        if (!selectedSlot || !reason) {
            Alert.alert("Error", "Please select a time slot and enter a reason.");
            return;
        }
        Alert.alert("Request Sent", "Your appointment request has been sent to the Officer's PA for approval.", [
            { text: "Done", onPress: () => router.back() }
        ]);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Request Appointment' }} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Officer Profile Card */}
                <View style={styles.officerCard}>
                    <View style={styles.avatarPlaceholder}>
                        <User size={32} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.officerName}>Sri Venkata Rao, IAS</Text>
                        <Text style={styles.officerRole}>Joint Collector, Guntur</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Date</Text>
                    <View style={styles.dateRow}>
                        {['Today', 'Tomorrow', '22 Nov'].map((date) => (
                            <TouchableOpacity
                                key={date}
                                style={[styles.dateChip, selectedDate === date && styles.activeDateChip]}
                                onPress={() => setSelectedDate(date)}
                            >
                                <Text style={[styles.dateText, selectedDate === date && styles.activeDateText]}>{date}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Available Slots</Text>
                    <View style={styles.slotsGrid}>
                        {slots.map((slot) => (
                            <TouchableOpacity
                                key={slot}
                                style={[styles.slotChip, selectedSlot === slot && styles.activeSlotChip]}
                                onPress={() => setSelectedSlot(slot)}
                            >
                                <Clock size={14} color={selectedSlot === slot ? '#fff' : '#666'} style={{ marginRight: 6 }} />
                                <Text style={[styles.slotText, selectedSlot === slot && styles.activeSlotText]}>{slot}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.helperText}>* Slots are subject to officer's availability.</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Purpose of Visit</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Briefly explain why you want to meet..."
                        multiline
                        numberOfLines={4}
                        value={reason}
                        onChangeText={setReason}
                    />
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                    <Text style={styles.submitBtnText}>Send Request</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    content: {
        padding: 20,
    },
    officerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    officerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    officerRole: {
        fontSize: 14,
        color: '#666',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 12,
    },
    dateRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dateChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeDateChip: {
        backgroundColor: '#e3f2fd',
        borderColor: Colors.light.primary,
    },
    dateText: {
        color: '#666',
        fontWeight: '600',
    },
    activeDateText: {
        color: Colors.light.primary,
    },
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    slotChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minWidth: '45%',
        justifyContent: 'center',
    },
    activeSlotChip: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    slotText: {
        color: '#666',
        fontWeight: '600',
    },
    activeSlotText: {
        color: '#fff',
    },
    helperText: {
        fontSize: 12,
        color: '#888',
        marginTop: 8,
        fontStyle: 'italic',
    },
    textArea: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 100,
    },
    submitBtn: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
