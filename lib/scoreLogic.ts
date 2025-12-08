import { Timestamp } from 'firebase/firestore';

/**
 * Calculates a dynamic popularity score based on views and time decay.
 * 
 * Formula:
 * Score = Base (60-80) + (Views * 0.5) - (Time Decay)
 * 
 * @param countryCode The 2-letter country code (used for deterministic base score).
 * @param views Number of views from Firestore.
 * @param lastViewed Firestore Timestamp of the last view.
 * @returns A score between 40 and 99.
 */
export function calculatePopularity(countryCode: string, views: number = 0, lastViewed?: Timestamp | null): number {
    // 1. Deterministic Base Score (60-80)
    // We use the char codes of the country code to seed the base score
    const seed = countryCode.charCodeAt(0) + (countryCode.charCodeAt(1) || 0);
    const baseScore = (seed % 21) + 60; // 60 to 80

    // 2. View Bonus
    // Each view adds 0.5 points
    const viewBonus = views * 0.5;

    // 3. Time Decay
    // Score decreases by 0.1 for every hour since the last view
    let timeDecay = 0;
    if (lastViewed) {
        const now = new Date();
        const lastViewDate = lastViewed.toDate();
        const hoursSince = (now.getTime() - lastViewDate.getTime()) / (1000 * 60 * 60);
        timeDecay = hoursSince * 0.1;
    }

    // 4. Calculate Final Score
    let finalScore = baseScore + viewBonus - timeDecay;

    // 5. Clamp Result (40 to 99)
    return Math.min(Math.max(Math.round(finalScore), 40), 99);
}

import { User } from '@/types/user';
import { EligibilityCriteria } from '@/types/visaSchema';

export interface ScoreBreakdown {
    financialScore: number;
    educationScore: number;
    riskPenalty: number;
    travelBonus: number;
    totalScore: number;
    tips: string[];
}

/**
 * Calculates a dynamic "Approval Chance" score (0-100%) based on user profile.
 */
export function calculateEligibilityScore(user: User, criteria: EligibilityCriteria): ScoreBreakdown {
    let financialScore = 0;
    let educationScore = 0;
    let riskPenalty = 0;
    const tips: string[] = [];

    // 1. Financials (Max 70 points)
    // Income (35 points)
    if (criteria.min_annual_income) {
        const incomeRatio = Math.min(user.financials.annual_income_inr / criteria.min_annual_income, 1.5);
        const points = Math.min(incomeRatio * 35, 35);
        financialScore += points;
        if (incomeRatio < 1) tips.push(`Increase annual income to at least ₹${(criteria.min_annual_income / 100000).toFixed(1)}L`);
    } else {
        financialScore += 35; // Full points if no specific requirement
    }

    // Savings (35 points)
    if (criteria.min_liquid_savings) {
        const savingsRatio = Math.min(user.financials.savings_liquid_inr / criteria.min_liquid_savings, 1.5);
        const points = Math.min(savingsRatio * 35, 35);
        financialScore += points;
        if (savingsRatio < 1) tips.push(`Boost liquid savings to ₹${(criteria.min_liquid_savings / 100000).toFixed(1)}L`);
    } else {
        financialScore += 35;
    }

    // 2. Education (Max 20 points)
    if (criteria.required_education) {
        const levels = ['high_school', 'bachelors', 'masters', 'phd'];
        const userLevel = levels.indexOf(user.personal_details.education_level || 'high_school');
        const reqLevel = levels.indexOf(criteria.required_education);

        if (userLevel >= reqLevel) {
            educationScore = 20;
        } else {
            educationScore = 0;
            tips.push(`This visa typically requires a ${criteria.required_education.replace('_', ' ')} degree`);
        }
    } else {
        educationScore = 20;
    }

    // 3. Risk Profile (Penalties)
    if (user.risk_profile.criminal_record) {
        riskPenalty += 50;
        tips.push("Criminal record significantly impacts approval chances");
    }
    if (user.risk_profile.visa_rejections && user.risk_profile.visa_rejections.length > 0) {
        riskPenalty += user.risk_profile.visa_rejections.length * 10;
        tips.push("Previous visa rejections may lower your score");
    }

    // 4. Travel History Bonus (Max 10 points)
    const travelBonus = Math.min((user.risk_profile.travel_history?.length || 0) * 5, 10);
    if (travelBonus > 0) tips.push("Good travel history improves your score");

    let totalScore = financialScore + educationScore + travelBonus - riskPenalty;
    totalScore = Math.max(0, Math.min(Math.round(totalScore), 99)); // Cap at 99%

    return {
        financialScore,
        educationScore,
        riskPenalty,
        travelBonus,
        totalScore,
        tips
    };
}
