"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isPremium: boolean;
    isAdmin: boolean;
    loginWithGoogle: () => Promise<void>;
    signupWithEmail: (email: string, pass: string) => Promise<void>;
    loginWithEmail: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                // Fetch extra user details from Firestore
                try {
                    const { doc, getDoc } = await import("firebase/firestore");
                    const { db } = await import("@/lib/firebase");
                    const userRef = doc(db, "users", authUser.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        const fullUser = { ...authUser, ...userData } as unknown as User;
                        setUser(fullUser);

                        // Check Premium Status
                        const isPremiumUser = userData.subscription_tier === 'premium' ||
                            userData.isPremium === true ||
                            authUser.email === 'admin@visamaster.com';

                        setIsPremium(!!isPremiumUser);
                        setIsAdmin(authUser.email === 'admin@visamaster.com');
                    } else {
                        setUser(authUser as unknown as User);
                        setIsPremium(authUser.email === 'admin@visamaster.com');
                        setIsAdmin(authUser.email === 'admin@visamaster.com');
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setUser(authUser as unknown as User);
                }
            } else {
                setUser(null);
                setIsPremium(false);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const signupWithEmail = async (email: string, pass: string) => {
        await createUserWithEmailAndPassword(auth, email, pass);
    };

    const loginWithEmail = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isPremium, isAdmin, loginWithGoogle, signupWithEmail, loginWithEmail, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
