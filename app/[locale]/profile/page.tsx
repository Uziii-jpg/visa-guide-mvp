'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, Link } from '@/i18n/routing';
import MasterProfile from '@/components/MasterProfile';

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
                    <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
                    <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <MasterProfile />
    );
}
