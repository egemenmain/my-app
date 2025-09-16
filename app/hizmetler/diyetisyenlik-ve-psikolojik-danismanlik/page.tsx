"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/* ——— küçük yardımcılar ——— */
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

/* ——— tipler ——— */
type ServiceType = "diyetisyen" | "psikolojik-danisman";
type Mode = "yuz-yuze" | "goruntulu";
type Randevu = {
    id: string;
    hizmet: ServiceType;
    modus: Mode;
    tarih: string; // YYYY-MM-DD
    saat: string; // HH:mm
    adSoyad: string;
    tel?: string;
    email?: string;
    kvkkOnam: boolean;
    not?: string;
};

/* ——— data ——— */
const PROGRAMLAR = [
    { ad: "Diyabet Beslenme Okulu", gun: "Salı", saat: "14:00", aciklama: "4 hafta / grup eğitim" },
    { ad: "Uyku Hijyeni Atölyesi", gun: "Perşembe", saat: "18:00", aciklama: "1 saat / online" },
    { ad: "Ebeveynlik & Ekran Süreleri", gun: "Cumartesi", saat: "11:00", aciklama: "Seminer" },
    { ad: "60+ Güçlü Tabak", gun: "Çarşamba", saat: "10:30", aciklama: "Beslenme ve egzersiz" },
];

const REHBER_MENULER = [
    { ad: "7 Günlük Dengeli Menü", link: "#", not: "Et/vejetaryen seçenekli" },
    { ad: "Cüzdan Dostu Pazar Listesi (700₺)", link: "#", not: "Mevsim ürünleriyle" },
    { ad: "Glisemik Dostu Tarifler", link: "#", not: "Diyabet uyumlu" },
    { ad: "Pratik Ara Öğünler", link: "#", not: "Okul & iş için" },
];

const yil = new Date().getFullYear();

/* ——— ufak yardımcılar ——— */
function nextDays(n = 14) {
    const arr: string[] = [];
    const d = new Date();
    for (let i = 0; i < n; i++) {
        const di = new Date(d);
        di.setDate(d.getDate() + i);
        arr.push(di.toISOString().slice(0, 10));
    }
    return arr;
}
const SLOT_SAATLER = ["09:30", "10:30", "11:30", "14:00", "15:00", "16:00", "17:00"];

