import { socketService } from '@/services/socket';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Lock, MoreVertical, Paperclip, Phone, Send, Video } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { chatAPI } from '../services/api';

// Mock user ID for PoC
const CURRENT_USER_ID = '655e0c5a9f8b9c001f8e4d1a';

export default function ChatDetailScreen() {
    const router = useRouter();
    const { id, name } = useLocalSearchParams();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        loadMessages();
        socketService.joinChat(id as string);

        socketService.onReceiveMessage((message) => {
            if (message.chatId === id) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }
        });

        return () => {
            socketService.offReceiveMessage();
        };
    }, [id]);

    const loadMessages = async () => {
        try {
            const data = await chatAPI.getMessages(id as string);
            if (data && data.length > 0) {
                setMessages(data);
            } else {
                setMessages(MOCK_MESSAGES); // Fallback
            }
        } catch (error) {
            console.log('Error loading messages:', error);
            setMessages(MOCK_MESSAGES);
        }
    };

    const sendMessage = async () => {
        if (inputText.trim().length === 0) return;

        const newMessage = {
            chatId: id,
            senderId: CURRENT_USER_ID,
            senderName: 'Me', // Should come from auth context
            receiverId: 'receiver_id_placeholder', // Should be passed or looked up
            receiverName: name,
            content: inputText,
            type: 'text',
            timestamp: new Date().toISOString(),
            isEncrypted: true,
        };

        // Optimistic update
        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        scrollToBottom();

        try {
            // Send via API (which saves to DB)
            await chatAPI.sendMessage(newMessage);

            // Also emit via socket for real-time (if not handled by backend API broadcasting)
            socketService.sendMessage(newMessage);
        } catch (error) {
            console.log('Error sending message:', error);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.senderId === CURRENT_USER_ID || item.sender === 'me';
        return (
            <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
                {!isMe && <Image source={{ uri: 'https://ui-avatars.com/api/?name=' + name }} style={styles.messageAvatar} />}
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                    <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                        {item.content || item.text}
                    </Text>
                    <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.theirTimestamp]}>
                        {new Date(item.timestamp || item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Colors.light.text} />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <Text style={styles.headerName}>{name}</Text>
                    <View style={styles.encryptionBadge}>
                        <Lock size={10} color="#4CAF50" />
                        <Text style={styles.encryptionText}>E2E Encrypted</Text>
                    </View>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/video-call')}>
                        <Video size={24} color={Colors.light.tint} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Phone size={24} color={Colors.light.tint} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <MoreVertical size={24} color={Colors.light.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={scrollToBottom}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Paperclip size={24} color="#666" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a secure message..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Send size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const MOCK_MESSAGES = [
    { id: '1', text: 'Good morning, sir. Have you reviewed the flood relief report?', time: '09:30 AM', sender: 'them' },
    { id: '2', text: 'Yes, I have. The allocation for Guntur district needs to be increased by 15%.', time: '09:32 AM', sender: 'me' },
    { id: '3', text: 'Understood. I will update the draft and send it for approval.', time: '09:33 AM', sender: 'them' },
    { id: '4', text: 'Also, schedule a video conference with the collectors at 4 PM.', time: '09:35 AM', sender: 'me' },
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 16,
    },
    headerContent: {
        flex: 1,
    },
    headerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    encryptionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        gap: 4,
    },
    encryptionText: {
        fontSize: 10,
        color: '#4CAF50',
        fontWeight: '600',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 16,
    },
    actionButton: {
        padding: 4,
    },
    messagesList: {
        padding: 16,
        paddingBottom: 32,
    },
    messageContainer: {
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    myMessage: {
        justifyContent: 'flex-end',
    },
    theirMessage: {
        justifyContent: 'flex-start',
    },
    messageAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 8,
        marginBottom: 4,
    },
    bubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    myBubble: {
        backgroundColor: Colors.light.tint,
        borderBottomRightRadius: 4,
    },
    theirBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        marginBottom: 4,
    },
    myMessageText: {
        color: '#fff',
    },
    theirMessageText: {
        color: '#000',
    },
    timestamp: {
        fontSize: 10,
        alignSelf: 'flex-end',
    },
    myTimestamp: {
        color: 'rgba(255,255,255,0.7)',
    },
    theirTimestamp: {
        color: '#999',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    attachButton: {
        padding: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 8,
        maxHeight: 100,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: Colors.light.tint,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

