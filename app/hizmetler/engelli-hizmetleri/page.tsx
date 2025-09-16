"use client";

import React, { useEffect, useMemo, useState } from "react";
import ExportMenu from "@/components/ExportMenu";
import Link from "next/link";

/* ────────────────── Küçük UI yardımcıları ────────────────── */
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

/* ────────────────── Ortak yardımcılar ────────────────── */
type Coords = { lat: number; lng: number };
const DEFAULT_CENTER: Coords = { lat: 40.9916, lng: 29.0240 }; // İstanbul/Anadolu yakası merkez

function osmEmbed(center: Coords) {
    const d = 0.02;
    const left = center.lng - d;
    const right = center.lng + d;
    const top = center.lat + d;
    const bottom = center.lat - d;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;
}

const loadLS = <T,>(k: string, def: T): T => { try { const s = localStorage.getItem(k); return s ? (JSON.parse(s) as T) : def; } catch { return def; } };
const saveLS = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };
const downloadJSON = (name: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
};
const toBase64 = (file?: File, cb?: (b64: string) => void) => {
    if (!file) return cb?.("");
    const r = new FileReader();
    r.onload = () => cb?.(r.result as string);
    r.readAsDataURL(file);
};

/* ────────────────── Tipler ────────────────── */
// Engelli Taksi / Randevu
type TaksiTalep = {
    id: string;
    tarihISO: string;   // YYYY-MM-DD
    saat: string;       // HH:mm
    adSoyad: string;
    tckn?: string;
    telefon: string;
    adres: string;
    coords?: Coords;
    tekerlekliSandalye: boolean;
    refakatci: number;
    not?: string;
};

// Tıbbi cihaz ödünç
type CihazTuru = "manuel-sandalye" | "akulu-sandalye" | "hasta-yatasi" | "walker" | "oksijen" | "diğer";
type CihazOdunc = {
    id: string;
    cihaz: CihazTuru;
    sureGun: number;
    teslimAdres: string;
    adSoyad: string;
    iletisim: string;
    rapor?: string; // base64
    not?: string;
};

// İşaret dili/erişilebilirlik destek
type DestekTuru = "isaret-dili-tercuman" | "yazi-destek" | "sesli-betimleme";
type TercumanTalep = {
    id: string;
    tur: DestekTuru;
    tarihISO: string;
    saat: string;
    yer: string;
    kurum?: string;
    adSoyad: string;
    iletisim: string;
    aciklama?: string;
};

// Erişilebilirlik/engel bildirimi
type BildirimKategori = "kaldirim" | "rampa" | "otobus-duragi" | "asansor" | "yaya-gecidi" | "park-alani" | "web-sayfasi" | "diğer";
type ErisilebilirlikBildirimi = {
    id: string;
    coords?: Coords;
    adres?: string;
    kategori: BildirimKategori;
    aciklama: string;
    foto?: string; // base64
    adSoyad?: string;
    iletisim?: string;
};

const LS_TAKSI = "engelli-taksi-talepleri";
const LS_CIHAZ = "cihaz-odunc-talepleri";
const LS_TERCUMAN = "tercuman-talepleri";
const LS_ERISIM = "erisilebilirlik-bildirimleri";

