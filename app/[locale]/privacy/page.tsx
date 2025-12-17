import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen px-4 py-12 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Privacy Policy</h1>
                <p className="text-sm text-gray-500">Last updated: December 8, 2025</p>

                <section className="space-y-2">
                    <h2 className="text-xl font-bold">1. Information We Collect</h2>
                    <p>We collect information you provide directly to us, such as when you create an account, subscribe, or contact support. This includes your name, email address, and payment information (processed via PhonePe).</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-bold">2. How We Use Information</h2>
                    <p>We use your information to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-bold">3. Data Security</h2>
                    <p>We use industry-standard security measures (Firebase Auth, PhonePe Secure) to protect your personal information.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-bold">4. Cookies</h2>
                    <p>We use cookies to maintain your login session and improve site performance.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-bold">5. Contact Us</h2>
                    <p>If you have questions about this policy, contact us at support@visaguide.live.</p>
                </section>
            </div>
        </div>
    );
}
