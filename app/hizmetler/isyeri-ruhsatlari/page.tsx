"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ExportMenu from "@/components/ExportMenu";

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
type RuhsatTipi = "sihhi" | "gayrisihhi" | "umuma-acik" | "mesruhat" | "tekil-izin";
type Risk = "düşük" | "orta" | "yüksek";

type NaceKaydi = {
    code: string;
    ad: string;
    ruhsat: RuhsatTipi;
    risk: Risk;
    etiketler: string[];
};

type BasvuruDurum = "Ön Kontrol" | "Denetim Randevusu" | "Hazır (E-imzalı Ruhsat)";

type Basvuru = {
    id: string;
    basvuruNo: string;
    tarihISO: string;
    status: BasvuruDurum;
    isletmeAdi: string;
    sahibi: string;
    vergiNo: string;
    iletisim: string;
    adres: string;
    m2: number;
    nace?: NaceKaydi;
    evraklar: string[];          // yüklenen
    not?: string;
};

type DenetimSkor = {
    toplam: number;
    uygun: number;
    oran: number;
};

/* ------------------------------ Demo veri & yardımcı --------------------------- */
const NACE: NaceKaydi[] = [
    { code: "56.10.11", ad: "Kafe / Kahvehane", ruhsat: "umuma-acik", risk: "orta", etiketler: ["gıda", "müzik", "oturma"] },
    { code: "56.10.20", ad: "Lokanta / Restoran", ruhsat: "sihhi", risk: "orta", etiketler: ["gıda", "gaz", "baca"] },
    { code: "47.11.10", ad: "Market / Bakkal", ruhsat: "sihhi", risk: "düşük", etiketler: ["gıda", "perakende"] },
    { code: "96.02.01", ad: "Berber / Kuaför", ruhsat: "sihhi", risk: "düşük", etiketler: ["kozmetik", "kişisel bakım"] },
    { code: "45.20.10", ad: "Oto Yıkama", ruhsat: "gayrisihhi", risk: "orta", etiketler: ["atık su", "gürültü"] },
    { code: "10.71.20", ad: "Fırın / Pastane Üretim", ruhsat: "gayrisihhi", risk: "yüksek", etiketler: ["gıda", "ısı", "baca"] },
    { code: "18.11.01", ad: "Matbaa / Baskı", ruhsat: "gayrisihhi", risk: "orta", etiketler: ["uçucu madde"] },
    { code: "47.62.20", ad: "Eczane", ruhsat: "mesruhat", risk: "düşük", etiketler: ["ilaç", "mesul müdür"] },
];

const EVRAK_HARITASI: Record<RuhsatTipi, string[]> = {
    "sihhi": [
        "Tapu / Kira sözleşmesi",
        "Vergi levhası (varsa geçici)",
        "Uygunluk yazısı (imar-iskan)",
        "Esnaf odası/meslek kaydı (varsa)",
        "İtfaiye uygunluğu (mutfak/gaz/baca varsa)",
        "Ustalık/mesuliyet belgesi (gerekirse)",
    ],
    "gayrisihhi": [
        "İşyeri Açma ve Çalışma Ruhsatı başvuru formu",
        "ÇED görüşü / Kapsamdışı yazısı",
        "Emisyon/Atıksu/Atık yönetimi beyanları",
        "İtfaiye uygunluğu",
        "İmar uygunluğu ve komşuluk görüşleri (gerekirse)",
    ],
    "umuma-acik": [
        "Müzik yayını bildirimi",
        "Gürültü ölçüm raporu / taahhüt",
        "Emniyet/SGK yazıları (gerekirse)",
        "İtfaiye uygunluğu (acil çıkış/kapasite)",
        "İmar uygunluğu",
    ],
    "mesruhat": [
        "Mesul müdür sözleşmesi",
        "İlaç/sağlık mevzuatına uygunluk (TİTCK vb.)",
        "Depo şartları beyanı",
        "İtfaiye uygunluğu",
    ],
    "tekil-izin": [
        "Etkinlik/periyodik izin formu",
        "Uygunluk yazısı",
    ],
};

const LS_KEY = "isyeri-ruhsat-basvurular";
const loadLS = <T,>(k: string, def: T): T => { try { const s = localStorage.getItem(k); return s ? (JSON.parse(s) as T) : def; } catch { return def; } };
const saveLS = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };

