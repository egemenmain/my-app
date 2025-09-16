"use client";

import React, { useEffect, useMemo, useState } from "react";
import ExportMenu from "@/components/ExportMenu";
import Link from "next/link";

/* ----------------------------- Basit UI yardımcıları ---------------------------- */
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

/* -------------------------------------- Tipler --------------------------------- */
type Kategori = "konser" | "tiyatro" | "sergi" | "atölye" | "çocuk" | "söyleşi";

type Etkinlik = {
    id: string;
    baslik: string;
    kategori: Kategori;
    tarihISO: string;   // YYYY-MM-DDTHH:mm
    mekan: string;
    kontenjan: number;
    ucretsiz: boolean;
    ozet: string;
};

type EtkinlikKayit = {
    id: string;
    etkinlikId: string;
    adSoyad: string;
    email: string;
    tel?: string;
    kisi: number;
    durum: "onaylı" | "yedek";
    kayitISO: string;
};

type Kurs = {
    id: string;
    ad: string;
    alan: "müzik" | "resim" | "tiyatro" | "yazılım" | "dans" | "fotoğraf";
    yas: "7-12" | "13-17" | "18+";
    kapasite: number;
    baslangicISO: string;  // dönem başlangıcı
    haftaGunleri: string[]; // ör: ["Salı", "Perşembe 18:00"]
    egitmen: string;
    ucretsiz: boolean;
    ucret?: number;
    ozet: string;
};

type KursBasvuru = {
    id: string;
    kursId: string;
    adSoyad: string;
    email: string;
    tel?: string;
    durum: "onaylı" | "yedek";
    kayitISO: string;
};

type Mekan =
    | "Kültür Merkezi - Büyük Salon"
    | "Sergi Salonu"
    | "Açık Hava Sahnesi"
    | "Toplantı Salonu";

type MekanTalep = {
    id: string;
    mekan: Mekan;
    amac: string;
    kurumKisi: string;
    email: string;
    tel?: string;
    tarihISO: string; // Etkinlik tarihi
    saat: string;    // "09:00", "14:00" gibi
    sureSaat: number;
    katilimci: number;
    durum: "Alındı" | "Ön Onay" | "Red";
    not?: string;
};

/* ---------------------------------- Demo verileri ------------------------------ */
const ETKINLIKLER: Etkinlik[] = [
    {
        id: "e1",
        baslik: "Belediye Senfoni - Yeni Yıl Konseri",
        kategori: "konser",
        tarihISO: "2025-01-12T20:00",
        mekan: "Kültür Merkezi",
        kontenjan: 350,
        ucretsiz: true,
        ozet: "Klasik eserlerden film müziklerine uzanan seçki. Davetiyeli, ücretsiz.",
    },
    {
        id: "e2",
        baslik: "Şehir Tiyatrosu: Martı",
        kategori: "tiyatro",
        tarihISO: "2025-01-18T19:30",
        mekan: "Kültür Merkezi",
        kontenjan: 280,
        ucretsiz: false,
        ozet: "Anton Çehov’un ölümsüz eserinden uyarlama.",
    },
    {
        id: "e3",
        baslik: "Gençler İçin Yaratıcı Yazarlık Söyleşisi",
        kategori: "söyleşi",
        tarihISO: "2025-01-25T16:00",
        mekan: "Kütüphane",
        kontenjan: 60,
        ucretsiz: true,
        ozet: "Yazar A. B. ile karakter yaratma ve kurgu üzerine.",
    },
    {
        id: "e4",
        baslik: "Çocuklar İçin Kukla Gösterisi",
        kategori: "çocuk",
        tarihISO: "2025-02-01T11:00",
        mekan: "Çocuk Sanat Evi",
        kontenjan: 120,
        ucretsiz: true,
        ozet: "3 yaş ve üzeri için eğlenceli kukla gösterisi.",
    },
    {
        id: "e5",
        baslik: "Fotoğraf Sergisi: Şehrin Işıkları",
        kategori: "sergi",
        tarihISO: "2025-01-10T10:00",
        mekan: "Sergi Salonu",
        kontenjan: 500,
        ucretsiz: true,
        ozet: "Açılış 10:00, sergi bir hafta açık.",
    },
];

