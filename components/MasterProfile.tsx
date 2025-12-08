"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getDoodleAvatarUrl } from "@/lib/avatarUtils";

export default function MasterProfile({ onComplete }: { onComplete?: () => void }) {
    const { user, isPremium } = useAuth();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('MasterProfile');
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState("personal");

    // Cancellation State
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelStep, setCancelStep] = useState(1);
    const [cancelReason, setCancelReason] = useState("");

    const handleCancelSubscription = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await setDoc(doc(db, "users", user.uid), {
                subscription_tier: 'free',
                account_status: 'active',
                cancellation_reason: cancelReason,
                cancelled_at: new Date().toISOString()
            }, { merge: true });

            // Reset local state to reflect changes immediately
            window.location.reload(); // Simple reload to refresh auth context and UI
        } catch (error) {
            console.error("Error cancelling subscription:", error);
            alert("Failed to cancel subscription. Please try again.");
        } finally {
            setLoading(false);
            setShowCancelModal(false);
        }
    };

    const [formData, setFormData] = useState<Partial<User>>({
        personal_details: {
            full_name_passport: user?.displayName || "",
            dob: "",
            gender: "Male",
            citizenship: "IN",
            residence_state: "",
            passport_number: "",
            passport_expiry: "",
            marital_status: "single",
            dependents: 0,
            education_level: "bachelors",
        },
        education_history: [],
        employment_history: [],
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

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setFormData((prev) => ({ ...prev, ...docSnap.data() }));
                }
            }
        };
        fetchUserData();
    }, [user]);

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

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await setDoc(doc(db, "users", user.uid), {
                ...formData,
                _id: user.uid,
            }, { merge: true });

            if (onComplete) {
                onComplete();
            } else {
                alert("Profile Saved Successfully!");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to add empty items to arrays
    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education_history: [
                ...(prev.education_history || []),
                { id: Date.now().toString(), degree: "", institution: "", year_graduated: "" }
            ]
        }));
    };

    const addEmployment = () => {
        setFormData(prev => ({
            ...prev,
            employment_history: [
                ...(prev.employment_history || []),
                { id: Date.now().toString(), role: "", company: "", duration: "" }
            ]
        }));
    };

    const updateArrayItem = (arrayName: 'education_history' | 'employment_history', index: number, field: string, value: string) => {
        setFormData(prev => {
            const newArray = [...(prev[arrayName] || [])];
            // @ts-ignore
            newArray[index] = { ...newArray[index], [field]: value };
            return { ...prev, [arrayName]: newArray };
        });
    };

    const removeArrayItem = (arrayName: 'education_history' | 'employment_history', index: number) => {
        setFormData(prev => {
            const newArray = [...(prev[arrayName] || [])];
            newArray.splice(index, 1);
            return { ...prev, [arrayName]: newArray };
        });
    };

    // Helper for Risk Profile Arrays (Travel History, Visa Rejections)
    const updateRiskArray = (field: 'travel_history' | 'visa_rejections', value: string) => {
        // Simple comma-separated string to array conversion for MVP
        const array = value.split(',').map(s => s.trim()).filter(s => s !== '');
        setFormData(prev => ({
            ...prev,
            risk_profile: {
                ...prev.risk_profile!,
                [field]: array
            }
        }));
    };

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col font-display bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="flex-grow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                        {/* Sidebar - Hidden on Mobile, Visible on Desktop */}
                        <aside className="hidden lg:block lg:w-1/4 lg:sticky lg:top-8 self-start">
                            <div className="flex h-full min-h-[500px] flex-col justify-between rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 bg-gray-100 overflow-hidden border border-gray-200">
                                            <img
                                                src={user?.photoURL || getDoodleAvatarUrl(user?.uid || user?.email || 'user')}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <h1 className="text-base font-bold">{user?.displayName || "User"}</h1>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('completeProfile')}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 mt-4">
                                        {[
                                            { id: 'personal', icon: 'person', label: t('personalDetails') },
                                            { id: 'financial', icon: 'account_balance', label: t('financials') },
                                            { id: 'history', icon: 'history_edu', label: t('employment') }, // Using employment for history as per plan mapping
                                            { id: 'risk', icon: 'gavel', label: t('riskProfile') },
                                            { id: 'subscription', icon: 'card_membership', label: t('subscription') }
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => scrollToSection(item.id)}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeSection === item.id
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                                <p className="text-sm font-semibold">{item.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-blue-600 text-white text-base font-bold border-2 border-transparent shadow-md hover:bg-blue-700 transition-all duration-150 disabled:opacity-70 mt-4"
                                >
                                    <span className="truncate">{loading ? t('saving') : t('save')}</span>
                                </button>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="w-full lg:w-3/4">
                            <div className="flex flex-col gap-8">
                                {/* Mobile User Header */}
                                <div className="lg:hidden flex items-center gap-4 mb-2">
                                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-16 bg-gray-100 overflow-hidden border border-gray-200">
                                        <img
                                            src={user?.photoURL || getDoodleAvatarUrl(user?.uid || user?.email || 'user')}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <h1 className="text-xl font-bold">{user?.displayName || "User"}</h1>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('completeProfile')}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <p className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">Master Profile</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-base font-normal max-w-2xl">
                                        {t('profileSubtitle')}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-8">
                                    {/* Personal Details Section */}
                                    <section id="personal" className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                                        <h2 className="font-serif text-[26px] font-bold tracking-tight px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{t('personalDetails')}</h2>
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                                <div className="flex flex-col col-span-2 gap-2">
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('fullName')}</label>
                                                    <input
                                                        className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                                                        value={formData.personal_details?.full_name_passport || ""}
                                                        onChange={(e) => updateNestedData("personal_details", "full_name_passport", e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('dob')}</label>
                                                    <input
                                                        type="date"
                                                        className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                                                        value={(formData.personal_details?.dob as string) || ""}
                                                        onChange={(e) => updateNestedData("personal_details", "dob", e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('gender')}</label>
                                                    <select
                                                        className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                                                        value={formData.personal_details?.gender || "Male"}
                                                        onChange={(e) => updateNestedData("personal_details", "gender", e.target.value)}
                                                    >
                                                        <option>Male</option>
                                                        <option>Female</option>
                                                        <option>Other</option>
                                                    </select>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('citizenship')}</label>
                                                    <input
                                                        className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                                                        value={formData.personal_details?.citizenship || ""}
                                                        onChange={(e) => updateNestedData("personal_details", "citizenship", e.target.value.toUpperCase())}
                                                        maxLength={2}
                                                        placeholder="IN"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('residenceState')}</label>
                                                    <input
                                                        className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                                                        value={formData.personal_details?.residence_state || ""}
                                                        onChange={(e) => updateNestedData("personal_details", "residence_state", e.target.value)}
                                                        placeholder="e.g. Maharashtra"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('passportNumber')}</label>
                                                    <input
                                                        className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                                                        value={formData.personal_details?.passport_number || ""}
                                                        onChange={(e) => updateNestedData("personal_details", "passport_number", e.target.value.toUpperCase())}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('passportExpiry')}</label>
                                                    <input
                                                        type="date"
                                                        className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                                                        value={(formData.personal_details?.passport_expiry as string) || ""}
                                                        onChange={(e) => updateNestedData("personal_details", "passport_expiry", e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('maritalStatus')}</label>
                                                    <select
                                                        className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                                                        value={formData.personal_details?.marital_status || "single"}
                                                        onChange={(e) => updateNestedData("personal_details", "marital_status", e.target.value)}
                                                    >
                                                        <option value="single">Single</option>
                                                        <option value="married">Married</option>
                                                        <option value="divorced">Divorced</option>
                                                        <option value="widowed">Widowed</option>
                                                    </select>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('dependents')}</label>
                                                    <input
                                                        type="number"
                                                        className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                                                        value={formData.personal_details?.dependents || 0}
                                                        onChange={(e) => updateNestedData("personal_details", "dependents", Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Financial Profile Section */}
                                    <section id="financial" className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                                        <h2 className="font-serif text-[26px] font-bold tracking-tight px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{t('financials')}</h2>
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('employmentType')}</label>
                                                    <select
                                                        className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                                                        value={formData.financials?.employment_type || "salaried"}
                                                        onChange={(e) => updateNestedData("financials", "employment_type", e.target.value)}
                                                    >
                                                        <option value="salaried">Salaried</option>
                                                        <option value="business">Self-Employed / Business</option>
                                                        <option value="student">Student</option>
                                                        <option value="unemployed">Unemployed / Retired</option>
                                                    </select>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('annualIncome')}</label>
                                                    <input
                                                        type="number"
                                                        className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                                                        value={formData.financials?.annual_income_inr || ""}
                                                        onChange={(e) => updateNestedData("financials", "annual_income_inr", Number(e.target.value))}
                                                        placeholder="e.g. 1200000"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('liquidSavings')}</label>
                                                    <input
                                                        type="number"
                                                        className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                                                        value={formData.financials?.savings_liquid_inr || ""}
                                                        onChange={(e) => updateNestedData("financials", "savings_liquid_inr", Number(e.target.value))}
                                                        placeholder="e.g. 500000"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2 justify-center">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            id="has_credit_card"
                                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            checked={formData.financials?.has_credit_card || false}
                                                            onChange={(e) => updateNestedData("financials", "has_credit_card", e.target.checked)}
                                                        />
                                                        <label htmlFor="has_credit_card" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                            {t('hasCreditCard')}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Professional History Section */}
                                    <section id="history" className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                                        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                                            <h2 className="font-serif text-[26px] font-bold tracking-tight text-gray-900 dark:text-white">{t('employment')}</h2>
                                        </div>

                                        {/* Education */}
                                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t('educationTitle')}</h3>
                                                <button onClick={addEducation} className="text-blue-600 text-sm font-bold hover:underline">{t('addEducation')}</button>
                                            </div>
                                            <div className="space-y-4">
                                                {formData.education_history?.map((edu, index) => (
                                                    <div key={edu.id} className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col gap-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <input
                                                                    placeholder={t('degreePlaceholder')}
                                                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:border-blue-500"
                                                                    value={edu.degree || ""}
                                                                    onChange={(e) => updateArrayItem('education_history', index, 'degree', e.target.value)}
                                                                />
                                                                <input
                                                                    placeholder={t('institutionPlaceholder')}
                                                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:border-blue-500"
                                                                    value={edu.institution || ""}
                                                                    onChange={(e) => updateArrayItem('education_history', index, 'institution', e.target.value)}
                                                                />
                                                                <input
                                                                    placeholder={t('yearGraduatedPlaceholder')}
                                                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:border-blue-500"
                                                                    value={edu.year_graduated || ""}
                                                                    onChange={(e) => updateArrayItem('education_history', index, 'year_graduated', e.target.value)}
                                                                />
                                                            </div>
                                                            <button onClick={() => removeArrayItem('education_history', index)} className="text-red-500 hover:bg-red-50 p-2 rounded-full ml-2">
                                                                <span className="material-symbols-outlined">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!formData.education_history || formData.education_history.length === 0) && (
                                                    <p className="text-gray-500 text-sm italic">{t('noEducation')}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Employment */}
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t('employmentTitle')}</h3>
                                                <button onClick={addEmployment} className="text-blue-600 text-sm font-bold hover:underline">{t('addEmployment')}</button>
                                            </div>
                                            <div className="space-y-4">
                                                {formData.employment_history?.map((job, index) => (
                                                    <div key={job.id} className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col gap-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <input
                                                                    placeholder={t('rolePlaceholder')}
                                                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:border-blue-500"
                                                                    value={job.role || ""}
                                                                    onChange={(e) => updateArrayItem('employment_history', index, 'role', e.target.value)}
                                                                />
                                                                <input
                                                                    placeholder={t('companyPlaceholder')}
                                                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:border-blue-500"
                                                                    value={job.company || ""}
                                                                    onChange={(e) => updateArrayItem('employment_history', index, 'company', e.target.value)}
                                                                />
                                                                <input
                                                                    placeholder={t('durationPlaceholder')}
                                                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:border-blue-500"
                                                                    value={job.duration || ""}
                                                                    onChange={(e) => updateArrayItem('employment_history', index, 'duration', e.target.value)}
                                                                />
                                                            </div>
                                                            <button onClick={() => removeArrayItem('employment_history', index)} className="text-red-500 hover:bg-red-50 p-2 rounded-full ml-2">
                                                                <span className="material-symbols-outlined">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!formData.employment_history || formData.employment_history.length === 0) && (
                                                    <p className="text-gray-500 text-sm italic">{t('noEmployment')}</p>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    {/* Travel & Risk Profile Section */}
                                    <section id="risk" className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                                        <h2 className="font-serif text-[26px] font-bold tracking-tight px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{t('riskProfile')}</h2>
                                        <div className="p-6">
                                            <div className="flex flex-col gap-6">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('travelHistory')}</label>
                                                    <input
                                                        className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                                                        value={formData.risk_profile?.travel_history?.join(', ') || ""}
                                                        onChange={(e) => updateRiskArray('travel_history', e.target.value)}
                                                        placeholder="e.g. US, UK, TH, SG"
                                                    />
                                                    <p className="text-xs text-gray-500">{t('travelHistoryHint')}</p>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('visaRejections')}</label>
                                                    <input
                                                        className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                                                        value={formData.risk_profile?.visa_rejections?.join(', ') || ""}
                                                        onChange={(e) => updateRiskArray('visa_rejections', e.target.value)}
                                                        placeholder="e.g. CA, AU"
                                                    />
                                                    <p className="text-xs text-gray-500">{t('visaRejectionsHint')}</p>
                                                </div>

                                                <div className="flex items-center gap-3 mt-2">
                                                    <input
                                                        type="checkbox"
                                                        id="criminal_record"
                                                        className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                                        checked={formData.risk_profile?.criminal_record || false}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            risk_profile: {
                                                                ...prev.risk_profile!,
                                                                criminal_record: e.target.checked
                                                            }
                                                        }))}
                                                    />
                                                    <label htmlFor="criminal_record" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                        {t('criminalRecord')}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Subscription Section */}
                                    <section id="subscription" className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                                        <h2 className="font-serif text-[26px] font-bold tracking-tight px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{t('subscription')}</h2>
                                        <div className="p-6">
                                            <div className="flex flex-col gap-6">
                                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('currentPlan')}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-2xl font-bold ${isPremium ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>
                                                                {isPremium ? t('premiumMember') : t('freePlan')}
                                                            </span>
                                                            {isPremium && (
                                                                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">{t('active')}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {!isPremium && (
                                                        <button
                                                            onClick={() => router.push('/subscribe')}
                                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                                                        >
                                                            {t('upgrade')}
                                                        </button>
                                                    )}
                                                </div>

                                                {isPremium ? (
                                                    <>
                                                        <div className="space-y-4">
                                                            <div className="p-4 rounded-lg border border-blue-100 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                                                                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">{t('premiumBenefits')}</h3>
                                                                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                                                                    <li className="flex items-center gap-2">✓ Unlimited Visa Guides</li>
                                                                    <li className="flex items-center gap-2">✓ AI Document Review</li>
                                                                    <li className="flex items-center gap-2">✓ Priority Support</li>
                                                                </ul>
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
                                                                <p>{t('needHelp')} <a href="mailto:support@visaguide.com" className="text-blue-600 hover:underline">{t('contactSupport')}</a></p>
                                                                <button
                                                                    onClick={() => setShowCancelModal(true)}
                                                                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
                                                                >
                                                                    {t('cancelSubscription')}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Cancellation Modal */}
                                                        {showCancelModal && (
                                                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                                                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
                                                                    {cancelStep === 1 && (
                                                                        <div className="space-y-4">
                                                                            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-2xl mx-auto">
                                                                                ⚠️
                                                                            </div>
                                                                            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white">Are you sure?</h3>
                                                                            <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                                                                                You will lose access to all Premium features immediately:
                                                                            </p>
                                                                            <ul className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                                                                <li className="flex items-center gap-2">❌ Unlimited Visa Guides</li>
                                                                                <li className="flex items-center gap-2">❌ AI Document Review</li>
                                                                                <li className="flex items-center gap-2">❌ Priority Support</li>
                                                                            </ul>
                                                                            <div className="flex gap-3 pt-2">
                                                                                <button
                                                                                    onClick={() => setShowCancelModal(false)}
                                                                                    className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
                                                                                >
                                                                                    Keep My Benefits
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => setCancelStep(2)}
                                                                                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                                                >
                                                                                    Continue to Cancel
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {cancelStep === 2 && (
                                                                        <div className="space-y-4">
                                                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Why are you leaving?</h3>
                                                                            <div className="space-y-2">
                                                                                {['Too expensive', 'Not using it enough', 'Found a better alternative', 'Visa approved!', 'Other'].map((reason) => (
                                                                                    <label key={reason} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors">
                                                                                        <input
                                                                                            type="radio"
                                                                                            name="cancel_reason"
                                                                                            value={reason}
                                                                                            onChange={(e) => setCancelReason(e.target.value)}
                                                                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                                                        />
                                                                                        <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
                                                                                    </label>
                                                                                ))}
                                                                            </div>
                                                                            <div className="flex gap-3 pt-2">
                                                                                <button
                                                                                    onClick={() => setCancelStep(1)}
                                                                                    className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4"
                                                                                >
                                                                                    Back
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => setCancelStep(3)}
                                                                                    disabled={!cancelReason}
                                                                                    className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                >
                                                                                    Next
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {cancelStep === 3 && (
                                                                        <div className="space-y-4">
                                                                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto">
                                                                                💔
                                                                            </div>
                                                                            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white">Final Confirmation</h3>
                                                                            <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                                                                                By clicking below, your subscription will be cancelled immediately and you will revert to the Free Plan.
                                                                            </p>
                                                                            <div className="flex flex-col gap-3 pt-2">
                                                                                <button
                                                                                    onClick={handleCancelSubscription}
                                                                                    className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                                                                                >
                                                                                    Confirm Cancellation
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => setShowCancelModal(false)}
                                                                                    className="w-full text-gray-500 hover:text-gray-700 font-medium py-2"
                                                                                >
                                                                                    Nevermind, I'll stay
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="grid md:grid-cols-3 gap-4">
                                                        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">📝</div>
                                                            <h4 className="font-bold text-sm">{t('aiReviews')}</h4>
                                                            <p className="text-xs text-gray-500 mt-1">{t('aiReviewsDesc')}</p>
                                                        </div>
                                                        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">📋</div>
                                                            <h4 className="font-bold text-sm">{t('checklists')}</h4>
                                                            <p className="text-xs text-gray-500 mt-1">{t('checklistsDesc')}</p>
                                                        </div>
                                                        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-3">⚡</div>
                                                            <h4 className="font-bold text-sm">{t('priority')}</h4>
                                                            <p className="text-xs text-gray-500 mt-1">{t('priorityDesc')}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Mobile Save Button */}
                                <div className="lg:hidden sticky bottom-4 z-10">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-4 bg-blue-600 text-white text-lg font-bold border-2 border-transparent shadow-lg hover:bg-blue-700 transition-all duration-150 disabled:opacity-70"
                                    >
                                        <span className="truncate">{loading ? "Saving..." : "Save Profile"}</span>
                                    </button>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}
