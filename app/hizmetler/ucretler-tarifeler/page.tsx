// app/ucretler-ve-tarifeler/page.tsx
"use client";

import React, { useMemo, useState } from "react";
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

/* ------------------------- Types & Demo Data ------------------------- */
type Birim =
    | "TL"
    | "TL/m²"
    | "TL/ay"
    | "TL/ay·m²"
    | "TL/gün·m²"
    | "TL/seans"
    | "Formül";

type Tarife = {
    id: string;
    yil: number;
    kategori:
    | "Evlendirme"
    | "İmar-Şehircilik"
    | "Ruhsat-Denetim"
    | "İlan-Reklam"
    | "İşgaliye"
    | "Temizlik"
    | "Spor"
    | "Mezarlık"
    | "Diğer";
    ad: string;
    birim: Birim;
    tutar?: number; // numeric fee
    formul?: string; // human-readable formula
    aciklama?: string;
};

const META: Record<
    number,
    { kararNo: string; yururluk: string; aciklama?: string }
> = {
    2025: {
        kararNo: "2025/37",
        yururluk: "01.01.2025",
        aciklama:
            "Bu sayfadaki tutarlar demo amaçlıdır; nihai uygulama Belediye Meclisi kararına tabidir.",
    },
    2024: {
        kararNo: "2024/42",
        yururluk: "01.01.2024",
    },
};

// minimal id helper
const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

const TARIFELER: Tarife[] = [
    /* 2025 */
    {
        id: rid("evl-salonA"),
        yil: 2025,
        kategori: "Evlendirme",
        ad: "Nikâh Salon A • Hafta içi",
        birim: "TL",
        tutar: 1500,
        aciklama: "Mesai içi; ilçe içi. Foto-video hariç.",
    },
    {
        id: rid("evl-salonB"),
        yil: 2025,
        kategori: "Evlendirme",
        ad: "Nikâh Salon B • Hafta içi",
        birim: "TL",
        tutar: 2000,
        aciklama: "Mesai içi; ilçe içi. Foto-video hariç.",
    },
    {
        id: rid("evl-ekstra"),
        yil: 2025,
        kategori: "Evlendirme",
        ad: "Hafta sonu farkı / Mesai dışı farkı / İlçe dışı",
        birim: "Formül",
        formul: "+500 / +700 / +250",
        aciklama: "Toplam ücrete eklenir (seçime bağlı).",
    },
    {
        id: rid("imar-cap"),
        yil: 2025,
        kategori: "İmar-Şehircilik",
        ad: "İmar Çapı Belgesi",
        birim: "TL",
        tutar: 450,
    },
    {
        id: rid("imar-numarataj"),
        yil: 2025,
        kategori: "İmar-Şehircilik",
        ad: "Numarataj (Kapı No Tescil)",
        birim: "TL",
        tutar: 300,
    },
    {
        id: rid("ruhsat-sihhi"),
        yil: 2025,
        kategori: "Ruhsat-Denetim",
        ad: "Sıhhi İşyeri Ruhsat Harcı",
        birim: "Formül",
        formul: "Baz 500 + Risk katsayısı × m²/50",
        aciklama: "Sayfadaki 'İşyeri Ruhsatları' ile uyumlu demo formül.",
    },
    {
        id: rid("ilan-tabela"),
        yil: 2025,
        kategori: "İlan-Reklam",
        ad: "Tabela • m² başına aylık",
        birim: "TL/ay·m²",
        tutar: 60,
    },
    {
        id: rid("ilan-pano"),
        yil: 2025,
        kategori: "İlan-Reklam",
        ad: "Pano • m² başına aylık",
        birim: "TL/ay·m²",
        tutar: 90,
    },
    {
        id: rid("ilan-totem"),
        yil: 2025,
        kategori: "İlan-Reklam",
        ad: "Totem • m² başına aylık",
        birim: "TL/ay·m²",
        tutar: 120,
    },
    {
        id: rid("isg-1"),
        yil: 2025,
        kategori: "İşgaliye",
        ad: "Açık Alan İşgali • m² başına günlük",
        birim: "TL/gün·m²",
        tutar: 8,
        aciklama: "Bölge katsayısı: A=1, B=0.8, C=0.6 (demo).",
    },
    {
        id: rid("temizlik-1"),
        yil: 2025,
        kategori: "Temizlik",
        ad: "Konteyner Tahsisi (Aylık)",
        birim: "TL/ay",
        tutar: 350,
    },
    {
        id: rid("spor-1"),
        yil: 2025,
        kategori: "Spor",
        ad: "Halı Saha Kiralama (Saatlik)",
        birim: "TL",
        tutar: 450,
        aciklama: "Hafta sonu +%15 fark (demo).",
    },
    {
        id: rid("mezarlik-1"),
        yil: 2025,
        kategori: "Mezarlık",
        ad: "Mezar Tahsis Ücreti",
        birim: "TL",
        tutar: 4000,
    },
    /* 2024 (örnek arşiv) */
    {
        id: rid("2024-evl"),
        yil: 2024,
        kategori: "Evlendirme",
        ad: "Nikâh Salon A • Hafta içi",
        birim: "TL",
        tutar: 1350,
    },
    {
        id: rid("2024-ilan"),
        yil: 2024,
        kategori: "İlan-Reklam",
        ad: "Pano • m² başına aylık",
        birim: "TL/ay·m²",
        tutar: 80,
    },
];

