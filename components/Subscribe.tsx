"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Script from 'next/script';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { doc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';



export default function Subscribe() {
    const { user, isPremium } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'1_year' | '6_months' | '3_months'>('1_year');
    const locale = useLocale();



    const PLANS = {
        '1_year': {
            id: '1_year',
            name: 'Yearly',
            price: 250,
            duration: '1 Year',
            label: 'Best Value'
        },
        '6_months': {
            id: '6_months',
            name: 'Bi-Annual',
            price: 150,
            duration: '6 Months',
            label: 'Popular'
        },
        '3_months': {
            id: '3_months',
            name: 'Quarterly',
            price: 100,
            duration: '3 Months',
            label: 'Starter'
        }
    };

    const handlePayment = async (planId: string) => {
        if (!user) {
            router.push('/login?redirect=/subscribe');
            return;
        }

        setLoading(true);

        try {
            // PhonePe Flow
            const response = await fetch('/api/payment/phonepe/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    userId: user.uid,
                    locale
                }),
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            if (data.url) {
                // Redirect to PhonePe
                window.location.href = data.url;
            } else {
                throw new Error('No redirect URL received');
            }

        } catch (error) {
            console.error('Payment Error:', error);
            alert('Something went wrong. Please try again.');
            setLoading(false); // Only stop loading on error, otherwise we are redirecting
        }
    };

    return (
        <>


            <div className="relative flex min-h-screen w-full flex-col items-center p-4 sm:p-6 md:p-8 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-display">
                <div className="layout-content-container flex w-full max-w-5xl flex-1 flex-col items-center gap-10 py-5">
                    <div className="w-full text-center">
                        <div className="flex flex-col gap-4">
                            <h1 className="text-5xl font-black leading-tight text-text-light dark:text-text-dark md:text-6xl">
                                Choose your <span className="font-serif italic font-normal text-blue-600">plan.</span>
                            </h1>
                            <p className="mx-auto max-w-2xl text-lg text-subtle-light dark:text-subtle-dark">
                                Unlock expert tools, AI reviews, and unlimited access.
                            </p>
                        </div>
                    </div>

                    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
                        {/* 3 Months Plan */}
                        <div className={`relative flex flex-col gap-6 rounded-2xl border-2 p-6 transition-all cursor-pointer ${selectedPlan === '3_months' ? 'border-blue-600 bg-blue-50 dark:bg-slate-900 shadow-xl scale-105 z-10' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-slate-800 hover:border-blue-300'}`}
                            onClick={() => setSelectedPlan('3_months')}>
                            <div className="flex flex-col gap-2">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quarterly</h2>
                                <p className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">₹100</span>
                                    <span className="text-sm text-gray-500">/ 3 mo</span>
                                </p>
                                <p className="text-xs text-gray-500">Great for short trips</p>
                            </div>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> All Premium Features</li>
                                <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> 3 Months Access</li>
                            </ul>
                            <div className="mt-auto">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan === '3_months' ? 'border-blue-600' : 'border-gray-300'}`}>
                                    {selectedPlan === '3_months' && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                                </div>
                            </div>
                        </div>

                        {/* 6 Months Plan */}
                        <div className={`relative flex flex-col gap-6 rounded-2xl border-2 p-6 transition-all cursor-pointer ${selectedPlan === '6_months' ? 'border-blue-600 bg-blue-50 dark:bg-slate-900 shadow-xl scale-105 z-10' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-slate-800 hover:border-blue-300'}`}
                            onClick={() => setSelectedPlan('6_months')}>
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                                POPULAR
                            </div>
                            <div className="flex flex-col gap-2">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bi-Annual</h2>
                                <p className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">₹150</span>
                                    <span className="text-sm text-gray-500">/ 6 mo</span>
                                </p>
                                <p className="text-xs text-gray-500">Perfect for semester exchange</p>
                            </div>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> All Premium Features</li>
                                <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> 6 Months Access</li>
                            </ul>
                            <div className="mt-auto">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan === '6_months' ? 'border-blue-600' : 'border-gray-300'}`}>
                                    {selectedPlan === '6_months' && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                                </div>
                            </div>
                        </div>

                        {/* 1 Year Plan */}
                        <div className={`relative flex flex-col gap-6 rounded-2xl border-2 p-6 transition-all cursor-pointer ${selectedPlan === '1_year' ? 'border-blue-600 bg-blue-50 dark:bg-slate-900 shadow-xl scale-105 z-10' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-slate-800 hover:border-blue-300'}`}
                            onClick={() => setSelectedPlan('1_year')}>
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
                                BEST VALUE
                            </div>
                            <div className="flex flex-col gap-2">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Yearly</h2>
                                <p className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">₹250</span>
                                    <span className="text-sm text-gray-500">/ year</span>
                                </p>
                                <p className="text-xs text-gray-500">For the frequent traveler</p>
                            </div>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> All Premium Features</li>
                                <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> 1 Year Access</li>
                                <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> Priority Support</li>
                            </ul>
                            <div className="mt-auto">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan === '1_year' ? 'border-blue-600' : 'border-gray-300'}`}>
                                    {selectedPlan === '1_year' && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Checkout Section */}
                    <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mt-8">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-600 dark:text-gray-400">Total to pay:</span>
                            <span className="text-3xl font-black text-gray-900 dark:text-white">₹{PLANS[selectedPlan].price}</span>
                        </div>

                        <button
                            onClick={() => handlePayment(selectedPlan)}
                            disabled={loading || isPremium}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : isPremium ? (
                                'Already Premium'
                            ) : (
                                `Pay with PhonePe (₹${PLANS[selectedPlan].price})`
                            )}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4">
                            Secured by PhonePe. Cancel anytime.
                        </p>
                    </div>



                </div>
            </div>
        </>
    );
}
