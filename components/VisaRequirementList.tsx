'use client';

import React from 'react';
import { RequirementBlock } from '@/types/visaSchema';
import { useAuth } from '@/context/AuthContext';

import { useRouter } from '@/i18n/routing';

interface VisaRequirementListProps {
    documents: RequirementBlock[];
}

export default function VisaRequirementList({ documents }: VisaRequirementListProps) {
    const { user, isPremium } = useAuth();
    const router = useRouter();

    // Documents section restored

    const getDocIcon = (title: string) => {
        if (!title) return '📄';
        const t = title.toLowerCase();
        if (t.includes('passport')) return '🛂';
        if (t.includes('photo')) return '📸';
        if (t.includes('bank') || t.includes('statement') || t.includes('financial') || t.includes('funds')) return '🏦';
        if (t.includes('ticket') || t.includes('flight')) return '✈️';
        if (t.includes('hotel') || t.includes('accommodation')) return '🏨';
        if (t.includes('insurance')) return '🏥';
        if (t.includes('letter') || t.includes('cover')) return '📝';
        if (t.includes('student') || t.includes('university') || t.includes('admission')) return '🎓';
        if (t.includes('police') || t.includes('criminal')) return '👮';
        return '📄';
    };

    return (
        <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                    📋
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Required Documents</h2>
                    <p className="text-gray-500 text-sm">Checklist for your application</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {documents.map((doc, index) => {
                    const isLocked = doc.is_premium && !isPremium;
                    const icon = getDocIcon(doc.title);

                    return (
                        <div
                            key={`${doc.id}-${index}`}
                            className={`relative p-5 rounded-2xl border transition-all duration-300 group ${isLocked
                                ? 'bg-gray-50 border-gray-200 overflow-hidden'
                                : 'bg-white border-gray-100 hover:shadow-lg hover:border-blue-100 hover:-translate-y-1'
                                } ${doc.is_premium && !isLocked ? 'bg-amber-50/50 border-amber-100' : ''}`}
                        >
                            <div className={`flex gap-4 ${isLocked ? 'blur-sm select-none opacity-50 pointer-events-none' : ''}`}>
                                <div className="text-3xl shrink-0">{icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h3 className="font-bold text-gray-900 truncate pr-2">{doc.title}</h3>
                                        {doc.is_premium && (
                                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-amber-200">
                                                Vital
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">{doc.description}</p>
                                    {doc.note && (
                                        <div className="mt-3 flex items-start gap-1.5 text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
                                            <span>ℹ️</span>
                                            <span>{doc.note}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isLocked && (
                                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 backdrop-blur-[2px]">
                                    <div className="bg-white/90 px-5 py-3 rounded-xl shadow-xl border border-gray-100 flex flex-col items-center gap-2 transform hover:scale-105 transition-transform cursor-pointer" onClick={() => router.push('/subscribe')}>
                                        <span className="text-2xl">🔒</span>
                                        <div className="text-center">
                                            <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Premium Only</p>
                                            <span className="text-[10px] text-blue-600 font-semibold hover:underline">
                                                Tap to Unlock
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
