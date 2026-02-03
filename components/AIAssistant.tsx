import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { aiAPI } from '@/services/api';
import { useRouter } from 'expo-router';
import { Clock, MessageSquare, Mic, Send, Sparkles, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';

interface AIAssistantProps {
    variant?: 'default' | 'modal';
    onClose?: () => void;
    onPress?: () => void;
    style?: ViewStyle;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
}

export const AIAssistant = ({ variant = 'default', onClose, onPress, style }: AIAssistantProps) => {
    const { user } = useAuth();
    const router = useRouter();
    const [mode, setMode] = useState<'widget' | 'chat' | 'history'>(variant === 'modal' ? 'chat' : 'widget');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Mock history threads
    const historyThreads = [
        { id: '1', title: 'Previous Schedule Request', date: 'Today, 10:00 AM' },
        { id: '2', title: 'Task cleanup help', date: 'Yesterday' }
    ];

    const handleVoiceInput = () => {
        setIsListening(!isListening);
        if (!isListening) {
            setTimeout(() => {
                setInput('Schedule a meeting with the Collector');
                setIsListening(false);
            }, 2000);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), 10000)
            );

            const response = await Promise.race([
                aiAPI.chat(userMessage.text, user?.id || 'officer1'),
                timeoutPromise
            ]) as any;

            const aiMessage: Message = { id: (Date.now() + 1).toString(), text: response.response, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);

            // Handle Actions
            if (response.action) {
                setTimeout(() => {
                    switch (response.action.type) {
                        case 'calendar_check':
                            router.push('/(tabs)/calendar');
                            break;
                        case 'create_task':
                            router.push('/(tabs)/tasks');
                            break;
                        case 'fetch_status':
                            router.push('/(tabs)');
                            break;
                    }
                }, 2000);
            }
        } catch (error) {
            console.log('AI Error:', error);
            setMessages(prev => [...prev, { id: Date.now().toString(), text: 'Sorry, I am having trouble connecting.', sender: 'ai' }]);
        } finally {
            setLoading(false);
        }
    };

    const renderWidgetMode = () => (
        <>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Sparkles size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.title}>AI Assistant</Text>
                </View>
                {!onPress && (
                    <TouchableOpacity onPress={() => setMode('history')}>
                        <Clock size={20} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity
                style={styles.inputContainer}
                onPress={onPress}
                activeOpacity={onPress ? 0.7 : 1}
            >
                <TouchableOpacity style={styles.micButton} onPress={onPress || handleVoiceInput}>
                    <Mic size={20} color={isListening ? Colors.light.error : Colors.light.primary} />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder={isListening ? "Listening..." : "Ask anything..."}
                    placeholderTextColor="#999"
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={handleSend}
                    editable={!onPress} // Disable editing if it's a trigger
                    pointerEvents={onPress ? 'none' : 'auto'} // Pass touches to parent if trigger
                />
                <TouchableOpacity style={styles.sendButton} onPress={onPress || handleSend}>
                    <Send size={20} color="#fff" />
                </TouchableOpacity>
            </TouchableOpacity>

            <View style={styles.suggestions}>
                <Text style={styles.suggestionLabel}>Suggestions:</Text>
                <View style={styles.chips}>
                    <TouchableOpacity style={styles.chip} onPress={() => {
                        if (onPress) { onPress(); return; }
                        setInput("Schedule a meeting");
                        handleSend();
                    }}>
                        <Text style={styles.chipText}>Schedule meeting</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.chip} onPress={() => {
                        if (onPress) { onPress(); return; }
                        setInput("Create a task");
                        handleSend();
                    }}>
                        <Text style={styles.chipText}>Create task</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );

    const renderChatMode = () => (
        <>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    {variant !== 'modal' && (
                        <TouchableOpacity onPress={() => setMode('widget')} style={{ marginRight: 8 }}>
                            <X size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                    <Text style={styles.title}>Chat</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setMode('history')} style={{ marginRight: onClose ? 16 : 0 }}>
                        <Clock size={20} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                    {onClose && (
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                style={styles.chatContainer}
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.length === 0 && (
                    <Text style={styles.emptyText}>Start a conversation...</Text>
                )}
                {messages.map((msg) => (
                    <View key={msg.id} style={[
                        styles.messageBubble,
                        msg.sender === 'user' ? styles.userBubble : styles.aiBubble
                    ]}>
                        <Text style={[
                            styles.messageText,
                            msg.sender === 'user' ? styles.userText : styles.aiText
                        ]}>{msg.text}</Text>
                    </View>
                ))}
                {loading && (
                    <View style={[styles.messageBubble, styles.aiBubble]}>
                        <ActivityIndicator size="small" color={Colors.light.primary} />
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.micButton} onPress={handleVoiceInput}>
                    <Mic size={20} color={isListening ? Colors.light.error : Colors.light.primary} />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder={isListening ? "Listening..." : "Type a message..."}
                    placeholderTextColor="#999"
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={handleSend}
                    editable={!loading}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="#fff" /> : <Send size={20} color="#fff" />}
                </TouchableOpacity>
            </View>
        </>
    );

    const renderHistoryMode = () => (
        <>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <TouchableOpacity onPress={() => setMode('widget')} style={{ marginRight: 8 }}>
                        <X size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>History</Text>
                </View>
            </View>

            <ScrollView style={styles.historyContainer}>
                {historyThreads.map((thread) => (
                    <TouchableOpacity key={thread.id} style={styles.historyItem} onPress={() => {
                        setMessages([
                            { id: '1', text: thread.title, sender: 'user' },
                            { id: '2', text: 'Here are the details regarding that...', sender: 'ai' }
                        ]);
                        setMode('chat');
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MessageSquare size={16} color="#fff" style={{ marginRight: 12 }} />
                            <View>
                                <Text style={styles.historyTitle}>{thread.title}</Text>
                                <Text style={styles.historyDate}>{thread.date}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </>
    );

    return (
        <View style={[styles.container, mode !== 'widget' && styles.expandedContainer, style]}>
            {mode === 'widget' && renderWidgetMode()}
            {mode === 'chat' && renderChatMode()}
            {mode === 'history' && renderHistoryMode()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.primary,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        minHeight: 160,
    },
    expandedContainer: {
        height: 450,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 4,
        marginBottom: 12,
    },
    micButton: {
        padding: 10,
    },
    input: {
        flex: 1,
        height: 40,
        fontSize: 14,
        color: '#333',
        paddingHorizontal: 8,
    },
    sendButton: {
        backgroundColor: Colors.light.accent,
        padding: 10,
        borderRadius: 8,
    },
    suggestions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    suggestionLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginRight: 8,
    },
    chips: {
        flexDirection: 'row',
        flex: 1,
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    chipText: {
        fontSize: 11,
        color: '#fff',
        fontWeight: '500',
    },
    chatContainer: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 10,
        borderRadius: 12,
        marginBottom: 8,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#fff',
        borderBottomRightRadius: 2,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderBottomLeftRadius: 2,
    },
    messageText: {
        fontSize: 14,
    },
    userText: {
        color: Colors.light.primary,
    },
    aiText: {
        color: '#333',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginTop: 20,
    },
    historyContainer: {
        flex: 1,
    },
    historyItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    historyTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    historyDate: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
});
