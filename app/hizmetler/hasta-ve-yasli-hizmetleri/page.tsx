// app/hizmetler/hasta-yasli-hizmetleri/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import ExportMenu from "@/components/ExportMenu";
import Link from "next/link";

/* ----------------------------- Ufak UI yardımcıları ---------------------------- */
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

/* --------------------------------- Harita embed -------------------------------- */
type Coords = { lat: number; lng: number };
const DEFAULT_CENTER: Coords = { lat: 41.043, lng: 29.0094 }; // örnek: Beşiktaş İskele
function osmEmbed(center: Coords) {
    const d = 0.02;
    const left = center.lng - d;
    const right = center.lng + d;
    const top = center.lat + d;
    const bottom = center.lat - d;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;
}

/* ------------------------------------- Tipler ---------------------------------- */
type TalepTipi =
    | "evde-bakim"
    | "nakil"
    | "psikolojik-destek"
    | "gida-paketi"
    | "cihaz-emanet"
    | "ilac-hatirlatma"
    | "diger";

type Durum = "Ön Değerlendirme" | "Yerinde Ziyaret Planlandı" | "Hizmet Başladı" | "Tamamlandı" | "Beklemede";

type Oncelik = "normal" | "oncelikli" | "acil";

type BasvuruHV = {
    id: string;
    basvuruNo: string;
    tarihISO: string;
    tip: TalepTipi;
    adSoyad: string;
    tcKimlik?: string;
    dogumYili?: number;
    iletisim: string;
    adres: string;
    coords?: Coords;
    yakiniMi: boolean;
    aciklama?: string;
    rapor?: string; // base64 (doktor/engellilik raporu vb.)
    durum: Durum;
    oncelik: Oncelik;
    // tip'e özel alanlar
    nakil?: { cikis?: string; varis?: string; randevuZamani?: string };
    cihaz?: { tur?: "tekerlekli-sandalye" | "walker" | "yatak" | "koltuk-degneyi" | "diğer"; beden?: string; emanetTaahhut?: boolean };
};

type Reminder = {
    id: string;
    adSoyad: string;
    iletisim: string;
    ilacAdi: string;
    doz: string;
    saatler: string[]; // "08:00" gibi
    baslangicISO: string;
    bitisISO?: string;
    aktif: boolean;
};

/* ------------------------------ localStorage yardımcı -------------------------- */
const LS_BASVURU = "hasta-yasli-basvurular";
const LS_REM = "hasta-yasli-ilac-hatirlatmalar";
const loadLS = <T,>(k: string, def: T): T => { try { const s = localStorage.getItem(k); return s ? (JSON.parse(s) as T) : def; } catch { return def; } };
const saveLS = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };
const downloadJSON = (name: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
};