const KURSLAR: Kurs[] = [
    {
        id: "k1",
        ad: "Temel Gitar",
        alan: "müzik",
        yas: "13-17",
        kapasite: 20,
        baslangicISO: "2025-02-10T18:00",
        haftaGunleri: ["Pazartesi 18:00", "Çarşamba 18:00"],
        egitmen: "Mehmet Yılmaz",
        ucretsiz: true,
        ozet: "Akustik gitarla akor ve ritim çalışmaları.",
    },
    {
        id: "k2",
        ad: "Akrilik Resim Atölyesi",
        alan: "resim",
        yas: "18+",
        kapasite: 16,
        baslangicISO: "2025-02-12T19:00",
        haftaGunleri: ["Çarşamba 19:00"],
        egitmen: "Zehra Aksoy",
        ucretsiz: false,
        ucret: 300,
        ozet: "Malzeme bilgisi, kompozisyon ve renk kuramı.",
    },
    {
        id: "k3",
        ad: "Tiyatroya Giriş",
        alan: "tiyatro",
        yas: "13-17",
        kapasite: 18,
        baslangicISO: "2025-02-15T17:30",
        haftaGunleri: ["Cumartesi 17:30"],
        egitmen: "Deniz Er",
        ucretsiz: true,
        ozet: "Temel oyunculuk egzersizleri ve doğaçlama.",
    },
];

const REZERVE_DEMO: Array<{ mekan: Mekan; tarihISO: string; saat: string; sureSaat: number }> = [
    { mekan: "Kültür Merkezi - Büyük Salon", tarihISO: "2025-01-18", saat: "18:00", sureSaat: 4 },
    { mekan: "Sergi Salonu", tarihISO: "2025-01-10", saat: "10:00", sureSaat: 8 },
];

/* ---------------------------------- Utils / LS -------------------------------- */
const yil = new Date().getFullYear();
const fmtDate = (iso: string) => new Date(iso).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });

const LS_ETKINLIK = "kultur-etkinlik-kayit";
const LS_KURS = "kultur-kurs-basvuru";
const LS_MEKAN = "kultur-mekan-talep";

const loadLS = <T,>(k: string, def: T): T => { try { const s = localStorage.getItem(k); return s ? (JSON.parse(s) as T) : def; } catch { return def; } };
const saveLS = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };
const downloadJSON = (name: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
};

/* --------------------------- Yardımcı hesap fonksiyonları ---------------------- */
const toplamOnayliKisi = (eventId: string, kayitlar: EtkinlikKayit[]) =>
    kayitlar.filter(k => k.etkinlikId === eventId && k.durum === "onaylı").reduce((s, k) => s + k.kisi, 0);

const kursOnayliAdet = (kursId: string, basvurular: KursBasvuru[]) =>
    basvurular.filter(b => b.kursId === kursId && b.durum === "onaylı").length;

const isOverlap = (startA: number, durA: number, startB: number, durB: number) => {
    const endA = startA + durA, endB = startB + durB;
    return startA < endB && startB < endA;
};
const hhmmToHour = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h + (m || 0) / 60;
};

