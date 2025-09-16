import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'randevular.json');
        const data = await fs.readFile(filePath, 'utf8');
        const randevular = JSON.parse(data);

        return NextResponse.json(randevular);
    } catch (error) {
        return NextResponse.json(
            { error: 'Randevu verileri yüklenemedi' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const filePath = path.join(process.cwd(), 'data', 'randevular.json');
        const data = await fs.readFile(filePath, 'utf8');
        const randevular = JSON.parse(data);

        const newRandevu = {
            id: Math.max(...randevular.randevular.map((r: { id: number }) => r.id)) + 1,
            randevuNo: `RND-2024-${String(randevular.randevular.length + 1).padStart(3, '0')}`,
            ...body,
            durum: 'Onaylandı',
            notlar: ''
        };

        randevular.randevular.push(newRandevu);

        await fs.writeFile(filePath, JSON.stringify(randevular, null, 2));

        return NextResponse.json(newRandevu, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Randevu alınamadı' },
            { status: 500 }
        );
    }
}
