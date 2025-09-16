// app/hizmetler/[id]/page.tsx
import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ServiceParams } from "@/app/types/router";

interface Service {
    id: string;
    baslik: string;
    kategori: string;
    ozet: string;
    icerikHtml: string;
    etiketler?: string[];
}

async function getService(id: string): Promise<Service | null> {
    try {
        const filePath = path.join(process.cwd(), "data", "services.json");
        const data = await fs.readFile(filePath, "utf8");
        const services = JSON.parse(data);
        return services.find((service: Service) => service.id === id) || null;
    } catch (error) {
        console.error("Hizmet yüklenemedi:", error);
        return null;
    }
}

const staticSlugs = new Set([
    'bilgi-evi-hizmetleri',
    'dilekce-genel-muracaat',
    'engelli-hizmetleri',
    'hasta-yasli-hizmetleri',
    'altyapi-yol-bakim-onarim',
    'is-muracaatlari-istihdam-merkezi   ',
    'evlendirme-nikah-islemleri',
    'mal-hizmetleri',
    'mali-hizmetler',
    'zabita-hizmetleri',
    'kentsel-donusum-hizmetleri',
    'park-ve-yesil-alan-hizmetleri',
    'tebrik-ziyaretleri',
    'veteriner-hizmetleri',
    'cevre-koruma-geri-donusum',
    'cevre-koruma-ve-geri-donusum',
    'diyetisyenlik-ve-psikolojik-danismanlik',
]);




// İlgili işlem butonları
function getRelatedActions(serviceId: string) {
    const actions: Record<
        string,
        { label: string; href: string; description: string }
    > = {
        "evlendirme-nikah-islemleri": {
            label: "Online Randevu Al",
            href: "/randevu?tab=nikah",
            description: "Nikah randevusu için online başvuru yapabilirsiniz.",
        },
        "isyeri-ruhsatlari": {
            label: "Ruhsat Başvurusu",
            href: "/ebelediye?tab=permit",
            description: "İşyeri ruhsatı için online başvuru yapabilirsiniz.",
        },
        "dilekce-genel-muracaat": {
            label: "Şikayet/Talep Bildir",
            href: "/cozum-merkezi?tab=report",
            description: "Genel müracaat ve şikayetlerinizi bildirebilirsiniz.",
        },
        "imar-sehircilik-hizmetleri": {
            label: "İmar İşlemleri",
            href: "/imar",
            description: "İmar ve şehircilik işlemleri için başvuru yapabilirsiniz.",
        },
        "yapi-kontrol-asansor-tescil": {
            label: "Yapı Kontrol İşlemleri",
            href: "/imar",
            description:
                "Yapı kontrol ve asansör tescil işlemleri için başvuru yapabilirsiniz.",
        },
        "ucretler-tarifeler": {
            label: "Ücretler ve Tarifeler",
            href: "/ucretler-ve-tarifeler",
            description:
                "Detaylı ücret listesi ve tarife bilgilerini görüntüleyebilirsiniz.",
        },
    };
    return actions[serviceId] || null;
}

export default async function ServiceDetailPage({
    params,
}: {
    params: ServiceParams;
}) {
    const { id } = await params;

    // Yanlış yazılmış slug -> doğru olana harici yönlendirmeyi üst seviye router çözeceği için
    // burada self-redirect YAPMIYORUZ (sonsuz döngüyü engeller).
    // Eğer alias kullanıyorsan, /hizmetler tarafındaki linkleri doğru slug’a güncelle.

    const service = await getService(id);
    if (!service) {
        notFound();
    }

    const relatedAction = getRelatedActions(service.id);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <section className="bg-primary text-primary-foreground py-16">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href="/hizmetler">
                            <Button
                                variant="ghost"
                                className="text-primary-foreground hover:bg-primary-foreground/10"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Hizmetlere Dön
                            </Button>
                        </Link>
                    </div>
                    <div className="text-center">
                        <div className="mb-4 flex justify-center">
                            <Badge variant="secondary" className="text-black">
                                {service.kategori}
                            </Badge>
                        </div>
                        <h1 className="mb-6 text-3xl font-bold md:text-4xl">
                            {service.baslik}
                        </h1>
                        <p className="mx-auto max-w-3xl text-xl text-primary-foreground/90">
                            {service.ozet}
                        </p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-16">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <Card className="rounded-2xl bg-card">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-textPrimary">
                                        <FileText className="h-5 w-5 text-secondary" />
                                        Hizmet Detayları
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className="prose prose-lg max-w-none text-textPrimary"
                                        dangerouslySetInnerHTML={{ __html: service.icerikHtml }}
                                    />
                                </CardContent>
                            </Card>

                            {/* Etiketler */}
                            {service.etiketler && service.etiketler.length > 0 && (
                                <Card className="mt-6 rounded-2xl bg-card">
                                    <CardHeader>
                                        <CardTitle className="text-textPrimary">Etiketler</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {service.etiketler.map((etiket, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="outline"
                                                    className="border-border text-textPrimary"
                                                >
                                                    {etiket}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                {/* İlgili İşlemler */}
                                {relatedAction && (
                                    <Card className="rounded-2xl bg-card">
                                        <CardHeader>
                                            <CardTitle className="text-textPrimary">
                                                İlgili İşlemler
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Link href={relatedAction.href}>
                                                    <Button className="w-full bg-primary text-primary-foreground hover:opacity-90">
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        {relatedAction.label}
                                                    </Button>
                                                </Link>
                                                <p className="mt-2 text-sm text-textMuted">
                                                    {relatedAction.description}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-muted p-3 text-xs text-textMuted">
                                                <strong>Not:</strong> Bu sayfa demo amaçlıdır. Gerçek
                                                işlemler için belediye birimlerimizle iletişime
                                                geçiniz.
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Hızlı İletişim */}
                                <Card className="rounded-2xl bg-card">
                                    <CardHeader>
                                        <CardTitle className="text-textPrimary">
                                            Hızlı İletişim
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Link href="/iletisim">
                                            <Button variant="outline" className="w-full">
                                                İletişim Bilgileri
                                            </Button>
                                        </Link>
                                        <Link href="/cozum-merkezi">
                                            <Button variant="outline" className="w-full">
                                                Şikayet/Talep Bildir
                                            </Button>
                                        </Link>
                                        <Link href="/randevu">
                                            <Button variant="outline" className="w-full">
                                                Online Randevu
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