/* ----------------------------------- Sayfa ------------------------------------ */
export default function KulturSanatHizmetleriPage() {
    /* Kayıt state’leri */
    const [etkinlikKayit, setEtkinlikKayit] = useState<EtkinlikKayit[]>([]);
    const [kursBasvuru, setKursBasvuru] = useState<KursBasvuru[]>([]);
    const [mekanTalepleri, setMekanTalepleri] = useState<MekanTalep[]>([]);

    useEffect(() => {
        setEtkinlikKayit(loadLS<EtkinlikKayit[]>(LS_ETKINLIK, []));
        setKursBasvuru(loadLS<KursBasvuru[]>(LS_KURS, []));
        setMekanTalepleri(loadLS<MekanTalep[]>(LS_MEKAN, []));
    }, []);

    /* Filtreler */
    const [fKategori, setFKategori] = useState<"hepsi" | Kategori>("hepsi");
    const [q, setQ] = useState("");

    const etkinlikList = useMemo(() => {
        const src = ETKINLIKLER.slice().sort((a, b) => a.tarihISO.localeCompare(b.tarihISO));
        return src.filter(e =>
            (fKategori === "hepsi" || e.kategori === fKategori) &&
            (q ? (e.baslik + e.ozet + e.mekan).toLowerCase().includes(q.toLowerCase()) : true)
        );
    }, [fKategori, q]);

    /* ----------------------------- ETKİNLİK KATILIM ----------------------------- */
    const [seciliEtkinlik, setSeciliEtkinlik] = useState<string>("");
    const [evForm, setEvForm] = useState<{ adSoyad: string; email: string; tel?: string; kisi: number }>({
        adSoyad: "",
        email: "",
        tel: "",
        kisi: 1,
    });

    const kayitOl = (e: React.FormEvent) => {
        e.preventDefault();
        const ev = ETKINLIKLER.find(x => x.id === seciliEtkinlik);
        if (!ev) return alert("Önce bir etkinlik seçin.");
        if (!evForm.adSoyad || !evForm.email) return alert("Ad soyad ve e-posta gerekli.");
        const dolu = toplamOnayliKisi(ev.id, etkinlikKayit);
        const yerVar = dolu + (evForm.kisi || 1) <= ev.kontenjan;
        const rec: EtkinlikKayit = {
            id: crypto.randomUUID(),
            etkinlikId: ev.id,
            adSoyad: evForm.adSoyad,
            email: evForm.email,
            tel: evForm.tel,
            kisi: Math.max(1, Math.min(5, evForm.kisi || 1)),
            durum: yerVar ? "onaylı" : "yedek",
            kayitISO: new Date().toISOString(),
        };
        const y = [rec, ...etkinlikKayit];
        setEtkinlikKayit(y);
        saveLS(LS_ETKINLIK, y);
        alert(yerVar ? "Kayıt onaylandı. E-biletiniz e-postaya gönderilecektir (demo)." : "Kontenjan dolu, yedek listeye alındınız (demo).");
        setEvForm({ adSoyad: "", email: "", tel: "", kisi: 1 });
    };

    /* -------------------------------- KURS KAYDI -------------------------------- */
    const [seciliKurs, setSeciliKurs] = useState<string>("");
    const [kursForm, setKursForm] = useState<{ adSoyad: string; email: string; tel?: string }>({ adSoyad: "", email: "", tel: "" });

    const kursaBasvur = (e: React.FormEvent) => {
        e.preventDefault();
        const k = KURSLAR.find(x => x.id === seciliKurs);
        if (!k) return alert("Önce bir kurs seçin.");
        if (!kursForm.adSoyad || !kursForm.email) return alert("Ad soyad ve e-posta gerekli.");
        const onayli = kursOnayliAdet(k.id, kursBasvuru);
        const yerVar = onayli < k.kapasite;
        const rec: KursBasvuru = {
            id: crypto.randomUUID(),
            kursId: k.id,
            adSoyad: kursForm.adSoyad,
            email: kursForm.email,
            tel: kursForm.tel,
            durum: yerVar ? "onaylı" : "yedek",
            kayitISO: new Date().toISOString(),
        };
        const y = [rec, ...kursBasvuru];
        setKursBasvuru(y);
        saveLS(LS_KURS, y);
        alert(yerVar ? "Kayıt alındı (onaylı)." : "Kapasite dolu, yedek listedesiniz (demo).");
        setKursForm({ adSoyad: "", email: "", tel: "" });
    };

    /* ------------------------------- MEKAN TAHSİSİ ------------------------------ */
    const [mekanForm, setMekanForm] = useState<MekanTalep>({
        id: "",
        mekan: "Kültür Merkezi - Büyük Salon",
        amac: "",
        kurumKisi: "",
        email: "",
        tel: "",
        tarihISO: new Date().toISOString().slice(0, 10),
        saat: "18:00",
        sureSaat: 2,
        katilimci: 50,
        durum: "Alındı",
        not: "",
    });

    const talepGonder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!mekanForm.amac || !mekanForm.kurumKisi || !mekanForm.email) return alert("Amaç, kurum/kişi ve e-posta gerekli.");
        const rezerve = [...REZERVE_DEMO, ...mekanTalepleri.map(t => ({ mekan: t.mekan, tarihISO: t.tarihISO, saat: t.saat, sureSaat: t.sureSaat }))];
        const gun = mekanForm.tarihISO;
        const start = hhmmToHour(mekanForm.saat);
        const cakisma = rezerve.some(r => r.mekan === mekanForm.mekan && r.tarihISO === gun && isOverlap(hhmmToHour(r.saat), r.sureSaat, start, mekanForm.sureSaat));
        const rec: MekanTalep = { ...mekanForm, id: crypto.randomUUID(), durum: cakisma ? "Red" : "Ön Onay" };
        const y = [rec, ...mekanTalepleri];
        setMekanTalepleri(y);
        saveLS(LS_MEKAN, y);
        alert(cakisma ? "Seçtiğiniz saat dolu görünüyor. Lütfen farklı saat deneyin." : "Talebiniz alındı, ön onay verildi (demo).");
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-fuchsia-50 via-white to-sky-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Kültür Sanat Hizmetleri</h1>
                        <p className="mt-3 text-gray-700">
                            Konser, tiyatro, sergi ve atölye duyuruları; <strong>etkinlik katılım</strong>, <strong>kurs kayıt</strong> ve
                            <strong> mekan tahsisi</strong> işlemleri tek sayfada. Her sistemin altında nasıl çalıştığı da yazılı.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="info">Takvim</Badge>
                            <Badge tone="success">Hızlı Kayıt</Badge>
                            <Badge tone="warning">JSON Dışa Aktarımı</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* Üst şerit */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🎫</span>
                    <div><div className="text-lg font-semibold leading-none">E-bilet</div><div className="text-sm text-gray-600">E-posta ile gönderim (demo)</div></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🎨</span>
                    <div><div className="text-lg font-semibold leading-none">{yil} Dönemi</div><div className="text-sm text-gray-600">Kurs & atölyeler</div></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🏛️</span>
                    <div><div className="text-lg font-semibold leading-none">Salon Tahsisi</div><div className="text-sm text-gray-600">Çakışma kontrolü (demo)</div></div>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["takvim", "Etkinlik Takvimi"],
                            ["etkinlik", "Etkinlik Katılım"],
                            ["kurs", "Kurs / Atölye Kayıt"],
                            ["mekan", "Mekan Tahsisi"],
                            ["yonetim", "Kayıtlarım / JSON"],
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
                    <Section id="takvim" title="Etkinlik Takvimi">
                        <div className="rounded-xl border bg-white p-4">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <input className="rounded-lg border px-3 py-2" placeholder="Ara (ad, mekan, içerik)" value={q} onChange={(e) => setQ(e.target.value)} />
                                <select className="rounded-lg border px-3 py-2" value={fKategori} onChange={(e) => setFKategori(e.target.value as any)}>
                                    <option value="hepsi">Kategori (hepsi)</option>
                                    <option value="konser">Konser</option>
                                    <option value="tiyatro">Tiyatro</option>
                                    <option value="sergi">Sergi</option>
                                    <option value="atölye">Atölye</option>
                                    <option value="çocuk">Çocuk</option>
                                    <option value="söyleşi">Söyleşi</option>
                                </select>
                            </div>

                            {etkinlikList.length === 0 ? (
                                <p className="text-sm text-gray-600">Uygun sonuç bulunamadı.</p>
                            ) : (
                                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {etkinlikList.map(ev => {
                                        const dolu = toplamOnayliKisi(ev.id, etkinlikKayit);
                                        const kalan = Math.max(0, ev.kontenjan - dolu);
                                        return (
                                            <li key={ev.id} className="rounded-xl border bg-white p-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold">{ev.baslik}</h3>
                                                    <Badge tone="neutral">{ev.kategori.toUpperCase()}</Badge>
                                                </div>
                                                <div className="mt-1 text-sm text-gray-600">{fmtDate(ev.tarihISO)} • {ev.mekan}</div>
                                                <div className="mt-1 text-sm">{ev.ozet}</div>
                                                <div className="mt-2 flex items-center gap-2 text-sm">
                                                    <Badge tone={ev.ucretsiz ? "success" : "warning"}>{ev.ucretsiz ? "Ücretsiz" : "Ücretli"}</Badge>
                                                    <span className="text-gray-600">Kalan kontenjan: {kalan}</span>
                                                </div>
                                                <div className="mt-3">
                                                    <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:opacity-95" onClick={() => setSeciliEtkinlik(ev.id)}>
                                                        Bu Etkinliğe Katıl
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        <Callout title="Nasıl çalışır? – Etkinlik Katılım Sistemi" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Gerekli bilgiler:</span> Etkinlik seçimi, ad soyad, <span className="font-semibold">e-posta</span>, (opsiyonel) telefon ve kişi sayısı.</li>
                                <li><span className="font-semibold">Ne veriyoruz:</span> Kontenjan uygunsa <span className="font-semibold">onaylı e-kayıt</span>, doluysa <span className="font-semibold">yedek</span> kaydı oluşturuyoruz.</li>
                                <li><span className="font-semibold">Sonuç:</span> Bu sayfadaki “Kayıtlarım / JSON” bölümünden tüm kayıtlarınızı indirebilirsiniz.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* ETKİNLİK KATILIM FORMU */}
                    <Section id="etkinlik" title="Etkinlik Katılım Formu">
                        <form onSubmit={kayitOl} className="rounded-xl border bg-white p-4">
                            <div className="grid gap-2 md:grid-cols-2">
                                <select className="rounded-lg border px-3 py-2" value={seciliEtkinlik} onChange={(e) => setSeciliEtkinlik(e.target.value)}>
                                    <option value="">Etkinlik seçin</option>
                                    {ETKINLIKLER.map(ev => <option key={ev.id} value={ev.id}>{ev.baslik} • {fmtDate(ev.tarihISO)}</option>)}
                                </select>
                                <input className="rounded-lg border px-3 py-2" placeholder="Ad Soyad" value={evForm.adSoyad} onChange={(e) => setEvForm(s => ({ ...s, adSoyad: e.target.value }))} />
                                <input className="rounded-lg border px-3 py-2" placeholder="E-posta" value={evForm.email} onChange={(e) => setEvForm(s => ({ ...s, email: e.target.value }))} />
                                <input className="rounded-lg border px-3 py-2" placeholder="Telefon (ops.)" value={evForm.tel || ""} onChange={(e) => setEvForm(s => ({ ...s, tel: e.target.value }))} />
                                <input className="rounded-lg border px-3 py-2" type="number" min={1} max={5} placeholder="Kişi sayısı" value={evForm.kisi} onChange={(e) => setEvForm(s => ({ ...s, kisi: parseInt(e.target.value || "1") }))} />
                            </div>
                            <div className="mt-3">
                                <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">Kaydı Gönder</button>
                            </div>
                        </form>
                    </Section>

                    {/* KURS / ATÖLYE */}
                    <Section id="kurs" title="Kurs / Atölye Kayıt">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <div className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Açık Dönemler</h3>
                                <ul className="space-y-2">
                                    {KURSLAR.map(k => {
                                        const onayli = kursOnayliAdet(k.id, kursBasvuru);
                                        const kalan = Math.max(0, k.kapasite - onayli);
                                        return (
                                            <li key={k.id} className="rounded-lg border p-3 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <div className="font-medium">{k.ad} • {k.yas}</div>
                                                    <Badge tone="neutral">{k.alan.toUpperCase()}</Badge>
                                                </div>
                                                <div className="text-gray-600">{fmtDate(k.baslangicISO)} başlangıç • {k.haftaGunleri.join(", ")}</div>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <Badge tone={k.ucretsiz ? "success" : "warning"}>{k.ucretsiz ? "Ücretsiz" : `Ücretli${k.ucret ? ` (${k.ucret}₺)` : ""}`}</Badge>
                                                    <span className="text-gray-600">Kalan: {kalan}/{k.kapasite}</span>
                                                </div>
                                                <p className="mt-1">{k.ozet}</p>
                                                <button className="mt-2 rounded-lg bg-gray-900 px-3 py-1.5 text-white hover:opacity-95" onClick={() => setSeciliKurs(k.id)}>Bu Kursa Başvur</button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            <form onSubmit={kursaBasvur} className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Başvuru Formu</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <select className="rounded-lg border px-3 py-2" value={seciliKurs} onChange={(e) => setSeciliKurs(e.target.value)}>
                                        <option value="">Kurs seçin</option>
                                        {KURSLAR.map(k => <option key={k.id} value={k.id}>{k.ad} • {k.yas}</option>)}
                                    </select>
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ad Soyad" value={kursForm.adSoyad} onChange={(e) => setKursForm(s => ({ ...s, adSoyad: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="E-posta" value={kursForm.email} onChange={(e) => setKursForm(s => ({ ...s, email: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="Telefon (ops.)" value={kursForm.tel || ""} onChange={(e) => setKursForm(s => ({ ...s, tel: e.target.value }))} />
                                </div>
                                <div className="mt-3">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">Başvuruyu Gönder</button>
                                </div>
                            </form>
                        </div>

                        <Callout title="Nasıl çalışır? – Kurs/Atölye Kayıt" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Gerekli bilgiler:</span> Kurs seçimi, ad soyad, <span className="font-semibold">e-posta</span> (opsiyonel telefon).</li>
                                <li><span className="font-semibold">Ne veriyoruz:</span> Kapasite uygunsa <span className="font-semibold">onaylı kayıt</span>, doluysa <span className="font-semibold">yedek</span> kaydı.</li>
                                <li><span className="font-semibold">Ücret:</span> Ücretli kurslarda ödeme adımı başlangıç bilgilendirmesiyle iletilir (demo).</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* MEKAN TAHSİSİ */}
                    <Section id="mekan" title="Mekan Tahsisi Talebi">
                        <form onSubmit={talepGonder} className="rounded-xl border bg-white p-4">
                            <div className="grid gap-2 md:grid-cols-2">
                                <select className="rounded-lg border px-3 py-2" value={mekanForm.mekan} onChange={(e) => setMekanForm(s => ({ ...s, mekan: e.target.value as Mekan }))}>
                                    {["Kültür Merkezi - Büyük Salon", "Sergi Salonu", "Açık Hava Sahnesi", "Toplantı Salonu"].map(m => <option key={m} value={m as Mekan}>{m}</option>)}
                                </select>
                                <input className="rounded-lg border px-3 py-2" placeholder="Amaç (ör. lansman, okuma, konser)" value={mekanForm.amac} onChange={(e) => setMekanForm(s => ({ ...s, amac: e.target.value }))} />
                                <input className="rounded-lg border px-3 py-2" placeholder="Kurum/Kişi" value={mekanForm.kurumKisi} onChange={(e) => setMekanForm(s => ({ ...s, kurumKisi: e.target.value }))} />
                                <input className="rounded-lg border px-3 py-2" placeholder="E-posta" value={mekanForm.email} onChange={(e) => setMekanForm(s => ({ ...s, email: e.target.value }))} />
                                <input className="rounded-lg border px-3 py-2" placeholder="Telefon (ops.)" value={mekanForm.tel || ""} onChange={(e) => setMekanForm(s => ({ ...s, tel: e.target.value }))} />
                                <input className="rounded-lg border px-3 py-2" type="date" value={mekanForm.tarihISO} onChange={(e) => setMekanForm(s => ({ ...s, tarihISO: e.target.value }))} />
                                <div className="grid grid-cols-2 gap-2">
                                    <input className="rounded-lg border px-3 py-2" type="time" value={mekanForm.saat} onChange={(e) => setMekanForm(s => ({ ...s, saat: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" type="number" min={1} max={8} placeholder="Süre (saat)" value={mekanForm.sureSaat} onChange={(e) => setMekanForm(s => ({ ...s, sureSaat: parseInt(e.target.value || "1") }))} />
                                </div>
                                <input className="rounded-lg border px-3 py-2" type="number" min={1} placeholder="Tahmini Katılımcı" value={mekanForm.katilimci} onChange={(e) => setMekanForm(s => ({ ...s, katilimci: parseInt(e.target.value || "1") }))} />
                                <input className="rounded-lg border px-3 py-2 md:col-span-2" placeholder="Not (ops.)" value={mekanForm.not || ""} onChange={(e) => setMekanForm(s => ({ ...s, not: e.target.value }))} />
                            </div>
                            <div className="mt-3">
                                <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">Talep Gönder</button>
                            </div>
                        </form>

                        <Callout title="Nasıl çalışır? – Mekan Tahsisi" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Gerekli bilgiler:</span> Mekan, tarih, <span className="font-semibold">saat & süre</span>, amaç, kurum/kişi, <span className="font-semibold">e-posta</span>.</li>
                                <li><span className="font-semibold">Ne veriyoruz:</span> Mevcut rezervasyonlara göre çakışma kontrolü yapıp <span className="font-semibold">“Ön Onay”</span> ya da <span className="font-semibold">“Red”</span> üretiyoruz (demo).</li>
                                <li><span className="font-semibold">Takip:</span> “Kayıtlarım / JSON” bölümünden talebinizi görebilir/indirebilirsiniz.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* KAYITLAR / JSON */}
                    <Section id="yonetim" title="Kayıtlarım / JSON Dışa Aktarım">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold">Etkinlik Kayıtları</h3>
                                    <ExportMenu 
                    data={etkinlikKayit} 
                    filename="etkinlik-kayitlari.json"
                    resourceId="kultur_sanat_hizmetleri"
                  />
                                </div>
                                {etkinlikKayit.length === 0 ? <p className="text-sm text-gray-600">Henüz kayıt yok.</p> : (
                                    <ul className="space-y-2 text-sm">
                                        {etkinlikKayit.slice(0, 6).map(k => {
                                            const ev = ETKINLIKLER.find(e => e.id === k.etkinlikId);
                                            return <li key={k.id} className="rounded-lg border p-2">{k.adSoyad} • {ev?.baslik} • {k.kisi} kişi • <Badge tone={k.durum === "onaylı" ? "success" : "warning"}>{k.durum}</Badge></li>;
                                        })}
                                    </ul>
                                )}
                            </div>

                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold">Kurs Başvuruları</h3>
                                    <ExportMenu 
                    data={kursBasvuru} 
                    filename="kurs-basvurular.json"
                    resourceId="kultur_sanat_hizmetleri"
                  />
                                </div>
                                {kursBasvuru.length === 0 ? <p className="text-sm text-gray-600">Henüz başvuru yok.</p> : (
                                    <ul className="space-y-2 text-sm">
                                        {kursBasvuru.slice(0, 6).map(b => {
                                            const k = KURSLAR.find(x => x.id === b.kursId);
                                            return <li key={b.id} className="rounded-lg border p-2">{b.adSoyad} • {k?.ad} • <Badge tone={b.durum === "onaylı" ? "success" : "warning"}>{b.durum}</Badge></li>;
                                        })}
                                    </ul>
                                )}
                            </div>

                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold">Mekan Talepleri</h3>
                                    <ExportMenu 
                    data={mekanTalepleri} 
                    filename="mekan-talepleri.json"
                    resourceId="kultur_sanat_hizmetleri"
                  />
                                </div>
                                {mekanTalepleri.length === 0 ? <p className="text-sm text-gray-600">Talep yok.</p> : (
                                    <ul className="space-y-2 text-sm">
                                        {mekanTalepleri.slice(0, 6).map(t => (
                                            <li key={t.id} className="rounded-lg border p-2">
                                                {t.mekan} • {t.tarihISO} {t.saat} • {t.kurumKisi} • <Badge tone={t.durum === "Ön Onay" ? "success" : "danger"}>{t.durum}</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <Callout title="Sistem nasıl işler? – Kayıtlarım" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Bütün başvurular cihazınızda saklanır (localStorage, demo).</li>
                                <li><span className="font-semibold">JSON</span> dosyalarını indirip bot/entegrasyonlarınızda kullanabilirsiniz.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* SSS */}
                    <Section id="sss" title="A’dan Z’ye Sık Sorulanlar">
                        {[
                            ["Bilet nasıl teslim edilir?", "Etkinlik kaydı onaylandığında e-bilet linki e-posta ile iletilir (demo)."],
                            ["Ücretsiz etkinliklerde yer ayırmak gerekir mi?", "Evet, kapasite yönetimi için ücretsiz etkinliklerde de kayıt alınır."],
                            ["Yedek listedeyim, ne olacak?", "İptal olursa sırayla bilgilendirileceksiniz; giriş e-postanızda güncellenir (demo)."],
                            ["Erişilebilirlik var mı?", "Kültür merkezi girişleri engelli erişimine uygundur. Yardım için görevlilerimize başvurabilirsiniz."],
                            ["Yaş sınırı?", "Çocuk etkinliklerinde yaş önerisi belirtilir. Genel etkinliklerde +7 tavsiye edilir."],
                            ["İade/iptal?", "Ücretli etkinliklerde iptal koşulları etkinlik sayfasında açıklanır; ücretsizde iptal bildirmeniz yeterli."],
                            ["Kurs malzemeleri?", "Bazı kurslarda temel malzeme kurum tarafından sağlanır; ayrıntı açılış duyurusunda yer alır."],
                            ["Mekan tahsisini kimler kullanabilir?", "Sivil toplum, okul kulüpleri ve kültür-sanat üreticileri başvurabilir; uygunluk ve takvim durumuna göre ön onay verilir."],
                        ].map(([q, a], i) => (
                            <details key={i} className="group py-3">
                                <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-fuchsia-400">
                                    <span className="font-medium">{q}</span>
                                </summary>
                                <div className="prose prose-sm max-w-none py-2 text-gray-700">{a}</div>
                            </details>
                        ))}
                    </Section>

                    {/* İLETİŞİM */}
                    <Section id="iletisim" title="İletişim">
                        <p><span className="font-semibold">Kültür ve Sosyal İşler Müdürlüğü</span></p>
                        <p>Çağrı Merkezi: 444 0 XXX • Alo 153</p>
                        <p>E-posta: <a className="text-fuchsia-700 underline" href="mailto:kultur@birimajans.bel.tr">kultur@birimajans.bel.tr</a></p>
                        <p>Adres: Belediye Kültür Merkezi, [adres]</p>
                        <div className="mt-3 flex gap-2">
                            <a href="#etkinlik" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95">Etkinliğe Katıl</a>
                            <a href="#kurs" className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95">Kursa Başvur</a>
                            <a href="#mekan" className="rounded-lg bg-fuchsia-600 px-4 py-2 text-white hover:opacity-95">Mekan Talebi</a>
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
}
