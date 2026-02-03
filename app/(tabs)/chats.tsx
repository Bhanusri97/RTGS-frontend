import { socketService } from '@/services/socket';
import { useRouter } from 'expo-router';
import { Lock, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { chatAPI } from '../../services/api';

// Mock user ID for PoC - in real app, get from auth context
const CURRENT_USER_ID = '655e0c5a9f8b9c001f8e4d1a';

export default function ChatsScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChats();
        socketService.connect();

        return () => {
            socketService.disconnect();
        };
    }, []);

    const loadChats = async () => {
        try {
            // In a real app, we would get the user ID from auth state
            // For PoC, we might need to create a user first or use a hardcoded one if backend has it
            // Fallback to mock if API fails or returns empty (for demo continuity)
            const data = await chatAPI.getChats(CURRENT_USER_ID);
            if (data && data.length > 0) {
                setChats(data);
            } else {
                // Fallback to mock data if no real chats exist yet
                setChats(MOCK_CHATS);
            }
        } catch (error) {
            console.log('Error loading chats:', error);
            setChats(MOCK_CHATS);
        } finally {
            setLoading(false);
        }
    };

    const filteredChats = chats.filter(chat =>
        chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderChatItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => router.push({ pathname: '/chat-detail', params: { id: item.id || item.chatId, name: item.name } })}
        >
            <Image source={{ uri: item.avatar || 'https://ui-avatars.com/api/?name=' + item.name }} style={styles.avatar} />
            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.time}>{item.time || new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <View style={styles.messageRow}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.lastMessage}
                    </Text>
                    {item.unread > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.unread}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Secure Chats</Text>
                <View style={styles.secureBadge}>
                    <Lock size={12} color={Colors.light.background} />
                    <Text style={styles.secureText}>End-to-End Encrypted</Text>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <Search size={20} color="#666" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredChats}
                renderItem={renderChatItem}
                keyExtractor={item => item.id || item.chatId}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

// Keep mock data as fallback for demo
const MOCK_CHATS = [
    {
        id: '1',
        name: 'Chief Secretary',
        lastMessage: 'Please review the draft policy by evening.',
        time: '10:30 AM',
        unread: 2,
        avatar: 'https://ui-avatars.com/api/?name=Chief+Secretary&background=0D8ABC&color=fff',
    },
    {
        id: '2',
        name: 'District Collector Guntur',
        lastMessage: 'Flood relief operations are underway.',
        time: '09:15 AM',
        unread: 0,
        avatar: 'https://ui-avatars.com/api/?name=DC+Guntur&background=2196F3&color=fff',
    },
    {
        id: '3',
        name: 'IT Minister',
        lastMessage: 'Meeting rescheduled to 4 PM.',
        time: 'Yesterday',
        unread: 1,
        avatar: 'https://ui-avatars.com/api/?name=IT+Minister&background=FF9800&color=fff',
    },
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        padding: 20,
        backgroundColor: Colors.light.background,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    secureText: {
        color: Colors.light.background,
        fontSize: 10,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        margin: 16,
        padding: 12,
        borderRadius: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    listContent: {
        paddingBottom: 20,
    },
    chatItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 16,
    },
    chatContent: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
    },
    time: {
        fontSize: 12,
        color: '#666',
    },
    messageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
        flex: 1,
        marginRight: 8,
    },
    badge: {
        backgroundColor: Colors.light.tint,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
