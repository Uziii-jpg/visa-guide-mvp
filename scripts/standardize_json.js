const fs = require('fs');
const path = require('path');

const COUNTRIES_DIR = path.join(__dirname, '..', 'data', 'COUNTRIES');

function main() {
    // Hardcoded paths based on project structure
    const SOURCE_DIR = path.join('d:', 'IMP', 'NEED MONEY THINGS', 'VisaMasterr', 'CountryData', 'COUNTRIES');
    const DEST_DIR = path.join('d:', 'IMP', 'NEED MONEY THINGS', 'VisaMasterr', 'visa-guide-mvp', 'data', 'COUNTRIES');

    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`Source directory not found: ${SOURCE_DIR}`);
        return;
    }

    if (!fs.existsSync(DEST_DIR)) {
        console.error(`Destination directory not found: ${DEST_DIR}`);
        // Optional: Create it if it doesn't exist
        // fs.mkdirSync(DEST_DIR, { recursive: true });
    }

    const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} JSON files in CountryData. Starting standardization and sync...`);

    files.forEach(file => {
        const sourcePath = path.join(SOURCE_DIR, file);
        const destPath = path.join(DEST_DIR, file);

        standardizeAndSyncFile(sourcePath, destPath);
    });

    console.log("Done.");
}

function standardizeAndSyncFile(sourcePath, destPath) {
    try {
        const content = fs.readFileSync(sourcePath, 'utf8');
        let data = JSON.parse(content);
        let modified = false;

        // ... (standardization logic is same, but applied to 'data' object) ...
        // I need to copy the standardization logic here or refactor.
        // For simplicity, I will call a helper function.

        modified = applyStandardization(data);

        // Always write to destination (Sync)
        // If modified, write to source too.

        if (modified) {
            fs.writeFileSync(sourcePath, JSON.stringify(data, null, 4));
            console.log(`[UPDATED] ${path.basename(sourcePath)}`);
        } else {
            console.log(`[CLEAN] ${path.basename(sourcePath)}`);
        }

        // Sync to App Data
        fs.writeFileSync(destPath, JSON.stringify(data, null, 4));
        // console.log(`[SYNCED] ${path.basename(destPath)}`);

    } catch (error) {
        console.error(`[ERROR] Failed to process ${sourcePath}:`, error.message);
    }
}

function applyStandardization(data) {
    let modified = false;

    // 1. Ensure eligibility block exists
    if (!data.eligibility) {
        // console.log(`[${data.country_code}] Adding missing eligibility block.`);
        data.eligibility = null;
        modified = true;
    }

    // 2. Standardize steps_flow (convert strings to objects)
    if (data.overrides && data.overrides.steps_flow) {
        const steps = data.overrides.steps_flow;
        const newSteps = steps.map((step, index) => {
            if (typeof step === 'string') {
                // console.log(`[${data.country_code}] Converting string step.`);
                modified = true;
                return {
                    step_order: index + 1,
                    title: step,
                    description: "Please update this description."
                };
            }
            return step;
        });
        data.overrides.steps_flow = newSteps;
    }

    // 3. Move university_guide to top level
    if (data.overrides && data.overrides.university_guide) {
        data.university_guide = data.overrides.university_guide;
        delete data.overrides.university_guide;
        modified = true;
    }

    // 4. Ensure university_guide exists for STUDENT visas
    if (data.visa_type === 'STUDENT') {
        if (!data.university_guide) {
            data.university_guide = {
                "top_universities": [],
                "application_platforms": [],
                "intake_seasons": [],
                "required_exams": [],
                "pre_visa_steps": []
            };
            modified = true;
        }

        const standardPlatforms = [
            {
                "name": "University Portals",
                "url": "N/A",
                "description": "Applications are submitted directly to each university's online portal."
            }
        ];

        if (JSON.stringify(data.university_guide.application_platforms) !== JSON.stringify(standardPlatforms)) {
            data.university_guide.application_platforms = standardPlatforms;
            modified = true;
        }

        // 6. Standardize intake_seasons
        if (data.university_guide.intake_seasons) {
            const seasons = data.university_guide.intake_seasons;
            const newSeasons = seasons.map(season => {
                if (typeof season === 'string') {
                    modified = true;
                    return {
                        season: season,
                        deadline: "Check University Website"
                    };
                }
                return season;
            });
            data.university_guide.intake_seasons = newSeasons;
        }

        // 7. Standardize pre_visa_steps
        if (data.university_guide.pre_visa_steps) {
            const steps = data.university_guide.pre_visa_steps;
            const newSteps = steps.map((step, index) => {
                if (typeof step === 'string') {
                    modified = true;
                    return {
                        step_order: index + 1,
                        title: step,
                        description: "Follow the official university guidelines."
                    };
                }
                return step;
            });
            data.university_guide.pre_visa_steps = newSteps;
        }
    }

    // 8. Rename link to action_link in steps_flow
    if (data.overrides && data.overrides.steps_flow) {
        data.overrides.steps_flow.forEach(step => {
            if (step.link) {
                step.action_link = step.link;
                delete step.link;
                modified = true;
            }
        });
    }

    // 9. Standardize documents
    if (data.overrides && data.overrides.documents) {
        let docs = [];
        if (Array.isArray(data.overrides.documents)) {
            docs = data.overrides.documents;
        } else if (data.overrides.documents.add) {
            docs = data.overrides.documents.add;
        }

        docs.forEach(doc => {
            if (doc.is_premium === undefined) {
                doc.is_premium = false;
                modified = true;
            }
            if (doc.link) {
                doc.action_link = doc.link;
                delete doc.link;
                modified = true;
            }
        });
    }

    return modified;
}

main();
