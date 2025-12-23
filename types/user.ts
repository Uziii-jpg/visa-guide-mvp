export interface User {
    _id: string; // Auth ID
    account_status: 'active' | 'banned' | 'guest';
    subscription_tier: 'free' | 'premium';
    subscription_plan?: '1_year' | '6_months' | '3_months';
    subscription_expiry?: any; // Firestore Timestamp
    payment_history?: {
        order_id: string;
        payment_id: string;
        amount: number;
        date: any; // Firestore Timestamp
        plan: string;
    }[];

    // 1. Core Identity (For Cover Letters & Forms)
    personal_details: {
        full_name_passport: string;
        dob: string; // Changed to string for easier form handling
        gender?: 'Male' | 'Female' | 'Other';
        phone_number: string; // [NEW] Added for payments/contact
        citizenship: string; // Default 'IN'
        residence_state: string; // CRITICAL: Determines Consulate Jurisdiction
        passport_number: string;
        passport_expiry: string; // CRITICAL: Trigger "Renew Passport" alerts
        marital_status: 'single' | 'married' | 'divorced' | 'widowed';
        dependents?: number;
        education_level: 'high_school' | 'bachelors' | 'masters' | 'phd';
    };

    // 2. Financial Profile (For "Do I Qualify" Logic)
    financials: {
        employment_type: 'salaried' | 'business' | 'student' | 'unemployed';
        annual_income_inr: number;
        savings_liquid_inr: number; // Cash in bank
        has_credit_card: boolean; // Trust factor for some visas
        income_tax_returns_years: number[]; // e.g. [2023, 2024] - "Do you have ITR?"
    };

    // 3. Detailed History (New)
    education_history?: {
        id: string;
        degree: string;
        institution: string;
        year_graduated: string;
    }[];

    employment_history?: {
        id: string;
        role: string;
        company: string;
        duration: string;
    }[];

    // 4. The "Hidden Value" Data (Risk Assessment)
    risk_profile: {
        travel_history: string[]; // List of ISO codes visited (e.g. ['US', 'TH'])
        visa_rejections: string[]; // List of countries that rejected them
        criminal_record: boolean; // Auto-Red flag for Immigration
    };
}
