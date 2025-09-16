"use client";

import React, { useEffect, useMemo, useState } from "react";

import ExportMenu from "@/components/ExportMenu";
/* ------------------------------ Basit UI yardımcıları ------------------------------ */
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

/* ----------------------------------------- Tipler ----------------------------------------- */
type YardimTuru =
    | "gida-kolisi"
    | "nakdi-destek"
    | "kira-destegi"
    | "yakacak"
    | "bebek-paketi"
    | "egitim-bursu"
    | "engelli-cihaz"
    | "evde-bakim"
    | "psikososyal-destek";

type Durum = "Alındı" | "İnceleme" | "Onaylandı" | "Reddedildi";
type SosyalGuvence = "yok" | "SSK" | "Bağ-Kur" | "Emekli" | "Diğer";

type HaneBilgi = {
    adSoyad: string;
    email: string;
    tel?: string;
    adres: string;
    mahalle?: string;
    kiraci: boolean;
    kisiSayisi: number;
    cocukSayisi: number;
    ogrenciSayisi: number;
    gelirAylik: number; // TL
    sosyalGuvence: SosyalGuvence;
    engelDurumu: "yok" | "%40-%69" | "%70+";
    kronikHastalik: boolean;
    iban?: string; // nakdi destek için ops.
};

type YardimBasvuru = {
    id: string;
    basvuruNo: string;
    tarihISO: string;
    tur: YardimTuru;
    hane: HaneBilgi;
    evraklar: string[]; // yüklenen belge adları (demo)
    puan: number; // ön değerlendirme skoru
    randevu?: { tarihISO: string; saat: string }; // sosyal inceleme
    durum: Durum;
    not?: string;
};

type RandevuKaydi = {
    id: string;
    basvuruNo: string;
    tarihISO: string; // YYYY-MM-DD
    saat: string; // "14:00"
};

/* ----------------------------------- Sabitler & Haritalar ---------------------------------- */
const DOC_MAP: Record<YardimTuru, string[]> = {
    "gida-kolisi": ["Kimlik fotokopisi", "İkametgah", "Gelir/Gelirsizlik beyanı"],
    "nakdi-destek": ["Kimlik fotokopisi", "Gelir belgesi/gider dökümü", "IBAN bilgisi (başvuran adına)"],
    "kira-destegi": ["Kira sözleşmesi", "İkametgah", "Gelir belgesi", "Muhtarlıktan durum yazısı (ops.)"],
    "yakacak": ["İkametgah", "Gelir/Gelirsizlik beyanı", "Yakıt tercihi (kömür/odun)"],
    "bebek-paketi": ["Doğum belgesi/gebelik belgesi", "İkametgah", "Gelir beyanı"],
    "egitim-bursu": ["Öğrenci belgesi", "Transkript/not dökümü (ops.)", "Gelir beyanı"],
    "engelli-cihaz": ["Engelli sağlık kurulu raporu", "Kimlik", "Cihaz ihtiyacı reçete/öneri"],
    "evde-bakim": ["Hekim/rapor", "Hane bilgisi", "Bakım veren yakının bilgileri"],
    "psikososyal-destek": ["Kimlik", "İletişim", "Kısa durum tarifi (ops.)"],
};

const TUR_ADI: Record<YardimTuru, string> = {
    "gida-kolisi": "Gıda Kolisi",
    "nakdi-destek": "Nakdî Destek",
    "kira-destegi": "Kira Desteği",
    "yakacak": "Yakacak Yardımı",
    "bebek-paketi": "Bebek Paketi",
    "egitim-bursu": "Eğitim Bursu",
    "engelli-cihaz": "Engelli Birey Cihaz Desteği",
    "evde-bakim": "Evde Bakım Desteği",
    "psikososyal-destek": "Psikososyal Destek",
};

/* --------------------------------------- Utils / LS --------------------------------------- */
const yil = new Date().getFullYear();
const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { dateStyle: "medium" });

