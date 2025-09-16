"use client";

import React, { useEffect, useMemo, useState } from "react";
import ExportMenu from "@/components/ExportMenu";
import Link from "next/link";

/* --------------------------------- UI küçükleri -------------------------------- */
const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <section id={id} className="scroll-mt-28">
        <h2 className="mb-3 text-2xl font-semibold">{title}</h2>
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">{children}</div>
    </section>
);

const Badge = ({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "info" | "danger" }) => {
    const map = {
        neutral: "bg-gray-100 text-gray-800",
        success: "bg-emerald-100 text-emerald-800",
        warning: "bg-amber-100 text-amber-900",
        info: "bg-blue-100 text-blue-800",
        danger: "bg-red-100 text-red-800",
    } as const;
    return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${map[tone]}`}>{children}</span>;
};

const Callout = ({ title, children, tone = "info" }: { title: string; children: React.ReactNode; tone?: "info" | "success" | "warning" | "danger" }) => {
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

/* ------------------------------------ Tipler ----------------------------------- */
type Coords = { lat: number; lng: number };
type TesisTipi = "fitness" | "havuz" | "saha" | "kurs";
type Gun = "Pzt" | "Sal" | "Çar" | "Per" | "Cum" | "Cmt" | "Paz";

type Tesis = {
    id: string;
    ad: string;
    tip: TesisTipi;
    coords: Coords;
    adres: string;
    telefon?: string;
    gunler: Gun[];
    saat: string; // "07:00-22:00"
    haftaSonuSaat?: string; // "08:00-20:00"
    ozellikler: string[]; // pilates, basketbol, yüzme vb.
    ucret?: {
        uyelikAylik?: number; // TL
        sahaSaat?: number; // TL
        havuzSeans?: number; // TL
    };
};

type UyelikBasvuru = {
    id: string;
    basvuruNo: string;
    tarihISO: string;
    tesisId: string;
    adSoyad: string;
    iletisim: string;
    tercihBrans: string[];
    not?: string;
    kvkkOnay: boolean;
    durum: "Alındı" | "Görüşme" | "Aktif Üyelik";
};

type SahaRez = {
    id: string;
    rezervNo: string;
    tarihISO: string;
    tesisId: string;
    tur: "basketbol" | "voleybol" | "futbol";
    tarih: string; // YYYY-MM-DD
    saat: string;  // HH:mm
    saatAdet: number; // 1-3
    iletişim: string;
    not?: string;
    durum: "Talep" | "Onaylandı";
    tahminiUcret: number;
};

type HavuzRez = {
    id: string;
    rezervNo: string;
    tarihISO: string;
    tesisId: string;
    seans: "Kadın" | "Erkek" | "Karma";
    tarih: string;
    saat: string;
    iletişim: string;
    saglikBeyani: boolean;
    durum: "Talep" | "Onaylandı";
    tahminiUcret: number;
};

/* ------------------------------ Yardımcılar / Utils ---------------------------- */
const DEFAULT_CENTER: Coords = { lat: 40.992, lng: 29.127 }; // Ataşehir merkez civarı

function osmEmbed(center: Coords) {
    const d = 0.02;
    const left = center.lng - d;
    const right = center.lng + d;
    const top = center.lat + d;
    const bottom = center.lat - d;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;
}

function haversineKm(a: Coords, b: Coords) {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;
    const x =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return Math.round(R * c * 10) / 10;
}

function nowOpen(weekHours: string, weekendHours?: string, day = new Date()): boolean {
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
    const slot = isWeekend && weekendHours ? weekendHours : weekHours; // "07:00-22:00"
    const [s, e] = slot.split("-");
    const [sh, sm] = s.split(":").map(Number);
    const [eh, em] = e.split(":").map(Number);
    const t = day.getHours() * 60 + day.getMinutes();
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    return t >= start && t <= end;
}

/* ------------------------------ Ataşehir Tesisleri (demo) ---------------------- */
const TESISLER: Tesis[] = [
    {
        id: "t1",
        ad: "Ataşehir Spor Kompleksi",
        tip: "fitness",
        coords: { lat: 40.9921, lng: 29.1243 },
        adres: "İnönü Mah. Spor Cad. No:12",
        telefon: "0216 000 00 01",
        gunler: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
        saat: "07:00-22:00",
        haftaSonuSaat: "08:00-20:00",
        ozellikler: ["fitness", "pilates", "yoga", "basketbol"],
        ucret: { uyelikAylik: 250, sahaSaat: 180 },
    },
    {
        id: "t2",
        ad: "Mustafa Kemal Yüzme Havuzu",
        tip: "havuz",
        coords: { lat: 40.9879, lng: 29.1367 },
        adres: "Mustafa Kemal Mah. Havuz Sk. No:3",
        telefon: "0216 000 00 02",
        gunler: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
        saat: "08:00-21:00",
        haftaSonuSaat: "09:00-20:00",
        ozellikler: ["25m havuz", "yüzme kursu", "aile seansı"],
        ucret: { havuzSeans: 60 },
    },
    {
        id: "t3",
        ad: "İnönü Kapalı Spor Salonu",
        tip: "saha",
        coords: { lat: 40.9981, lng: 29.1168 },
        adres: "İnönü Mah. Kapalı Spor Salonu",
        telefon: "0216 000 00 03",
        gunler: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
        saat: "09:00-22:00",
        ozellikler: ["basketbol", "voleybol", "tribün"],
        ucret: { sahaSaat: 150 },
    },
    {
        id: "t4",
        ad: "Kayışdağı Gençlik Merkezi",
        tip: "kurs",
        coords: { lat: 40.9835, lng: 29.1585 },
        adres: "Kayışdağı Mah. Gençlik Cad.",
        telefon: "0216 000 00 04",
        gunler: ["Pzt", "Sal", "Çar", "Per", "Cum"],
        saat: "10:00-20:00",
        ozellikler: ["satranç", "masa tenisi", "okçuluk"],
    },
    {
        id: "t5",
        ad: "Ferhatpaşa Halı Saha Tesisi",
        tip: "saha",
        coords: { lat: 41.0071, lng: 29.1692 },
        adres: "Ferhatpaşa Mah. 35. Sk.",
        telefon: "0216 000 00 05",
        gunler: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
        saat: "09:00-23:00",
        ozellikler: ["futbol", "soyunma odası", "kafeterya"],
        ucret: { sahaSaat: 220 },
    },
    {
        id: "t6",
        ad: "Barbaros Spor Merkezi",
        tip: "fitness",
        coords: { lat: 40.9859, lng: 29.1032 },
        adres: "Barbaros Mah. 19 Mayıs Cd.",
        telefon: "0216 000 00 06",
        gunler: ["Pzt", "Sal", "Çar", "Per", "Cum"],
        saat: "07:00-22:00",
        ozellikler: ["fitness", "kondisyon", "step-aerobik"],
        ucret: { uyelikAylik: 200 },
    },
];

/* --------------------------------- localStorage -------------------------------- */
const LS_UYELIK = "spor-uyelik";
const LS_SAHA = "spor-saha";
const LS_HAVUZ = "spor-havuz";
const loadLS = <T,>(k: string, def: T): T => { try { const s = localStorage.getItem(k); return s ? (JSON.parse(s) as T) : def; } catch { return def; } };
const saveLS = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };
const downloadJSON = (name: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
};

/* ------------------------------------- Sayfa ----------------------------------- */
export default function SporHizmetleriPage() {
    /* konum ve seçimler */
    const [center, setCenter] = useState<Coords>(DEFAULT_CENTER);
    const [me, setMe] = useState<Coords | null>(null);
    const [secili, setSecili] = useState<Tesis | null>(null);

    /* filtreler */
    const [q, setQ] = useState("");
    const [tip, setTip] = useState<"hepsi" | TesisTipi>("hepsi");
    const [oz, setOz] = useState<string>("hepsi");

    /* kayıtlar */
    const [uyelikler, setUyelikler] = useState<UyelikBasvuru[]>([]);
    const [sahalar, setSahalar] = useState<SahaRez[]>([]);
    const [havuzlar, setHavuzlar] = useState<HavuzRez[]>([]);

    useEffect(() => {
        setUyelikler(loadLS<UyelikBasvuru[]>(LS_UYELIK, []));
        setSahalar(loadLS<SahaRez[]>(LS_SAHA, []));
        setHavuzlar(loadLS<HavuzRez[]>(LS_HAVUZ, []));
    }, []);

    const useMyLocation = () => {
        if (!("geolocation" in navigator)) return alert("Tarayıcınız konum özelliğini desteklemiyor.");
        navigator.geolocation.getCurrentPosition(
            (p) => {
                const c = { lat: p.coords.latitude, lng: p.coords.longitude };
                setMe(c);
                setCenter(c);
            },
            () => alert("Konum alınamadı.")
        );
    };

    const list = useMemo(() => {
        const uniqOz = new Set<string>();
        TESISLER.forEach((t) => t.ozellikler.forEach((z) => uniqOz.add(z)));
        return TESISLER.filter((t) => {
            const byTip = tip === "hepsi" ? true : t.tip === tip;
            const byQ = q ? (t.ad + t.adres + t.ozellikler.join(" ")).toLowerCase().includes(q.toLowerCase()) : true;
            const byOz = oz === "hepsi" ? true : t.ozellikler.includes(oz);
            return byTip && byQ && byOz;
        });
    }, [q, tip, oz]);

    useEffect(() => { if (secili) setCenter(secili.coords); }, [secili]);

    /* —— Üyelik başvuru —— */
    const [uForm, setUForm] = useState<Omit<UyelikBasvuru, "id" | "basvuruNo" | "tarihISO" | "durum">>({
        tesisId: "",
        adSoyad: "",
        iletisim: "",
        tercihBrans: [],
        not: "",
        kvkkOnay: false,
    });
    const gonderUyelik = (e: React.FormEvent) => {
        e.preventDefault();
        if (!uForm.tesisId || !uForm.adSoyad || !uForm.iletisim) return alert("Tesis, ad soyad ve iletişim zorunlu.");
        if (!uForm.kvkkOnay) return alert("KVKK onayı gerekli.");
        const rec: UyelikBasvuru = {
            id: crypto.randomUUID(),
            basvuruNo: "SP-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
            tarihISO: new Date().toISOString(),
            durum: "Alındı",
            ...uForm,
        };
        const y = [rec, ...uyelikler]; setUyelikler(y); saveLS(LS_UYELIK, y);
        alert("Başvurunuz alındı. Başvuru No: " + rec.basvuruNo);
        setUForm({ tesisId: "", adSoyad: "", iletisim: "", tercihBrans: [], not: "", kvkkOnay: false });
    };

    /* —— Saha rezervasyonu —— */
    const [sForm, setSForm] = useState<Omit<SahaRez, "id" | "rezervNo" | "tarihISO" | "durum" | "tahminiUcret">>({
        tesisId: "",
        tur: "basketbol",
        tarih: new Date().toISOString().slice(0, 10),
        saat: "19:00",
        saatAdet: 1,
        iletişim: "",
        not: "",
    });
    const sahaUcret = useMemo(() => {
        const t = TESISLER.find((x) => x.id === sForm.tesisId);
        const taban = t?.ucret?.sahaSaat ?? 150;
        const gun = new Date(sForm.tarih).getDay();
        const haftasonu = gun === 0 || gun === 6;
        return (taban + (haftasonu ? 30 : 0)) * (sForm.saatAdet || 1);
    }, [sForm]);
    const gonderSaha = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sForm.tesisId || !sForm.iletişim) return alert("Tesis ve iletişim zorunlu.");
        const rec: SahaRez = {
            id: crypto.randomUUID(),
            rezervNo: "SR-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
            tarihISO: new Date().toISOString(),
            durum: "Talep",
            tahminiUcret: sahaUcret,
            ...sForm,
        };
        const y = [rec, ...sahalar]; setSahalar(y); saveLS(LS_SAHA, y);
        alert("Rezervasyon talebiniz alındı. No: " + rec.rezervNo);
        setSForm({ tesisId: "", tur: "basketbol", tarih: new Date().toISOString().slice(0, 10), saat: "19:00", saatAdet: 1, iletişim: "", not: "" });
    };

    /* —— Havuz seansı —— */
    const [hForm, setHForm] = useState<Omit<HavuzRez, "id" | "rezervNo" | "tarihISO" | "durum" | "tahminiUcret">>({
        tesisId: "",
        seans: "Karma",
        tarih: new Date().toISOString().slice(0, 10),
        saat: "18:00",
        iletişim: "",
        saglikBeyani: false,
    });
    const havuzUcret = useMemo(() => {
        const t = TESISLER.find((x) => x.id === hForm.tesisId);
        const taban = t?.ucret?.havuzSeans ?? 50;
        const gun = new Date(hForm.tarih).getDay();
        const haftasonu = gun === 0 || gun === 6;
        return taban + (haftasonu ? 10 : 0);
    }, [hForm]);
    const gonderHavuz = (e: React.FormEvent) => {
        e.preventDefault();
        if (!hForm.tesisId || !hForm.iletişim) return alert("Tesis ve iletişim zorunlu.");
        if (!hForm.saglikBeyani) return alert("Sağlık beyanı gereklidir.");
        const rec: HavuzRez = {
            id: crypto.randomUUID(),
            rezervNo: "HR-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
            tarihISO: new Date().toISOString(),
            durum: "Talep",
            tahminiUcret: havuzUcret,
            ...hForm,
        };
        const y = [rec, ...havuzlar]; setHavuzlar(y); saveLS(LS_HAVUZ, y);
        alert("Havuz seansı talebiniz alındı. No: " + rec.rezervNo);
        setHForm({ tesisId: "", seans: "Karma", tarih: new Date().toISOString().slice(0, 10), saat: "18:00", iletişim: "", saglikBeyani: false });
    };

    const yil = new Date().getFullYear();

    /* ------------------------------- render ------------------------------------ */
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-50 via-white to-blue-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Spor Hizmetleri</h1>
                        <p className="mt-3 text-gray-700">
                            Ataşehir’deki belediye spor tesislerini <strong>haritada</strong> görüntüleyin, <strong>üyelik</strong> başvurusu yapın,
                            <strong> saha</strong> ve <strong>havuz</strong> için randevu alın. Tüm adımlar ve açıklamalar bu sayfada.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="info">Harita ile Bul</Badge>
                            <Badge tone="success">Online Başvuru</Badge>
                            <Badge tone="warning">Demo Ücret Hesabı</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* kısa vaat şeridi */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"><span>📍</span><div><div className="text-lg font-semibold leading-none">Haritada</div><div className="text-sm text-gray-600">Tüm tesisler</div></div></div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"><span>💳</span><div><div className="text-lg font-semibold leading-none">Spor Kartı</div><div className="text-sm text-gray-600">Üyelik & giriş</div></div></div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"><span>🏆</span><div><div className="text-lg font-semibold leading-none">{yil} Etkinlikleri</div><div className="text-sm text-gray-600">Turnuva & koşular</div></div></div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["harita", "Harita & Tesis Bul"],
                            ["uyelik", "Spor Kartı / Üyelik Başvurusu"],
                            ["saha", "Saha Rezervasyonu"],
                            ["havuz", "Havuz Seansı"],
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
                    {/* ---------------- Harita & Tesis Bul ---------------- */}
                    <Section id="harita" title="Harita Üzerinden Tesis Bul">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            {/* sol: filtre + liste */}
                            <div className="rounded-xl border bg-white p-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ara (ad/özellik/adres)" value={q} onChange={(e) => setQ(e.target.value)} />
                                    <select className="rounded-lg border px-3 py-2" value={tip} onChange={(e) => setTip(e.target.value as any)}>
                                        <option value="hepsi">Tür (hepsi)</option>
                                        <option value="fitness">Fitness</option>
                                        <option value="saha">Saha</option>
                                        <option value="havuz">Havuz</option>
                                        <option value="kurs">Kurs/Gençlik</option>
                                    </select>
                                    <select className="rounded-lg border px-3 py-2" value={oz} onChange={(e) => setOz(e.target.value)}>
                                        <option value="hepsi">Özellik (hepsi)</option>
                                        {[...new Set(TESISLER.flatMap(t => t.ozellikler))].sort().map((o) => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                    <button onClick={useMyLocation} className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:opacity-95">Konumumu Kullan</button>
                                </div>

                                <ul className="mt-3 space-y-2">
                                    {list.map((t) => {
                                        const mesafe = me ? haversineKm(me, t.coords) : null;
                                        const acik = nowOpen(t.saat, t.haftaSonuSaat);
                                        return (
                                            <li key={t.id} className="rounded-lg border p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <div className="font-semibold">{t.ad}</div>
                                                        <div className="text-sm text-gray-600">{t.adres}</div>
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            <Badge tone="neutral">{t.tip.toUpperCase()}</Badge>
                                                            {acik ? <Badge tone="success">Şimdi Açık</Badge> : <Badge tone="warning">Kapalı</Badge>}
                                                            {mesafe !== null && <Badge tone="info">{mesafe} km</Badge>}
                                                        </div>
                                                        <div className="mt-1 text-xs text-gray-600">{t.gunler.join(" • ")} • {t.saat}{t.haftaSonuSaat ? ` • (Hafta sonu ${t.haftaSonuSaat})` : ""}</div>
                                                        <div className="mt-1 text-xs text-gray-600">Özellikler: {t.ozellikler.join(", ")}</div>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <button onClick={() => setSecili(t)} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white hover:opacity-95">Haritada Göster</button>
                                                        <a className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:opacity-95" target="_blank" rel="noreferrer"
                                                            href={`https://www.google.com/maps/dir/?api=1&destination=${t.coords.lat},${t.coords.lng}`}>Yol Tarifi</a>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                    {list.length === 0 && <li className="rounded-lg border p-3 text-sm text-gray-600">Sonuç bulunamadı.</li>}
                                </ul>
                            </div>

                            {/* sağ: harita */}
                            <div className="space-y-3">
                                <div className="overflow-hidden rounded-xl border">
                                    <iframe title="Harita" className="h-96 w-full" src={osmEmbed(secili?.coords || center)} loading="lazy" />
                                </div>
                                {secili ? (
                                    <div className="rounded-xl border bg-white p-4">
                                        <div className="mb-1 text-sm text-gray-600">Seçili Tesis</div>
                                        <div className="text-lg font-semibold">{secili.ad}</div>
                                        <div className="text-sm text-gray-700">{secili.adres}</div>
                                        <div className="text-xs text-gray-600">{secili.gunler.join(" • ")} • {secili.saat}</div>
                                        <div className="mt-1 flex flex-wrap gap-1">{secili.ozellikler.map((o) => <Badge key={o} tone="neutral">{o}</Badge>)}</div>
                                        <div className="mt-2 flex gap-2">
                                            <a className="rounded-lg bg-gray-900 px-3 py-2 text-xs text-white hover:opacity-95" target="_blank" rel="noreferrer"
                                                href={`https://www.openstreetmap.org/?mlat=${secili.coords.lat}&mlon=${secili.coords.lng}#map=17/${secili.coords.lat}/${secili.coords.lng}`}>OSM’de Aç</a>
                                            <a className="rounded-lg bg-emerald-600 px-3 py-2 text-xs text-white hover:opacity-95" href="#uyelik">Üyelik Başvurusu</a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border bg-white p-4 text-sm text-gray-600">Listeden bir tesis seçin.</div>
                                )}
                            </div>
                        </div>

                        <Callout title="Nasıl çalışır? – Harita & Tesis Bul" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Gerekli bilgiler:</span> Hiçbiri. İsterseniz <em>Konumumu Kullan</em> ile size en yakın tesisi görürsünüz.</li>
                                <li><span className="font-semibold">Ne veriyoruz:</span> Filtrelenebilir tesis listesi, açık/kapalı bilgisi, yol tarifi ve harita konumu.</li>
                                <li><span className="font-semibold">Gizlilik:</span> Konum izni vermezseniz konumunuz kaydedilmez; sistem yalnızca seçtiğiniz tesisi merkezler.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* ---------------- Üyelik ---------------- */}
                    <Section id="uyelik" title="Spor Kartı / Üyelik Ön Başvurusu">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <form onSubmit={gonderUyelik} className="rounded-xl border bg-white p-4">
                                <label className="block text-sm text-gray-600">Tesis</label>
                                <select className="mt-1 w-full rounded-lg border px-3 py-2" value={uForm.tesisId} onChange={(e) => setUForm((s) => ({ ...s, tesisId: e.target.value }))}>
                                    <option value="">Tesis seçin…</option>
                                    {TESISLER.filter(t => t.tip === "fitness" || t.tip === "kurs").map((t) => <option key={t.id} value={t.id}>{t.ad}</option>)}
                                </select>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ad Soyad" value={uForm.adSoyad} onChange={(e) => setUForm((s) => ({ ...s, adSoyad: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="İletişim (e-posta/telefon)" value={uForm.iletisim} onChange={(e) => setUForm((s) => ({ ...s, iletisim: e.target.value }))} />
                                </div>
                                <label className="mt-2 block text-sm text-gray-600">İlgilendiğiniz branşlar</label>
                                <div className="flex flex-wrap gap-2">
                                    {["fitness", "pilates", "yoga", "zumba", "yüzme", "basketbol", "voleybol"].map((b) => {
                                        const checked = uForm.tercihBrans.includes(b);
                                        return (
                                            <label key={b} className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${checked ? "bg-emerald-50 border-emerald-300" : "bg-white"}`}>
                                                <input type="checkbox" className="mr-2" checked={checked} onChange={(e) => {
                                                    setUForm((s) => ({
                                                        ...s,
                                                        tercihBrans: e.target.checked ? [...s.tercihBrans, b] : s.tercihBrans.filter((x) => x !== b),
                                                    }));
                                                }} />
                                                {b}
                                            </label>
                                        );
                                    })}
                                </div>
                                <label className="mt-2 block text-sm text-gray-600">Not (ops.)</label>
                                <textarea className="min-h-[60px] w-full rounded-lg border px-3 py-2" value={uForm.not || ""} onChange={(e) => setUForm((s) => ({ ...s, not: e.target.value }))} />
                                <label className="mt-2 flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={uForm.kvkkOnay} onChange={(e) => setUForm((s) => ({ ...s, kvkkOnay: e.target.checked }))} />
                                    Bilgilerimin üyelik ve iletişim amacıyla işlenmesini kabul ediyorum.
                                </label>
                                <div className="mt-3"><button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">Başvuruyu Gönder</button></div>
                            </form>

                            <Callout title="Nasıl çalışır? – Üyelik" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-semibold">Gerekli bilgiler:</span> Tesis, ad soyad, <span className="font-semibold">e-posta/telefon</span>; branş tercihi opsiyoneldir.</li>
                                    <li><span className="font-semibold">Ne veriyoruz:</span> <em>SP-XXXXX</em> başvuru numarası, randevu için geri dönüş ve ücret/kuralların özeti.</li>
                                    <li><span className="font-semibold">Ücret:</span> Tesislere göre değişir (kart/abonelik). Demo için kart aylığı: {TESISLER.find(t => t.ucret?.uyelikAylik)?.ucret?.uyelikAylik || 200} ₺’den başlar.</li>
                                    <li><span className="font-semibold">Belgeler:</span> Kimlik ibrazı ve sağlık beyanı yeterlidir; yüzme için sağlık raporu gerekebilir.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* ---------------- Saha ---------------- */}
                    <Section id="saha" title="Saha Rezervasyonu">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <form onSubmit={gonderSaha} className="rounded-xl border bg-white p-4">
                                <label className="block text-sm text-gray-600">Tesis</label>
                                <select className="mt-1 w-full rounded-lg border px-3 py-2" value={sForm.tesisId} onChange={(e) => setSForm((s) => ({ ...s, tesisId: e.target.value }))}>
                                    <option value="">Saha bulunan tesisler…</option>
                                    {TESISLER.filter(t => t.tip === "saha").map((t) => <option key={t.id} value={t.id}>{t.ad}</option>)}
                                </select>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <select className="rounded-lg border px-3 py-2" value={sForm.tur} onChange={(e) => setSForm((s) => ({ ...s, tur: e.target.value as any }))}>
                                        <option value="basketbol">Basketbol</option>
                                        <option value="voleybol">Voleybol</option>
                                        <option value="futbol">Futbol (halı saha)</option>
                                    </select>
                                    <input className="rounded-lg border px-3 py-2" type="date" value={sForm.tarih} onChange={(e) => setSForm((s) => ({ ...s, tarih: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" type="time" value={sForm.saat} onChange={(e) => setSForm((s) => ({ ...s, saat: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" type="number" min={1} max={3} value={sForm.saatAdet} onChange={(e) => setSForm((s) => ({ ...s, saatAdet: parseInt(e.target.value || "1") }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="İletişim" value={sForm.iletişim} onChange={(e) => setSForm((s) => ({ ...s, iletişim: e.target.value }))} />
                                </div>
                                <label className="mt-2 block text-sm text-gray-600">Not (ops.)</label>
                                <textarea className="min-h-[60px] w-full rounded-lg border px-3 py-2" value={sForm.not || ""} onChange={(e) => setSForm((s) => ({ ...s, not: e.target.value }))} />
                                <div className="mt-2 rounded-lg bg-gray-50 p-3 text-sm">
                                    Tahmini Ücret: <span className="font-semibold">{sahaUcret.toLocaleString("tr-TR")} ₺</span>
                                </div>
                                <div className="mt-3"><button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">Talep Gönder</button></div>
                            </form>

                            <Callout title="Nasıl çalışır? – Saha Rezervasyonu" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-semibold">Gerekli bilgiler:</span> Tesis, branş, tarih-saat, süre ve <span className="font-semibold">iletişim</span>.</li>
                                    <li><span className="font-semibold">Ne veriyoruz:</span> <em>SR-XXXXX</em> talep numarası; uygunluk kontrolünden sonra onay mesajı.</li>
                                    <li><span className="font-semibold">Ücret hesabı (demo):</span> Tesisin saat ücreti × süre + hafta sonu farkı.</li>
                                    <li><span className="font-semibold">İptal/erteleme:</span> 24 saat öncesine kadar ücretsiz; son dakika iptallerde ücret kesintisi olabilir.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* ---------------- Havuz ---------------- */}
                    <Section id="havuz" title="Havuz Seansı Rezervasyonu">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <form onSubmit={gonderHavuz} className="rounded-xl border bg-white p-4">
                                <label className="block text-sm text-gray-600">Havuz Tesisi</label>
                                <select className="mt-1 w-full rounded-lg border px-3 py-2" value={hForm.tesisId} onChange={(e) => setHForm((s) => ({ ...s, tesisId: e.target.value }))}>
                                    <option value="">Havuz seçin…</option>
                                    {TESISLER.filter(t => t.tip === "havuz").map((t) => <option key={t.id} value={t.id}>{t.ad}</option>)}
                                </select>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <select className="rounded-lg border px-3 py-2" value={hForm.seans} onChange={(e) => setHForm((s) => ({ ...s, seans: e.target.value as any }))}>
                                        <option value="Karma">Karma</option>
                                        <option value="Kadın">Kadın</option>
                                        <option value="Erkek">Erkek</option>
                                    </select>
                                    <input className="rounded-lg border px-3 py-2" type="date" value={hForm.tarih} onChange={(e) => setHForm((s) => ({ ...s, tarih: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" type="time" value={hForm.saat} onChange={(e) => setHForm((s) => ({ ...s, saat: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="İletişim" value={hForm.iletişim} onChange={(e) => setHForm((s) => ({ ...s, iletisim: e.target.value })) as any} />
                                </div>
                                <label className="mt-2 flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={hForm.saglikBeyani} onChange={(e) => setHForm((s) => ({ ...s, saglikBeyani: e.target.checked }))} />
                                    Sağlık açısından havuz kullanımına engelim yoktur (beyan).
                                </label>
                                <div className="mt-2 rounded-lg bg-gray-50 p-3 text-sm">
                                    Tahmini Ücret: <span className="font-semibold">{havuzUcret.toLocaleString("tr-TR")} ₺</span>
                                </div>
                                <div className="mt-3"><button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">Talep Gönder</button></div>
                            </form>

                            <Callout title="Nasıl çalışır? – Havuz Seansı" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-semibold">Gerekli bilgiler:</span> Havuz tesisi, seans (kadın/erkek/karma), tarih-saat ve <span className="font-semibold">iletişim</span>.</li>
                                    <li><span className="font-semibold">Ne veriyoruz:</span> <em>HR-XXXXX</em> talep numarası; kontenjan onayı sonrasında giriş kodu.</li>
                                    <li><span className="font-semibold">Kurallar:</span> Bone, terlik ve havlu zorunludur; duş alarak giriş yapılır; sağlık beyanı gerekir.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* ---------------- Kayıtlar / JSON ---------------- */}
                    <Section id="kayitlar" title="Kayıtlar / JSON">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-2 flex items-center justify-between"><h3 className="font-semibold">Üyelik Başvuruları</h3>
                                    <ExportMenu 
                    data={uyelikler} 
                    filename="spor-uyelik.json"
                    resourceId="spor_hizmetleri"
                  /></div>
                                {uyelikler.length === 0 ? <p className="text-sm text-gray-600">Kayıt yok.</p> : (
                                    <ul className="space-y-2 text-sm">{uyelikler.slice(0, 6).map((r) => (
                                        <li key={r.id} className="rounded-lg border p-2">{r.basvuruNo} • {TESISLER.find(t => t.id === r.tesisId)?.ad || "Tesis"} • {r.adSoyad}</li>
                                    ))}</ul>
                                )}
                            </div>
                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-2 flex items-center justify-between"><h3 className="font-semibold">Saha Rezervasyonları</h3>
                                    <ExportMenu 
                    data={sahalar} 
                    filename="spor-saha.json"
                    resourceId="spor_hizmetleri"
                  /></div>
                                {sahalar.length === 0 ? <p className="text-sm text-gray-600">Kayıt yok.</p> : (
                                    <ul className="space-y-2 text-sm">{sahalar.slice(0, 6).map((r) => (
                                        <li key={r.id} className="rounded-lg border p-2">{r.rezervNo} • {TESISLER.find(t => t.id === r.tesisId)?.ad || "Tesis"} • {r.tarih} {r.saat} ({r.saatAdet}s)</li>
                                    ))}</ul>
                                )}
                            </div>
                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-2 flex items-center justify-between"><h3 className="font-semibold">Havuz Seansları</h3>
                                    <ExportMenu 
                    data={havuzlar} 
                    filename="spor-havuz.json"
                    resourceId="spor_hizmetleri"
                  /></div>
                                {havuzlar.length === 0 ? <p className="text-sm text-gray-600">Kayıt yok.</p> : (
                                    <ul className="space-y-2 text-sm">{havuzlar.slice(0, 6).map((r) => (
                                        <li key={r.id} className="rounded-lg border p-2">{r.rezervNo} • {TESISLER.find(t => t.id === r.tesisId)?.ad || "Tesis"} • {r.seans} • {r.tarih} {r.saat}</li>
                                    ))}</ul>
                                )}
                            </div>
                        </div>
                    </Section>

                    {/* ---------------- SSS ---------------- */}
                    <Section id="sss" title="A’dan Z’ye Sık Sorulan Sorular">
                        {[
                            ["Üyelik ücretli mi?", "Tesislere göre değişir; belediye indirimleri ve dönemsel kampanyalar uygulanır. Ücret, sözleşme imzalanmadan alınmaz."],
                            ["Spor Kartı nereden alınır?", "Online ön başvuru yapın; SMS/e-posta ile çağrıldığınızda fotoğraflı kartınız tesis danışmasından teslim edilir."],
                            ["Sağlık raporu gerekli mi?", "Fitness için sağlık beyanı yeterlidir; havuz ve yoğun sporlar için aile hekimi raporu istenebilir."],
                            ["Kadınlara özel saatler var mı?", "Bazı havuz ve salonlarımızda kadın/erkek/karma seansları bulunur. Seans tipi rezervasyon adımında seçilir."],
                            ["Engelli erişimi var mı?", "Tesis girişleri, soyunma-duş alanları ve asansör düzenlemeleri erişilebilirlik standartlarına uygundur."],
                            ["Tesise dışarıdan eğitmen getirilebilir mi?", "Güvenlik ve sorumluluk nedeniyle hayır. Belediyenin görevlendirdiği eğitmenler ders verir."],
                            ["Yaş sınırı nedir?", "Genel fitness için 16+, havuz için velisiyle 7+, kurs/atölye türüne göre değişebilir."],
                            ["Öğrenci/Emekli indirimi?", "Belediye meclis tarifesine göre indirim uygulanır; belge ibrazı gerekir."],
                            ["Ücretsiz deneme dersi var mı?", "Dönemsel kampanyalarda vardır; duyuruları takip edin."],
                            ["Cihaz kullanımı için oryantasyon veriliyor mu?", "Evet. İlk kayıt olduğunuzda eğitmenler güvenli kullanım eğitimi verir."],
                            ["Antrenörle birebir çalışma mümkün mü?", "Randevu ile mümkündür; ek ücretlendirilebilir."],
                            ["Saha rezervasyonunu nasıl iptal ederim?", "Çağrı merkezi veya tesis telefonundan rezervasyon numaranızla en geç 24 saat önce arayın."],
                            ["Halı saha ücretine hakem dahil mi?", "Dahil değildir. Talep halinde yönlendirme yapılabilir."],
                            ["Havuzda bone zorunlu mu?", "Evet. Bone, kaymaz terlik ve havlu zorunludur; mayo kuralları ilan panosunda yer alır."],
                            ["Duş ve dolap kullanımı?", "Tüm tesislerde duş bulunur; dolaplar günlük kullanımlıdır. Kişisel kilit getirmeniz önerilir."],
                            ["Kayıp eşya süreci?", "Tesiste bulunan eşyalar 30 gün tutanakla saklanır; kimlik doğrulaması sonrası teslim edilir."],
                            ["Park yeri var mı?", "Bazı tesislerde sınırlı; toplu taşıma önerilir."],
                            ["Tesisler bayramda açık mı?", "Çalışma saatleri duyurulur; çoğu tesiste yarım gün hizmet verilir."],
                            ["Hastayken tesise gelebilir miyim?", "Hayır. Enfeksiyon riskinde tesis kullanımından kaçının."],
                            ["Fotoğraf/çekim kuralları?", "Diğer kullanıcıların mahremiyetine saygı duyulmalı; açık rızaları olmadan çekim yapılmamalıdır."],
                            ["Müzik ses seviyesi?", "Tesis sorumluları tarafından kullanıcı konforu gözetilerek ayarlanır."],
                            ["Acil durumlarda ne yapmalıyım?", "Danışma ve güvenlik görevlilerine haber verin; 112/110/155 numaraları görünür alanlarda yer alır."],
                            ["Üyelik dondurma mümkün mü?", "Sağlık/seyahat gibi gerekçelerle dönem koşullarına uygun şekilde dondurma yapılabilir."],
                            ["Aynı anda iki farklı tesise üye olabilir miyim?", "Mümkün; ancak abonelik ve kontenjan kuralları ayrı ayrı uygulanır."],
                            ["Turnuva/koşu var mı?", "Evet; belediye etkinlik takviminden kayıt olabilirsiniz."],
                            ["Soyunma alanı güvenliği?", "Kamera dışı mahrem bölgelerdir; güvenlik görevlisi ve danışma alanları kameralarla izlenir."],
                            ["Sigara/Elektronik sigara politikası?", "Kapalı alanlarda yasaktır; açık alanlarda da kullanıcı konforu gözetilir."],
                            ["Yanımda misafir getirebilir miyim?", "Üye olmayanlar misafir giriş kuralına tabidir; tesis yoğunluğuna göre değişir."],
                            ["Çocuk bakım alanı var mı?", "Bazı merkezlerde oyun odası bulunur; danışmadan bilgi alınız."],
                            ["Online ödeme yapılabiliyor mu?", "Bazı hizmetler için e-belediye ödeme kanalları kullanılabilir."],
                        ].map(([q, a], i) => (
                            <details key={i} className="group py-3">
                                <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-emerald-400">
                                    <span className="font-medium">{q}</span>
                                </summary>
                                <div className="prose prose-sm max-w-none py-2 text-gray-700">{a}</div>
                            </details>
                        ))}
                    </Section>

                    {/* ---------------- İletişim ---------------- */}
                    <Section id="iletisim" title="İletişim">
                        <p><span className="font-semibold">Spor İşleri Müdürlüğü</span></p>
                        <p>Çağrı Merkezi: 444 0 XXX • Alo 153</p>
                        <p>E-posta: <a className="text-emerald-700 underline" href="mailto:spor@birimajans.bel.tr">spor@birimajans.bel.tr</a></p>
                        <p>Adres: Belediye Spor Kompleksi, [adres]</p>
                        <div className="mt-3 flex gap-2">
                            <a href="#harita" className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95">Haritadan Bul</a>
                            <a href="#uyelik" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95">Üyelik Başvur</a>
                            <Link href="/etkinlikler" className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:opacity-95">Etkinlik Takvimi</Link>
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
}
