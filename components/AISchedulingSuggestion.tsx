import Colors from '@/constants/Colors';
import { Clock, Sparkles } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const AISchedulingSuggestion = ({ suggestions }: { suggestions?: any[] }) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Sparkles size={16} color={Colors.light.primary} style={{ marginRight: 8 }} />
                <Text style={styles.title}>AI Suggested Slots</Text>
            </View>
            <Text style={styles.subtitle}>Based on attendee availability:</Text>

            <View style={styles.slots}>
                {suggestions.map((slot, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.slot, index > 0 && styles.secondarySlot]}
                    >
                        {index === 0 && <Clock size={14} color="#fff" style={{ marginRight: 6 }} />}
                        <Text style={[styles.slotText, index > 0 && styles.secondaryText]}>
                            {slot.date}, {slot.time}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#e3f2fd',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#bbdefb',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.light.primary,
    },
    subtitle: {
        fontSize: 12,
        color: '#555',
        marginBottom: 12,
    },
    slots: {
        flexDirection: 'row',
        gap: 8,
    },
    slot: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    secondarySlot: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: Colors.light.primary,
    },
    slotText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    secondaryText: {
        color: Colors.light.primary,
    },
});