const LS_BASVURULAR = "sosyal-yardim-basvurular";
const LS_RANDEVU = "sosyal-yardim-randevular";
const loadLS = <T,>(k: string, def: T): T => { try { const s = localStorage.getItem(k); return s ? (JSON.parse(s) as T) : def; } catch { return def; } };
const saveLS = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };
const downloadJSON = (name: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
};

/* ------------------------------- Puan Hesap (ön değerlendirme) ------------------------------ */
function hesaplaPuan(h: HaneBilgi): number {
    const kisi = Math.max(1, h.kisiSayisi || 1);
    const kisiGelir = (h.gelirAylik || 0) / kisi;
    let p = 0;

    if (kisiGelir <= 3000) p += 45;
    else if (kisiGelir <= 5000) p += 30;
    else if (kisiGelir <= 8000) p += 15;

    p += Math.min(20, (h.cocukSayisi || 0) * 4);
    p += Math.min(10, (h.ogrenciSayisi || 0) * 5);
    if (h.kiraci) p += 10;
    if (h.sosyalGuvence === "yok") p += 10;

    if (h.engelDurumu === "%40-%69") p += 10;
    if (h.engelDurumu === "%70+") p += 20;
    if (h.kronikHastalik) p += 8;

    return Math.max(0, Math.min(100, p));
}
const puanEtiketi = (p: number) => (p >= 70 ? "Öncelikli" : p >= 40 ? "Uygun" : "İkincil");

