"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Heart, Building2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { tr } from "@/lib/i18n";

export default function RandevuPage() {
    const [appointmentForm, setAppointmentForm] = useState({
        tip: "nikah",
        tcNo: "",
        adSoyad: "",
        telefon: "",
        email: "",
        tarih: "",
        saat: "",
        notlar: ""
    });

    const [appointmentResult, setAppointmentResult] = useState<string>("");

    const handleAppointmentSubmit = async () => {
        if (!appointmentForm.tcNo || !appointmentForm.adSoyad || !appointmentForm.telefon || !appointmentForm.tarih || !appointmentForm.saat) {
            toast.error("Lütfen zorunlu alanları doldurunuz");
            return;
        }

        // Demo randevu alma
        const randevuNo = `RND-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        setAppointmentResult(randevuNo);
        toast.success("Randevunuz alınmıştır");

        setAppointmentForm({
            tip: "nikah",
            tcNo: "",
            adSoyad: "",
            telefon: "",
            email: "",
            tarih: "",
            saat: "",
            notlar: ""
        });
    };

    const getAvailableHours = (tip: string) => {
        const hours = {
            nikah: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
            baskan: ["09:00", "10:30", "14:00", "15:30"],
            vezne: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"]
        };
        return hours[tip as keyof typeof hours] || [];
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <section className="bg-primary text-primary-foreground py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            {tr.appointment.title}
                        </h1>
                        <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
                            Online randevu sistemi ile kolayca randevu alın
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Tabs defaultValue="nikah" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="nikah" className="flex items-center gap-2">
                                <Heart className="h-4 w-4" />
                                {tr.appointment.tabs.marriage}
                            </TabsTrigger>
                            <TabsTrigger value="baskan" className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                {tr.appointment.tabs.mayor}
                            </TabsTrigger>
                            <TabsTrigger value="vezne" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {tr.appointment.tabs.cashier}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="nikah" className="mt-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Heart className="h-5 w-5" />
                                        Nikah Randevusu
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">{tr.appointment.form.personalInfo}</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="tcNo">{tr.form.tcNo} *</Label>
                                                <Input
                                                    id="tcNo"
                                                    value={appointmentForm.tcNo}
                                                    onChange={(e) => setAppointmentForm({ ...appointmentForm, tcNo: e.target.value })}
                                                    placeholder="12345678901"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="adSoyad">Ad Soyad *</Label>
                                                <Input
                                                    id="adSoyad"
                                                    value={appointmentForm.adSoyad}
                                                    onChange={(e) => setAppointmentForm({ ...appointmentForm, adSoyad: e.target.value })}
                                                    placeholder="Ahmet Yılmaz"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="telefon">{tr.form.phone} *</Label>
                                                <Input
                                                    id="telefon"
                                                    value={appointmentForm.telefon}
                                                    onChange={(e) => setAppointmentForm({ ...appointmentForm, telefon: e.target.value })}
                                                    placeholder="0532 123 45 67"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">{tr.form.email}</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={appointmentForm.email}
                                                    onChange={(e) => setAppointmentForm({ ...appointmentForm, email: e.target.value })}
                                                    placeholder="ahmet@email.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">{tr.appointment.form.appointmentInfo}</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="tarih">{tr.appointment.form.date} *</Label>
                                                <Input
                                                    id="tarih"
                                                    type="date"
                                                    value={appointmentForm.tarih}
                                                    onChange={(e) => setAppointmentForm({ ...appointmentForm, tarih: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="saat">{tr.appointment.form.time} *</Label>
                                                <Select value={appointmentForm.saat} onValueChange={(value) => setAppointmentForm({ ...appointmentForm, saat: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Saat seçiniz" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getAvailableHours("nikah").map((hour) => (
                                                            <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="notlar">{tr.appointment.form.notes}</Label>
                                            <Textarea
                                                id="notlar"
                                                value={appointmentForm.notlar}
                                                onChange={(e) => setAppointmentForm({ ...appointmentForm, notlar: e.target.value })}
                                                placeholder="Özel istekler veya notlar..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    <Button onClick={handleAppointmentSubmit} className="w-full">
                                        {tr.appointment.form.book}
                                    </Button>

                                    {appointmentResult && (
                                        <Card className="bg-green-50 border-green-200">
                                            <CardContent className="pt-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                    <h3 className="font-semibold text-green-800">Randevu Alındı</h3>
                                                </div>
                                                <p className="text-green-700">
                                                    {tr.appointment.form.success} <strong>{appointmentResult}</strong>
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="baskan" className="mt-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Başkanla Görüşme Randevusu
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">{tr.appointment.form.personalInfo}</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="tcNo2">{tr.form.tcNo} *</Label>
                                                <Input
                                                    id="tcNo2"
                                                    value={appointmentForm.tcNo}
                                                    onChange={(e) => setAppointmentForm({ ...appointmentForm, tcNo: e.target.value })}
                                                    placeholder="12345678901"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="adSoyad2">Ad Soyad *</Label>
                                                <Input
                                                    id="adSoyad2"
                                                    value={appointmentForm.adSoyad}
                                                    onChange={(e) => setAppointmentForm({ ...appointmentForm, adSoyad: e.target.value })}
                                                    placeholder="Ahmet Yılmaz"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="telefon2">{tr.form.phone} *</Label>
                                                <Input
                                                    id="telefon2"
                                                    value={appointmentForm.telefon}
                                                    onChange={(e) => setAppointmentForm({ ...appointmentForm, telefon: e.target.value })}
                                                    placeholder="0532 123 45 67"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email2">{tr.form.email}</Label>
                                                <Input
                                                    id="email2"
                                                    type="email"
                                                    value={appointmentForm.email}
                                                    onChange={(e) => setAppointmentForm({ ...appointmentForm, email: e.target.value })}
                                                    placeholder="ahmet@email.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">{tr.appointment.form.appointmentInfo}</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="tarih2">{tr.appointment.form.date} *</Label>
                                                <Input
                                                    id="tarih2"
                                                    type="date"
                                                    value={appointmentForm.tarih}
                                                    onChange={(e) => setAppointmentForm({ ...appointmentForm, tarih: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="saat2">{tr.appointment.form.time} *</Label>
                                                <Select value={appointmentForm.saat} onValueChange={(value) => setAppointmentForm({ ...appointmentForm, saat: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Saat seçiniz" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getAvailableHours("baskan").map((hour) => (
                                                            <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="notlar2">{tr.appointment.form.notes}</Label>
                                            <Textarea
                                                id="notlar2"
                                                value={appointmentForm.notlar}
                                                onChange={(e) => setAppointmentForm({ ...appointmentForm, notlar: e.target.value })}
                                                placeholder="Görüşme konusu hakkında detay..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    <Button onClick={handleAppointmentSubmit} className="w-full">
                                        {tr.appointment.form.book}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="vezne" className="mt-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Vezne/Sıra Alma
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">{tr.appointment.form.personalInfo}</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="tcNo3">{tr.form.tcNo} *</Label>
                                                <Input
                                                    id="tcNo3"
                                                    value={appointmentForm.tcNo}
                                                    onChange={(e) => setAppointmentForm({ ...appointmentForm, tcNo: e.target.value })}
                                                    placeholder="12345678901"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="adSoyad3">Ad Soyad *</Label>
                                                <Input
                                                    id="adSoyad3"
                                                    value={appointmentForm.adSoyad}
                                                    onChange={(e) => setAppointmentForm({ ...appointmentForm, adSoyad: e.target.value })}
                                                    placeholder="Ahmet Yılmaz"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="telefon3">{tr.form.phone} *</Label>
                                                <Input
                                                    id="telefon3"
                                                    value={appointmentForm.telefon}
                                                    onChange={(e) => setAppointmentForm({ ...appointmentForm, telefon: e.target.value })}
                                                    placeholder="0532 123 45 67"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email3">{tr.form.email}</Label>
                                                <Input
                                                    id="email3"
                                                    type="email"
                                                    value={appointmentForm.email}
                                                    onChange={(e) => setAppointmentForm({ ...appointmentForm, email: e.target.value })}
                                                    placeholder="ahmet@email.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">{tr.appointment.form.appointmentInfo}</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="tarih3">{tr.appointment.form.date} *</Label>
                                                <Input
                                                    id="tarih3"
                                                    type="date"
                                                    value={appointmentForm.tarih}
                                                    onChange={(e) => setAppointmentForm({ ...appointmentForm, tarih: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="saat3">{tr.appointment.form.time} *</Label>
                                                <Select value={appointmentForm.saat} onValueChange={(value) => setAppointmentForm({ ...appointmentForm, saat: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Saat seçiniz" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getAvailableHours("vezne").map((hour) => (
                                                            <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="notlar3">{tr.appointment.form.notes}</Label>
                                            <Textarea
                                                id="notlar3"
                                                value={appointmentForm.notlar}
                                                onChange={(e) => setAppointmentForm({ ...appointmentForm, notlar: e.target.value })}
                                                placeholder="Yapmak istediğiniz işlem hakkında bilgi..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    <Button onClick={handleAppointmentSubmit} className="w-full">
                                        {tr.appointment.form.book}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </div>
    );
}