/* ——— ANA SAYFA ——— */
export default function Page() {
    /* Randevu durumu */
    const [randevular, setRandevular] = useState<Randevu[]>([]);
    const [form, setForm] = useState<Randevu>({
        id: crypto.randomUUID(),
        hizmet: "diyetisyen",
        modus: "yuz-yuze",
        tarih: nextDays()[1],
        saat: SLOT_SAATLER[0],
        adSoyad: "",
        kvkkOnam: false,
    });

    useEffect(() => {
        try {
            const s = localStorage.getItem("health-randevu");
            if (s) setRandevular(JSON.parse(s));
        } catch { }
    }, []);
    const submitRandevu = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.adSoyad || !form.kvkkOnam) {
            alert("Ad soyad girin ve KVKK onamını işaretleyin.");
            return;
        }
        const yeni = { ...form, id: crypto.randomUUID() };
        const liste = [yeni, ...randevular].slice(0, 20);
        setRandevular(liste);
        try {
            localStorage.setItem("health-randevu", JSON.stringify(liste));
        } catch { }
        alert("Randevu talebiniz alındı (demo). Çağrı merkezi onay için arayacak.");
        setForm((f) => ({ ...f, id: crypto.randomUUID(), adSoyad: "", tel: "", email: "", not: "" }));
    };

    /* Ön değerlendirme – BKİ, bel çevresi, PHQ-2 & GAD-2  */
    const [boy, setBoy] = useState<number | "">("");
    const [kilo, setKilo] = useState<number | "">("");
    const [bel, setBel] = useState<number | "">("");
    const bmi = useMemo(() => {
        if (!boy || !kilo) return null;
        const b = Number(kilo) / Math.pow(Number(boy) / 100, 2);
        return Math.round(b * 10) / 10;
    }, [boy, kilo]);
    const bmiKategori = useMemo(() => {
        if (!bmi) return "";
        if (bmi < 18.5) return "Zayıf";
        if (bmi < 25) return "Normal";
        if (bmi < 30) return "Fazla kilolu";
        return "Obez";
    }, [bmi]);

    // 0=Hiç; 1=Birkaç gün; 2=Günlerin yarısından fazlası; 3=Neredeyse her gün
    const [phq, setPhq] = useState<[number, number]>([0, 0]); // keyifsizlik + isteksizlik
    const [gad, setGad] = useState<[number, number]>([0, 0]); // kaygı + kontrol zorluğu
    const phqSum = phq[0] + phq[1];
    const gadSum = gad[0] + gad[1];

    /* günlük ilerleme – opsiyonel mini panel */
    type Log = { tarih: string; kilo?: number; bel?: number; uykuSaat?: number; ruh?: number };
    const [logs, setLogs] = useState<Log[]>([]);
    const [log, setLog] = useState<Log>({ tarih: new Date().toISOString().slice(0, 10), ruh: 3, uykuSaat: 7 });
    useEffect(() => {
        try {
            const s = localStorage.getItem("health-logs");
            if (s) setLogs(JSON.parse(s));
        } catch { }
    }, []);
    const ekleLog = () => {
        const yeni = [log, ...logs].slice(0, 30);
        setLogs(yeni);
        localStorage.setItem("health-logs", JSON.stringify(yeni));
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-50 via-white to-blue-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Diyetisyenlik ve Psikolojik Danışmanlık</h1>
                        <p className="mt-3 text-gray-700">
                            Ücretsiz danışmanlık, randevu, kısa tarama testleri, örnek menüler ve sık sorular—hepsi tek sayfada.
                            Kriz durumlarında <strong>112</strong> veya <strong>183</strong> ALO Sosyal Destek hattını arayın.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="success">Ücretsiz / Randevulu</Badge>
                            <Badge tone="info">Gizlilik & KVKK</Badge>
                            <Badge tone="warning">Krizde ilk yardım</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* hızlı aksiyonlar */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-4">
                <a href="#randevu" className="rounded-xl bg-gray-50 p-3 hover:bg-gray-100">📅 <span className="ml-2 font-semibold">Hızlı Randevu</span></a>
                <a href="#tarama" className="rounded-xl bg-gray-50 p-3 hover:bg-gray-100">🧭 <span className="ml-2 font-semibold">Kendimi Değerlendir</span></a>
                <a href="#rehber" className="rounded-xl bg-gray-50 p-3 hover:bg-gray-100">🍽️ <span className="ml-2 font-semibold">Rehber & Menüler</span></a>
                <a href="#sss" className="rounded-xl bg-gray-50 p-3 hover:bg-gray-100">❓ <span className="ml-2 font-semibold">SSS</span></a>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["randevu", "Randevu"],
                            ["tarama", "Ön Değerlendirme"],
                            ["programlar", "Programlar"],
                            ["rehber", "Rehber & Materyal"],
                            ["ilerleme", "İlerleme Paneli"],
                            ["sss", "Sık Sorulanlar"],
                            ["gizlilik", "Gizlilik & İletişim"],
                        ].map(([id, label]) => (
                            <li key={id}>
                                <a href={`#${id}`} className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">{label}</a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* içerik */}
                <main className="space-y-10">
                    {/* RANDEVU */}
                    <Section id="randevu" title="Randevu Talebi">
                        <div className="grid gap-4 md:grid-cols-[380px_1fr]">
                            <form onSubmit={submitRandevu} className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <select className="rounded-lg border px-3 py-2" value={form.hizmet} onChange={(e) => setForm((f) => ({ ...f, hizmet: e.target.value as ServiceType }))}>
                                        <option value="diyetisyen">Diyetisyen</option>
                                        <option value="psikolojik-danisman">Psikolojik Danışman</option>
                                    </select>
                                    <select className="rounded-lg border px-3 py-2" value={form.modus} onChange={(e) => setForm((f) => ({ ...f, modus: e.target.value as Mode }))}>
                                        <option value="yuz-yuze">Yüz yüze</option>
                                        <option value="goruntulu">Görüntülü</option>
                                    </select>
                                </div>

                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <select className="rounded-lg border px-3 py-2" value={form.tarih} onChange={(e) => setForm((f) => ({ ...f, tarih: e.target.value }))}>
                                        {nextDays().map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <select className="rounded-lg border px-3 py-2" value={form.saat} onChange={(e) => setForm((f) => ({ ...f, saat: e.target.value }))}>
                                        {SLOT_SAATLER.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <input className="rounded-lg border px-3 py-2" placeholder="Ad Soyad" value={form.adSoyad} onChange={(e) => setForm((f) => ({ ...f, adSoyad: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" placeholder="Telefon (ops.)" value={form.tel ?? ""} onChange={(e) => setForm((f) => ({ ...f, tel: e.target.value }))} />
                                </div>
                                <input className="mt-2 w-full rounded-lg border px-3 py-2" placeholder="E-posta (ops.)" value={form.email ?? ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                                <textarea className="mt-2 min-h-[70px] w-full rounded-lg border px-3 py-2" placeholder="Kısa not (kronik hastalık, ilaç, hedef vb.)" value={form.not ?? ""} onChange={(e) => setForm((f) => ({ ...f, not: e.target.value }))} />

                                <label className="mt-2 flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={form.kvkkOnam} onChange={(e) => setForm((f) => ({ ...f, kvkkOnam: e.target.checked }))} />
                                    KVKK Aydınlatma Metni’ni okudum, onaylıyorum.
                                </label>
                                <div className="mt-3">
                                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:opacity-95" type="submit">Randevu Talep Et</button>
                                </div>
                            </form>

                            <div className="space-y-3">
                                <Callout title="Süreç & Hizmet Standardı" tone="info">
                                    <ul className="list-disc pl-5">
                                        <li>Ön değerlendirme ve uygun randevu: <strong>3 iş günü</strong> içinde.</li>
                                        <li>İlk görüşme 40 dk; takip seansı 20 dk.</li>
                                        <li>İkamet şartı aranabilir, kimlik kontrolü yapılır.</li>
                                    </ul>
                                </Callout>
                                <div className="rounded-xl border bg-white p-4">
                                    <h3 className="mb-2 font-semibold">Son Randevu Taleplerim (demo)</h3>
                                    {randevular.length === 0 ? <p className="text-sm text-gray-600">Kayıt yok.</p> : (
                                        <ul className="space-y-2 text-sm">
                                            {randevular.slice(0, 6).map((r) => (
                                                <li key={r.id} className="rounded-lg border p-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">{r.hizmet === "diyetisyen" ? "Diyetisyen" : "Psikolojik Danışman"}</span>
                                                        <span>{r.tarih} • {r.saat}</span>
                                                    </div>
                                                    <div className="text-gray-600">{r.modus === "yuz-yuze" ? "Yüz yüze" : "Görüntülü"} • {r.adSoyad}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* ÖN DEĞERLENDİRME */}
                    <Section id="tarama" title="Kısa Ön Değerlendirme (3 dk)">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* BKİ & bel çevresi */}
                            <div className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">BKİ / Bel Çevresi</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <input className="rounded-lg border px-3 py-2" type="number" placeholder="Boy (cm)" value={boy} onChange={(e) => setBoy(e.target.value ? Number(e.target.value) : "")} />
                                    <input className="rounded-lg border px-3 py-2" type="number" placeholder="Kilo (kg)" value={kilo} onChange={(e) => setKilo(e.target.value ? Number(e.target.value) : "")} />
                                    <input className="rounded-lg border px-3 py-2" type="number" placeholder="Bel (cm)" value={bel} onChange={(e) => setBel(e.target.value ? Number(e.target.value) : "")} />
                                </div>
                                {bmi && (
                                    <div className="mt-2 rounded-lg bg-gray-50 p-3 text-sm">
                                        BKİ: <strong>{bmi}</strong> → <strong>{bmiKategori}</strong>{bel ? ` • Bel: ${bel} cm` : ""}.
                                        Bu bir <em>tarama aracıdır</em>; tanı koymaz. Uygun program ve hedef belirlemek için randevu alabilirsiniz.
                                    </div>
                                )}
                            </div>

                            {/* PHQ-2 & GAD-2 */}
                            <div className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Duygu Durumu Tarama (PHQ-2 & GAD-2)</h3>
                                <p className="text-xs text-gray-600">Son 2 haftada… (0=Hiç, 1=Birkaç gün, 2=Yarısından fazla, 3=Hemen her gün)</p>
                                <div className="mt-2 space-y-2 text-sm">
                                    <div>
                                        <div>Keyifsizlik, çökkün hissetme</div>
                                        <select className="mt-1 rounded-lg border px-2 py-1" value={phq[0]} onChange={(e) => setPhq(([_, b]) => [Number(e.target.value), b])}>
                                            <option value={0}>0</option><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
                                        </select>
                                    </div>
                                    <div>
                                        <div>İlgi/istek kaybı</div>
                                        <select className="mt-1 rounded-lg border px-2 py-1" value={phq[1]} onChange={(e) => setPhq(([a]) => [a, Number(e.target.value)])}>
                                            <option value={0}>0</option><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
                                        </select>
                                    </div>
                                    <div className="mt-2 rounded-lg bg-gray-50 p-2">PHQ-2 toplam: <strong>{phqSum}</strong> {phqSum >= 3 ? "→ Görüşme önerilir." : ""}</div>
                                </div>
                                <div className="mt-3 space-y-2 text-sm">
                                    <div>
                                        <div>Aşırı kaygı/tedirginlik</div>
                                        <select className="mt-1 rounded-lg border px-2 py-1" value={gad[0]} onChange={(e) => setGad(([_, b]) => [Number(e.target.value), b])}>
                                            <option value={0}>0</option><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
                                        </select>
                                    </div>
                                    <div>
                                        <div>Kaygıyı kontrol etmekte zorlanma</div>
                                        <select className="mt-1 rounded-lg border px-2 py-1" value={gad[1]} onChange={(e) => setGad(([a]) => [a, Number(e.target.value)])}>
                                            <option value={0}>0</option><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
                                        </select>
                                    </div>
                                    <div className="mt-2 rounded-lg bg-gray-50 p-2">GAD-2 toplam: <strong>{gadSum}</strong> {gadSum >= 3 ? "→ Görüşme önerilir." : ""}</div>
                                </div>
                                <Callout title="Kırmızı Bayrak" tone="danger">
                                    Kendinize/başkasına zarar verme düşüncesi, yoğun panik, ağır göğüs ağrısı, bayılma vb. durumlarda <strong>112</strong>’yi arayın veya en yakın acile başvurun.
                                </Callout>
                            </div>
                        </div>
                    </Section>

                    {/* PROGRAMLAR */}
                    <Section id="programlar" title="Grup Programları & Atölyeler">
                        <div className="grid gap-3 md:grid-cols-2">
                            {PROGRAMLAR.map((p, i) => (
                                <div key={i} className="rounded-2xl border bg-white p-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-semibold">{p.ad}</h3>
                                        <Badge tone="info">{p.gun} • {p.saat}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">{p.aciklama}</p>
                                    <div className="mt-3">
                                        <Link href="#randevu" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:opacity-95 text-sm">Katılım Talebi</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* REHBER */}
                    <Section id="rehber" title="Rehber & Materyal Kütüphanesi">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Örnek Menüler / Listeler</h3>
                                <ul className="space-y-2">
                                    {REHBER_MENULER.map((m, i) => (
                                        <li key={i} className="rounded-lg border p-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{m.ad}</span>
                                                <Badge tone="neutral">{m.not}</Badge>
                                            </div>
                                            <div className="mt-1 text-sm text-gray-600">PDF / tarif bağlantıları kurum altyapısına eklenecek.</div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Callout title="Duygu Düzenleme – 5 Dakika" tone="success">
                                <ul className="list-disc pl-5">
                                    <li>4-7-8 nefes egzersizi: 4 sn al – 7 sn tut – 8 sn ver.</li>
                                    <li>Topraklama: 5 şey gör, 4 şey hisset, 3 şey duy, 2 şey kokla, 1 şey tat.</li>
                                    <li>Uyku hijyeni: aynı saatte yat-kalk, ekranı 1 saat önce bırak, kafeini azalt.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* İLERLEME PANELİ */}
                    <Section id="ilerleme" title="Dijital İlerleme Paneli (kişisel)">
                        <div className="grid gap-4 md:grid-cols-[380px_1fr]">
                            <div className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <input className="rounded-lg border px-3 py-2" type="date" value={log.tarih} onChange={(e) => setLog((l) => ({ ...l, tarih: e.target.value }))} />
                                    <input className="rounded-lg border px-3 py-2" type="number" placeholder="Uyku (saat)" value={log.uykuSaat ?? ""} onChange={(e) => setLog((l) => ({ ...l, uykuSaat: Number(e.target.value) }))} />
                                    <input className="rounded-lg border px-3 py-2" type="number" placeholder="Kilo (kg)" value={log.kilo ?? ""} onChange={(e) => setLog((l) => ({ ...l, kilo: Number(e.target.value) }))} />
                                    <input className="rounded-lg border px-3 py-2" type="number" placeholder="Bel (cm)" value={log.bel ?? ""} onChange={(e) => setLog((l) => ({ ...l, bel: Number(e.target.value) }))} />
                                </div>
                                <label className="mt-2 block text-sm">Ruh hâli (1–5)</label>
                                <input className="w-full" type="range" min={1} max={5} value={log.ruh ?? 3} onChange={(e) => setLog((l) => ({ ...l, ruh: Number(e.target.value) }))} />
                                <button onClick={ekleLog} type="button" className="mt-2 rounded-lg bg-gray-900 px-3 py-2 text-white hover:opacity-95">Kaydet</button>
                                <p className="mt-2 text-xs text-gray-600">Veriler yalnızca bu cihazda saklanır (localStorage).</p>
                            </div>
                            <div className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Son Kayıtlar</h3>
                                {logs.length === 0 ? <p className="text-sm text-gray-600">Henüz kayıt yok.</p> : (
                                    <ul className="space-y-2 text-sm">
                                        {logs.slice(0, 8).map((l, i) => (
                                            <li key={i} className="rounded-lg border p-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{l.tarih}</span>
                                                    <span className="text-gray-600">Ruh: {l.ruh ?? "-"} / Uyku: {l.uykuSaat ?? "-"}s</span>
                                                </div>
                                                <div className="text-gray-700">Kilo: {l.kilo ?? "-"} kg • Bel: {l.bel ?? "-"} cm</div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </Section>

                    {/* SSS – vatandaşın aklına gelebilecek A’dan Z’ye */}
                    <Section id="sss" title="Sık Sorulan Sorular (A’dan Z’ye)">
                        <div className="space-y-3">
                            {[
                                ["Kimler yararlanabilir?", "İlçemizde ikamet eden herkes başvurabilir. Öncelikli gruplar: gençler, kadınlar, 60+, engelliler ve kronik hastalığı olanlar."],
                                ["Ücretli mi?", "Danışmanlık ücretsizdir. Bazı kurs/materyal ücretleri olabilir; duyurularda belirtilir."],
                                ["Kaç seans alabilirim?", "Kişiye göre değişir. Ortalama 3–6 takip seansı planlanır."],
                                ["İlaç yazılıyor mu?", "Psikolojik danışmanlık ilaç yazmaz. Tıbbi değerlendirme için aile hekimi/psikiyatriye yönlendirilirsiniz."],
                                ["Gizlilik nasıl sağlanıyor?", "KVKK’ya uygun olarak veriler yalnızca hizmet amacıyla işlenir. Üçüncü kişilerle paylaşılmaz."],
                                ["Randevuyu nasıl iptal/erteleme yaparım?", "Çağrı merkezini arayabilir veya onay SMS’indeki bağlantıyı kullanabilirsiniz. 24 saat önce bildirmeniz rica olunur."],
                                ["Online seans nasıl olur?", "Onay SMS’i ile gelen bağlantıdan tarayıcıyla bağlanırsınız. Kulaklık önerilir."],
                                ["Diyet listeleri herkese aynı mı?", "Hayır. Yaş, sağlık durumu ve hedefe göre kişiselleştirilir."],
                                ["Vejetaryen/glütensiz menü alabilir miyim?", "Evet, danışmanınızla hedeflerinizi paylaşmanız yeterli."],
                                ["Acil durum / kriz?", "Kendinize veya başkasına zarar verme düşüncesi, ciddi panik vb. durumlarda 112’yi arayın. 183 ALO Sosyal Destek hattı da 7/24 hizmet verir."],
                                ["Çocuk/ergen danışmanlığı var mı?", "Evet. Ebeveyn onayı ve eşlik zorunludur."],
                                ["Engelli erişimi?", "Bina erişimi uygundur; gerektiğinde evde hizmet için sosyal hizmet birimine yönlendirme yapılır."],
                                ["Çok dilli hizmet?", "İhtiyaca göre tercüman desteği sağlanabilir; randevu alırken belirtiniz."],
                                ["Kilo veremiyorum, nereden başlayayım?", "Önce BKİ/bel ölçümünüzü girin, uyku/aktivite/öğün düzeni hedefleri belirleyin ve ilk randevuyu alın."],
                                ["İş yerinde stres için ne yapabilirim?", "Duygu düzenleme araçları (nefes/topraklama), düzenli uyku, kısa yürüyüşler; yoğunluk sürerse psikolojik danışmanla plan yapın."],
                                ["Seanslarda kamera zorunlu mu?", "Online seansta yüz yüze iletişim için önerilir; talep halinde kamera kapalı da olabilir."],
                            ].map(([q, a], i) => (
                                <details key={i} className="group rounded-lg border bg-white p-3">
                                    <summary className="cursor-pointer list-none font-medium">• {q}</summary>
                                    <div className="prose prose-sm max-w-none py-2 text-gray-700">{a}</div>
                                </details>
                            ))}
                        </div>
                    </Section>

                    {/* GİZLİLİK & İLETİŞİM */}
                    <Section id="gizlilik" title="Gizlilik, KVKK & İletişim">
                        <Callout title="KVKK Özet" tone="info">
                            Danışmanlık sırasında paylaştığınız bilgiler {yil} yılı KVKK mevzuatına uygun olarak işlenir.
                            Yalnızca hizmet amaçlı kullanılur; onayınız olmadan üçüncü kişilere aktarılmaz.
                        </Callout>
                        <div className="mt-3">
                            <p><strong>Sağlık İşleri / Sosyal Destek Merkezi</strong></p>
                            <p>Alo 153 • Çağrı Merkezi: 444 0 XXX</p>
                            <p>E-posta: <a className="text-emerald-700 underline" href="mailto:saglik@birimajans.bel.tr">saglik@birimajans.bel.tr</a></p>
                            <p>Adres: Birim Ajans Belediyesi Hizmet Binası, [adres]</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <a href="tel:112" className="rounded-lg bg-red-600 px-3 py-2 text-white hover:opacity-90 text-sm">112 Acil</a>
                                <a href="tel:183" className="rounded-lg bg-gray-900 px-3 py-2 text-white hover:opacity-90 text-sm">183 ALO Sosyal Destek</a>
                                <Link href="#randevu" className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:opacity-90 text-sm">Randevu Al</Link>
                            </div>
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
}
