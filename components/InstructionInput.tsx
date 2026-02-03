import Colors from '@/constants/Colors';
import { MessageCircle, Mic, Paperclip, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const InstructionInput = ({ onSend }: { onSend: (text: string, type: 'text' | 'voice' | 'whatsapp') => void }) => {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<'text' | 'voice' | 'whatsapp'>('text');

    return (
        <View style={styles.container}>
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, mode === 'text' && styles.activeTab]}
                    onPress={() => setMode('text')}
                >
                    <Text style={[styles.tabText, mode === 'text' && styles.activeTabText]}>Text</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, mode === 'voice' && styles.activeTab]}
                    onPress={() => setMode('voice')}
                >
                    <Mic size={14} color={mode === 'voice' ? Colors.light.primary : '#666'} style={{ marginRight: 4 }} />
                    <Text style={[styles.tabText, mode === 'voice' && styles.activeTabText]}>Voice</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, mode === 'whatsapp' && styles.activeTab]}
                    onPress={() => setMode('whatsapp')}
                >
                    <MessageCircle size={14} color={mode === 'whatsapp' ? '#25D366' : '#666'} style={{ marginRight: 4 }} />
                    <Text style={[styles.tabText, mode === 'whatsapp' && styles.activeTabText]}>WhatsApp</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.inputArea}>
                {mode === 'voice' ? (
                    <View style={styles.voiceContainer}>
                        <View style={styles.waveform}>
                            {/* Mock Waveform */}
                            {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                                <View key={i} style={[styles.bar, { height: h * 4 }]} />
                            ))}
                        </View>
                        <Text style={styles.recordingText}>Listening...</Text>
                    </View>
                ) : (
                    <TextInput
                        style={styles.input}
                        placeholder={mode === 'whatsapp' ? "Paste WhatsApp instruction..." : "Type instruction..."}
                        multiline
                        value={input}
                        onChangeText={setInput}
                    />
                )}

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.attachBtn}>
                        <Paperclip size={20} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.sendBtn}
                        onPress={() => {
                            onSend(input, mode);
                            setInput('');
                        }}
                    >
                        <Send size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: Colors.light.primary,
    },
    tabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: Colors.light.primary,
        fontWeight: 'bold',
    },
    inputArea: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
    },
    input: {
        minHeight: 80,
        textAlignVertical: 'top',
        fontSize: 16,
        color: '#333',
    },
    voiceContainer: {
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    waveform: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 30,
        marginBottom: 8,
        gap: 4,
    },
    bar: {
        width: 4,
        backgroundColor: Colors.light.primary,
        borderRadius: 2,
    },
    recordingText: {
        color: Colors.light.primary,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 8,
    },
    attachBtn: {
        padding: 8,
        marginRight: 8,
    },
    sendBtn: {
        backgroundColor: Colors.light.primary,
        padding: 10,
        borderRadius: 20,
    },
});
