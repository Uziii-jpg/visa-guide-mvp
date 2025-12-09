import React from 'react';
import { VisaMeta } from '@/types/visaSchema';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface VisaHeaderProps {
        countryCode: string;
        visaType: string;
        meta: VisaMeta;
        availableTypes: string[];
}

function getFlagEmoji(countryCode: string) {
        const codePoints = countryCode
                .toUpperCase()
                .split('')
                .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
}

export default function VisaHeader({ countryCode, visaType, meta, availableTypes }: VisaHeaderProps) {
        const t = useTranslations('VisaHeader');

        return (
                <header className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-900 text-white p-8 md:p-12 shadow-2xl">
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                        <div className="relative z-10">
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-8">
                                        <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
                                                <span className="text-5xl">{getFlagEmoji(countryCode)}</span>
                                        </div>
                                        <div>
                                                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">
                                                        {countryCode} {visaType.charAt(0).toUpperCase() + visaType.slice(1).toLowerCase()} Visa
                                                </h1>
                                                <div className="flex items-center gap-2 text-blue-100 text-lg">
                                                        <span>⏱️</span>
                                                        <span>{t('processingTime')}</span>
                                                        <span className="font-bold text-white">{meta.processing_time_standard}</span>
                                                </div>
                                        </div>
                                </div>

                                <div className="flex flex-wrap gap-4 mb-10">
                                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10 flex items-center gap-3 hover:bg-white/20 transition-all">
                                                <span className="text-2xl">💰</span>
                                                <div>
                                                        <p className="text-xs text-blue-200 uppercase font-bold">{t('fee')}</p>
                                                        <p className="font-bold text-lg">~€{meta.fee_euro_approx || meta.fee_euro_adult}</p>
                                                </div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10 flex items-center gap-3 hover:bg-white/20 transition-all">
                                                <span className="text-2xl">📅</span>
                                                <div>
                                                        <p className="text-xs text-blue-200 uppercase font-bold">{t('validity')}</p>
                                                        <p className="font-bold text-lg">{meta.max_stay}</p>
                                                </div>
                                        </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-2 p-1 bg-black/20 backdrop-blur-sm rounded-xl inline-flex overflow-x-auto max-w-full">
                                        {availableTypes.includes('TOURIST') && (
                                                <Link
                                                        href={`/visa/${countryCode}/TOURIST`}
                                                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${visaType === 'TOURIST'
                                                                ? 'bg-white text-blue-900 shadow-lg scale-105'
                                                                : 'text-blue-100 hover:bg-white/10'
                                                                }`}
                                                >
                                                        Tourist
                                                </Link>
                                        )}
                                        {availableTypes.includes('STUDENT') && (
                                                <Link
                                                        href={`/visa/${countryCode}/STUDENT`}
                                                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${visaType === 'STUDENT'
                                                                ? 'bg-white text-blue-900 shadow-lg scale-105'
                                                                : 'text-blue-100 hover:bg-white/10'
                                                                }`}
                                                >
                                                        Student
                                                </Link>
                                        )}
                                        {availableTypes.includes('WORK') && (
                                                <Link
                                                        href={`/visa/${countryCode}/WORK`}
                                                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${visaType === 'WORK'
                                                                ? 'bg-white text-blue-900 shadow-lg scale-105'
                                                                : 'text-blue-100 hover:bg-white/10'
                                                                }`}
                                                >
                                                        Work
                                                </Link>
                                        )}
                                </div>
                        </div>
                </header>
        );
}
