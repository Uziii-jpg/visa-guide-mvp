import React from 'react';

export default function TermsPage() {
    return (
        <div className="min-h-screen px-4 py-12 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Terms and Conditions</h1>
                <p className="text-sm text-gray-500">Last updated: December 8, 2025</p>

                <section className="space-y-2">
                    <h2 className="text-xl font-bold">1. Introduction</h2>
                    <p>Welcome to VisaGuide India. By using our website and services, you agree to these Terms and Conditions. If you do not agree, please do not use our services.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-bold">2. Services</h2>
                    <p>We provide automated visa guidance and information services. We are NOT a government agency. We act as an information provider to assist users in their visa application process.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-bold">3. User Accounts</h2>
                    <p>To access premium features, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-bold">4. Payments</h2>
                    <p>All payments are processed securely. Premium subscriptions grant access to valid visa guides for the specified duration.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-bold">5. Limitation of Liability</h2>
                    <p>We strive for accuracy, but visa rules change frequently. We are not liable for visa rejections, delays, or losses incurred due to reliance on our information. Always verify with official embassies.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-bold">6. Contact</h2>
                    <p>For any questions regarding these terms, please contact us at support@visaguide.live.</p>
                </section>
            </div>
        </div>
    );
}
