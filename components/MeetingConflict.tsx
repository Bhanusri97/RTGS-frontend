import { AlertTriangle, X } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const MeetingConflict = ({ onResolve }: { onResolve: () => void }) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconBox}>
                <AlertTriangle size={24} color="#c62828" />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>Scheduling Conflict Detected</Text>
                <Text style={styles.message}>
                    "Review Meeting" overlaps with "District Visit".
                </Text>
                <TouchableOpacity onPress={onResolve}>
                    <Text style={styles.action}>Tap to resolve with AI</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity>
                <X size={20} color="#999" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#ffebee',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#ffcdd2',
    },
    iconBox: {
        marginRight: 12,
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#c62828',
        marginBottom: 4,
    },
    message: {
        fontSize: 12,
        color: '#b71c1c',
        marginBottom: 8,
    },
    action: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#c62828',
        textDecorationLine: 'underline',
    },
});
