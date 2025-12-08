"use client";

import { useState } from "react";

export default function MasterProfileForm() {
    const [savings, setSavings] = useState("");

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, we would save this to Firestore
        alert("Profile Saved!");
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Master Profile</h3>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label htmlFor="savings" className="block text-sm font-medium text-gray-700 mb-1">
                        Total Savings (INR)
                    </label>
                    <input
                        type="number"
                        id="savings"
                        value={savings}
                        onChange={(e) => setSavings(e.target.value)}
                        placeholder="e.g. 500000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    Save Profile
                </button>
            </form>
        </div>
    );
}
