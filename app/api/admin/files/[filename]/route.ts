import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ filename: string }> }
) {
    const params = await props.params;
    const filename = params.filename;

    if (!filename) {
        return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    try {
        const filePath = path.join(process.cwd(), 'data', 'COUNTRIES', filename);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        return NextResponse.json({ content });
    } catch (error) {
        console.error('Error reading file:', error);
        return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ filename: string }> }
) {
    const params = await props.params;
    const filename = params.filename;

    if (!filename) {
        return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const filePath = path.join(process.cwd(), 'data', 'COUNTRIES', filename);

        // Ensure we are only writing to existing files for safety in this MVP
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'File does not exist. Creation not allowed via this endpoint.' }, { status: 404 });
        }

        // Validate JSON before saving
        try {
            JSON.parse(content);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON content' }, { status: 400 });
        }

        fs.writeFileSync(filePath, content, 'utf-8');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error writing file:', error);
        return NextResponse.json({ error: 'Failed to write file' }, { status: 500 });
    }
}