/* ------------------------------------ Sayfa ------------------------------------ */
export default function HastaYasliHizmetleriPage() {
    const yil = new Date().getFullYear();

    /* ortak konum durumu */
    const [center, setCenter] = useState<Coords>(DEFAULT_CENTER);
    const useMyLocation = () => {
        if (!("geolocation" in navigator)) return alert("Tarayıcınız konum özelliğini desteklemiyor.");
        navigator.geolocation.getCurrentPosition(
            (p) => setCenter({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => alert("Konum alınamadı.")
        );
    };

    const toBase64 = (file?: File, cb?: (b64: string) => void) => {
        if (!file) return cb?.("");
        const reader = new FileReader();
        reader.onload = () => cb?.(reader.result as string);
        reader.readAsDataURL(file);
    };

    /* Hızlı Ön Değerlendirme (risk puanı) */
    const [triage, setTriage] = useState<Record<string, boolean>>({});
    const riskItems = [
        { k: "yurume", t: "Yürüme/günlük işlerde zorluk" },
        { k: "yalniz", t: "Yalnız yaşıyor" },
        { k: "kronik", t: "Kronik hastalık(lar) var" },
        { k: "ilac", t: "İlaç takibi zorlaşıyor" },
        { k: "beslenme", t: "Beslenme/alışveriş desteği gerekiyor" },
        { k: "bakim", t: "Evde kişisel bakım gerekiyor" },
        { k: "nakil", t: "Hastaneye ulaşımda güçlük" },
        { k: "psiko", t: "Psikolojik destek ihtiyacı" },
    ] as const;
    const riskSkor = useMemo(() => Object.values(triage).filter(Boolean).length * 10, [triage]);
    const riskOncelik: Oncelik = riskSkor >= 50 ? "acil" : riskSkor >= 30 ? "oncelikli" : "normal";
    const oneriler = useMemo(() => {
        const arr: string[] = [];
        if (triage.bakim || triage.yurume) arr.push("Evde Bakım Ziyareti");
        if (triage.nakil) arr.push("Hasta Nakil (Randevulu)");
        if (triage.ilac) arr.push("İlaç/Ölçüm Hatırlatma");
        if (triage.beslenme) arr.push("Gıda Paketi / Sıcak Yemek Yönlendirmesi");
        if (triage.psiko) arr.push("Psikolojik Danışmanlık");
        if (!arr.length) arr.push("Danışma Hattı: Durumunuza göre yönlendirme yapılır");
        return arr;
    }, [triage]);

    /* Başvuru & Takip */
    const [basvurular, setBasvurular] = useState<BasvuruHV[]>([]);
    useEffect(() => setBasvurular(loadLS<BasvuruHV[]>(LS_BASVURU, [])), []);
    const [yeni, setYeni] = useState<Omit<BasvuruHV, "id" | "basvuruNo" | "tarihISO" | "durum" | "oncelik">>({
        tip: "evde-bakim",
        adSoyad: "",
        iletisim: "",
        adres: "",
        yakiniMi: false,
        aciklama: "",
        tcKimlik: "",
        dogumYili: undefined,
        coords: undefined,
        rapor: undefined,
        nakil: {},
        cihaz: {},
    });

    const gonderBasvuru = (e: React.FormEvent) => {
        e.preventDefault();
        if (!yeni.adSoyad || !yeni.iletisim || !yeni.adres) return alert("Ad-soyad, iletişim ve adres zorunludur.");
        const kayit: BasvuruHV = {
            id: crypto.randomUUID(),
            basvuruNo: "HYH-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
            tarihISO: new Date().toISOString(),
            tip: yeni.tip,
            adSoyad: yeni.adSoyad,
            iletisim: yeni.iletisim,
            adres: yeni.adres,
            yakiniMi: yeni.yakiniMi,
            aciklama: yeni.aciklama,
            tcKimlik: yeni.tcKimlik,
            dogumYili: yeni.dogumYili,
            coords: yeni.coords || center,
            rapor: yeni.rapor,
            nakil: yeni.nakil,
            cihaz: yeni.cihaz,
            durum: "Ön Değerlendirme",
            oncelik: riskOncelik,
        };
        const y = [kayit, ...basvurular];
        setBasvurular(y); saveLS(LS_BASVURU, y);
        alert("Başvurunuz alındı. Başvuru No: " + kayit.basvuruNo);
        setYeni({ tip: "evde-bakim", adSoyad: "", iletisim: "", adres: "", yakiniMi: false, aciklama: "", tcKimlik: "", dogumYili: undefined, coords: undefined, rapor: undefined, nakil: {}, cihaz: {} });
    };

    const ilerlet = (id: string) => {
        setBasvurular(prev => {
            const y = prev.map(b => {
                if (b.id !== id) return b;
                const next: Durum =
                    b.durum === "Ön Değerlendirme" ? "Yerinde Ziyaret Planlandı" :
                        b.durum === "Yerinde Ziyaret Planlandı" ? "Hizmet Başladı" :
                            b.durum === "Hizmet Başladı" ? "Tamamlandı" : "Tamamlandı";
                return { ...b, durum: next };
            });
            saveLS(LS_BASVURU, y);
            return y;
        });
    };

    /* İlaç/Ölçüm hatırlatma */
    const [reminders, setReminders] = useState<Reminder[]>([]);
    useEffect(() => setReminders(loadLS<Reminder[]>(LS_REM, [])), []);
    const [rem, setRem] = useState<Reminder>({
        id: crypto.randomUUID(),
        adSoyad: "",
        iletisim: "",
        ilacAdi: "",
        doz: "",
        saatler: [],
        baslangicISO: new Date().toISOString().slice(0, 10),
        bitisISO: "",
        aktif: true,
    });
    const [saatText, setSaatText] = useState("");

    const saatEkle = () => {
        const clean = saatText.trim();
        if (!/^\d{2}:\d{2}$/.test(clean)) return alert("Saat formatı HH:MM olmalı (ör. 08:00)");
        if (rem.saatler.includes(clean)) return;
        setRem(r => ({ ...r, saatler: [...r.saatler, clean].sort() })); setSaatText("");
    };
    const kaydetRem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rem.adSoyad || !rem.iletisim || !rem.ilacAdi || rem.saatler.length === 0) return alert("Ad-soyad, iletişim, ilaç ve en az bir saat gerekli.");
        const rec = { ...rem, id: crypto.randomUUID() };
        const y = [rec, ...reminders];
        setReminders(y); saveLS(LS_REM, y);
        alert("Hatırlatma kaydedildi (demo).");
        setRem({ id: crypto.randomUUID(), adSoyad: "", iletisim: "", ilacAdi: "", doz: "", saatler: [], baslangicISO: new Date().toISOString().slice(0, 10), bitisISO: "", aktif: true });
    };

    /* Filtreler */
    const [filtre, setFiltre] = useState<{ q: string; tip: "hepsi" | TalepTipi; durum: "hepsi" | Durum }>({ q: "", tip: "hepsi", durum: "hepsi" });
    const filtered = useMemo(() => {
        return basvurular.filter((b) => {
            const byTip = filtre.tip === "hepsi" ? true : b.tip === filtre.tip;
            const byDurum = filtre.durum === "hepsi" ? true : b.durum === filtre.durum;
            const byQ = filtre.q
                ? [b.adSoyad, b.adres, b.aciklama, b.basvuruNo].filter(Boolean).some(t => (t as string).toLowerCase().includes(filtre.q.toLowerCase()))
                : true;
            return byTip && byDurum && byQ;
        });
    }, [basvurular, filtre]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-rose-50 via-white to-emerald-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Hasta ve Yaşlı Hizmetleri</h1>
                        <p className="mt-3 text-gray-700">
                            <strong>Evde bakım</strong>, <strong>hasta nakil</strong>, <strong>psikolojik destek</strong>, <strong>gıda desteği</strong>,
                            <strong> cihaz emanet</strong> ve <strong>ilaç/ölçüm hatırlatma</strong> hizmetleri tek sayfada. Başvurunuzu yapın, durumunuzu izleyin.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="success">Yerinde Ziyaret</Badge>
                            <Badge tone="info">Randevu & Planlama</Badge>
                            <Badge tone="warning">Önceliklendirme</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1585842324539-189ed4680f3f?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* vaat/istatistik şeridi */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"><span>⏱️</span><div><div className="text-lg font-semibold leading-none">3 iş günü</div><div className="text-sm text-gray-600">Ön değerlendirme hedefi</div></div></div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"><span>🧑‍⚕️</span><div><div className="text-lg font-semibold leading-none">Yerinde ziyaret</div><div className="text-sm text-gray-600">Hemşire/sosyal hizmet uzmanı</div></div></div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"><span>📄</span><div><div className="text-lg font-semibold leading-none">{yil}</div><div className="text-sm text-gray-600">E-imza/JSON çıktılar</div></div></div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["ondeger", "Hızlı Ön Değerlendirme"],
                            ["basvuru", "Başvuru Formu (Evde Bakım/Nakil/Cihaz…)"],
                            ["hatirlatma", "İlaç/Ölçüm Hatırlatma"],
                            ["takip", "Başvuru Takip / JSON"],
                            ["sss", "A’dan Z’ye SSS"],
                            ["iletisim", "İletişim"],
                        ].map(([id, label]) => (
                            <li key={id}><a href={`#${id}`} className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">{label}</a></li>
                        ))}
                    </ul>
                </nav>

                {/* içerik */}
                <main className="space-y-10">
                    {/* Ön değerlendirme */}
                    <Section id="ondeger" title="Hızlı Ön Değerlendirme (Demo)">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <div className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Durum Check-List</h3>
                                <ul className="space-y-2 text-sm">
                                    {riskItems.map(i => (
                                        <li key={i.k} className="flex items-center gap-2">
                                            <input type="checkbox" checked={!!triage[i.k]} onChange={(e) => setTriage(s => ({ ...s, [i.k]: e.target.checked }))} />
                                            <span>{i.t}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
                                    Risk Skoru: <span className="font-semibold">{riskSkor}/80</span> • Öncelik:{" "}
                                    <Badge tone={riskOncelik === "acil" ? "danger" : riskOncelik === "oncelikli" ? "warning" : "neutral"}>{riskOncelik.toUpperCase()}</Badge>
                                </div>
                            </div>
                            <div className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Önerilen Hizmetler</h3>
                                <ul className="list-disc pl-5 text-sm">{oneriler.map((o, i) => <li key={i}>{o}</li>)}</ul>
                                <Callout title="Nasıl çalışır? – Ön Değerlendirme" tone="info">
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><span className="font-semibold">Gerekli bilgi:</span> Yalnızca durum kutucuklarını işaretlersiniz.</li>
                                        <li><span className="font-semibold">Ne veriyoruz:</span> Risk skorunuza göre <strong>öncelik</strong> ve öneri listesi.</li>
                                        <li><span className="font-semibold">Gizlilik:</span> İşaretler cihazınızda kalır, sunucuya gönderilmez.</li>
                                    </ul>
                                </Callout>
                            </div>
                        </div>
                    </Section>

                    {/* Başvuru */}
                    <Section id="basvuru" title="Başvuru Formu (Evde Bakım • Nakil • Cihaz Emanet • vb.)">
                        <div className="grid gap-4 md:grid-cols-[380px_1fr]">
                            <form onSubmit={gonderBasvuru} className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Temel Bilgiler</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <select className="rounded-lg border px-3 py-2" value={yeni.tip} onChange={(e) => setYeni(s => ({ ...s, tip: e.target.value as TalepTipi }))}>
                                        <option value="evde-bakim">Evde Bakım Ziyareti</option>
                                        <option value="nakil">Hasta Nakil (Randevulu)</option>
                                        <option value="psikolojik-destek">Psikolojik Destek</option>
                                        <option value="gida-paketi">Gıda Paketi / Yemek</option>
                                        <option value="cihaz-emanet">Cihaz Emanet (T. sandalye vb.)</option>
                                        <option value="ilac-hatirlatma">İlaç/Ölçüm Hatırlatma</option>
                                        <option value="diger">Diğer</option>
                                    </select>
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ad Soyad" value={yeni.adSoyad} onChange={(e) => setYeni(s => ({ ...s, adSoyad: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="T.C. Kimlik (ops.)" value={yeni.tcKimlik || ""} onChange={(e) => setYeni(s => ({ ...s, tcKimlik: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" type="number" placeholder="Doğum Yılı (ops.)" value={yeni.dogumYili || ""} onChange={(e) => setYeni(s => ({ ...s, dogumYili: parseInt(e.target.value || "0") || undefined }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="İletişim (tel/e-posta)" value={yeni.iletisim} onChange={(e) => setYeni(s => ({ ...s, iletisim: e.target.value }))} />
                                    <label className="flex items-center justify-end gap-2 text-sm">
                                        <input type="checkbox" checked={yeni.yakiniMi} onChange={(e) => setYeni(s => ({ ...s, yakiniMi: e.target.checked }))} />
                                        Yakını adına başvuruyorum
                                    </label>
                                </div>
                                <input className="mt-2 w-full rounded-lg border px-3 py-2" placeholder="Adres" value={yeni.adres} onChange={(e) => setYeni(s => ({ ...s, adres: e.target.value }))} />

                                {/* konum */}
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" type="number" step="0.0001" placeholder="Enlem (lat)" value={(yeni.coords?.lat ?? center.lat)} onChange={(e) => setYeni(s => ({ ...s, coords: { ...(s.coords || center), lat: parseFloat(e.target.value) } }))} />
                                    <input className="rounded-lg border px-3 py-2" type="number" step="0.0001" placeholder="Boylam (lng)" value={(yeni.coords?.lng ?? center.lng)} onChange={(e) => setYeni(s => ({ ...s, coords: { ...(s.coords || center), lng: parseFloat(e.target.value) } }))} />
                                </div>
                                <button type="button" onClick={useMyLocation} className="mt-2 w-full rounded-lg bg-emerald-600 px-3 py-2 text-white hover:opacity-95">Konumumu Kullan</button>

                                {/* tip'e özel alanlar */}
                                {yeni.tip === "nakil" && (
                                    <div className="mt-3 rounded-lg border p-3">
                                        <h4 className="mb-1 font-semibold text-sm">Nakil Bilgileri</h4>
                                        <input className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="Çıkış Kurumu/Adres" value={yeni.nakil?.cikis || ""} onChange={(e) => setYeni(s => ({ ...s, nakil: { ...(s.nakil || {}), cikis: e.target.value } }))} />
                                        <input className="mt-2 w-full rounded-lg border px-3 py-2" placeholder="Varış Kurumu/Adres" value={yeni.nakil?.varis || ""} onChange={(e) => setYeni(s => ({ ...s, nakil: { ...(s.nakil || {}), varis: e.target.value } }))} />
                                        <input className="mt-2 w-full rounded-lg border px-3 py-2" type="datetime-local" value={yeni.nakil?.randevuZamani || ""} onChange={(e) => setYeni(s => ({ ...s, nakil: { ...(s.nakil || {}), randevuZamani: e.target.value } }))} />
                                    </div>
                                )}

                                {yeni.tip === "cihaz-emanet" && (
                                    <div className="mt-3 rounded-lg border p-3">
                                        <h4 className="mb-1 font-semibold text-sm">Cihaz Bilgileri</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <select className="rounded-lg border px-3 py-2" value={yeni.cihaz?.tur || ""} onChange={(e) => setYeni(s => ({ ...s, cihaz: { ...(s.cihaz || {}), tur: e.target.value as any } }))}>
                                                <option value="">Seçiniz</option>
                                                <option value="tekerlekli-sandalye">Tekerlekli Sandalye</option>
                                                <option value="walker">Yürüteç (Walker)</option>
                                                <option value="koltuk-degneyi">Koltuk Değneği</option>
                                                <option value="yatak">Hasta Yatağı</option>
                                                <option value="diğer">Diğer</option>
                                            </select>
                                            <input className="rounded-lg border px-3 py-2" placeholder="Beden/Ölçü (ops.)" value={yeni.cihaz?.beden || ""} onChange={(e) => setYeni(s => ({ ...s, cihaz: { ...(s.cihaz || {}), beden: e.target.value } }))} />
                                        </div>
                                        <label className="mt-2 flex items-center gap-2 text-sm">
                                            <input type="checkbox" checked={!!yeni.cihaz?.emanetTaahhut} onChange={(e) => setYeni(s => ({ ...s, cihaz: { ...(s.cihaz || {}), emanetTaahhut: e.target.checked } }))} />
                                            Emanet/iadeye ilişkin taahhüdü kabul ediyorum.
                                        </label>
                                    </div>
                                )}

                                <label className="mt-3 block text-sm text-gray-600">Açıklama</label>
                                <textarea className="min-h-[80px] w-full rounded-lg border px-3 py-2" value={yeni.aciklama || ""} onChange={(e) => setYeni(s => ({ ...s, aciklama: e.target.value }))} />

                                <label className="mt-3 block text-sm text-gray-600">Rapor/Belge (opsiyonel)</label>
                                <input className="w-full rounded-lg border px-3 py-2" type="file" accept="image/*,application/pdf" onChange={(e) => toBase64(e.target.files?.[0], (b64) => setYeni(s => ({ ...s, rapor: b64 })))} />
                                {yeni.rapor && <p className="mt-1 text-xs text-gray-500">Belge eklendi.</p>}

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">Başvuruyu Gönder</button>
                                    <ExportMenu
                                        data={{ triage }}
                                        filename="hasta-yasli-basvuru-taslak.json"
                                        resourceId="hasta_ve_yasli_hizmetleri"
                                    />
                                </div>

                                <Callout title="Nasıl çalışır? – Başvuru" tone="info">
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><span className="font-semibold">Gerekli bilgiler:</span> Ad-soyad, <strong>iletişim</strong>, adres, isteğe bağlı rapor ve konum.</li>
                                        <li><span className="font-semibold">Ne veriyoruz:</span> Başvuru numarası, <strong>öncelik</strong> (risk) ve planlama için geri dönüş.</li>
                                        <li><span className="font-semibold">Nakil:</span> Çıkış/varış ve randevu saati girerseniz buna göre araç planlaması yapılır.</li>
                                        <li><span className="font-semibold">Cihaz emanet:</span> Uygun stok var ise teslim planı yapılır; iade/taahhüt metni zorunludur.</li>
                                    </ul>
                                </Callout>
                            </form>

                            {/* Harita + kısa bilgi */}
                            <div className="space-y-4">
                                <div className="overflow-hidden rounded-xl border">
                                    <iframe title="Harita" className="h-72 w-full" src={osmEmbed(yeni.coords || center)} loading="lazy" />
                                </div>
                                <div className="rounded-xl border bg-white p-4">
                                    <h3 className="mb-2 font-semibold">Bilgilendirme</h3>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        <li>Ön değerlendirme hedefi: <strong>3 iş günü</strong></li>
                                        <li>Yerinde ziyaret gerektiren başvurularda randevu verilir.</li>
                                        <li>Acil durum için her zaman <strong>112</strong>’yi arayın.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* İlaç/Ölçüm Hatırlatma */}
                    <Section id="hatirlatma" title="İlaç/Ölçüm Hatırlatma Kayıt">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <form onSubmit={kaydetRem} className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Hatırlatma Ekle</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ad Soyad" value={rem.adSoyad} onChange={(e) => setRem(s => ({ ...s, adSoyad: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="İletişim (tel/e-posta)" value={rem.iletisim} onChange={(e) => setRem(s => ({ ...s, iletisim: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="İlaç/Kontrol" value={rem.ilacAdi} onChange={(e) => setRem(s => ({ ...s, ilacAdi: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="Doz/Not (ops.)" value={rem.doz} onChange={(e) => setRem(s => ({ ...s, doz: e.target.value }))} />
                                </div>
                                <div className="mt-2">
                                    <label className="text-sm text-gray-600">Saatler</label>
                                    <div className="flex gap-2">
                                        <input className="flex-1 rounded-lg border px-3 py-2" placeholder="08:00" value={saatText} onChange={(e) => setSaatText(e.target.value)} />
                                        <button type="button" className="rounded-lg bg-gray-900 px-3 py-2 text-white hover:opacity-95" onClick={saatEkle}>Ekle</button>
                                    </div>
                                    {rem.saatler.length > 0 && <div className="mt-2 text-sm text-gray-700">Saatler: {rem.saatler.join(", ")}</div>}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input className="rounded-lg border px-3 py-2" type="date" value={rem.baslangicISO} onChange={(e) => setRem(s => ({ ...s, baslangicISO: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" type="date" value={rem.bitisISO || ""} onChange={(e) => setRem(s => ({ ...s, bitisISO: e.target.value }))} />
                                </div>
                                <label className="mt-2 flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={rem.aktif} onChange={(e) => setRem(s => ({ ...s, aktif: e.target.checked }))} /> Kayıt aktif
                                </label>
                                <div className="mt-3">
                                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:opacity-95" type="submit">Kaydet</button>
                                </div>

                                <Callout title="Nasıl çalışır? – Hatırlatma" tone="info">
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><span className="font-semibold">Gerekli bilgiler:</span> Ad-soyad, iletişim, ilaç/ölçüm adı ve saat(ler).</li>
                                        <li><span className="font-semibold">Ne veriyoruz:</span> Yerel kayıt ve JSON çıktısı; sağlık birimlerimiz programınızı görebilir (demo).</li>
                                        <li><span className="font-semibold">Uyarı:</span> Bu sayfa bildirim/sms göndermez; plan görüntüleme amaçlıdır.</li>
                                    </ul>
                                </Callout>
                            </form>

                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold">Kayıtlı Hatırlatmalar</h3>
                                    <ExportMenu
                                        data={reminders}
                                        filename="ilac-hatirlatmalar.json"
                                        resourceId="hasta_ve_yasli_hizmetleri"
                                    />
                                </div>
                                {reminders.length === 0 ? (
                                    <p className="text-sm text-gray-600">Kayıt yok.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {reminders.map(r => (
                                            <li key={r.id} className="rounded-lg border p-3 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <div><span className="font-medium">{r.adSoyad}</span> • {r.ilacAdi} ({r.doz || "—"})</div>
                                                    <Badge tone={r.aktif ? "success" : "neutral"}>{r.aktif ? "AKTİF" : "PASİF"}</Badge>
                                                </div>
                                                <div className="text-gray-700">Saatler: {r.saatler.join(", ")} • {r.baslangicISO}{r.bitisISO ? ` → ${r.bitisISO}` : ""}</div>
                                                <div className="text-gray-600">İletişim: {r.iletisim}</div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </Section>

                    {/* Takip / JSON */}
                    <Section id="takip" title="Başvuru Takip / JSON">
                        <div className="rounded-xl border bg-white p-4">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                <h3 className="font-semibold">Başvurular</h3>
                                <div className="flex items-center gap-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ara (No/Ad/Adres)" value={filtre.q} onChange={(e) => setFiltre(s => ({ ...s, q: e.target.value }))} />
                                    <select className="rounded-lg border px-3 py-2" value={filtre.tip} onChange={(e) => setFiltre(s => ({ ...s, tip: e.target.value as any }))}>
                                        <option value="hepsi">Tip (hepsi)</option>
                                        <option value="evde-bakim">Evde Bakım</option>
                                        <option value="nakil">Nakil</option>
                                        <option value="psikolojik-destek">Psikolojik Destek</option>
                                        <option value="gida-paketi">Gıda Paketi</option>
                                        <option value="cihaz-emanet">Cihaz Emanet</option>
                                        <option value="ilac-hatirlatma">İlaç/Ölçüm</option>
                                        <option value="diger">Diğer</option>
                                    </select>
                                    <select className="rounded-lg border px-3 py-2" value={filtre.durum} onChange={(e) => setFiltre(s => ({ ...s, durum: e.target.value as any }))}>
                                        <option value="hepsi">Durum (hepsi)</option>
                                        <option value="Ön Değerlendirme">Ön Değerlendirme</option>
                                        <option value="Yerinde Ziyaret Planlandı">Yerinde Ziyaret Planlandı</option>
                                        <option value="Hizmet Başladı">Hizmet Başladı</option>
                                        <option value="Tamamlandı">Tamamlandı</option>
                                        <option value="Beklemede">Beklemede</option>
                                    </select>
                                    <ExportMenu
                                        data={basvurular}
                                        filename="hasta-yasli-basvurular.json"
                                        resourceId="hasta_ve_yasli_hizmetleri"
                                    />
                                </div>
                            </div>

                            {filtered.length === 0 ? (
                                <p className="text-sm text-gray-600">Kayıt bulunamadı.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="px-3 py-2 text-left">Başvuru No</th>
                                                <th className="px-3 py-2 text-left">Ad Soyad</th>
                                                <th className="px-3 py-2 text-left">Tip</th>
                                                <th className="px-3 py-2 text-left">Durum</th>
                                                <th className="px-3 py-2 text-left">Öncelik</th>
                                                <th className="px-3 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map((b) => (
                                                <tr key={b.id} className="border-b">
                                                    <td className="px-3 py-2">{b.basvuruNo}</td>
                                                    <td className="px-3 py-2">{b.adSoyad}</td>
                                                    <td className="px-3 py-2 capitalize">{b.tip.replace("-", " ")}</td>
                                                    <td className="px-3 py-2">
                                                        <Badge tone={b.durum === "Tamamlandı" ? "success" : b.durum === "Hizmet Başladı" ? "info" : "neutral"}>{b.durum}</Badge>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Badge tone={b.oncelik === "acil" ? "danger" : b.oncelik === "oncelikli" ? "warning" : "neutral"}>{b.oncelik.toUpperCase()}</Badge>
                                                    </td>
                                                    <td className="px-3 py-2 space-x-2">
                                                        {b.coords && (
                                                            <a className="rounded-lg bg-gray-100 px-3 py-1.5 hover:bg-gray-200" href={`https://www.openstreetmap.org/?mlat=${b.coords.lat}&mlon=${b.coords.lng}#map=17/${b.coords.lat}/${b.coords.lng}`} target="_blank" rel="noreferrer">
                                                                Haritada Aç
                                                            </a>
                                                        )}
                                                        <button className="rounded-lg bg-gray-100 px-3 py-1.5 hover:bg-gray-200" onClick={() => ilerlet(b.id)}>İlerle (demo)</button>
                                                        <ExportMenu
                                                            data={b}
                                                            filename={`${b.basvuruNo}.json`}
                                                            resourceId="hasta_ve_yasli_hizmetleri"
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
                                <li><span className="font-semibold">Aşamalar:</span> Ön Değerlendirme → Yerinde Ziyaret Planlandı → <strong>Hizmet Başladı</strong> → Tamamlandı.</li>
                                <li><span className="font-semibold">Takip:</span> Başvuru No ile sorgulama ve JSON çıkışı; bot/entegre sistemler bu yapıdan beslenebilir.</li>
                                <li><span className="font-semibold">Acil durum:</span> Her zaman 112 — bu sayfa acil müdahale kanalı değildir.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* SSS */}
                    <Section id="sss" title="A’dan Z’ye Sık Sorulan Sorular">
                        {[
                            ["Kimler başvurabilir?",
                                "İlçemizde ikamet eden hasta, yaşlı ve engelli bireyler ile birinci derece yakınları (yakını adına başvuru işaretlenebilir)."],
                            ["Evde bakım kapsamında neler var?",
                                "Pansuman, tansiyon-şeker ölçümü, kişisel bakım, ilaç takibi, ev içi güvenlik önerileri ve sosyal hizmet yönlendirmesi."],
                            ["Nakil hizmeti acil mi?",
                                "Hayır; planlı randevulu nakildir. Acil durumlarda 112 aranmalıdır."],
                            ["Cihaz emanetinde depozito var mı?",
                                "Depozito yoktur; emanet/iade taahhüdü alınır, cihazın düzenli kullanımı ve iadesi beklenir."],
                            ["İlaç hatırlatma SMS gönderiyor mu?",
                                "Bu sayfa sadece kayıt/plan görüntüsü sağlar. SMS/çağrı merkezinden bilgilendirme belediye entegrasyonu olduğunda yapılır."],
                            ["Psikolojik destek nasıl veriliyor?",
                                "Ön görüşme telefonla yapılır; gerektiğinde yüz yüze randevu planlanır veya ilgili kurumlara yönlendirilir."],
                            ["Gıda desteği için gelir belgesi şart mı?",
                                "Sosyal inceleme sonucuna göre karar verilir; belge talep edilebilir."],
                            ["Adresim farklı ilçede, başvurabilir miyim?",
                                "Hizmet kapsamı ilçe sınırlarımızdır. Fakat danışmanlık ve yönlendirme yapabiliriz."],
                            ["Yalnız yaşayan yaşlılar için düzenli ziyaret var mı?",
                                "Evet, risk skoruna göre periyodik ziyaret planlanabilir."],
                            ["Rapor yüklemek zorunlu mu?",
                                "Zorunlu değildir; fakat süreç hızlanır. Fotoğraf/PDF ekleyebilirsiniz."],
                            ["Önceliklendirme nasıl belirlenir?",
                                "Sayfadaki ön değerlendirme işaretleri ve sosyal inceleme ile 'acil/oncelikli/normal' olarak belirlenir."],
                            ["Başvuru kaç günde sonuçlanır?",
                                "Ön değerlendirme hedefi 3 iş günüdür; hizmetin türüne göre değişir."],
                            ["Yakınım için başvuru yaparken vekalet gerekir mi?",
                                "Genelde gerekmez; ancak bazı işlemlerde muvafakat istenebilir."],
                            ["Randevuyu kim planlıyor?",
                                "Çağrı merkezi veya birim görevlisi, uygunluk ve önceliğe göre arayıp planlar."],
                            ["Evde bakım ücretli mi?",
                                "Bu program kapsamındaki hizmetler ücretsizdir. Malzeme/ilaç bedelleri SGK/mevzuata göre değişebilir."],
                            ["Engelli raporu olanlara öncelik var mı?",
                                "Evet, değerlendirmede öncelik unsurlarından biridir."],
                            ["Ev ortamı uygunsuzsa ne olur?",
                                "Öncelikle basit düzenlemeler önerilir; gerekirse farklı çözüm önerilerine yönlendirilir."],
                            ["Nakil aracında refakatçi olabilir mi?",
                                "Evet, tek refakatçi kabul edilir (araç kapasitesine göre)."],
                            ["Cihaz stokta yoksa ne olur?",
                                "Sıra listesine alınır, temin edildiğinde iletişime geçilir."],
                            ["İlaç saatlerini kaç adet girebilirim?",
                                "İstediğiniz kadar saat ekleyebilirsiniz; ör. 08:00, 14:00, 22:00."],
                            ["Verilerim güvende mi?",
                                "Başvuru verileri yalnızca hizmet sunumu için kullanılır ve mevzuata uygun saklanır."],
                            ["Evde temizlik hizmeti veriyor musunuz?",
                                "Kapsam dışıdır; sosyal destek programlarıyla eşgüdüm kurulabilir."],
                            ["Yatak yarası bakımı yapılıyor mu?",
                                "Temel pansuman ve eğitim verilir; ağır olgularda sağlık kurumuna yönlendirme yapılır."],
                            ["Dini/psikososyal destek var mı?",
                                "Psikososyal destek ve ilgili kurumlara yönlendirme yapılabilir."],
                            ["Demans/Alzheimer için özel destek?",
                                "Eğitim materyali, bakım veren danışmanlığı ve uygun kurumlara yönlendirme sağlanır."],
                            ["Tekerlekli sandalye için ölçü nasıl alınır?",
                                "Teslim sırasında görevli tarafından uygunluk kontrolü yapılır; beden alanı formu da doldurulabilir."],
                            ["Hizmet saatleri nedir?",
                                "Hafta içi 08:30–17:30; Acil durumlar 112 kapsamındadır."],
                            ["Başvuruyu iptal edebilir miyim?",
                                "Evet, çağrı merkezi veya bu sayfadaki iletişim bölümünden iptal talebinizi iletebilirsiniz."],
                            ["Evcil hayvan bakımı yapılıyor mu?",
                                "Kapsam dışıdır; veteriner hizmetleri sayfasına yönlendirilir."],
                            ["Hastane randevusunu siz alıyor musunuz?",
                                "Randevu almıyoruz; aldığınız randevuya göre nakil planlarız."],
                            ["Şehir dışına nakil yapılıyor mu?",
                                "İlçe içi/komşu ilçeler önceliklidir. Uzun mesafede kurumlar arası koordinasyon gerekebilir."],
                            ["Oksijen desteği sağlıyor musunuz?",
                                "Uzun süreli oksijen cihazı temini kapsam dışıdır; ilgili kurumlara yönlendirme yapılır."],
                            ["Evde fizik tedavi var mı?",
                                "Program dâhilinde değil; uygun kurumlara yönlendirme yapılır."],
                            ["Verdiğim konum yanlışsa?",
                                "Haritadaki enlem/boylam alanlarını düzeltebilir veya 'Konumumu Kullan' butonunu tıklayabilirsiniz."],
                            ["Başvuru sonucumu nereden göreceğim?",
                                "Başvuru Takip bölümünde Başvuru No ile görüntüleyebilir, JSON olarak indirebilirsiniz."],
                            ["İstismar/ihmal şüphesi varsa?",
                                "Gizlilik içinde gerekli kurumlara bildirim yapılır; lütfen olası riskleri belirtin."],
                            ["Psikolojik destek kaç seans?",
                                "İhtiyaca göre planlanır; ilk değerlendirme sonrası bilgilendirme yapılır."],
                            ["Kişisel verileri silme talebi?",
                                "KVKK kapsamında veri erişim/silme başvurusu yapabilirsiniz."],
                        ].map(([q, a], i) => (
                            <details key={i} className="group py-3">
                                <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-emerald-400">
                                    <span className="font-medium">{q as string}</span>
                                </summary>
                                <div className="prose prose-sm max-w-none py-2 text-gray-700">{a as string}</div>
                            </details>
                        ))}
                    </Section>

                    {/* İletişim */}
                    <Section id="iletisim" title="İletişim">
                        <p><strong>Sağlık ve Sosyal Hizmetler Müdürlüğü</strong></p>
                        <p>Çağrı Merkezi: 444 0 XXX • Alo 153</p>
                        <p>E-posta: <a className="text-emerald-700 underline" href="mailto:sosyalhizmet@birimajans.bel.tr">sosyalhizmet@birimajans.bel.tr</a></p>
                        <p>Adres: Belediye Hizmet Binası, [adres]</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <a href="#basvuru" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95">Başvuru Yap</a>
                            <Link href="/kvkk" className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95">KVKK Bilgilendirme</Link>
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
}
