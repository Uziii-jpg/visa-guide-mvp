const { getVisaData } = require('../lib/visaDataFetcher');

async function test() {
    try {
        console.log("Testing USA Student Visa Data Fetch...");
        const data = await getVisaData('US', 'STUDENT');

        console.log("\n--- MERGED DATA RESULT ---");
        console.log("Country Code:", data.country_code);

        console.log("\n[UNIVERSITY GUIDE VERIFICATION]");
        if (data.university_guide) {
            console.log("Top Universities Count:", data.university_guide.top_universities.length);
            console.log("First University:", data.university_guide.top_universities[0]);
            console.log("Intake Seasons:", data.university_guide.intake_seasons.map((s: any) => s.season).join(", "));
        } else {
            console.error("University Guide Missing!");
        }

        console.log("\nTest Completed Successfully!");
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

test();
