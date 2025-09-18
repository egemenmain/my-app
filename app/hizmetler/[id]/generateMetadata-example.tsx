/**
 * generateMetadata ÖRNEĞİ - Next.js 15 Uyumluluğu
 * 
 * Bu dosya, generateMetadata fonksiyonunun Next.js 15'te nasıl kullanılacağını gösterir.
 * Gerçek projede bu fonksiyonu app/hizmetler/[id]/page.tsx dosyasına ekleyebilirsiniz.
 */

import type { Metadata } from "next";
import type { ServiceParams } from "@/app/types/router";

// Örnek hizmet verisi çekme fonksiyonu
async function getService(id: string) {
    // Gerçek implementasyon burada olacak
    return {
        id,
        baslik: "Örnek Hizmet",
        ozet: "Hizmet açıklaması",
        kategori: "Genel"
    };
}

// Next.js 15 uyumlu generateMetadata
export async function generateMetadata(
    { params }: { params: ServiceParams }
): Promise<Metadata> {
    const { id } = await params;
    const service = await getService(id);

    if (!service) {
        return {
            title: "Hizmet Bulunamadı | Birim Ajans Belediyesi",
            description: "Aradığınız hizmet bulunamadı.",
        };
    }

    return {
        title: `${service.baslik} | Birim Ajans Belediyesi`,
        description: service.ozet,
        keywords: `${service.kategori}, belediye hizmeti, ${service.baslik}`,
        openGraph: {
            title: `${service.baslik} | Birim Ajans Belediyesi`,
            description: service.ozet,
            type: "website",
            locale: "tr_TR",
        },
        twitter: {
            card: "summary_large_image",
            title: `${service.baslik} | Birim Ajans Belediyesi`,
            description: service.ozet,
        },
    };
}

/**
 * KULLANIM NOTLARI:
 * 
 * 1. params artık Promise<{ id: string }> tipinde
 * 2. await params ile değeri çıkarmalısınız
 * 3. generateMetadata async olmalı
 * 4. Metadata tipini import etmeyi unutmayın
 * 5. Hata durumları için fallback metadata sağlayın
 * 
 * ÖRNEK KULLANIM:
 * Bu fonksiyonu app/hizmetler/[id]/page.tsx dosyasına ekleyin:
 * 
 * export async function generateMetadata({ params }: { params: ServiceParams }) {
 *     const { id } = await params;
 *     // ... metadata oluşturma
 * }
 */