/* ------------------------------------------- Sayfa ------------------------------------------- */
export default function SosyalYardimHizmetleriPage() {
    const [basvurular, setBasvurular] = useState<YardimBasvuru[]>([]);
    const [randevular, setRandevular] = useState<RandevuKaydi[]>([]);
    useEffect(() => {
        setBasvurular(loadLS<YardimBasvuru[]>(LS_BASVURULAR, []));
        setRandevular(loadLS<RandevuKaydi[]>(LS_RANDEVU, []));
    }, []);

    /* --- ÖN DEĞERLENDİRME --- */
    const [hane, setHane] = useState<HaneBilgi>({
        adSoyad: "",
        email: "",
        tel: "",
        adres: "",
        mahalle: "",
        kiraci: true,
        kisiSayisi: 2,
        cocukSayisi: 0,
        ogrenciSayisi: 0,
        gelirAylik: 0,
        sosyalGuvence: "yok",
        engelDurumu: "yok",
        kronikHastalik: false,
        iban: "",
    });
    const puan = useMemo(() => hesaplaPuan(hane), [hane]);

    /* --- BAŞVURU --- */
    const [tur, setTur] = useState<YardimTuru>("gida-kolisi");
    const mustDocs = useMemo(() => DOC_MAP[tur], [tur]);
    const [evrakGirisi, setEvrakGirisi] = useState("");

    const basvuruGonder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!hane.adSoyad || !hane.email || !hane.adres) return alert("Ad Soyad, e-posta ve adres zorunludur.");
        if (tur === "nakdi-destek" && !(hane.iban || "").trim()) return alert("Nakdî destek için IBAN bilgisi ekleyiniz (başvuran adına).");

        const rec: YardimBasvuru = {
            id: crypto.randomUUID(),
            basvuruNo: "SY-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
            tarihISO: new Date().toISOString(),
            tur,
            hane,
            evraklar: (evrakGirisi || "").split(",").map(s => s.trim()).filter(Boolean),
            puan,
            durum: "Alındı",
        };
        const y = [rec, ...basvurular];
        setBasvurular(y);
        saveLS(LS_BASVURULAR, y);
        alert("Başvurunuz alındı. Başvuru No: " + rec.basvuruNo);
        setEvrakGirisi("");
    };

    /* --- RANDEVU --- */
    const [rForm, setRForm] = useState<{ basvuruNo: string; tarih: string; saat: string }>({
        basvuruNo: "",
        tarih: new Date().toISOString().slice(0, 10),
        saat: "14:00",
    });

    const cakisirMi = (a: RandevuKaydi) =>
        randevular.some(r => r.tarihISO === a.tarihISO && r.saat === a.saat);

    const randevuKaydet = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rForm.basvuruNo) return alert("Bir başvuru seçiniz.");
        const rec: RandevuKaydi = { id: crypto.randomUUID(), basvuruNo: rForm.basvuruNo, tarihISO: rForm.tarih, saat: rForm.saat };
        if (cakisirMi(rec)) { alert("Seçili gün/saat dolu görünüyor. Lütfen farklı bir saat deneyin."); return; }
        const y = [rec, ...randevular];
        setRandevular(y);
        saveLS(LS_RANDEVU, y);

        // eşle: başvuruya randevuyu yaz (explicit return & literal cast)
        setBasvurular((prev): YardimBasvuru[] => {
            const up = prev.map((b): YardimBasvuru =>
                b.basvuruNo === rForm.basvuruNo
                    ? {
                        ...b,
                        randevu: { tarihISO: rForm.tarih, saat: rForm.saat },
                        durum: "İnceleme" as Durum,
                    }
                    : b
            );
            saveLS(LS_BASVURULAR, up);
            return up;
        });
        alert("Randevunuz oluşturuldu.");
    };

    /* --- FİLTRE / LİSTE --- */
    const [q, setQ] = useState("");
    const [fTur, setFTur] = useState<"hepsi" | YardimTuru>("hepsi");
    const list = useMemo(
        () =>
            basvurular.filter(b =>
                (fTur === "hepsi" || b.tur === fTur) &&
                (q ? (b.basvuruNo + b.hane.adSoyad + b.hane.adres).toLowerCase().includes(q.toLowerCase()) : true)
            ),
        [basvurular, fTur, q]
    );

    /* --- DURUM İLERLET --- */
    const ilerlet = (id: string, hedef?: Durum) => {
        setBasvurular((prev): YardimBasvuru[] => {
            const y = prev.map((b): YardimBasvuru => {
                if (b.id !== id) return b;
                const next = (hedef
                    ? hedef
                    : b.durum === "Alındı"
                        ? "İnceleme"
                        : b.durum === "İnceleme"
                            ? "Onaylandı"
                            : "Onaylandı") as Durum;
                return { ...b, durum: next };
            });
            saveLS(LS_BASVURULAR, y);
            return y;
        });
    };

    /* --- Destek Kart Simülasyonu --- */
    const kartLimit = useMemo(() => {
        const kisi = Math.max(1, hane.kisiSayisi || 1);
        const taban = 600;
        const puanKatsayi = Math.round((puan / 100) * 900);
        const aileFaktoru = Math.min(6, kisi) * 100;
        return taban + puanKatsayi + aileFaktoru;
    }, [hane.kisiSayisi, puan]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-rose-50 via-white to-emerald-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Sosyal Yardım Hizmetleri</h1>
                        <p className="mt-3 text-gray-700">
                            Gıda kolisi, nakdî ve kira desteği, burs, yakacak, bebek paketi, engelli cihaz ve evde bakım başvuruları;{" "}
                            <strong>ön değerlendirme puanı</strong>, <strong>randevu planlama</strong> ve <strong>JSON dışa aktarım</strong> tek sayfada.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="info">Ön Değerlendirme</Badge>
                            <Badge tone="success">Randevu</Badge>
                            <Badge tone="warning">JSON Çıktı</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* küçük şerit */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🕒</span>
                    <div><div className="text-lg font-semibold leading-none">5 dk</div><div className="text-sm text-gray-600">Ön değerlendirme süresi</div></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>📩</span>
                    <div><div className="text-lg font-semibold leading-none">{yil}</div><div className="text-sm text-gray-600">E-posta ile bilgilendirme (demo)</div></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>📄</span>
                    <div><div className="text-lg font-semibold leading-none">Otomatik</div><div className="text-sm text-gray-600">Belge listesi</div></div>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["ondeger", "Ön Değerlendirme / Puan"],
                            ["basvuru", "Yardım Başvurusu"],
                            ["randevu", "Randevu Planla"],
                            ["kart", "Sosyal Kart (Demo)"],
                            ["kayitlar", "Başvurular / JSON"],
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
                    {/* ÖN DEĞERLENDİRME */}
                    <Section id="ondeger" title="Ön Değerlendirme / Hane Bilgileri">
                        <div className="grid gap-4 md:grid-cols-2">
                            <form className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Hane Bilgileri</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ad Soyad" value={hane.adSoyad} onChange={(e) => setHane(s => ({ ...s, adSoyad: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="E-posta" value={hane.email} onChange={(e) => setHane(s => ({ ...s, email: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Telefon (ops.)" value={hane.tel || ""} onChange={(e) => setHane(s => ({ ...s, tel: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="Mahalle (ops.)" value={hane.mahalle || ""} onChange={(e) => setHane(s => ({ ...s, mahalle: e.target.value }))} />
                                </div>
                                <input className="mt-2 w-full rounded-lg border px-3 py-2" placeholder="Adres" value={hane.adres} onChange={(e) => setHane(s => ({ ...s, adres: e.target.value }))} />
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" type="number" min={1} placeholder="Hane Kişi Sayısı" value={hane.kisiSayisi} onChange={(e) => setHane(s => ({ ...s, kisiSayisi: parseInt(e.target.value || "1") }))} />
                                    <input className="rounded-lg border px-3 py-2" type="number" min={0} placeholder="Çocuk Sayısı" value={hane.cocukSayisi} onChange={(e) => setHane(s => ({ ...s, cocukSayisi: parseInt(e.target.value || "0") }))} />
                                    <input className="rounded-lg border px-3 py-2" type="number" min={0} placeholder="Öğrenci Sayısı" value={hane.ogrenciSayisi} onChange={(e) => setHane(s => ({ ...s, ogrenciSayisi: parseInt(e.target.value || "0") }))} />
                                    <input className="rounded-lg border px-3 py-2" type="number" min={0} placeholder="Aylık Toplam Gelir (₺)" value={hane.gelirAylik} onChange={(e) => setHane(s => ({ ...s, gelirAylik: parseInt(e.target.value || "0") }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <select className="rounded-lg border px-3 py-2" value={hane.sosyalGuvence} onChange={(e) => setHane(s => ({ ...s, sosyalGuvence: e.target.value as SosyalGuvence }))}>
                                        <option value="yok">Sosyal Güvence: Yok</option>
                                        <option value="SSK">SSK</option>
                                        <option value="Bağ-Kur">Bağ-Kur</option>
                                        <option value="Emekli">Emekli</option>
                                        <option value="Diğer">Diğer</option>
                                    </select>
                                    <select className="rounded-lg border px-3 py-2" value={hane.engelDurumu} onChange={(e) => setHane(s => ({ ...s, engelDurumu: e.target.value as HaneBilgi["engelDurumu"] }))}>
                                        <option value="yok">Engel Durumu: Yok</option>
                                        <option value="%40-%69">%40–%69</option>
                                        <option value="%70+">%70+</option>
                                    </select>
                                </div>
                                <div className="mt-2 flex items-center gap-3">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={hane.kiraci} onChange={(e) => setHane(s => ({ ...s, kiraci: e.target.checked }))} />
                                        Kiracıyım
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={hane.kronikHastalik} onChange={(e) => setHane(s => ({ ...s, kronikHastalik: e.target.checked }))} />
                                        Handa kronik hastalık var
                                    </label>
                                </div>
                                <input className="mt-2 w-full rounded-lg border px-3 py-2" placeholder="IBAN (nakdî destek için, ops.)" value={hane.iban || ""} onChange={(e) => setHane(s => ({ ...s, iban: e.target.value }))} />
                            </form>

                            <div className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Puan & Uygunluk</h3>
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <div className="text-gray-600">Ön değerlendirme puanı</div>
                                    <div className="text-3xl font-semibold">{puan}</div>
                                    <div className="mt-1 text-sm">Durum: <Badge tone={puan >= 70 ? "danger" : puan >= 40 ? "warning" : "neutral"}>{puanEtiketi(puan)}</Badge></div>
                                </div>
                                <ul className="mt-3 list-disc pl-5 text-sm">
                                    <li>Kişi başı gelir, çocuk/öğrenci sayısı, kiracı olup olmadığınız ve sağlık durumları puanı etkiler.</li>
                                    <li>Puan <strong>nihai karar değildir</strong>; sosyal inceleme randevusunda doğrulanır.</li>
                                </ul>
                                <Callout title="Nasıl çalışır? – Ön Değerlendirme" tone="info">
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><span className="font-semibold">Gerekli bilgiler:</span> Ad soyad, <span className="font-semibold">e-posta</span>, adres, hane kişi sayısı, gelir, kiracı/engel/kronik durum.</li>
                                        <li><span className="font-semibold">Ne veriyoruz:</span> 0–100 arası <span className="font-semibold">puan</span> ve <em>Öncelikli/Uygun/İkincil</em> etiketi.</li>
                                        <li><span className="font-semibold">Amaç:</span> Sosyal inceleme öncesi hızlı yönlendirme – nihai karar denetmen onayıyla verilir.</li>
                                    </ul>
                                </Callout>
                            </div>
                        </div>
                    </Section>

                    {/* BAŞVURU */}
                    <Section id="basvuru" title="Yardım Başvurusu">
                        <form onSubmit={basvuruGonder} className="rounded-xl border bg-white p-4">
                            <div className="grid gap-2 md:grid-cols-[320px_1fr]">
                                <div>
                                    <label className="block text-sm text-gray-600">Yardım Türü</label>
                                    <select className="mt-1 w-full rounded-lg border px-3 py-2" value={tur} onChange={(e) => setTur(e.target.value as YardimTuru)}>
                                        {Object.keys(TUR_ADI).map(k => <option key={k} value={k}>{TUR_ADI[k as YardimTuru]}</option>)}
                                    </select>

                                    <div className="mt-3 rounded-lg border p-3">
                                        <h4 className="mb-1 font-semibold text-sm">Zorunlu Belgeler</h4>
                                        <ul className="list-disc pl-5 text-sm">
                                            {mustDocs.map((d, i) => <li key={i}>{d}</li>)}
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600">Yüklediğiniz Belge Adları (demo)</label>
                                    <input className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="Örn: kimlik.jpg, ikametgah.pdf" value={evrakGirisi} onChange={(e) => setEvrakGirisi(e.target.value)} />
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">Başvuruyu Gönder</button>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <Callout title="Nasıl çalışır? – Başvuru Sistemi" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Gerekli bilgiler:</span> Ön değerlendirme formu + seçtiğiniz yardım türüne göre belge listesi.</li>
                                <li><span className="font-semibold">Ne veriyoruz:</span> Başvuru numarası üretiriz (<em>SY-XXXXX</em>), durum <strong>Alındı</strong> olur; randevu verdiğinizde <strong>İnceleme</strong>’ye geçer.</li>
                                <li><span className="font-semibold">Gizlilik:</span> Bu demo’da bilgiler cihazınızda saklanır. Gerçek sistemde KVKK ilkelerine göre işlenir.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* RANDEVU */}
                    <Section id="randevu" title="Sosyal İnceleme Randevusu">
                        <form onSubmit={randevuKaydet} className="rounded-xl border bg-white p-4">
                            <div className="grid grid-cols-2 gap-2">
                                <select className="rounded-lg border px-3 py-2" value={rForm.basvuruNo} onChange={(e) => setRForm(s => ({ ...s, basvuruNo: e.target.value }))}>
                                    <option value="">Başvuru seçiniz</option>
                                    {basvurular.map(b => <option key={b.id} value={b.basvuruNo}>{b.basvuruNo} • {TUR_ADI[b.tur]} • {b.hane.adSoyad}</option>)}
                                </select>
                                <input className="rounded-lg border px-3 py-2" type="date" value={rForm.tarih} onChange={(e) => setRForm(s => ({ ...s, tarih: e.target.value }))} />
                                <input className="rounded-lg border px-3 py-2" type="time" value={rForm.saat} onChange={(e) => setRForm(s => ({ ...s, saat: e.target.value }))} />
                                <button className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:opacity-95" type="submit">Randevu Oluştur</button>
                            </div>
                        </form>

                        <div className="mt-3 rounded-xl border bg-white p-4">
                            <h3 className="mb-2 font-semibold">Yaklaşan Randevular</h3>
                            {randevular.length === 0 ? (
                                <p className="text-sm text-gray-600">Randevu yok.</p>
                            ) : (
                                <ul className="space-y-2 text-sm">
                                    {randevular
                                        .slice()
                                        .sort((a, b) => (a.tarihISO + a.saat).localeCompare(b.tarihISO + b.saat))
                                        .map(r => (
                                            <li key={r.id} className="rounded-lg border p-2">
                                                {r.basvuruNo} • {fmtDate(r.tarihISO)} {r.saat}
                                            </li>
                                        ))}
                                </ul>
                            )}
                        </div>

                        <Callout title="Nasıl çalışır? – Randevu" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Gerekli bilgiler:</span> Başvuru numarası, tarih ve saat.</li>
                                <li><span className="font-semibold">Ne veriyoruz:</span> Takvimde <strong>çakışma</strong> kontrolü ve başvurunuza bağlanan randevu kaydı.</li>
                                <li><span className="font-semibold">Sonuç:</span> Başvuru durumunuz otomatik olarak <strong>İnceleme</strong>’ye çekilir.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* SOSYAL KART (DEMO) */}
                    <Section id="kart" title="Sosyal Destek Kartı – Aylık Limit (Demo)">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border bg-white p-4">
                                <div className="text-sm text-gray-600">Hane kişi sayısı: <strong>{hane.kisiSayisi || 1}</strong> • Puan: <strong>{puan}</strong></div>
                                <div className="mt-2 rounded-lg bg-gray-50 p-3">
                                    <div className="text-gray-600">Tahmini aylık limit</div>
                                    <div className="text-2xl font-semibold">{kartLimit.toLocaleString("tr-TR")} ₺</div>
                                </div>
                                <p className="mt-2 text-xs text-gray-600">Not: Bu tutar simülasyondur; gerçek limit komisyon kararına göre belirlenir.</p>
                            </div>
                            <Callout title="Nasıl çalışır? – Sosyal Kart" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-semibold">Gerekli bilgiler:</span> Hane kişi sayısı ve ön değerlendirme puanı.</li>
                                    <li><span className="font-semibold">Formül (demo):</span> 600₺ taban + (puan/100×900) + kişi başı 100₺ (maks 6 kişi).</li>
                                    <li><span className="font-semibold">Ne veriyoruz:</span> Gıda/temel ihtiyaç alışverişlerinde kullanılabilecek tahmini limit.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* BAŞVURULAR / JSON */}
                    <Section id="kayitlar" title="Başvurular / JSON">
                        <div className="rounded-xl border bg-white p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ara (no, ad, adres)" value={q} onChange={(e) => setQ(e.target.value)} />
                                    <select className="rounded-lg border px-3 py-2" value={fTur} onChange={(e) => setFTur(e.target.value as any)}>
                                        <option value="hepsi">Tür (hepsi)</option>
                                        {Object.keys(TUR_ADI).map(k => <option key={k} value={k}>{TUR_ADI[k as YardimTuru]}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ExportMenu
                                        data={basvurular}
                                        filename="sosyal-yardim-basvurular.json"
                                        resourceId="sosyal_yardim_hizmetleri"
                                    />
                                    <button className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white hover:opacity-95" onClick={() => downloadJSON("sosyal-yardim-randevular.json", randevular)}>Randevu JSON</button>
                                </div>
                            </div>

                            {list.length === 0 ? (
                                <p className="text-sm text-gray-600">Kayıt yok.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="px-3 py-2 text-left">Başvuru No</th>
                                                <th className="px-3 py-2 text-left">Ad Soyad</th>
                                                <th className="px-3 py-2 text-left">Tür</th>
                                                <th className="px-3 py-2 text-left">Puan</th>
                                                <th className="px-3 py-2 text-left">Durum</th>
                                                <th className="px-3 py-2 text-left">Randevu</th>
                                                <th className="px-3 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {list.map(b => (
                                                <tr key={b.id} className="border-b">
                                                    <td className="px-3 py-2">{b.basvuruNo}</td>
                                                    <td className="px-3 py-2">{b.hane.adSoyad}</td>
                                                    <td className="px-3 py-2">{TUR_ADI[b.tur]}</td>
                                                    <td className="px-3 py-2">{b.puan} <Badge tone={b.puan >= 70 ? "danger" : b.puan >= 40 ? "warning" : "neutral"}>{puanEtiketi(b.puan)}</Badge></td>
                                                    <td className="px-3 py-2"><Badge tone={b.durum === "Onaylandı" ? "success" : b.durum === "Reddedildi" ? "danger" : "info"}>{b.durum}</Badge></td>
                                                    <td className="px-3 py-2">{b.randevu ? `${fmtDate(b.randevu.tarihISO)} ${b.randevu.saat}` : "-"}</td>
                                                    <td className="px-3 py-2 space-x-2">
                                                        <button className="rounded-lg bg-gray-100 px-3 py-1.5 hover:bg-gray-200" onClick={() => ilerlet(b.id)}>İlerle (demo)</button>
                                                        <ExportMenu
                                                            data={b}
                                                            filename={`${b.basvuruNo}.json`}
                                                            resourceId="sosyal_yardim_hizmetleri"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <Callout title="Sistem nasıl işler? – Başvurular" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Aşamalar:</span> Alındı → İnceleme (randevu) → Onaylandı/Reddedildi.</li>
                                <li><span className="font-semibold">Paylaşım:</span> JSON çıktıları entegrasyon ve botlar için hazır.</li>
                                <li><span className="font-semibold">E-posta:</span> Demo’da sadece bilgi amaçlıdır; gerçek sistemde bildirim gönderilir.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* SSS */}
                    <Section id="sss" title="A’dan Z’ye Sık Sorulan Sorular">
                        {[
                            ["Kimler başvurabilir?", "İlçe sınırları içinde ikamet eden ve sosyal inceleme sonucunda uygun bulunan haneler başvurabilir."],
                            ["İkamet şart mı?", "Evet. Geçici adreslerde ikamet edenler için muhtarlıktan yazı talep edilebilir."],
                            ["Ön değerlendirme puanı kesin karar mı?", "Hayır. Puan sadece yönlendiricidir; karar sosyal inceleme ve komisyon onayıyla verilir."],
                            ["Puanım düşük, başvuramaz mıyım?", "Başvurabilirsiniz. Önceliklendirme yapılır ancak acil durumlar ayrıca değerlendirilir."],
                            ["Acil yardım mümkün mü?", "Yangın, sel, şiddet vb. durumlarda acil yardım hattından ve bu sayfadan bildirebilirsiniz; öncelikli işlem yapılır."],
                            ["Belge yükleme nasıl olacak?", "Bu demo’da belge adlarını yazıyorsunuz. Gerçek sistemde e-devlet/IBAN doğrulama ve dosya yükleme adımı bulunur."],
                            ["Nakdî destek ödemesi nasıl yapılır?", "Başvuran adına tanımlı IBAN’a veya Sosyal Destek Kartı’na aktarılır."],
                            ["IBAN eşleşmesi neden gerekli?", "Usulsüzlüğü önlemek için ödeme sadece başvuranın kişisel hesabına yapılır."],
                            ["Kira desteğinde üst sınır var mı?", "Gelir, hane durumu ve komisyon kararına göre aylık üst limit uygulanır."],
                            ["Yakacak yardımı ne zaman dağıtılır?", "Kış dönemi öncesinde planlanır; uygun haneye teslim randevusu verilir."],
                            ["Bebek paketi içeriği nedir?", "Bez, ıslak mendil, mama (hekim uygunluğu), battaniye ve temel hijyen ürünleri."],
                            ["Burs için başarı şartı var mı?", "Öğrencinin aktif öğrenci olması zorunludur; not ortalaması kıstas olarak istenebilir."],
                            ["Engelli cihaz desteği neleri kapsar?", "Tekerlekli sandalye, işitme cihazı vb. Rapor ve hekim önerisi aranır."],
                            ["Evde bakım desteği nasıl işler?", "Bakım veren yakına malzeme/psikososyal destek sağlanır; ev ziyareti yapılır."],
                            ["Psikososyal desteği kim verir?", "Sosyal hizmet uzmanı ve psikologlar tarafından yürütülür; gizlilik esastır."],
                            ["Başvurumu nasıl takip ederim?", "Bu sayfadaki <em>Başvurular / JSON</em> bölümünde başvuru numaranızla görebilirsiniz."],
                            ["Randevuya gelemeyeceğim, ne yapmalıyım?", "Yeni tarih oluşturabilir veya telefonla bilgi verebilirsiniz."],
                            ["Adres değişti, güncelleyebilir miyim?", "Evet. İnceleme sırasında yeni adres beyan edilir; sistemde güncellenir."],
                            ["Öğrenci/çocuk sayısı değişti, etkisi olur mu?", "Evet; puanlama ve önceliklendirme yeniden hesaplanabilir."],
                            ["Yardım türünü değiştirebilir miyim?", "İnceleme aşamasına kadar tür değişikliği talep edilebilir."],
                            ["Onaylandıktan sonra ödeme/teslim süresi?", "Türüne göre değişir; 3–15 gün aralığında planlama yapılır."],
                            ["Aynı yıl içinde tekrar başvuru?", "Mümkün; tür ve puan durumuna göre yılda azami sayı uygulanabilir."],
                            ["Verilerim nasıl korunuyor?", "Gerçek sistemde KVKK kapsamında saklanır. Bu demo sadece cihazınızda (localStorage) tutar."],
                            ["Komisyona itiraz edebilir miyim?", "Evet; yeni belge ve gerekçeyle yeniden değerlendirme talep edilebilir."],
                            ["Başvurum reddedildi, neden?", "Belge eksikliği, gelir kriterleri veya kapsam dışı kalma sebepleri olabilir; açıklama iletilir."],
                            ["Sosyal kart nerede geçerli?", "Belediye anlaşmalı market ve tedarikçilerde kullanılır; liste bilgilendirme mesajında paylaşılır."],
                        ].map(([q, a], i) => (
                            <details key={i} className="group py-3">
                                <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-rose-400">
                                    <span className="font-medium" dangerouslySetInnerHTML={{ __html: q }} />
                                </summary>
                                <div className="prose prose-sm max-w-none py-2 text-gray-700" dangerouslySetInnerHTML={{ __html: a }} />
                            </details>
                        ))}
                    </Section>

                    {/* İLETİŞİM */}
                    <Section id="iletisim" title="İletişim">
                        <p><span className="font-semibold">Sosyal Yardım İşleri Müdürlüğü</span></p>
                        <p>Çağrı Merkezi: 444 0 XXX • Alo 153</p>
                        <p>E-posta: <a className="text-emerald-700 underline" href="mailto:sosyal@birimajans.bel.tr">sosyal@birimajans.bel.tr</a></p>
                        <p>Adres: Belediye Hizmet Binası, [adres]</p>
                        <div className="mt-3 flex gap-2">
                            <a href="#ondeger" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95">Ön Değerlendirme</a>
                            <a href="#basvuru" className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95">Başvuru Yap</a>
                            <a href="#randevu" className="rounded-lg bg-rose-600 px-4 py-2 text-white hover:opacity-95">Randevu Al</a>
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
}
