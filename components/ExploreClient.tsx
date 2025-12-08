'use client';

import React, { useState, useMemo, useEffect } from 'react';
import CountryCard from '@/components/CountryCard';
import { getCountryImage } from '@/lib/imageHelper';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculatePopularity } from '@/lib/scoreLogic';

interface ExploreClientProps {
    allVisas: { countryCode: string; visaType: string }[];
}

interface CountryStats {
    [key: string]: {
        views: number;
        lastViewed: any;
    };
}

export default function ExploreClient({ allVisas }: ExploreClientProps) {
    const [stats, setStats] = useState<CountryStats>({});

    // Fetch stats on mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'country_stats'));
                const newStats: CountryStats = {};
                querySnapshot.forEach((doc) => {
                    newStats[doc.id] = doc.data() as any;
                });
                setStats(newStats);
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, []);

    // Deduplicate countries (we only need one card per country)
    const uniqueCountries = useMemo(() => {
        const seen = new Set();
        return allVisas.filter(visa => {
            if (seen.has(visa.countryCode)) return false;
            seen.add(visa.countryCode);
            return true;
        }).map(v => v.countryCode);
    }, [allVisas]);

    // Sort by popularity (descending)
    const sortedCountries = useMemo(() => {
        return [...uniqueCountries].sort((a, b) => {
            const scoreA = calculatePopularity(a, stats[a]?.views, stats[a]?.lastViewed);
            const scoreB = calculatePopularity(b, stats[b]?.views, stats[b]?.lastViewed);
            return scoreB - scoreA;
        });
    }, [uniqueCountries, stats]);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Destinations</h1>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Browse visa requirements for over 80 countries.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {sortedCountries.map((code) => {
                        const popularity = calculatePopularity(code, stats[code]?.views, stats[code]?.lastViewed);
                        return (
                            <CountryCard
                                key={code}
                                countryCode={code}
                                popularity={popularity}
                                image={getCountryImage(code)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
