import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Colors from '../constants/Colors';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'outlined' | 'elevated';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'elevated' }) => {
    const getStyle = () => {
        switch (variant) {
            case 'outlined':
                return styles.outlined;
            case 'elevated':
                return styles.elevated;
            default:
                return styles.default;
        }
    };

    return <View style={[styles.card, getStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.light.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    default: {},
    elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    outlined: {
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
});
