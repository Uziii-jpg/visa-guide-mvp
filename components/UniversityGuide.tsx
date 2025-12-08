"use client";

import React from 'react';
import { UniversityGuide as UniGuideType } from '@/types/visaSchema';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface UniversityGuideProps {
    guide: UniGuideType;
}

export default function UniversityGuide({ guide }: UniversityGuideProps) {
    const { isPremium } = useAuth();
    const router = useRouter();
    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
                    <span>🎓</span> Student Guide
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Top Universities */}
                    <div className="bg-white p-5 rounded-xl shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <span>🏛️</span> Top Universities
                        </h3>
                        <ul className="space-y-2">
                            {guide.top_universities.slice(0, 10).map((uni, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
                                    <span>{uni}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Intake Seasons */}
                    <div className="bg-white p-5 rounded-xl shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <span>📅</span> Intake Seasons
                        </h3>
                        <div className="space-y-3">
                            {guide.intake_seasons.map((season, i) => (
                                <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                                    <span className="font-medium text-gray-800">{season.season}</span>
                                    <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-md text-xs">{season.deadline}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Platforms & Exams */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Application Platforms */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span>💻</span> Application Platforms
                    </h3>
                    <div className="space-y-4">
                        {guide.application_platforms.map((platform, i) => (
                            <div key={i} className="bg-gray-50 p-4 rounded-xl">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-semibold text-gray-900">{platform.name}</h4>
                                    {platform.url !== "N/A" && (
                                        <a href={platform.url} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors">
                                            Visit ↗
                                        </a>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">{platform.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Required Exams */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span>📝</span> Required Exams
                    </h3>
                    <div className="space-y-3">
                        {guide.required_exams.map((exam, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                <span className="text-orange-500 font-bold text-lg">•</span>
                                <span className="text-gray-800 font-medium">{exam}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pre-Visa Steps */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span>🚀</span> Pre-Visa Checklist
                </h3>
                <div className="relative pl-4 border-l-2 border-indigo-100 space-y-8">
                    {guide.pre_visa_steps.sort((a, b) => a.step_order - b.step_order).map((step, index) => {
                        // Show all for premium, but only first 2 for free users
                        const isLocked = !isPremium && index >= 2;

                        return (
                            <div key={index} className={`relative pl-6 ${isLocked ? 'blur-sm select-none opacity-50 pointer-events-none' : ''}`}>
                                {/* Dot */}
                                <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-white"></div>

                                <h4 className="text-base font-bold text-gray-900 mb-1">
                                    <span className="text-indigo-600 mr-2">{index + 1}.</span>
                                    {step.title}
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed mb-3">{step.description}</p>

                                {step.action_link && (
                                    <div className="mt-2">
                                        {isPremium ? (
                                            <a
                                                href={step.action_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                                            >
                                                <span>View Resource</span>
                                                <span>↗</span>
                                            </a>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push('/subscribe');
                                                }}
                                                className="inline-flex items-center gap-2 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                                            >
                                                <span>🔒 Premium Resource</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Premium Overlay */}
                {!isPremium && guide.pre_visa_steps.length > 2 && (
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white via-white/90 to-transparent flex flex-col items-center justify-center text-center p-6 z-10">
                        <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-3 text-2xl shadow-sm">
                            👑
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Unlock Full Checklist</h4>
                        <p className="text-gray-600 mb-6 max-w-xs">Upgrade to Premium to access the complete step-by-step visa roadmap.</p>
                        <button
                            onClick={() => router.push('/subscribe')}
                            className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            Upgrade Now - ₹250/year
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
