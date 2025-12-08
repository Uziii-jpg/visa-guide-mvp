const fs = require('fs');
const path = require('path');
const https = require('https');

// New URLs for failed downloads
const images = {
    "AE": "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1000&auto=format&fit=crop", // Dubai
    "AU": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1000&auto=format&fit=crop", // Sydney
    "BE": "https://images.unsplash.com/photo-1491557345352-5929e343eb89?q=80&w=1000&auto=format&fit=crop", // Bruges
    "CL": "https://images.unsplash.com/photo-1518182170546-0766aa6f6a56?q=80&w=1000&auto=format&fit=crop", // Torres del Paine
    "CO": "https://images.unsplash.com/photo-1583531352515-8884af319dc1?q=80&w=1000&auto=format&fit=crop", // Cartagena
    "EG": "https://images.unsplash.com/photo-1539768942893-daf53e448371?q=80&w=1000&auto=format&fit=crop", // Pyramids
    "IL": "https://images.unsplash.com/photo-1544971587-b842c27f8e14?q=80&w=1000&auto=format&fit=crop", // Jerusalem
    "LK": "https://images.unsplash.com/photo-1588258524675-55d656396b8a?q=80&w=1000&auto=format&fit=crop", // Train
    "MY": "https://images.unsplash.com/photo-1508062878650-88b52897f298?q=80&w=1000&auto=format&fit=crop", // Petronas
    "NO": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1000&auto=format&fit=crop", // Lofoten
    "NZ": "https://images.unsplash.com/photo-1469521669194-babb45f83544?q=80&w=1000&auto=format&fit=crop", // Nature
    "PT": "https://images.unsplash.com/photo-1503785640985-f62e3aeee448?q=80&w=1000&auto=format&fit=crop", // Lisbon
    "QA": "https://images.unsplash.com/photo-1573330126229-507205a9125f?q=80&w=1000&auto=format&fit=crop", // Doha
    "BD": "https://images.unsplash.com/photo-1592345279419-959d784e8aad?q=80&w=1000&auto=format&fit=crop", // Boat
};

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                // Ensure we close and delete the file if status is bad
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

    console.log(`Fixing ${Object.keys(images).length} images...`);

    for (const [code, url] of Object.entries(images)) {
        const filepath = path.join(dir, `${code}.jpg`);

        // Always overwrite for this fix script
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
