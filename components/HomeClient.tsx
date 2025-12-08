"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import LandingPage from "@/components/LandingPage";
import MasterProfile from "@/components/MasterProfile";
import Dashboard from "@/components/Dashboard";

interface HomeClientProps {
    allVisas: { countryCode: string; visaType: string }[];
}

export default function HomeClient({ allVisas }: HomeClientProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const locale = useLocale();
    const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

    useEffect(() => {
        const checkProfile = async () => {
            if (user) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                // Check if critical fields exist to determine completion
                // We check for passport_number as a proxy for "profile saved at least once"
                if (docSnap.exists() && docSnap.data().personal_details?.passport_number) {
                    setProfileComplete(true);
                } else {
                    setProfileComplete(false);
                }
            }
        };
        if (!loading) {
            checkProfile();
        }
    }, [user, loading]);

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    if (!user) {
        return <LandingPage />;
    }

    if (profileComplete === false) {
        return <MasterProfile onComplete={() => setProfileComplete(true)} />;
    }

    // If profile is complete, show the Dashboard view
    return <Dashboard allVisas={allVisas} />;
}
