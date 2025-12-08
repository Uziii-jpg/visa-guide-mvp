"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";

const steps = [
    { id: 1, title: "Identity Vault", description: "Your core details for visa forms" },
    { id: 2, title: "Financial Health", description: "To calculate your eligibility" },
    { id: 3, title: "Travel History", description: "Risk assessment profile" },
];

export default function OnboardingForm({ onComplete }: { onComplete: () => void }) {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<User>>({
        account_status: 'active',
        subscription_tier: 'free',
        personal_details: {
            full_name_passport: user?.displayName || "",
            citizenship: "IN",
            residence_state: "",
            passport_number: "",
            marital_status: "single",
            education_level: "bachelors",
            // @ts-ignore
            dob: "",
            // @ts-ignore
            passport_expiry: "",
        },
        financials: {
            employment_type: "salaried",
            annual_income_inr: 0,
            savings_liquid_inr: 0,
            has_credit_card: false,
            income_tax_returns_years: [],
        },
        risk_profile: {
            travel_history: [],
            visa_rejections: [],
            criminal_record: false,
        },
    });

    const updateNestedData = (section: keyof User, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                // @ts-ignore
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Save to Firestore
            await setDoc(doc(db, "users", user.uid), {
                ...formData,
                _id: user.uid,
                // Convert date strings to Date objects if needed, or keep as strings for now
                // For strict typing, we should convert, but for MVP strings might suffice or be converted on read
            });
            onComplete();
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50">
                {/* Progress Bar */}
                <div className="bg-gray-50 p-4 md:p-6 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        {steps.map((step) => (
                            <div key={step.id} className="flex flex-col items-center relative z-10">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= step.id
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                        : "bg-gray-200 text-gray-400"
                                        }`}
                                >
                                    {step.id}
                                </div>
                                <span
                                    className={`text-xs mt-2 font-medium ${currentStep >= step.id ? "text-indigo-900" : "text-gray-400"
                                        }`}
                                >
                                    {step.title}
                                </span>
                            </div>
                        ))}
                        {/* Connecting Line */}
                        <div className="absolute top-11 left-0 w-full h-0.5 bg-gray-200 -z-0 hidden md:block" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 text-center">
                        {steps[currentStep - 1].title}
                    </h2>
                    <p className="text-gray-500 text-center text-sm">
                        {steps[currentStep - 1].description}
                    </p>
                </div>

                {/* Form Content */}
                <div className="p-4 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-800 mb-2">Full Name (As per Passport)</label>
                                            <input
                                                type="text"
                                                value={formData.personal_details?.full_name_passport}
                                                onChange={(e) => updateNestedData("personal_details", "full_name_passport", e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-gray-900 placeholder-gray-500 font-medium"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-800 mb-2">Date of Birth</label>
                                            <input
                                                type="date"
                                                value={formData.personal_details?.dob as any}
                                                onChange={(e) => updateNestedData("personal_details", "dob", e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-gray-900 font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-800 mb-2">Passport Number</label>
                                            <input
                                                type="text"
                                                value={formData.personal_details?.passport_number}
                                                onChange={(e) => updateNestedData("personal_details", "passport_number", e.target.value.toUpperCase())}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-gray-900 placeholder-gray-500 font-medium"
                                                placeholder="A1234567"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-800 mb-2">Passport Expiry</label>
                                            <input
                                                type="date"
                                                value={formData.personal_details?.passport_expiry as any}
                                                onChange={(e) => updateNestedData("personal_details", "passport_expiry", e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-gray-900 font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-800 mb-2">State of Residence</label>
                                            <select
                                                value={formData.personal_details?.residence_state}
                                                onChange={(e) => updateNestedData("personal_details", "residence_state", e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-gray-900 font-medium"
                                            >
                                                <option value="">Select State / UT</option>
                                                <optgroup label="States">
                                                    <option value="AP">Andhra Pradesh</option>
                                                    <option value="AR">Arunachal Pradesh</option>
                                                    <option value="AS">Assam</option>
                                                    <option value="BR">Bihar</option>
                                                    <option value="CT">Chhattisgarh</option>
                                                    <option value="GA">Goa</option>
                                                    <option value="GJ">Gujarat</option>
                                                    <option value="HR">Haryana</option>
                                                    <option value="HP">Himachal Pradesh</option>
                                                    <option value="JH">Jharkhand</option>
                                                    <option value="KA">Karnataka</option>
                                                    <option value="KL">Kerala</option>
                                                    <option value="MP">Madhya Pradesh</option>
                                                    <option value="MH">Maharashtra</option>
                                                    <option value="MN">Manipur</option>
                                                    <option value="ML">Meghalaya</option>
                                                    <option value="MZ">Mizoram</option>
                                                    <option value="NL">Nagaland</option>
                                                    <option value="OR">Odisha</option>
                                                    <option value="PB">Punjab</option>
                                                    <option value="RJ">Rajasthan</option>
                                                    <option value="SK">Sikkim</option>
                                                    <option value="TN">Tamil Nadu</option>
                                                    <option value="TG">Telangana</option>
                                                    <option value="TR">Tripura</option>
                                                    <option value="UP">Uttar Pradesh</option>
                                                    <option value="UT">Uttarakhand</option>
                                                    <option value="WB">West Bengal</option>
                                                </optgroup>
                                                <optgroup label="Union Territories">
                                                    <option value="AN">Andaman and Nicobar Islands</option>
                                                    <option value="CH">Chandigarh</option>
                                                    <option value="DN">Dadra and Nagar Haveli and Daman and Diu</option>
                                                    <option value="DL">Delhi (NCT)</option>
                                                    <option value="JK">Jammu and Kashmir</option>
                                                    <option value="LA">Ladakh</option>
                                                    <option value="LD">Lakshadweep</option>
                                                    <option value="PY">Puducherry</option>
                                                </optgroup>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-800 mb-2">Marital Status</label>
                                            <select
                                                value={formData.personal_details?.marital_status}
                                                onChange={(e) => updateNestedData("personal_details", "marital_status", e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-gray-900 font-medium"
                                            >
                                                <option value="single">Single</option>
                                                <option value="married">Married</option>
                                                <option value="divorced">Divorced</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-800 mb-2">Education Level</label>
                                            <select
                                                value={formData.personal_details?.education_level}
                                                onChange={(e) => updateNestedData("personal_details", "education_level", e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-gray-900 font-medium"
                                            >
                                                <option value="high_school">High School</option>
                                                <option value="bachelors">Bachelor's Degree</option>
                                                <option value="masters">Master's Degree</option>
                                                <option value="phd">PhD / Doctorate</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">Employment Type</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['salaried', 'business', 'student', 'unemployed'].map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => updateNestedData("financials", "employment_type", type)}
                                                    className={`p-4 rounded-xl border-2 transition-all capitalize font-medium ${formData.financials?.employment_type === type
                                                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                                        : "border-gray-300 bg-white text-gray-900 hover:border-indigo-300"
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-800 mb-2">Annual Income (INR)</label>
                                            <input
                                                type="number"
                                                value={formData.financials?.annual_income_inr}
                                                onChange={(e) => updateNestedData("financials", "annual_income_inr", Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-gray-900 placeholder-gray-500 font-medium"
                                                placeholder="e.g. 1200000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-800 mb-2">Liquid Savings (INR)</label>
                                            <input
                                                type="number"
                                                value={formData.financials?.savings_liquid_inr}
                                                onChange={(e) => updateNestedData("financials", "savings_liquid_inr", Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-gray-900 placeholder-gray-500 font-medium"
                                                placeholder="e.g. 500000"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                        <input
                                            type="checkbox"
                                            checked={formData.financials?.has_credit_card}
                                            onChange={(e) => updateNestedData("financials", "has_credit_card", e.target.checked)}
                                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                        <label className="text-sm font-medium text-gray-900">I hold a valid Credit Card</label>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-100">
                                        <h4 className="font-semibold text-yellow-800 mb-2">Why do we ask this?</h4>
                                        <p className="text-sm text-yellow-700">
                                            Visa officers look for "Red Flags". Being honest here helps us calculate your real chances and suggest fixes.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">Have you been rejected for a visa before?</label>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => updateNestedData("risk_profile", "visa_rejections", ["Yes"])} // Simplified for UI
                                                className={`flex-1 p-4 rounded-xl border-2 transition-all font-medium ${formData.risk_profile?.visa_rejections?.length ? "border-red-500 bg-red-50 text-red-700" : "border-gray-300 bg-white text-gray-900"
                                                    }`}
                                            >
                                                Yes
                                            </button>
                                            <button
                                                onClick={() => updateNestedData("risk_profile", "visa_rejections", [])}
                                                className={`flex-1 p-4 rounded-xl border-2 transition-all font-medium ${!formData.risk_profile?.visa_rejections?.length ? "border-green-500 bg-green-50 text-green-700" : "border-gray-300 bg-white text-gray-900"
                                                    }`}
                                            >
                                                No
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                                        <input
                                            type="checkbox"
                                            checked={formData.risk_profile?.criminal_record}
                                            onChange={(e) => updateNestedData("risk_profile", "criminal_record", e.target.checked)}
                                            className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                        />
                                        <label className="text-sm font-medium text-red-800">I have a criminal record</label>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${currentStep === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : currentStep === steps.length ? (
                            "Complete Profile"
                        ) : (
                            "Next Step"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
