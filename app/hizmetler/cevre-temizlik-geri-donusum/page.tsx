"use client";

import React, { useEffect, useMemo, useState } from "react";
import ExportMenu from "@/components/ExportMenu";
import Link from "next/link";

/* ---------------------------- Basit UI yardımcıları ---------------------------- */
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

/* ------------------------------------ Tipler ----------------------------------- */
type Coords = { lat: number; lng: number };
type MahalleTakvim = { mahalle: string; gunler: string; saat: string; aciklama?: string };
type DropPoint = { id: string; ad: string; tur: "cam" | "plastik" | "kagit" | "metal" | "elektronik" | "atik-yag" | "pili"; coords: Coords; adres: string };

type HacimliTalep = {
    id: string;
    talepNo: string;
    tarihISO: string;
    adSoyad: string;
    iletisim: string;
    adres: string;
    mahalle?: string;
    esyalar: string;
    tarih: string; // YYYY-MM-DD
    saat: string;  // HH:mm
    durum: "Alındı" | "Planlandı" | "Tamamlandı";
};

type KonteynerTalep = {
    id: string;
    talepNo: string;
    adSoyad: string;
    iletisim: string;
    adres: string;
    mahalle?: string;
    ebat: "3m³" | "5m³" | "7m³" | "10m³";
    gun: number;
    haftaSonu: boolean;
    tarihBaslangic: string; // YYYY-MM-DD
    ucretTL: number; // demo
    durum: "Alındı" | "Planlandı" | "Tamamlandı";
};

type CopSikayet = {
    id: string;
    zaman: string;     // ISO
    adres?: string;
    coords: Coords;
    foto?: string;     // base64
    aciklama?: string;
    adSoyad?: string;
    iletisim?: string;
    durum: "Alındı" | "Yönlendirildi" | "Tamamlandı";
};

/* ----------------------------- Harita yardımcıları ----------------------------- */
const DEFAULT_CENTER: Coords = { lat: 41.039, lng: 29.001 };
function osmEmbed(center: Coords) {
    const d = 0.02;
    const left = center.lng - d;
    const right = center.lng + d;
    const top = center.lat + d;
    const bottom = center.lat - d;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;
}
const osmLink = (c: Coords) => `https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=17/${c.lat}/${c.lng}`;

/* ---------------------------------- Demo veriler --------------------------------- */
const TAKVIM: MahalleTakvim[] = [
    { mahalle: "Merkez", gunler: "Pzt-Çrş-Cum", saat: "08:00–12:00", aciklama: "Geri dönüştürülebilir atıklar (mavi poşet)" },
    { mahalle: "Sahil", gunler: "Sal-Per-Cmt", saat: "09:00–13:00", aciklama: "Cam + plastik ayrı toplanır" },
    { mahalle: "Tepe", gunler: "Pzt-Per", saat: "13:00–17:00", aciklama: "Kâğıt yoğun toplanır" },
    { mahalle: "Çınar", gunler: "Sal-Cum", saat: "08:00–12:00" },
];

const DROPPOINTS: DropPoint[] = [
    { id: "d1", ad: "Cam Kumbarası – İskele", tur: "cam", coords: { lat: 41.0412, lng: 29.0019 }, adres: "İskele Meydanı yanı" },
    { id: "d2", ad: "Elektronik Atık Noktası", tur: "elektronik", coords: { lat: 41.0371, lng: 29.0065 }, adres: "Belediye önü" },
    { id: "d3", ad: "Atık Yağ Toplama", tur: "atik-yag", coords: { lat: 41.0448, lng: 28.9958 }, adres: "Sanayi Sitesi girişi" },
    { id: "d4", ad: "Piller için Kutu", tur: "pili", coords: { lat: 41.0398, lng: 29.0123 }, adres: "Kütüphane içi" },
    { id: "d5", ad: "Kâğıt/Plastik Kutusu", tur: "kagit", coords: { lat: 41.0346, lng: 29.0021 }, adres: "Park içi" },
];

