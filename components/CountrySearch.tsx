'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CountrySearch() {
    const [country, setCountry] = useState('');
    const [visaType, setVisaType] = useState('TOURIST');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (country) {
            // Basic mapping or validation could go here
            // For now, assume user types 2-letter code or we'd need a lookup
            // Let's just redirect and let the page handle 404 if not found
            // Ideally, we'd have a dropdown of available countries
            router.push(`/visa/${country.toUpperCase()}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex items-center w-full bg-gray-100 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <span className="text-gray-400 mr-2">🔍</span>
            <input
                type="text"
                placeholder="Search destination..."
                className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
            />
        </form>
    );
}
