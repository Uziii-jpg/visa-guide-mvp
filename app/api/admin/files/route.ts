import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        // Define the path to the CountryData/COUNTRIES directory
        // Assuming the app is running in d:\IMP\NEED MONEY THINGS\VisaMasterr\visa-guide-mvp
        // and data is in d:\IMP\NEED MONEY THINGS\VisaMasterr\CountryData\COUNTRIES
        const dataDir = path.join(process.cwd(), 'data', 'COUNTRIES');

        if (!fs.existsSync(dataDir)) {
            return NextResponse.json({ error: 'Data directory not found' }, { status: 404 });
        }

        const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

        return NextResponse.json({ files });
    } catch (error) {
        console.error('Error reading files:', error);
        return NextResponse.json({ error: 'Failed to read files' }, { status: 500 });
    }
}
