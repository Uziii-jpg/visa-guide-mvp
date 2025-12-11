'use client';

import React, { useState, useMemo } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { COUNTRY_NAMES } from '@/lib/countryMapping';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations, useLocale } from 'next-intl';
import { getDoodleAvatarUrl } from '@/lib/avatarUtils';

export default function Navbar() {
    const { user, logout, isPremium, isAdmin } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const t = useTranslations('Navbar');
    const locale = useLocale();

    const filteredCountries = useMemo(() => {
        if (!searchQuery) return [];
        const lowerQuery = searchQuery.toLowerCase();
        return Object.entries(COUNTRY_NAMES)
            .filter(([code, name]) =>
                name.toLowerCase().includes(lowerQuery) ||
                code.toLowerCase().includes(lowerQuery)
            )
            .map(([code, name]) => ({ code, name }))
            .slice(0, 8); // Limit results
    }, [searchQuery]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleSelectCountry = (code: string) => {
        router.push(`/visa/${code}/TOURIST`);
        setSearchQuery('');
        setShowDropdown(false);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (filteredCountries.length > 0) {
            handleSelectCountry(filteredCountries[0].code);
        } else if (searchQuery.length === 2) {
            // Fallback for direct code entry
            handleSelectCountry(searchQuery.toUpperCase());
        }
    };

    const getFlagEmoji = (countryCode: string) => {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex items-center justify-between h-full gap-4">
                    {/* Left: Logo & Nav */}
                    <div className="flex-shrink-0 flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                        >
                            <span className="material-symbols-outlined text-2xl">
                                {isMobileMenuOpen ? 'close' : 'menu'}
                            </span>
                        </button>

                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl">🌏</span>
                            <span className="font-bold text-xl text-gray-900 hidden sm:block">{t('brand')}</span>
                        </Link>
                        <Link href="/explore" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors hidden md:block">
                            {t('explore')}
                        </Link>
                    </div>

                    {/* Center: Search Bar */}
                    <div className="flex-1 max-w-2xl mx-4 relative hidden md:block">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-400 text-lg">🔍</span>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border-none rounded-xl bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-all"
                                placeholder={t('searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Delay to allow click
                            />
                        </form>

                        {/* Autocomplete Dropdown */}
                        {showDropdown && searchQuery.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto z-50">
                                {filteredCountries.length > 0 ? (
                                    filteredCountries.map((country) => (
                                        <button
                                            key={country.code}
                                            onClick={() => handleSelectCountry(country.code)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                                        >
                                            <span className="text-xl">{getFlagEmoji(country.code)}</span>
                                            <span className="text-sm font-medium text-gray-700">{country.name}</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                        {t('noCountries')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Auth / Profile */}
                    <div className="flex-shrink-0 flex items-center gap-3">
                        <div>
                            <LanguageSwitcher />
                        </div>
                        {isAdmin && (
                            <Link
                                href="/admin/editor"
                                className="hidden md:inline-flex text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors mr-2"
                            >
                                {t('adminEditor')}
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-3">
                                {isPremium && (
                                    <span className="hidden md:inline-flex bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
                                        {t('premium')}
                                    </span>
                                )}
                                {!isPremium && (
                                    <Link
                                        href="/subscribe"
                                        className="hidden md:inline-flex bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all mr-2"
                                    >
                                        UPGRADE
                                    </Link>
                                )}
                                <div className="relative group">
                                    <Link href="/profile" className="flex items-center gap-2 focus:outline-none">
                                        <div className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm hover:ring-blue-100 transition-all overflow-hidden bg-gray-100">
                                            <img
                                                src={user.photoURL || getDoodleAvatarUrl(user.uid || user.email || 'user')}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="hidden md:block max-w-[100px] truncate text-sm font-medium text-gray-700">
                                            {user.email}
                                        </span>
                                    </Link>

                                    {/* Dropdown */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50 hidden md:block">
                                        <div className="px-4 py-2 border-b border-gray-50 md:hidden">
                                            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                                            {isPremium && <p className="text-xs text-yellow-600 font-bold mt-0.5">{t('premium')} Member</p>}
                                        </div>
                                        {isAdmin && (
                                            <Link href="/admin/editor" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 md:hidden">
                                                {t('adminEditor')}
                                            </Link>
                                        )}
                                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            {t('profileSettings')}
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            {t('signOut')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
                                {t('logIn')} / {t('signUp')}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-white pt-16 px-4 pb-4 overflow-y-auto">
                    <div className="flex flex-col gap-6">
                        {/* Mobile Search */}
                        <form onSubmit={handleSearch} className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-400 text-lg">🔍</span>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base transition-all"
                                placeholder={t('searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowDropdown(true);
                                }}
                            />
                            {/* Mobile Search Dropdown */}
                            {searchQuery.length > 0 && (
                                <div className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                    {filteredCountries.length > 0 ? (
                                        filteredCountries.map((country) => (
                                            <button
                                                key={country.code}
                                                onClick={() => {
                                                    handleSelectCountry(country.code);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                <span className="text-xl">{getFlagEmoji(country.code)}</span>
                                                <span className="text-sm font-medium text-gray-700">{country.name}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                            {t('noCountries')}
                                        </div>
                                    )}
                                </div>
                            )}
                        </form>

                        <div className="flex flex-col gap-2">
                            <Link
                                href="/explore"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium"
                            >
                                <span className="material-symbols-outlined">explore</span>
                                {t('explore')}
                            </Link>

                            <div className="px-4 py-2">
                                <LanguageSwitcher />
                            </div>

                            {user && (
                                <>
                                    <div className="border-t border-gray-100 my-2"></div>
                                    <div className="px-4 py-2">
                                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                                        {isPremium && <p className="text-xs text-yellow-600 font-bold mt-0.5">{t('premium')} Member</p>}
                                    </div>

                                    {!isPremium && (
                                        <Link
                                            href="/subscribe"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-sm mx-4 justify-center"
                                        >
                                            <span className="material-symbols-outlined">diamond</span>
                                            UPGRADE TO PREMIUM
                                        </Link>
                                    )}

                                    <Link
                                        href="/profile"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium"
                                    >
                                        <span className="material-symbols-outlined">person</span>
                                        {t('profileSettings')}
                                    </Link>

                                    {isAdmin && (
                                        <Link
                                            href="/admin/editor"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium"
                                        >
                                            <span className="material-symbols-outlined">admin_panel_settings</span>
                                            {t('adminEditor')}
                                        </Link>
                                    )}

                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-medium w-full text-left"
                                    >
                                        <span className="material-symbols-outlined">logout</span>
                                        {t('signOut')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
