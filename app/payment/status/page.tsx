'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

export default function PaymentStatusPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'failure'>('loading');
    const [message, setMessage] = useState('Verifying payment...');

    useEffect(() => {
        const checkStatus = async () => {
            const paymentStatus = searchParams.get('status');
            const planId = searchParams.get('planId');
            const txnId = searchParams.get('txnId');
            const reason = searchParams.get('reason');

            if (!user) {
                // Wait for auth to initialize? 
                // Alternatively, we can just show success but fail to update firestore here if auth is lost.
                // But usually auth persists.
                // Let's assume user is logged in or we might encounter permission issues.
                // For MVP, simplistic check.
                return;
            }

            if (paymentStatus === 'SUCCESS') {
                try {
                    // Update Firestore
                    // NOTE: Ideally this should be done via webhook/API to be secure,
                    // but for MVP as per SubscriptionPlans.tsx, we are doing it client-side.
                    // Verification was done in the Callback API route before redirecting here,
                    // so we trust the 'SUCCESS' param for now (User could technically spoof URL but it's MVP).

                    // To be safer, we should probably have the API do the update.
                    // BUT, the implementation plan said: "If `status === 'SUCCESS'`, update Firestore User document (replicating existing logic...)"

                    const now = new Date();
                    let expiryDate = new Date();
                    if (planId === '1_year') expiryDate.setFullYear(now.getFullYear() + 1);
                    else if (planId === '6_months') expiryDate.setMonth(now.getMonth() + 6);
                    else if (planId === '3_months') expiryDate.setMonth(now.getMonth() + 3);

                    // Amount calculation for history
                    const PLANS: Record<string, number> = {
                        '1_year': 250,
                        '6_months': 150,
                        '3_months': 100,
                    };
                    const amount = PLANS[planId || ''] || 0;

                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, {
                        subscription_tier: 'premium',
                        subscription_plan: planId,
                        subscription_expiry: Timestamp.fromDate(expiryDate),
                        payment_history: arrayUnion({
                            order_id: txnId,
                            payment_id: txnId, // PhonePe doesn't give separate payment ID in this flow easily without looking up
                            amount: amount,
                            date: Timestamp.now(),
                            plan: planId,
                            provider: 'phonepe'
                        })
                    });

                    setStatus('success');
                    setMessage('Payment successful! Your subscription is active.');

                    // Redirect after 3 seconds
                    setTimeout(() => {
                        router.push('/profile');
                    }, 3000);

                } catch (error) {
                    console.error('Error updating profile:', error);
                    setStatus('failure');
                    setMessage('Payment successful but failed to update profile. Please contact support.');
                }
            } else {
                setStatus('failure');
                setMessage(reason === 'payment_cancelled' ? 'Payment cancelled.' : 'Payment failed.');
            }
        };

        if (user) {
            checkStatus();
        }
    }, [searchParams, user, router]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <h2 className="text-xl font-semibold">Verifying Payment...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4 text-green-600">
                        <span className="material-symbols-outlined text-6xl">check_circle</span>
                        <h2 className="text-2xl font-bold">Payment Successful!</h2>
                        <p className="text-gray-600 dark:text-gray-300">{message}</p>
                        <p className="text-sm text-gray-500">Redirecting to profile...</p>
                    </div>
                )}

                {status === 'failure' && (
                    <div className="flex flex-col items-center gap-4 text-red-600">
                        <span className="material-symbols-outlined text-6xl">error</span>
                        <h2 className="text-2xl font-bold">Payment Failed</h2>
                        <p className="text-gray-600 dark:text-gray-300">{message}</p>
                        <Link
                            href="/subscribe"
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
