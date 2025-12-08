'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';

declare global {
    interface Window {
        Razorpay: any;
    }
}

const PLANS = [
    {
        id: '3_months',
        name: 'Quarterly',
        price: 75,
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

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubscribe = async (planId: string) => {
        if (!user) return alert('Please login first');
        setLoading(true);

        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setLoading(false);
            return;
        }

        try {
            // 1. Create Order
            const orderRes = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId }),
            });
            const orderData = await orderRes.json();

            if (orderData.error) throw new Error(orderData.error);

            // 2. Open Razorpay
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'VisaGuide India',
                description: `Subscription for ${planId}`,
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    const verifyRes = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            userId: user.uid,
                            planId: planId,
                        }),
                    });
                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        // 4. Update Firestore (Client-side for MVP)
                        // Ideally this happens on server, but we are doing it here to ensure it works with rules
                        const userRef = doc(db, 'users', user.uid);
                        await updateDoc(userRef, {
                            subscription_tier: 'premium',
                            subscription_plan: planId,
                            subscription_expiry: Timestamp.fromDate(new Date(verifyData.expiry)),
                            payment_history: arrayUnion({
                                order_id: response.razorpay_order_id,
                                payment_id: response.razorpay_payment_id,
                                amount: orderData.amount / 100,
                                date: Timestamp.now(),
                                plan: planId
                            })
                        });

                        alert('Payment Successful! You are now a Premium member.');
                        window.location.reload();
                    } else {
                        alert('Payment verification failed');
                    }
                },
                prefill: {
                    email: user.email,
                },
                theme: {
                    color: '#3399cc',
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error('Payment Error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
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
                            {loading ? 'Processing...' : `Choose ${plan.name}`}
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 opacity-80">
                <span className="material-symbols-outlined text-lg text-green-500">lock</span>
                <span>Secure payment via Razorpay. Cancel anytime.</span>
            </div>
        </div>
    );
}
