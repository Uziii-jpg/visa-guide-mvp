export interface VisaConfig {
    is_active: boolean;

    // 1. The Logic Configuration (The Brain)
    // The frontend reads this to decide Red/Green light
    logic_rules: {
        min_funds_base: number; // e.g., 1000 (Currency of country)
        min_funds_per_day: number; // e.g., 50
        min_passport_months: number; // 6
        requires_insurance: boolean;
        requires_return_ticket: boolean;
        biometrics_required: boolean;
    };

    // 2. The Content (The Product)
    checklist: Array<{
        id: string;
        title: string;
        description_md: string; // Markdown supported
        is_blurred_for_free: boolean; // The Paywall Lock
        category: 'identity' | 'financial' | 'accommodation' | 'legal';

        // Affiliate Integration
        affiliate_partner?: {
            provider_name: 'Skyscanner' | 'CoverMore' | 'HDFC';
            tracking_link: string;
            ui_label: string; // "Get 10% off Insurance"
        };
    }>;
}

export interface CountryMaster {
    _id: string; // 'CA', 'US', 'FR'
    name: string;
    currency_code: string; // 'CAD'
    exchange_rate_inr: number; // 60.5 (Update weekly via cron job)

    // The 4 Modes
    visas: {
        tourist: VisaConfig;
        student: VisaConfig;
        work: VisaConfig;
        immigration: VisaConfig;
    };
}

export interface AffiliatePartner {
    _id: string; // 'insurance_global'
    name: string; // 'Tata AIG'
    base_url: string;
    referral_code: string;

    // Context: Where should this appear?
    tags: ['insurance', 'mandatory_schengen'];

    // Analytics
    clicks_count: number;
}
