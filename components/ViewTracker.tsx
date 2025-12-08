'use client';

import { useEffect } from 'react';
import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ViewTracker({ countryCode, visaType }: { countryCode: string, visaType: string }) {
    useEffect(() => {
        // 1. LocalStorage Tracking (Recent Views)
        const stored = localStorage.getItem('recentVisas');
        let recent = stored ? JSON.parse(stored) : [];
        const entry = `${countryCode}:${visaType}`;
        recent = [entry, ...recent.filter((item: string) => item !== entry)].slice(0, 10);
        localStorage.setItem('recentVisas', JSON.stringify(recent));

        // 2. Firestore Tracking (Global Trending)
        // We use setDoc with merge: true to create the document if it doesn't exist
        const trackView = async () => {
            try {
                const docRef = doc(db, 'country_stats', countryCode);
                await setDoc(docRef, {
                    views: increment(1),
                    countryCode: countryCode,
                    lastViewed: serverTimestamp()
                }, { merge: true });
            } catch (error) {
                console.error("Error tracking view:", error);
            }
        };

        trackView();
    }, [countryCode, visaType]);

    return null;
}