/* ------------------------- Calculators (constants) ------------------------- */
// Nikâh (demo) – aynı mantık: Salon A/B ve ek farklar
const NIKAH = {
    salonlar: {
        A: 1500,
        B: 2000,
    },
    ekFark: {
        haftaSonu: 500,
        mesaiDisi: 700,
        ilceDisi: 250,
    },
    ekstra: {
        foto: 300,
        video: 500,
        muzik: 400,
    },
};

// İlan-Reklam – m²*ay
const ILAN = {
    oran: {
        tabela: 60, // TL/ay·m²
        pano: 90,
        totem: 120,
    },
};

// İşgaliye – m²*gün*bolgeKatsayisi
const ISGALIYE = {
    baz: 8, // TL/gün·m²
    bolge: {
        A: 1,
        B: 0.8,
        C: 0.6,
    },
};

/* ------------------------- Utils ------------------------- */
const toTL = (n: number) =>
    n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });

const downloadJSON = (name: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
};

const downloadCSV = (name: string, rows: string[][]) => {
    const csv = rows.map((r) => r.map((c) => `"${(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
};

/* ------------------------- Page ------------------------- */
export default function UcretlerTarifelerPage() {
    const years = useMemo(
        () => Array.from(new Set(TARIFELER.map((t) => t.yil))).sort((a, b) => b - a),
        []
    );
    const [year, setYear] = useState<number>(years[0] ?? 2025);
    const [q, setQ] = useState("");
    const kategoriler = useMemo(
        () =>
            Array.from(
                new Set(TARIFELER.filter((t) => t.yil === year).map((t) => t.kategori))
            ).sort(),
        [year]
    );
    const [cat, setCat] = useState<string>("Hepsi");
    const [unit, setUnit] = useState<string>("Hepsi");

    const filtered = useMemo(() => {
        const list = TARIFELER.filter((t) => t.yil === year);
        return list.filter((t) => {
            const byCat = cat === "Hepsi" ? true : t.kategori === (cat as any);
            const byUnit = unit === "Hepsi" ? true : t.birim === (unit as Birim);
            const byQ = q
                ? [t.ad, t.aciklama, t.formul]
                    .filter(Boolean)
                    .some((s) => (s as string).toLowerCase().includes(q.toLowerCase()))
                : true;
            return byCat && byUnit && byQ;
        });
    }, [year, cat, unit, q]);

    /* -------- Nikâh Calculator state -------- */
    const [salon, setSalon] = useState<"A" | "B">("A");
    const [haftaSonu, setHaftaSonu] = useState(false);
    const [mesaiDisi, setMesaiDisi] = useState(false);
    const [ilceDisi, setIlceDisi] = useState(false);
    const [foto, setFoto] = useState(false);
    const [video, setVideo] = useState(false);
    const [muzik, setMuzik] = useState(false);

    const nikahToplam = useMemo(() => {
        let t = salon === "A" ? NIKAH.salonlar.A : NIKAH.salonlar.B;
        if (haftaSonu) t += NIKAH.ekFark.haftaSonu;
        if (mesaiDisi) t += NIKAH.ekFark.mesaiDisi;
        if (ilceDisi) t += NIKAH.ekFark.ilceDisi;
        if (foto) t += NIKAH.ekstra.foto;
        if (video) t += NIKAH.ekstra.video;
        if (muzik) t += NIKAH.ekstra.muzik;
        return t;
    }, [salon, haftaSonu, mesaiDisi, ilceDisi, foto, video, muzik]);

    /* -------- İlan-Reklam Calculator -------- */
    const [ilanTip, setIlanTip] = useState<"tabela" | "pano" | "totem">("tabela");
    const [ilanM2, setIlanM2] = useState<number>(1);
    const [ilanAy, setIlanAy] = useState<number>(1);
    const ilanToplam = useMemo(
        () => Math.max(0, Math.round(ILAN.oran[ilanTip] * (ilanM2 || 0) * (ilanAy || 0))),
        [ilanTip, ilanM2, ilanAy]
    );

    /* -------- İşgaliye Calculator -------- */
    const [isgM2, setIsgM2] = useState<number>(1);
    const [isgGun, setIsgGun] = useState<number>(1);
    const [isgBolge, setIsgBolge] = useState<"A" | "B" | "C">("A");
    const isgToplam = useMemo(
        () => Math.max(0, Math.round(ISGALIYE.baz * (isgM2 || 0) * (isgGun || 0) * ISGALIYE.bolge[isgBolge])),
        [isgM2, isgGun, isgBolge]
    );

    const meta = META[year];

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Ücretler ve Tarifeler</h1>
                        <p className="mt-3 text-gray-700">
                            Belediye Meclisi kararları doğrultusunda yürürlükte olan
                            <strong> {year}</strong> yılı ücret &amp; tarifeleri, arama-filtre ve
                            hesaplayıcılarla burada. JSON/CSV dışa aktarımı destekli.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="info">Arşivli</Badge>
                            <Badge tone="success">Hesaplayıcılar</Badge>
                            <Badge tone="warning">Demo Değerler</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1529101091764-c3526daf38fe?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* meta strip */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>📅</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">{year}</div>
                        <div className="text-sm text-gray-600">Tarife Yılı</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🧾</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">Karar {meta.kararNo}</div>
                        <div className="text-sm text-gray-600">Yürürlük: {meta.yururluk}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🔗</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">E-Belediye</div>
                        <div className="text-sm text-gray-600">
                            Ödeme &amp; başvurular için{" "}
                            <Link className="text-blue-700 underline" href="/ebelediye">
                                e-belediye sayfasına gidin
                            </Link>
                            .
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["tarifeler", "Tarife Tablosu"],
                            ["nikah", "Nikâh Ücreti Hesaplayıcı"],
                            ["ilan", "İlan-Reklam Hesaplayıcı"],
                            ["isgaliye", "İşgaliye Hesaplayıcı"],
                            ["sss", "A’dan Z’ye SSS"],
                            ["indir", "JSON / CSV"],
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

                {/* Content */}
                <main className="space-y-10">
                    {/* Tarife Tablosu */}
                    <Section id="tarifeler" title="Tarife Tablosu (Arama & Filtre)">
                        <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-4">
                            <select
                                className="rounded-lg border px-3 py-2"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                            >
                                {years.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="rounded-lg border px-3 py-2"
                                value={cat}
                                onChange={(e) => setCat(e.target.value)}
                            >
                                <option>Hepsi</option>
                                {kategoriler.map((k) => (
                                    <option key={k}>{k}</option>
                                ))}
                            </select>
                            <select
                                className="rounded-lg border px-3 py-2"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                            >
                                <option>Hepsi</option>
                                {Array.from(
                                    new Set(TARIFELER.filter((t) => t.yil === year).map((t) => t.birim))
                                )
                                    .sort()
                                    .map((u) => (
                                        <option key={u}>{u}</option>
                                    ))}
                            </select>
                            <input
                                className="rounded-lg border px-3 py-2"
                                placeholder="Ara: kalem adı / açıklama / formül"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                        </div>

                        {filtered.length === 0 ? (
                            <p className="text-sm text-gray-600">Kayıt bulunamadı.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="px-3 py-2 text-left">Kategori</th>
                                            <th className="px-3 py-2 text-left">Kalem</th>
                                            <th className="px-3 py-2 text-left">Birim</th>
                                            <th className="px-3 py-2 text-left">Tutar / Formül</th>
                                            <th className="px-3 py-2 text-left">Açıklama</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((t) => (
                                            <tr key={t.id} className="border-b">
                                                <td className="px-3 py-2">{t.kategori}</td>
                                                <td className="px-3 py-2">{t.ad}</td>
                                                <td className="px-3 py-2">{t.birim}</td>
                                                <td className="px-3 py-2">
                                                    {t.tutar != null ? (
                                                        <span className="font-medium">{toTL(t.tutar)} ₺</span>
                                                    ) : (
                                                        <span className="text-gray-700">{t.formul}</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-gray-600">{t.aciklama || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <Callout title="Mevzuat & Notlar" tone="info">
                            <ul className="list-disc space-y-1 pl-5">
                                <li>
                                    <span className="font-semibold">Dayanak:</span> 2464 sayılı Belediye
                                    Gelirleri Kanunu ve {year} yılı Belediye Meclisi{" "}
                                    <span className="font-semibold">{meta.kararNo}</span> sayılı kararı.
                                </li>
                                <li>
                                    <span className="font-semibold">İndirim/Muafiyet:</span> Öğrenci,
                                    engelli, şehit yakını, amatör spor kulübü vb. için meclis kararındaki
                                    oranlar uygulanır. (Demo sayfasıdır.)
                                </li>
                                <li>
                                    <span className="font-semibold">Birim:</span> Tabloda her kalemin
                                    birimi açıkça gösterilir (ör. TL/ay·m²). Yanlış anlaşılma olmaması
                                    için başvuru sırasında tekrar teyit edilir.
                                </li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* Nikâh Hesaplayıcı */}
                    <Section id="nikah" title="Nikâh Ücreti Hesaplayıcı">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={salon}
                                        onChange={(e) => setSalon(e.target.value as "A" | "B")}
                                    >
                                        <option value="A">Salon A (Baz {toTL(NIKAH.salonlar.A)} ₺)</option>
                                        <option value="B">Salon B (Baz {toTL(NIKAH.salonlar.B)} ₺)</option>
                                    </select>
                                    <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={haftaSonu}
                                            onChange={(e) => setHaftaSonu(e.target.checked)}
                                        />
                                        Hafta sonu (+{toTL(NIKAH.ekFark.haftaSonu)} ₺)
                                    </label>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={mesaiDisi}
                                            onChange={(e) => setMesaiDisi(e.target.checked)}
                                        />
                                        Mesai dışı (+{toTL(NIKAH.ekFark.mesaiDisi)} ₺)
                                    </label>
                                    <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={ilceDisi}
                                            onChange={(e) => setIlceDisi(e.target.checked)}
                                        />
                                        İlçe dışı (+{toTL(NIKAH.ekFark.ilceDisi)} ₺)
                                    </label>
                                </div>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={foto}
                                            onChange={(e) => setFoto(e.target.checked)}
                                        />
                                        Foto (+{toTL(NIKAH.ekstra.foto)} ₺)
                                    </label>
                                    <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={video}
                                            onChange={(e) => setVideo(e.target.checked)}
                                        />
                                        Video (+{toTL(NIKAH.ekstra.video)} ₺)
                                    </label>
                                    <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={muzik}
                                            onChange={(e) => setMuzik(e.target.checked)}
                                        />
                                        Müzik (+{toTL(NIKAH.ekstra.muzik)} ₺)
                                    </label>
                                </div>

                                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                                    <div className="text-gray-600">Tahmini toplam</div>
                                    <div className="text-2xl font-semibold">{toTL(nikahToplam)} ₺</div>
                                </div>
                            </div>

                            <Callout title="Nasıl çalışır? – Nikâh Hesabı" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        <span className="font-semibold">Gerekli bilgiler:</span> Salon,
                                        hafta sonu/mesai dışı/ilçe dışı tercihleri ve isteğe bağlı
                                        foto-video-müzik ekleri.
                                    </li>
                                    <li>
                                        <span className="font-semibold">Ne veriyoruz:</span> Toplam ücret
                                        hesaplaması ve tabloda aynı kaleme hızlı erişim.
                                    </li>
                                    <li>
                                        <span className="font-semibold">Sonuçların niteliği:</span> Bilgi
                                        amaçlıdır; kesin tutar başvuru ekranında oluşturulan tahakkukta
                                        yer alır.
                                    </li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* İlan-Reklam */}
                    <Section id="ilan" title="İlan-Reklam Ücreti Hesaplayıcı">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-3 gap-2">
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={ilanTip}
                                        onChange={(e) =>
                                            setIlanTip(e.target.value as "tabela" | "pano" | "totem")
                                        }
                                    >
                                        <option value="tabela">Tabela ({ILAN.oran.tabela} TL/ay·m²)</option>
                                        <option value="pano">Pano ({ILAN.oran.pano} TL/ay·m²)</option>
                                        <option value="totem">Totem ({ILAN.oran.totem} TL/ay·m²)</option>
                                    </select>
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="number"
                                        min={0}
                                        placeholder="m²"
                                        value={ilanM2}
                                        onChange={(e) => setIlanM2(parseFloat(e.target.value || "0"))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="number"
                                        min={1}
                                        placeholder="Ay"
                                        value={ilanAy}
                                        onChange={(e) => setIlanAy(parseFloat(e.target.value || "1"))}
                                    />
                                </div>
                                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                                    <div className="text-gray-600">Tahmini toplam</div>
                                    <div className="text-2xl font-semibold">{toTL(ilanToplam)} ₺</div>
                                </div>
                            </div>

                            <Callout title="Nasıl çalışır? – İlan-Reklam" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        <span className="font-semibold">Gerekli bilgiler:</span> Reklam
                                        tipi (tabela/pano/totem), alan (m²), süre (ay).
                                    </li>
                                    <li>
                                        <span className="font-semibold">Formül:</span>{" "}
                                        <code>oran × m² × ay</code>.
                                    </li>
                                    <li>
                                        <span className="font-semibold">Ek hususlar:</span> Bazı bölgelerde
                                        zabıta ve imar uygunluğu gereklidir; ölçü-yer kuralları farklı
                                        olabilir.
                                    </li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* İşgaliye */}
                    <Section id="isgaliye" title="İşgaliye (Açık Alan Kullanımı) Hesaplayıcı">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="number"
                                        min={0}
                                        placeholder="m²"
                                        value={isgM2}
                                        onChange={(e) => setIsgM2(parseFloat(e.target.value || "0"))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="number"
                                        min={1}
                                        placeholder="Gün"
                                        value={isgGun}
                                        onChange={(e) => setIsgGun(parseFloat(e.target.value || "1"))}
                                    />
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={isgBolge}
                                        onChange={(e) => setIsgBolge(e.target.value as "A" | "B" | "C")}
                                    >
                                        <option value="A">Bölge A (×1)</option>
                                        <option value="B">Bölge B (×0.8)</option>
                                        <option value="C">Bölge C (×0.6)</option>
                                    </select>
                                </div>
                                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                                    <div className="text-gray-600">Tahmini toplam</div>
                                    <div className="text-2xl font-semibold">{toTL(isgToplam)} ₺</div>
                                </div>
                            </div>

                            <Callout title="Nasıl çalışır? – İşgaliye" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        <span className="font-semibold">Gerekli bilgiler:</span> Alan (m²),
                                        süre (gün), bölge katsayısı (A/B/C).
                                    </li>
                                    <li>
                                        <span className="font-semibold">Formül:</span>{" "}
                                        <code>baz × m² × gün × bölgeKatsayısı</code>.
                                    </li>
                                    <li>
                                        <span className="font-semibold">Ne veriyoruz:</span> Tahmini toplam
                                        ve tabloda ilgili kalemin birimi; resmi tahakkuk başvuru
                                        aşamasında oluşur.
                                    </li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* SSS */}
                    <Section id="sss" title="A’dan Z’ye Sık Sorulan Sorular">
                        {[
                            ["Bu sayfadaki fiyatlar kesin mi?",
                                "Hayır, bu bir demo sayfasıdır. Kesin tutar Belediye Meclisi kararı ve başvuru sırasında oluşan tahakkuka göre belirlenir."],
                            ["Neden birim farklı yazıyor (TL/ay·m² gibi)?",
                                "Her kalem farklı ölçü birimine tabidir. Örneğin ilan-reklam m² ve süreye; işgaliye m² ve güne bağlıdır."],
                            ["İndirim veya muafiyetler nerede?",
                                "Meclis kararında belirtilir. Öğrenci, engelli, 65+, şehit yakını, amatör spor kulübü gibi gruplar için indirim olabilir."],
                            ["Yıl seçimini nereden değiştirebilirim?",
                                "Tarife tablosunun üstündeki yıl seçiciden değiştirilebilir; arşiv yılları da listelenir."],
                            ["JSON/CSV ne işe yarar?",
                                "Botlar, entegrasyonlar veya kıyaslama için tarife verisini dışa aktarmanızı sağlar."],
                            ["Nikâh ücreti hangi bilgilere göre hesaplanıyor?",
                                "Salon (A/B) + hafta sonu/mesai dışı/ilçe dışı ekleri + isteğe bağlı foto-video-müzik hizmetleri."],
                            ["İlan-reklamda ölçüm nasıl yapılıyor?",
                                "Toplam görünür alan m² olarak alınır ve ay sayısı ile çarpılır. Tip (tabela/pano/totem) oranı değiştirir."],
                            ["İşgaliye neleri kapsar?",
                                "Kaldırım veya meydan gibi kamusal alanların geçici kullanımını. M², gün ve bölge katsayısı üzerinden hesaplanır."],
                            ["Online ödeme yapabilir miyim?",
                                "Evet, e-belediye üzerinden yapılabilir. Bu sayfada sadece hesap/örnekler bulunur."],
                            ["Tarifeler hangi mevzuata dayanıyor?",
                                "2464 sayılı Belediye Gelirleri Kanunu ve yıllık Belediye Meclisi ücret tarifesi kararı."],
                            ["Tabelam küçük, asgari ücret var mı?",
                                "Birçok kalemde asgari bedel mevcuttur. Ölçü ve yerine göre kontrol edilerek asgari uygulanabilir."],
                            ["İlanı kısa süre asarsam (ör. 10 gün) nasıl hesaplanır?",
                                "Aylık tarifelerde ayın kesri meclis kararındaki usule göre oransal alınabilir; demo tabloda tam ay varsayılmıştır."],
                            ["İşyeri ruhsat ücreti neden ‘Formül’ yazıyor?",
                                "Faaliyet türü, risk ve m² gibi girdilere göre değiştiği için. Ayrıntı ‘İşyeri Ruhsatları’ sayfasında."],
                            ["Tarifede olmayan bir hizmet var, ne yapmalıyım?",
                                "İlgili müdürlükle iletişime geçin; özel durumlar için meclis kararı veya bireysel değerlendirme gerekir."],
                            ["Yanlış kategori seçersem ne olur?",
                                "Başvuru incelemesinde düzeltilir; tutar farkı oluşursa iade/ilave tahakkuk düzenlenir."],
                            ["Nikâh işlemlerinde iptal/iade var mı?",
                                "Meclis kararına bağlıdır. Belirli süre öncesine kadar kesintili iade yapılabilir."],
                            ["Çok yıllık sözleşmede fiyat artışı nasıl uygulanır?",
                                "Yıl değiştiğinde yeni tarife yürürlüğe girer; sözleşmede aksi yazmadıkça güncel tarife geçerlidir."],
                            ["Spor tesislerinde indirim var mı?",
                                "Engelli, öğrenci, amatör kulüp gibi statüler için indirim olabilir; ‘Spor Hizmetleri’ sayfasını kontrol edin."],
                            ["Konteyner tahsisi tek seferlik mi aylık mı?",
                                "Aylık ücretlendirilir; teslim, bakım ve toplama kuralları Temizlik Müdürlüğünce belirlenir."],
                            ["Mezarlık ücretleri neden farklı?",
                                "Ada/parsel, hizmet kapsamı (defin, nakil, bakım) ve mezarlığın statüsüne göre değişir."],
                            ["Tarife farkı çıktığında nasıl bilgilendirileceğim?",
                                "Başvuru sahibine e-posta/SMS ile bildirilir; e-belediye hesabınızdan da görüntülenir."],
                            ["CSV nasıl açılır?",
                                "Excel/Sheets gibi programlarla doğrudan açabilirsiniz."],
                            ["JSON ne zaman lazım olur?",
                                "Yazılım entegrasyonu, botun cevap üretmesi veya kurumsal raporlamalarda veri kaynağı olarak."],
                            ["Tutar yuvarlama nasıl?",
                                "Demo sayfasında en yakın tam TL’ye yuvarlanır; resmi tahakkukta meclis kararındaki usule göre hesaplanır."],
                            ["Tabelayı gece aydınlatırsam fark olur mu?",
                                "Bazı belediyelerde aydınlatmalı/ışıklı tabela için farklı tarife uygulanır; yerel karara bakılır."],
                            ["Geçici etkinlik standı hangi kalemden?",
                                "İşgaliye (açık alan kullanımı) üzerinden; m², gün ve bölge katsayısı dikkate alınır."],
                            ["Birim yanlış anlamaya çok açık, başvuru sırasında kontrol var mı?",
                                "Evet, sistem birimi tekrar gösterir ve başvuru formunda kullanıcıdan onay alır."],
                            ["Hatalı ödeme yaptım, iade süreci?",
                                "Gelirler ve ilgili müdürlük incelemesi sonucu meclis kararına göre iade/mahsup yapılabilir."],
                            ["Kurumsal toplu ilanlar için indirim var mı?",
                                "Meclis kararıyla belirlenmiş özel oranlar olabilir; ‘İlan-Reklam’ birimiyle iletişime geçin."],
                            ["Tarife PDF’si nerede?",
                                "Genellikle duyurular veya meclis kararları bölümünde yayımlanır; e-belediye ile de ilişkilidir."],
                            ["Arşiv yılındaki fiyatla başvurabilir miyim?",
                                "Hayır. Başvuru tarihinde yürürlükte olan tarife uygulanır."],
                            ["Hesaplayıcılardaki sonuçla tabloda aynı kalemi nasıl eşleştiririm?",
                                "Her hesaplayıcı, tabloda kullanılan birim ve kalem mantığıyla tasarlanmıştır; isimleri eşleşecek şekilde düzenlendi."],
                        ].map(([q, a], i) => (
                            <details key={i} className="group py-3">
                                <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-indigo-400">
                                    <span className="font-medium">{q}</span>
                                </summary>
                                <div className="prose prose-sm max-w-none py-2 text-gray-700">{a}</div>
                            </details>
                        ))}
                    </Section>

                    {/* Dışa Aktarım */}
                    <Section id="indir" title="JSON / CSV Dışa Aktarım">
                        <div className="flex flex-wrap gap-2">
                            <button
                                className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95"
                                onClick={() =>
                                    downloadJSON(
                                        `tarifeler-${year}.json`,
                                        TARIFELER.filter((t) => t.yil === year)
                                    )
                                }
                            >
                                {year} JSON indir
                            </button>
                            <button
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:opacity-95"
                                onClick={() =>
                                    downloadCSV(
                                        `tarifeler-${year}.csv`,
                                        [
                                            ["Kategori", "Kalem", "Birim", "Tutar/Formül", "Açıklama"],
                                            ...TARIFELER.filter((t) => t.yil === year).map((t) => [
                                                t.kategori,
                                                t.ad,
                                                t.birim,
                                                t.tutar != null ? `${t.tutar}` : (t.formul ?? ""),
                                                t.aciklama ?? "",
                                            ]),
                                        ]
                                    )
                                }
                            >
                                {year} CSV indir
                            </button>
                        </div>
                        {meta.aciklama && (
                            <p className="mt-3 text-xs text-gray-600">{meta.aciklama}</p>
                        )}
                    </Section>
                </main>
            </div>
        </div>
    );
}
