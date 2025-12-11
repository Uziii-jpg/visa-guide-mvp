'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types/user';
import { EligibilityCriteria } from '@/types/visaSchema';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from '@/i18n/routing';
import { calculateEligibilityScore, ScoreBreakdown } from '@/lib/scoreLogic';

interface EligibilityCheckProps {
    criteria?: EligibilityCriteria;
}

export default function EligibilityCheck({ criteria }: EligibilityCheckProps) {
    const { user, isPremium } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<User | null>(null);
    const [scoreData, setScoreData] = useState<ScoreBreakdown | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const userData = docSnap.data() as User;
                        setProfile(userData);
                        if (criteria) {
                            setScoreData(calculateEligibilityScore(userData, criteria));
                        }
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user, criteria]);

    if (!criteria) return null;

    if (loading) return <div className="animate-pulse h-48 bg-gray-100 rounded-2xl mb-8"></div>;

    if (!user || !profile) {
        return (
            <div className="bg-gradient-to-br from-indigo-900 to-blue-900 p-8 rounded-2xl shadow-lg border border-indigo-700 mb-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-3">Check Your Approval Chances</h2>
                    <p className="text-blue-100 mb-6 max-w-md">Sign in to get an instant AI-powered eligibility score based on your financial and professional profile.</p>
                    <button onClick={() => router.push('/login')} className="bg-white text-blue-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-md">
                        Check Eligibility Now
                    </button>
                </div>
            </div>
        );
    }

    if (!scoreData) return null;

    const { totalScore, financialScore, educationScore, riskPenalty, tips } = scoreData;

    // Freemium Logic
    const showExactScore = isPremium;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Score Circle */}
                <div className="relative flex-shrink-0">
                    <div className="w-40 h-40 rounded-full border-8 border-gray-100 flex items-center justify-center relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50" cy="50" r="46"
                                fill="none"
                                stroke={totalScore >= 80 ? '#16a34a' : totalScore >= 50 ? '#ca8a04' : '#dc2626'}
                                strokeWidth="8"
                                strokeDasharray={`${totalScore * 2.89} 289`}
                                strokeLinecap="round"
                                className={`transition-all duration-1000 ease-out ${!showExactScore ? 'blur-sm opacity-50' : ''}`}
                            />
                        </svg>
                        <div className="text-center z-10">
                            {showExactScore ? (
                                <>
                                    <span className={`text-4xl font-bold ${getScoreColor(totalScore)}`}>{totalScore}%</span>
                                    <p className="text-xs text-gray-500 font-medium uppercase mt-1">Approval<br />Chance</p>
                                </>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <span className="text-3xl font-bold text-gray-400 blur-sm">85%</span>
                                    <span className="text-xs text-gray-400 font-bold uppercase mt-1">Hidden</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {!showExactScore && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-gray-100">
                                <span className="text-2xl">🔒</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="flex-grow w-full">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Eligibility Analysis</h3>
                            <p className="text-sm text-gray-500">Based on your profile vs. visa requirements</p>
                        </div>
                        {!showExactScore && (
                            <button
                                onClick={() => router.push('/subscribe')}
                                className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full font-bold shadow-sm hover:shadow-md transition-all"
                            >
                                Upgrade to Unlock
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {/* Progress Bars */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Financial Strength</span>
                                <span className="font-semibold text-gray-900">{Math.round((financialScore / 70) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(financialScore / 70) * 100}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Education Match</span>
                                <span className="font-semibold text-gray-900">{Math.round((educationScore / 20) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(educationScore / 20) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Tips / Weaknesses */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 relative overflow-hidden">
                        {!showExactScore && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                <p className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                    <span>💎</span> Premium Tips Hidden
                                </p>
                            </div>
                        )}
                        <h4 className="text-sm font-bold text-gray-900 mb-2">Improvement Tips:</h4>
                        {tips.length > 0 ? (
                            <ul className="space-y-1">
                                {tips.map((tip, i) => (
                                    <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                                        <span className="mt-0.5">•</span>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-green-600 flex items-center gap-2">
                                <span>✅</span> Your profile looks strong!
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
