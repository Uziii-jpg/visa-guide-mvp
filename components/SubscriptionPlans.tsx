'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Script from 'next/script';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';



const PLANS = [
    {
        id: '3_months',
        name: 'Quarterly',
        price: 100,
        duration: '3 Months',
        features: ['Basic Visa Guides', '3 Months Access'],
        color: 'bg-blue-50 border-blue-200',
        btnColor: 'bg-blue-600 hover:bg-blue-700',
    },
    {
        id: '6_months',
        name: 'Half-Yearly',
        price: 125,
        duration: '6 Months',
        features: ['All Visa Guides', '6 Months Access', 'Priority Support'],
        color: 'bg-purple-50 border-purple-200',
        btnColor: 'bg-purple-600 hover:bg-purple-700',
    },
    {
        id: '1_year',
        name: 'Yearly',
        price: 250,
        duration: '1 Year',
        features: ['All Visa Guides', '1 Year Access', 'Priority Support', 'Best Value'],
        color: 'bg-yellow-50 border-yellow-200 ring-2 ring-yellow-400',
        btnColor: 'bg-yellow-600 hover:bg-yellow-700',
        popular: true,
    },
];

export default function SubscriptionPlans() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const locale = useLocale();
    const [qrData, setQrData] = useState<{ image: string, txnId: string } | null>(null);
    const router = useRouter();

    const handleSubscribe = async (planId: string) => {
        if (!user) return alert('Please login first');

        setLoading(true);

        try {
            // Decentro Flow
            const response = await fetch('/api/payment/decentro/initiate', {
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

            if (data.qrImage) {
                setQrData({ image: data.qrImage, txnId: data.decentroTxnId });
                // Start polling
                const pollInterval = setInterval(async () => {
                    try {
                        const statusRes = await fetch('/api/payment/decentro/status', {
                            method: 'POST',
                            body: JSON.stringify({ decentroTxnId: data.decentroTxnId })
                        });
                        const statusData = await statusRes.json();
                        // Decentro Status: PENDING, SUCCESS, FAILED
                        const txStatus = statusData.data?.transaction_status;

                        if (txStatus === 'SUCCESS') {
                            clearInterval(pollInterval);
                            router.push(`/payment/status?status=SUCCESS&planId=${planId}&txnId=${data.decentroTxnId}`);
                        } else if (txStatus === 'FAILED' || txStatus === 'EXPIRED') {
                            clearInterval(pollInterval);
                            alert('Payment Failed or Expired');
                            setQrData(null);
                            setLoading(false);
                        }
                    } catch (e) {
                        console.error('Polling error', e);
                    }
                }, 3000);

            } else {
                throw new Error('No QR Code received');
            }

        } catch (error) {
            console.error('Payment Error:', error);
            alert('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <>


            <div className="flex flex-col gap-8 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`card-premium relative p-8 flex flex-col ${plan.popular
                                ? 'border-2 border-accent shadow-xl scale-105 z-10'
                                : 'hover:shadow-xl hover:-translate-y-1'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wider uppercase flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">star</span>
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className={`text-lg font-bold ${plan.popular ? 'text-accent' : 'text-gray-900 dark:text-white'}`}>
                                    {plan.name}
                                </h3>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">₹{plan.price}</span>
                                    <span className="ml-1 text-sm font-semibold text-gray-500 dark:text-gray-400">/{plan.duration}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    {plan.id === '1_year' ? 'Best value for long-term planning' : 'Perfect for short trips'}
                                </p>
                            </div>

                            <ul className="space-y-4 flex-1 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-accent/10 text-accent' : 'bg-green-100 text-green-600'}`}>
                                            <span className="material-symbols-outlined text-sm font-bold">check</span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{feature}</p>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={loading}
                                className={`w-full block rounded-xl py-3.5 px-3 text-center text-sm font-bold shadow-lg transition-all duration-200 ${plan.popular
                                    ? 'bg-accent hover:bg-amber-600 text-white hover:shadow-accent/30'
                                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading ? 'Processing...' : `Pay Now`}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 opacity-80">
                    <span className="material-symbols-outlined text-lg text-green-500">lock</span>
                    <span>Secure payment. Cancel anytime.</span>
                </div>

                {qrData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Scan to Pay</h3>
                            <p className="text-gray-500 mb-6 text-center">Open any UPI app and scan the QR code to complete your payment.</p>

                            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 mb-6">
                                <img src={qrData.image} alt="Payment QR" className="w-64 h-64 object-contain" />
                            </div>

                            <div className="flex items-center gap-2 text-blue-600 mb-6">
                                <span className="animate-spin text-xl">◌</span>
                                <span className="font-semibold">Waiting for payment...</span>
                            </div>

                            <button
                                onClick={() => { setQrData(null); setLoading(false); }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium transition-colors"
                            >
                                Cancel Transaction
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
