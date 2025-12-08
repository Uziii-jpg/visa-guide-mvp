export interface ToolTransaction {
    _id: string;
    user_id: string;
    tool_type: 'cover_letter' | 'noc_generator' | 'dummy_itinerary' | 'photo_validator' | 'crs_calculator';
    created_at: Date;

    // The Data they input (We save this so they can "Edit" later)
    input_data: Record<string, any>;
    // Example for NOC: { "manager_name": "John", "joining_date": "2020-01-01" }

    // The Output (Transient)
    output_url?: string; // S3 Link to generated PDF (Expires in 24h)
}

// Master config for the tools (Stored in Frontend or DB)
export interface ToolDefinition {
    id: 'noc_employee';
    name: 'NOC Generator for Employees';
    required_inputs: ['manager_name', 'designation', 'salary'];
    pdf_template_url: string; // Path to the visual template
}
