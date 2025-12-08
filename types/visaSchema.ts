export type RequirementType = 'physical' | 'document' | 'digital';

export interface RequirementBlock {
    id: string;
    title: string;
    description: string;
    type: RequirementType;
    is_premium?: boolean;
    affiliate_key?: string;
    note?: string;
}

export interface VisaMeta {
    fee_euro_adult?: number;
    fee_euro_child_6_11?: number;
    fee_euro_child_0_6?: number;
    fee_euro_approx?: string; // For ranges or non-standard fees
    fee_inr_approx?: number;
    processing_time_standard: string;
    max_stay: string;
    passport_validity: string;
    photo_spec?: string;
    min_funds_requirement?: string;
}

export interface VisaStep {
    step_order: number;
    title: string;
    description: string;
    action_link?: string;
}

export interface VisaTemplate {
    template_id: string;
    description: string;
    last_updated: string;
    base_requirements: {
        meta: VisaMeta;
        documents: RequirementBlock[]; // Can contain full blocks or references (though references are better handled in CountryConfig)
        steps_flow: VisaStep[];
    };
}

export interface UniversityGuide {
    top_universities: string[];
    application_platforms: {
        name: string;
        url: string;
        description: string;
    }[];
    intake_seasons: {
        season: string; // e.g., "Fall (August/September)"
        deadline: string; // e.g., "December - January"
    }[];
    required_exams: string[]; // e.g., ["SAT", "GRE", "GMAT", "TOEFL", "IELTS"]
    pre_visa_steps: VisaStep[]; // Steps before the visa process (e.g., Application, I-20)
}

export interface CountryVisaConfig {
    country_code: string; // e.g., "FR"
    visa_type: string; // e.g., "TOURIST"
    template_ref?: string; // ID of the template to inherit from (e.g., "SCHENGEN_TOURIST")

    overrides?: {
        meta?: Partial<VisaMeta>; // Override specific meta fields
        documents?: RequirementBlock[] | {
            add?: RequirementBlock[]; // Add new requirements
            remove?: string[]; // IDs of requirements to remove
            modify?: Partial<RequirementBlock>[]; // Modify existing requirements by ID
        };
        steps_flow?: VisaStep[]; // Completely replace steps if needed, or we could design a merge strategy
    };

    // If no template is used, define everything here
    standalone_data?: {
        meta: VisaMeta;
        documents: RequirementBlock[];
        steps_flow: VisaStep[];
    };

    // [NEW] University Guide for Student Visas
    university_guide?: UniversityGuide;

    // [NEW] Eligibility Rules
    eligibility?: EligibilityCriteria;
}

export interface EligibilityCriteria {
    min_annual_income?: number;
    min_liquid_savings?: number;
    required_education?: 'high_school' | 'bachelors' | 'masters' | 'phd';
    required_employment_status?: string[]; // e.g. ['student', 'salaried']
    max_age?: number;
}
