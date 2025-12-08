import React from 'react';
import { getVisaData } from '@/lib/visaDataFetcher';
import UniversityGuide from '@/components/UniversityGuide';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface PageProps {
    params: Promise<{
        country: string;
        type: string;
    }>;
}

export default async function UniversityGuidePage({ params }: PageProps) {
    const { country, type } = await params;

    // Only for Student visas
    if (type !== 'STUDENT') {
        redirect(`/visa/${country}/${type}`);
    }

    try {
        const data = await getVisaData(country, type);

        if (!data.university_guide) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">No University Guide Available</h1>
                        <Link href={`/visa/${country}/${type}`} className="text-blue-600 hover:underline">
                            Back to Visa Details
                        </Link>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-gray-50 pb-20">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <Link href={`/visa/${country}/${type}`} className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
                        ← Back to Visa Details
                    </Link>
                </div>

                <main className="max-w-4xl mx-auto px-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">University Admission Guide</h1>
                        <p className="text-gray-600">Comprehensive guide to applying for universities in {country}.</p>
                    </div>

                    <UniversityGuide guide={data.university_guide} />
                </main>
            </div>
        );
    } catch (error) {
        return <div>Error loading guide</div>;
    }
}
