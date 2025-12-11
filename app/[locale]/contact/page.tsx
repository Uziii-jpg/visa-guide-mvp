import React from 'react';

export default function ContactPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
            <div className="max-w-3xl w-full space-y-8">
                <h1 className="text-4xl font-bold text-center">Contact Us</h1>

                <div className="space-y-4">
                    <p className="text-lg text-center text-gray-600 dark:text-gray-400">
                        We are here to help you with your visa application journey.
                    </p>

                    <div className="bg-gray-50 dark:bg-slate-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6">
                        <div>
                            <h3 className="text-xl font-bold mb-2">Customer Support</h3>
                            <p>Email: <a href="mailto:support@visaguide.live" className="text-blue-600 hover:underline">support@visaguide.live</a></p>
                            <p>Response Time: Within 24-48 hours</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-2">Direct Contact</h3>
                            <p>Email: <a href="mailto:uzairmanjre86@gmail.com" className="text-blue-600 hover:underline">uzairmanjre86@gmail.com</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
