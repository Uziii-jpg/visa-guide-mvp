'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

function PaymentStatusContent() {
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

            if (paymentStatus === 'SUCCESS' || txnId) { // Check if we have indications of a transaction
                try {
                    // Call our Verification API
                    const response = await fetch('/api/payment/ekqr/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            txnId: txnId,
                            txnDate: searchParams.get('txnDate'),
                            userId: user.uid
                        })
                    });

                    const data = await response.json();

                    if (data.success) {
                        setStatus('success');
                        setMessage('Payment successful! Your subscription is active.');

                        // Redirect after 3 seconds
                        setTimeout(() => {
                            router.push('/profile');
                        }, 3000);
                    } else {
                        throw new Error(data.error || 'Verification failed');
                    }

                } catch (error) {
                    console.error('Error verifying payment:', error);
                    setStatus('failure');
                    setMessage('Payment verification failed. Please check your dashboard or contact support.');
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
