"use client";

import React, { useEffect, useMemo, useState } from "react";
import ExportMenu from "@/components/ExportMenu";
import Link from "next/link";

/* ------------------------- UI helpers ------------------------- */
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

/* ------------------------- Small map embed ------------------------- */
type Coords = { lat: number; lng: number };
const DEFAULT_CENTER: Coords = { lat: 41.02, lng: 29.11 }; // Ataşehir civarı (demo)

function osmEmbed(center: Coords) {
    const d = 0.02;
    const left = center.lng - d;
    const right = center.lng + d;
    const top = center.lat + d;
    const bottom = center.lat - d;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;
}

/* ------------------------- Types ------------------------- */
// — Asansör Muayene Randevusu
type AsansorRandevu = {
    id: string;
    bina: string;
    adres: string;
    blok?: string;
    asansorSayisi: number;
    tarihISO: string; // YYYY-MM-DD
    saat: string; // HH:mm
    yetkili: string;
    iletisim: string; // telefon veya e-posta
    kurulus: "A Tipi Muayene Kuruluşu (Demo-1)" | "A Tipi Muayene Kuruluşu (Demo-2)";
    not?: string;
    coords?: Coords;
};

// — Şantiye/Yapı Denetim Talebi
type TalepTuru =
    | "Temel/Kalıp-Demir"
    | "Beton Dökümü"
    | "Temel Üstü Vizesi"
    | "Ruhsat Projesi Uygunluk"
    | "Yıkım Denetimi"
    | "İskan Öncesi Kontrol";

type YapiDenetimTalep = {
    id: string;
    ruhsatNo: string;
    ada?: string;
    parsel?: string;
    talep: TalepTuru;
    tarihISO: string;
    saat: string;
    yetkili: string;
    iletisim: string;
    adres: string;
    coords?: Coords;
    not?: string;
};

// — Asansör Tescil Ön-Değerlendirme
type Tahrik = "Makine Daireli" | "Makine Dairesiz (Gearless)" | "Hidrolik";
type TescilOnInput = {
    tip: "Yeni" | "Modernizasyon";
    adet: number;
    kapasiteKg: number;
    tahrik: Tahrik;
    engelliErisimi: boolean;
    bakimSozlesmesiVar: boolean;
};
type TescilOnCikti = {
    belgeler: string[];
    tahminiUcret: number;
};

// — İskân (Yapı Kullanma İzni) Öz-Değerlendirme
const ISKAN_KRITERLER = [
    "Ruhsat ve projeye uygun imalat",
    "Yangın raporu / itfaiye uygunluğu",
    "Asansör tescil belgeleri",
    "Enerji Kimlik Belgesi (EKB)",
    "Otopark ve peyzaj tamam",
    "Engelli erişimi (rampa/asansör vb.)",
    "Mekanik-elektrik testleri",
    "Atık su/yağmur suyu bağlantısı",
    "SGK ilişiksizlik yazısı",
    "Ortak alanların hazır ve güvenli",
] as const;
type IskanKayit = {
    id: string;
    tarihISO: string;
    sonucYuzde: number;
    eksikler: string[];
    not?: string;
};

/* ------------------------- LS helpers ------------------------- */
const LS_ASANSOR = "asansor-randevular";
const LS_DENETIM = "yapi-denetim-talepleri";
const LS_ISKAN = "iskan-kayitlari";

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

const toTL = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });

