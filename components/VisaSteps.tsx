'use client';

import React, { useState } from 'react';
import { VisaStep } from '@/types/visaSchema';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';

interface VisaStepsProps {
  steps: VisaStep[];
  countryCode: string;
  visaType: string;
}

export default function VisaSteps({ steps, countryCode, visaType }: VisaStepsProps) {
  const { isPremium } = useAuth();
  const router = useRouter();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleViewDetails = (stepTitle: string) => {
    // Heuristic to identify University Guide step
    const isUniversityStep = visaType === 'STUDENT' &&
      (stepTitle.toLowerCase().includes('accepted') ||
        stepTitle.toLowerCase().includes('admission') ||
        stepTitle.toLowerCase().includes('university') ||
        stepTitle.toLowerCase().includes('offer'));

    if (isUniversityStep) {
      if (isPremium) {
        router.push(`/visa/${countryCode}/${visaType}/university-guide`);
      } else {
        setShowPremiumModal(true);
      }
    } else {
      // For other steps, we might want to do something else or nothing
      console.log("Clicked step:", stepTitle);
    }
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Step-by-Step Process</h2>

      <div className="relative pl-8 space-y-12">
        {/* Gradient Timeline Line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-1 bg-gradient-to-b from-blue-600 via-purple-500 to-indigo-600 rounded-full"></div>

        {steps.sort((a, b) => a.step_order - b.step_order).map((step, index) => (
          <div key={index} className="relative group">
            {/* Dot */}
            <div className="absolute -left-[41px] top-0 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-bold ring-4 ring-white shadow-lg z-10 group-hover:scale-110 transition-transform duration-300">
              {step.step_order}
            </div>

            <div className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 ${!isPremium && index > 1 ? 'blur-sm select-none pointer-events-none' : 'hover:shadow-xl hover:-translate-y-1 hover:border-blue-100'}`}>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-4">{step.description}</p>

              {step.action_link && (
                <a
                  href={step.action_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-50 text-blue-600 text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all mr-2"
                >
                  View Details
                </a>
              )}

              {visaType === 'STUDENT' &&
                (step.title.toLowerCase().includes('accepted') ||
                  step.title.toLowerCase().includes('admission') ||
                  step.title.toLowerCase().includes('university') ||
                  step.title.toLowerCase().includes('offer')) && (
                  <button
                    onClick={() => handleViewDetails(step.title)}
                    className="inline-block bg-indigo-50 text-indigo-600 text-sm font-bold px-4 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    🎓 University Guide
                  </button>
                )}
            </div>

            {!isPremium && index === 2 && (
              <div className="absolute inset-0 flex items-center justify-center z-20 -mt-20">
                <div className="bg-gray-900/90 text-white px-8 py-6 rounded-2xl shadow-2xl text-center backdrop-blur-xl border border-white/10 transform hover:scale-105 transition-transform">
                  <div className="text-4xl mb-2">🔒</div>
                  <p className="font-bold text-lg mb-1">Premium Content</p>
                  <p className="text-sm text-gray-300 mb-4">Upgrade to unlock the full step-by-step guide</p>
                  <button
                    onClick={() => router.push('/subscribe')}
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-yellow-500/50 transition-all"
                  >
                    Get Premium Access
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              👑
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Feature</h3>
            <p className="text-gray-600 mb-6">
              Access to detailed university admission guides and application assistance is available exclusively to Premium members.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/subscribe')}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                Upgrade Now - ₹250/year
              </button>
              <button
                onClick={() => setShowPremiumModal(false)}
                className="w-full py-3 text-gray-500 font-medium hover:text-gray-700"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
