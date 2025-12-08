import React from 'react';

export default function ShippingPage() {
    return (
        <div className="min-h-screen px-4 py-12 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Shipping and Delivery Policy</h1>
                <p className="text-sm text-gray-500">Last updated: December 8, 2025</p>

                <section className="space-y-2">
                    <h2 className="text-xl font-bold">1. Digital Delivery</h2>
                    <p>VisaGuide India deals exclusively in digital services. We do not sell or ship physical products.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-bold">2. Delivery Timing</h2>
                    <p>Upon successful payment, access to your premium features and visa guides is granted immediately (instantly). You will receive a confirmation email with your transaction details.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-bold">3. Access Issues</h2>
                    <p>If you do not receive access immediately after payment, please check your internet connection and refresh the page. If the issue persists, contact our support team at support@visaguide.live for assistance.</p>
                </section>
            </div>
        </div>
    );
}
