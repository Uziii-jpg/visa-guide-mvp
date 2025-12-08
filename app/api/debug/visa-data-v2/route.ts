import { NextResponse } from 'next/server';
import { getVisaData } from '@/lib/visaDataFetcher';

export async function GET() {
    try {
        const data = await getVisaData('US', 'STUDENT');
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 200 });
    }
}
