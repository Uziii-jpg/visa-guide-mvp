import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const cwd = process.cwd();
        const dataRoot = path.join(cwd, 'data');
        const configPath = path.join(dataRoot, 'COUNTRIES', 'FR_TOURIST.json');

        const exists = fs.existsSync(configPath);

        return NextResponse.json({
            success: exists,
            cwd,
            dataRoot,
            configPath,
            exists,
            dirContents: exists ? 'N/A' : fs.readdirSync(path.join(dataRoot, 'COUNTRIES'))
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 200 });
    }
}
