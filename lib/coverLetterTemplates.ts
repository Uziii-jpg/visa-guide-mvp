import { User } from '@/types/user';

interface CoverLetterData {
    user: User | null;
    countryName: string;
    visaType: string;
    // Student specific
    targetUniversity?: string;
    targetCourse?: string;
    // Tourist specific
    travelDates?: string;
    travelReason?: string;
}

export const generateStudentCoverLetter = (data: CoverLetterData): string => {
    const { user, countryName, targetUniversity, targetCourse } = data;

    const name = user?.personal_details.full_name_passport || "[Your Name]";
    const passport = user?.personal_details.passport_number || "[Passport Number]";
    const nationality = user?.personal_details.citizenship || "[Nationality]";
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Academic Background
    const education = user?.education_history?.[0];
    const prevDegree = education ? `${education.degree} from ${education.institution}` : "[Previous Degree]";

    // Financials
    const income = user?.financials.annual_income_inr
        ? `INR ${user.financials.annual_income_inr.toLocaleString()}`
        : "[Annual Income]";
    const savings = user?.financials.savings_liquid_inr
        ? `INR ${user.financials.savings_liquid_inr.toLocaleString()}`
        : "[Savings Amount]";

    const university = targetUniversity || "[Target University]";
    const course = targetCourse || "[Target Course]";

    return `Date: ${today}

To,
The Visa Officer,
Embassy of ${countryName}

Subject: Statement of Purpose for Student Visa Application - ${name} (Passport No: ${passport})

Respected Sir/Madam,

I am writing to respectfully submit my application for a Student Visa to pursue the ${course} at ${university} in ${countryName}. I am an ambitious student from ${nationality} with a strong academic background, and I am eager to further my education at your esteemed institution.

**Academic Background & Intent:**
I have completed my ${prevDegree}, where I developed a strong foundation in my field. I have chosen ${countryName} for my higher studies due to its world-class education system and the specific curriculum offered by ${university}, which perfectly aligns with my career aspirations.

**Financial Ability:**
I am fully aware of the financial obligations associated with studying abroad. My family has sufficient liquid assets to sponsor my education and living expenses. 
- Annual Family Income: ${income}
- Available Liquid Savings: ${savings}
I have attached the necessary financial documents, including bank statements and affidavits of support.

**Ties to Home Country:**
My primary goal is to acquire advanced knowledge in my field and return to my home country to contribute to the industry here. My entire family resides in ${nationality}, and I have significant social and economic ties that ensure my return after the completion of my course.

I have strictly adhered to the visa requirements and have attached all supporting documents, including my Confirmation of Enrolment (CoE) and health insurance.

I sincerely request you to consider my application favorably and grant me the opportunity to study in ${countryName}.

Sincerely,

${name}
Passport No: ${passport}
`.trim();
};

export const generateTouristCoverLetter = (data: CoverLetterData): string => {
    const { user, countryName, travelDates, travelReason } = data;

    const name = user?.personal_details.full_name_passport || "[Your Name]";
    const passport = user?.personal_details.passport_number || "[Passport Number]";
    const nationality = user?.personal_details.citizenship || "[Nationality]";
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Employment / Professional Stability
    const job = user?.employment_history?.[0];
    const employmentText = job
        ? `I am currently employed as a **${job.role}** at **${job.company}**, where I have been working for ${job.duration}.`
        : "I am currently self-employed/employed in [Your Profession].";

    // Financials
    const income = user?.financials.annual_income_inr
        ? `INR ${user.financials.annual_income_inr.toLocaleString()}`
        : "[Annual Income]";

    // Travel History (Trust Signal)
    const travelHistory = user?.risk_profile.travel_history || [];
    const travelHistoryText = travelHistory.length > 0
        ? `I am a frequent traveler and have previously visited ${travelHistory.join(', ')}, always adhering to visa regulations.`
        : "This will be my first international trip, and I am excited to visit your beautiful country.";

    const dates = travelDates || "[Travel Dates]";
    const reason = travelReason || "tourism and sightseeing";

    return `Date: ${today}

To,
The Visa Officer,
Embassy of ${countryName}

Subject: Application for Tourist Visa - ${name} (Passport No: ${passport})

Respected Sir/Madam,

I am writing to apply for a Tourist Visa to visit ${countryName} for the purpose of ${reason}. My intended travel dates are ${dates}.

**Professional & Financial Status:**
${employmentText} I have a stable annual income of ${income}, which allows me to comfortably fund this trip. I have attached my employment proof, leave sanction letter, and bank statements showing sufficient funds to cover all my travel expenses.

**Travel History:**
${travelHistoryText}

**Ties to Home Country:**
I have strong professional and family ties in ${nationality} that require my presence back home. 
- I have a permanent job at ${job?.company || "[Employer]"} to return to.
- My immediate family resides here, and I am their primary support.
I assure you that I have no intention of overstaying my visa or seeking employment in ${countryName}.

I have enclosed my flight itinerary, hotel bookings, and travel insurance for your review. I kindly request you to grant me a visa to visit your country.

Thank you for your time and consideration.

Sincerely,

${name}
Passport No: ${passport}
`.trim();
};