/* ────────────────── Sayfa ────────────────── */
export default function EngelliHizmetleriPage() {
    const yil = new Date().getFullYear();

    const [center, setCenter] = useState<Coords>(DEFAULT_CENTER);
    const useMyLocation = () => {
        if (!("geolocation" in navigator)) return alert("Tarayıcınız konum özelliğini desteklemiyor.");
        navigator.geolocation.getCurrentPosition(
            (p) => setCenter({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => alert("Konum alınamadı.")
        );
    };

    /* ── Kayıt durumları ── */
    const [taksiList, setTaksiList] = useState<TaksiTalep[]>([]);
    const [cihazList, setCihazList] = useState<CihazOdunc[]>([]);
    const [tercumanList, setTercumanList] = useState<TercumanTalep[]>([]);
    const [erisimList, setErisimList] = useState<ErisilebilirlikBildirimi[]>([]);

    useEffect(() => {
        setTaksiList(loadLS<TaksiTalep[]>(LS_TAKSI, []));
        setCihazList(loadLS<CihazOdunc[]>(LS_CIHAZ, []));
        setTercumanList(loadLS<TercumanTalep[]>(LS_TERCUMAN, []));
        setErisimList(loadLS<ErisilebilirlikBildirimi[]>(LS_ERISIM, []));
    }, []);

    /* ── Form state’leri ── */
    const [taksi, setTaksi] = useState<TaksiTalep>({
        id: crypto.randomUUID(),
        tarihISO: new Date().toISOString().slice(0, 10),
        saat: "10:00",
        adSoyad: "",
        tckn: "",
        telefon: "",
        adres: "",
        coords: center,
        tekerlekliSandalye: true,
        refakatci: 0,
        not: "",
    });
    useEffect(() => setTaksi((s) => ({ ...s, coords: center })), [center]);

    const [cihaz, setCihaz] = useState<CihazOdunc>({
        id: crypto.randomUUID(),
        cihaz: "manuel-sandalye",
        sureGun: 30,
        teslimAdres: "",
        adSoyad: "",
        iletisim: "",
        not: "",
    });

    const [tercuman, setTercuman] = useState<TercumanTalep>({
        id: crypto.randomUUID(),
        tur: "isaret-dili-tercuman",
        tarihISO: new Date().toISOString().slice(0, 10),
        saat: "14:00",
        yer: "",
        kurum: "",
        adSoyad: "",
        iletisim: "",
        aciklama: "",
    });

    const [erisim, setErisim] = useState<ErisilebilirlikBildirimi>({
        id: crypto.randomUUID(),
        coords: center,
        adres: "",
        kategori: "kaldirim",
        aciklama: "",
    });
    useEffect(() => setErisim((s) => ({ ...s, coords: center })), [center]);

    /* ── Gönderimler ── */
    const submitTaksi = (e: React.FormEvent) => {
        e.preventDefault();
        if (!taksi.adSoyad || !taksi.telefon || !taksi.adres) return alert("Ad Soyad, Telefon ve Adres zorunludur.");
        const rec = { ...taksi, id: crypto.randomUUID() };
        const y = [rec, ...taksiList].slice(0, 200);
        setTaksiList(y); saveLS(LS_TAKSI, y);
        alert("Talebiniz alınmıştır. Randevu teyidi SMS/e-posta ile bildirilecektir (demo).");
        setTaksi((s) => ({ ...s, id: crypto.randomUUID(), not: "" }));
    };

    const submitCihaz = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cihaz.adSoyad || !cihaz.iletisim || !cihaz.teslimAdres) return alert("Ad Soyad, İletişim ve Teslim adresi zorunludur.");
        const rec = { ...cihaz, id: crypto.randomUUID() };
        const y = [rec, ...cihazList].slice(0, 200);
        setCihazList(y); saveLS(LS_CIHAZ, y);
        alert("Cihaz ödünç başvurunuz alınmıştır (demo).");
        setCihaz({ id: crypto.randomUUID(), cihaz: "manuel-sandalye", sureGun: 30, teslimAdres: "", adSoyad: "", iletisim: "", not: "" });
    };

    const submitTercuman = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tercuman.adSoyad || !tercuman.iletisim || !tercuman.yer) return alert("Ad Soyad, İletişim ve Etkinlik yeri zorunludur.");
        const rec = { ...tercuman, id: crypto.randomUUID() };
        const y = [rec, ...tercumanList].slice(0, 200);
        setTercumanList(y); saveLS(LS_TERCUMAN, y);
        alert("Destek talebiniz alınmıştır (demo).");
        setTercuman({ id: crypto.randomUUID(), tur: "isaret-dili-tercuman", tarihISO: new Date().toISOString().slice(0, 10), saat: "14:00", yer: "", kurum: "", adSoyad: "", iletisim: "", aciklama: "" });
    };

    const submitErisim = (e: React.FormEvent) => {
        e.preventDefault();
        if (!erisim.aciklama) return alert("Kısa açıklama zorunludur.");
        const rec = { ...erisim, id: crypto.randomUUID() };
        const y = [rec, ...erisimList].slice(0, 200);
        setErisimList(y); saveLS(LS_ERISIM, y);
        alert("Bildiriminiz alınmıştır. Ekipler yönlendirilecektir (demo).");
        setErisim({ id: crypto.randomUUID(), coords: center, adres: "", kategori: "kaldirim", aciklama: "" });
    };

    /* ── Derived & yardımcılar ── */
    const salonNotu = useMemo(() => {
        const gun = new Date(taksi.tarihISO).getDay(); // 0 pazar
        return gun === 0 ? "Pazar günleri mesai dışında olduğumuz için mümkün olduğunca bir gün önceden randevu önerilir." : "Aynı gün içinde en az 2 saat önce randevu oluşturun.";
    }, [taksi.tarihISO]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-violet-50 via-white to-emerald-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Engelli Hizmetleri</h1>
                        <p className="mt-3 text-gray-700">
                            <strong>Engelli Taksi</strong>, <strong>tıbbi cihaz ödünç</strong>, <strong>işaret dili tercüman</strong> desteği ve <strong>erişilebilirlik bildirimleri</strong> – hepsi tek sayfada.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="info">Randevu</Badge>
                            <Badge tone="success">Destek</Badge>
                            <Badge tone="warning">Erişilebilirlik</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* üst bant */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"><span>🚕</span><div><div className="text-lg font-semibold leading-none">90 dk</div><div className="text-sm text-gray-600">Taksi çağrı hedefi</div></div></div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"><span>🦽</span><div><div className="text-lg font-semibold leading-none">0 ₺</div><div className="text-sm text-gray-600">Cihaz ödünç depozitosuz (demo)</div></div></div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"><span>🤟</span><div><div className="text-lg font-semibold leading-none">{yil}</div><div className="text-sm text-gray-600">Tercüman planlaması</div></div></div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["taksi", "Engelli Taksi / Randevu"],
                            ["cihaz", "Tıbbi Cihaz Ödünç"],
                            ["tercuman", "İşaret Dili Tercüman / Destek"],
                            ["erisim", "Erişilebilirlik Bildir (Foto + Konum)"],
                            ["kayitlar", "Kayıtlar / JSON"],
                            ["sss", "A’dan Z’ye SSS"],
                            ["iletisim", "İletişim & Haklar"],
                        ].map(([id, label]) => (
                            <li key={id}>
                                <a href={`#${id}`} className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Content */}
                <main className="space-y-10">
                    {/* Engelli taksi */}
                    <Section id="taksi" title="Engelli Taksi – Randevu Oluştur">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <form onSubmit={submitTaksi} className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Talep Bilgileri</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input className="rounded-lg border px-3 py-2" type="date" value={taksi.tarihISO} onChange={(e) => setTaksi((s) => ({ ...s, tarihISO: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" type="time" value={taksi.saat} onChange={(e) => setTaksi((s) => ({ ...s, saat: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ad Soyad" value={taksi.adSoyad} onChange={(e) => setTaksi((s) => ({ ...s, adSoyad: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="T.C. Kimlik (ops.)" value={taksi.tckn || ""} onChange={(e) => setTaksi((s) => ({ ...s, tckn: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Telefon" value={taksi.telefon} onChange={(e) => setTaksi((s) => ({ ...s, telefon: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" type="number" min={0} max={3} placeholder="Refakatçi sayısı" value={taksi.refakatci} onChange={(e) => setTaksi((s) => ({ ...s, refakatci: parseInt(e.target.value || "0") }))} />
                                </div>
                                <label className="mt-2 block text-sm text-gray-600">Adres</label>
                                <input className="w-full rounded-lg border px-3 py-2" placeholder="Alınış adresi" value={taksi.adres} onChange={(e) => setTaksi((s) => ({ ...s, adres: e.target.value }))} />
                                <div className="mt-2 flex items-center gap-2 text-sm">
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={taksi.tekerlekliSandalye} onChange={(e) => setTaksi((s) => ({ ...s, tekerlekliSandalye: e.target.checked }))} /> Tekerlekli sandalye ile ulaşım</label>
                                    <button type="button" onClick={useMyLocation} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:opacity-95">Konumumu Kullan</button>
                                </div>
                                <textarea className="mt-2 min-h-[70px] w-full rounded-lg border px-3 py-2" placeholder="Not (opsiyonel)" value={taksi.not || ""} onChange={(e) => setTaksi((s) => ({ ...s, not: e.target.value }))} />
                                <div className="mt-3">
                                    <button className="rounded-lg bg-violet-600 px-4 py-2 text-white hover:opacity-95" type="submit">Randevu Oluştur</button>
                                    <p className="mt-1 text-xs text-gray-500">{salonNotu}</p>
                                </div>
                            </form>

                            <div className="space-y-4">
                                <div className="overflow-hidden rounded-xl border">
                                    <iframe title="Harita" className="h-72 w-full" src={osmEmbed(center)} loading="lazy" />
                                </div>
                                <Callout title="Nasıl çalışır? – Engelli Taksi" tone="info">
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><strong>Gerekli bilgiler:</strong> Tarih-saat, ad soyad, <strong>telefon</strong>, alınış adresi, refakatçi sayısı.</li>
                                        <li><strong>Ne veriyoruz:</strong> Uygun araca göre <strong>randevu teyidi</strong>, sürücü bilgisi ve SMS.</li>
                                        <li><strong>Öncelik:</strong> Sağlık randevusu/okul erişimi olan talepler.</li>
                                        <li><strong>Gizlilik:</strong> Bilgiler sadece servis planlama için kullanılır; reklam yapılmaz.</li>
                                    </ul>
                                </Callout>
                            </div>
                        </div>
                    </Section>

                    {/* Cihaz ödünç */}
                    <Section id="cihaz" title="Tıbbi Cihaz Ödünç (Depozitosuz – demo)">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <form onSubmit={submitCihaz} className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Başvuru Bilgileri</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <select className="rounded-lg border px-3 py-2" value={cihaz.cihaz} onChange={(e) => setCihaz((s) => ({ ...s, cihaz: e.target.value as CihazTuru }))}>
                                        <option value="manuel-sandalye">Manuel Tekerlekli Sandalye</option>
                                        <option value="akulu-sandalye">Akülü Sandalye</option>
                                        <option value="hasta-yatasi">Hasta Yatağı</option>
                                        <option value="walker">Walker / Baston</option>
                                        <option value="oksijen">Oksijen Konsantratörü</option>
                                        <option value="diğer">Diğer</option>
                                    </select>
                                    <input className="rounded-lg border px-3 py-2" type="number" min={7} max={180} placeholder="Süre (gün)" value={cihaz.sureGun} onChange={(e) => setCihaz((s) => ({ ...s, sureGun: parseInt(e.target.value || "30") }))} />
                                </div>
                                <input className="mt-2 w-full rounded-lg border px-3 py-2" placeholder="Teslim Adresi" value={cihaz.teslimAdres} onChange={(e) => setCihaz((s) => ({ ...s, teslimAdres: e.target.value }))} />
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ad Soyad" value={cihaz.adSoyad} onChange={(e) => setCihaz((s) => ({ ...s, adSoyad: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="İletişim (tel/e-posta)" value={cihaz.iletisim} onChange={(e) => setCihaz((s) => ({ ...s, iletisim: e.target.value }))} />
                                </div>
                                <label className="mt-2 block text-sm text-gray-600">Sağlık Raporu (opsiyonel)</label>
                                <input className="w-full rounded-lg border px-3 py-2" type="file" accept="image/*,application/pdf" onChange={(e) => toBase64(e.target.files?.[0], (b64) => setCihaz((s) => ({ ...s, rapor: b64 })))} />
                                <textarea className="mt-2 min-h-[70px] w-full rounded-lg border px-3 py-2" placeholder="Not (ops.)" value={cihaz.not || ""} onChange={(e) => setCihaz((s) => ({ ...s, not: e.target.value }))} />
                                <div className="mt-3">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">Başvuruyu Gönder</button>
                                </div>
                            </form>

                            <Callout title="Nasıl çalışır? – Cihaz Ödünç" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><strong>Gerekli bilgiler:</strong> Cihaz türü, süre (gün), teslim adresi, <strong>iletişim</strong>.</li>
                                    <li><strong>Ne veriyoruz:</strong> Stok durumuna göre teslim tarihi ve marka/model bilgisi.</li>
                                    <li><strong>Bakım:</strong> Arızada yerinde değişim; tüketim materyalleri (batarya vb.) bilgilendirmesi yapılır.</li>
                                    <li><strong>Gizlilik:</strong> Sağlık verileri güvenle saklanır; üçüncü taraflarla paylaşılmaz.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* Tercüman / Destek */}
                    <Section id="tercuman" title="İşaret Dili Tercüman / Yazı Desteği / Sesli Betimleme">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <form onSubmit={submitTercuman} className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Talep Bilgileri</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <select className="rounded-lg border px-3 py-2" value={tercuman.tur} onChange={(e) => setTercuman((s) => ({ ...s, tur: e.target.value as DestekTuru }))}>
                                        <option value="isaret-dili-tercuman">İşaret Dili Tercüman</option>
                                        <option value="yazi-destek">Yazı Desteği (Canlı Not Alma)</option>
                                        <option value="sesli-betimleme">Sesli Betimleme</option>
                                    </select>
                                    <input className="rounded-lg border px-3 py-2" placeholder="Kurum/Etkinlik (ops.)" value={tercuman.kurum || ""} onChange={(e) => setTercuman((s) => ({ ...s, kurum: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" type="date" value={tercuman.tarihISO} onChange={(e) => setTercuman((s) => ({ ...s, tarihISO: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" type="time" value={tercuman.saat} onChange={(e) => setTercuman((s) => ({ ...s, saat: e.target.value }))} />
                                </div>
                                <input className="mt-2 w-full rounded-lg border px-3 py-2" placeholder="Yer / Adres" value={tercuman.yer} onChange={(e) => setTercuman((s) => ({ ...s, yer: e.target.value }))} />
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ad Soyad" value={tercuman.adSoyad} onChange={(e) => setTercuman((s) => ({ ...s, adSoyad: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="İletişim" value={tercuman.iletisim} onChange={(e) => setTercuman((s) => ({ ...s, iletisim: e.target.value }))} />
                                </div>
                                <textarea className="mt-2 min-h-[70px] w-full rounded-lg border px-3 py-2" placeholder="Açıklama (içerik, tahmini süre vb.)" value={tercuman.aciklama || ""} onChange={(e) => setTercuman((s) => ({ ...s, aciklama: e.target.value }))} />
                                <div className="mt-3">
                                    <button className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95" type="submit">Talep Oluştur</button>
                                </div>
                            </form>

                            <Callout title="Nasıl çalışır? – Erişim Desteği" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><strong>Gerekli bilgiler:</strong> Talep türü, yer-tarih-saat, iletişim.</li>
                                    <li><strong>Ne veriyoruz:</strong> Uygun personel eşleşmesi ve teyit.</li>
                                    <li><strong>Süre:</strong> Etkinliğe göre planlanır; aynı gün taleplerde öncelik acil durumlara verilir.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* Erişilebilirlik bildirimi */}
                    <Section id="erisim" title="Erişilebilirlik Bildir – Fotoğraf + Konum">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <form onSubmit={submitErisim} className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Bildiriminiz</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <select className="rounded-lg border px-3 py-2" value={erisim.kategori} onChange={(e) => setErisim((s) => ({ ...s, kategori: e.target.value as BildirimKategori }))}>
                                        <option value="kaldirim">Kaldırım / Rampasızlık</option>
                                        <option value="rampa">Rampa Eğim / Engeli</option>
                                        <option value="otobus-duragi">Otobüs Durağı / Platform</option>
                                        <option value="asansor">Asansör / Arıza</option>
                                        <option value="yaya-gecidi">Yaya Geçidi / Sesli Sinyal</option>
                                        <option value="park-alani">Engelli Park Yeri</option>
                                        <option value="web-sayfasi">Web Sitesi Erişilebilirliği</option>
                                        <option value="diğer">Diğer</option>
                                    </select>
                                    <button type="button" onClick={useMyLocation} className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:opacity-95">Konumumu Kullan</button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" type="number" step="0.0001" placeholder="Enlem (lat)" value={erisim.coords?.lat ?? center.lat} onChange={(e) => setErisim((s) => ({ ...s, coords: { ...(s.coords ?? center), lat: parseFloat(e.target.value) } }))} />
                                    <input className="rounded-lg border px-3 py-2" type="number" step="0.0001" placeholder="Boylam (lng)" value={erisim.coords?.lng ?? center.lng} onChange={(e) => setErisim((s) => ({ ...s, coords: { ...(s.coords ?? center), lng: parseFloat(e.target.value) } }))} />
                                </div>
                                <input className="mt-2 w-full rounded-lg border px-3 py-2" placeholder="Adres (opsiyonel)" value={erisim.adres || ""} onChange={(e) => setErisim((s) => ({ ...s, adres: e.target.value }))} />
                                <label className="mt-2 block text-sm text-gray-600">Fotoğraf (opsiyonel)</label>
                                <input className="w-full rounded-lg border px-3 py-2" type="file" accept="image/*" onChange={(e) => toBase64(e.target.files?.[0], (b64) => setErisim((s) => ({ ...s, foto: b64 })))} />
                                {erisim.foto && <img src={erisim.foto} alt="önizleme" className="mt-2 max-h-48 w-full rounded-lg object-cover" />}
                                <textarea className="mt-2 min-h-[80px] w-full rounded-lg border px-3 py-2" placeholder="Sorunu kısaca açıklayın" value={erisim.aciklama} onChange={(e) => setErisim((s) => ({ ...s, aciklama: e.target.value }))} />
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ad Soyad (ops.)" value={erisim.adSoyad || ""} onChange={(e) => setErisim((s) => ({ ...s, adSoyad: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="İletişim (ops.)" value={erisim.iletisim || ""} onChange={(e) => setErisim((s) => ({ ...s, iletisim: e.target.value }))} />
                                </div>
                                <div className="mt-3">
                                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:opacity-95" type="submit">Bildirimi Gönder</button>
                                </div>
                            </form>

                            <div className="overflow-hidden rounded-xl border">
                                <iframe title="Harita" className="h-72 w-full" src={osmEmbed(erisim.coords ?? center)} loading="lazy" />
                            </div>

                            <Callout title="Nasıl çalışır? – Erişilebilirlik Bildir" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><strong>Gerekli bilgiler:</strong> Kısa açıklama ve tercihen fotoğraf + konum.</li>
                                    <li><strong>Ne veriyoruz:</strong> Takip numarası ve çözüm birimi yönlendirmesi.</li>
                                    <li><strong>Süre:</strong> Risk/öncelik durumuna göre; acil engeller için 24 saat içinde ilk temas.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* Kayıtlar / JSON */}
                    <Section id="kayitlar" title="Kayıtlar / JSON">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold">Engelli Taksi</h3>
                                    <ExportMenu 
                    data={taksiList} 
                    filename="engelli-taksi.json"
                    resourceId="engelli_hizmetleri"
                  />
                                </div>
                                {taksiList.length === 0 ? <p className="text-sm text-gray-600">Kayıt yok.</p> :
                                    <ul className="space-y-1 text-sm max-h-48 overflow-auto">{taksiList.map((r) => <li key={r.id} className="rounded border px-2 py-1">{r.tarihISO} {r.saat} – {r.adSoyad}</li>)}</ul>}
                            </div>
                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold">Cihaz Ödünç</h3>
                                    <ExportMenu 
                    data={cihazList} 
                    filename="cihaz-odunc.json"
                    resourceId="engelli_hizmetleri"
                  />
                                </div>
                                {cihazList.length === 0 ? <p className="text-sm text-gray-600">Kayıt yok.</p> :
                                    <ul className="space-y-1 text-sm max-h-48 overflow-auto">{cihazList.map((r) => <li key={r.id} className="rounded border px-2 py-1">{r.cihaz} – {r.adSoyad}</li>)}</ul>}
                            </div>
                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold">Tercüman / Destek</h3>
                                    <ExportMenu 
                    data={tercumanList} 
                    filename="tercuman-talepleri.json"
                    resourceId="engelli_hizmetleri"
                  />
                                </div>
                                {tercumanList.length === 0 ? <p className="text-sm text-gray-600">Kayıt yok.</p> :
                                    <ul className="space-y-1 text-sm max-h-48 overflow-auto">{tercumanList.map((r) => <li key={r.id} className="rounded border px-2 py-1">{r.tarihISO} – {r.tur.replaceAll("-", " ")}</li>)}</ul>}
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl border bg-white p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <h3 className="font-semibold">Erişilebilirlik Bildirimleri</h3>
                                <ExportMenu 
                    data={erisimList} 
                    filename="erisilebilirlik-bildirimleri.json"
                    resourceId="engelli_hizmetleri"
                  />
                            </div>
                            {erisimList.length === 0 ? <p className="text-sm text-gray-600">Kayıt yok.</p> :
                                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {erisimList.map((r) => (
                                        <li key={r.id} className="rounded border p-2 text-sm">
                                            <div className="font-medium">{r.kategori.replaceAll("-", " ")}</div>
                                            <div className="text-gray-600 line-clamp-2">{r.aciklama}</div>
                                            {r.coords && <a className="mt-1 inline-block rounded bg-gray-900 px-2 py-1 text-xs text-white" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${r.coords.lat}&mlon=${r.coords.lng}#map=17/${r.coords.lat}/${r.coords.lng}`}>Haritada Aç</a>}
                                        </li>
                                    ))}
                                </ul>}
                        </div>
                    </Section>

                    {/* SSS – uzun */}
                    <Section id="sss" title="A’dan Z’ye Sık Sorulan Sorular">
                        {[
                            ["Engelli kimlik kartım yok, hizmetlerden yararlanabilir miyim?", "Evet. Hizmete göre beyan yeterli olabilir; cihaz ödünç gibi işlemlerde rapor istenebilir."],
                            ["Randevu onayı nasıl geliyor?", "Taksi/tercüman taleplerinde SMS veya e-posta ile teyit edilir, cihaz teslimlerinde telefon ile aranırsınız."],
                            ["Acil durumda ne yapmalıyım?", "112 acil ve Alo 153'e başvurun; sayfadaki formlar acil olmayan planlı talepler içindir."],
                            ["Refakatçi zorunlu mu?", "Zorunlu değil; fakat güvenlik açısından bazı durumlarda önerilir."],
                            ["Randevumu nasıl iptal ederim?", "Teyit mesajındaki link veya 153 üzerinden iptal/erteleme yapabilirsiniz."],
                            ["Ücret var mı?", "Belediye hizmetleri ücretsizdir. Üçüncü taraf ulaşım/etkinlik ücretleri kullanıcıya aittir."],
                            ["Hangi bölgede hizmet veriyorsunuz?", "İlçe sınırları içinde önceliklendirilir; hastane/okul gibi zorunlu durumlarda ilçe dışına transfer planlanabilir."],
                            ["Cihazları eve kim kuruyor?", "Teknik ekip teslimat sırasında kurulumu yapar ve kullanım eğitimi verir."],
                            ["Cihaz temizliği/kullanımı kime ait?", "Hijyen sorumluluğu kullanıcıdadır; arızada belediye destek verir."],
                            ["Akülü sandalye batarya değişimi olur mu?", "Arıza tespitine göre muadil batarya temini yapılabilir (stok durumuna bağlı)."],
                            ["Tercüman gizlilik kurallarına uyuyor mu?", "Evet. Etik kurallar gereği kişisel veri ve içerikler üçüncü kişilerle paylaşılmaz."],
                            ["Web sitemize erişemiyorum, ne yapmalıyım?", "Erişilebilirlik bildirimi formundan 'web-sayfasi' kategorisini seçerek detay paylaşın."],
                            ["Evimde rampa yok, talep edebilir miyim?", "Ortak alan düzenlemeleri site/kat malikleri ile koordine edilerek değerlendirilir."],
                            ["Engelli park yerine izinsiz park var.", "Erişilebilirlik bildirimi yapın; Zabıta'ya yönlendirilir."],
                            ["Seyahat için refakatçi kartı veriyor musunuz?", "Belediye kartları için başvuru sosyal yardım birimlerimizde alınır; ulusal kartlar Aile ve Sosyal Hizmetler Bakanlığı’na aittir."],
                            ["Okula erişim desteği alabilir miyim?", "Evet, dönemlik planlama yapılabilir. Rehber öğretmen/kayıt bilgileri istenebilir."],
                            ["Hastane randevuma geç kalırsam?", "Sürücüyü arayarak bilgilendirin; uygunluk durumuna göre rota güncellenir."],
                            ["Evcil hayvan kabul ediliyor mu?", "Sağlık ve güvenlik gerekçesiyle standartta yoktur; istisnalar için önceden bildirin."],
                            ["Araçlarınızda yükseltilmiş rampa var mı?", "Evet, tekerlekli sandalye erişimine uygun asansör/rampa bulunur."],
                            ["Görme engelliyim; sesli yönlendirme var mı?", "Tercüman/destek ekibimiz eşlik edebilir; ayrıca sesli betimleme hizmeti sağlıyoruz."],
                            ["İşitme engelliyim; WhatsApp hattı var mı?", "Evet. İletişim bölümündeki mesaj hattından yazabilir veya görüntülü arama planlayabilirsiniz."],
                            ["Talepleri kim önceliklendiriyor?", "Sağlık, eğitim ve güvenlik temelli talepler önceliklendirilir."],
                            ["Randevu saatinden önce araç ne zaman gelir?", "Genellikle 10–15 dakika önce adreste olur."],
                            ["Cihaz iade süresi uzatılabilir mi?", "Stok durumuna göre uzatma yapılabilir; lütfen en az 3 gün önce talep iletin."],
                            ["Erişilebilirlik bildirimimde kişisel bilgimi vermek zorunda mıyım?", "Hayır. İsterseniz anonim bildirim bırakabilirsiniz."],
                            ["Haritada konum hassas değilse?", "Enlem/boylam alanlarından düzeltme yapabilir veya adres yazarak detaylandırabilirsiniz."],
                            ["Başkasına tercüman talep edebilir miyim?", "Evet; fakat etkinliğe katılacak kişinin onayı ve iletişim bilgisi gerekir."],
                            ["Tercüman ulaşımı kim sağlar?", "Personelin ulaşımı belediye tarafından planlanır; kullanıcıdan ücret talep edilmez."],
                            ["Araca binme/indirme sırasında hasar olursa?", "Sürücülerimiz eğitimlidir; olası kazalarda tutanak tutulur ve hızlıca çözülür."],
                            ["Kamu kurumları için yazı istiyorum.", "Talebiniz üzerine resmi yazı/rapor oluşturulabilir (demo)."],
                            ["Başvurularımı nasıl dışa aktarırım?", "Bu sayfadaki Dışa aktarım menüsünden verilerinizi ile alabilirsiniz."],
                            ["Verilerim ne kadar saklanır?", "Yasal zorunluluklar kapsamında makul süre saklanır ve sonra anonimleştirilir."],
                            ["Engelli vergi indirimi bilgilendirmesi alabilir miyim?", "Evet. Sosyal hizmet danışmanımız yönlendirme yapar; randevu alabilirsiniz."],
                        ].map(([q, a], i) => (
                            <details key={i} className="group py-3">
                                <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-emerald-400">
                                    <span className="font-medium">{q}</span>
                                </summary>
                                <div className="prose prose-sm max-w-none py-2 text-gray-700">{a}</div>
                            </details>
                        ))}
                    </Section>

                    {/* İletişim & Haklar */}
                    <Section id="iletisim" title="İletişim & Haklar Rehberi">
                        <p><span className="font-semibold">Engelli Hizmetleri Birimi</span></p>
                        <p>Çağrı Merkezi: 444 0 XXX • Alo 153 • WhatsApp: 5XX XXX XX XX</p>
                        <p>E-posta: <a className="text-emerald-700 underline" href="mailto:engelli@birimajans.bel.tr">engelli@birimajans.bel.tr</a></p>
                        <p>Adres: Belediye Hizmet Binası, [adres]</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Link href="/ucretler-ve-tarifeler" className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95">Ücretler & Tarifeler</Link>
                            <a href="#taksi" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95">Taksi Randevusu</a>
                            <a href="#cihaz" className="rounded-lg bg-violet-600 px-4 py-2 text-white hover:opacity-95">Cihaz Başvurusu</a>
                        </div>

                        <Callout title="Bilgilendirme – Haklarınız" tone="success">
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Toplu taşımada <strong>ücretsiz/indirimli</strong> seyahat kartı başvurularında rehberlik sağlanır.</li>
                                <li>Belediye binalarında <strong>öncelikli sıra</strong> ve erişilebilir danışma noktaları bulunur.</li>
                                <li>Ev içi <strong>basit tadilat/rampa</strong> talepleri teknik uygunluk görülürse desteklenebilir.</li>
                            </ul>
                        </Callout>
                    </Section>
                </main>
            </div>
        </div>
    );
}

