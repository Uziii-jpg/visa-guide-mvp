/**
 * Parses a processing time string (e.g., "15 Days", "3-4 Weeks") into a range of days.
 */
export function parseProcessingTime(timeString: string): { minDays: number, maxDays: number } {
    const lower = timeString.toLowerCase();
    let min = 0;
    let max = 0;

    // Extract all numbers
    const numbers = lower.match(/\d+/g)?.map(Number) || [];

    if (numbers.length === 0) return { minDays: 14, maxDays: 30 }; // Default fallback

    if (numbers.length === 1) {
        min = numbers[0];
        max = numbers[0];
    } else {
        min = numbers[0];
        max = numbers[1];
    }

    // Convert units to days
    if (lower.includes('month')) {
        min *= 30;
        max *= 30;
    } else if (lower.includes('week')) {
        min *= 7;
        max *= 7;
    }
    // "days" is the default unit, so no multiplier needed if strictly days

    // Sanity check
    if (min === 0) min = 7;
    if (max === 0) max = 7;

    return { minDays: min, maxDays: max };
}

export interface TimelineResult {
    travelDate: Date;
    latestApplyDate: Date;      // The absolute last day to apply (High Risk)
    recommendedApplyDate: Date; // Safe buffer (e.g., +2 weeks)
    earliestApplyDate: Date;    // Usually 3-6 months before
    processingDays: { min: number, max: number };
}

/**
 * Calculates key timeline dates based on travel date and processing time.
 */
export function calculateTimeline(travelDate: Date, timeString: string): TimelineResult {
    const { minDays, maxDays } = parseProcessingTime(timeString);

    // Latest Deadline: Travel Date - Max Processing Time
    const latestApplyDate = new Date(travelDate);
    latestApplyDate.setDate(travelDate.getDate() - maxDays);

    // Recommended: Latest - 2 Weeks Buffer
    const recommendedApplyDate = new Date(latestApplyDate);
    recommendedApplyDate.setDate(latestApplyDate.getDate() - 14);

    // Earliest: Travel Date - 90 Days (Standard)
    // Note: Some countries allow 6 months, but 3 months is a safe standard default
    const earliestApplyDate = new Date(travelDate);
    earliestApplyDate.setDate(travelDate.getDate() - 90);

    return {
        travelDate,
        latestApplyDate,
        recommendedApplyDate,
        earliestApplyDate,
        processingDays: { min: minDays, max: maxDays }
    };
}
