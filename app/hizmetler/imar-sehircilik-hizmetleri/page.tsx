"use client";

import React, { useEffect, useMemo, useState } from "react";
import ExportMenu from "@/components/ExportMenu";
import Link from "next/link";

/* ------------------------ küçük yardımcı komponentler ------------------------ */
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

/* --------------------------------- tipler ---------------------------------- */
type Coords = { lat: number; lng: number };

type ImarQuery = {
    ada?: string;
    parsel?: string;
    mahalle?: string;
    koordinat?: Coords;
};

type ImarResult = {
    planKullanimi: string;
    taks: number;
    kaks: number;
    hmax: string;
    cekme: { on: number; yan: number; arka: number };
    yolGenislik: number;
    planOlcek: "1/1000" | "1/5000";
    planNotLink?: string;
    riskUyarisi?: string;
};

type CapDurum = "Evrak Kontrol" | "Teknik İnceleme" | "Hazır (PDF)";
type CapBasvuru = {
    id: string;
    basvuruNo: string;
    tarihISO: string;
    ada: string;
    parsel: string;
    malik: string;
    iletisim: string;
    tapuBase64?: string;
    durum: CapDurum;
};

type RuhsatTuru = "yeni" | "tadilat" | "yikim" | "istinat" | "asansor" | "basit-tamir";

type YolKotuTalep = {
    id: string;
    ada: string;
    parsel: string;
    sokak: string;
    iletisim: string;
    tarihISO: string;
};

type NumaratajTalep = {
    id: string;
    bina: string;
    bagimsizSayisi: number;
    iskanVarMi: boolean;
    iletisim: string;
    tarihISO: string;
};

type HafriyatTalep = {
    id: string;
    adres: string;
    aracSayisi: number;
    tasimaGuzergah: string;
    tarihISO: string;
    iletisim: string;
};

/* -------------------------- depolama + yardımcılar -------------------------- */
const LS_CAP = "imar-cap-basvurulari";
const LS_YOLKOTU = "imar-yolkotu";
const LS_NUMARA = "imar-numarataj";
const LS_HAFRIYAT = "imar-hafriyat";

const saveLS = (k: string, v: unknown) => {
    try {
        localStorage.setItem(k, JSON.stringify(v));
    } catch { }
};
const loadLS = <T,>(k: string, def: T): T => {
    try {
        const s = localStorage.getItem(k);
        if (!s) return def;
        return JSON.parse(s) as T;
    } catch {
        return def;
    }
};

const toBase64 = (file?: File) =>
    new Promise<string>((resolve) => {
        if (!file) return resolve("");
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.readAsDataURL(file);
    });

