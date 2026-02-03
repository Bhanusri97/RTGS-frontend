import Colors from '@/constants/Colors';
import { OFFICER_PROFILE } from '@/services/mockData';
import { useRouter } from 'expo-router';
import { Bell, ChevronRight, Globe, LogOut, MessageCircle, Shield, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState(true);
    const [language, setLanguage] = useState(false);
    const [whatsappMode, setWhatsappMode] = useState(false); // false = Demo, true = Live

    const toggleNotifications = () => setNotifications(previousState => !previousState);
    const toggleLanguage = () => setLanguage(previousState => !previousState);

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: () => router.replace('/login')
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Image source={OFFICER_PROFILE.avatar} style={styles.avatar} />
                        <View style={styles.onlineBadge} />
                    </View>
                    <Text style={styles.name}>{OFFICER_PROFILE.name}</Text>
                    <Text style={styles.role}>{OFFICER_PROFILE.designation}</Text>
                    <Text style={styles.department}>{OFFICER_PROFILE.location}</Text>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>48</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>98%</Text>
                        <Text style={styles.statLabel}>Efficiency</Text>
                    </View>
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Bell size={20} color="#666" />
                            <Text style={styles.settingText}>Notifications</Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#767577", true: Colors.light.primary }}
                            thumbColor={notifications ? "#fff" : "#f4f3f4"}
                            onValueChange={toggleNotifications}
                            value={notifications}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Globe size={20} color="#666" />
                            <Text style={styles.settingText}>Language (Telugu)</Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#767577", true: Colors.light.primary }}
                            thumbColor={language ? "#fff" : "#f4f3f4"}
                            onValueChange={toggleLanguage}
                            value={language}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <MessageCircle size={20} color="#666" />
                            <View>
                                <Text style={styles.settingText}>WhatsApp Live Mode</Text>
                                <Text style={styles.settingSubtext}>Use Real Cloud API</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: "#767577", true: "#25D366" }}
                            thumbColor={whatsappMode ? "#fff" : "#f4f3f4"}
                            onValueChange={setWhatsappMode}
                            value={whatsappMode}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuInfo}>
                            <User size={20} color="#666" />
                            <Text style={styles.menuText}>Edit Profile</Text>
                        </View>
                        <ChevronRight size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuInfo}>
                            <Shield size={20} color="#666" />
                            <Text style={styles.menuText}>Privacy & Security</Text>
                        </View>
                        <ChevronRight size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <View style={styles.menuInfo}>
                            <LogOut size={20} color="#d32f2f" />
                            <Text style={[styles.menuText, { color: '#d32f2f' }]}>Logout</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.versionText}>App Version 1.0.0 (PoC)</Text>
            </ScrollView>
        </SafeAreaView>
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
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#fff',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#4caf50',
        borderWidth: 3,
        borderColor: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 4,
    },
    role: {
        fontSize: 16,
        color: Colors.light.primary,
        fontWeight: '600',
        marginBottom: 4,
    },
    department: {
        fontSize: 14,
        color: '#666',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#eee',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 16,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingText: {
        fontSize: 16,
        color: Colors.light.text,
    },
    settingSubtext: {
        fontSize: 12,
        color: '#888',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    menuInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuText: {
        fontSize: 16,
        color: Colors.light.text,
    },
    versionText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 12,
        marginTop: 20,
        marginBottom: 40,
    },
});
