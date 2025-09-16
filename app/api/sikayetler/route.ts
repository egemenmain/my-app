import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'sikayetler.json');
        const data = await fs.readFile(filePath, 'utf8');
        const sikayetler = JSON.parse(data);

        return NextResponse.json(sikayetler);
    } catch (error) {
        return NextResponse.json(
            { error: 'Şikayet verileri yüklenemedi' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const filePath = path.join(process.cwd(), 'data', 'sikayetler.json');
        const data = await fs.readFile(filePath, 'utf8');
        const sikayetler = JSON.parse(data);

        const newSikayet = {
            id: Math.max(...sikayetler.sikayetler.map((s: { id: number }) => s.id)) + 1,
            ticketId: `TKT-2024-${String(sikayetler.sikayetler.length + 1).padStart(3, '0')}`,
            ...body,
            tarih: new Date().toLocaleDateString('tr-TR'),
            durum: 'İnceleniyor',
            sonGuncelleme: new Date().toLocaleDateString('tr-TR'),
            cozum: ''
        };

        sikayetler.sikayetler.push(newSikayet);

        await fs.writeFile(filePath, JSON.stringify(sikayetler, null, 2));

        return NextResponse.json(newSikayet, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Şikayet gönderilemedi' },
            { status: 500 }
        );
    }
}
