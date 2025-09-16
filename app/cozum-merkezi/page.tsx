"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search, MapPin, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { tr } from "@/lib/i18n";

export default function CozumMerkeziPage() {
    const [reportForm, setReportForm] = useState({
        tcNo: "",
        adSoyad: "",
        telefon: "",
        email: "",
        kategori: "",
        altKategori: "",
        baslik: "",
        aciklama: "",
        adres: "",
        enlem: "",
        boylam: ""
    });

    const [trackForm, setTrackForm] = useState({
        ticketId: ""
    });

    const [trackResult, setTrackResult] = useState<{
        ticketId: string;
        baslik: string;
        durum: string;
        sonGuncelleme: string;
        cozum: string;
    } | null>(null);

    const handleReportSubmit = async () => {
        if (!reportForm.tcNo || !reportForm.adSoyad || !reportForm.telefon || !reportForm.kategori || !reportForm.baslik) {
            toast.error("Lütfen zorunlu alanları doldurunuz");
            return;
        }

        // Demo şikayet gönderimi
        const ticketId = `TKT-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        toast.success(`Şikayetiniz alınmıştır. Takip numaranız: ${ticketId}`);

        setReportForm({
            tcNo: "",
            adSoyad: "",
            telefon: "",
            email: "",
            kategori: "",
            altKategori: "",
            baslik: "",
            aciklama: "",
            adres: "",
            enlem: "",
            boylam: ""
        });
    };

    const handleTrackSearch = async () => {
        if (!trackForm.ticketId) {
            toast.error("Takip numarası giriniz");
            return;
        }

        // Demo takip sorgulama
        const demoResult = {
            ticketId: trackForm.ticketId,
            baslik: "Çöp toplama gecikmesi",
            durum: "İnceleniyor",
            sonGuncelleme: "13.12.2024",
            cozum: ""
        };

        setTrackResult(demoResult);
        toast.success("Takip sorgulama tamamlandı");
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <section className="bg-primary text-primary-foreground py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            {tr.solution.title}
                        </h1>
                        <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
                            Sorunlarınızı bildirin, çözümlerimizi takip edin
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Tabs defaultValue="report" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="report" className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                {tr.solution.tabs.report}
                            </TabsTrigger>
                            <TabsTrigger value="track" className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                {tr.solution.tabs.track}
                            </TabsTrigger>
                        </TabsList>

                        {/* Sorun Bildir */}
                        <TabsContent value="report" className="mt-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5" />
                                        {tr.solution.report.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">{tr.solution.report.personalInfo}</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="tcNo">{tr.form.tcNo} *</Label>
                                                <Input
                                                    id="tcNo"
                                                    value={reportForm.tcNo}
                                                    onChange={(e) => setReportForm({ ...reportForm, tcNo: e.target.value })}
                                                    placeholder="12345678901"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="adSoyad">Ad Soyad *</Label>
                                                <Input
                                                    id="adSoyad"
                                                    value={reportForm.adSoyad}
                                                    onChange={(e) => setReportForm({ ...reportForm, adSoyad: e.target.value })}
                                                    placeholder="Ahmet Yılmaz"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="telefon">{tr.form.phone} *</Label>
                                                <Input
                                                    id="telefon"
                                                    value={reportForm.telefon}
                                                    onChange={(e) => setReportForm({ ...reportForm, telefon: e.target.value })}
                                                    placeholder="0532 123 45 67"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">{tr.form.email}</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={reportForm.email}
                                                    onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                                                    placeholder="ahmet@email.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">{tr.solution.report.problemInfo}</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="kategori">{tr.form.category} *</Label>
                                                <Select value={reportForm.kategori} onValueChange={(value) => setReportForm({ ...reportForm, kategori: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Kategori seçiniz" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="cevre">Çevre</SelectItem>
                                                        <SelectItem value="ulasim">Ulaşım</SelectItem>
                                                        <SelectItem value="park">Park</SelectItem>
                                                        <SelectItem value="saglik">Sağlık</SelectItem>
                                                        <SelectItem value="kultur">Kültür</SelectItem>
                                                        <SelectItem value="diger">Diğer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="altKategori">{tr.form.subCategory}</Label>
                                                <Select value={reportForm.altKategori} onValueChange={(value) => setReportForm({ ...reportForm, altKategori: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Alt kategori seçiniz" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="cop">Çöp Toplama</SelectItem>
                                                        <SelectItem value="temizlik">Temizlik</SelectItem>
                                                        <SelectItem value="yol">Yol Durumu</SelectItem>
                                                        <SelectItem value="trafik">Trafik</SelectItem>
                                                        <SelectItem value="aydinlatma">Aydınlatma</SelectItem>
                                                        <SelectItem value="diger">Diğer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="baslik">{tr.form.title} *</Label>
                                            <Input
                                                id="baslik"
                                                value={reportForm.baslik}
                                                onChange={(e) => setReportForm({ ...reportForm, baslik: e.target.value })}
                                                placeholder="Sorun başlığı"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="aciklama">{tr.form.description}</Label>
                                            <Textarea
                                                id="aciklama"
                                                value={reportForm.aciklama}
                                                onChange={(e) => setReportForm({ ...reportForm, aciklama: e.target.value })}
                                                placeholder="Sorun hakkında detaylı açıklama..."
                                                rows={4}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">{tr.solution.report.locationInfo}</h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="adres">{tr.form.address}</Label>
                                            <Textarea
                                                id="adres"
                                                value={reportForm.adres}
                                                onChange={(e) => setReportForm({ ...reportForm, adres: e.target.value })}
                                                placeholder="Sorunun yaşandığı adres"
                                                rows={2}
                                            />
                                        </div>
                                    </div>

                                    <Button onClick={handleReportSubmit} className="w-full">
                                        {tr.solution.report.submit}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Başvuru Takip */}
                        <TabsContent value="track" className="mt-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Search className="h-5 w-5" />
                                        {tr.solution.track.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="ticketId">{tr.solution.track.ticketId}</Label>
                                        <Input
                                            id="ticketId"
                                            value={trackForm.ticketId}
                                            onChange={(e) => setTrackForm({ ...trackForm, ticketId: e.target.value })}
                                            placeholder="TKT-2024-001"
                                        />
                                    </div>

                                    <Button onClick={handleTrackSearch} className="w-full">
                                        {tr.solution.track.search}
                                    </Button>

                                    {trackResult && (
                                        <Card className="bg-blue-50 border-blue-200">
                                            <CardContent className="pt-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <CheckCircle className="h-5 w-5 text-blue-600" />
                                                    <h3 className="font-semibold text-blue-800">Takip Sonucu</h3>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Başlık:</p>
                                                        <p className="font-semibold">{trackResult.baslik}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">{tr.solution.track.status}:</p>
                                                        <Badge variant="secondary">{trackResult.durum}</Badge>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">{tr.solution.track.lastUpdate}:</p>
                                                        <p className="font-semibold">{trackResult.sonGuncelleme}</p>
                                                    </div>
                                                    {trackResult.cozum && (
                                                        <div>
                                                            <p className="text-sm text-gray-600">{tr.solution.track.solution}:</p>
                                                            <p className="font-semibold">{trackResult.cozum}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </div>
    );
}
