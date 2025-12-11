'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';
import { jsPDF } from 'jspdf';
import { User } from '@/types/user';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CoverLetterGeneratorProps {
    countryName: string;
    visaType: string;
}

import { generateStudentCoverLetter, generateTouristCoverLetter } from '@/lib/coverLetterTemplates';

interface CoverLetterGeneratorProps {
    countryName: string;
    visaType: string;
}

export default function CoverLetterGenerator({ countryName, visaType }: CoverLetterGeneratorProps) {
    const { user, isPremium } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [generatedText, setGeneratedText] = useState('');

    // Dynamic Inputs
    const [targetUniversity, setTargetUniversity] = useState('');
    const [targetCourse, setTargetCourse] = useState('');
    const [travelDates, setTravelDates] = useState('');
    const [travelReason, setTravelReason] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setProfile(docSnap.data() as User);
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            }
        };
        fetchProfile();
    }, [user]);

    const generateContent = () => {
        const data = {
            user: profile,
            countryName,
            visaType,
            targetUniversity,
            targetCourse,
            travelDates,
            travelReason
        };

        if (visaType === 'STUDENT') {
            return generateStudentCoverLetter(data);
        } else {
            // Default to Tourist for now, or expand logic later
            return generateTouristCoverLetter(data);
        }
    };

    useEffect(() => {
        setGeneratedText(generateContent());
    }, [profile, countryName, visaType, targetUniversity, targetCourse, travelDates, travelReason]);

    const handleDownloadPDF = () => {
        if (!isPremium) {
            router.push('/subscribe');
            return;
        }

        setLoading(true);
        const doc = new jsPDF();

        // Set font
        doc.setFont("helvetica");

        // Title
        doc.setFontSize(16);
        doc.text("Cover Letter", 105, 20, { align: "center" });

        // Body
        doc.setFontSize(11);
        const splitText = doc.splitTextToSize(generatedText, 170);
        doc.text(splitText, 20, 40);

        // Save
        doc.save(`${countryName}_Cover_Letter.pdf`);
        setLoading(false);
    };

    const isStudent = visaType === 'STUDENT';

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span>📝</span> AI Cover Letter Generator
                    </h3>
                    <p className="text-sm text-gray-500">Instantly generate a professional, niche-specific cover letter.</p>
                </div>
                {isPremium && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                        PREMIUM UNLOCKED
                    </span>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h4 className="font-semibold text-blue-900 mb-2 text-sm">Customize Your Letter</h4>
                        <div className="space-y-3">
                            {isStudent ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-blue-800 mb-1">Target University</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. University of Melbourne"
                                            className="w-full text-sm p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={targetUniversity}
                                            onChange={(e) => setTargetUniversity(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-blue-800 mb-1">Course Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Master of Data Science"
                                            className="w-full text-sm p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={targetCourse}
                                            onChange={(e) => setTargetCourse(e.target.value)}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-blue-800 mb-1">Travel Dates</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 10th Dec to 25th Dec 2025"
                                            className="w-full text-sm p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={travelDates}
                                            onChange={(e) => setTravelDates(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-blue-800 mb-1">Main Purpose</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Tourism, Honeymoon, Visiting Family"
                                            className="w-full text-sm p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={travelReason}
                                            onChange={(e) => setTravelReason(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-xs text-gray-600 h-[400px] overflow-y-auto whitespace-pre-wrap relative">
                        {isPremium ? (
                            generatedText
                        ) : (
                            <>
                                <div className="blur-sm select-none opacity-50">
                                    {generatedText.substring(0, 150)}...
                                    {`\n\n[...Content Hidden...]\n\n`}
                                    {generatedText.substring(generatedText.length - 100)}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
                                        <span className="text-2xl mb-1">🔒</span>
                                        <span className="text-xs font-bold text-gray-900">Premium Only</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Action Section */}
                <div className="flex flex-col justify-center items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-2">
                        📄
                    </div>

                    {isPremium ? (
                        <>
                            <h4 className="text-lg font-bold text-gray-900">Ready to Download</h4>
                            <p className="text-sm text-gray-500 max-w-xs">
                                Your smart, personalized cover letter is ready.
                            </p>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={loading}
                                className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center gap-2"
                            >
                                {loading ? 'Generating...' : 'Download PDF'}
                            </button>
                        </>
                    ) : (
                        <>
                            <h4 className="text-lg font-bold text-gray-900">Download Official PDF</h4>
                            <p className="text-sm text-gray-500 max-w-xs">
                                Upgrade to Premium to download this professionally formatted, AI-generated letter.
                            </p>
                            <button
                                onClick={() => router.push('/subscribe')}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                            >
                                <span>🔒</span> Upgrade to Download
                            </button>
                            <p className="text-xs text-gray-400 mt-2">
                                Unlock to generate and download.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
