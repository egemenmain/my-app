import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'afet.json');
        const data = await fs.readFile(filePath, 'utf8');
        const afet = JSON.parse(data);

        return NextResponse.json(afet);
    } catch (error) {
        return NextResponse.json(
            { error: 'Afet verileri yüklenemedi' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const filePath = path.join(process.cwd(), 'data', 'afet.json');
        const data = await fs.readFile(filePath, 'utf8');
        const afet = JSON.parse(data);

        if (body.type === 'bilgilendirme') {
            const newAbonelik = {
                id: Math.max(...afet.bilgilendirmeAbonelikleri.map((a: { id: number }) => a.id)) + 1,
                ...body.data,
                kayitTarihi: new Date().toLocaleDateString('tr-TR'),
                aktif: true
            };

            afet.bilgilendirmeAbonelikleri.push(newAbonelik);
        }

        await fs.writeFile(filePath, JSON.stringify(afet, null, 2));

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Abonelik eklenemedi' },
            { status: 500 }
        );
    }
}
