import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
} | null;

type AuthContextType = {
    user: User;
    signIn: (token: string, userData: any) => Promise<void>;
    signOut: () => void;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    signIn: async () => { },
    signOut: () => { },
    isLoading: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Mock initial user for dev convenience if needed, or check storage
    useEffect(() => {
        // Check for persisted user
        // For now, let's just default to null (logged out) or a mock user
        // setUser({ id: 'officer1', name: 'Sumanth', email: 'officer@ap.gov.in', role: 'admin' });
    }, []);

    const signIn = async (token: string, userData: any) => {
        setIsLoading(true);
        try {
            // Simulate API/Storage delay
            await new Promise(resolve => setTimeout(resolve, 500));
            setUser(userData);
            // Persist token logic here
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = () => {
        setUser(null);
        // Clear storage logic here
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
