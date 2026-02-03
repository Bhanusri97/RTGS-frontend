import Colors from '@/constants/Colors';
import { Stack, useRouter } from 'expo-router';
import { Briefcase, CheckCircle, ChevronRight, Upload, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const STEPS = ['Basic Info', 'Proposal Details', 'Documents', 'Review'];

export default function WorkflowSubmissionScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        orgName: '',
        title: '',
        description: '',
        sector: '',
    });

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            Alert.alert("Success", "Your proposal has been submitted successfully. Reference ID: AP-STARTUP-2025-001", [
                { text: "OK", onPress: () => router.back() }
            ]);
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepContainer}>
            {STEPS.map((step, index) => (
                <View key={index} style={styles.stepWrapper}>
                    <View style={[styles.stepCircle, index <= currentStep && styles.activeStepCircle]}>
                        {index < currentStep ? (
                            <CheckCircle size={16} color="#fff" />
                        ) : (
                            <Text style={[styles.stepNumber, index === currentStep && styles.activeStepNumber]}>{index + 1}</Text>
                        )}
                    </View>
                    {index < STEPS.length - 1 && <View style={[styles.stepLine, index < currentStep && styles.activeStepLine]} />}
                </View>
            ))}
        </View>
    );

    const renderContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={styles.inputWrapper}>
                                <User size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChangeText={(t) => setFormData({ ...formData, name: t })}
                                />
                            </View>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Organization / Startup Name</Text>
                            <View style={styles.inputWrapper}>
                                <Briefcase size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter organization name"
                                    value={formData.orgName}
                                    onChangeText={(t) => setFormData({ ...formData, orgName: t })}
                                />
                            </View>
                        </View>
                    </View>
                );
            case 1:
                return (
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Proposal Details</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Project Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="E.g., AI for Waste Management"
                                value={formData.title}
                                onChangeText={(t) => setFormData({ ...formData, title: t })}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            {/* <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe your solution..."
                                multiline
                                numberOfLines={4}
                                value={formData.description}
                                onChangeText={(t) => setFormData({ ...formData, description: t })}
                            /> */}
                            <Text>Description Input Placeholder</Text>
                        </View>
                    </View>
                );
            case 2:
                return (
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Upload Documents</Text>
                        <TouchableOpacity style={styles.uploadBox}>
                            <Upload size={32} color={Colors.light.primary} />
                            <Text style={styles.uploadText}>Tap to upload Pitch Deck (PDF)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.uploadBox}>
                            <Upload size={32} color={Colors.light.primary} />
                            <Text style={styles.uploadText}>Tap to upload Financials</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 3:
                return (
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Review & Submit</Text>
                        <View style={styles.reviewCard}>
                            <Text style={styles.reviewLabel}>Name:</Text>
                            <Text style={styles.reviewValue}>{formData.name || 'N/A'}</Text>

                            <Text style={styles.reviewLabel}>Organization:</Text>
                            <Text style={styles.reviewValue}>{formData.orgName || 'N/A'}</Text>

                            <Text style={styles.reviewLabel}>Project:</Text>
                            <Text style={styles.reviewValue}>{formData.title || 'N/A'}</Text>
                        </View>
                        <Text style={styles.disclaimer}>
                            By submitting, you agree to the terms and conditions of the AP Innovation Society.
                        </Text>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Submit Proposal' }} />

            {renderStepIndicator()}

            <ScrollView contentContainerStyle={styles.content}>
                {renderContent()}
            </ScrollView>

            <View style={styles.footer}>
                {currentStep > 0 && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setCurrentStep(currentStep - 1)}
                    >
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>
                        {currentStep === STEPS.length - 1 ? 'Submit Proposal' : 'Next Step'}
                    </Text>
                    {currentStep < STEPS.length - 1 && <ChevronRight size={20} color="#fff" />}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    stepContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: '#fff',
    },
    stepWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    activeStepCircle: {
        backgroundColor: Colors.light.primary,
    },
    stepNumber: {
        color: '#666',
        fontWeight: 'bold',
    },
    activeStepNumber: {
        color: '#fff',
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: '#e0e0e0',
    },
    activeStepLine: {
        backgroundColor: Colors.light.primary,
    },
    content: {
        padding: 20,
    },
    formSection: {
        gap: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 12,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 12,
        textAlignVertical: 'top',
    },
    uploadBox: {
        height: 120,
        borderWidth: 2,
        borderColor: Colors.light.primary,
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f7ff',
        marginBottom: 16,
    },
    uploadText: {
        marginTop: 8,
        color: Colors.light.primary,
        fontWeight: '600',
    },
    reviewCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    reviewLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    reviewValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    disclaimer: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
        marginTop: 16,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    backButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        marginRight: 12,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
    },
    backButtonText: {
        color: '#666',
        fontWeight: 'bold',
        fontSize: 16,
    },
    nextButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.primary,
        borderRadius: 12,
        paddingVertical: 16,
    },
    nextButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 8,
    },
});