/* --------------------------------- Sayfa ------------------------------------- */
export default function IsyeriRuhsatlariPage() {
    const yil = new Date().getFullYear();

    /* başvuru veri */
    const [basvurular, setBasvurular] = useState<Basvuru[]>([]);
    useEffect(() => setBasvurular(loadLS<Basvuru[]>(LS_KEY, [])), []);

    /* sihirbaz durumu */
    const [q, setQ] = useState("");
    const [seciliNace, setSeciliNace] = useState<NaceKaydi | null>(null);
    const [form, setForm] = useState<Omit<Basvuru, "id" | "basvuruNo" | "tarihISO" | "status">>({
        isletmeAdi: "",
        sahibi: "",
        vergiNo: "",
        iletisim: "",
        adres: "",
        m2: 0,
        nace: undefined,
        evraklar: [],
        not: "",
    });
    useEffect(() => setForm((s) => ({ ...s, nace: seciliNace || undefined })), [seciliNace]);

    const naceSonuc = useMemo(
        () =>
            NACE.filter(
                (n) =>
                    n.ad.toLowerCase().includes(q.toLowerCase()) ||
                    n.code.includes(q) ||
                    n.etiketler.some((e) => e.includes(q.toLowerCase()))
            ).slice(0, 12),
        [q]
    );

    const mustList = useMemo(() => (seciliNace ? EVRAK_HARITASI[seciliNace.ruhsat] : []), [seciliNace]);

    /* denetim self-check */
    const [check, setCheck] = useState<Record<string, boolean>>({});
    const selfItems = useMemo(() => {
        const ortak = ["Acil çıkış kapısı serbest", "Yangın söndürücü mevcut ve dolu", "Elektrik panosu düzenli etiketli"];
        const gida = ["Soğuk zincir/dolap 0-4°C", "Lavabo-sıcak su var", "Haşere ile mücadele planı"];
        const gaz = ["Doğalgaz projesi onaylı", "Baca temizliği belgesi", "Gaz alarmı çalışıyor"];
        const gürültü = ["Hoparlör yönlendirmesi içe dönük", "Kapı-pencere izolasyonu", "Acil çıkış kapısı ses yalıtımlı"];
        const arr = [...ortak];
        if (seciliNace?.etiketler.includes("gıda")) arr.push(...gida);
        if (["Lokanta / Restoran", "Fırın / Pastane Üretim"].includes(seciliNace?.ad || "")) arr.push(...gaz);
        if (seciliNace?.ruhsat === "umuma-acik") arr.push(...gürültü);
        return arr;
    }, [seciliNace]);

    const skor: DenetimSkor = useMemo(() => {
        const toplam = selfItems.length;
        const uygun = selfItems.filter((k) => check[k]).length;
        return { toplam, uygun, oran: toplam ? Math.round((uygun / toplam) * 100) : 0 };
    }, [selfItems, check]);

    /* ücret hesap (demo) */
    const harc = useMemo(() => {
        if (!seciliNace) return 0;
        const baz = 500; // taban
        const riskF = seciliNace.risk === "düşük" ? 1 : seciliNace.risk === "orta" ? 1.4 : 2;
        const m2F = Math.max(1, Math.ceil((form.m2 || 0) / 50));
        return Math.round(baz * riskF * m2F);
    }, [seciliNace, form.m2]);

    /* başvuru gönder */
    const gonder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!seciliNace) return alert("Faaliyet (NACE) seçiniz.");
        if (!form.isletmeAdi || !form.sahibi || !form.iletisim || !form.adres) return alert("Temel alanları doldurun.");
        const rec: Basvuru = {
            id: crypto.randomUUID(),
            basvuruNo: "RHS-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
            tarihISO: new Date().toISOString(),
            status: "Ön Kontrol" as BasvuruDurum,
            ...form,
            nace: seciliNace,
            evraklar: form.evraklar || [],
        };
        const y: Basvuru[] = [rec, ...basvurular];
        setBasvurular(y);
        saveLS(LS_KEY, y);
        alert("Başvurunuz alındı. Başvuru No: " + rec.basvuruNo);
        setForm({ isletmeAdi: "", sahibi: "", vergiNo: "", iletisim: "", adres: "", m2: 0, nace: undefined, evraklar: [], not: "" });
        setSeciliNace(null);
        setQ("");
    };

    const ilerlet = (id: string) => {
        setBasvurular((prev) => {
            const y: Basvuru[] = prev.map((b): Basvuru => {
                if (b.id !== id) return b;
                const next: BasvuruDurum =
                    b.status === "Ön Kontrol"
                        ? "Denetim Randevusu"
                        : "Hazır (E-imzalı Ruhsat)";
                return { ...b, status: next };
            });
            saveLS(LS_KEY, y);
            return y;
        });
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-amber-50 via-white to-emerald-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">İşyeri Ruhsatları</h1>
                        <p className="mt-3 text-gray-700">
                            Faaliyet kodu (NACE) seçimi, belge listesi, <strong>ön kontrol</strong>, denetim
                            randevusu ve e-imzalı ruhsat teslimine kadar tüm adımlar bu sayfada.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="info">NACE Sihirbazı</Badge>
                            <Badge tone="success">Ön Kontrol</Badge>
                            <Badge tone="warning">Ücret Hesabı (Demo)</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* vaat şeridi */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🕒</span>
                    <div><div className="text-lg font-semibold leading-none">3 iş günü</div><div className="text-sm text-gray-600">Ön kontrol hedefi</div></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🧾</span>
                    <div><div className="text-lg font-semibold leading-none">Otomatik liste</div><div className="text-sm text-gray-600">Belge gereklilikleri</div></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>📩</span>
                    <div><div className="text-lg font-semibold leading-none">{yil}</div><div className="text-sm text-gray-600">E-imzalı teslim</div></div>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["sihirbaz", "NACE Sihirbazı + Ön Kontrol"],
                            ["evrak", "Belge Listesi & Açıklama"],
                            ["ucret", "Ücret Hesabı (Demo)"],
                            ["denetim", "Denetim Öz-Değerlendirme"],
                            ["takip", "Başvuru Takip / JSON"],
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
                    {/* NACE + form */}
                    <Section id="sihirbaz" title="NACE Sihirbazı ve Başvuru Ön Kontrol">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <div className="rounded-xl border bg-white p-4">
                                <label className="block text-sm text-gray-600">Faaliyet (NACE) ara</label>
                                <input className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="ör. kafe, market, oto yıkama, 56.10..." value={q} onChange={(e) => setQ(e.target.value)} />
                                <ul className="mt-2 max-h-56 divide-y overflow-auto rounded-lg border">
                                    {naceSonuc.map((n) => (
                                        <li key={n.code} className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-50 ${seciliNace?.code === n.code ? "bg-emerald-50" : ""}`} onClick={() => setSeciliNace(n)}>
                                            <div className="font-medium">{n.ad}</div>
                                            <div className="text-xs text-gray-600">NACE {n.code} • <span className="capitalize">{n.ruhsat.replace("-", " ")}</span> • Risk: {n.risk}</div>
                                        </li>
                                    ))}
                                    {naceSonuc.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">Sonuç yok.</li>}
                                </ul>
                                {seciliNace && (
                                    <div className="mt-3 text-sm">
                                        <Badge tone="info">Seçildi</Badge> <span className="ml-2">{seciliNace.ad} • NACE {seciliNace.code}</span>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={gonder} className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Başvuru Bilgileri</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="İşletme Adı" value={form.isletmeAdi} onChange={(e) => setForm((s) => ({ ...s, isletmeAdi: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="İşletme Sahibi / Yetkili" value={form.sahibi} onChange={(e) => setForm((s) => ({ ...s, sahibi: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Vergi No (ops.)" value={form.vergiNo} onChange={(e) => setForm((s) => ({ ...s, vergiNo: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="İletişim (e-posta/telefon)" value={form.iletisim} onChange={(e) => setForm((s) => ({ ...s, iletisim: e.target.value }))} />
                                </div>
                                <input className="mt-2 w-full rounded-lg border px-3 py-2" placeholder="Adres" value={form.adres} onChange={(e) => setForm((s) => ({ ...s, adres: e.target.value }))} />
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" type="number" min={1} placeholder="Kullanım Alanı (m²)" value={form.m2 || ""} onChange={(e) => setForm((s) => ({ ...s, m2: parseFloat(e.target.value || "0") }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="Not (opsiyonel)" value={form.not || ""} onChange={(e) => setForm((s) => ({ ...s, not: e.target.value }))} />
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">Ön Kontrole Gönder</button>
                                    <ExportMenu
                                        data={{ nace: seciliNace, form }}
                                        filename="ruhsat-basvuru-taslak"
                                        resourceId="isyeri-ruhsatlari"
                                    />
                                </div>
                            </form>
                        </div>

                        <Callout title="Nasıl çalışır? – NACE Sihirbazı & Ön Kontrol" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Gerekli bilgiler:</span> Faaliyet (NACE), işletme adı, yetkili, <span className="font-semibold">e-posta/telefon</span>, adres ve m².</li>
                                <li><span className="font-semibold">Ne veriyoruz:</span> Seçilen faaliyete göre <span className="font-semibold">belge listesi</span>, <span className="font-semibold">ücret hesabı</span> ve denetim öz-değerlendirme.</li>
                                <li><span className="font-semibold">Süre:</span> Ön kontrol hedefimiz 3 iş günü (demo).</li>
                                <li><span className="font-semibold">Takip:</span> Aşağıdaki “Başvuru Takip”te <span className="font-semibold">Başvuru No</span> ile ilerleyişinizi görebilirsiniz.</li>
                                <li><span className="font-semibold">Gizlilik:</span> İletişim ve adres bilgileriniz yalnızca ruhsat işlemleri için kullanılır (demo metni).</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* Belge listesi */}
                    <Section id="evrak" title="Belge Listesi (Otomatik) & Açıklama">
                        {!seciliNace ? (
                            <p className="text-sm text-gray-600">Önce yukarıdan bir NACE seçin.</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border bg-white p-4">
                                    <h3 className="mb-2 font-semibold">Zorunlu Belgeler – {seciliNace.ad}</h3>
                                    <ul className="list-disc space-y-1 pl-5 text-sm">
                                        {mustList.map((b, i) => <li key={i}>{b}</li>)}
                                    </ul>
                                    <p className="mt-2 text-xs text-gray-600">Liste mevzuatın basitleştirilmiş özetidir; denetim sonucu ilave belge istenebilir.</p>
                                </div>
                                <Callout title="Açıklama – Neden gerekiyor?" tone="info">
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><span className="font-semibold">İmar/Uygunluk:</span> İşlev ve kapasitenin parsel kullanımına uygunluğunu teyit eder.</li>
                                        {seciliNace.etiketler.includes("gıda") && <li><span className="font-semibold">Gıda güvenliği:</span> Hijyen, soğuk zincir, izlenebilirlik için zorunlu belgeler.</li>}
                                        {seciliNace.ruhsat === "umuma-acik" && <li><span className="font-semibold">Gürültü & asayiş:</span> Müzik bildirimi ve ses tedbirleri komşuluk hakkını korur.</li>}
                                        {seciliNace.ruhsat === "gayrisihhi" && <li><span className="font-semibold">Çevre mevzuatı:</span> Emisyon/atık su yönetimi ve güvenlik planı gerekir.</li>}
                                        <li><span className="font-semibold">İtfaiye:</span> Yangın algılama/söndürme, acil çıkış ve kapasite uygunluğu talep edilir.</li>
                                    </ul>
                                </Callout>
                            </div>
                        )}
                    </Section>

                    {/* Ücret hesabı */}
                    <Section id="ucret" title="Ücret Hesabı (Demo)">
                        {!seciliNace ? (
                            <p className="text-sm text-gray-600">NACE seçin ve m² girin; tahmini harç hesaplanır.</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border bg-white p-4">
                                    <div className="text-sm text-gray-600">Faaliyet: <span className="font-semibold">{seciliNace.ad}</span> • Risk: {seciliNace.risk} • Alan: {form.m2 || 0} m²</div>
                                    <div className="mt-2 rounded-lg bg-gray-50 p-3">
                                        <div className="text-gray-600">Tahmini ruhsat harcı</div>
                                        <div className="text-2xl font-semibold">{harc.toLocaleString("tr-TR")} ₺</div>
                                    </div>
                                </div>
                                <Callout title="Nasıl çalışır? – Ücret Hesabı" tone="info">
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><span className="font-semibold">Gerekli bilgiler:</span> NACE, m².</li>
                                        <li><span className="font-semibold">Formül (demo):</span> Taban × risk katsayısı × (m²/50 dilimi).</li>
                                        <li><span className="font-semibold">Resmî tutar:</span> <Link className="text-blue-700 underline" href="/ucretler-ve-tarifeler">Ücretler ve Tarifeler</Link> sayfasındaki güncel tarifeye göre belirlenir.</li>
                                    </ul>
                                </Callout>
                            </div>
                        )}
                    </Section>

                    {/* Denetim öz-değerlendirme */}
                    <Section id="denetim" title="Denetim Öz-Değerlendirme">
                        {!seciliNace ? (
                            <p className="text-sm text-gray-600">NACE seçtikten sonra kontrol listesi açılır.</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border bg-white p-4">
                                    <h3 className="mb-2 font-semibold">Kontrol Listesi</h3>
                                    <ul className="space-y-2">
                                        {selfItems.map((k) => (
                                            <li key={k} className="flex items-center gap-2 text-sm">
                                                <input type="checkbox" checked={!!check[k]} onChange={(e) => setCheck((s) => ({ ...s, [k]: e.target.checked }))} />
                                                <span>{k}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
                                        Uygunluk: <span className="font-semibold">{skor.uygun}/{skor.toplam}</span> ({skor.oran}%)
                                    </div>
                                </div>
                                <Callout title="Nasıl çalışır? – Denetim Öncesi" tone="info">
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><span className="font-semibold">Gerekli bilgi:</span> Sadece iş yerinizde mevcut durumun işaretlenmesi.</li>
                                        <li><span className="font-semibold">Ne veriyoruz:</span> Kendi kendine kontrol listesi ve oran; eksiklerinizi görebilirsiniz.</li>
                                        <li><span className="font-semibold">Süre:</span> 10–15 dakika.</li>
                                        <li><span className="font-semibold">Gizlilik:</span> İşaretler cihazınızda kalır (sayfa yenilenince sıfırlanır).</li>
                                    </ul>
                                </Callout>
                            </div>
                        )}
                    </Section>

                    {/* Başvuru takip */}
                    <Section id="takip" title="Başvuru Takip / JSON">
                        <div className="rounded-xl border bg-white p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <h3 className="font-semibold">Başvurular</h3>
                                <ExportMenu
                                    data={basvurular}
                                    filename="ruhsat-basvurular"
                                    resourceId="isyeri-ruhsatlari"
                                />
                            </div>
                            {basvurular.length === 0 ? (
                                <p className="text-sm text-gray-600">Kayıt yok.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="px-3 py-2 text-left">Başvuru No</th>
                                                <th className="px-3 py-2 text-left">İşletme</th>
                                                <th className="px-3 py-2 text-left">Faaliyet</th>
                                                <th className="px-3 py-2 text-left">Durum</th>
                                                <th className="px-3 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {basvurular.map((b) => (
                                                <tr key={b.id} className="border-b">
                                                    <td className="px-3 py-2">{b.basvuruNo}</td>
                                                    <td className="px-3 py-2">{b.isletmeAdi}</td>
                                                    <td className="px-3 py-2">{b.nace?.ad} ({b.nace?.code})</td>
                                                    <td className="px-3 py-2"><Badge tone={b.status === "Hazır (E-imzalı Ruhsat)" ? "success" : "info"}>{b.status}</Badge></td>
                                                    <td className="px-3 py-2 space-x-2">
                                                        <button className="rounded-lg bg-gray-100 px-3 py-1.5 hover:bg-gray-200" onClick={() => ilerlet(b.id)}>İlerle (demo)</button>
                                                        <ExportMenu
                                                            data={b}
                                                            filename={b.basvuruNo}
                                                            resourceId="isyeri-ruhsatlari"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <Callout title="Sistem nasıl işler? – Başvuru Takip" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Aşamalar:</span> Ön Kontrol → Denetim Randevusu → <span className="font-semibold">E-imzalı Ruhsat</span>.</li>
                                <li><span className="font-semibold">Takip:</span> Başvuru No üzerinden; e-posta ile bilgilendirme yapılır (demo).</li>
                                <li><span className="font-semibold">Veri paylaşımı:</span> Dışa aktarım menüsünden PDF, Excel, CSV formatlarında verilerinizi indirebilirsiniz.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* SSS */}
                    <Section id="sss" title="A’dan Z’ye Sık Sorulan Sorular">
                        {[
                            ["Açılıştan önce denetim zorunlu mu?", "Evet. Uygunluk denetimi yapılmadan ruhsat düzenlenmez; bazı iş kollarında geçici faaliyet belgesi verilebilir."],
                            ["Baca zorunlu mu?", "Sıcak üretim/ızgara/çıkaran mutfaklarda uygun kesitli ve filtreli baca zorunludur."],
                            ["Çalışma saatlerini kim belirler?", "Umuma açık yerlerde kolluk ve belediye düzenlemeleri geçerlidir; müzik yayını için saat sınırlaması olabilir."],
                            ["Depo adresi farklı olabilir mi?", "Ayrı adreste depo için ek bildirim/ruhsat gerekebilir."],
                            ["Eczane/sağlık işlerinde fark nedir?", "Mesul müdür ataması ve özel mevzuat (TİTCK vb.) aranır; ruhsat tipi 'meşruhat' olarak düzenlenir."],
                            ["Faaliyet değişikliğinde ne yapmalıyım?", "NACE değişirse revize ruhsat istenir; belge listesi faaliyet türüne göre güncellenir."],
                            ["Gürültü ölçümü şart mı?", "Umuma açık istirahat/eğlence yerlerinde şarttır; beyan/ölçüm türü mekâna göre belirlenir."],
                            ["Hijyen eğitimi gerekli mi?", "Gıda ve kişisel bakım sektörlerinde zorunludur."],
                            ["İşyeri devrinde süreç?", "Devir formu, yeni sözleşme/tapu ve vergi kaydı ile ruhsat devri yapılır; denetim gerekebilir."],
                            ["Kapasite/HESap nasıl?", "Oturma planı ve m² üzerinden; acil çıkış sayısı ve koridor genişliği kuralları uygulanır."],
                            ["LPG/doğalgaz projesi şart mı?", "Gaz kullanılan yerlerde onaylı tesisat projesi ve sızdırmazlık raporu zorunludur."],
                            ["Mesafe şartları var mı?", "Bazı faaliyetlerde okul/ibadethane mesafesi gibi kısıtlar bulunabilir."],
                            ["Numarataj olmadan olur mu?", "Adres tescili (numarataj) sağlanmadan ruhsat düzenlenemez."],
                            ["Otopark yükümlülüğü?", "Mekân türü ve m²'ye göre otopark bedeli/doğrudan çözüm gerekebilir."],
                            ["Personel için sağlık raporu?", "Gıda ve kişisel bakımda gereklidir."],
                            ["Ruhsat ücreti nasıl ödenir?", "E-belediye ödeme kanallarından veya vezneden; dekont başvuruya işlenir."],
                            ["Sigara içme alanı kuralları?", "Kapalı alanda yasaktır; açık alan düzeni için mevzuata uygun plan gerekir."],
                            ["Tabela izni gerekiyor mu?", "Evet; ölçü, yer ve ışık şartlarına göre ayrı izin düzenlenir."],
                            ["Ustalık belgesi zorunlu mu?", "Meslek koluna göre (berber/kuaför vb.) ustalık belgesi aranır."],
                            ["Yangın söndürücü sayısı?", "M² ve risk sınıfına göre belirlenir; itfaiye uygunluğunda kontrol edilir."],
                            ["Zabıta rolü nedir?", "Açılış öncesi denetim ve sonrasında periyodik kontrolleri yürütür."],
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
                        <p><span className="font-semibold">Ruhsat ve Denetim Müdürlüğü</span></p>
                        <p>Çağrı Merkezi: 444 0 XXX • Alo 153</p>
                        <p>E-posta: <a className="text-emerald-700 underline" href="mailto:ruhsat@birimajans.bel.tr">ruhsat@birimajans.bel.tr</a></p>
                        <p>Adres: Belediye Hizmet Binası, [adres]</p>
                        <div className="mt-3 flex gap-2">
                            <Link href="/ucretler-ve-tarifeler" className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95">Ücretler ve Tarifeler</Link>
                            <a href="#sihirbaz" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95">Başvuru Başlat</a>
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
}