const downloadJSON = (filename: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

/* ------------------------- demo: e-imar hesaplayıcı ------------------------- */
function fakeImarHesap(q: ImarQuery): ImarResult {
    const key =
        Number((q.ada || "0").slice(-1) || 0) + Number((q.parsel || "0").slice(-1) || 0);
    const zonlar = [
        { k: "Ayrık Nizam Konut", t: 0.35, kx: 1.5, h: "9.50", on: 5, yan: 3, arka: 3, yol: 10 },
        { k: "Bitişik Nizam Ticaret", t: 0.60, kx: 2.0, h: "Serbest", on: 0, yan: 0, arka: 3, yol: 12 },
        { k: "Konut+Ticaret Karma", t: 0.40, kx: 1.8, h: "Serbest", on: 5, yan: 3, arka: 3, yol: 15 },
        { k: "Düşük Yoğunluklu Konut", t: 0.30, kx: 1.2, h: "6.50", on: 5, yan: 3, arka: 3, yol: 8 },
    ];
    const pick = zonlar[key % zonlar.length];
    return {
        planKullanimi: pick.k,
        taks: pick.t,
        kaks: pick.kx,
        hmax: pick.h,
        cekme: { on: pick.on, yan: pick.yan, arka: pick.arka },
        yolGenislik: pick.yol,
        planOlcek: (key % 2 ? "1/1000" : "1/5000") as "1/1000" | "1/5000",
        planNotLink: "#",
        riskUyarisi:
            key % 5 === 0 ? "Dikkat: Taşkın/heyelan önlemleri için zemin etüdü güçlendirilebilir." : undefined,
    };
}

/* ---------------------------- ruhsat belge şablonu --------------------------- */
const RUHSAT_BELGE: Record<RuhsatTuru, string[]> = {
    yeni: [
        "Mimari proje",
        "Statik proje",
        "Elektrik projesi",
        "Mekanik tesisat projesi",
        "Zemin etüdü",
        "İmar Çapı",
        "Yapı denetim sözleşmesi",
        "İtfaiye/otopark uygunluğu",
        "Tapu/vekâlet",
    ],
    tadilat: [
        "Onaylı mevcut proje",
        "Değişiklik mimarisi",
        "Statik uygunluk raporu",
        "Apartman kararı (gerekirse)",
    ],
    yikim: ["Yıkım projesi", "İSG planı", "Elektrik-su kesme yazıları", "Mülkiyet evrakı"],
    istinat: ["Vaziyet planı", "Statik proje/hesap", "Zemin raporu", "Komşu muvafakatı (gerekirse)"],
    asansor: [
        "Tadilat mimarisi",
        "Statik takviye projesi",
        "Asansör makina/elektrik projeleri",
        "Kat malikleri kararı",
    ],
    "basit-tamir": ["Bilgilendirme formu", "Fotoğraflar", "Taşıyıcıya müdahale yok beyanı"],
};

/* ------------------------------- plan askıları ------------------------------- */
const PLAN_ASKILARI = [
    {
        id: "pa1",
        mahalle: "Merkez",
        konu: "1/1000 UİP Revizyonu – Ticaret karma kullanım",
        pdf: "#",
        askibas: "2025-04-01",
        askibitis: "2025-05-01",
    },
    {
        id: "pa2",
        mahalle: "Sahil",
        konu: "Kıyı bandı rekreasyon alanı plan notu değişikliği",
        pdf: "#",
        askibas: "2025-05-10",
        askibitis: "2025-06-10",
    },
    {
        id: "pa3",
        mahalle: "OSB",
        konu: "Sanayi bölgesi yapı yüksekliği düzenlemesi",
        pdf: "#",
        askibas: "2025-03-20",
        askibitis: "2025-04-20",
    },
];

/* ================================== SAYFA ================================== */
export default function PageImarSehircilik() {
    const yil = new Date().getFullYear();

    /* E-İMAR */
    const [q, setQ] = useState<ImarQuery>({ ada: "", parsel: "", mahalle: "" });
    const [res, setRes] = useState<ImarResult | null>(null);

    /* TAKS-KAKS hesap */
    const [parselAlan, setParselAlan] = useState<number>(0);
    const [taksInput, setTaksInput] = useState<number>(0.4);
    const [kaksInput, setKaksInput] = useState<number>(1.5);
    const [hmaxGirdi, setHmaxGirdi] = useState<string>("9.50");

    const oturum = useMemo(() => Math.max(0, parselAlan * (taksInput || 0)), [parselAlan, taksInput]);
    const toplamInsaat = useMemo(() => Math.max(0, parselAlan * (kaksInput || 0)), [parselAlan, kaksInput]);
    const tahminiKat = useMemo(() => {
        if (!oturum || !toplamInsaat) return 0;
        return Math.max(1, Math.round(toplamInsaat / oturum));
    }, [oturum, toplamInsaat]);

    /* Başvurular */
    const [caps, setCaps] = useState<CapBasvuru[]>([]);
    const [capForm, setCapForm] = useState<Omit<CapBasvuru, "id" | "basvuruNo" | "durum" | "tarihISO">>({
        ada: "",
        parsel: "",
        malik: "",
        iletisim: "",
        tapuBase64: "",
    });

    const [yolKotu, setYolKotu] = useState<YolKotuTalep[]>([]);
    const [numarataj, setNumarataj] = useState<NumaratajTalep[]>([]);
    const [hafriyat, setHafriyat] = useState<HafriyatTalep[]>([]);

    useEffect(() => {
        setCaps(loadLS<CapBasvuru[]>(LS_CAP, []));
        setYolKotu(loadLS<YolKotuTalep[]>(LS_YOLKOTU, []));
        setNumarataj(loadLS<NumaratajTalep[]>(LS_NUMARA, []));
        setHafriyat(loadLS<HafriyatTalep[]>(LS_HAFRIYAT, []));
    }, []);

    const handleImarSorgu = (e: React.FormEvent) => {
        e.preventDefault();
        const r = fakeImarHesap(q);
        setRes(r);
    };

    const submitCap = (e: React.FormEvent) => {
        e.preventDefault();
        if (!capForm.ada || !capForm.parsel || !capForm.malik || !capForm.iletisim) {
            alert("Ada, parsel, malik ve iletişim zorunludur.");
            return;
        }
        const kayit: CapBasvuru = {
            id: crypto.randomUUID(),
            basvuruNo: "CAP-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
            tarihISO: new Date().toISOString(),
            ada: capForm.ada,
            parsel: capForm.parsel,
            malik: capForm.malik,
            iletisim: capForm.iletisim,
            tapuBase64: capForm.tapuBase64,
            durum: "Evrak Kontrol",
        };
        const y = [kayit, ...caps];
        setCaps(y);
        saveLS(LS_CAP, y);
        alert("Başvurunuz alındı. Başvuru No: " + kayit.basvuruNo);
        setCapForm({ ada: "", parsel: "", malik: "", iletisim: "", tapuBase64: "" });
    };

    const simuleCapIlerlet = (id: string) => {
        setCaps((prev) => {
            const y = prev.map((c) => {
                if (c.id !== id) return c;
                const next: CapDurum =
                    c.durum === "Evrak Kontrol"
                        ? "Teknik İnceleme"
                        : c.durum === "Teknik İnceleme"
                            ? "Hazır (PDF)"
                            : "Hazır (PDF)";
                return { ...c, durum: next };
            });
            saveLS(LS_CAP, y);
            return y;
        });
    };

    const submitYolKotu = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const ada = (form.elements.namedItem("yk-ada") as HTMLInputElement).value.trim();
        const parsel = (form.elements.namedItem("yk-parsel") as HTMLInputElement).value.trim();
        const sokak = (form.elements.namedItem("yk-sokak") as HTMLInputElement).value.trim();
        const iletisim = (form.elements.namedItem("yk-iletisim") as HTMLInputElement).value.trim();
        if (!ada || !parsel || !sokak || !iletisim) return alert("Tüm alanlar zorunludur.");
        const rec: YolKotuTalep = {
            id: crypto.randomUUID(),
            ada,
            parsel,
            sokak,
            iletisim,
            tarihISO: new Date().toISOString(),
        };
        const y = [rec, ...yolKotu];
        setYolKotu(y);
        saveLS(LS_YOLKOTU, y);
        form.reset();
        alert("Yol kotu talebiniz alındı.");
    };

    const submitNumarataj = (e: React.FormEvent) => {
        e.preventDefault();
        const f = e.target as HTMLFormElement;
        const bina = (f.elements.namedItem("nm-bina") as HTMLInputElement).value.trim();
        const bagimsiz = Number((f.elements.namedItem("nm-bagimsiz") as HTMLInputElement).value || "0");
        const iskan = (f.elements.namedItem("nm-iskan") as HTMLInputElement).checked;
        const iletisim = (f.elements.namedItem("nm-iletisim") as HTMLInputElement).value.trim();
        if (!bina || !bagimsiz || !iletisim) return alert("Lütfen gerekli alanları doldurun.");
        const rec: NumaratajTalep = {
            id: crypto.randomUUID(),
            bina,
            bagimsizSayisi: bagimsiz,
            iskanVarMi: iskan,
            iletisim,
            tarihISO: new Date().toISOString(),
        };
        const y = [rec, ...numarataj];
        setNumarataj(y);
        saveLS(LS_NUMARA, y);
        f.reset();
        alert("Numarataj talebiniz alındı.");
    };

    const submitHafriyat = (e: React.FormEvent) => {
        e.preventDefault();
        const f = e.target as HTMLFormElement;
        const adres = (f.elements.namedItem("hf-adres") as HTMLInputElement).value.trim();
        const aracSayisi = Number((f.elements.namedItem("hf-arac") as HTMLInputElement).value || "0");
        const guzergah = (f.elements.namedItem("hf-guzergah") as HTMLInputElement).value.trim();
        const iletisim = (f.elements.namedItem("hf-iletisim") as HTMLInputElement).value.trim();
        if (!adres || !aracSayisi || !guzergah || !iletisim) return alert("Lütfen gerekli alanları doldurun.");
        const rec: HafriyatTalep = {
            id: crypto.randomUUID(),
            adres,
            aracSayisi,
            tasimaGuzergah: guzergah,
            tarihISO: new Date().toISOString(),
            iletisim,
        };
        const y = [rec, ...hafriyat];
        setHafriyat(y);
        saveLS(LS_HAFRIYAT, y);
        f.reset();
        alert("Hafriyat bildiriminiz alındı.");
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-blue-50 via-white to-emerald-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">İmar ve Şehircilik Hizmetleri</h1>
                        <p className="mt-3 text-gray-700">
                            Parselinizin imar durumu, imar çapı başvurusu, ruhsat süreç asistanı, yol kotu ve
                            numarataj işlemleri; plan askıları ve{" "}
                            <span className="font-semibold">TAKS/KAKS hızlı hesap</span> bu sayfada.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="success">Vatandaşa Yönelik</Badge>
                            <Badge tone="info">E-İmar (Demo)</Badge>
                            <Badge tone="warning">Hesaplar Yaklaşıktır</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* vaat şeridi */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🗂️</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">3 iş günü</div>
                        <div className="text-sm text-gray-600">Evrak ön kontrol hedefi</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>📐</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">TAKS/KAKS</div>
                        <div className="text-sm text-gray-600">Hızlı (yaklaşık) hesap</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>📜</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">{yil}</div>
                        <div className="text-sm text-gray-600">Güncel plan askıları</div>
                    </div>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["eimar", "E-İmar Durumu Sorgu"],
                            ["cap", "İmar Çapı Başvurusu"],
                            ["hesap", "TAKS / KAKS Hesabı"],
                            ["ruhsat", "Ruhsat Süreç Asistanı"],
                            ["yolkotu", "Yol Kotu Talebi"],
                            ["numarataj", "Numarataj / Adres"],
                            ["hafriyat", "Hafriyat-Kazı Bildirimi"],
                            ["askilar", "Plan Askıları"],
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

                {/* içerik */}
                <main className="space-y-10">
                    {/* E-İMAR */}
                    <Section id="eimar" title="E-İmar Durumu Sorgu (Demo)">
                        <form onSubmit={handleImarSorgu} className="rounded-xl border bg-white p-4">
                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    placeholder="Mahalle"
                                    value={q.mahalle || ""}
                                    onChange={(e) => setQ((s) => ({ ...s, mahalle: e.target.value }))}
                                />
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    placeholder="Ada"
                                    value={q.ada || ""}
                                    onChange={(e) => setQ((s) => ({ ...s, ada: e.target.value }))}
                                />
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    placeholder="Parsel"
                                    value={q.parsel || ""}
                                    onChange={(e) => setQ((s) => ({ ...s, parsel: e.target.value }))}
                                />
                            </div>
                            <div className="mt-3">
                                <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                    Sorgula
                                </button>
                                {res && (
                                    <ExportMenu 
                    data={{ query: q} 
                    filename="e-imar-sonuc.json"
                    resourceId="imar_sehircilik_hizmetleri"
                  />
                                )}
                            </div>
                        </form>

                        {res && (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border bg-white p-4">
                                    <h3 className="mb-2 font-semibold">Özet</h3>
                                    <div className="space-y-1 text-sm">
                                        <div>
                                            Plan Kullanımı: <span className="font-semibold">{res.planKullanimi}</span> ({res.planOlcek})
                                        </div>
                                        <div>
                                            TAKS: <span className="font-semibold">{res.taks.toFixed(2)}</span> • KAKS (Emsal):{" "}
                                            <span className="font-semibold">{res.kaks.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            Maks. Yükseklik (Hmax): <span className="font-semibold">{res.hmax}</span>
                                        </div>
                                        <div>
                                            Çekme (m): Ön {res.cekme.on} • Yan {res.cekme.yan} • Arka {res.cekme.arka}
                                        </div>
                                        <div>Planlanan Yol Genişliği: {res.yolGenislik} m</div>
                                        {res.planNotLink && (
                                            <div>
                                                Plan Notları:{" "}
                                                <a className="text-blue-700 underline" href={res.planNotLink}>
                                                    görüntüle
                                                </a>
                                            </div>
                                        )}
                                        {res.riskUyarisi && <div className="text-amber-700">⚠ {res.riskUyarisi}</div>}
                                    </div>
                                </div>
                                <Callout title="Bu sorgu nasıl çalışır? – Girdi/Çıktı/Süre" tone="info">
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>
                                            <span className="font-semibold">Gerekli bilgiler:</span> Mahalle, Ada, Parsel (veya koordinat).
                                        </li>
                                        <li>
                                            <span className="font-semibold">Anında verilen çıktı:</span> Plan kullanımı, TAKS, KAKS, Hmax, çekme mesafeleri, yol genişliği ve plan ölçeği. Sonuçlar bilgilendirme amaçlıdır.
                                        </li>
                                        <li>
                                            <span className="font-semibold">Resmî işlem:</span> Her türlü ruhsat/uygulama için <a href="#cap" className="text-blue-700 underline">İmar Çapı</a> alınması zorunludur.
                                        </li>
                                        <li>
                                            <span className="font-semibold">Gizlilik:</span> Bu sorgu anonimdir; kişisel veriniz kaydedilmez (demo).
                                        </li>
                                    </ul>
                                </Callout>
                            </div>
                        )}
                    </Section>

                    {/* İMAR ÇAPI */}
                    <Section id="cap" title="İmar Çapı Başvurusu">
                        <form onSubmit={submitCap} className="rounded-xl border bg-white p-4">
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    placeholder="Ada"
                                    value={capForm.ada}
                                    onChange={(e) => setCapForm((s) => ({ ...s, ada: e.target.value }))}
                                />
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    placeholder="Parsel"
                                    value={capForm.parsel}
                                    onChange={(e) => setCapForm((s) => ({ ...s, parsel: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    placeholder="Malik Ad Soyad"
                                    value={capForm.malik}
                                    onChange={(e) => setCapForm((s) => ({ ...s, malik: e.target.value }))}
                                />
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    placeholder="İletişim (e-posta/telefon)"
                                    value={capForm.iletisim}
                                    onChange={(e) => setCapForm((s) => ({ ...s, iletisim: e.target.value }))}
                                />
                            </div>
                            <div className="mt-2">
                                <label className="block text-sm text-gray-600">Tapu (PDF/JPG - opsiyonel)</label>
                                <input
                                    className="w-full rounded-lg border px-3 py-2"
                                    type="file"
                                    accept=".pdf,image/*"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        toBase64(f).then((b64) =>
                                            setCapForm((s) => ({ ...s, tapuBase64: b64 }))
                                        );
                                    }}
                                />
                            </div>
                            <div className="mt-3">
                                <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                    Başvuru Gönder
                                </button>
                                <button
                                    type="button"
                                    className="ml-2 rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95"
                                    onClick={() => downloadJSON("cap-basvuru-ornek.json", capForm)}
                                >
                                    JSON indir (örnek)
                                </button>
                            </div>
                        </form>

                        <div className="mt-4 rounded-xl border bg-white p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <h3 className="font-semibold">Başvuru Takip</h3>
                                <button
                                    className="rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
                                    onClick={() => downloadJSON("cap-basvurular.json", caps)}
                                >
                                    Tümünü JSON indir
                                </button>
                            </div>
                            {caps.length === 0 ? (
                                <p className="text-sm text-gray-600">Kayıt bulunamadı.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="px-3 py-2 text-left">Başvuru No</th>
                                                <th className="px-3 py-2 text-left">Ada/Parsel</th>
                                                <th className="px-3 py-2 text-left">Malik</th>
                                                <th className="px-3 py-2 text-left">Durum</th>
                                                <th className="px-3 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {caps.map((c) => (
                                                <tr key={c.id} className="border-b">
                                                    <td className="px-3 py-2">{c.basvuruNo}</td>
                                                    <td className="px-3 py-2">
                                                        {c.ada}/{c.parsel}
                                                    </td>
                                                    <td className="px-3 py-2">{c.malik}</td>
                                                    <td className="px-3 py-2">
                                                        <Badge tone={c.durum === "Hazır (PDF)" ? "success" : "info"}>{c.durum}</Badge>
                                                    </td>
                                                    <td className="px-3 py-2 space-x-2">
                                                        <button
                                                            className="rounded-lg bg-gray-100 px-3 py-1.5 hover:bg-gray-200"
                                                            onClick={() => simuleCapIlerlet(c.id)}
                                                        >
                                                            İlerle (demo)
                                                        </button>
                                                        <ExportMenu 
                    data={c} 
                    filename={`${c.basvuruNo}.json`}
                    resourceId="imar_sehircilik_hizmetleri"
                  />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <Callout title="Sistem nasıl işler? – İmar Çapı" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li>
                                    <span className="font-semibold">Gerekli bilgiler:</span> Ada–Parsel, <span className="font-semibold">malik adı</span> ve <span className="font-semibold">e-posta/telefon</span>. Opsiyonel: Tapu görseli/PDF.
                                </li>
                                <li>
                                    <span className="font-semibold">Başvuru oluşturma:</span> Bilgileri gönderince sistem bir <span className="font-semibold">Başvuru No</span> üretir ve ekranda/epostada gösterir.
                                </li>
                                <li>
                                    <span className="font-semibold">İş akışı:</span> Evrak Ön Kontrol (≈3 iş günü) → Teknik İnceleme (≈10 iş günü) → <span className="font-semibold">E-imzalı PDF Çap</span> hazır olduğunda e-posta ile iletilir.
                                </li>
                                <li>
                                    <span className="font-semibold">Takip:</span> Bu sayfadaki “Başvuru Takip”ten veya e-postadaki linkten, <span className="font-semibold">Başvuru No</span> ile.
                                </li>
                                <li>
                                    <span className="font-semibold">Gizlilik:</span> Kimlik/tapu verileri yalnızca çap üretimi amacıyla işlenir; başvuru kapandıktan sonra mevzuat süresi kadar saklanır (demo metni).
                                </li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* TAKS-KAKS */}
                    <Section id="hesap" title="TAKS / KAKS (Emsal) Hızlı Hesap">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <div className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="number"
                                        min={0}
                                        placeholder="Parsel Alanı (m²)"
                                        value={parselAlan || ""}
                                        onChange={(e) => setParselAlan(parseFloat(e.target.value || "0"))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="number"
                                        min={0}
                                        max={1}
                                        step="0.05"
                                        placeholder="TAKS"
                                        value={taksInput}
                                        onChange={(e) => setTaksInput(parseFloat(e.target.value || "0"))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="number"
                                        min={0}
                                        step="0.1"
                                        placeholder="KAKS"
                                        value={kaksInput}
                                        onChange={(e) => setKaksInput(parseFloat(e.target.value || "0"))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Hmax (ör. 9.50)"
                                        value={hmaxGirdi}
                                        onChange={(e) => setHmaxGirdi(e.target.value)}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-600">
                                    Sonuçlar yaklaşık ve bilgilendirme amaçlıdır. Bağlayıcı değerler plan notları ve
                                    teknik kontrol sonucunda belirlenir.
                                </p>
                            </div>
                            <div className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <div className="text-gray-600">Oturum Alanı (≈)</div>
                                        <div className="text-lg font-semibold">{oturum.toFixed(2)} m²</div>
                                    </div>
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <div className="text-gray-600">Toplam İnşaat Alanı (≈)</div>
                                        <div className="text-lg font-semibold">{toplamInsaat.toFixed(2)} m²</div>
                                    </div>
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <div className="text-gray-600">Tahmini Kat Adedi</div>
                                        <div className="text-lg font-semibold">{tahminiKat}</div>
                                    </div>
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <div className="text-gray-600">Hmax</div>
                                        <div className="text-lg font-semibold">{hmaxGirdi || "-"}</div>
                                    </div>
                                </div>
                                <Callout title="Nasıl çalışır? – TAKS/KAKS Hesabı" tone="info">
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><span className="font-semibold">Gerekli bilgiler:</span> Parsel alanı, TAKS, KAKS ve Hmax (plan notlarından).</li>
                                        <li><span className="font-semibold">Çıktı:</span> Yaklaşık oturum alanı, toplam inşaat alanı ve tahmini kat adedi.</li>
                                        <li><span className="font-semibold">Uyarı:</span> Net sonuç için imar çapı ve proje kontrolü gerekir; istisnalar plan notlarında yer alır.</li>
                                    </ul>
                                </Callout>
                            </div>
                        </div>
                    </Section>

                    {/* RUHSAT SÜREÇ ASİSTANI */}
                    <Section id="ruhsat" title="Yapı Ruhsatı Süreç Asistanı">
                        <RuhsatAsistani />
                        <Callout title="Sistem nasıl işler? – Ruhsat Asistanı" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Ön seçim:</span> İş türünü belirleyin (yeni, tadilat, yıkım vb.).</li>
                                <li><span className="font-semibold">Çıktı:</span> İlgili iş türü için <span className="font-semibold">zorunlu belge listesi</span> ve açıklamalar.</li>
                                <li><span className="font-semibold">Devamı:</span> Proje dosyalarınızı hazırlayıp başvuru ekranından yükleyin; ön kontrol (≈3 iş günü), teknik inceleme (≈10 iş günü) hedeflenir.</li>
                                <li><span className="font-semibold">Bildirim:</span> E-posta/telefon üzerinden durum bilgilendirmesi yapılır (demo).</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* YOL KOTU */}
                    <Section id="yolkotu" title="Yol Kotu / İrtifa-Kesit Talebi">
                        <form onSubmit={submitYolKotu} className="rounded-xl border bg-white p-4">
                            <div className="grid grid-cols-4 gap-2">
                                <input className="rounded-lg border px-3 py-2" name="yk-ada" placeholder="Ada" />
                                <input className="rounded-lg border px-3 py-2" name="yk-parsel" placeholder="Parsel" />
                                <input className="rounded-lg border px-3 py-2" name="yk-sokak" placeholder="Sokak/Cadde" />
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    name="yk-iletisim"
                                    placeholder="İletişim (e-posta/telefon)"
                                />
                            </div>
                            <div className="mt-3">
                                <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                    Talep Gönder
                                </button>
                                <ExportMenu 
                    data={yolKotu} 
                    filename="yolkotu-talepleri.json"
                    resourceId="imar_sehircilik_hizmetleri"
                  />
                            </div>
                        </form>
                        {yolKotu.length > 0 && (
                            <div className="mt-3 rounded-xl border bg-white p-4 text-sm">
                                <h3 className="mb-2 font-semibold">Son Talepler</h3>
                                <ul className="space-y-1">
                                    {yolKotu.map((y) => (
                                        <li key={y.id}>
                                            {y.ada}/{y.parsel} – {y.sokak} • {new Date(y.tarihISO).toLocaleString()}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <Callout title="Sistem nasıl işler? – Yol Kotu" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Gerekli bilgiler:</span> Ada–Parsel, Sokak/Cadde adı ve <span className="font-semibold">e-posta/telefon</span>.</li>
                                <li><span className="font-semibold">Çıktı:</span> E-imzalı <span className="font-semibold">Yol Kotu Tutanağı (PDF)</span> ve kesit; projede kullanılmak üzere verilir.</li>
                                <li><span className="font-semibold">Süre:</span> Evrak tam ise 5–7 iş günü hedef (demo).</li>
                                <li><span className="font-semibold">Takip:</span> Başvuru No ile bu sayfadan; e-posta ile bilgilendirme yapılır.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* NUMARATAJ */}
                    <Section id="numarataj" title="Numarataj / Adres Tescil/Düzeltme">
                        <form onSubmit={submitNumarataj} className="rounded-xl border bg-white p-4">
                            <div className="grid grid-cols-4 gap-2">
                                <input className="rounded-lg border px-3 py-2" name="nm-bina" placeholder="Bina/Adres" />
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    name="nm-bagimsiz"
                                    placeholder="Bağımsız Bölüm Sayısı"
                                    type="number"
                                    min={1}
                                />
                                <label className="flex items-center gap-2 rounded-lg border px-3 py-2">
                                    <input name="nm-iskan" type="checkbox" /> İskân var
                                </label>
                                <input className="rounded-lg border px-3 py-2" name="nm-iletisim" placeholder="İletişim (e-posta/telefon)" />
                            </div>
                            <div className="mt-3">
                                <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                    Başvuru Gönder
                                </button>
                                <ExportMenu 
                    data={numarataj} 
                    filename="numarataj-basvurular.json"
                    resourceId="imar_sehircilik_hizmetleri"
                  />
                            </div>
                        </form>
                        {numarataj.length > 0 && (
                            <div className="mt-3 rounded-xl border bg-white p-4 text-sm">
                                <h3 className="mb-2 font-semibold">Son Başvurular</h3>
                                <ul className="space-y-1">
                                    {numarataj.map((n) => (
                                        <li key={n.id}>
                                            {n.bina} – {n.bagimsizSayisi} bb • {n.iskanVarMi ? "İskân var" : "İskân yok"} •{" "}
                                            {new Date(n.tarihISO).toLocaleString()}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <Callout title="Sistem nasıl işler? – Numarataj" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Gerekli bilgiler:</span> Bina/Adres, bağımsız bölüm sayısı, iskân var/yok ve <span className="font-semibold">e-posta/telefon</span>.</li>
                                <li><span className="font-semibold">Çıktı:</span> E-imzalı <span className="font-semibold">Adres Tescil/Düzeltme Yazısı</span> ve kapı numarası/plaka işlemleri (demo).</li>
                                <li><span className="font-semibold">Süre:</span> 3–5 iş günü hedef (demo); büyük sitelerde süre değişebilir.</li>
                                <li><span className="font-semibold">Takip:</span> Başvuru No ve e-posta bilgilendirmeleriyle.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* HAFRİYAT */}
                    <Section id="hafriyat" title="Hafriyat / Kazı Bildirimi">
                        <form onSubmit={submitHafriyat} className="rounded-xl border bg-white p-4">
                            <div className="grid grid-cols-4 gap-2">
                                <input className="rounded-lg border px-3 py-2" name="hf-adres" placeholder="Şantiye Adresi" />
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    name="hf-arac"
                                    type="number"
                                    min={1}
                                    placeholder="Araç Sayısı"
                                />
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    name="hf-guzergah"
                                    placeholder="Taşıma Güzergâhı"
                                />
                                <input className="rounded-lg border px-3 py-2" name="hf-iletisim" placeholder="İletişim (e-posta/telefon)" />
                            </div>
                            <div className="mt-3">
                                <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                    Bildirim Gönder
                                </button>
                                <ExportMenu 
                    data={hafriyat} 
                    filename="hafriyat-bildirimleri.json"
                    resourceId="imar_sehircilik_hizmetleri"
                  />
                            </div>
                        </form>
                        <Callout title="Sistem nasıl işler? – Hafriyat" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Gerekli bilgiler:</span> Şantiye adresi, araç sayısı, taşıma güzergâhı ve <span className="font-semibold">e-posta/telefon</span>.</li>
                                <li><span className="font-semibold">Çıktı:</span> <span className="font-semibold">Kazı-Hafriyat Uyum Yazısı</span>, döküm alanı ve güzergâh onayı (demo).</li>
                                <li><span className="font-semibold">Süre:</span> 1–3 iş günü hedef; koordinasyon gerektirir.</li>
                                <li><span className="font-semibold">Kurallar:</span> Gece taşıma ve çevreye zarar yasaktır; Zabıta denetimi yapılır.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* PLAN ASKILARI */}
                    <Section id="askilar" title="Plan Askıları & İtiraz Takibi (Demo)">
                        <div className="rounded-xl border bg-white p-4">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="px-3 py-2 text-left">Mahalle</th>
                                            <th className="px-3 py-2 text-left">Konu</th>
                                            <th className="px-3 py-2 text-left">Askı</th>
                                            <th className="px-3 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {PLAN_ASKILARI.map((p) => (
                                            <tr key={p.id} className="border-b">
                                                <td className="px-3 py-2">{p.mahalle}</td>
                                                <td className="px-3 py-2">{p.konu}</td>
                                                <td className="px-3 py-2">
                                                    {p.askibas} → {p.askibitis}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <a className="rounded-lg bg-gray-900 px-3 py-1.5 text-white hover:opacity-95" href={p.pdf}>
                                                        PDF
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <Callout title="Sistem nasıl işler? – Plan Askıları/İtiraz" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">İnceleme:</span> İlgili planın PDF’sini görüntüleyin, askı başlangıç/bitiş tarihlerini kontrol edin.</li>
                                <li><span className="font-semibold">İtiraz için gerekenler:</span> Ad-Soyad, TCKN, adres, konu ve gerekçenizi içeren dilekçe; e-posta/telefon.</li>
                                <li><span className="font-semibold">Süre:</span> Askı bitiş gününde saat 17:00’ye kadar başvuru yapılmalıdır.</li>
                                <li><span className="font-semibold">Sonuç:</span> Komisyon değerlendirmesi sonrası karar yazısı yayımlanır ve e-posta ile bildirilir (demo).</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* SSS */}
                    <Section id="sss" title="A’dan Z’ye Sık Sorulan Sorular">
                        {[
                            ["Aplikasyon krokisi gerekli mi?", "İfraz/tevhid, ruhsat ve sınır tespitinde zorunludur; lisanslı harita bürosu hazırlar, belediye kontrol eder."],
                            ["Asansör ilavesi için ruhsat gerekir mi?", "Evet. Ortak alan müdahalesi olduğu için tadilat ruhsatı ve proje onayları zorunludur."],
                            ["Balkon kapatma serbest mi?", "Cepheyi etkilediğinden çoğu durumda ruhsatlı tadilat gerekir; imar durumunuzu kontrol edin."],
                            ["Çekme mesafesi nedir?", "Bina ile parsel sınırı arasındaki zorunlu boşluklardır (ön/yan/arka)."],
                            ["Çatı arasını odaya çevirebilir miyim?", "Plan notları ve Hmax’a bağlıdır; genellikle tadilat ruhsatı gerekir."],
                            ["Dış cephe boya değişimi için izin?", "Renk/kaplama değişikliği cephe bütünlüğünü etkiliyorsa onaylı renk paleti ve bildirim istenir."],
                            ["Emsal (KAKS) nasıl hesaplanır?", "Toplam inşaat alanı ≈ parsel alanı × KAKS; istisnalar plan notlarında belirtilir."],
                            ["Farklı kullanım (konut→ofis) olur mu?", "Plan kararına bağlıdır; cins değişikliği ve ruhsat/iskan uygunluğu aranır."],
                            ["GES (güneş paneli) için izin?", "Statik ve yangın koşulları sağlanarak tadilat projesiyle mümkündür."],
                            ["Hmax ne demek?", "Bina kotundan itibaren izin verilen azami yapı yüksekliği."],
                            ["İfraz/tevhid ne kadar sürer?", "Teknik inceleme + encümen 10–20 iş günü hedef; tapu tescili ayrıdır."],
                            ["İskân (Yapı Kullanma) nasıl alınır?", "Ruhsata uygun bitiş, denetim raporları, otopark/yangın uygunlukları ve abonelik yazıları gerekir."],
                            ["Jeolojik/zemin etüdü gerekli mi?", "Yeni yapı, kat artışı ve istinat duvarlarında zorunludur."],
                            ["Kapalı otopark şartı kimde var?", "Plan notlarına ve bağımsız bölüm sayısına göre değişir."],
                            ["Kazı izni nasıl alınır?", "Ruhsat/şantiye planı, taşıma planı ve döküm alanı bildirimi ile ‘Kazı-Hafriyat Uyum Yazısı’ verilir."],
                            ["Loggia/teras kapatma?", "Taşıyıcı/cepheyi etkiler; ruhsata tabidir."],
                            ["Metruk yapı yıkımı?", "Malik başvurusu veya resen; can güvenliği riski varsa Zabıta/İmar birlikte işlem yapar."],
                            ["Numarataj nasıl alınır?", "İskândan sonra başvuru; kapı plakası bedeli tarifeye göre ödenir, yazı e-imzalı verilir."],
                            ["Otopark bedeli ödenebilir mi?", "Parselde karşılanamıyorsa, plan/karara göre bedel uygulanabilir."],
                            ["Ön proje değerlendirme var mı?", "Talep üzerine ön inceleme yapılabilir; bağlayıcı değildir."],
                            ["Plan notlarına nereden bakarım?", "E-İmar çıktısında ‘Plan Notları’ bağlantısı vardır; ayrıca Plan Askıları bölümünde yayımlanır."],
                            ["Ruhsat uzatma/yenileme?", "Süre dolmadan tadil belgesiyle uzatma yapılabilir; mevzuat sürelerine uyulur."],
                            ["Sığınak zorunluluğu?", "Yapının büyüklüğü ve kullanımına göre değişir; proje aşamasında kontrol edilir."],
                            ["Şantiye elektriği/suyu için yazılar?", "Ruhsat ve kurumların bağlantı uygunluk yazıları gerekir."],
                            ["Tadilatlarda ortak alan kararı?", "Ortak alanı etkileyen işlemlerde kat maliklerinin kararı aranabilir."],
                            ["Uygulama imar planına itiraz nasıl?", "Plan Askıları ekranından planı seçip itiraz formu oluşturun; süresi içinde başvurun."],
                            ["Üst kat kapatma/asma kat?", "Yangın güvenliği ve statik nedenlerle tadilat ruhsatı zorunludur."],
                            ["Vaziyet planında yol genişliği değişti; ne olur?", "Çekmeler ve kot etkilenir; güncel plana göre revizyon gerekir."],
                            ["Yağmur suyu/atıksu bağlantısı?", "Altyapı kurumlarının onayıyla projelendirilir; çatı suları uygun şekilde deşarj edilir."],
                            ["Zorunlu yangın önlemleri?", "Kullanıma göre merdiven, sprinkler, algılama vb. projeleri şarttır; itfaiye uygunluğu alınır."],
                        ].map(([q, a], i) => (
                            <details key={i} className="group py-3">
                                <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-blue-400">
                                    <span className="font-medium">{q}</span>
                                </summary>
                                <div className="prose prose-sm max-w-none py-2 text-gray-700">{a}</div>
                            </details>
                        ))}
                    </Section>

                    {/* İLETİŞİM */}
                    <Section id="iletisim" title="İletişim">
                        <p>
                            <span className="font-semibold">İmar ve Şehircilik Müdürlüğü</span>
                        </p>
                        <p>Çağrı Merkezi: 444 0 XXX • Alo 153</p>
                        <p>
                            E-posta:{" "}
                            <a className="text-blue-700 underline" href="mailto:imar@birimajans.bel.tr">
                                imar@birimajans.bel.tr
                            </a>
                        </p>
                        <p>Adres: Belediye Hizmet Binası, [adres]</p>
                        <div className="mt-3 flex gap-2">
                            <Link
                                href="/ucretler-ve-tarifeler"
                                className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95"
                            >
                                Ücret Tarifeleri
                            </Link>
                            <a
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95"
                                href="#cap"
                            >
                                İmar Çapı Başvur
                            </a>
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
}

/* --------------------------- Ruhsat Asistanı parçası --------------------------- */
function RuhsatAsistani() {
    const [tur, setTur] = useState<RuhsatTuru>("yeni");
    const belgeler = RUHSAT_BELGE[tur];

    return (
        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
            <div className="rounded-xl border bg-white p-4">
                <label className="block text-sm text-gray-600">İş Türü</label>
                <select
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={tur}
                    onChange={(e) => setTur(e.target.value as RuhsatTuru)}
                >
                    <option value="yeni">Yeni Yapı</option>
                    <option value="tadilat">Tadilat / Onarım</option>
                    <option value="yikim">Yıkım</option>
                    <option value="istinat">İstinat / Çevre Duvarı</option>
                    <option value="asansor">Asansör İlavesi</option>
                    <option value="basit-tamir">Basit Tamir-Bakım (Bildirim)</option>
                </select>
                <p className="mt-2 text-xs text-gray-600">
                    Seçiminize göre zorunlu proje ve belgeler listelenir. Bu bir{" "}
                    <span className="font-semibold">ön bilgilendirme</span> ekranıdır.
                </p>
            </div>
            <div className="rounded-xl border bg-white p-4">
                <h3 className="mb-2 font-semibold">Gerekli Belgeler</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                    {belgeler.map((b, i) => (
                        <li key={i}>{b}</li>
                    ))}
                </ul>
                <div className="mt-3">
                    <button
                        className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95"
                        onClick={() =>
                            downloadJSON(`ruhsat-${tur}.json`, {
                                isTuru: tur,
                                belgeler: belgeler,
                                aciklama:
                                    "Bu çıktı ön bilgilendirme amaçlıdır. Proje kontrolünde ilave evrak istenebilir.",
                            })
                        }
                    >
                        JSON indir
                    </button>
                </div>
                <Callout title="Nasıl çalışır? – Ruhsat Asistanı" tone="info">
                    <ul className="list-disc pl-5 space-y-1">
                        <li><span className="font-semibold">Girdi:</span> İş türü seçimi.</li>
                        <li><span className="font-semibold">Çıktı:</span> Zorunlu belge listesi ve kısa açıklamalar; başvuru aşamasında sisteme yüklersiniz.</li>
                        <li><span className="font-semibold">Süreler:</span> Ön kontrol ≈ 3 iş günü, teknik inceleme ≈ 10 iş günü (demo hedefleridir).</li>
                        <li><span className="font-semibold">Bildirim:</span> E-posta/telefon ile süreç bilgilendirmeleri yapılır.</li>
                    </ul>
                </Callout>
            </div>
        </div>
    );
}
