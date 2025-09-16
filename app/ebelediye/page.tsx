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
import { CreditCard, Search, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { tr } from "@/lib/i18n";

export default function EBelediyePage() {
    const [taxForm, setTaxForm] = useState({
        tcNo: "",
        ada: "",
        parsel: "",
        period: ""
    });

    const [debtQuery, setDebtQuery] = useState({
        searchBy: "tcNo",
        tcNo: "",
        ada: "",
        parsel: ""
    });

    const [permitForm, setPermitForm] = useState({
        tcNo: "",
        adSoyad: "",
        telefon: "",
        email: "",
        adres: "",
        ada: "",
        parsel: "",
        aciklama: ""
    });

    const [debtResult, setDebtResult] = useState<{
        tcNo: string;
        ada: string;
        parsel: string;
        emlakVergisi: Record<string, number>;
        temizlikVergisi: Record<string, number>;
        toplam: number;
    } | null>(null);
    const [permitResult, setPermitResult] = useState<string>("");

    const handleTaxPayment = async () => {
        if (!taxForm.tcNo || !taxForm.ada || !taxForm.parsel || !taxForm.period) {
            toast.error("Lütfen tüm alanları doldurunuz");
            return;
        }

        // Demo ödeme işlemi
        toast.success("Ödeme başarıyla tamamlandı!");
        setTaxForm({ tcNo: "", ada: "", parsel: "", period: "" });
    };

    const handleDebtQuery = async () => {
        if (debtQuery.searchBy === "tcNo" && !debtQuery.tcNo) {
            toast.error("T.C. Kimlik No giriniz");
            return;
        }
        if (debtQuery.searchBy === "ada" && (!debtQuery.ada || !debtQuery.parsel)) {
            toast.error("Ada ve Parsel No giriniz");
            return;
        }

        // Demo borç sorgulama
        const demoDebt = {
            tcNo: debtQuery.tcNo || "12345678901",
            ada: debtQuery.ada || "123",
            parsel: debtQuery.parsel || "45",
            emlakVergisi: { "2024": 1250.00, "2023": 1200.00 },
            temizlikVergisi: { "2024": 180.00 },
            toplam: 2630.00
        };

        setDebtResult(demoDebt);
        toast.success("Borç sorgulama tamamlandı");
    };

    const handlePermitApplication = async () => {
        if (!permitForm.tcNo || !permitForm.adSoyad || !permitForm.telefon || !permitForm.email) {
            toast.error("Lütfen zorunlu alanları doldurunuz");
            return;
        }

        // Demo ruhsat başvurusu
        const basvuruNo = `RBS-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        setPermitResult(basvuruNo);
        toast.success("Ruhsat başvurunuz alınmıştır");
        setPermitForm({
            tcNo: "",
            adSoyad: "",
            telefon: "",
            email: "",
            adres: "",
            ada: "",
            parsel: "",
            aciklama: ""
        });
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <section className="bg-primary text-primary-foreground py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            {tr.eBelediye.title}
                        </h1>
                        <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
                            Online belediye işlemlerinizi kolayca gerçekleştirin
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Tabs defaultValue="taxPayment" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="taxPayment" className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                {tr.eBelediye.tabs.taxPayment}
                            </TabsTrigger>
                            <TabsTrigger value="debtQuery" className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                {tr.eBelediye.tabs.debtQuery}
                            </TabsTrigger>
                            <TabsTrigger value="permitApplication" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                {tr.eBelediye.tabs.permitApplication}
                            </TabsTrigger>
                        </TabsList>

                        {/* Vergi Ödeme */}
                        <TabsContent value="taxPayment" className="mt-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        {tr.eBelediye.taxPayment.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="tcNo">{tr.eBelediye.taxPayment.tcNo}</Label>
                                            <Input
                                                id="tcNo"
                                                value={taxForm.tcNo}
                                                onChange={(e) => setTaxForm({ ...taxForm, tcNo: e.target.value })}
                                                placeholder="12345678901"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="period">{tr.eBelediye.taxPayment.period}</Label>
                                            <Select value={taxForm.period} onValueChange={(value) => setTaxForm({ ...taxForm, period: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Dönem seçiniz" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="2024">2024</SelectItem>
                                                    <SelectItem value="2023">2023</SelectItem>
                                                    <SelectItem value="2022">2022</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ada">{tr.eBelediye.taxPayment.ada}</Label>
                                            <Input
                                                id="ada"
                                                value={taxForm.ada}
                                                onChange={(e) => setTaxForm({ ...taxForm, ada: e.target.value })}
                                                placeholder="123"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="parsel">{tr.eBelediye.taxPayment.parsel}</Label>
                                            <Input
                                                id="parsel"
                                                value={taxForm.parsel}
                                                onChange={(e) => setTaxForm({ ...taxForm, parsel: e.target.value })}
                                                placeholder="45"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-2">Tahmini Tutar:</p>
                                        <p className="text-2xl font-bold text-primary">1.250,00 TL</p>
                                    </div>

                                    <Button onClick={handleTaxPayment} className="w-full">
                                        {tr.eBelediye.taxPayment.pay}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Borç Sorgu */}
                        <TabsContent value="debtQuery" className="mt-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Search className="h-5 w-5" />
                                        {tr.eBelediye.debtQuery.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>{tr.eBelediye.debtQuery.searchBy}</Label>
                                        <Select value={debtQuery.searchBy} onValueChange={(value) => setDebtQuery({ ...debtQuery, searchBy: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="tcNo">T.C. Kimlik No</SelectItem>
                                                <SelectItem value="ada">Ada/Parsel No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {debtQuery.searchBy === "tcNo" ? (
                                        <div className="space-y-2">
                                            <Label htmlFor="debtTcNo">{tr.eBelediye.debtQuery.tcNo}</Label>
                                            <Input
                                                id="debtTcNo"
                                                value={debtQuery.tcNo}
                                                onChange={(e) => setDebtQuery({ ...debtQuery, tcNo: e.target.value })}
                                                placeholder="12345678901"
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="debtAda">{tr.eBelediye.debtQuery.ada}</Label>
                                                <Input
                                                    id="debtAda"
                                                    value={debtQuery.ada}
                                                    onChange={(e) => setDebtQuery({ ...debtQuery, ada: e.target.value })}
                                                    placeholder="123"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="debtParsel">{tr.eBelediye.debtQuery.parsel}</Label>
                                                <Input
                                                    id="debtParsel"
                                                    value={debtQuery.parsel}
                                                    onChange={(e) => setDebtQuery({ ...debtQuery, parsel: e.target.value })}
                                                    placeholder="45"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <Button onClick={handleDebtQuery} className="w-full">
                                        {tr.eBelediye.debtQuery.search}
                                    </Button>

                                    {debtResult && (
                                        <Card className="bg-green-50 border-green-200">
                                            <CardContent className="pt-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                    <h3 className="font-semibold text-green-800">Borç Bilgileri</h3>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span>Emlak Vergisi (2024):</span>
                                                        <span className="font-semibold">{debtResult.emlakVergisi["2024"]} TL</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Temizlik Vergisi (2024):</span>
                                                        <span className="font-semibold">{debtResult.temizlikVergisi["2024"]} TL</span>
                                                    </div>
                                                    <hr />
                                                    <div className="flex justify-between text-lg font-bold">
                                                        <span>Toplam Borç:</span>
                                                        <span className="text-primary">{debtResult.toplam} TL</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Ruhsat Başvurusu */}
                        <TabsContent value="permitApplication" className="mt-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        {tr.eBelediye.permitApplication.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">{tr.eBelediye.permitApplication.applicantInfo}</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="permitTcNo">{tr.eBelediye.permitApplication.tcNo} *</Label>
                                                <Input
                                                    id="permitTcNo"
                                                    value={permitForm.tcNo}
                                                    onChange={(e) => setPermitForm({ ...permitForm, tcNo: e.target.value })}
                                                    placeholder="12345678901"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="adSoyad">Ad Soyad *</Label>
                                                <Input
                                                    id="adSoyad"
                                                    value={permitForm.adSoyad}
                                                    onChange={(e) => setPermitForm({ ...permitForm, adSoyad: e.target.value })}
                                                    placeholder="Ahmet Yılmaz"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="telefon">Telefon *</Label>
                                                <Input
                                                    id="telefon"
                                                    value={permitForm.telefon}
                                                    onChange={(e) => setPermitForm({ ...permitForm, telefon: e.target.value })}
                                                    placeholder="0532 123 45 67"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">E-posta *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={permitForm.email}
                                                    onChange={(e) => setPermitForm({ ...permitForm, email: e.target.value })}
                                                    placeholder="ahmet@email.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">{tr.eBelediye.permitApplication.propertyInfo}</h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="adres">Adres</Label>
                                            <Textarea
                                                id="adres"
                                                value={permitForm.adres}
                                                onChange={(e) => setPermitForm({ ...permitForm, adres: e.target.value })}
                                                placeholder="Merkez Mahallesi, Atatürk Caddesi No:15"
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="permitAda">Ada No</Label>
                                                <Input
                                                    id="permitAda"
                                                    value={permitForm.ada}
                                                    onChange={(e) => setPermitForm({ ...permitForm, ada: e.target.value })}
                                                    placeholder="123"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="permitParsel">Parsel No</Label>
                                                <Input
                                                    id="permitParsel"
                                                    value={permitForm.parsel}
                                                    onChange={(e) => setPermitForm({ ...permitForm, parsel: e.target.value })}
                                                    placeholder="45"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">{tr.eBelediye.permitApplication.applicationInfo}</h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="aciklama">Açıklama</Label>
                                            <Textarea
                                                id="aciklama"
                                                value={permitForm.aciklama}
                                                onChange={(e) => setPermitForm({ ...permitForm, aciklama: e.target.value })}
                                                placeholder="Ruhsat başvurusu hakkında detaylı açıklama..."
                                            />
                                        </div>
                                    </div>

                                    <Button onClick={handlePermitApplication} className="w-full">
                                        {tr.eBelediye.permitApplication.submit}
                                    </Button>

                                    {permitResult && (
                                        <Card className="bg-green-50 border-green-200">
                                            <CardContent className="pt-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                    <h3 className="font-semibold text-green-800">Başvuru Alındı</h3>
                                                </div>
                                                <p className="text-green-700">
                                                    {tr.eBelediye.permitApplication.success} <strong>{permitResult}</strong>
                                                </p>
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
