"use client";

import React, { useEffect, useMemo, useState } from "react";
import ExportMenu from "@/components/ExportMenu";
import Link from "next/link";

/* -------------------------------- UI yardımcıları -------------------------------- */
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

/* -------------------------------- Harita ---------------------------------- */
type Coords = { lat: number; lng: number };
const DEFAULT_CENTER: Coords = { lat: 41.015, lng: 29.0 }; // İstanbul civarı (demo)

function osmEmbed(center: Coords) {
    const d = 0.02;
    const left = center.lng - d;
    const right = center.lng + d;
    const top = center.lat + d;
    const bottom = center.lat - d;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;
}

/* -------------------------------- Tipler ---------------------------------- */
type Kategori =
    | "Bilgi Edinme"
    | "Şikâyet"
    | "Öneri"
    | "Teşekkür"
    | "Talep"
    | "Başvuru"
    | "İtiraz"
    | "İhbar";

type Durum = "Alındı" | "İşleme Alındı" | "Eksik Bilgi" | "Cevaplandı" | "Reddedildi";

type EkDosya = { name: string; data: string };

type Dilekce = {
    id: string;
    no: string;
    tarihISO: string;
    durum: Durum;
    kategori: Kategori;
    konu: string;
    icerik: string;

    // başvuran bilgileri
    adSoyad: string;
    tckn?: string;
    eposta?: string;
    telefon?: string;
    adres?: string;

    // opsiyoneller
    coords?: Coords;
    dosyalar: EkDosya[];
    referansNo?: string; // varsa önceki başvuru
    kvkkOnay: boolean;

    // yanıt alanları (demo)
    cevapMetni?: string;
};

/* ------------------------------- Yardımcılar ------------------------------- */
const KATEGORILER: Kategori[] = ["Bilgi Edinme", "Şikâyet", "Öneri", "Teşekkür", "Talep", "Başvuru", "İtiraz", "İhbar"];

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
const downloadJSON = (name: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
};
const toBase64Many = (files: FileList | null, cb: (list: EkDosya[]) => void) => {
    if (!files || files.length === 0) return cb([]);
    const arr: EkDosya[] = [];
    let done = 0;
    Array.from(files).forEach((f) => {
        const r = new FileReader();
        r.onload = () => {
            arr.push({ name: f.name, data: r.result as string });
            done++;
            if (done === files.length) cb(arr);
        };
        r.readAsDataURL(f);
    });
};
const kisaNo = () => Math.random().toString(36).slice(2, 6).toUpperCase();
const yeniDilekceNo = () => {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    return `DLK-${ymd}-${kisaNo()}`;
};
const templateFor = (k: Kategori) => {
    switch (k) {
        case "Bilgi Edinme":
            return "…. konu hakkında 4982 sayılı Kanun kapsamında tarafıma bilgi/belge erişimi sağlanmasını arz ederim.";
        case "Şikâyet":
            return "…. adresinde/konusunda yaşanan sorun ile ilgili gereğinin yapılmasını ve tarafıma bilgilendirme yapılmasını talep ederim.";
        case "Öneri":
            return "…. hizmetinin daha etkin yürütülebilmesi için … önerimin değerlendirilmesini arz ederim.";
        case "Teşekkür":
            return "…. biriminizin … tarihli hizmetinden büyük memnuniyet duydum, emeği geçenlere teşekkür ederim.";
        case "Talep":
            return "…. hususunda işlem yapılması/başvurumun alınması için gereğini arz ederim.";
        case "Başvuru":
            return "…. hizmeti için gerekli başvurumu yapmak isterim. Gerekli bilgi ve belgeler ekte sunulmuştur.";
        case "İtiraz":
            return "…. tarih ve … sayılı işleme karşı gerekçeleri aşağıda belirtilen itirazımın değerlendirilmesini arz ederim.";
        case "İhbar":
            return "…. adres/konumda … hususunda mevzuata aykırı durum bulunmaktadır. Gerekli incelemenin yapılmasını arz ederim.";
    }
};

/* --------------------------------- Sayfa ---------------------------------- */
const LS_KEY = "genel-dilekce-kayitlar";

