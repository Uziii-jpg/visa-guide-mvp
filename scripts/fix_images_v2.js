const fs = require('fs');
const path = require('path');
const https = require('https');

// New URLs for remaining failed downloads
const images = {
    "CL": "https://images.unsplash.com/photo-1599739291060-4578e77dac5d?q=80&w=1000&auto=format&fit=crop", // Santiago
    "LK": "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?q=80&w=1000&auto=format&fit=crop", // Sri Lanka
    "NZ": "https://images.unsplash.com/photo-1574966739987-65e38a0b0249?q=80&w=1000&auto=format&fit=crop", // NZ
    "QA": "https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=1000&auto=format&fit=crop", // Doha
};

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(filepath, () => { });
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            reject(err);
        });
    });
};

const main = async () => {
    const dir = path.join(__dirname, '../public/images/countries');

    console.log(`Fixing ${Object.keys(images).length} remaining images...`);

    for (const [code, url] of Object.entries(images)) {
        const filepath = path.join(dir, `${code}.jpg`);

        try {
            console.log(`Downloading ${code}...`);
            await downloadImage(url, filepath);
        } catch (error) {
            console.error(`Error downloading ${code}:`, error.message);
        }
    }

    console.log('Done!');
};

main();
