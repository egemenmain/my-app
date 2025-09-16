import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'etkinlikler.json');
        const data = await fs.readFile(filePath, 'utf8');
        const etkinlikler = JSON.parse(data);

        return NextResponse.json(etkinlikler);
    } catch (error) {
        return NextResponse.json(
            { error: 'Etkinlik verileri yüklenemedi' },
            { status: 500 }
        );
    }
}

