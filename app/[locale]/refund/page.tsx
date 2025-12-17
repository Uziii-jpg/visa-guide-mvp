import React from 'react';

export default function RefundPage() {
    return (
        <div className="min-h-screen px-4 py-12 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Cancellation and Refund Policy</h1>
                <p className="text-sm text-gray-500">Last updated: December 8, 2025</p>

                <section className="space-y-2">
                    <h2 className="text-xl font-bold">1. Digital Services</h2>
                    <p>VisaGuide India provides immediate access to digital content and automated tools upon subscription. Due to the nature of digital goods, we generally do not offer refunds once the service has been accessed or used.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-bold">2. Cancellation</h2>
                    <p>You may cancel your subscription renewal at any time through your profile settings. Your access will continue until the end of the current billing period.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-bold">3. Exceptional Refunds</h2>
                    <p>We may consider refund requests on a case-by-case basis if:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>There was a technical error preventing access to the service.</li>
                        <li>You were charged incorrectly due to a system error.</li>
                    </ul>
                    <p>To request a refund, please contact support@visaguide.live within 5 days of the transaction.</p>
                    <p className="mt-2 font-medium">Once the refund is approved, the amount will be credited to the original payment method within 7-10 business days.</p>
                </section>
            </div>
        </div>
    );
}
