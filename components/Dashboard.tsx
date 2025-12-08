'use client';

import React, { useState, useMemo, useEffect } from 'react';
import CountryCard from '@/components/CountryCard';
import { getCountryImage } from '@/lib/imageHelper';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculatePopularity } from '@/lib/scoreLogic';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';
import { useTranslations } from 'next-intl';

interface DashboardProps {
    allVisas: { countryCode: string; visaType: string }[];
}

interface CountryStats {
    [key: string]: {
        views: number;
        lastViewed: any;
    };
}

const TOP_COUNTRIES = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES'];

export default function Dashboard({ allVisas }: DashboardProps) {
    const { user } = useAuth();
    const t = useTranslations('Dashboard');
    const [stats, setStats] = useState<CountryStats>({});
    const [userData, setUserData] = useState<User | null>(null);

    // Fetch stats and user data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Stats
                const statsSnapshot = await getDocs(collection(db, 'country_stats'));
                const newStats: CountryStats = {};
                statsSnapshot.forEach((doc) => {
                    newStats[doc.id] = doc.data() as any;
                });
                setStats(newStats);

                // Fetch User Data for recommendations
                if (user) {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data() as User);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [user]);

    // Deduplicate countries
    const uniqueCountries = useMemo(() => {
        const seen = new Set();
        return allVisas.filter(visa => {
            if (seen.has(visa.countryCode)) return false;
            seen.add(visa.countryCode);
            return true;
        }).map(v => v.countryCode);
    }, [allVisas]);

    // 1. Top Countries (MSP)
    const topCountries = useMemo(() => {
        return uniqueCountries.filter(code => TOP_COUNTRIES.includes(code));
    }, [uniqueCountries]);

    // 2. Recommended for You
    const recommendedCountries = useMemo(() => {
        if (!userData) return [];

        // Simple recommendation logic
        let recommendedCodes: string[] = [];
        const education = userData.personal_details?.education_level;
        const employment = userData.financials?.employment_type;

        // If Student or young -> Recommend Student friendly countries
        if (employment === 'student' || education === 'high_school') {
            recommendedCodes = ['CA', 'AU', 'DE', 'IE', 'NZ'];
        }
        // If Professional -> Recommend Work/Business hubs
        else if (employment === 'salaried' || employment === 'business') {
            recommendedCodes = ['US', 'GB', 'AE', 'SG', 'JP'];
        }
        // Default fallback
        else {
            recommendedCodes = ['TH', 'MY', 'VN', 'ID']; // Tourist friendly
        }

        // Filter to ensure we only show available countries and exclude Top Countries to avoid dupes (optional, but good for variety)
        // For now, let's just show them even if they duplicate, or filter. Let's filter out TOP_COUNTRIES for variety.
        return uniqueCountries.filter(code => recommendedCodes.includes(code) && !TOP_COUNTRIES.includes(code)).slice(0, 4);
    }, [uniqueCountries, userData]);

    // 3. Trending Now (Score based)
    const trendingCountries = useMemo(() => {
        // Sort by popularity
        const sorted = [...uniqueCountries].sort((a, b) => {
            const scoreA = calculatePopularity(a, stats[a]?.views, stats[a]?.lastViewed);
            const scoreB = calculatePopularity(b, stats[b]?.views, stats[b]?.lastViewed);
            return scoreB - scoreA;
        });

        // Filter out Top and Recommended to show unique trending ones
        const excluded = new Set([...TOP_COUNTRIES, ...recommendedCountries]);
        return sorted.filter(code => !excluded.has(code)).slice(0, 8);
    }, [uniqueCountries, stats, recommendedCountries]);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Dashboard Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('welcome', { name: user?.displayName?.split(' ')[0] || 'Traveler' })}
                    </h1>
                    <p className="text-gray-600">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="flex flex-col gap-12">
                    {/* 1. Top Countries */}
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-2xl">🌟</span>
                            <h2 className="text-2xl font-bold text-gray-900">{t('topDestinations')}</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {topCountries.map((code) => {
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
                    </section>

                    {/* 2. Recommended for You */}
                    {recommendedCountries.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-2xl">🎯</span>
                                <h2 className="text-2xl font-bold text-gray-900">{t('recommended')}</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {recommendedCountries.map((code) => {
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
                        </section>
                    )}

                    {/* 3. Trending Now */}
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-2xl">🔥</span>
                            <h2 className="text-2xl font-bold text-gray-900">{t('trending')}</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {trendingCountries.map((code) => {
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
                    </section>
                </div>
            </div>
        </div>
    );
}
