"use client";

import React, { useEffect, useMemo, useState } from "react";
import ExportMenu from "@/components/ExportMenu";
import Link from "next/link";

/* ------------------------------- Küçük UI parçaları ------------------------------ */
const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <section id={id} className="scroll-mt-28">
        <h2 className="mb-3 text-2xl font-semibold">{title}</h2>
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">{children}</div>
    </section>
);

const Badge = ({
    children,
    tone = "neutral",
}: {
    children: React.ReactNode;
    tone?: "neutral" | "success" | "warning" | "info" | "danger";
}) => {
    const map = {
        neutral: "bg-gray-100 text-gray-800",
        success: "bg-emerald-100 text-emerald-800",
        warning: "bg-amber-100 text-amber-900",
        info: "bg-blue-100 text-blue-800",
        danger: "bg-red-100 text-red-800",
    } as const;
    return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${map[tone]}`}>{children}</span>;
};

const Callout = ({
    title,
    children,
    tone = "info",
}: {
    title: string;
    children: React.ReactNode;
    tone?: "info" | "success" | "warning" | "danger";
}) => {
    const map = {
        info: "border-blue-200 bg-blue-50",
        success: "border-emerald-200 bg-emerald-50",
        warning: "border-amber-200 bg-amber-50",
        danger: "border-red-200 bg-red-50",
    } as const;
    return (
        <div className={`rounded-xl border p-4 text-sm ${map[tone]}`}>
            <p className="mb-1 font-semibold">{title}</p>
            <div className="text-gray-700">{children}</div>
        </div>
    );
};

/* -------------------------------------- Tipler ------------------------------------- */
type KursKategori = "dil" | "bilişim" | "tasarım" | "el-sanat" | "müzik" | "mutfak";
type Seviye = "başlangıç" | "orta" | "ileri";
type Gun = "Pzt" | "Sal" | "Çar" | "Per" | "Cum" | "Cmt" | "Paz";

type Kurs = {
    id: string;
    ad: string;
    kategori: KursKategori;
    seviye: Seviye;
    gunler: Gun[];
    saat: string;           // "18:30-21:30"
    kontenjan: number;
    konum: string;
    aciklama: string;
    sartlar: string[];      // ön koşul/yanında getirilmesi gerekenler
    resim?: string;
};

type BasvuruDurum = "Alındı" | "Değerlendirme" | "Kesin Kayıt" | "Yedek";
type KursBasvuru = {
    id: string;
    basvuruNo: string;
    tarihISO: string;
    kursId: string;
    adSoyad: string;
    dogumYili?: number;
    iletisim: string;       // e-posta/telefon
    adres?: string;
    not?: string;
    kvkkOnay: boolean;
    durum: BasvuruDurum;
};

type YedekKayit = {
    id: string;
    tarihISO: string;
    kursId: string;
    adSoyad: string;
    iletisim: string;
    not?: string;
};

type SinavTip = "dil" | "bilişim";
type SinavRandevuDurum = "Randevu Alındı" | "Tamamlandı";
type SinavRandevu = {
    id: string;
    randevuNo: string;
    tarihISO: string;
    tip: SinavTip;
    tarih: string; // YYYY-MM-DD
    saat: string;  // HH:mm
    adSoyad: string;
    iletisim: string;
    not?: string;
    durum: SinavRandevuDurum;
};

/* ----------------------------------- Demo veriler ---------------------------------- */
const KURSLAR: Kurs[] = [
    {
        id: "k1",
        ad: "Temel İngilizce A1",
        kategori: "dil",
        seviye: "başlangıç",
        gunler: ["Sal", "Per"],
        saat: "18:30-21:30",
        kontenjan: 24,
        konum: "Kültür Merkezi – Sınıf 3",
        aciklama: "Günlük konuşma, temel dil bilgisi ve kelime hazinesi. Yerleştirme sınavı gerekmez.",
        sartlar: ["18 yaş üstü", "E-posta/telefon iletişim"],
        resim: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1600&auto=format&fit=crop",
    },
    {
        id: "k2",
        ad: "Excel ile Veri Analizi",
        kategori: "bilişim",
        seviye: "orta",
        gunler: ["Pzt", "Çar"],
        saat: "19:00-21:30",
        kontenjan: 20,
        konum: "Bilgi Evi – Lab 1",
        aciklama: "Formüller, tablo özetleri, grafik ve temel veri temizleme.",
        sartlar: ["Temel bilgisayar bilgisi", "USB bellek (ops.)"],
        resim: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop",
    },
    {
        id: "k3",
        ad: "Photoshop ile Afiş Tasarımı",
        kategori: "tasarım",
        seviye: "başlangıç",
        gunler: ["Cum"],
        saat: "14:00-17:00",
        kontenjan: 16,
        konum: "Kültür Merkezi – Tasarım Atölyesi",
        aciklama: "Katmanlar, maske, tipografi ve baskıya hazırlık.",
        sartlar: ["Bilgisayar kullanımına aşinalık"],
        resim: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop",
    },
    {
        id: "k4",
        ad: "Seramik Temelleri",
        kategori: "el-sanat",
        seviye: "başlangıç",
        gunler: ["Cmt"],
        saat: "10:00-13:00",
        kontenjan: 12,
        konum: "Sanat Atölyesi – Seramik",
        aciklama: "Çamur hazırlama, şekillendirme, sır ve fırın süreçleri.",
        sartlar: ["Önlük ve rahat kıyafet"],
        resim: "https://images.unsplash.com/photo-1529694157871-45c537c2b8e7?q=80&w=1600&auto=format&fit=crop",
    },
    {
        id: "k5",
        ad: "Gitar Atölyesi",
        kategori: "müzik",
        seviye: "başlangıç",
        gunler: ["Paz"],
        saat: "12:00-14:00",
        kontenjan: 15,
        konum: "Müzik Atölyesi",
        aciklama: "Akort, temel akorlar ve ritim. Kendi gitarını getirmek tercih edilir.",
        sartlar: ["En az 12 yaş", "Gitar (varsa)"],
        resim: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1600&auto=format&fit=crop",
    },
    {
        id: "k6",
        ad: "Pastacılık – Temel",
        kategori: "mutfak",
        seviye: "başlangıç",
        gunler: ["Çar"],
        saat: "10:00-13:00",
        kontenjan: 10,
        konum: "Uygulama Mutfağı",
        aciklama: "Hamur teknikleri, krema ve süsleme.",
        sartlar: ["Sağlık karnesi (uygulama mutfağı kuralları)"],
        resim: "https://images.unsplash.com/photo-1551024709-8f23befc6cf7?q=80&w=1600&auto=format&fit=crop",
    },
];

/* ------------------------------------ Utils / LS ----------------------------------- */
const yil = new Date().getFullYear();

const LS_APPS = "meslek-kurs-basvurular";
const LS_WAIT = "meslek-kurs-yedek";
const LS_TEST = "meslek-yerlestirme";

const loadLS = <T,>(k: string, def: T): T => { try { const s = localStorage.getItem(k); return s ? (JSON.parse(s) as T) : def; } catch { return def; } };
const saveLS = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };
const downloadJSON = (name: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
};

/* ---------------------------------------- Sayfa ------------------------------------- */
export default function MeslekSanatEgitimleriPage() {
    /* kayıt listeleri */
    const [basvurular, setBasvurular] = useState<KursBasvuru[]>([]);
    const [yedekler, setYedekler] = useState<YedekKayit[]>([]);
    const [randevular, setRandevular] = useState<SinavRandevu[]>([]);
    useEffect(() => {
        setBasvurular(loadLS<KursBasvuru[]>(LS_APPS, []));
        setYedekler(loadLS<YedekKayit[]>(LS_WAIT, []));
        setRandevular(loadLS<SinavRandevu[]>(LS_TEST, []));
    }, []);

    /* katalog filtreleri */
    const [q, setQ] = useState("");
    const [kat, setKat] = useState<"hepsi" | KursKategori>("hepsi");
    const [gun, setGun] = useState<"hepsi" | Gun>("hepsi");
    const [sev, setSev] = useState<"hepsi" | Seviye>("hepsi");

    const katalog = useMemo(() => {
        return KURSLAR.filter(k =>
            (kat === "hepsi" ? true : k.kategori === kat) &&
            (gun === "hepsi" ? true : k.gunler.includes(gun)) &&
            (sev === "hepsi" ? true : k.seviye === sev) &&
            (q ? (k.ad + k.aciklama + k.konum).toLowerCase().includes(q.toLowerCase()) : true)
        );
    }, [q, kat, gun, sev]);

    /* başvuru formu */
    const [form, setForm] = useState<Omit<KursBasvuru, "id" | "basvuruNo" | "tarihISO" | "durum">>({
        kursId: "",
        adSoyad: "",
        dogumYili: undefined,
        iletisim: "",
        adres: "",
        not: "",
        kvkkOnay: false,
    });

    const secVeGit = (kursId: string) => {
        setForm((s) => ({ ...s, kursId }));
        setTimeout(() => {
            document.querySelector("#basvuru")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
    };

    const gonderBasvuru = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.kursId) return alert("Bir kurs seçiniz.");
        if (!form.adSoyad || !form.iletisim) return alert("Ad Soyad ve iletişim zorunludur.");
        if (!form.kvkkOnay) return alert("KVKK aydınlatma onayı gerekli.");
        const rec: KursBasvuru = {
            id: crypto.randomUUID(),
            basvuruNo: "KRS-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
            tarihISO: new Date().toISOString(),
            durum: "Alındı",
            ...form,
        };
        const y = [rec, ...basvurular];
        setBasvurular(y); saveLS(LS_APPS, y);
        alert("Başvurunuz alındı. Başvuru No: " + rec.basvuruNo);
        setForm({ kursId: "", adSoyad: "", dogumYili: undefined, iletisim: "", adres: "", not: "", kvkkOnay: false });
    };

    /* yedek listesi */
    const [yedekForm, setYedekForm] = useState<Omit<YedekKayit, "id" | "tarihISO">>({ kursId: "", adSoyad: "", iletisim: "", not: "" });
    const gonderYedek = (e: React.FormEvent) => {
        e.preventDefault();
        if (!yedekForm.kursId || !yedekForm.adSoyad || !yedekForm.iletisim) return alert("Kurs, ad soyad ve iletişim zorunlu.");
        const rec: YedekKayit = { id: crypto.randomUUID(), tarihISO: new Date().toISOString(), ...yedekForm };
        const y = [rec, ...yedekler];
        setYedekler(y); saveLS(LS_WAIT, y);
        alert("Yedek kaydınız alındı.");
        setYedekForm({ kursId: "", adSoyad: "", iletisim: "", not: "" });
    };

    /* yerleştirme sınavı */
    const [sinavForm, setSinavForm] = useState<Omit<SinavRandevu, "id" | "randevuNo" | "tarihISO" | "durum">>({
        tip: "dil",
        tarih: new Date().toISOString().slice(0, 10),
        saat: "15:00",
        adSoyad: "",
        iletisim: "",
        not: "",
    });
    const gonderSinav = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sinavForm.adSoyad || !sinavForm.iletisim) return alert("Ad Soyad ve iletişim zorunlu.");
        const rec: SinavRandevu = {
            id: crypto.randomUUID(),
            randevuNo: "YR-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
            tarihISO: new Date().toISOString(),
            durum: "Randevu Alındı",
            ...sinavForm,
        };
        const y = [rec, ...randevular];
        setRandevular(y); saveLS(LS_TEST, y);
        alert("Randevunuz oluşturuldu. Randevu No: " + rec.randevuNo);
        setSinavForm({ tip: "dil", tarih: new Date().toISOString().slice(0, 10), saat: "15:00", adSoyad: "", iletisim: "", not: "" });
    };

    /* hızlı seviye öz-değerlendirme (öneri üretir) */
    const [check, setCheck] = useState<Record<string, boolean>>({});
    const puan = useMemo(() => Object.values(check).filter(Boolean).length, [check]);
    const onerilenSeviye: Seviye = useMemo(() => (puan <= 2 ? "başlangıç" : puan <= 4 ? "orta" : "ileri"), [puan]);
    const onerilenKurslar = useMemo(() => KURSLAR.filter(k => k.seviye === onerilenSeviye).slice(0, 3), [onerilenSeviye]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Meslek ve Sanat Eğitimleri</h1>
                        <p className="mt-3 text-gray-700">
                            Ücretsiz/uygun maliyetli kurslar, <strong>katalog</strong>, <strong>başvuru</strong>, <strong>yedek liste</strong> ve
                            <strong> yerleştirme sınavı randevusu</strong> bu sayfada. Aşağıdaki mini açıklamalar, sistemlerin nasıl işlediğini özetler.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="info">Online Başvuru</Badge>
                            <Badge tone="success">{yil} Dönemi</Badge>
                            <Badge tone="warning">Yerleştirme (ops.)</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* kısa vaat şeridi */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"><span>🧑‍🏫</span><div><div className="text-lg font-semibold leading-none">100+ saat</div><div className="text-sm text-gray-600">Uygulamalı eğitim</div></div></div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"><span>💼</span><div><div className="text-lg font-semibold leading-none">CV desteği</div><div className="text-sm text-gray-600">Portfolyo & yönlendirme</div></div></div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"><span>✅</span><div><div className="text-lg font-semibold leading-none">Katılım belgesi</div><div className="text-sm text-gray-600">Başarıyla tamamlayanlara</div></div></div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["katalog", "Kurs Kataloğu"],
                            ["basvuru", "Online Başvuru"],
                            ["yedek", "Yedek Liste Kaydı"],
                            ["sinav", "Yerleştirme Sınavı Randevusu"],
                            ["profil", "Hızlı Seviye Öz-Değerlendirme"],
                            ["kayitlar", "Kayıtlar / JSON"],
                            ["sss", "A’dan Z’ye SSS"],
                            ["iletisim", "İletişim"],
                        ].map(([id, label]) => (
                            <li key={id}>
                                <a href={`#${id}`} className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* içerik */}
                <main className="space-y-10">
                    {/* KATALOG */}
                    <Section id="katalog" title="Kurs Kataloğu ve Filtreler">
                        <div className="rounded-xl border bg-white p-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <input className="rounded-lg border px-3 py-2" placeholder="Ara (kurs adı/konum/konu)" value={q} onChange={(e) => setQ(e.target.value)} />
                                <select className="rounded-lg border px-3 py-2" value={kat} onChange={(e) => setKat(e.target.value as any)}>
                                    <option value="hepsi">Kategori (hepsi)</option>
                                    <option value="dil">Dil</option><option value="bilişim">Bilişim</option><option value="tasarım">Tasarım</option>
                                    <option value="el-sanat">El Sanatları</option><option value="müzik">Müzik</option><option value="mutfak">Mutfak</option>
                                </select>
                                <select className="rounded-lg border px-3 py-2" value={sev} onChange={(e) => setSev(e.target.value as any)}>
                                    <option value="hepsi">Seviye (hepsi)</option>
                                    <option value="başlangıç">Başlangıç</option><option value="orta">Orta</option><option value="ileri">İleri</option>
                                </select>
                                <select className="rounded-lg border px-3 py-2" value={gun} onChange={(e) => setGun(e.target.value as any)}>
                                    <option value="hepsi">Gün (hepsi)</option>
                                    {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((g) => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            {katalog.length === 0 ? (
                                <p className="mt-3 text-sm text-gray-600">Sonuç bulunamadı.</p>
                            ) : (
                                <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {katalog.map((k) => (
                                        <li key={k.id} className="rounded-xl border bg-white p-3">
                                            <div className="aspect-[4/2] w-full overflow-hidden rounded-lg bg-gray-100">
                                                {k.resim ? <img src={k.resim} alt={k.ad} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-400">Görsel yok</div>}
                                            </div>
                                            <div className="mt-2 flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="font-semibold">{k.ad}</h3>
                                                    <p className="text-sm text-gray-600">{k.konum}</p>
                                                    <p className="text-xs text-gray-500">{k.gunler.join(" • ")} • {k.saat} • Seviye: {k.seviye}</p>
                                                </div>
                                                <button onClick={() => secVeGit(k.id)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:opacity-95">Başvur</button>
                                            </div>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                <Badge tone="neutral">{k.kategori.toUpperCase()}</Badge>
                                                <Badge tone="neutral">Kontenjan {k.kontenjan}</Badge>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-700">{k.aciklama}</p>
                                            {k.sartlar.length > 0 && <p className="mt-1 text-xs text-gray-600"><span className="font-medium">Ön koşullar: </span>{k.sartlar.join(", ")}</p>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <Callout title="Nasıl çalışır? – Katalog" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Gerekli bilgiler:</span> Sadece aradığınız kurs türü; filtreleyip “Başvur”a tıklayın.</li>
                                <li><span className="font-semibold">Ne veriyoruz:</span> Gün–saat, konum, kontenjan ve ön koşulların olduğu net bir kart.</li>
                                <li><span className="font-semibold">İpucu:</span> Kurs seçince başvuru formunda kurs otomatik doluyor.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* BAŞVURU */}
                    <Section id="basvuru" title="Online Kurs Başvurusu">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <form onSubmit={gonderBasvuru} className="rounded-xl border bg-white p-4">
                                <label className="block text-sm text-gray-600">Kurs</label>
                                <select className="mt-1 w-full rounded-lg border px-3 py-2" value={form.kursId} onChange={(e) => setForm((s) => ({ ...s, kursId: e.target.value }))}>
                                    <option value="">Kurs seçin…</option>
                                    {KURSLAR.map((k) => <option key={k.id} value={k.id}>{k.ad} – {k.gunler.join("/")} {k.saat}</option>)}
                                </select>

                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ad Soyad" value={form.adSoyad} onChange={(e) => setForm((s) => ({ ...s, adSoyad: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="İletişim (e-posta/telefon)" value={form.iletisim} onChange={(e) => setForm((s) => ({ ...s, iletisim: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" type="number" min={1900} max={new Date().getFullYear()} placeholder="Doğum Yılı (ops.)" value={form.dogumYili || ""} onChange={(e) => setForm((s) => ({ ...s, dogumYili: parseInt(e.target.value || "0") || undefined }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="Adres (ops.)" value={form.adres || ""} onChange={(e) => setForm((s) => ({ ...s, adres: e.target.value }))} />
                                </div>
                                <label className="mt-2 block text-sm text-gray-600">Not (ops.)</label>
                                <textarea className="min-h-[80px] w-full rounded-lg border px-3 py-2" value={form.not || ""} onChange={(e) => setForm((s) => ({ ...s, not: e.target.value }))} />

                                <label className="mt-2 flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={form.kvkkOnay} onChange={(e) => setForm((s) => ({ ...s, kvkkOnay: e.target.checked }))} />
                                    Kişisel verilerimin başvuru ve iletişim amacıyla işlenmesini kabul ediyorum.
                                </label>

                                <div className="mt-3">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">Başvuruyu Gönder</button>
                                </div>
                            </form>

                            <Callout title="Nasıl çalışır? – Online Başvuru" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-semibold">Gerekli bilgiler:</span> Seçtiğiniz kurs, ad soyad, <span className="font-semibold">e-posta/telefon</span>; doğum yılı/adres opsiyoneldir.</li>
                                    <li><span className="font-semibold">Ne veriyoruz:</span> <em>KRS-XXXXX</em> başvuru numarası ve durum takibi (Alındı → Değerlendirme → Kesin Kayıt/Yedek).</li>
                                    <li><span className="font-semibold">Belgeler:</span> Gerekli ise eğitim günü ibraz edilir; önceden belge yüklenmesi istenmez.</li>
                                    <li><span className="font-semibold">Ücret:</span> Kurslarımız ücretsizdir; yalnızca bazı atölyelerde malzeme bedeli olabilir.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* YEDEK */}
                    <Section id="yedek" title="Yedek Liste Kaydı">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <form onSubmit={gonderYedek} className="rounded-xl border bg-white p-4">
                                <select className="w-full rounded-lg border px-3 py-2" value={yedekForm.kursId} onChange={(e) => setYedekForm((s) => ({ ...s, kursId: e.target.value }))}>
                                    <option value="">Kurs seçin…</option>
                                    {KURSLAR.map((k) => <option key={k.id} value={k.id}>{k.ad}</option>)}
                                </select>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ad Soyad" value={yedekForm.adSoyad} onChange={(e) => setYedekForm((s) => ({ ...s, adSoyad: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="İletişim (e-posta/telefon)" value={yedekForm.iletisim} onChange={(e) => setYedekForm((s) => ({ ...s, iletisim: e.target.value }))} />
                                </div>
                                <label className="mt-2 block text-sm text-gray-600">Not (ops.)</label>
                                <textarea className="min-h-[60px] w-full rounded-lg border px-3 py-2" value={yedekForm.not || ""} onChange={(e) => setYedekForm((s) => ({ ...s, not: e.target.value }))} />
                                <div className="mt-3">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">Yedek Kaydı Oluştur</button>
                                </div>
                            </form>

                            <Callout title="Nasıl çalışır? – Yedek Liste" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-semibold">Gerekli bilgiler:</span> Kurs, ad soyad ve <span className="font-semibold">e-posta/telefon</span>.</li>
                                    <li><span className="font-semibold">Ne veriyoruz:</span> Kontenjan boşaldığında SMS/e-posta ile bilgilendirme. Kayıt sırası, başvuru zamanına göre.</li>
                                    <li><span className="font-semibold">Süre:</span> Dönem boyunca etkin; iptal için iletişime geçmeniz yeterli.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* YERLEŞTİRME SINAVI */}
                    <Section id="sinav" title="Yerleştirme Sınavı Randevusu (Dil/Bilişim)">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <form onSubmit={gonderSinav} className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <select className="rounded-lg border px-3 py-2" value={sinavForm.tip} onChange={(e) => setSinavForm((s) => ({ ...s, tip: e.target.value as SinavTip }))}>
                                        <option value="dil">Dil (İngilizce)</option>
                                        <option value="bilişim">Bilişim (Excel/Ofis)</option>
                                    </select>
                                    <input className="rounded-lg border px-3 py-2" type="date" value={sinavForm.tarih} onChange={(e) => setSinavForm((s) => ({ ...s, tarih: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" type="time" value={sinavForm.saat} onChange={(e) => setSinavForm((s) => ({ ...s, saat: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ad Soyad" value={sinavForm.adSoyad} onChange={(e) => setSinavForm((s) => ({ ...s, adSoyad: e.target.value }))} />
                                </div>
                                <input className="mt-2 w-full rounded-lg border px-3 py-2" placeholder="İletişim (e-posta/telefon)" value={sinavForm.iletisim} onChange={(e) => setSinavForm((s) => ({ ...s, iletisim: e.target.value }))} />
                                <label className="mt-2 block text-sm text-gray-600">Not (ops.)</label>
                                <textarea className="min-h-[60px] w-full rounded-lg border px-3 py-2" value={sinavForm.not || ""} onChange={(e) => setSinavForm((s) => ({ ...s, not: e.target.value }))} />
                                <div className="mt-3">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">Randevu Al</button>
                                </div>
                            </form>

                            <Callout title="Nasıl çalışır? – Yerleştirme" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-semibold">Gerekli bilgiler:</span> Sınav tipi, tarih-saat, ad soyad ve <span className="font-semibold">e-posta/telefon</span>.</li>
                                    <li><span className="font-semibold">Ne veriyoruz:</span> <em>YR-XXXXX</em> randevu numarası; sınav sonrası önerilen seviye sistemde görünür (demo dışı).</li>
                                    <li><span className="font-semibold">Amaç:</span> Doğru seviyeye yerleşim ve kontenjanın verimli kullanımı.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* PROFİL */}
                    <Section id="profil" title="Hızlı Seviye Öz-Değerlendirme (2 dk)">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Kendinizi işaretleyin</h3>
                                <ul className="space-y-2 text-sm">
                                    {[
                                        "Temel bilgisayar kullanımını biliyorum (dosya, tarayıcı)",
                                        "Excel’de basit formül yazdım",
                                        "Bir tasarım programı açıp temel düzenleme yaptım",
                                        "Yabancı dilde kısa bir diyalog kurabiliyorum",
                                        "Atölye ortamında el aleti kullanmışlığım var",
                                    ].map((k) => (
                                        <li key={k} className="flex items-center gap-2">
                                            <input type="checkbox" checked={!!check[k]} onChange={(e) => setCheck((s) => ({ ...s, [k]: e.target.checked }))} />
                                            <span>{k}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
                                    Puan: <span className="font-semibold">{puan}</span> • Önerilen seviye: <span className="font-semibold capitalize">{onerilenSeviye}</span>
                                </div>
                            </div>
                            <Callout title="Önerilen Kurslar" tone="success">
                                {onerilenKurslar.length === 0 ? (
                                    <p className="text-sm text-gray-700">Öneri bulunamadı.</p>
                                ) : (
                                    <ul className="list-disc pl-5 text-sm">
                                        {onerilenKurslar.map((k) => (
                                            <li key={k.id} className="mb-1">
                                                <span className="font-medium">{k.ad}</span> – {k.gunler.join("/")} {k.saat} • <button onClick={() => secVeGit(k.id)} className="text-emerald-700 underline">Başvur</button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <p className="mt-2 text-xs text-gray-600">Not: Bu alan sadece size öneri verir; kesin seviye, eğitmen görüşü/yerleştirme ile belirlenir.</p>
                            </Callout>
                        </div>
                    </Section>

                    {/* KAYITLAR / JSON */}
                    <Section id="kayitlar" title="Kayıtlar / JSON">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold">Başvurular</h3>
                                    <ExportMenu 
                    data={basvurular} 
                    filename="kurs-basvurular.json"
                    resourceId="meslek_sanat_egitimleri"
                  />
                                </div>
                                {basvurular.length === 0 ? <p className="text-sm text-gray-600">Kayıt yok.</p> : (
                                    <ul className="space-y-2 text-sm">
                                        {basvurular.slice(0, 6).map((r) => (
                                            <li key={r.id} className="rounded-lg border p-2">
                                                {r.basvuruNo} • {KURSLAR.find(k => k.id === r.kursId)?.ad || "Kurs"} • {r.adSoyad}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold">Yedek Liste</h3>
                                    <ExportMenu 
                    data={yedekler} 
                    filename="kurs-yedek.json"
                    resourceId="meslek_sanat_egitimleri"
                  />
                                </div>
                                {yedekler.length === 0 ? <p className="text-sm text-gray-600">Kayıt yok.</p> : (
                                    <ul className="space-y-2 text-sm">
                                        {yedekler.slice(0, 6).map((r) => (
                                            <li key={r.id} className="rounded-lg border p-2">
                                                {KURSLAR.find(k => k.id === r.kursId)?.ad || "Kurs"} • {r.adSoyad}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold">Yerleştirme Randevuları</h3>
                                    <ExportMenu 
                    data={randevular} 
                    filename="yerlestirme-randevu.json"
                    resourceId="meslek_sanat_egitimleri"
                  />
                                </div>
                                {randevular.length === 0 ? <p className="text-sm text-gray-600">Kayıt yok.</p> : (
                                    <ul className="space-y-2 text-sm">
                                        {randevular.slice(0, 6).map((r) => (
                                            <li key={r.id} className="rounded-lg border p-2">
                                                {r.randevuNo} • {r.tip.toUpperCase()} • {r.tarih} {r.saat}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </Section>

                    {/* SSS */}
                    <Section id="sss" title="A’dan Z’ye Sık Sorulan Sorular">
                        {[
                            ["Kurslar ücretli mi?", "Belediye kurslarımız ücretsizdir. Malzeme gerektiren uygulamalarda (seramik, pastacılık gibi) tüketilen malzeme için cüz’i bedel olabilir."],
                            ["Yaş sınırı var mı?", "Genel olarak 15+; bazı atölyelerde (ör. mutfak) 18+ gerekebilir. Kurs kartında belirtilir."],
                            ["Derslere geç katılırsam sorun olur mu?", "Devam zorunludur; 1/3’ten fazla devamsızlık belgelendirmeyi etkiler."],
                            ["Belge veriliyor mu?", "Dönemi başarıyla tamamlayanlara katılım/başarı belgesi verilir."],
                            ["Aynı anda iki kursa başvurabilir miyim?", "Evet; ancak çakışan saatler için yalnızca biri kesin kayda döner."],
                            ["Eğitmen kimler?", "Alanında deneyimli belediye eğitmenleri ve paydaş kurum uzmanları."],
                            ["Seviyemi bilmiyorum, ne yapmalıyım?", "Yerleştirme sınavı randevusu alın veya ‘Hızlı Öz-Değerlendirme’yi kullanın."],
                            ["Online mi yüz yüze mi?", "Çoğu yüz yüze; dönemsel olarak bazı teorik dersler çevrim içi olabilir."],
                            ["Engelli bireyler katılabilir mi?", "Evet. Erişilebilirlik için ihtiyaçlarınızı başvuru notuna yazabilirsiniz."],
                            ["Kursu iptal etmek istiyorum.", "E-posta veya çağrı merkezi üzerinden iptal edebilirsiniz; yedek listeye sıra hızlı geçsin."],
                            ["Kontenjan doldu, ne yapayım?", "Yedek liste kaydı açın. Boşluk olursa size dönüş yapılır."],
                            ["Gitarım yok, katılabilir miyim?", "Sınırlı sayıda enstrüman mevcut; kendi enstrümanınızı getirmeniz tercih edilir."],
                            ["Mutfak kursunda hijyen kuralları?", "Önlük/başlık, uzun saç için bone, açık ayakkabı yok; sağlık karnesi gerekli olabilir."],
                            ["Ders materyali paylaşılıyor mu?", "Evet, PDF ve örnek dosyalar ders portalında paylaşılır (demo dışında)."],
                            ["Kayıt sırasında kimlik fotokopisi gerekiyor mu?", "Başvuruda değil; kesin kayıt aşamasında kimlik gösterimi yeterlidir."],
                            ["Ders saatleri değişir mi?", "Zorunlu hallerde güncelleme yapılabilir; SMS/e-posta ile bilgilendirme yapılır."],
                            ["Kayıtlarımı silebilir miyim?", "Evet. Talebiniz üzerine sistemdeki bilgileriniz silinir/anonimleştirilir."],
                            ["Kursa gelmedim, tekrar başvurabilir miyim?", "Evet; ancak yoğun talepte öncelik daha önce devamlılık gösterenlere verilebilir."],
                            ["Park yeri var mı?", "Merkez çevresinde sınırlı; toplu taşıma önerilir."],
                            ["Çocuklar için kurs var mı?", "Dönemsel atölyeler açıyoruz; duyuruları takip edin."],
                            ["Derslere misafir gelebilir mi?", "Sadece tanıtım derslerinde; normal derslerde güvenlik nedeniyle hayır."],
                            ["Kayıt olurken T.C. kimlik no istiyor musunuz?", "Başvuruda istemiyoruz; kesin kayıt/katılım belgesi düzenlemede kontrol edilir."],
                        ].map(([q, a], i) => (
                            <details key={i} className="group py-3">
                                <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-emerald-400">
                                    <span className="font-medium">{q}</span>
                                </summary>
                                <div className="prose prose-sm max-w-none py-2 text-gray-700">{a}</div>
                            </details>
                        ))}
                    </Section>

                    {/* İLETİŞİM */}
                    <Section id="iletisim" title="İletişim">
                        <p><span className="font-semibold">Kültür ve Sosyal İşler – Eğitim Birimi</span></p>
                        <p>Çağrı Merkezi: 444 0 XXX • Alo 153</p>
                        <p>E-posta: <a className="text-emerald-700 underline" href="mailto:egitim@birimajans.bel.tr">egitim@birimajans.bel.tr</a></p>
                        <p>Adres: Kültür Merkezi, [adres]</p>
                        <div className="mt-3 flex gap-2">
                            <a href="#katalog" className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95">Kataloğu Gör</a>
                            <a href="#basvuru" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95">Hemen Başvur</a>
                            <a href="#sinav" className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:opacity-95">Yerleştirme Randevusu</a>
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
}
