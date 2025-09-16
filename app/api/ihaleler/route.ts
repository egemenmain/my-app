import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'ihaleler.json');
        const data = await fs.readFile(filePath, 'utf8');
        const ihaleler = JSON.parse(data);

        return NextResponse.json(ihaleler);
    } catch (error) {
        return NextResponse.json(
            { error: 'İhale verileri yüklenemedi' },
            { status: 500 }
        );
    }
}

