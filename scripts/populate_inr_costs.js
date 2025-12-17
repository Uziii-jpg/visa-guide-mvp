const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data/COUNTRIES');

if (!fs.existsSync(DATA_DIR)) {
    console.error(`Data directory not found: ${DATA_DIR}`);
    process.exit(1);
}

const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

let updatedCount = 0;
let errors = [];

console.log(`Found ${files.length} files. Starting migration...`);

files.forEach(file => {
    const filePath = path.join(DATA_DIR, file);
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);

        let meta = null;
        if (data.standalone_data && data.standalone_data.meta) {
            meta = data.standalone_data.meta;
        } else if (data.overrides && data.overrides.meta) {
            // Check overrides too
            meta = data.overrides.meta;
        }

        if (meta && meta.fee_euro_approx) {
            // Regex to find INR values: e.g. "15,540 INR", "15540 INR", "approx. 15,540 INR"
            // Matches numbers with optional commas before " INR"
            const inrMatch = meta.fee_euro_approx.match(/([\d,]+)\s*INR/i);

            if (inrMatch) {
                // Remove commas and parse to integer
                const inrString = inrMatch[1].replace(/,/g, '');
                const inrValue = parseInt(inrString, 10);

                if (!isNaN(inrValue)) {
                    // Update field
                    meta.fee_inr_approx = inrValue;

                    // Write back
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
                    console.log(`[UPDATED] ${file}: Found ${inrValue} INR`);
                    updatedCount++;
                }
            } else {
                console.log(`[SKIPPED] ${file}: No INR value found in string "${meta.fee_euro_approx}"`);
            }
        } else {
            // console.log(`[SKIPPED] ${file}: No meta or fee_euro_approx`);
        }

    } catch (err) {
        console.error(`Error processing ${file}:`, err);
        errors.push(file);
    }
});

console.log('\n--- MIGRATION COMPLETE ---');
console.log(`Updated: ${updatedCount}/${files.length}`);
if (errors.length > 0) {
    console.log('Errors:', errors);
}
