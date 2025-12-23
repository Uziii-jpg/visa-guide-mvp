"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    User as FirebaseUser,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { User as AppUser } from "@/types/user";

// Define a composite user type
export type CurrentUser = FirebaseUser & Partial<AppUser>;

interface AuthContextType {
    user: CurrentUser | null;
    loading: boolean;
    isPremium: boolean;
    isAdmin: boolean;
    loginWithGoogle: () => Promise<void>;
    signupWithEmail: (email: string, pass: string) => Promise<void>;
    loginWithEmail: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const fetchUserData = async (authUser: FirebaseUser) => {
        try {
            const { doc, getDoc } = await import("firebase/firestore");
            const { db } = await import("@/lib/firebase");
            const userRef = doc(db, "users", authUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data() as AppUser;
                const fullUser = { ...authUser, ...userData } as unknown as CurrentUser;
                setUser(fullUser);

                const isPremiumUser = userData.subscription_tier === 'premium' ||
                    (userData as any).isPremium === true ||
                    authUser.email === 'admin@visamaster.com';

                setIsPremium(!!isPremiumUser);
                setIsAdmin(authUser.email === 'admin@visamaster.com');
            } else {
                setUser(authUser as CurrentUser);
                setIsPremium(authUser.email === 'admin@visamaster.com');
                setIsAdmin(authUser.email === 'admin@visamaster.com');
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setUser(authUser as CurrentUser);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                await fetchUserData(authUser);
            } else {
                setUser(null);
                setIsPremium(false);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const refreshUser = async () => {
        if (auth.currentUser) {
            await fetchUserData(auth.currentUser);
        }
    };

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
        <AuthContext.Provider value={{ user, loading, isPremium, isAdmin, loginWithGoogle, signupWithEmail, loginWithEmail, logout, refreshUser }}>
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
