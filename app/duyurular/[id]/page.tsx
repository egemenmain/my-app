import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { IdParams } from "@/app/types/router";

interface Announcement {
    id: number;
    baslik: string;
    ozet: string;
    icerik: string;
    tarih: string;
    kategori: string;
    onemli: boolean;
}

async function getAnnouncement(id: string): Promise<Announcement | null> {
    try {
        const { promises: fs } = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'data', 'duyurular.json');
        const data = await fs.readFile(filePath, 'utf8');
        const announcements = JSON.parse(data);
        return announcements.find((ann: Announcement) => ann.id === parseInt(id)) || null;
    } catch (error) {
        console.error('Duyuru yüklenemedi:', error);
        return null;
    }
}

export default async function AnnouncementDetailPage({ params }: { params: IdParams }) {
    const { id } = await params;
    const announcement = await getAnnouncement(id);

    if (!announcement) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <section className="bg-primary text-primary-foreground py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href="/duyurular">
                            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Duyurulara Dön
                            </Button>
                        </Link>
                    </div>
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <Badge variant={announcement.onemli ? "default" : "secondary"} className="text-sm">
                                {announcement.kategori}
                            </Badge>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-6">
                            {announcement.baslik}
                        </h1>
                        <div className="flex items-center justify-center text-primary-foreground/80">
                            <Calendar className="h-5 w-5 mr-2" />
                            <span>{announcement.tarih}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card>
                        <CardContent className="pt-8">
                            <div className="prose prose-lg max-w-none">
                                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                    {announcement.ozet}
                                </p>
                                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {announcement.icerik}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-8 text-center">
                        <Link href="/duyurular">
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Tüm Duyurulara Dön
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

