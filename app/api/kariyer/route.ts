import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'kariyer.json');
        const data = await fs.readFile(filePath, 'utf8');
        const kariyer = JSON.parse(data);

        return NextResponse.json(kariyer);
    } catch (error) {
        return NextResponse.json(
            { error: 'Kariyer verileri yüklenemedi' },
            { status: 500 }
        );
    }
}

