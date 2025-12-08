export interface Journey {
    _id: string;
    user_id: string;
    target_country: string; // 'FR'
    visa_mode: 'tourist';

    // Progress Tracking
    status: 'planning' | 'collecting_docs' | 'ready_to_apply';
    checklist_progress: string[]; // IDs of checked items

    // The "Do I Qualify" Snapshot
    eligibility_snapshot: {
        status: 'green' | 'amber' | 'red';
        missing_funds: number; // e.g. -50000 (Useful for notifications)
        last_calculated: Date;
    };
}
