'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';
import { calculateTimeline, TimelineResult } from '@/lib/dateLogic';

interface VisaTimelineProps {
    processingTime: string;
}

export default function VisaTimeline({ processingTime }: VisaTimelineProps) {
    const { isPremium } = useAuth();
    const router = useRouter();
    const [travelDate, setTravelDate] = useState<string>('');
    const [timeline, setTimeline] = useState<TimelineResult | null>(null);

    useEffect(() => {
        if (travelDate) {
            const date = new Date(travelDate);
            if (!isNaN(date.getTime())) {
                setTimeline(calculateTimeline(date, processingTime));
            }
        }
    }, [travelDate, processingTime]);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getDaysFromNow = (date: Date) => {
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span>⏳</span> Visa Timeline Simulator
                    </h3>
                    <p className="text-sm text-gray-500">Plan your application to avoid delays.</p>
                </div>

                <div className="relative group">
                    <label htmlFor="travelDate" className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">Intended Travel Date</label>
                    <div className="relative">
                        <input
                            id="travelDate"
                            name="travelDate"
                            type="date"
                            className="peer w-full bg-gray-50 border-2 border-gray-200 text-gray-900 text-lg font-bold rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer shadow-sm hover:border-gray-300"
                            value={travelDate}
                            onChange={(e) => setTravelDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-blue-500 transition-colors pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {!travelDate ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500">Select your travel date above to generate your personalized timeline.</p>
                </div>
            ) : timeline ? (
                <div className="space-y-6">
                    {/* Timeline Visual */}
                    <div className="relative pt-8 pb-4 px-4">
                        {/* Base Line */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>

                        {/* Events */}
                        <div className="relative flex justify-between text-xs font-medium text-gray-500">
                            {/* Today */}
                            <div className="absolute left-0 -top-8 flex flex-col items-center">
                                <span className="mb-1 font-bold text-gray-900">Today</span>
                                <div className="w-3 h-3 bg-gray-900 rounded-full ring-4 ring-white"></div>
                            </div>

                            {/* Earliest Apply */}
                            {isPremium && (
                                <div className="absolute left-[20%] -top-8 flex flex-col items-center">
                                    <span className="mb-1 text-green-600">Earliest Apply</span>
                                    <div className="w-3 h-3 bg-green-500 rounded-full ring-4 ring-white"></div>
                                    <span className="mt-2">{formatDate(timeline.earliestApplyDate)}</span>
                                </div>
                            )}

                            {/* Recommended */}
                            {isPremium ? (
                                <div className="absolute left-[50%] -top-8 flex flex-col items-center">
                                    <span className="mb-1 text-blue-600 font-bold">Recommended</span>
                                    <div className="w-4 h-4 bg-blue-600 rounded-full ring-4 ring-white shadow-sm"></div>
                                    <span className="mt-2 font-bold text-blue-700">{formatDate(timeline.recommendedApplyDate)}</span>
                                </div>
                            ) : (
                                <div className="absolute left-[50%] -top-8 flex flex-col items-center opacity-50 blur-[2px]">
                                    <span className="mb-1">Recommended</span>
                                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                    <span className="mt-2">Hidden</span>
                                </div>
                            )}

                            {/* Deadline */}
                            <div className="absolute right-[10%] -top-8 flex flex-col items-center">
                                <span className="mb-1 text-red-600 font-bold">Latest Deadline</span>
                                <div className="w-3 h-3 bg-red-500 rounded-full ring-4 ring-white"></div>
                                <span className="mt-2 text-red-700">{formatDate(timeline.latestApplyDate)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Analysis Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        {/* Card 1: Processing Time */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Processing Time</h4>
                            <p className="text-lg font-bold text-gray-900">{processingTime}</p>
                            <p className="text-xs text-gray-500 mt-1">~{timeline.processingDays.max} Days</p>
                        </div>

                        {/* Card 2: Status */}
                        <div className={`p-4 rounded-xl border ${getDaysFromNow(timeline.latestApplyDate) < 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                            <h4 className={`text-xs font-bold uppercase mb-1 ${getDaysFromNow(timeline.latestApplyDate) < 0 ? 'text-red-600' : 'text-green-600'}`}>Status</h4>
                            {getDaysFromNow(timeline.latestApplyDate) < 0 ? (
                                <p className="text-sm font-bold text-red-700">Too Late to Apply!</p>
                            ) : (
                                <p className="text-sm font-bold text-green-700">
                                    {getDaysFromNow(timeline.latestApplyDate)} days left to apply
                                </p>
                            )}
                        </div>

                        {/* Card 3: Premium Advice */}
                        {/* Card 3: Premium Advice */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100 relative overflow-hidden">
                            {!isPremium && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex flex-col items-center justify-center text-center p-2">
                                    <p className="text-xs font-bold text-indigo-900 mb-1">Unlock Smart Dates</p>
                                    <button
                                        onClick={() => router.push('/subscribe')}
                                        className="text-[10px] bg-indigo-600 text-white px-3 py-1.5 rounded-full font-bold shadow-sm hover:bg-indigo-700"
                                    >
                                        Upgrade
                                    </button>
                                </div>
                            )}
                            <h4 className="text-xs font-bold text-indigo-800 uppercase mb-1">Smart Advice</h4>
                            <p className={`text-sm text-indigo-900 ${!isPremium ? 'blur-sm select-none' : ''}`}>
                                {isPremium ? (
                                    <>Apply by <strong>{formatDate(timeline.recommendedApplyDate)}</strong> to have a 2-week safety buffer.</>
                                ) : (
                                    // Dummy content for security - not the real date
                                    <>Apply by <strong>Jan 15, 2025</strong> to have a 2-week safety buffer.</>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
