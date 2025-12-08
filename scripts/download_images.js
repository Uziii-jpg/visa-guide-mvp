const fs = require('fs');
const path = require('path');
const https = require('https');

const images = {
    // North America
    "CA": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1000&auto=format&fit=crop",
    "US": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=1000&auto=format&fit=crop",
    "MX": "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?q=80&w=1000&auto=format&fit=crop",

    // South America
    "BR": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1000&auto=format&fit=crop",
    "AR": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?q=80&w=1000&auto=format&fit=crop",
    "CO": "https://images.unsplash.com/photo-1533630247289-8a385494446b?q=80&w=1000&auto=format&fit=crop",
    "CL": "https://images.unsplash.com/photo-1533035332508-3b47432e36a7?q=80&w=1000&auto=format&fit=crop",
    "PE": "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1000&auto=format&fit=crop",

    // Europe
    "GB": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop",
    "FR": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop",
    "DE": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1000&auto=format&fit=crop",
    "IT": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1000&auto=format&fit=crop",
    "ES": "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1000&auto=format&fit=crop",
    "CH": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1000&auto=format&fit=crop",
    "NL": "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=1000&auto=format&fit=crop",
    "SE": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?q=80&w=1000&auto=format&fit=crop",
    "NO": "https://images.unsplash.com/photo-1520632123502-3026888be41e?q=80&w=1000&auto=format&fit=crop",
    "DK": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?q=80&w=1000&auto=format&fit=crop",
    "FI": "https://images.unsplash.com/photo-1523374228107-6e44bd2b524e?q=80&w=1000&auto=format&fit=crop",
    "IE": "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?q=80&w=1000&auto=format&fit=crop",
    "PT": "https://images.unsplash.com/photo-1555881400-74d7acaacd81?q=80&w=1000&auto=format&fit=crop",
    "GR": "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1000&auto=format&fit=crop",
    "AT": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=1000&auto=format&fit=crop",
    "BE": "https://images.unsplash.com/photo-1562976540-150ad786e174?q=80&w=1000&auto=format&fit=crop",
    "PL": "https://images.unsplash.com/photo-1519197924294-4ba991a11128?q=80&w=1000&auto=format&fit=crop",
    "CZ": "https://images.unsplash.com/photo-1541849546-216549ae216d?q=80&w=1000&auto=format&fit=crop",
    "HU": "https://images.unsplash.com/photo-1565426873118-a17ed65d74b9?q=80&w=1000&auto=format&fit=crop",
    "RO": "https://images.unsplash.com/photo-1584646098378-0874589d76b1?q=80&w=1000&auto=format&fit=crop",
    "UA": "https://images.unsplash.com/photo-1569429593410-b498b3fb3387?q=80&w=1000&auto=format&fit=crop",
    "TR": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1000&auto=format&fit=crop",
    "RU": "https://images.unsplash.com/photo-1513326738677-b964603b136d?q=80&w=1000&auto=format&fit=crop",

    // Asia
    "JP": "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1000&auto=format&fit=crop",
    "CN": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1000&auto=format&fit=crop",
    "IN": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1000&auto=format&fit=crop",
    "KR": "https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=1000&auto=format&fit=crop",
    "TH": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1000&auto=format&fit=crop",
    "VN": "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000&auto=format&fit=crop",
    "ID": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop",
    "MY": "https://images.unsplash.com/photo-1596422846543-75c6a19a2c8d?q=80&w=1000&auto=format&fit=crop",
    "SG": "https://images.unsplash.com/photo-1565967511849-76a60a516170?q=80&w=1000&auto=format&fit=crop",
    "PH": "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1000&auto=format&fit=crop",
    "PK": "https://images.unsplash.com/photo-1589405858862-2ac9cbb41321?q=80&w=1000&auto=format&fit=crop",
    "BD": "https://images.unsplash.com/photo-1587222318638-8d252db0e913?q=80&w=1000&auto=format&fit=crop",
    "LK": "https://images.unsplash.com/photo-1586861635167-e5223aeb4227?q=80&w=1000&auto=format&fit=crop",
    "AE": "https://images.unsplash.com/photo-1512453979798-5ea9ba6a80f6?q=80&w=1000&auto=format&fit=crop",
    "SA": "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?q=80&w=1000&auto=format&fit=crop",
    "IL": "https://images.unsplash.com/photo-1541367777765-2703706d02a4?q=80&w=1000&auto=format&fit=crop",
    "QA": "https://images.unsplash.com/photo-1575540325855-3b5e04539712?q=80&w=1000&auto=format&fit=crop",

    // Africa
    "ZA": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=1000&auto=format&fit=crop",
    "EG": "https://images.unsplash.com/photo-1539650116455-251d93d5e5b5?q=80&w=1000&auto=format&fit=crop",
    "MA": "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1000&auto=format&fit=crop",
    "NG": "https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=1000&auto=format&fit=crop",
    "KE": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=1000&auto=format&fit=crop",
    "TZ": "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1000&auto=format&fit=crop",

    // Oceania
    "AU": "https://images.unsplash.com/photo-1523482580672-01e6f06378c5?q=80&w=1000&auto=format&fit=crop",
    "NZ": "https://images.unsplash.com/photo-1507699622177-38889b58527d?q=80&w=1000&auto=format&fit=crop",
};

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
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
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    console.log(`Downloading ${Object.keys(images).length} images...`);

    for (const [code, url] of Object.entries(images)) {
        const filepath = path.join(dir, `${code}.jpg`);
        if (fs.existsSync(filepath)) {
            console.log(`Skipping ${code} (already exists)`);
            continue;
        }

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
