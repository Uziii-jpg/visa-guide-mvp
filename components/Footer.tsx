import { Link } from '@/i18n/routing';
import React from 'react';

export default function Footer() {
    return (
        <footer className="w-full bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 py-12 px-4 mt-auto">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">

                {/* Brand */}
                <div className="text-center md:text-left">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">VisaGuide India</h2>
                    <p className="text-sm text-gray-500 mt-2">Simplify your visa journey.</p>
                </div>

                {/* Links */}
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link>
                    <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms & Conditions</Link>
                    <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
                    <Link href="/refund" className="hover:text-blue-600 transition-colors">Refund Policy</Link>
                </div>

                {/* Copyright & Proprietor Info */}
                <div className="text-xs text-gray-400 flex flex-col items-center md:items-end gap-1">
                    <span>&copy; {new Date().getFullYear()} VisaGuide India. All rights reserved.</span>
                    <div className="flex flex-col items-center md:items-end opacity-70 leading-relaxed">
                        <span>Proprietor: UZAIR SHAUKAT MANJRE</span>
                        <span>Email: manjreu@gmail.com</span>
                        <span>Contact: 9898034231</span>
                        <span>Address: 4 sejal soc fateghunj vadodadar</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
