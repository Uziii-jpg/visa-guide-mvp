'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface UniversityGuideTeaserProps {
    countryCode: string;
    visaType: string;
}

export default function UniversityGuideTeaser({ countryCode, visaType }: UniversityGuideTeaserProps) {
    const { isPremium } = useAuth();
    const router = useRouter();

    const handleAccess = () => {
        if (isPremium) {
            router.push(`/visa/${countryCode}/${visaType}/university-guide`);
        } else {
            router.push('/subscribe');
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl shadow-lg border border-indigo-700 p-8 mb-8 relative overflow-hidden text-white">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">🎓</span>
                        <h2 className="text-2xl font-bold">University Admission Guide</h2>
                    </div>
                    <p className="text-blue-100 mb-6 text-lg">
                        Everything you need to know about studying in {countryCode}.
                    </p>

                    <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2 text-sm text-blue-50">
                            <span className="text-green-400">✓</span> Top Universities & Rankings
                        </li>
                        <li className="flex items-center gap-2 text-sm text-blue-50">
                            <span className="text-green-400">✓</span> Intake Seasons & Deadlines
                        </li>
                        <li className="flex items-center gap-2 text-sm text-blue-50">
                            <span className="text-green-400">✓</span> Complete Pre-Visa Checklist
                        </li>
                        <li className="flex items-center gap-2 text-sm text-blue-50">
                            <span className="text-green-400">✓</span> Application Platforms & Exams
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col items-center gap-3 bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10 w-full md:w-auto min-w-[250px]">
                    {isPremium ? (
                        <>
                            <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-2xl mb-2">
                                🔓
                            </div>
                            <h3 className="font-bold text-lg">Premium Unlocked</h3>
                            <button
                                onClick={handleAccess}
                                className="w-full bg-white text-blue-900 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 transition-all shadow-lg"
                            >
                                View Full Guide
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-2xl mb-2">
                                👑
                            </div>
                            <h3 className="font-bold text-lg">Premium Feature</h3>
                            <p className="text-xs text-blue-200 text-center mb-4">
                                Upgrade to access the complete university guide.
                            </p>
                            <button
                                onClick={handleAccess}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                                <span>🔒</span> Unlock Access
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
