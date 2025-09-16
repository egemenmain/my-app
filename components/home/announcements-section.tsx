import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { tr } from "@/lib/i18n";

interface Announcement {
    id: number;
    baslik: string;
    ozet: string;
    tarih: string;
    kategori: string;
    onemli: boolean;
}

interface AnnouncementsSectionProps {
    announcements: Announcement[];
}

export default function AnnouncementsSection({ announcements }: AnnouncementsSectionProps) {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-textPrimary mb-4">
                            {tr.home.announcements.title}
                        </h2>
                        <p className="text-textMuted">
                            Belediyemizden güncel duyurular ve haberler
                        </p>
                    </div>
                    <Link href="/duyurular">
                        <Button variant="outline" className="flex items-center gap-2">
                            {tr.home.announcements.viewAll}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {announcements.slice(0, 6).map((announcement) => (
                        <Card key={announcement.id} className="bg-card border border-border rounded-2xl shadow-card hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <Badge variant={announcement.onemli ? "default" : "secondary"}>
                                        {announcement.kategori}
                                    </Badge>
                                    <div className="flex items-center text-sm text-textMuted">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {announcement.tarih}
                                    </div>
                                </div>
                                <CardTitle className="text-lg line-clamp-2 text-textPrimary">
                                    {announcement.baslik}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-textMuted text-sm line-clamp-3">
                                    {announcement.ozet}
                                </p>
                                <Link href={`/duyurular/${announcement.id}`}>
                                    <Button variant="ghost" size="sm" className="mt-4 p-0 h-auto text-primary hover:text-primary">
                                        Devamını Oku
                                        <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
