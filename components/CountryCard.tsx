import React from 'react';
import Link from 'next/link';
import { getCountryName } from '@/lib/countryMapping';

interface CountryCardProps {
    countryCode: string;
    popularity: number;
    image: string;
    isTrending?: boolean;
}

export default function CountryCard({ countryCode, popularity, image, isTrending }: CountryCardProps) {
    const name = getCountryName(countryCode);
    const difficulty = getDifficulty(countryCode);

    return (
        <Link href={`/visa/${countryCode}/TOURIST`} className="group block h-full">
            <div className="card-premium h-full flex flex-col relative overflow-hidden">
                {/* Image Section */}
                <div className="h-48 overflow-hidden relative">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-white/20">
                        <span className="text-2xl drop-shadow-sm">{getFlagEmoji(countryCode)}</span>
                    </div>

                    {isTrending && (
                        <div className="absolute top-3 right-3 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-md flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">trending_up</span>
                            Trending
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-display font-bold text-gray-900 dark:text-white text-xl line-clamp-1">{name}</h3>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${difficulty.color}`}>
                            {difficulty.label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Tourist Visa</span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Popularity</span>
                            <div className="flex items-center gap-1">
                                <div className="h-1.5 w-16 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                                        style={{ width: `${popularity}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{popularity}%</span>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">arrow_forward</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

function getDifficulty(code: string) {
    const hard = ['US', 'GB', 'CA', 'AU', 'NZ', 'IE'];
    const medium = ['DE', 'FR', 'IT', 'ES', 'NL', 'CH', 'SE', 'NO', 'DK'];

    if (hard.includes(code)) return { label: 'Strict', color: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' };
    if (medium.includes(code)) return { label: 'Moderate', color: 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' };
    return { label: 'Easy', color: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' };
}