export default function DilekceGenelMuracaatPage() {
    const yil = new Date().getFullYear();

    /* konum */
    const [center, setCenter] = useState<Coords>(DEFAULT_CENTER);
    const useMyLocation = () => {
        if (!("geolocation" in navigator)) return alert("Tarayıcınız konum özelliğini desteklemiyor.");
        navigator.geolocation.getCurrentPosition(
            (p) => setCenter({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => alert("Konum alınamadı.")
        );
    };

    /* kayıtlar */
    const [kayitlar, setKayitlar] = useState<Dilekce[]>([]);
    useEffect(() => setKayitlar(loadLS<Dilekce[]>(LS_KEY, [])), []);

    /* form */
    const [form, setForm] = useState<Dilekce>({
        id: crypto.randomUUID(),
        no: yeniDilekceNo(),
        tarihISO: new Date().toISOString(),
        durum: "Alındı",
        kategori: "Talep",
        konu: "",
        icerik: templateFor("Talep"),
        adSoyad: "",
        tckn: "",
        eposta: "",
        telefon: "",
        adres: "",
        coords: center,
        dosyalar: [],
        referansNo: "",
        kvkkOnay: false,
    });

    useEffect(() => setForm((s) => ({ ...s, coords: center })), [center]);

    /* filtre */
    const [filtre, setFiltre] = useState<{ q: string; kat: "hepsi" | Kategori; durum: "hepsi" | Durum }>({
        q: "",
        kat: "hepsi",
        durum: "hepsi",
    });

    const filtered = useMemo(() => {
        return kayitlar.filter((r) => {
            const byKat = filtre.kat === "hepsi" ? true : r.kategori === filtre.kat;
            const byDurum = filtre.durum === "hepsi" ? true : r.durum === filtre.durum;
            const byQ = filtre.q
                ? [r.no, r.konu, r.adSoyad, r.referansNo].filter(Boolean).some((t) => (t as string).toLowerCase().includes(filtre.q.toLowerCase()))
                : true;
            return byKat && byDurum && byQ;
        });
    }, [kayitlar, filtre]);

    /* gönder */
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.kvkkOnay) return alert("KVKK aydınlatmasını onaylamalısınız.");
        if (!form.adSoyad || !form.konu || !form.icerik) return alert("Ad Soyad, Konu ve İçerik zorunludur.");
        const rec: Dilekce = {
            ...form,
            id: crypto.randomUUID(),
            no: yeniDilekceNo(),
            tarihISO: new Date().toISOString(),
            durum: "Alındı",
            coords: form.coords,
            dosyalar: form.dosyalar || [],
        };
        const y = [rec, ...kayitlar].slice(0, 300);
        setKayitlar(y);
        saveLS(LS_KEY, y);
        navigator.clipboard?.writeText(rec.no).catch(() => { });
        alert("Dilekçeniz alındı (demo). Başvuru No kopyalandı: " + rec.no);
        setForm({
            id: crypto.randomUUID(),
            no: yeniDilekceNo(),
            tarihISO: new Date().toISOString(),
            durum: "Alındı",
            kategori: "Talep",
            konu: "",
            icerik: templateFor("Talep"),
            adSoyad: "",
            tckn: "",
            eposta: "",
            telefon: "",
            adres: "",
            coords: center,
            dosyalar: [],
            referansNo: "",
            kvkkOnay: false,
        });
    };

    /* demo: durum ilerlet */
    const ilerlet = (id: string) => {
        setKayitlar((prev) => {
            const y = prev.map((r) => {
                if (r.id !== id) return r;
                const next: Durum =
                    r.durum === "Alındı"
                        ? "İşleme Alındı"
                        : r.durum === "İşleme Alındı"
                            ? "Cevaplandı"
                            : r.durum === "Eksik Bilgi"
                                ? "İşleme Alındı"
                                : "Cevaplandı";
                return { ...r, durum: next };
            });
            saveLS(LS_KEY, y);
            return y;
        });
    };

    /* şablon doldur */
    const applyTemplate = (k: Kategori) => {
        setForm((s) => ({ ...s, kategori: k, icerik: templateFor(k) }));
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-sky-50 via-white to-emerald-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Dilekçe – Genel Müracaat</h1>
                        <p className="mt-3 text-gray-700">
                            Belediye birimlerine <strong>bilgi edinme</strong>, <strong>şikâyet</strong>, <strong>öneri</strong>,{" "}
                            <strong>talep</strong> ve diğer başvurularınızı buradan iletebilirsiniz. Başvurularınız için otomatik{" "}
                            <strong>Başvuru No</strong> oluşturulur ve ilerleyişi takip edebilirsiniz (demo).
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="info">Şablonlu Dilekçe</Badge>
                            <Badge tone="success">Ek Dosya & Konum</Badge>
                            <Badge tone="warning">Başvuru Takibi</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1555371365-9f71d2dbe9a9?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* kısa vaat */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>📝</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">Başvuru No</div>
                        <div className="text-sm text-gray-600">Otomatik oluşturulur</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>⏱️</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">Hedef {yil}</div>
                        <div className="text-sm text-gray-600">Süreç şeffaf ve izlenebilir</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🔐</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">KVKK</div>
                        <div className="text-sm text-gray-600">Veriler sadece işlem için</div>
                    </div>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["basvuru", "Dilekçe Oluştur"],
                            ["sablon", "Hazır Şablonlar"],
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
                    {/* Başvuru formu */}
                    <Section id="basvuru" title="Dilekçe Oluştur">
                        <div className="grid gap-4 md:grid-cols-[380px_1fr]">
                            <form onSubmit={submit} className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={form.kategori}
                                        onChange={(e) => applyTemplate(e.target.value as Kategori)}
                                    >
                                        {KATEGORILER.map((k) => (
                                            <option key={k} value={k}>
                                                {k}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Konu başlığı"
                                        value={form.konu}
                                        onChange={(e) => setForm((s) => ({ ...s, konu: e.target.value }))}
                                    />
                                </div>

                                <textarea
                                    className="mt-2 min-h-[120px] w-full rounded-lg border px-3 py-2"
                                    placeholder="Dilekçe metniniz"
                                    value={form.icerik}
                                    onChange={(e) => setForm((s) => ({ ...s, icerik: e.target.value }))}
                                />

                                <h4 className="mt-3 font-semibold">Başvuran Bilgileri</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Ad Soyad"
                                        value={form.adSoyad}
                                        onChange={(e) => setForm((s) => ({ ...s, adSoyad: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="T.C. Kimlik No (ops.)"
                                        value={form.tckn || ""}
                                        onChange={(e) => setForm((s) => ({ ...s, tckn: e.target.value }))}
                                    />
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="E-posta (ops.)"
                                        value={form.eposta || ""}
                                        onChange={(e) => setForm((s) => ({ ...s, eposta: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Telefon (ops.)"
                                        value={form.telefon || ""}
                                        onChange={(e) => setForm((s) => ({ ...s, telefon: e.target.value }))}
                                    />
                                </div>
                                <input
                                    className="mt-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="Adres (ops.)"
                                    value={form.adres || ""}
                                    onChange={(e) => setForm((s) => ({ ...s, adres: e.target.value }))}
                                />

                                <div className="mt-3">
                                    <label className="block text-sm text-gray-600">Ek dosyalar (PDF/JPG/PNG - ops.)</label>
                                    <input
                                        className="w-full rounded-lg border px-3 py-2"
                                        type="file"
                                        accept=".pdf,image/*"
                                        multiple
                                        onChange={(e) => toBase64Many(e.target.files, (list) => setForm((s) => ({ ...s, dosyalar: list })))}
                                    />
                                    {form.dosyalar.length > 0 && (
                                        <ul className="mt-2 list-disc pl-5 text-xs text-gray-700">
                                            {form.dosyalar.map((d, i) => (
                                                <li key={i}>{d.name}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Önceki başvuru no (varsa)"
                                        value={form.referansNo || ""}
                                        onChange={(e) => setForm((s) => ({ ...s, referansNo: e.target.value }))}
                                    />
                                    <button type="button" onClick={useMyLocation} className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:opacity-95">
                                        Konumumu Ekle (ops.)
                                    </button>
                                </div>

                                <label className="mt-3 flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={form.kvkkOnay} onChange={(e) => setForm((s) => ({ ...s, kvkkOnay: e.target.checked }))} />
                                    KVKK Aydınlatma metnini okudum, kişisel verilerimin dilekçe işlemlerinde kullanılmasına onay veriyorum (demo).
                                </label>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                        Dilekçeyi Gönder
                                    </button>
                                    <ExportMenu 
                    data={form} 
                    filename="dilekce-taslak.json"
                    resourceId="dilekce_genel_muracaat"
                  />
                                </div>

                                <Callout title="Nasıl çalışır? – Dilekçe" tone="info">
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><span className="font-semibold">Gerekli bilgiler:</span> Kategori, konu, dilekçe metni ve ad-soyad. İletişim/ek/konum opsiyoneldir.</li>
                                        <li><span className="font-semibold">Ne veriyoruz:</span> Başvurunuz kayıt altına alınır, bir <strong>Başvuru No</strong> üretilir ve takibe açılır (demo).</li>
                                        <li><span className="font-semibold">Süreç:</span> “Alındı → İşleme Alındı → Cevaplandı / Eksik Bilgi” aşamalarında ilerler.</li>
                                    </ul>
                                </Callout>
                            </form>

                            {/* Harita + özet */}
                            <div className="space-y-4">
                                <div className="overflow-hidden rounded-xl border">
                                    <iframe title="Harita" className="h-72 w-full" src={osmEmbed(center)} loading="lazy" />
                                </div>
                                <div className="rounded-xl border bg-white p-4">
                                    <h3 className="mb-2 font-semibold">Şablon Kısayolları</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {KATEGORILER.map((k) => (
                                            <button
                                                key={k}
                                                type="button"
                                                onClick={() => applyTemplate(k)}
                                                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                                            >
                                                {k}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-3 text-xs text-gray-600">Kategori seçtiğinizde örnek metin otomatik doldurulur; dilediğiniz gibi düzenleyin.</p>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Takip */}
                    <Section id="takip" title="Başvuru Takip / JSON">
                        <div className="rounded-xl border bg-white p-4">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Ara (No/Konu/Ad)"
                                        value={filtre.q}
                                        onChange={(e) => setFiltre((f) => ({ ...f, q: e.target.value }))}
                                    />
                                    <select className="rounded-lg border px-3 py-2" value={filtre.kat} onChange={(e) => setFiltre((f) => ({ ...f, kat: e.target.value as any }))}>
                                        <option value="hepsi">Kategori (hepsi)</option>
                                        {KATEGORILER.map((k) => (
                                            <option key={k} value={k}>
                                                {k}
                                            </option>
                                        ))}
                                    </select>
                                    <select className="rounded-lg border px-3 py-2" value={filtre.durum} onChange={(e) => setFiltre((f) => ({ ...f, durum: e.target.value as any }))}>
                                        <option value="hepsi">Durum (hepsi)</option>
                                        <option>Alındı</option>
                                        <option>İşleme Alındı</option>
                                        <option>Eksik Bilgi</option>
                                        <option>Cevaplandı</option>
                                        <option>Reddedildi</option>
                                    </select>
                                </div>
                                <ExportMenu 
                    data={kayitlar} 
                    filename="dilekce-kayitlar.json"
                    resourceId="dilekce_genel_muracaat"
                  />
                            </div>

                            {filtered.length === 0 ? (
                                <p className="text-sm text-gray-600">Kayıt yok.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="px-3 py-2 text-left">No</th>
                                                <th className="px-3 py-2 text-left">Başvuran</th>
                                                <th className="px-3 py-2 text-left">Kategori</th>
                                                <th className="px-3 py-2 text-left">Konu</th>
                                                <th className="px-3 py-2 text-left">Durum</th>
                                                <th className="px-3 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map((r) => (
                                                <tr key={r.id} className="border-b align-top">
                                                    <td className="px-3 py-2">{r.no}</td>
                                                    <td className="px-3 py-2">{r.adSoyad}</td>
                                                    <td className="px-3 py-2">{r.kategori}</td>
                                                    <td className="px-3 py-2">
                                                        <div className="font-medium">{r.konu || "—"}</div>
                                                        <div className="line-clamp-2 text-xs text-gray-600">{r.icerik}</div>
                                                        {r.dosyalar.length > 0 && <div className="mt-1 text-xs text-gray-500">{r.dosyalar.length} ek dosya</div>}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Badge tone={r.durum === "Cevaplandı" ? "success" : r.durum === "Eksik Bilgi" || r.durum === "Reddedildi" ? "danger" : "info"}>{r.durum}</Badge>
                                                    </td>
                                                    <td className="px-3 py-2 space-x-2 whitespace-nowrap">
                                                        <button className="rounded-lg bg-gray-100 px-3 py-1.5 hover:bg-gray-200" onClick={() => ilerlet(r.id)}>
                                                            İlerle (demo)
                                                        </button>
                                                        <ExportMenu 
                    data={r} 
                    filename={`${r.no}.json`}
                    resourceId="dilekce_genel_muracaat"
                  />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <Callout title="Sistem nasıl işler?" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Aşamalar:</span> Alındı → İşleme Alındı → Cevaplandı (veya Eksik Bilgi / Reddedildi).</li>
                                <li><span className="font-semibold">Takip:</span> Başvuru No ile sorgulayabilirsiniz. Bu demo sayfada veriler cihazınızdaki localStorage’da tutulur.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* SSS */}
                    <Section id="sss" title="A’dan Z’ye Sık Sorulan Sorular">
                        {[
                            ["Kimler dilekçe verebilir?", "Gerçek ve tüzel kişiler. 18 yaş altı için veli/vasi tercih edilir."],
                            ["E-imza/mobil imza gerekiyor mu?", "Bu çevrimiçi formda gerekmez. Resmî e-imza gereken işlemler için e-Devlet kullanılmalıdır (demo)."],
                            ["T.C. Kimlik No zorunlu mu?", "Hayır, zorunlu değildir; ancak kimlik doğrulama/geri dönüş için faydalı olabilir."],
                            ["Başvuru sonucu ne kadar sürede gelir?", "Konuya göre değişir. Bilgi edinmede yasal süreler uygulanır; diğer başvurularda makul süre hedeflenir (bilgilendirme amaçlı)."],
                            ["Ek dosya sınırı var mı?", "Demo formda sayısal sınır yok; pratikte tek dosyada birleştirmeniz önerilir (PDF/JPG/PNG)."],
                            ["Konum paylaşmak şart mı?", "Değil. Sahadan işlem gereken başvurularda yer tespiti için faydalıdır."],
                            ["Başvuru numaramı kaybettim.", "Takip için formda ad-soyad/konu bilgisiyle arayabilirsiniz; gerçek sistemde kimlik doğrulaması gerekir."],
                            ["Aynı konuda birden çok başvuru yaptım, sorun olur mu?", "Mükerrer başvurular birleştirilir; işlem süresi etkilenebilir."],
                            ["Türkçe bilmeyenler nasıl başvurur?", "Basit Türkçe yeterlidir; mümkünse çeviri ile başvurun. Merkezde yüz yüze destek alınabilir."],
                            ["Gizlilik talep edebilir miyim?", "Kişisel verileriniz yalnızca işlem için kullanılır. İhbar gibi konularda kimlik gizliliği korunur (mevzuat çerçevesinde)."],
                            ["Fizikî (kağıt) dilekçe verebilir miyim?", "Evet. Başvuru formunuzu yazdırıp ıslak imza ile teslim edebilirsiniz."],
                            ["Başvurumu nasıl geri çekebilirim?", "Cevaplanmadan önce geri çekme talebinizi iletebilirsiniz; bu sayfada birim iletişiminden yazmanız gerekir."],
                            ["Başkasının adına başvuru yapabilir miyim?", "Vekalet/veli/vasi ilişkisi varsa mümkündür. Gerekirse belgelendirmeniz istenir."],
                            ["Şikâyetim başka kurum yetkisinde ise?", "Yanlış birime iletilen başvurular ilgili kuruma yönlendirilebilir veya bilgi verilir."],
                            ["Cevabı e-posta ile alabilir miyim?", "İsteğe bağlıdır; e-posta girerseniz bilgilendirme yapılır (demo)."],
                            ["Telefonla arandım ama açamadım.", "Mümkünse tekrar aranır; ek bilgi istenebilir. Yanıt vermezseniz süreç uzayabilir."],
                            ["Eksik bilgi mesajı gelirse ne yapmalıyım?", "İstenecek belgeleri/yanıtı tamamlayıp başvuru no ile geri iletin."],
                            ["Toplu imza kampanyası teslim edebilir miyiz?", "Evet; imza listeleri kişisel veriler içereceğinden KVKK’ya uygun şekilde işlenir."],
                            ["Dilekçe metnim uzun olabilir mi?", "Olabilir; net, somut ve saygılı bir dil tercih edilmelidir. Ek bilgi/kanıtları dosya olarak ekleyin."],
                            ["Hakaret/özel hayat ihlali içeren içerikler?", "Mevzuata aykırı içerikler işleme alınmaz; gerektiğinde yasal yollar işletilir."],
                            ["Yanlışlıkla gizli bilgi paylaştım, silebilir misiniz?", "Mümkün olan en kısa sürede bildirin; kişisel veriler mevzuata uygun şekilde düzeltilir/silinir."],
                            ["Yabancı uyruklular başvurabilir mi?", "Evet; iletişim bilgisiyle başvurabilirler."],
                            ["Eş zamanlı birden fazla kategori seçebilir miyim?", "Bir başvuruda bir kategori seçin; gerekirse ikinci bir başvuru oluşturun."],
                            ["Başvuruma belge numarası istiyorum.", "Otomatik Başvuru No üretilir. Resmî yazışma için bu numarayı kullanın."],
                            ["Zabıta, temizlik, altyapı gibi saha talepleri buradan olur mu?", "Evet; konum/fotoğraf paylaşırsanız ekip yönlendirmesi kolaylaşır."],
                            ["E-Devlet entegrasyonu var mı?", "Bu demo sayfada yok. Gerçek sistemde e-Devlet/KEP/e-imza kanalları desteklenebilir."],
                            ["Yanıttan memnun kalmadım, itiraz nasıl yapılır?", "Yeni bir dilekçe ile itirazınızı ve gerekçelerinizi belirtin; önceki başvuru numarasını ekleyin."],
                            ["Kurumsal (şirket/dernek) başvuruları?", "Kaşe/temsil belgesi gerekebilir; dosya olarak ekleyebilirsiniz."],
                            ["Acil durumlar için bu form uygun mu?", "Hayır. Can ve mal güvenliği içeren acil durumlarda 112/155/153 hatlarını arayın."],
                        ].map(([q, a], i) => (
                            <details key={i} className="group py-3">
                                <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-emerald-400">
                                    <span className="font-medium">{q as string}</span>
                                </summary>
                                <div className="prose prose-sm max-w-none py-2 text-gray-700">{a as string}</div>
                            </details>
                        ))}

                        <Callout title="Not – Yasal Çerçeve (bilgilendirme)" tone="warning">
                            Bu sayfa bir <strong>demo</strong>’dur. Gerçek başvurularda ilgili kanun ve yönetmelikler (ör. dilekçe ve
                            bilgi edinme hakkına ilişkin mevzuat) geçerlidir; resmî hükümler için belediyemizin duyurularını esas alınız.
                        </Callout>
                    </Section>

                    {/* İletişim */}
                    <Section id="iletisim" title="İletişim">
                        <p><strong>Yazı İşleri / Beyaz Masa</strong></p>
                        <p>Çağrı Merkezi: 444 0 XXX • Alo 153</p>
                        <p>E-posta: <a className="text-emerald-700 underline" href="mailto:basvuru@birimajans.bel.tr">basvuru@birimajans.bel.tr</a></p>
                        <p>Adres: Belediye Hizmet Binası, [adres]</p>
                        <div className="mt-3 flex gap-2">
                            <a href="#basvuru" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95">Yeni Dilekçe Oluştur</a>
                            <Link href="/ucretler-ve-tarifeler" className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95">Ücretler ve Tarifeler</Link>
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
}