/* ======================================================================== */
/*                                  PAGE                                    */
/* ======================================================================== */
export default function YapiKontrolAsansorPage() {
    const yil = new Date().getFullYear();
    const [center, setCenter] = useState<Coords>(DEFAULT_CENTER);

    // geo
    const useMyLocation = () => {
        if (!("geolocation" in navigator)) return alert("Tarayıcınız konum özelliğini desteklemiyor.");
        navigator.geolocation.getCurrentPosition(
            (p) => setCenter({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => alert("Konum alınamadı.")
        );
    };

    /* -------------------- Asansör Randevu -------------------- */
    const [randevular, setRandevular] = useState<AsansorRandevu[]>([]);
    useEffect(() => setRandevular(loadLS<AsansorRandevu[]>(LS_ASANSOR, [])), []);

    const [rForm, setRForm] = useState<AsansorRandevu>({
        id: crypto.randomUUID(),
        bina: "",
        adres: "",
        blok: "",
        asansorSayisi: 1,
        tarihISO: new Date().toISOString().slice(0, 10),
        saat: "10:00",
        yetkili: "",
        iletisim: "",
        kurulus: "A Tipi Muayene Kuruluşu (Demo-1)",
        coords: center,
    });

    useEffect(() => setRForm((s) => ({ ...s, coords: center })), [center]);

    const gonderRandevu = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rForm.bina || !rForm.adres || !rForm.yetkili || !rForm.iletisim) {
            return alert("Lütfen zorunlu alanları doldurun.");
        }
        const rec: AsansorRandevu = { ...rForm, id: crypto.randomUUID() };
        const y = [rec, ...randevular].slice(0, 100);
        setRandevular(y);
        saveLS(LS_ASANSOR, y);
        alert("Randevu talebiniz alındı (demo).");
        setRForm({
            id: crypto.randomUUID(),
            bina: "",
            adres: "",
            blok: "",
            asansorSayisi: 1,
            tarihISO: new Date().toISOString().slice(0, 10),
            saat: "10:00",
            yetkili: "",
            iletisim: "",
            kurulus: "A Tipi Muayene Kuruluşu (Demo-1)",
            coords: center,
        });
    };

    const jsonDL = (name: string, data: unknown) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
    };

    /* -------------------- Yapı Denetim Talebi -------------------- */
    const [talepler, setTalepler] = useState<YapiDenetimTalep[]>([]);
    useEffect(() => setTalepler(loadLS<YapiDenetimTalep[]>(LS_DENETIM, [])), []);

    const [tForm, setTForm] = useState<YapiDenetimTalep>({
        id: crypto.randomUUID(),
        ruhsatNo: "",
        ada: "",
        parsel: "",
        talep: "Temel/Kalıp-Demir",
        tarihISO: new Date().toISOString().slice(0, 10),
        saat: "09:00",
        yetkili: "",
        iletisim: "",
        adres: "",
        coords: center,
        not: "",
    });
    useEffect(() => setTForm((s) => ({ ...s, coords: center })), [center]);

    const gonderTalep = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tForm.ruhsatNo || !tForm.yetkili || !tForm.iletisim || !tForm.adres) {
            return alert("Lütfen zorunlu alanları doldurun.");
        }
        const rec: YapiDenetimTalep = { ...tForm, id: crypto.randomUUID() };
        const y = [rec, ...talepler].slice(0, 100);
        setTalepler(y);
        saveLS(LS_DENETIM, y);
        alert("Denetim talebiniz alındı (demo).");
        setTForm({
            id: crypto.randomUUID(),
            ruhsatNo: "",
            ada: "",
            parsel: "",
            talep: "Temel/Kalıp-Demir",
            tarihISO: new Date().toISOString().slice(0, 10),
            saat: "09:00",
            yetkili: "",
            iletisim: "",
            adres: "",
            coords: center,
            not: "",
        });
    };

    /* -------------------- Asansör Tescil Ön Değerlendirme -------------------- */
    const [onIn, setOnIn] = useState<TescilOnInput>({
        tip: "Yeni",
        adet: 1,
        kapasiteKg: 630,
        tahrik: "Makine Dairesiz (Gearless)",
        engelliErisimi: true,
        bakimSozlesmesiVar: false,
    });

    const onCikti: TescilOnCikti = useMemo(() => {
        const docs = [
            "Proje onayı / avan proje",
            "Uygunluk beyanı (CE)",
            "AT Tip İnceleme Belgesi (varsa)",
            "Muayene kuruluşu periyodik kontrol raporu",
            "Asansör kimlik numarası etiketi",
            "Mesul müdür/bakım sözleşmesi",
        ];
        if (onIn.tip === "Modernizasyon") {
            docs.push("Modernizasyon kapsam/raporu", "Eski- yeni ekipman karşılaştırma");
        }
        if (onIn.engelliErisimi) docs.push("TS 9111 erişilebilirlik uygunluk beyanı");
        // demo ücret: baz 1500 + (adet*400) + kapasite/10  + hidrolik ise +300
        let ucret =
            1500 + onIn.adet * 400 + Math.round(onIn.kapasiteKg / 10) + (onIn.tahrik === "Hidrolik" ? 300 : 0);
        if (!onIn.bakimSozlesmesiVar) ucret += 200; // evrak kontrol/ek hizmet
        return { belgeler: docs, tahminiUcret: ucret };
    }, [onIn]);

    /* -------------------- İskan Öz-Değerlendirme -------------------- */
    const [iskanChecks, setIskanChecks] = useState<Record<string, boolean>>({});
    const iskanSkor = useMemo(() => {
        const toplam = ISKAN_KRITERLER.length;
        const uygun = ISKAN_KRITERLER.filter((k) => iskanChecks[k]).length;
        const yuzde = toplam ? Math.round((uygun / toplam) * 100) : 0;
        return { toplam, uygun, yuzde };
    }, [iskanChecks]);

    const [iskanKayitlar, setIskanKayitlar] = useState<IskanKayit[]>([]);
    useEffect(() => setIskanKayitlar(loadLS<IskanKayit[]>(LS_ISKAN, [])), []);

    const kaydetIskan = () => {
        const eksikler = ISKAN_KRITERLER.filter((k) => !iskanChecks[k]);
        const rec: IskanKayit = {
            id: crypto.randomUUID(),
            tarihISO: new Date().toISOString(),
            sonucYuzde: iskanSkor.yuzde,
            eksikler,
        };
        const y = [rec, ...iskanKayitlar].slice(0, 50);
        setIskanKayitlar(y);
        saveLS(LS_ISKAN, y);
        alert("Ön değerlendirme kaydedildi (demo).");
    };

    /* -------------------- Sorgu: Etiket (demo) -------------------- */
    const [etiketNo, setEtiketNo] = useState("");
    const [etiketSonuc, setEtiketSonuc] = useState<{
        renk: "Yeşil" | "Sarı" | "Kırmızı" | null;
        tarih?: string;
        firma?: string;
    }>({ renk: null });

    const yapSorgu = () => {
        if (!etiketNo.trim()) return alert("Etiket/kimlik numarası giriniz.");
        // DEMO: numaranın son hanesine göre renk
        const last = parseInt(etiketNo.replace(/\D/g, "").slice(-1) || "0");
        const renk = last % 3 === 0 ? "Kırmızı" : last % 2 === 0 ? "Sarı" : "Yeşil";
        setEtiketSonuc({
            renk,
            tarih: new Date(Date.now() - 1000 * 60 * 60 * 24 * (30 + last * 3))
                .toISOString()
                .slice(0, 10),
            firma: "A Tipi Muayene Kuruluşu (Demo)",
        });
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-50 via-white to-indigo-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Yapı Kontrol ve Asansör Tescil Hizmetleri
                        </h1>
                        <p className="mt-3 text-gray-700">
                            Şantiye denetim talebi, <strong>asansör periyodik kontrol randevusu</strong>,{" "}
                            <strong>asansör tescil ön değerlendirme</strong> ve{" "}
                            <strong>iskân öz-değerlendirme</strong> işlemlerinin hepsi tek sayfada.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="info">Randevu &amp; Talep</Badge>
                            <Badge tone="success">Ön Değerlendirme</Badge>
                            <Badge tone="warning">JSON Dışa Aktarım</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1578948856697-db91d4e2b460?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* küçük vaat şeridi */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🗓️</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">3 iş günü</div>
                        <div className="text-sm text-gray-600">Ön kontrol / randevu hedefi</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🛗</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">A Tipi Kuruluş</div>
                        <div className="text-sm text-gray-600">Bağımsız muayene işbirliği</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>📄</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">{yil}</div>
                        <div className="text-sm text-gray-600">Mevzuata uyum (demo)</div>
                    </div>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["asansor-randevu", "Asansör Periyodik Kontrol Randevusu"],
                            ["asansor-etiket", "Etiket (Kırmızı/Sarı/Yeşil) Sorgu"],
                            ["tescil-on", "Asansör Tescil Ön Değerlendirme"],
                            ["yapi-denetim", "Şantiye / Yapı Denetim Talebi"],
                            ["iskan", "İskân (Yapı Kullanma) Öz-Değerlendirme"],
                            ["kayitlar", "Kayıtlar / JSON"],
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
                    {/* Asansör Randevu */}
                    <Section id="asansor-randevu" title="Asansör Periyodik Kontrol Randevusu">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <form onSubmit={gonderRandevu} className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Bina / Site adı"
                                        value={rForm.bina}
                                        onChange={(e) => setRForm((s) => ({ ...s, bina: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Blok (ops.)"
                                        value={rForm.blok || ""}
                                        onChange={(e) => setRForm((s) => ({ ...s, blok: e.target.value }))}
                                    />
                                </div>
                                <input
                                    className="mt-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="Adres"
                                    value={rForm.adres}
                                    onChange={(e) => setRForm((s) => ({ ...s, adres: e.target.value }))}
                                />
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="number"
                                        min={1}
                                        placeholder="Asansör sayısı"
                                        value={rForm.asansorSayisi || ""}
                                        onChange={(e) =>
                                            setRForm((s) => ({ ...s, asansorSayisi: parseInt(e.target.value || "1") }))
                                        }
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="date"
                                        value={rForm.tarihISO}
                                        onChange={(e) => setRForm((s) => ({ ...s, tarihISO: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="time"
                                        value={rForm.saat}
                                        onChange={(e) => setRForm((s) => ({ ...s, saat: e.target.value }))}
                                    />
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Yetkili kişi"
                                        value={rForm.yetkili}
                                        onChange={(e) => setRForm((s) => ({ ...s, yetkili: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="İletişim (tel/e-posta)"
                                        value={rForm.iletisim}
                                        onChange={(e) => setRForm((s) => ({ ...s, iletisim: e.target.value }))}
                                    />
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={rForm.kurulus}
                                        onChange={(e) =>
                                            setRForm((s) => ({
                                                ...s,
                                                kurulus:
                                                    e.target.value as AsansorRandevu["kurulus"],
                                            }))
                                        }
                                    >
                                        <option>A Tipi Muayene Kuruluşu (Demo-1)</option>
                                        <option>A Tipi Muayene Kuruluşu (Demo-2)</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={useMyLocation}
                                        className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:opacity-95"
                                    >
                                        Konumumu Kullan
                                    </button>
                                </div>
                                <textarea
                                    className="mt-2 min-h-[70px] w-full rounded-lg border px-3 py-2"
                                    placeholder="Not (opsiyonel)"
                                    value={rForm.not || ""}
                                    onChange={(e) => setRForm((s) => ({ ...s, not: e.target.value }))}
                                />
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                        className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95"
                                        type="submit"
                                    >
                                        Randevu Talep Et
                                    </button>
                                    <button
                                        className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95"
                                        type="button"
                                        onClick={() => jsonDL("asansor-randevu-taslak.json", rForm)}
                                    >
                                        JSON indir (taslak)
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-4">
                                <div className="overflow-hidden rounded-xl border">
                                    <iframe title="Harita" className="h-72 w-full" src={osmEmbed(center)} loading="lazy" />
                                </div>

                                <div className="rounded-xl border bg-white p-4">
                                    <h3 className="mb-2 font-semibold">Son Randevular (demo)</h3>
                                    {randevular.length === 0 ? (
                                        <p className="text-sm text-gray-600">Kayıt yok.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {randevular.slice(0, 6).map((r) => (
                                                <li key={r.id} className="rounded-lg border p-2 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">
                                                            {r.bina} {r.blok ? `• ${r.blok}` : ""} – {r.asansorSayisi} asansör
                                                        </span>
                                                        <span className="text-gray-600">
                                                            {r.tarihISO} {r.saat}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-700">{r.adres}</div>
                                                    <div className="text-xs text-gray-500">{r.kurulus}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Callout title="Nasıl çalışır? – Asansör Periyodik Kontrol Randevusu" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li>
                                    <span className="font-semibold">Gerekli bilgiler:</span> Bina adı/adresi, asansör sayısı, yetkili adı ve{" "}
                                    <span className="font-semibold">iletişim</span>, tercih edilen tarih-saat, muayene kuruluşu.
                                </li>
                                <li>
                                    <span className="font-semibold">Ne veriyoruz:</span> Talebinizi sisteme kaydediyor, uygun randevu için dönüş yapıyoruz (demo).
                                </li>
                                <li>
                                    <span className="font-semibold">Konum:</span> “Konumumu Kullan” derseniz ekipler için nokta kaydı yapılır.
                                </li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* Etiket Sorgu */}
                    <Section id="asansor-etiket" title="Asansör Etiket (Yeşil/Sarı/Kırmızı) Sorgusu">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <div className="rounded-xl border bg-white p-4">
                                <label className="block text-sm text-gray-600">Etiket/Kimlik No</label>
                                <input
                                    className="mt-1 w-full rounded-lg border px-3 py-2"
                                    placeholder="örn. AITM-2025-000123"
                                    value={etiketNo}
                                    onChange={(e) => setEtiketNo(e.target.value)}
                                />
                                <div className="mt-3 flex gap-2">
                                    <button
                                        className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95"
                                        onClick={yapSorgu}
                                    >
                                        Sorgula (demo)
                                    </button>
                                    <button
                                        className="rounded-lg bg-gray-100 px-4 py-2 hover:bg-gray-200"
                                        onClick={() => setEtiketSonuc({ renk: null })}
                                    >
                                        Temizle
                                    </button>
                                </div>
                                {etiketSonuc.renk && (
                                    <div className="mt-3 rounded-lg border p-3 text-sm">
                                        <div>
                                            Sonuç:{" "}
                                            <Badge
                                                tone={
                                                    etiketSonuc.renk === "Yeşil"
                                                        ? "success"
                                                        : etiketSonuc.renk === "Sarı"
                                                            ? "warning"
                                                            : "danger"
                                                }
                                            >
                                                {etiketSonuc.renk}
                                            </Badge>
                                        </div>
                                        <div className="text-gray-600">
                                            Son kontrol: {etiketSonuc.tarih} • Kuruluş: {etiketSonuc.firma}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            (Gerçek sorgular muayene kuruluşu entegrasyonu ile yapılır.)
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Callout title="Nasıl çalışır? – Etiket Sorgusu" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        <span className="font-semibold">Gerekli bilgi:</span> Kabin içindeki
                                        kimlik/etiket numarası.
                                    </li>
                                    <li>
                                        <span className="font-semibold">Ne veriyoruz:</span> Son kontrol tarihi ve etiket rengi (demo simülasyon).
                                    </li>
                                    <li>
                                        <span className="font-semibold">Renkler:</span> Yeşil = Uygun, Sarı =
                                        Giderilmesi gereken kusur, Kırmızı = Güvensiz (kullanıma kapalı).
                                    </li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* Tescil Ön Değerlendirme */}
                    <Section id="tescil-on" title="Asansör Tescil Başvurusu – Ön Değerlendirme">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={onIn.tip}
                                        onChange={(e) => setOnIn((s) => ({ ...s, tip: e.target.value as TescilOnInput["tip"] }))}
                                    >
                                        <option>Yeni</option>
                                        <option>Modernizasyon</option>
                                    </select>
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={onIn.tahrik}
                                        onChange={(e) =>
                                            setOnIn((s) => ({ ...s, tahrik: e.target.value as Tahrik }))
                                        }
                                    >
                                        <option>Makine Daireli</option>
                                        <option>Makine Dairesiz (Gearless)</option>
                                        <option>Hidrolik</option>
                                    </select>
                                </div>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="number"
                                        min={1}
                                        placeholder="Adet"
                                        value={onIn.adet}
                                        onChange={(e) => setOnIn((s) => ({ ...s, adet: parseInt(e.target.value || "1") }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="number"
                                        min={320}
                                        placeholder="Kapasite (kg)"
                                        value={onIn.kapasiteKg}
                                        onChange={(e) =>
                                            setOnIn((s) => ({ ...s, kapasiteKg: parseInt(e.target.value || "0") }))
                                        }
                                    />
                                    <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={onIn.engelliErisimi}
                                            onChange={(e) => setOnIn((s) => ({ ...s, engelliErisimi: e.target.checked }))}
                                        />
                                        Engelli erişimi var
                                    </label>
                                </div>
                                <label className="mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={onIn.bakimSozlesmesiVar}
                                        onChange={(e) =>
                                            setOnIn((s) => ({ ...s, bakimSozlesmesiVar: e.target.checked }))
                                        }
                                    />
                                    Bakım sözleşmesi mevcut
                                </label>

                                <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
                                    <div className="font-semibold">Gerekli Belgeler</div>
                                    <ul className="mt-1 list-disc pl-5">
                                        {onCikti.belgeler.map((b, i) => (
                                            <li key={i}>{b}</li>
                                        ))}
                                    </ul>
                                    <div className="mt-2">
                                        Tahmini işlem/evrak ücreti:{" "}
                                        <span className="text-lg font-semibold">{toTL(onCikti.tahminiUcret)} ₺</span>
                                    </div>
                                </div>
                            </div>

                            <Callout title="Nasıl çalışır? – Asansör Tescil Ön Değerlendirme" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        <span className="font-semibold">Gerekli bilgiler:</span> Başvuru tipi (yeni/modernizasyon), adet, kapasite, tahrik, engelli erişimi, bakım sözleşmesi.
                                    </li>
                                    <li>
                                        <span className="font-semibold">Ne veriyoruz:</span> Gerekli belge listesi ve{" "}
                                        <span className="font-semibold">tahmini ücret</span> (demo formül).
                                    </li>
                                    <li>
                                        <span className="font-semibold">Başvuru:</span> Belgeler tamamlandığında e-belediye/asansör birimi üzerinden randevu ve kayıt işlemi yapılır.
                                    </li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* Yapı Denetim Talebi */}
                    <Section id="yapi-denetim" title="Şantiye / Yapı Denetim Talebi">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <form onSubmit={gonderTalep} className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Ruhsat No"
                                        value={tForm.ruhsatNo}
                                        onChange={(e) => setTForm((s) => ({ ...s, ruhsatNo: e.target.value }))}
                                    />
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={tForm.talep}
                                        onChange={(e) => setTForm((s) => ({ ...s, talep: e.target.value as TalepTuru }))}
                                    >
                                        {(
                                            [
                                                "Temel/Kalıp-Demir",
                                                "Beton Dökümü",
                                                "Temel Üstü Vizesi",
                                                "Ruhsat Projesi Uygunluk",
                                                "Yıkım Denetimi",
                                                "İskan Öncesi Kontrol",
                                            ] as TalepTuru[]
                                        ).map((t) => (
                                            <option key={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Ada (ops.)"
                                        value={tForm.ada || ""}
                                        onChange={(e) => setTForm((s) => ({ ...s, ada: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Parsel (ops.)"
                                        value={tForm.parsel || ""}
                                        onChange={(e) => setTForm((s) => ({ ...s, parsel: e.target.value }))}
                                    />
                                </div>
                                <input
                                    className="mt-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="Adres"
                                    value={tForm.adres}
                                    onChange={(e) => setTForm((s) => ({ ...s, adres: e.target.value }))}
                                />
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="date"
                                        value={tForm.tarihISO}
                                        onChange={(e) => setTForm((s) => ({ ...s, tarihISO: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="time"
                                        value={tForm.saat}
                                        onChange={(e) => setTForm((s) => ({ ...s, saat: e.target.value }))}
                                    />
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Şantiye yetkilisi"
                                        value={tForm.yetkili}
                                        onChange={(e) => setTForm((s) => ({ ...s, yetkili: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="İletişim (tel/e-posta)"
                                        value={tForm.iletisim}
                                        onChange={(e) => setTForm((s) => ({ ...s, iletisim: e.target.value }))}
                                    />
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:opacity-95"
                                        onClick={useMyLocation}
                                    >
                                        Konumumu Kullan
                                    </button>
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Not (ops.)"
                                        value={tForm.not || ""}
                                        onChange={(e) => setTForm((s) => ({ ...s, not: e.target.value }))}
                                    />
                                </div>
                                <div className="mt-3">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                        Talep Gönder
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-4">
                                <div className="overflow-hidden rounded-xl border">
                                    <iframe title="Harita" className="h-72 w-full" src={osmEmbed(center)} loading="lazy" />
                                </div>
                                <div className="rounded-xl border bg-white p-4">
                                    <h3 className="mb-2 font-semibold">Son Talepler (demo)</h3>
                                    {talepler.length === 0 ? (
                                        <p className="text-sm text-gray-600">Kayıt yok.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {talepler.slice(0, 6).map((t) => (
                                                <li key={t.id} className="rounded-lg border p-2 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">
                                                            {t.talep} • Ruhsat: {t.ruhsatNo}
                                                        </span>
                                                        <span className="text-gray-600">
                                                            {t.tarihISO} {t.saat}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-700">{t.adres}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Callout title="Nasıl çalışır? – Şantiye / Yapı Denetim Talebi" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li>
                                    <span className="font-semibold">Gerekli bilgiler:</span> Ruhsat no, adres, talep türü, tarih-saat, yetkili ve{" "}
                                    <span className="font-semibold">iletişim</span>. Ada/parsel varsa ekleyin.
                                </li>
                                <li>
                                    <span className="font-semibold">Ne veriyoruz:</span> Denetim planlaması için kayıt oluşturur; uygun slot geri bildirilir (demo).
                                </li>
                                <li>
                                    <span className="font-semibold">Not:</span> Beton dökümü gibi kritik süreçlerde denetim olmadan işlem yapılmamalıdır.
                                </li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* İskan Öz-Değerlendirme */}
                    <Section id="iskan" title="İskân (Yapı Kullanma İzni) – Öz-Değerlendirme">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border bg-white p-4">
                                <ul className="space-y-2">
                                    {ISKAN_KRITERLER.map((k) => (
                                        <li key={k} className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={!!iskanChecks[k]}
                                                onChange={(e) => setIskanChecks((s) => ({ ...s, [k]: e.target.checked }))}
                                            />
                                            <span>{k}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                                    Uygunluk:{" "}
                                    <span className="font-semibold">
                                        {iskanSkor.uygun}/{iskanSkor.toplam}
                                    </span>{" "}
                                    ({iskanSkor.yuzde}%)
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <button className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95" onClick={kaydetIskan}>
                                        Ön Değerlendirmeyi Kaydet
                                    </button>
                                    <button
                                        className="rounded-lg bg-gray-100 px-4 py-2 hover:bg-gray-200"
                                        onClick={() => setIskanChecks({})}
                                    >
                                        Temizle
                                    </button>
                                </div>
                            </div>

                            <Callout title="Nasıl çalışır? – İskân Öncesi Kontrol" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        <span className="font-semibold">Gerekli bilgi:</span> Sadece mevcut
                                        durumunuzu işaretlersiniz; doküman yüklemesi yoktur.
                                    </li>
                                    <li>
                                        <span className="font-semibold">Ne veriyoruz:</span> Yüzdelik skor ve eksik kalem listesi. Başvuru öncesi nelere odaklanmanız gerektiğini görürsünüz.
                                    </li>
                                    <li>
                                        <span className="font-semibold">Zorunlu belgeler (özet):</span> Yangın raporu, asansör tescil, EKB, SGK ilişiksizlik, altyapı bağlantıları ve proje uygunluğu.
                                    </li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* Kayıtlar / JSON */}
                    <Section id="kayitlar" title="Kayıtlar / JSON">
                        <div className="grid gap-3 md:grid-cols-3">
                            {/* asansör randevuları */}
                            <div className="rounded-xl border bg-white p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="font-semibold">Asansör Randevuları</div>
                                    <button
                                        className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white hover:opacity-95"
                                        onClick={() => jsonDL("asansor-randevular.json", randevular)}
                                    >
                                        JSON
                                    </button>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {randevular.length ? `${randevular.length} kayıt` : "Kayıt yok."}
                                </div>
                            </div>
                            {/* denetim talepleri */}
                            <div className="rounded-xl border bg-white p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="font-semibold">Yapı Denetim Talepleri</div>
                                    <button
                                        className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white hover:opacity-95"
                                        onClick={() => jsonDL("yapi-denetim-talepleri.json", talepler)}
                                    >
                                        JSON
                                    </button>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {talepler.length ? `${talepler.length} kayıt` : "Kayıt yok."}
                                </div>
                            </div>
                            {/* iskan */}
                            <div className="rounded-xl border bg-white p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="font-semibold">İskân Ön Değ. Kayıtları</div>
                                    <button
                                        className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white hover:opacity-95"
                                        onClick={() => jsonDL("iskan-on-degerlendirme.json", iskanKayitlar)}
                                    >
                                        JSON
                                    </button>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {iskanKayitlar.length ? `${iskanKayitlar.length} kayıt` : "Kayıt yok."}
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* SSS */}
                    <Section id="sss" title="A’dan Z’ye Sık Sorulan Sorular">
                        {[
                            ["Asansör kontrolünü kim yapıyor?",
                                "Belediyenin protokol yaptığı bağımsız A Tipi Muayene Kuruluşu yapar; belediye koordinasyon sağlar."],
                            ["Randevu olmadan kontrol yapılır mı?",
                                "Genellikle planlı çalışılır. Acil güvenlik riski varsa önceliklendirme yapılır."],
                            ["Etiket rengi neye göre belirleniyor?",
                                "Muayene raporuna göre: Yeşil=Uygun, Sarı=Düzeltilebilir kusur, Kırmızı=Güvensiz/asansör kapalı."],
                            ["Kırmızı etiket aldıysam ne yapmalıyım?",
                                "Bakım firmasıyla kusurları giderip tekrar kontrol randevusu almalısınız. Kırmızı etiketli asansör kullanılamaz."],
                            ["Sarı etikette süre var mı?",
                                "Muayene raporunda verilen süre içinde eksikler tamamlanır; tekrar kontrol planlanır."],
                            ["Asansör tescilinde hangi belgeler şart?",
                                "Proje onayı, uygunluk beyanı (CE), tip inceleme belgesi (varsa), muayene raporu, kimlik etiketi, bakım sözleşmesi vb."],
                            ["Yeni bina iskanında asansör tescili zorunlu mu?",
                                "Evet. Asansörlü binalarda tescil olmadan iskân verilmez."],
                            ["Denetim talebimde hangi evraklar istenir?",
                                "Ruhsat no zorunludur. Talep türüne göre beton dökümü öncesi karot raporu, demir metrajı vb. belgeler istenebilir."],
                            ["İskân için enerji kimlik belgesi (EKB) şart mı?",
                                "Evet, iskân öncesi zorunludur."],
                            ["Yangın uygunluğu nasıl alınır?",
                                "Projesine uygun imalat, acil yönlendirmeler, yangın algılama/söndürme sistemlerinin testleri ve itfaiye uygunluk yazısı gerekir."],
                            ["Engelli erişimi hangi dokümanda aranır?",
                                "TS 9111 ve ilgili imar yönetmelikleri kapsamındaki düzenlemeler kontrol edilir."],
                            ["Konum paylaşmak zorunlu mu?",
                                "Zorunlu değildir ancak ekiplerin adresi kolay bulmasını sağlar."],
                            ["Ruhsatsız yapıda denetim çağırabilir miyim?",
                                "Ruhsatsız yapıda denetim çağrısı, mevzuata aykırılık tespiti ve idari işlem doğurabilir; önce ruhsat işlemleri tamamlanmalıdır."],
                            ["Yıkım denetimi nasıl işler?",
                                "Gerekli güvenlik tedbirleri (iskele, ağ, uyarı vb.) ve atık yönetim planı kontrol edilir; mevzuata aykırılıkta işlem yapılır."],
                            ["Randevu iptal/değişikliği mümkün mü?",
                                "Evet; en az 1 iş günü önce bildirmeniz beklenir."],
                            ["JSON indirme ne işime yarar?",
                                "Başvurularınızı arşivlemenizi ve dış sistem/bot entegrasyonu yapmanızı kolaylaştırır."],
                            ["Kişisel verilerim nasıl kullanılıyor?",
                                "Sadece başvurunuzun yürütülmesi amacıyla; demo sayfasında veriler tarayıcınızda saklanır."],
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
                        <p>
                            <span className="font-semibold">Yapı Kontrol ve Asansör Birimi</span>
                        </p>
                        <p>Alo 153 • Çağrı Merkezi: 444 0 XXX</p>
                        <p>
                            E-posta:{" "}
                            <a className="text-emerald-700 underline" href="mailto:yapi-kontrol@birimajans.bel.tr">
                                yapi-kontrol@birimajans.bel.tr
                            </a>
                        </p>
                        <p>Adres: Belediye Hizmet Binası, [adres]</p>
                        <div className="mt-3 flex gap-2">
                            <Link href="/ebelediye" className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95">
                                e-Belediye İşlemleri
                            </Link>
                            <a href="#asansor-randevu" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95">
                                Randevu Oluştur
                            </a>
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
}