/* ------------------------------------- Utils ------------------------------------- */
const yil = new Date().getFullYear();
const toBase64 = (file?: File, cb?: (b64: string) => void) => {
    if (!file) return cb?.("");
    const r = new FileReader();
    r.onload = () => cb?.(r.result as string);
    r.readAsDataURL(file);
};
const useMyLocation = (cb: (c: Coords) => void) => {
    if (!("geolocation" in navigator)) return alert("Tarayıcınız konum özelliğini desteklemiyor.");
    navigator.geolocation.getCurrentPosition(
        (p) => cb({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => alert("Konum alınamadı.")
    );
};
const downloadJSON = (name: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
};
const loadLS = <T,>(k: string, def: T): T => { try { const s = localStorage.getItem(k); return s ? (JSON.parse(s) as T) : def; } catch { return def; } };
const saveLS = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };

/* ----------------------------------- LS key'leri ---------------------------------- */
const LS_HACIMLI = "cevre-hacimli";
const LS_KONTEYNER = "cevre-konteyner";
const LS_SIKAYET = "cevre-sokak-sikayet";

/* -------------------------------------- Sayfa -------------------------------------- */
export default function CevreTemizlikGeriDonusumPage() {
    /* ---- ortak state ---- */
    const [center, setCenter] = useState<Coords>(DEFAULT_CENTER);

    /* ---- Hacimli atık randevusu ---- */
    const [hacimli, setHacimli] = useState<HacimliTalep[]>([]);
    useEffect(() => setHacimli(loadLS<HacimliTalep[]>(LS_HACIMLI, [])), []);
    const [hForm, setHForm] = useState<Omit<HacimliTalep, "id" | "talepNo" | "tarihISO" | "durum">>({
        adSoyad: "", iletisim: "", adres: "", mahalle: "", esyalar: "",
        tarih: new Date().toISOString().slice(0, 10), saat: "14:00",
    });

    const kaydetHacimli = (e: React.FormEvent) => {
        e.preventDefault();
        if (!hForm.adSoyad || !hForm.iletisim || !hForm.adres) return alert("Ad Soyad, iletişim ve adres zorunludur.");
        const rec: HacimliTalep = {
            id: crypto.randomUUID(),
            talepNo: "HA-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
            tarihISO: new Date().toISOString(),
            durum: "Alındı",
            ...hForm,
        };
        const y = [rec, ...hacimli];
        setHacimli(y); saveLS(LS_HACIMLI, y);
        alert(`Talebiniz alındı. Talep No: ${rec.talepNo}`);
        setHForm({ adSoyad: "", iletisim: "", adres: "", mahalle: "", esyalar: "", tarih: new Date().toISOString().slice(0, 10), saat: "14:00" });
    };

    /* ---- Konteyner talebi (ücret hesabı – demo) ---- */
    const [konteyner, setKonteyner] = useState<KonteynerTalep[]>([]);
    useEffect(() => setKonteyner(loadLS<KonteynerTalep[]>(LS_KONTEYNER, [])), []);
    const [kForm, setKForm] = useState<Omit<KonteynerTalep, "id" | "talepNo" | "ucretTL" | "durum">>({
        adSoyad: "", iletisim: "", adres: "", mahalle: "",
        ebat: "5m³", gun: 3, haftaSonu: false, tarihBaslangic: new Date().toISOString().slice(0, 10),
    });
    const konteynerUcret = useMemo(() => {
        const taban: Record<KonteynerTalep["ebat"], number> = { "3m³": 450, "5m³": 650, "7m³": 900, "10m³": 1200 };
        const gunKatsayi = Math.max(1, kForm.gun);
        const haftaSonuEk = kForm.haftaSonu ? 200 : 0;
        return taban[kForm.ebat] * gunKatsayi + haftaSonuEk;
    }, [kForm.ebat, kForm.gun, kForm.haftaSonu]);
    const kaydetKonteyner = (e: React.FormEvent) => {
        e.preventDefault();
        if (!kForm.adSoyad || !kForm.iletisim || !kForm.adres) return alert("Ad Soyad, iletişim ve adres zorunludur.");
        const rec: KonteynerTalep = {
            id: crypto.randomUUID(),
            talepNo: "KT-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
            ucretTL: konteynerUcret,
            durum: "Alındı",
            ...kForm,
        };
        const y = [rec, ...konteyner];
        setKonteyner(y); saveLS(LS_KONTEYNER, y);
        alert(`Talebiniz alındı. Talep No: ${rec.talepNo}`);
        setKForm({ adSoyad: "", iletisim: "", adres: "", mahalle: "", ebat: "5m³", gun: 3, haftaSonu: false, tarihBaslangic: new Date().toISOString().slice(0, 10) });
    };

    /* ---- Sokakta çöp şikâyeti (konum + foto) ---- */
    const [sikayetler, setSikayetler] = useState<CopSikayet[]>([]);
    useEffect(() => setSikayetler(loadLS<CopSikayet[]>(LS_SIKAYET, [])), []);
    const [sForm, setSForm] = useState<Omit<CopSikayet, "id" | "durum">>({
        zaman: new Date().toISOString(),
        adres: "",
        coords: center,
        foto: "",
        aciklama: "",
        adSoyad: "",
        iletisim: "",
    });
    useEffect(() => setSForm((s) => ({ ...s, coords: center })), [center]);

    const kaydetSikayet = (e: React.FormEvent) => {
        e.preventDefault();
        const rec: CopSikayet = { id: crypto.randomUUID(), durum: "Alındı", ...sForm };
        const y = [rec, ...sikayetler].slice(0, 50);
        setSikayetler(y); saveLS(LS_SIKAYET, y);
        alert("Teşekkürler. Şikâyet kaydınız alınmıştır.");
        setSForm({ zaman: new Date().toISOString(), adres: "", coords: center, foto: "", aciklama: "", adSoyad: "", iletisim: "" });
    };

    /* ---- Filtre / arama ---- */
    const [q, setQ] = useState("");
    const dpList = useMemo(
        () => DROPPOINTS.filter(d => (q ? (d.ad + d.adres).toLowerCase().includes(q.toLowerCase()) : true)),
        [q]
    );

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-50 via-white to-lime-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Çevre Temizlik – Geri Dönüşüm</h1>
                        <p className="mt-3 text-gray-700">
                            Geri dönüşüm noktaları, mahalle toplama takvimi, <strong>hacimli atık randevusu</strong>, <strong>konteyner talebi</strong> ve
                            sokaklarda <strong>gereksiz çöp şikâyeti (konum+foto)</strong> bu sayfada.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="success">Toplama Takvimi</Badge>
                            <Badge tone="info">Harita Noktaları</Badge>
                            <Badge tone="warning">Randevu & JSON</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1503596476-1c12a8ba09a3?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* şerit */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>♻️</span>
                    <div><div className="text-lg font-semibold leading-none">%100</div><div className="text-sm text-gray-600">Ayrıştırılmış atık hedefi</div></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🗓️</span>
                    <div><div className="text-lg font-semibold leading-none">Takvimli</div><div className="text-sm text-gray-600">Mahalle gün-saat bilgisi</div></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>📸</span>
                    <div><div className="text-lg font-semibold leading-none">Foto ile</div><div className="text-sm text-gray-600">Konumlu şikâyet kaydı</div></div>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["takvim", "Mahalle Toplama Takvimi"],
                            ["noktalar", "Geri Dönüşüm Noktaları"],
                            ["hacimli", "Hacimli Atık Randevusu"],
                            ["konteyner", "Konteyner Talebi (Ücret Hesabı)"],
                            ["sikayet", "Sokakta Çöp Şikâyeti (Konum+Foto)"],
                            ["kayit", "Kayıtlar / JSON"],
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

                {/* İçerik */}
                <main className="space-y-10">
                    {/* TAKVİM */}
                    <Section id="takvim" title="Mahalle Toplama Takvimi">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border bg-white p-4">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="px-3 py-2 text-left">Mahalle</th>
                                            <th className="px-3 py-2 text-left">Günler</th>
                                            <th className="px-3 py-2 text-left">Saat</th>
                                            <th className="px-3 py-2 text-left">Not</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {TAKVIM.map((t) => (
                                            <tr key={t.mahalle} className="border-b">
                                                <td className="px-3 py-2">{t.mahalle}</td>
                                                <td className="px-3 py-2">{t.gunler}</td>
                                                <td className="px-3 py-2">{t.saat}</td>
                                                <td className="px-3 py-2">{t.aciklama || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Callout title="Nasıl çalışır? – Toplama Takvimi" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-semibold">Gerekli bilgiler:</span> Mahalleniz ve atık türünüz.</li>
                                    <li><span className="font-semibold">Ne veriyoruz:</span> Gün–saat ve atık ayrıştırma notları (mavi/yeşil poşet vb.).</li>
                                    <li><span className="font-semibold">Amaç:</span> Atığı doğru günde dışarı bırakmanızı sağlamak; karışık atık oranını düşürmek.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* GERİ DÖNÜŞÜM NOKTALARI */}
                    <Section id="noktalar" title="Geri Dönüşüm Noktaları (Harita)">
                        <div className="grid gap-4 md:grid-cols-[340px_1fr]">
                            <div className="rounded-xl border bg-white p-4">
                                <label className="block text-sm text-gray-600">Nokta ara</label>
                                <input className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="cam, elektronik, yağ, kâğıt..." value={q} onChange={(e) => setQ(e.target.value)} />
                                <ul className="mt-2 max-h-64 divide-y overflow-auto rounded-lg border text-sm">
                                    {DROPPOINTS.filter(d => (q ? (d.ad + d.adres).toLowerCase().includes(q.toLowerCase()) : true)).map((d) => (
                                        <li key={d.id} className="px-3 py-2">
                                            <div className="font-medium">{d.ad}</div>
                                            <div className="text-gray-600">{d.adres}</div>
                                            <a className="mt-1 inline-block rounded-md bg-gray-900 px-2.5 py-1 text-xs text-white hover:opacity-90" href={osmLink(d.coords)} target="_blank" rel="noreferrer">
                                                Haritada Aç
                                            </a>
                                        </li>
                                    ))}
                                    {DROPPOINTS.filter(d => (q ? (d.ad + d.adres).toLowerCase().includes(q.toLowerCase()) : true)).length === 0 && (
                                        <li className="px-3 py-2 text-gray-500">Sonuç yok.</li>
                                    )}
                                </ul>
                            </div>
                            <div className="overflow-hidden rounded-xl border">
                                <iframe title="Harita" className="h-80 w-full" src={osmEmbed(center)} loading="lazy" />
                                <div className="p-3 text-xs text-gray-600">İpucu: “Konumumu Kullan” ile harita merkezini bulunduğunuz yere alabilirsiniz.</div>
                                <button
                                    className="mx-3 mb-3 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:opacity-95"
                                    onClick={() => useMyLocation((c) => setCenter(c))}
                                >
                                    Konumumu Kullan
                                </button>
                            </div>
                        </div>

                        <Callout title="Ayrıştırma Rehberi (Özet)" tone="success">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Mavi poşet:</span> Kâğıt, karton, plastik, metal.</li>
                                <li><span className="font-semibold">Yeşil kumbaralar:</span> Cam.</li>
                                <li><span className="font-semibold">Kırmızı kutu:</span> Atık piller.</li>
                                <li><span className="font-semibold">Elektronik/yağ:</span> Belirlenen toplama noktalarına teslim.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* HACİMLİ ATIK */}
                    <Section id="hacimli" title="Hacimli Atık Alımı – Randevu">
                        <form onSubmit={kaydetHacimli} className="rounded-xl border bg-white p-4">
                            <div className="grid grid-cols-2 gap-2">
                                <input className="rounded-lg border px-3 py-2" placeholder="Ad Soyad" value={hForm.adSoyad} onChange={(e) => setHForm(s => ({ ...s, adSoyad: e.target.value }))} />
                                <input className="rounded-lg border px-3 py-2" placeholder="İletişim (e-posta/telefon)" value={hForm.iletisim} onChange={(e) => setHForm(s => ({ ...s, iletisim: e.target.value }))} />
                            </div>
                            <input className="mt-2 w-full rounded-lg border px-3 py-2" placeholder="Adres" value={hForm.adres} onChange={(e) => setHForm(s => ({ ...s, adres: e.target.value }))} />
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <input className="rounded-lg border px-3 py-2" placeholder="Mahalle (ops.)" value={hForm.mahalle || ""} onChange={(e) => setHForm(s => ({ ...s, mahalle: e.target.value }))} />
                                <input className="rounded-lg border px-3 py-2" type="date" value={hForm.tarih} onChange={(e) => setHForm(s => ({ ...s, tarih: e.target.value }))} />
                                <input className="rounded-lg border px-3 py-2" type="time" value={hForm.saat} onChange={(e) => setHForm(s => ({ ...s, saat: e.target.value }))} />
                            </div>
                            <label className="mt-2 block text-sm text-gray-600">Eşya/atık listesi</label>
                            <textarea className="min-h-[80px] w-full rounded-lg border px-3 py-2" placeholder="Örn: 2 koltuk, 1 dolap, 1 halı..." value={hForm.esyalar} onChange={(e) => setHForm(s => ({ ...s, esyalar: e.target.value }))} />
                            <div className="mt-3">
                                <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">Randevu Oluştur</button>
                            </div>
                        </form>

                        <Callout title="Nasıl çalışır? – Hacimli Atık" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Gerekli bilgiler:</span> Ad soyad, <span className="font-semibold">e-posta/telefon</span>, adres ve eşya listesi; tarih–saat.</li>
                                <li><span className="font-semibold">Ne veriyoruz:</span> <em>HA-XXXXX</em> talep numarası; ekipler planlamayı bu kayıt üzerinden yapar.</li>
                                <li><span className="font-semibold">Not:</span> İnşaat yıkıntısı/tehlikeli atık için farklı prosedür uygulanır.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* KONTEYNER */}
                    <Section id="konteyner" title="Konteyner Talebi (Ücret Hesabı – Demo)">
                        <div className="grid gap-4 md:grid-cols-2">
                            <form onSubmit={kaydetKonteyner} className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ad Soyad" value={kForm.adSoyad} onChange={(e) => setKForm(s => ({ ...s, adSoyad: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="İletişim (e-posta/telefon)" value={kForm.iletisim} onChange={(e) => setKForm(s => ({ ...s, iletisim: e.target.value }))} />
                                </div>
                                <input className="mt-2 w-full rounded-lg border px-3 py-2" placeholder="Adres" value={kForm.adres} onChange={(e) => setKForm(s => ({ ...s, adres: e.target.value }))} />
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <select className="rounded-lg border px-3 py-2" value={kForm.ebat} onChange={(e) => setKForm(s => ({ ...s, ebat: e.target.value as KonteynerTalep["ebat"] }))}>
                                        <option value="3m³">3m³</option>
                                        <option value="5m³">5m³</option>
                                        <option value="7m³">7m³</option>
                                        <option value="10m³">10m³</option>
                                    </select>
                                    <input className="rounded-lg border px-3 py-2" type="number" min={1} placeholder="Gün" value={kForm.gun} onChange={(e) => setKForm(s => ({ ...s, gun: parseInt(e.target.value || "1") }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Mahalle (ops.)" value={kForm.mahalle || ""} onChange={(e) => setKForm(s => ({ ...s, mahalle: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" type="date" value={kForm.tarihBaslangic} onChange={(e) => setKForm(s => ({ ...s, tarihBaslangic: e.target.value }))} />
                                </div>
                                <label className="mt-2 flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={kForm.haftaSonu} onChange={(e) => setKForm(s => ({ ...s, haftaSonu: e.target.checked }))} />
                                    Hafta sonu çalışma gerekiyor
                                </label>
                                <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                    <span className="text-sm text-gray-600">Tahmini Ücret</span>
                                    <span className="text-xl font-semibold">{konteynerUcret.toLocaleString("tr-TR")} ₺</span>
                                </div>
                                <div className="mt-3">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">Talep Oluştur</button>
                                </div>
                            </form>

                            <Callout title="Nasıl çalışır? – Konteyner Talebi" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-semibold">Gerekli bilgiler:</span> Ad soyad, <span className="font-semibold">e-posta/telefon</span>, adres; ebat (3–10m³), gün sayısı ve başlangıç tarihi.</li>
                                    <li><span className="font-semibold">Ne veriyoruz:</span> <em>KT-XXXXX</em> talep numarası ve <strong>tahmini ücret</strong> (demo: ebat tabanı×gün + hafta sonu ek).</li>
                                    <li><span className="font-semibold">Ödeme:</span> Resmî tutarlar <Link className="text-blue-700 underline" href="/ucretler-ve-tarifeler">Ücretler ve Tarifeler</Link> sayfasına göre belirlenir.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* SOKAKTA ÇÖP ŞİKÂYETİ */}
                    <Section id="sikayet" title="Sokakta Çöp Şikâyeti (Konum + Foto)">
                        <div className="grid gap-4 md:grid-cols-[340px_1fr]">
                            <form onSubmit={kaydetSikayet} className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Konum</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input className="rounded-lg border px-3 py-2" type="number" step="0.0001" value={center.lat} onChange={(e) => setCenter((c) => ({ ...c, lat: parseFloat(e.target.value) }))} placeholder="Enlem (lat)" />
                                    <input className="rounded-lg border px-3 py-2" type="number" step="0.0001" value={center.lng} onChange={(e) => setCenter((c) => ({ ...c, lng: parseFloat(e.target.value) }))} placeholder="Boylam (lng)" />
                                </div>
                                <input className="mt-2 w-full rounded-lg border px-3 py-2" placeholder="Adres (ops.)" value={sForm.adres || ""} onChange={(e) => setSForm(s => ({ ...s, adres: e.target.value }))} />
                                <button type="button" className="mt-2 w-full rounded-lg bg-emerald-600 px-3 py-2 text-white hover:opacity-95" onClick={() => useMyLocation((c) => setCenter(c))}>
                                    Konumumu Kullan
                                </button>

                                <h3 className="mb-2 mt-4 font-semibold">Detay</h3>
                                <textarea className="min-h-[80px] w-full rounded-lg border px-3 py-2" placeholder="Örn: Köşe başındaki konteyner yanına poşetler bırakılmış..." value={sForm.aciklama || ""} onChange={(e) => setSForm(s => ({ ...s, aciklama: e.target.value }))} />
                                <label className="mt-2 block text-sm text-gray-600">Fotoğraf (ops.)</label>
                                <input className="w-full rounded-lg border px-3 py-2" type="file" accept="image/*" onChange={(e) => toBase64(e.target.files?.[0], (b64) => setSForm(s => ({ ...s, foto: b64 })))} />
                                {sForm.foto && <img src={sForm.foto} alt="şikâyet" className="mt-2 max-h-48 w-full rounded-lg object-cover" />}

                                <h3 className="mb-2 mt-4 font-semibold">İletişim (ops.)</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ad Soyad" value={sForm.adSoyad || ""} onChange={(e) => setSForm(s => ({ ...s, adSoyad: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="E-posta/Telefon" value={sForm.iletisim || ""} onChange={(e) => setSForm(s => ({ ...s, iletisim: e.target.value }))} />
                                </div>

                                <div className="mt-3">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">Şikâyeti Gönder</button>
                                </div>
                            </form>

                            <div className="space-y-4">
                                <div className="overflow-hidden rounded-xl border">
                                    <iframe title="Harita" className="h-72 w-full" src={osmEmbed(center)} loading="lazy" />
                                </div>
                                <div className="rounded-xl border bg-white p-4">
                                    <h3 className="mb-2 font-semibold">Son Şikâyetler (demo)</h3>
                                    {sikayetler.length === 0 ? (
                                        <p className="text-sm text-gray-600">Henüz kayıt yok.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {sikayetler.slice(0, 6).map((r) => (
                                                <li key={r.id} className="rounded-lg border p-2 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">{new Date(r.zaman).toLocaleString("tr-TR")}</span>
                                                        <Badge tone={r.durum === "Tamamlandı" ? "success" : r.durum === "Yönlendirildi" ? "info" : "warning"}>{r.durum}</Badge>
                                                    </div>
                                                    <div className="text-gray-700">{r.adres || `${r.coords.lat.toFixed(4)}, ${r.coords.lng.toFixed(4)}`}</div>
                                                    {r.foto && <img src={r.foto} alt="şikayet" className="mt-1 max-h-32 rounded" />}
                                                    {r.aciklama && <div className="text-gray-700">{r.aciklama}</div>}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Callout title="Nasıl çalışır? – Sokakta Çöp Şikâyeti" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Gerekli bilgiler:</span> Konum (lat–lng veya “Konumumu Kullan”), kısa açıklama; <span className="font-semibold">fotoğraf</span> opsiyonel.</li>
                                <li><span className="font-semibold">Ne veriyoruz:</span> Kayıt oluşturulur, ekipler konuma yönlendirilir. Durum “Alındı → Yönlendirildi → Tamamlandı” akışındadır.</li>
                                <li><span className="font-semibold">Amaç:</span> Sokak aralarındaki düzensiz çöp birikimlerini hızlıca tespit edip temizletmek.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* KAYITLAR / JSON (yalnızca kartlar) */}
                    <Section id="kayit" title="Kayıtlar / JSON">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold">Hacimli Atık Talepleri</h3>
                                    <ExportMenu 
                    data={hacimli} 
                    filename="hacimli-atik.json"
                    resourceId="cevre_temizlik_geri_donusum"
                  />
                                </div>
                                {hacimli.length === 0 ? (
                                    <p className="text-sm text-gray-600">Kayıt yok.</p>
                                ) : (
                                    <ul className="space-y-2 text-sm">
                                        {hacimli.slice(0, 6).map((r) => (
                                            <li key={r.id} className="rounded-lg border p-2">
                                                {r.talepNo} • {r.adSoyad} • {r.tarih} {r.saat}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold">Konteyner Talepleri</h3>
                                    <ExportMenu 
                    data={konteyner} 
                    filename="konteyner-talep.json"
                    resourceId="cevre_temizlik_geri_donusum"
                  />
                                </div>
                                {konteyner.length === 0 ? (
                                    <p className="text-sm text-gray-600">Kayıt yok.</p>
                                ) : (
                                    <ul className="space-y-2 text-sm">
                                        {konteyner.slice(0, 6).map((r) => (
                                            <li key={r.id} className="rounded-lg border p-2">
                                                {r.talepNo} • {r.ebat} • {r.gun} gün • {r.ucretTL.toLocaleString("tr-TR")} ₺
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold">Çöp Şikâyet Kayıtları</h3>
                                    <ExportMenu 
                    data={sikayetler} 
                    filename="cop-sikayet.json"
                    resourceId="cevre_temizlik_geri_donusum"
                  />
                                </div>
                                {sikayetler.length === 0 ? (
                                    <p className="text-sm text-gray-600">Kayıt yok.</p>
                                ) : (
                                    <ul className="space-y-2 text-sm">
                                        {sikayetler.slice(0, 6).map((r) => (
                                            <li key={r.id} className="rounded-lg border p-2">
                                                {new Date(r.zaman).toLocaleString("tr-TR")} • {r.adres || `${r.coords.lat.toFixed(4)},${r.coords.lng.toFixed(4)}`}
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
                            ["Karışık atık attım, alınır mı?", "Alınır; ancak geri dönüşüm oranı düşer ve çevreye etkisi artar. Lütfen ayrıştırın."],
                            ["Hacimli atık neleri kapsar?", "Koltuk, dolap, yatak gibi büyük eşyalar. İnşaat/yıkıntı ve tehlikeli atık ayrı prosedüre tabidir."],
                            ["Konteyner ücreti neye göre hesaplanır?", "Demo’da ebat tabanı × gün + hafta sonu ek; resmî tutarlar tarife cetveline göre belirlenir."],
                            ["Elektronik atığı nereye bırakmalıyım?", "Belediye önündeki elektronik atık noktasına; büyük miktarlar için iletişime geçin."],
                            ["Atık yağ nasıl teslim edilir?", "Kapalı kapta, ‘Atık Yağ Toplama’ noktasına götürünüz; lavaboya dökmeyiniz."],
                            ["Cam ve plastik aynı gün mü toplanıyor?", "Mahallenize göre değişebilir; takvimdeki ‘not’ alanına bakın."],
                            ["Şikâyetim ne kadar sürede çözülür?", "Yoğunluğa göre aynı gün/ertesi gün. Kaydın durumunu ekip içi sistemde takip ediyoruz."],
                            ["Konum vermeden şikâyet açabilir miyim?", "Adres yazarak açabilirsiniz; konum vermek yer tespiti için çok yardımcı olur."],
                            ["Fotoğraf şart mı?", "Opsiyonel; ancak ekiplerin olayı daha hızlı çözmesi için önerilir."],
                            ["Toplama saati geçti, ne yapayım?", "Bir sonraki takvimi bekleyin veya en yakın drop-off noktasına götürün."],
                            ["Çöp konteynerim dolu/hasarlı, talep nasıl?", "Konteyner Talebi formundan ‘hasarlı konteyner’ notu ile bildirebilirsiniz."],
                            ["Geri dönüşüm poşetlerini nereden alırım?", "Muhtarlıklar ve belediye danışmadan temin edebilirsiniz."],
                            ["Atık pil kampanyası var mı?", "Okullar ve kütüphanelerde kırmızı kutular mevcut; dönemsel kampanyalar duyurulur."],
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
                        <p><span className="font-semibold">Temizlik İşleri / İklim Değişikliği ve Sıfır Atık Müdürlüğü</span></p>
                        <p>Çağrı Merkezi: 444 0 XXX • Alo 153</p>
                        <p>E-posta: <a className="text-emerald-700 underline" href="mailto:cevresifiratik@birimajans.bel.tr">cevresifiratik@birimajans.bel.tr</a></p>
                        <p>Adres: Belediye Hizmet Binası, [adres]</p>
                        <div className="mt-3 flex gap-2">
                            <a href="#sikayet" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95">Şikâyet Oluştur</a>
                            <a href="#hacimli" className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95">Hacimli Atık Randevusu</a>
                            <a href="#konteyner" className="rounded-lg bg-lime-700 px-4 py-2 text-white hover:opacity-95">Konteyner Talebi</a>
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
}
