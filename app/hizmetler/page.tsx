import { promises as fs } from 'fs';
import path from 'path';
import HizmetlerPageClient from './HizmetlerPageClient';

interface Service {
    id: string;
    baslik: string;
    kategori: string;
    ozet: string;
    etiketler?: string[];
}

async function getServices(): Promise<Service[]> {
    try {
        const filePath = path.join(process.cwd(), 'data', 'services.json');
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Hizmetler yüklenemedi:', error);
        return [];
    }
}

export default async function HizmetlerPage() {
    const services = await getServices();

    return <HizmetlerPageClient services={services} />;
}