import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'ebelediye.json');
        const data = await fs.readFile(filePath, 'utf8');
        const ebelediye = JSON.parse(data);

        return NextResponse.json(ebelediye);
    } catch (error) {
        return NextResponse.json(
            { error: 'E-belediye verileri yüklenemedi' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const filePath = path.join(process.cwd(), 'data', 'ebelediye.json');
        const data = await fs.readFile(filePath, 'utf8');
        const ebelediye = JSON.parse(data);

        if (body.type === 'ruhsat') {
            const newRuhsat = {
                basvuruNo: `RBS-2024-${String(ebelediye.ruhsatBasvurulari.length + 1).padStart(3, '0')}`,
                ...body.data,
                basvuruTarihi: new Date().toLocaleDateString('tr-TR'),
                durum: 'İnceleme Aşamasında',
                sonGuncelleme: new Date().toLocaleDateString('tr-TR')
            };

            ebelediye.ruhsatBasvurulari.push(newRuhsat);
        }

        await fs.writeFile(filePath, JSON.stringify(ebelediye, null, 2));

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'İşlem gerçekleştirilemedi' },
            { status: 500 }
        );
    }
}

