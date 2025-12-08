import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getVisaData, getAvailableVisaTypes } from '@/lib/visaDataFetcher';
import VisaHeader from '@/components/VisaHeader';
import VisaRequirementList from '@/components/VisaRequirementList';
import VisaSteps from '@/components/VisaSteps';
import UniversityGuide from '@/components/UniversityGuide';
import UniversityGuideTeaser from '@/components/UniversityGuideTeaser';
import EligibilityCheck from '@/components/EligibilityCheck';
import VisaTimeline from '@/components/VisaTimeline';
import CoverLetterGenerator from '@/components/CoverLetterGenerator';
import Link from 'next/link';
import ViewTracker from '@/components/ViewTracker';

interface PageProps {
    params: Promise<{
        country: string;
        type: string;
        locale: string;
    }>;
}

import { useTranslations } from 'next-intl';
import { Metadata } from 'next';
import { getCountryName } from '@/lib/countryMapping';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { country, type, locale } = await params;

    // Fetch data to get accurate titles (handling potential errors gracefully)
    try {
        const data = await getVisaData(country, type, locale);
        const countryName = getCountryName(country);
        const title = `${countryName} ${type === 'STUDENT' ? 'Student' : 'Tourist'} Visa Requirements for Indians (2025)`;
        const description = `Complete guide for Indian citizens applying for a ${countryName} ${type} visa. Fees, documents, processing time, and step-by-step process.`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'article',
                locale: locale,
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
            }
        };
    } catch (e) {
        return {
            title: `${country} Visa Guide - VisaMaster`,
            description: `Visa requirements and guide for ${country}.`
        };
    }
}

export default async function VisaPage({ params }: PageProps) {
    const { country, type, locale } = await params;
    // Note: We can't use hook directly in async server component like this for *client* components, 
    // but for server rendered text it's fine if we use getTranslations or useTranslations in a client component.
    // However, VisaPage is a Server Component. We should use getTranslations.

    // Actually, let's keep it simple. We can use getTranslations from next-intl/server
    const t = await getTranslations({ locale, namespace: 'VisaPage' });

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `${country} ${type} Visa Application Guide`,
        description: `Step-by-step guide to apply for a ${country} ${type} visa for Indian citizens.`,
        step: [
            {
                '@type': 'HowToStep',
                name: 'Check Eligibility',
                text: 'Verify if you meet the requirements for this visa type.'
            },
            {
                '@type': 'HowToStep',
                name: 'Gather Documents',
                text: 'Collect all necessary documents including passport, photos, and financial proof.'
            },
            {
                '@type': 'HowToStep',
                name: 'Apply Online/Offline',
                text: 'Submit your application through the official portal or embassy.'
            }
        ]
    };

    try {
        const data = await getVisaData(country, type, locale);
        const availableTypes = await getAvailableVisaTypes(country);

        return (
            <div className="min-h-screen bg-gray-50 pb-20 relative overflow-x-hidden">
                {/* Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                {/* Global Background Pattern */}
                <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4338ca 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                <div className="relative z-10">
                    <ViewTracker countryCode={country} visaType={type} />

                    {/* Navigation Breadcrumb */}
                    <div className="max-w-4xl mx-auto px-6 py-6">
                        <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
                            ← {t('backToHome')}
                        </Link>
                    </div>

                    <main className="max-w-4xl mx-auto px-6">
                        <VisaHeader
                            countryCode={data.country_code}
                            visaType={type}
                            meta={data.meta}
                            availableTypes={availableTypes}
                        />

                        {data.university_guide && (
                            <UniversityGuideTeaser countryCode={data.country_code} visaType={type} />
                        )}

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2">
                                {data.eligibility && <EligibilityCheck criteria={data.eligibility} />}

                                {/* Visa Timeline Simulator */}
                                <VisaTimeline processingTime={data.meta.processing_time_standard} />

                                {/* AI Cover Letter Generator */}
                                <CoverLetterGenerator countryName={country} visaType={type} />

                                <VisaRequirementList documents={data.documents} />
                                <VisaSteps
                                    steps={data.steps_flow}
                                    countryCode={data.country_code}
                                    visaType={type}
                                />
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                                    <h3 className="font-bold text-gray-900 mb-4">{t('needAssistance')}</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {t('assistanceDesc')}
                                    </p>
                                    <button className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">
                                        {t('talkToExpert')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    } catch (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-300 mb-4">{t('notFoundTitle')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('notFoundDesc', { country, type })}</p>
                    <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl">
                        {t('goHome')}
                    </Link>
                </div>
            </div>
        );
    }
}
