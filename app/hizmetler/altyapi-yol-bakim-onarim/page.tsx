"use client";

import React, { useEffect, useMemo, useState } from "react";
import ExportMenu from "@/components/ExportMenu";
import Link from "next/link";

/* ------------------------ UI helpers ------------------------ */
const Section = ({
    id,
    title,
    children,
}: {
    id: string;
    title: string;
    children: React.ReactNode;
}) => (
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
    return (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${map[tone]}`}>
            {children}
        </span>
    );
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

/* ------------------------ map embed ------------------------ */
type Coords = { lat: number; lng: number };
const DEFAULT_CENTER: Coords = { lat: 40.992, lng: 29.127 }; // Ataşehir civarı (demo)

function osmEmbed(center: Coords) {
    const d = 0.02;
    const left = center.lng - d;
    const right = center.lng + d;
    const top = center.lat + d;
    const bottom = center.lat - d;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;
}

/* ------------------------ Types ------------------------ */
type ArizaTuru =
    | "yol_çukuru"
    | "kaldırım_boşluğu"
    | "izgara_tıkalı"
    | "rögar_kapağı"
    | "trafik_levhası"
    | "şerit_çizgisi"
    | "asfalt_bozuk"
    | "aydınlatma"
    | "diger";

type Oncelik = "düşük" | "orta" | "acil";
type KayitDurum = "alındı" | "sahada" | "tamamlandı";

type ArizaKaydi = {
    id: string;
    tur: ArizaTuru;
    aciliyet: Oncelik;
    aciklama?: string;
    foto?: string; // base64
    adres?: string;
    coords: Coords;
    zamanISO: string; // ISO
    iletisim?: string;
    durum: KayitDurum;
};

type TalepTuru =
    | "asfalt_yama"
    | "kaldırım_tamiri"
    | "bordür"
    | "parke_taşı"
    | "ızgara_temizliği"
    | "yaya_kaplama";

type TopluTalep = {
    id: string;
    mahalle: string;
    caddeSokak: string;
    talep: TalepTuru;
    metrajM?: number;
    gerekce?: string;
    iletisim: string;
    kurum: "Muhtarlık" | "Site Yönetimi" | "STK" | "Diğer";
    durum: "pending" | "planlandı" | "tamamlandı";
    zamanISO: string;
};

type KaziIzin = {
    id: string;
    firma: string;
    vergiNo?: string;
    sorumlu: string;
    iletisim: string;
    adres: string;
    guzergah?: string;
    baslangic: string; // YYYY-MM-DD
    bitis: string; // YYYY-MM-DD
    neden: "altyapı_bakım" | "yeni_hat" | "acil_ariza" | "özel_neden";
    kaldirimMetraj?: number;
    asfaltMetraj?: number;
    geceCalisma: boolean;
    durum: "incelemede" | "onaylandı" | "ret";
};

type KisTalebi = {
    id: string;
    tur: "tuzlama" | "kar_küreme";
    adres: string;
    mahalle: string;
    coords: Coords;
    iletisim?: string;
    aciklama?: string;
    zamanISO: string;
    durum: KayitDurum;
};

type PlanliCalisma = {
    id: string;
    mahalle: string;
    adres: string;
    tur: "asfalt" | "kaldırım" | "kazı" | "temizlik";
    tarih: string; // YYYY-MM-DD
    saat?: string;
    not?: string;
};

/* ------------------------ utils ------------------------ */
const toBase64 = (file?: File, cb?: (b64: string) => void) => {
    if (!file) return cb?.("");
    const reader = new FileReader();
    reader.onload = () => cb?.(reader.result as string);
    reader.readAsDataURL(file);
};

const downloadJSON = (name: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
};

const loadLS = <T,>(k: string, def: T): T => {
    try {
        const s = localStorage.getItem(k);
        return s ? (JSON.parse(s) as T) : def;
    } catch {
        return def;
    }
};
const saveLS = (k: string, v: unknown) => {
    try {
        localStorage.setItem(k, JSON.stringify(v));
    } catch { }
};

/* ------------------------ LS Keys ------------------------ */
const LS_ARIZA = "altyapi-ariza";
const LS_TALEP = "altyapi-toplu-talep";
const LS_KAZI = "altyapi-kazi-izin";
const LS_KIS = "altyapi-kis-talebi";

/* ================================ PAGE ================================ */
export default function AltyapiYolBakimOnarimPage() {
    const yil = new Date().getFullYear();

    const [center, setCenter] = useState<Coords>(DEFAULT_CENTER);
    const useMyLocation = () => {
        if (!("geolocation" in navigator)) return alert("Tarayıcınız konum özelliğini desteklemiyor.");
        navigator.geolocation.getCurrentPosition(
            (p) => setCenter({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => alert("Konum alınamadı.")
        );
    };

    /* ----------- Arıza/Şikâyet ----------- */
    const [kayitlar, setKayitlar] = useState<ArizaKaydi[]>([]);
    useEffect(() => setKayitlar(loadLS<ArizaKaydi[]>(LS_ARIZA, [])), []);

    const [ariza, setAriza] = useState<ArizaKaydi>({
        id: crypto.randomUUID(),
        tur: "yol_çukuru",
        aciliyet: "orta",
        aciklama: "",
        foto: "",
        adres: "",
        coords: center,
        zamanISO: new Date().toISOString().slice(0, 16),
        iletisim: "",
        durum: "alındı",
    });
    useEffect(() => setAriza((s) => ({ ...s, coords: center })), [center]);

    const gonderAriza = (e: React.FormEvent) => {
        e.preventDefault();
        const yeni: ArizaKaydi = { ...ariza, id: crypto.randomUUID() };
        const y = [yeni, ...kayitlar].slice(0, 120);
        setKayitlar(y);
        saveLS(LS_ARIZA, y);
        alert("Kaydınız alınmıştır (demo).");
        setAriza({
            id: crypto.randomUUID(),
            tur: "yol_çukuru",
            aciliyet: "orta",
            aciklama: "",
            foto: "",
            adres: "",
            coords: center,
            zamanISO: new Date().toISOString().slice(0, 16),
            iletisim: "",
            durum: "alındı",
        });
    };

    const [filtre, setFiltre] = useState<{
        q: string;
        tur: "hepsi" | ArizaTuru;
        durum: "hepsi" | KayitDurum;
    }>({ q: "", tur: "hepsi", durum: "hepsi" });

    const listAriza = useMemo(() => {
        return kayitlar.filter((k) => {
            const okTur = filtre.tur === "hepsi" ? true : k.tur === filtre.tur;
            const okDurum = filtre.durum === "hepsi" ? true : k.durum === filtre.durum;
            const okQ = filtre.q
                ? [k.adres, k.aciklama, k.iletisim].filter(Boolean).some((t) => (t as string).toLowerCase().includes(filtre.q.toLowerCase()))
                : true;
            return okTur && okDurum && okQ;
        });
    }, [kayitlar, filtre]);

    /* ----------- Toplu Talep (muhtarlık/site) ----------- */
    const [talepler, setTalepler] = useState<TopluTalep[]>([]);
    useEffect(() => setTalepler(loadLS<TopluTalep[]>(LS_TALEP, [])), []);
    const [talep, setTalep] = useState<TopluTalep>({
        id: crypto.randomUUID(),
        mahalle: "",
        caddeSokak: "",
        talep: "asfalt_yama",
        metrajM: 0,
        gerekce: "",
        iletisim: "",
        kurum: "Muhtarlık",
        durum: "pending",
        zamanISO: new Date().toISOString(),
    });
    const gonderTalep = (e: React.FormEvent) => {
        e.preventDefault();
        if (!talep.mahalle || !talep.caddeSokak || !talep.iletisim) return alert("Zorunlu alanları doldurun.");
        const rec: TopluTalep = { ...talep, id: crypto.randomUUID() };
        const y = [rec, ...talepler].slice(0, 80);
        setTalepler(y);
        saveLS(LS_TALEP, y);
        alert("Talebiniz kaydedildi (demo).");
        setTalep({
            id: crypto.randomUUID(),
            mahalle: "",
            caddeSokak: "",
            talep: "asfalt_yama",
            metrajM: 0,
            gerekce: "",
            iletisim: "",
            kurum: "Muhtarlık",
            durum: "pending",
            zamanISO: new Date().toISOString(),
        });
    };

    /* ----------- Kazı/Çalışma İzni (demo) ----------- */
    const [izinler, setIzinler] = useState<KaziIzin[]>([]);
    useEffect(() => setIzinler(loadLS<KaziIzin[]>(LS_KAZI, [])), []);
    const [izin, setIzin] = useState<KaziIzin>({
        id: crypto.randomUUID(),
        firma: "",
        vergiNo: "",
        sorumlu: "",
        iletisim: "",
        adres: "",
        guzergah: "",
        baslangic: new Date().toISOString().slice(0, 10),
        bitis: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        neden: "altyapı_bakım",
        kaldirimMetraj: 0,
        asfaltMetraj: 0,
        geceCalisma: false,
        durum: "incelemede",
    });
    const gonderIzin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!izin.firma || !izin.sorumlu || !izin.iletisim || !izin.adres) return alert("Zorunlu alanları doldurun.");
        const rec: KaziIzin = { ...izin, id: crypto.randomUUID(), durum: "incelemede" };
        const y = [rec, ...izinler].slice(0, 80);
        setIzinler(y);
        saveLS(LS_KAZI, y);
        alert("Başvurunuz incelemeye alındı (demo).");
        setIzin({
            id: crypto.randomUUID(),
            firma: "",
            vergiNo: "",
            sorumlu: "",
            iletisim: "",
            adres: "",
            guzergah: "",
            baslangic: new Date().toISOString().slice(0, 10),
            bitis: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
            neden: "altyapı_bakım",
            kaldirimMetraj: 0,
            asfaltMetraj: 0,
            geceCalisma: false,
            durum: "incelemede",
        });
    };

    /* ----------- Kış Hizmetleri ----------- */
    const [kislar, setKislar] = useState<KisTalebi[]>([]);
    useEffect(() => setKislar(loadLS<KisTalebi[]>(LS_KIS, [])), []);
    const [kis, setKis] = useState<KisTalebi>({
        id: crypto.randomUUID(),
        tur: "tuzlama",
        adres: "",
        mahalle: "",
        coords: center,
        iletisim: "",
        aciklama: "",
        zamanISO: new Date().toISOString().slice(0, 16),
        durum: "alındı",
    });
    useEffect(() => setKis((s) => ({ ...s, coords: center })), [center]);
    const gonderKis = (e: React.FormEvent) => {
        e.preventDefault();
        if (!kis.adres || !kis.mahalle) return alert("Adres ve mahalle zorunludur.");
        const rec: KisTalebi = { ...kis, id: crypto.randomUUID() };
        const y = [rec, ...kislar].slice(0, 120);
        setKislar(y);
        saveLS(LS_KIS, y);
        alert("Talebiniz alınmıştır (demo).");
        setKis({
            id: crypto.randomUUID(),
            tur: "tuzlama",
            adres: "",
            mahalle: "",
            coords: center,
            iletisim: "",
            aciklama: "",
            zamanISO: new Date().toISOString().slice(0, 16),
            durum: "alındı",
        });
    };

    /* ----------- Planlı Çalışmalar (seed demo) ----------- */
    const planli: PlanliCalisma[] = [
        { id: "p1", mahalle: "İçerenköy", adres: "A Mah. B Cad. 12-34 arası", tur: "asfalt", tarih: new Date(Date.now() + 86400000).toISOString().slice(0, 10), saat: "09:00-17:00", not: "Yol tek şerit açık" },
        { id: "p2", mahalle: "Ataşehir", adres: "Barbaros Mah. X Sk.", tur: "kaldırım", tarih: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10) },
        { id: "p3", mahalle: "Kayışdağı", adres: "Yolu Sk. 5-15", tur: "kazı", tarih: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), not: "Kazı ruhsatlı çalışma" },
    ];
    const [plFiltre, setPlFiltre] = useState<{ mahalle: string; tarih: string }>({
        mahalle: "",
        tarih: "",
    });
    const listPlanli = useMemo(() => {
        return planli.filter((p) => {
            const okM = plFiltre.mahalle ? p.mahalle.toLowerCase().includes(plFiltre.mahalle.toLowerCase()) : true;
            const okT = plFiltre.tarih ? p.tarih === plFiltre.tarih : true;
            return okM && okT;
        });
    }, [plFiltre]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-amber-50 via-white to-emerald-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Altyapı, Yol Bakım Onarım Hizmetleri</h1>
                        <p className="mt-3 text-gray-700">
                            <strong>Arıza/şikâyet bildirimi</strong>, mahalle toplu talep, <strong>kazı/çalışma izni</strong> (demo),
                            <strong> kış hizmetleri</strong> ve <strong>planlı çalışmalar</strong> bu sayfada.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="info">Konum + Foto</Badge>
                            <Badge tone="success">JSON Dışa Aktarım</Badge>
                            <Badge tone="warning">Vatandaş Odaklı</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1529078155058-5d716f45d604?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* mini stats */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🕑</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">24 saat</div>
                        <div className="text-sm text-gray-600">İlk geri dönüş hedefi (demo)</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🛣️</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">Önceliklendirme</div>
                        <div className="text-sm text-gray-600">Acil/yoğun hatlara göre</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>📍</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">{yil}</div>
                        <div className="text-sm text-gray-600">Konum destekli kayıt</div>
                    </div>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["ariza", "Arıza / Şikâyet Bildir"],
                            ["toplu", "Mahalle Toplu Talep"],
                            ["kazi", "Kazı / Çalışma İzni (demo)"],
                            ["kis", "Kış Hizmetleri Talebi"],
                            ["planli", "Planlı Çalışmalar"],
                            ["kayit", "Kayıtlar / JSON"],
                            ["sss", "A’dan Z’ye SSS"],
                            ["iletisim", "İletişim"],
                        ].map(([id, label]) => (
                            <li key={id}>
                                <a
                                    href={`#${id}`}
                                    className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* CONTENT */}
                <main className="space-y-10">
                    {/* Arıza / Şikâyet */}
                    <Section id="ariza" title="Arıza / Şikâyet Bildir (Konum + Foto)">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <form onSubmit={gonderAriza} className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={ariza.tur}
                                        onChange={(e) => setAriza((s) => ({ ...s, tur: e.target.value as ArizaTuru }))}
                                    >
                                        <option value="yol_çukuru">Yol çukuru/bozulma</option>
                                        <option value="kaldırım_boşluğu">Kaldırım boşluğu/hasar</option>
                                        <option value="izgara_tıkalı">Yağmur suyu ızgarası tıkalı</option>
                                        <option value="rögar_kapağı">Rögar kapağı hasarlı/yok</option>
                                        <option value="trafik_levhası">Trafik levhası hasarlı</option>
                                        <option value="şerit_çizgisi">Şerit çizgisi silik</option>
                                        <option value="asfalt_bozuk">Asfalt kabarma/bozulma</option>
                                        <option value="aydınlatma">Aydınlatma arızası</option>
                                        <option value="diger">Diğer</option>
                                    </select>
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={ariza.aciliyet}
                                        onChange={(e) => setAriza((s) => ({ ...s, aciliyet: e.target.value as Oncelik }))}
                                    >
                                        <option value="düşük">Düşük</option>
                                        <option value="orta">Orta</option>
                                        <option value="acil">Acil (can/mal riski)</option>
                                    </select>
                                </div>

                                <input
                                    className="mt-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="Adres (opsiyonel; konum paylaşılabilir)"
                                    value={ariza.adres || ""}
                                    onChange={(e) => setAriza((s) => ({ ...s, adres: e.target.value }))}
                                />

                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="datetime-local"
                                        value={ariza.zamanISO}
                                        onChange={(e) => setAriza((s) => ({ ...s, zamanISO: e.target.value }))}
                                    />
                                    <button
                                        type="button"
                                        onClick={useMyLocation}
                                        className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:opacity-95"
                                    >
                                        Konumumu Kullan
                                    </button>
                                </div>

                                <textarea
                                    className="mt-2 min-h-[80px] w-full rounded-lg border px-3 py-2"
                                    placeholder="Kısa açıklama (trafik riski, boyut vb.)"
                                    value={ariza.aciklama || ""}
                                    onChange={(e) => setAriza((s) => ({ ...s, aciklama: e.target.value }))}
                                />

                                <label className="mt-2 block text-sm text-gray-600">Fotoğraf (opsiyonel)</label>
                                <input
                                    className="w-full rounded-lg border px-3 py-2"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => toBase64(e.target.files?.[0], (b64) => setAriza((s) => ({ ...s, foto: b64 })))}
                                />
                                {ariza.foto && (
                                    <img src={ariza.foto} alt="önizleme" className="mt-2 max-h-48 w-full rounded-lg object-cover" />
                                )}

                                <label className="mt-2 block text-sm text-gray-600">İletişim (opsiyonel)</label>
                                <input
                                    className="w-full rounded-lg border px-3 py-2"
                                    placeholder="Telefon / e-posta"
                                    value={ariza.iletisim || ""}
                                    onChange={(e) => setAriza((s) => ({ ...s, iletisim: e.target.value }))}
                                />

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                        Bildirimi Gönder
                                    </button>
                                    <a className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95" href="tel:153">
                                        Alo 153
                                    </a>
                                </div>
                            </form>

                            <div className="space-y-4">
                                <div className="overflow-hidden rounded-xl border">
                                    <iframe title="Harita" className="h-72 w-full" src={osmEmbed(center)} loading="lazy" />
                                </div>

                                <div className="rounded-xl border bg-white p-4">
                                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="font-semibold">Kayıtlar (demo)</h3>
                                        <div className="flex items-center gap-2">
                                            <input
                                                className="rounded-lg border px-3 py-2"
                                                placeholder="Ara (adres/açıklama)"
                                                value={filtre.q}
                                                onChange={(e) => setFiltre((f) => ({ ...f, q: e.target.value }))}
                                            />
                                            <select
                                                className="rounded-lg border px-3 py-2"
                                                value={filtre.tur}
                                                onChange={(e) => setFiltre((f) => ({ ...f, tur: e.target.value as any }))}
                                            >
                                                <option value="hepsi">Hepsi</option>
                                                <option value="yol_çukuru">Yol çukuru</option>
                                                <option value="kaldırım_boşluğu">Kaldırım</option>
                                                <option value="izgara_tıkalı">Izgara</option>
                                                <option value="rögar_kapağı">Rögar</option>
                                                <option value="trafik_levhası">Levha</option>
                                                <option value="şerit_çizgisi">Çizgi</option>
                                                <option value="asfalt_bozuk">Asfalt</option>
                                                <option value="aydınlatma">Aydınlatma</option>
                                                <option value="diger">Diğer</option>
                                            </select>
                                            <select
                                                className="rounded-lg border px-3 py-2"
                                                value={filtre.durum}
                                                onChange={(e) => setFiltre((f) => ({ ...f, durum: e.target.value as any }))}
                                            >
                                                <option value="hepsi">Durum (hepsi)</option>
                                                <option value="alındı">Alındı</option>
                                                <option value="sahada">Sahada</option>
                                                <option value="tamamlandı">Tamamlandı</option>
                                            </select>
                                        </div>
                                    </div>

                                    {listAriza.length === 0 ? (
                                        <p className="text-sm text-gray-600">Kayıt yok.</p>
                                    ) : (
                                        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {listAriza.map((k) => (
                                                <li key={k.id} className="rounded-xl border bg-white p-3 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-semibold capitalize">
                                                            {k.tur.replace("_", " ").replace("_", " ")}
                                                        </div>
                                                        <Badge
                                                            tone={
                                                                k.durum === "tamamlandı" ? "success" : k.durum === "sahada" ? "info" : "warning"
                                                            }
                                                        >
                                                            {k.durum}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-gray-700">{k.adres || `${k.coords.lat.toFixed(4)}, ${k.coords.lng.toFixed(4)}`}</div>
                                                    <div className="text-xs text-gray-500">{new Date(k.zamanISO).toLocaleString()}</div>
                                                    {k.aciklama && <div className="mt-1">{k.aciklama}</div>}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Callout title="Nasıl çalışır? – Arıza/Şikâyet Bildir" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Gerekli bilgiler:</span> Arıza türü, aciliyet, konum veya adres, isteğe bağlı foto ve iletişim.</li>
                                <li><span className="font-semibold">Ne veriyoruz:</span> Kaydınız oluşturulur, birimimize iletilir. Durum “alındı → sahada → tamamlandı” akışıyla takip edilir (demo).</li>
                                <li><span className="font-semibold">Konum:</span> “Konumumu Kullan” ile nokta kaydı yaparsınız; ekip yönlendirmesi hızlanır.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* Toplu Talep */}
                    <Section id="toplu" title="Mahalle Toplu Talep (Muhtarlık/Site)">
                        <div className="grid gap-4 md:grid-cols-2">
                            <form onSubmit={gonderTalep} className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Mahalle"
                                        value={talep.mahalle}
                                        onChange={(e) => setTalep((s) => ({ ...s, mahalle: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Cadde/Sokak"
                                        value={talep.caddeSokak}
                                        onChange={(e) => setTalep((s) => ({ ...s, caddeSokak: e.target.value }))}
                                    />
                                </div>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={talep.talep}
                                        onChange={(e) => setTalep((s) => ({ ...s, talep: e.target.value as TalepTuru }))}
                                    >
                                        <option value="asfalt_yama">Asfalt yama</option>
                                        <option value="kaldırım_tamiri">Kaldırım tamiri</option>
                                        <option value="bordür">Bordür</option>
                                        <option value="parke_taşı">Parke taşı</option>
                                        <option value="ızgara_temizliği">Izgara temizliği</option>
                                        <option value="yaya_kaplama">Yaya kaplama</option>
                                    </select>
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="number"
                                        min={0}
                                        placeholder="Metraj (m)"
                                        value={talep.metrajM || ""}
                                        onChange={(e) => setTalep((s) => ({ ...s, metrajM: parseInt(e.target.value || "0") }))}
                                    />
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={talep.kurum}
                                        onChange={(e) => setTalep((s) => ({ ...s, kurum: e.target.value as TopluTalep["kurum"] }))}
                                    >
                                        <option>Muhtarlık</option>
                                        <option>Site Yönetimi</option>
                                        <option>STK</option>
                                        <option>Diğer</option>
                                    </select>
                                </div>
                                <textarea
                                    className="mt-2 min-h-[70px] w-full rounded-lg border px-3 py-2"
                                    placeholder="Gerekçe/Açıklama"
                                    value={talep.gerekce || ""}
                                    onChange={(e) => setTalep((s) => ({ ...s, gerekce: e.target.value }))}
                                />
                                <label className="mt-2 block text-sm text-gray-600">İletişim</label>
                                <input
                                    className="w-full rounded-lg border px-3 py-2"
                                    placeholder="Telefon/e-posta"
                                    value={talep.iletisim}
                                    onChange={(e) => setTalep((s) => ({ ...s, iletisim: e.target.value }))}
                                />
                                <div className="mt-3">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                        Talebi Gönder
                                    </button>
                                </div>
                            </form>

                            <Callout title="Nasıl çalışır? – Mahalle Toplu Talep" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-semibold">Gerekli bilgiler:</span> Mahalle, cadde/sokak, talep türü, metraj (varsa), iletişim.</li>
                                    <li><span className="font-semibold">Ne veriyoruz:</span> Talebiniz planlama listesine eklenir; durum “pending → planlandı → tamamlandı” akışında izlenir (demo).</li>
                                    <li>Bu modül özellikle <span className="font-semibold">muhtarlık/site yönetimleri</span> için tasarlanmıştır.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* Kazı İzni */}
                    <Section id="kazi" title="Kazı / Geçici Çalışma İzni Başvurusu (demo)">
                        <div className="grid gap-4 md:grid-cols-2">
                            <form onSubmit={gonderIzin} className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Firma / Kurum"
                                        value={izin.firma}
                                        onChange={(e) => setIzin((s) => ({ ...s, firma: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Vergi No (ops.)"
                                        value={izin.vergiNo || ""}
                                        onChange={(e) => setIzin((s) => ({ ...s, vergiNo: e.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Sorumlu"
                                        value={izin.sorumlu}
                                        onChange={(e) => setIzin((s) => ({ ...s, sorumlu: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="İletişim"
                                        value={izin.iletisim}
                                        onChange={(e) => setIzin((s) => ({ ...s, iletisim: e.target.value }))}
                                    />
                                </div>
                                <input
                                    className="mt-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="Adres"
                                    value={izin.adres}
                                    onChange={(e) => setIzin((s) => ({ ...s, adres: e.target.value }))}
                                />
                                <input
                                    className="mt-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="Güzergâh/Plan açıklaması (ops.)"
                                    value={izin.guzergah || ""}
                                    onChange={(e) => setIzin((s) => ({ ...s, guzergah: e.target.value }))}
                                />
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="date"
                                        value={izin.baslangic}
                                        onChange={(e) => setIzin((s) => ({ ...s, baslangic: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="date"
                                        value={izin.bitis}
                                        onChange={(e) => setIzin((s) => ({ ...s, bitis: e.target.value }))}
                                    />
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={izin.neden}
                                        onChange={(e) => setIzin((s) => ({ ...s, neden: e.target.value as KaziIzin["neden"] }))}
                                    >
                                        <option value="altyapı_bakım">Altyapı bakım</option>
                                        <option value="yeni_hat">Yeni altyapı hattı</option>
                                        <option value="acil_ariza">Acil arıza</option>
                                        <option value="özel_neden">Özel neden</option>
                                    </select>
                                </div>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="number"
                                        min={0}
                                        placeholder="Kaldırım (m)"
                                        value={izin.kaldirimMetraj || ""}
                                        onChange={(e) => setIzin((s) => ({ ...s, kaldirimMetraj: parseInt(e.target.value || "0") }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="number"
                                        min={0}
                                        placeholder="Asfalt (m)"
                                        value={izin.asfaltMetraj || ""}
                                        onChange={(e) => setIzin((s) => ({ ...s, asfaltMetraj: parseInt(e.target.value || "0") }))}
                                    />
                                    <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={izin.geceCalisma}
                                            onChange={(e) => setIzin((s) => ({ ...s, geceCalisma: e.target.checked }))}
                                        />
                                        Gece çalışması var
                                    </label>
                                </div>
                                <div className="mt-3">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                        Başvuruyu Gönder
                                    </button>
                                </div>
                            </form>

                            <Callout title="Nasıl çalışır? – Kazı/Geçici Çalışma İzni" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-semibold">Gerekli bilgiler:</span> Firma, sorumlu, iletişim, adres, tarih aralığı, işin nedeni, etkilenecek metrajlar.</li>
                                    <li><span className="font-semibold">Ne veriyoruz:</span> Başvuru kaydı “incelemede” durumuyla oluşturulur; resmi süreçte trafik planı, kesit detayları gibi ek belgeler istenir (demo).</li>
                                    <li>Gece çalışması planı varsa <span className="font-semibold">gürültü yönetimi</span> ve komşu bilgilendirmesi gerekebilir.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* Kış Hizmetleri */}
                    <Section id="kis" title="Kış Hizmetleri Talebi (Tuzlama / Kar Küreme)">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <form onSubmit={gonderKis} className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={kis.tur}
                                        onChange={(e) => setKis((s) => ({ ...s, tur: e.target.value as KisTalebi["tur"] }))}
                                    >
                                        <option value="tuzlama">Tuzlama</option>
                                        <option value="kar_küreme">Kar küreme</option>
                                    </select>
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Mahalle"
                                        value={kis.mahalle}
                                        onChange={(e) => setKis((s) => ({ ...s, mahalle: e.target.value }))}
                                    />
                                </div>
                                <input
                                    className="mt-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="Adres"
                                    value={kis.adres}
                                    onChange={(e) => setKis((s) => ({ ...s, adres: e.target.value }))}
                                />
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="datetime-local"
                                        value={kis.zamanISO}
                                        onChange={(e) => setKis((s) => ({ ...s, zamanISO: e.target.value }))}
                                    />
                                    <button
                                        className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:opacity-95"
                                        type="button"
                                        onClick={useMyLocation}
                                    >
                                        Konumumu Kullan
                                    </button>
                                </div>
                                <input
                                    className="mt-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="İletişim (ops.)"
                                    value={kis.iletisim || ""}
                                    onChange={(e) => setKis((s) => ({ ...s, iletisim: e.target.value }))}
                                />
                                <textarea
                                    className="mt-2 min-h-[70px] w-full rounded-lg border px-3 py-2"
                                    placeholder="Açıklama (ops.)"
                                    value={kis.aciklama || ""}
                                    onChange={(e) => setKis((s) => ({ ...s, aciklama: e.target.value }))}
                                />
                                <div className="mt-3">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                        Talep Gönder
                                    </button>
                                </div>
                            </form>

                            <Callout title="Nasıl çalışır? – Kış Hizmetleri" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-semibold">Gerekli bilgiler:</span> Mahalle, adres, talep türü (tuzlama/kar küreme); isterseniz iletişim ve konum.</li>
                                    <li><span className="font-semibold">Ne veriyoruz:</span> Kayıt sonrası ekip programına alınır; kritik rampalar ve ana arterler önceliklidir.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* Planlı Çalışmalar */}
                    <Section id="planli" title="Planlı Çalışmalar (Duyuru)">
                        <div className="rounded-xl border bg-white p-4">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    placeholder="Mahalle ara"
                                    value={plFiltre.mahalle}
                                    onChange={(e) => setPlFiltre((s) => ({ ...s, mahalle: e.target.value }))}
                                />
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    type="date"
                                    value={plFiltre.tarih}
                                    onChange={(e) => setPlFiltre((s) => ({ ...s, tarih: e.target.value }))}
                                />
                            </div>
                            {listPlanli.length === 0 ? (
                                <p className="text-sm text-gray-600">Planlı duyuru bulunamadı.</p>
                            ) : (
                                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {listPlanli.map((p) => (
                                        <li key={p.id} className="rounded-xl border p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="font-semibold capitalize">{p.tur}</div>
                                                <Badge tone="info">{p.tarih}</Badge>
                                            </div>
                                            <div className="text-sm text-gray-700">{p.mahalle} – {p.adres}</div>
                                            {p.saat && <div className="text-xs text-gray-500">Saat: {p.saat}</div>}
                                            {p.not && <div className="mt-1 text-sm">{p.not}</div>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <Callout title="Nasıl çalışır? – Planlı Çalışmalar" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Bu bölüm bilgilendirme amaçlıdır; demo amaçlı birkaç kayıt ön yüklüdür.</li>
                                <li>Filtrelerle mahalle ve tarih seçerek planlanan işleri görebilirsiniz.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* Kayıtlar / JSON */}
                    <Section id="kayit" title="Kayıtlar / JSON">
                        <div className="grid gap-3 md:grid-cols-4">
                            <div className="rounded-xl border bg-white p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="font-semibold">Arıza/Şikâyet</div>
                                    <ExportMenu 
                    data={kayitlar} 
                    filename="ariza-kayitlari.json"
                    resourceId="altyapi_yol_bakim_onarim"
                  />
                                </div>
                                <div className="text-sm text-gray-600">{kayitlar.length ? `${kayitlar.length} kayıt` : "Kayıt yok."}</div>
                            </div>

                            <div className="rounded-xl border bg-white p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="font-semibold">Toplu Talepler</div>
                                    <ExportMenu 
                    data={talepler} 
                    filename="toplu-talepler.json"
                    resourceId="altyapi_yol_bakim_onarim"
                  />
                                </div>
                                <div className="text-sm text-gray-600">{talepler.length ? `${talepler.length} kayıt` : "Kayıt yok."}</div>
                            </div>

                            <div className="rounded-xl border bg-white p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="font-semibold">Kazı/İzin Başvuruları</div>
                                    <ExportMenu 
                    data={izinler} 
                    filename="kazi-izin-basvurulari.json"
                    resourceId="altyapi_yol_bakim_onarim"
                  />
                                </div>
                                <div className="text-sm text-gray-600">{izinler.length ? `${izinler.length} kayıt` : "Kayıt yok."}</div>
                            </div>

                            <div className="rounded-xl border bg-white p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="font-semibold">Kış Hizmetleri</div>
                                    <ExportMenu 
                    data={kislar} 
                    filename="kis-hizmetleri.json"
                    resourceId="altyapi_yol_bakim_onarim"
                  />
                                </div>
                                <div className="text-sm text-gray-600">{kislar.length ? `${kislar.length} kayıt` : "Kayıt yok."}</div>
                            </div>
                        </div>
                    </Section>

                    {/* SSS */}
                    <Section id="sss" title="A’dan Z’ye Sık Sorulan Sorular">
                        {[
                            ["Yol çukuru gördüm, önce kimi aramalıyım?", "Alo 153'e bildirebilir veya bu sayfadan kayıt açabilirsiniz. Trafik riski varsa 112'yi de bilgilendirin."],
                            ["Acil kayıtlara öncelik veriliyor mu?", "Evet. 'Acil' seçili kayıtlar can/mal güvenliği riski nedeniyle önceliklendirilir."],
                            ["Konum paylaşmak zorunlu mu?", "Zorunlu değil ancak müdahale süresini kısaltır."],
                            ["Fotoğraf yüklemek şart mı?", "Hayır; ama fotoğraf ekiplerin hazırlığını kolaylaştırır."],
                            ["Arızam ne kadar sürede yapılır?", "Yoğunluk ve hava durumuna göre değişir. Hedef: ilk geri dönüş 24 saat (demo)."],
                            ["Toplu talepte kimler başvurabilir?", "Muhtarlıklar, site yönetimleri, STK'lar veya yerel temsilciler."],
                            ["Metraj vermek zorunlu mu?", "Hayır; yaklaşık metraj planlamayı hızlandırır."],
                            ["Kazı izni gerçek süreçte nasıl işliyor?", "Trafik planı, kesit detayları ve harç yatırımı gerekir. Demo modül yalnızca kayıt oluşturur."],
                            ["Gece çalışması her zaman serbest mi?", "Hayır. Gürültü ve güvenlik şartlarına bağlıdır; bazı bölgelerde izin gerekebilir."],
                            ["Kış hizmetlerinde öncelik nasıl belirleniyor?", "Eğimli yollar, hastane/okul çevresi ve ana arterler önceliklidir."],
                            ["Aydınlatma arızaları belediyeye mi ait?", "Ana arter ve park aydınlatmaları belediyeye; bazı direkler enerji dağıtım şirketine aittir."],
                            ["Şerit çizgisi silik; belediye mi yeniler?", "Evet, ilçe sınırlarındaki yerel yollar belediye sorumluluğundadır (büyükşehir paylaşımları hariç)."],
                            ["Rögar kapağı yok/çökmüş; kime aittir?", "Yağmur suyu ızgaraları belediye, kanalizasyon rögarı ise genelde su/kanal idaresine aittir."],
                            ["Izgara tıkalı; evimi su basar diye korkuyorum, ne yapayım?", "Acil risk varsa 112 ve Alo 153; ayrıca bu sayfadan 'izgara tıkalı' kaydı açın."],
                            ["Talebimin durumunu buradan görebilir miyim?", "Bu demo sürümünde durum kartta tutulur. Gerçek sistemde SMS/e-posta bilgilendirmesi yapılır."],
                            ["Aynı arıza için birden çok kişi kayıt açarsa?", "Kayıtlar birleştirilebilir; yoğunluk analizinde yararlı olur."],
                            ["Kazı sonrası kapama kim tarafından yapılır?", "Ruhsat koşullarına göre kazıyı yapan kurum tarafından, belediye gözetiminde yapılır."],
                            ["Geçici yol kapama yapılacak; nasıl duyurulur?", "Planlı çalışmalar bölümünde ve muhtarlık/ÇAĞRI merkezi kanalıyla duyurulur."],
                            ["Kaldırım düzenlemesinde engelli erişimi zorunlu mu?", "Evet. Rampalar ve kılavuz yüzeyler standartlara uygun olmalıdır."],
                            ["Parke taşı yerine asfalt talep edebilir miyim?", "Yol bütünlüğü ve altyapı durumuna göre teknik birim karar verir."],
                            ["Sahada çalışan ekip ne gibi güvenlik önlemi alır?", "Uyarı levhaları, bariyerleme, reflektif ekipman ve gerektiğinde trafik yönlendirme ekibi."],
                            ["Çöp/dolgu malzemesi talep edebilir miyim?", "Kamusal malzeme talep edilemez; sadece bakım-onarım kapsamında işlem yapılır."],
                            ["Kayıt nasıl silinir?", "Bu demo sayfada kayıtlar tarayıcı belleğinizdedir; tarayıcı verilerini temizleyerek silebilirsiniz."],
                            ["Verilerim nasıl saklanıyor?", "Gerçek sistemde KVKK'ya uygun yönetilir; burada yalnızca cihazınızda (localStorage) tutulur."],
                            ["Bu sayfa bot entegrasyonu için uygun mu?", "Evet; JSON indirme ile dış sistemler kolayca beslenebilir."],
                        ].map(([q, a], i) => (
                            <details key={i} className="group py-3">
                                <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-emerald-400">
                                    <span className="font-medium">{q}</span>
                                </summary>
                                <div className="prose prose-sm max-w-none py-2 text-gray-700">{a}</div>
                            </details>
                        ))}
                    </Section>

                    {/* İletişim */}
                    <Section id="iletisim" title="İletişim">
                        <p><span className="font-semibold">Fen İşleri / Yol Bakım ve Altyapı Müdürlüğü</span></p>
                        <p>Alo 153 • Çağrı Merkezi: 444 0 XXX</p>
                        <p>E-posta: <a className="text-emerald-700 underline" href="mailto:altyapi@birimajans.bel.tr">altyapi@birimajans.bel.tr</a></p>
                        <p>Adres: Belediye Hizmet Binası, [adres]</p>
                        <div className="mt-3 flex gap-2">
                            <Link href="/ucretler-ve-tarifeler" className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95">Ücretler ve Tarifeler</Link>
                            <a href="#ariza" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95">Arıza Bildir</a>
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
}
