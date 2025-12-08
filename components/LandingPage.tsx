import React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function LandingPage() {
    const locale = useLocale();
    const t = useTranslations('LandingPage');
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden font-body bg-background-light text-text-light dark:bg-background-dark dark:text-text-dark">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-light/30 blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[100px]"></div>
            </div>

            <div className="relative z-10 flex h-full grow flex-col">
                <div className="flex flex-1 justify-center py-5">
                    <div className="flex w-full flex-col max-w-[1200px] px-4 md:px-8 flex-1">

                        <main className="flex flex-col gap-20 md:gap-32 py-12 md:py-20">

                            {/* Hero Section */}
                            <div className="flex flex-col items-center text-center gap-8 py-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light/50 dark:bg-primary-dark/50 border border-primary/20 text-primary-dark dark:text-primary-light text-sm font-medium animate-fade-in-up">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                    {t('expertAssistance')}
                                </div>

                                <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary to-gray-900 dark:from-white dark:via-primary-light dark:to-white max-w-4xl"
                                    dangerouslySetInnerHTML={{ __html: t.raw('heroTitle') }}
                                />

                                <p className="text-lg md:text-xl text-subtext-light dark:text-subtext-dark max-w-2xl leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: t.raw('heroSubtitle') }}
                                />

                                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-4">
                                    <Link href={`/${locale}/signup`} className="flex-1 flex items-center justify-center h-14 rounded-full bg-primary hover:bg-primary-dark text-white text-lg font-bold shadow-button hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                        {t('getStarted')}
                                    </Link>
                                    <Link href={`/${locale}/explore`} className="flex-1 flex items-center justify-center h-14 rounded-full bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                                        {t('exploreVisas')}
                                    </Link>
                                </div>

                                {/* Trust Signals */}
                                <div className="flex flex-col items-center gap-4 mt-8 opacity-80">
                                    <p className="text-sm font-medium text-subtext-light dark:text-subtext-dark uppercase tracking-widest">{t('trustedBy')}</p>
                                    <div className="flex flex-wrap justify-center gap-8 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                        {['USA', 'UK', 'Canada', 'Australia', 'Schengen'].map((country) => (
                                            <span key={country} className="text-xl font-bold font-display text-gray-400 dark:text-gray-500">{country}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* How it Works - Glass Cards */}
                            <div className="flex flex-col gap-12">
                                <div className="text-center">
                                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">{t('journeyTitle')}</h2>
                                    <p className="text-subtext-light dark:text-subtext-dark max-w-xl mx-auto">{t('journeySubtitle')}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[
                                        { icon: 'travel_explore', title: t('step1Title'), desc: t('step1Desc') },
                                        { icon: 'smart_toy', title: t('step2Title'), desc: t('step2Desc') },
                                        { icon: 'flight_takeoff', title: t('step3Title'), desc: t('step3Desc') }
                                    ].map((step, idx) => (
                                        <div key={idx} className="card-premium p-8 flex flex-col items-center text-center gap-4 group">
                                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                                <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                                            <p className="text-subtext-light dark:text-subtext-dark leading-relaxed">{step.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Features - Bento Grid Style */}
                            <div className="flex flex-col gap-12">
                                <div className="text-center">
                                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">{t('whyTitle')}</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 card-premium p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-accent/20"></div>
                                        <div className="flex-1 z-10">
                                            <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center mb-6">
                                                <span className="material-symbols-outlined text-2xl">savings</span>
                                            </div>
                                            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{t('saveFeesTitle')}</h3>
                                            <p className="text-subtext-light dark:text-subtext-dark text-lg">{t('saveFeesDesc')}</p>
                                        </div>
                                        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-300 border border-gray-100 dark:border-gray-700">
                                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                                                <span className="text-sm font-bold text-gray-500">{t('consultant')}</span>
                                                <span className="text-red-500 font-bold">₹50,000</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-primary">VisaGuide</span>
                                                <span className="text-green-500 font-bold">{t('free')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-premium p-8 flex flex-col justify-center relative overflow-hidden group">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                                            <span className="material-symbols-outlined text-2xl">update</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t('upToDateTitle')}</h3>
                                        <p className="text-subtext-light dark:text-subtext-dark">{t('upToDateDesc')}</p>
                                    </div>

                                    <div className="card-premium p-8 flex flex-col justify-center relative overflow-hidden group">
                                        <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-6">
                                            <span className="material-symbols-outlined text-2xl">verified_user</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t('expertVerifiedTitle')}</h3>
                                        <p className="text-subtext-light dark:text-subtext-dark">{t('expertVerifiedDesc')}</p>
                                    </div>

                                    <div className="lg:col-span-2 card-premium p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                                        <div className="flex-1 z-10">
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                                                <span className="material-symbols-outlined text-2xl">psychology</span>
                                            </div>
                                            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{t('eligibilityTitle')}</h3>
                                            <p className="text-subtext-light dark:text-subtext-dark text-lg">{t('eligibilityDesc')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Section */}
                            <div className="relative rounded-3xl overflow-hidden bg-primary text-white p-12 text-center">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="relative z-10 flex flex-col items-center gap-6">
                                    <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">{t('ctaTitle')}</h2>
                                    <p className="text-primary-light text-lg max-w-2xl">{t('ctaSubtitle')}</p>
                                    <Link href={`/${locale}/signup`} className="mt-4 px-8 py-4 bg-white text-primary text-lg font-bold rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300">
                                        {t('createAccount')}
                                    </Link>
                                    <p className="text-sm text-primary-light opacity-80">{t('noCreditCard')}</p>
                                </div>
                            </div>

                        </main>

                        {/* Footer */}
                        <footer className="border-t border-border-light dark:border-border-dark py-10">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🌏</span>
                                    <span className="font-bold text-lg">VisaGuide</span>
                                </div>
                                <div className="flex gap-8 text-sm text-subtext-light dark:text-subtext-dark">
                                    <Link className="hover:text-primary transition-colors" href="#">{t('privacy')}</Link>
                                    <Link className="hover:text-primary transition-colors" href="#">{t('terms')}</Link>
                                    <Link className="hover:text-primary transition-colors" href="#">{t('support')}</Link>
                                </div>
                                <p className="text-sm text-subtext-light dark:text-subtext-dark">{t('copyright')}</p>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
