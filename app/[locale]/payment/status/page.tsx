'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function PaymentStatusContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, refreshUser } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'failure'>('loading');
    const [message, setMessage] = useState('Verifying payment details...');

    useEffect(() => {
        if (!user) return;

        const urlParams = new URLSearchParams(window.location.search);
        let paymentId = urlParams.get('razorpay_payment_id');

        // AUTO-SEARCH LOGIC
        const findAndClaim = async () => {
            // If already premium, stop?
            if (user.subscription_tier === 'premium') {
                setStatus('success');
                setMessage('Your subscription is active.');
                return;
            }

            if (!paymentId) {
                setMessage('Locating your payment details...');
                try {
                    const searchRes = await fetch('/api/payment/find-unclaimed', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.uid })
                    });
                    const searchData = await searchRes.json();

                    if (searchData.found && searchData.paymentId) {
                        paymentId = searchData.paymentId;
                        console.log('Found unclaimed payment:', paymentId);
                        // Convert to claim flow
                    } else {
                        setStatus('failure');
                        setMessage('Could not automatically find your payment. Please enter the Payment ID manually.');
                        return;
                    }
                } catch (e) {
                    console.error('Search error:', e);
                    setStatus('failure');
                    setMessage('Error searching for payment.');
                    return;
                }
            }

            // CLAIM LOGIC (If we have an ID now)
            if (paymentId) {
                let attempts = 0;
                const maxAttempts = 5;

                const claimLoop = async () => {
                    try {
                        const res = await fetch('/api/payment/claim', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                paymentId: paymentId,
                                userId: user.uid
                            })
                        });
                        const data = await res.json();

                        if (res.ok || (data.error && data.error.includes('already claimed'))) {
                            setStatus('success');
                            setMessage('Payment verified! Subscription activated.');
                            await refreshUser(); // NEW: Force UI to update
                            setTimeout(() => router.push('/profile'), 2000);
                        } else if (data.error && data.error.includes('not found') && attempts < maxAttempts) {
                            attempts++;
                            setTimeout(claimLoop, 2000);
                        } else {
                            throw new Error(data.error);
                        }
                    } catch (err: any) {
                        if (attempts < maxAttempts) {
                            attempts++;
                            setTimeout(claimLoop, 2000);
                        } else {
                            setStatus('failure');
                            setMessage(err.message || 'Verification failed.');
                        }
                    }
                };
                claimLoop();
            }
        };

        findAndClaim();

    }, [user, router, refreshUser]); // Added refreshUser dependency

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <h2 className="text-xl font-semibold">Confirming Payment...</h2>
                        <p className="text-sm text-gray-500">Linking payment {searchParams.get('razorpay_payment_id')} to your account.</p>
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
                    <div className="flex flex-col items-center gap-4 text-orange-600 w-full">
                        <span className="material-symbols-outlined text-6xl">info</span>
                        <h2 className="text-2xl font-bold">Payment Status</h2>
                        <p className="text-gray-600 dark:text-gray-300">{message}</p>

                        {/* Manual Claim Fallback */}
                        <div className="w-full max-w-xs mt-4 flex flex-col gap-2">
                            <p className="text-sm text-gray-500">
                                If you paid, enter the <strong>Payment ID</strong> (starts with `pay_`) provided by Razorpay or your bank:
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="pay_xxxxxxxx"
                                    className="border rounded px-3 py-2 w-full text-black"
                                    id="manualPaymentId"
                                />
                                <button
                                    onClick={() => {
                                        const pid = (document.getElementById('manualPaymentId') as HTMLInputElement).value;
                                        if (pid) {
                                            const newUrl = new URL(window.location.href);
                                            newUrl.searchParams.set('razorpay_payment_id', pid);
                                            router.push(newUrl.toString());
                                        }
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Claim
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 p-2 bg-gray-100 text-xs text-left w-full overflow-auto rounded">
                            <strong>Debug Info (URL Params):</strong>
                            <pre>{JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)}</pre>
                        </div>

                        <Link
                            href="/profile"
                            className="mt-4 px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PaymentStatusPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <PaymentStatusContent />
        </Suspense>
    );
}
