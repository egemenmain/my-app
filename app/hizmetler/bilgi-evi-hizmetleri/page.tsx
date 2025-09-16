"use client";

import React, { useEffect, useMemo, useState } from "react";
import ExportMenu from "@/components/ExportMenu";
import Link from "next/link";

/* ======================= UI helpers ======================= */
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

/* ======================= Map helper ======================= */
type Coords = { lat: number; lng: number };
function osmEmbed(center: Coords) {
    const d = 0.02;
    const left = center.lng - d;
    const right = center.lng + d;
    const top = center.lat + d;
    const bottom = center.lat - d;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;
}
const DEFAULT_CENTER: Coords = { lat: 40.992, lng: 29.127 }; // Ataşehir civarı (demo)

/* ======================= Types ======================= */
type AgeGroup = "ilkokul" | "ortaokul" | "lise" | "mezun" | "yetişkin";
type MemberStatus = "pending" | "approved" | "rejected";
type RezDurum = "pending" | "onaylı" | "iptal" | "check-in";
type FeedbackTip = "öneri" | "şikayet" | "teşekkür" | "talep";
type SinavTip = "LGS" | "YKS" | "KPSS" | "DGS" | "ALES" | "Diğer";

type Merkez = {
    id: string;
    ad: string;
    adres: string;
    tel?: string;
    coords: Coords;
    kapasite: number; // slot başına
    saatler: { open: string; close: string };
};

type Uye = {
    id: string;
    adSoyad: string;
    yasGrubu: AgeGroup;
    okul?: string;
    sinif?: string;
    eposta?: string;
    telefon?: string;
    adres?: string;
    veli?: string;
    foto?: string; // base64
    durum: MemberStatus;
    tarihISO: string;
};

type Rezervasyon = {
    id: string;
    merkezId: string;
    tarih: string; // YYYY-MM-DD
    slot: string; // "09:00-12:00"
    kisi: number;
    adSoyad: string;
    iletisim?: string;
    not?: string;
    durum: RezDurum;
    kayitISO: string;
};

type Etkinlik = {
    id: string;
    baslik: string;
    tarih: string; // YYYY-MM-DD
    saat?: string;
    merkezId: string;
    kontenjan: number;
    aciklama?: string;
};

type EtkinlikKaydi = {
    id: string;
    etkinlikId: string;
    adSoyad: string;
    iletisim?: string;
    not?: string;
    durum: "pending" | "onaylı" | "iptal";
    kayitISO: string;
};

type KitapOneri = {
    id: string;
    baslik: string;
    yazar?: string;
    isbn?: string;
    gerekce?: string;
    adSoyad?: string;
    iletisim?: string;
    tarihISO: string;
};

type OzelDersTalep = {
    id: string;
    sinav: SinavTip;
    ders: string;
    merkezId: string;
    tercihSaat?: string;
    adSoyad: string;
    iletisim: string;
    not?: string;
    tarihISO: string;
    durum: "pending" | "planlandı" | "tamamlandı";
};

type Feedback = {
    id: string;
    tip: FeedbackTip;
    mesaj: string;
    merkezId?: string;
    adSoyad?: string;
    iletisim?: string;
    tarihISO: string;
};

type Gonullu = {
    id: string;
    adSoyad: string;
    iletisim: string;
    beceriler?: string;
    uygunGunler?: string;
    tarihISO: string;
    durum: "pending" | "değerlendirme" | "kabul";
};

/* ======================= Seed data ======================= */
const MERKEZLER: Merkez[] = [
    {
        id: "m1",
        ad: "Bilgi Evi – İçerenköy",
        adres: "İçerenköy Mah. Örnek Cad. No:10",
        tel: "0216 000 00 01",
        coords: { lat: 40.9855, lng: 29.1252 },
        kapasite: 60,
        saatler: { open: "09:00", close: "21:00" },
    },
    {
        id: "m2",
        ad: "Bilgi Evi – Kayışdağı",
        adres: "Kayışdağı Mah. Eğitim Sk. No:5",
        tel: "0216 000 00 02",
        coords: { lat: 40.9828, lng: 29.1572 },
        kapasite: 50,
        saatler: { open: "09:00", close: "21:00" },
    },
    {
        id: "m3",
        ad: "Bilgi Evi – Barbaros",
        adres: "Barbaros Mah. Kültür Cd. No:3",
        tel: "0216 000 00 03",
        coords: { lat: 41.0021, lng: 29.1104 },
        kapasite: 40,
        saatler: { open: "09:00", close: "21:00" },
    },
];

const SLOT_LIST = ["09:00-12:00", "12:00-15:00", "15:00-18:00", "18:00-21:00"] as const;

const ETKINLIKLER: Etkinlik[] = [
    {
        id: "e1",
        baslik: "Hızlı Okuma Atölyesi",
        tarih: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
        saat: "17:00",
        merkezId: "m1",
        kontenjan: 25,
        aciklama: "Odaklanma ve anlama teknikleri",
    },
    {
        id: "e2",
        baslik: "Kodlama 101 (Scratch)",
        tarih: new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10),
        saat: "14:00",
        merkezId: "m2",
        kontenjan: 20,
    },
    {
        id: "e3",
        baslik: "Üniversite Tercih Danışmanlığı",
        tarih: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
        saat: "11:00",
        merkezId: "m3",
        kontenjan: 40,
    },
];

/* ======================= Utils ======================= */
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

/* ======================= LS keys ======================= */
const LS_UYE = "bilgi-ev-uyeler";
const LS_REZ = "bilgi-ev-rez";
const LS_ETKINLIK_KAYIT = "bilgi-ev-etkinlik-kayit";
const LS_KITAP = "bilgi-ev-kitap-oneri";
const LS_DERS = "bilgi-ev-ozel-ders";
const LS_FEEDBACK = "bilgi-ev-feedback";
const LS_GONULLU = "bilgi-ev-gonullu";

/* ======================= Page ======================= */
export default function BilgiEviHizmetleriPage() {
    const yil = new Date().getFullYear();

    /* ---- selection + map ---- */
    const [center, setCenter] = useState<Coords>(DEFAULT_CENTER);
    const [selMerkez, setSelMerkez] = useState<Merkez | null>(MERKEZLER[0]);
    useEffect(() => setCenter(selMerkez ? selMerkez.coords : DEFAULT_CENTER), [selMerkez]);
    const useMyLocation = () => {
        if (!("geolocation" in navigator)) return alert("Tarayıcınız konum özelliğini desteklemiyor.");
        navigator.geolocation.getCurrentPosition(
            (p) => setCenter({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => alert("Konum alınamadı.")
        );
    };

    /* ---- members ---- */
    const [uyeler, setUyeler] = useState<Uye[]>([]);
    useEffect(() => setUyeler(loadLS<Uye[]>(LS_UYE, [])), []);

    const [uye, setUye] = useState<Uye>({
        id: crypto.randomUUID(),
        adSoyad: "",
        yasGrubu: "lise",
        okul: "",
        sinif: "",
        eposta: "",
        telefon: "",
        adres: "",
        veli: "",
        foto: "",
        durum: "pending",
        tarihISO: new Date().toISOString(),
    });

    const submitUye = (e: React.FormEvent) => {
        e.preventDefault();
        if (!uye.adSoyad) return alert("Ad Soyad zorunludur.");
        const rec: Uye = { ...uye, id: crypto.randomUUID(), durum: "pending", tarihISO: new Date().toISOString() };
        const y = [rec, ...uyeler].slice(0, 200);
        setUyeler(y);
        saveLS(LS_UYE, y);
        alert("Üyelik başvurunuz alındı (demo).");
        setUye({
            id: crypto.randomUUID(),
            adSoyad: "",
            yasGrubu: "lise",
            okul: "",
            sinif: "",
            eposta: "",
            telefon: "",
            adres: "",
            veli: "",
            foto: "",
            durum: "pending",
            tarihISO: new Date().toISOString(),
        });
    };

    /* ---- reservations ---- */
    const [rezList, setRezList] = useState<Rezervasyon[]>([]);
    useEffect(() => setRezList(loadLS<Rezervasyon[]>(LS_REZ, [])), []);

    const today = new Date().toISOString().slice(0, 10);
    const [rez, setRez] = useState<Rezervasyon>({
        id: crypto.randomUUID(),
        merkezId: MERKEZLER[0].id,
        tarih: today,
        slot: SLOT_LIST[0],
        kisi: 1,
        adSoyad: "",
        iletisim: "",
        not: "",
        durum: "pending",
        kayitISO: new Date().toISOString(),
    });

    const doluluk = useMemo(() => {
        return (mId: string, trh: string, slot: string) => {
            const r = rezList.filter(
                (x) => x.merkezId === mId && x.tarih === trh && x.slot === slot && (x.durum === "pending" || x.durum === "onaylı")
            );
            return r.reduce((sum, x) => sum + (x.kisi || 1), 0);
        };
    }, [rezList]);

    const submitRez = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rez.adSoyad) return alert("Ad Soyad zorunludur.");
        const merkez = MERKEZLER.find((m) => m.id === rez.merkezId)!;
        const simdikiDoluluk = doluluk(rez.merkezId, rez.tarih, rez.slot);
        const kapasite = merkez.kapasite;
        const kalan = kapasite - simdikiDoluluk;
        if (rez.kisi > kalan) return alert(`Seçtiğiniz slotta kalan kapasite ${kalan}. Kişi sayısını düşürün veya başka slot seçin.`);
        const rec: Rezervasyon = { ...rez, id: crypto.randomUUID(), kayitISO: new Date().toISOString(), durum: "pending" };
        const y = [rec, ...rezList].slice(0, 300);
        setRezList(y);
        saveLS(LS_REZ, y);
        alert("Rezervasyon talebiniz alındı (demo).");
        setRez({
            id: crypto.randomUUID(),
            merkezId: rez.merkezId,
            tarih: rez.tarih,
            slot: rez.slot,
            kisi: 1,
            adSoyad: "",
            iletisim: "",
            not: "",
            durum: "pending",
            kayitISO: new Date().toISOString(),
        });
    };

    /* ---- events ---- */
    const [etkKayitlar, setEtkKayitlar] = useState<EtkinlikKaydi[]>([]);
    useEffect(() => setEtkKayitlar(loadLS<EtkinlikKaydi[]>(LS_ETKINLIK_KAYIT, [])), []);

    const [etkForm, setEtkForm] = useState<EtkinlikKaydi>({
        id: crypto.randomUUID(),
        etkinlikId: ETKINLIKLER[0].id,
        adSoyad: "",
        iletisim: "",
        not: "",
        durum: "pending",
        kayitISO: new Date().toISOString(),
    });

    const etkinlikDoluluk = useMemo(() => {
        return (eid: string) =>
            etkKayitlar.filter((k) => k.etkinlikId === eid && (k.durum === "pending" || k.durum === "onaylı")).length;
    }, [etkKayitlar]);

    const submitEtkinlik = (e: React.FormEvent) => {
        e.preventDefault();
        if (!etkForm.adSoyad) return alert("Ad Soyad zorunludur.");
        const etk = ETKINLIKLER.find((x) => x.id === etkForm.etkinlikId)!;
        const dolu = etkinlikDoluluk(etk.id);
        if (dolu >= etk.kontenjan) return alert("Kontenjan dolu. Lütfen başka etkinlik seçin.");
        const rec: EtkinlikKaydi = {
            ...etkForm,
            id: crypto.randomUUID(),
            durum: "pending",
            kayitISO: new Date().toISOString(),
        };
        const y = [rec, ...etkKayitlar].slice(0, 300);
        setEtkKayitlar(y);
        saveLS(LS_ETKINLIK_KAYIT, y);
        alert("Etkinlik kaydınız alındı (demo).");
        setEtkForm({
            id: crypto.randomUUID(),
            etkinlikId: etkForm.etkinlikId,
            adSoyad: "",
            iletisim: "",
            not: "",
            durum: "pending",
            kayitISO: new Date().toISOString(),
        });
    };

    /* ---- book suggestion ---- */
    const [kitaplar, setKitaplar] = useState<KitapOneri[]>([]);
    useEffect(() => setKitaplar(loadLS<KitapOneri[]>(LS_KITAP, [])), []);
    const [kitap, setKitap] = useState<KitapOneri>({
        id: crypto.randomUUID(),
        baslik: "",
        yazar: "",
        isbn: "",
        gerekce: "",
        adSoyad: "",
        iletisim: "",
        tarihISO: new Date().toISOString(),
    });
    const submitKitap = (e: React.FormEvent) => {
        e.preventDefault();
        if (!kitap.baslik) return alert("Kitap başlığı girin.");
        const rec: KitapOneri = { ...kitap, id: crypto.randomUUID(), tarihISO: new Date().toISOString() };
        const y = [rec, ...kitaplar].slice(0, 200);
        setKitaplar(y);
        saveLS(LS_KITAP, y);
        alert("Öneriniz alındı (demo).");
        setKitap({
            id: crypto.randomUUID(),
            baslik: "",
            yazar: "",
            isbn: "",
            gerekce: "",
            adSoyad: "",
            iletisim: "",
            tarihISO: new Date().toISOString(),
        });
    };

    /* ---- tutoring ---- */
    const [dersler, setDersler] = useState<OzelDersTalep[]>([]);
    useEffect(() => setDersler(loadLS<OzelDersTalep[]>(LS_DERS, [])), []);
    const [ders, setDers] = useState<OzelDersTalep>({
        id: crypto.randomUUID(),
        sinav: "YKS",
        ders: "Matematik",
        merkezId: MERKEZLER[0].id,
        tercihSaat: "",
        adSoyad: "",
        iletisim: "",
        not: "",
        tarihISO: new Date().toISOString(),
        durum: "pending",
    });
    const submitDers = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ders.adSoyad || !ders.iletisim) return alert("Ad Soyad ve iletişim zorunlu.");
        const rec: OzelDersTalep = { ...ders, id: crypto.randomUUID(), tarihISO: new Date().toISOString(), durum: "pending" };
        const y = [rec, ...dersler].slice(0, 200);
        setDersler(y);
        saveLS(LS_DERS, y);
        alert("Danışmanlık talebiniz alındı (demo).");
        setDers({
            id: crypto.randomUUID(),
            sinav: ders.sinav,
            ders: "Matematik",
            merkezId: ders.merkezId,
            tercihSaat: "",
            adSoyad: "",
            iletisim: "",
            not: "",
            tarihISO: new Date().toISOString(),
            durum: "pending",
        });
    };

    /* ---- feedback / suggestion ---- */
    const [fbList, setFbList] = useState<Feedback[]>([]);
    useEffect(() => setFbList(loadLS<Feedback[]>(LS_FEEDBACK, [])), []);
    const [fb, setFb] = useState<Feedback>({
        id: crypto.randomUUID(),
        tip: "öneri",
        mesaj: "",
        merkezId: undefined,
        adSoyad: "",
        iletisim: "",
        tarihISO: new Date().toISOString(),
    });
    const submitFb = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fb.mesaj) return alert("Mesaj boş olamaz.");
        const rec: Feedback = { ...fb, id: crypto.randomUUID(), tarihISO: new Date().toISOString() };
        const y = [rec, ...fbList].slice(0, 300);
        setFbList(y);
        saveLS(LS_FEEDBACK, y);
        alert("İletiniz alınmıştır (demo).");
        setFb({
            id: crypto.randomUUID(),
            tip: "öneri",
            mesaj: "",
            merkezId: undefined,
            adSoyad: "",
            iletisim: "",
            tarihISO: new Date().toISOString(),
        });
    };

    /* ---- volunteer ---- */
    const [gonulluler, setGonulluler] = useState<Gonullu[]>([]);
    useEffect(() => setGonulluler(loadLS<Gonullu[]>(LS_GONULLU, [])), []);
    const [gon, setGon] = useState<Gonullu>({
        id: crypto.randomUUID(),
        adSoyad: "",
        iletisim: "",
        beceriler: "",
        uygunGunler: "",
        tarihISO: new Date().toISOString(),
        durum: "pending",
    });
    const submitGon = (e: React.FormEvent) => {
        e.preventDefault();
        if (!gon.adSoyad || !gon.iletisim) return alert("Ad Soyad ve iletişim zorunlu.");
        const rec: Gonullu = { ...gon, id: crypto.randomUUID(), tarihISO: new Date().toISOString(), durum: "pending" };
        const y = [rec, ...gonulluler].slice(0, 200);
        setGonulluler(y);
        saveLS(LS_GONULLU, y);
        alert("Gönüllü başvurunuz alındı (demo).");
        setGon({
            id: crypto.randomUUID(),
            adSoyad: "",
            iletisim: "",
            beceriler: "",
            uygunGunler: "",
            tarihISO: new Date().toISOString(),
            durum: "pending",
        });
    };

    /* ---- computed ---- */
    const etkineGoreKayit = (eid: string) => etkKayitlar.filter((k) => k.etkinlikId === eid);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-sky-50 via-white to-emerald-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Bilgi Evi Hizmetleri</h1>
                        <p className="mt-3 text-gray-700">
                            Üyelik, <strong>çalışma salonu rezervasyonu</strong>, etkinlik kaydı, kitap önerisi, sınav danışmanlığı,
                            geri bildirim ve <strong>gönüllülük</strong> başvuruları bu sayfada.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="info">Kapasite Kontrolü</Badge>
                            <Badge tone="success">JSON Dışa Aktarım</Badge>
                            <Badge tone="warning">Harita & Merkez Seçimi</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* stats */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>📚</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">{MERKEZLER.length} merkez</div>
                        <div className="text-sm text-gray-600">Günlük {SLOT_LIST.length} oturum</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🕘</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">09:00–21:00</div>
                        <div className="text-sm text-gray-600">Haftanın 7 günü (demo)</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🗓️</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">{yil}</div>
                        <div className="text-sm text-gray-600">Online işlemler</div>
                    </div>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["uye", "Üyelik Başvurusu"],
                            ["rez", "Çalışma Salonu Rezervasyonu"],
                            ["etk", "Etkinlik / Atölye Kayıt"],
                            ["kitap", "Kitap Önerisi"],
                            ["ders", "Sınav Danışmanlığı / Etüt"],
                            ["fb", "Öneri-Şikâyet-Teşekkür"],
                            ["gon", "Gönüllü Başvurusu"],
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
                    {/* Üyelik */}
                    <Section id="uye" title="Üyelik Başvurusu">
                        <div className="grid gap-4 md:grid-cols-2">
                            <form onSubmit={submitUye} className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Ad Soyad"
                                        value={uye.adSoyad}
                                        onChange={(e) => setUye((s) => ({ ...s, adSoyad: e.target.value }))}
                                    />
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={uye.yasGrubu}
                                        onChange={(e) => setUye((s) => ({ ...s, yasGrubu: e.target.value as AgeGroup }))}
                                    >
                                        <option value="ilkokul">İlkokul</option>
                                        <option value="ortaokul">Ortaokul</option>
                                        <option value="lise">Lise</option>
                                        <option value="mezun">Mezun</option>
                                        <option value="yetişkin">Yetişkin</option>
                                    </select>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Okul (ops.)"
                                        value={uye.okul || ""}
                                        onChange={(e) => setUye((s) => ({ ...s, okul: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Sınıf (ops.)"
                                        value={uye.sinif || ""}
                                        onChange={(e) => setUye((s) => ({ ...s, sinif: e.target.value }))}
                                    />
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="E-posta (ops.)"
                                        value={uye.eposta || ""}
                                        onChange={(e) => setUye((s) => ({ ...s, eposta: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Telefon (ops.)"
                                        value={uye.telefon || ""}
                                        onChange={(e) => setUye((s) => ({ ...s, telefon: e.target.value }))}
                                    />
                                </div>
                                <input
                                    className="mt-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="Adres (ops.)"
                                    value={uye.adres || ""}
                                    onChange={(e) => setUye((s) => ({ ...s, adres: e.target.value }))}
                                />
                                <input
                                    className="mt-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="Veli / Yakın (ops.)"
                                    value={uye.veli || ""}
                                    onChange={(e) => setUye((s) => ({ ...s, veli: e.target.value }))}
                                />
                                <label className="mt-2 block text-sm text-gray-600">Foto (opsiyonel)</label>
                                <input
                                    className="w-full rounded-lg border px-3 py-2"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => toBase64(e.target.files?.[0], (b64) => setUye((s) => ({ ...s, foto: b64 })))}
                                />
                                {uye.foto && <img src={uye.foto} alt="foto" className="mt-2 max-h-40 rounded-lg object-cover" />}

                                <div className="mt-3">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                        Başvuruyu Gönder
                                    </button>
                                </div>
                            </form>

                            <Callout title="Nasıl çalışır? – Üyelik" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-semibold">Gerekli bilgiler:</span> Ad soyad ve yaş grubu. Dilerseniz okul/sınıf, e-posta/telefon ve adres ekleyin.</li>
                                    <li><span className="font-semibold">Ne veriyoruz:</span> Başvurunuz “pending” durumuyla kaydedilir, uygunluk kontrolünden sonra onaylanır (demo).</li>
                                    <li><span className="font-semibold">Kart/Numara:</span> Onay sonrasında üyelik numaranız SMS/e-posta ile paylaşılır (demo metni).</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* Rezervasyon */}
                    <Section id="rez" title="Çalışma Salonu Rezervasyonu">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <form onSubmit={submitRez} className="rounded-xl border bg-white p-4">
                                <label className="block text-sm text-gray-600">Merkez</label>
                                <select
                                    className="mt-1 w-full rounded-lg border px-3 py-2"
                                    value={rez.merkezId}
                                    onChange={(e) => {
                                        setRez((s) => ({ ...s, merkezId: e.target.value }));
                                        setSelMerkez(MERKEZLER.find((m) => m.id === e.target.value) || null);
                                    }}
                                >
                                    {MERKEZLER.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.ad} (Kapasite/slot: {m.kapasite})
                                        </option>
                                    ))}
                                </select>

                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="date"
                                        value={rez.tarih}
                                        onChange={(e) => setRez((s) => ({ ...s, tarih: e.target.value }))}
                                    />
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={rez.slot}
                                        onChange={(e) => setRez((s) => ({ ...s, slot: e.target.value }))}
                                    >
                                        {SLOT_LIST.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="number"
                                        min={1}
                                        value={rez.kisi}
                                        onChange={(e) => setRez((s) => ({ ...s, kisi: parseInt(e.target.value || "1") }))}
                                        placeholder="Kişi"
                                    />
                                </div>

                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Ad Soyad"
                                        value={rez.adSoyad}
                                        onChange={(e) => setRez((s) => ({ ...s, adSoyad: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="İletişim (ops.)"
                                        value={rez.iletisim || ""}
                                        onChange={(e) => setRez((s) => ({ ...s, iletisim: e.target.value }))}
                                    />
                                </div>
                                <input
                                    className="mt-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="Not (ops.)"
                                    value={rez.not || ""}
                                    onChange={(e) => setRez((s) => ({ ...s, not: e.target.value }))}
                                />

                                <div className="mt-2 rounded-lg bg-gray-50 p-3 text-sm">
                                    Kapasite:{" "}
                                    <span className="font-semibold">
                                        {MERKEZLER.find((m) => m.id === rez.merkezId)?.kapasite}
                                    </span>{" "}
                                    • Mevcut doluluk:{" "}
                                    <span className="font-semibold">{doluluk(rez.merkezId, rez.tarih, rez.slot)}</span>
                                </div>

                                <div className="mt-3">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                        Rezervasyon Talep Et
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-4">
                                <div className="overflow-hidden rounded-xl border">
                                    <iframe title="Merkez haritası" className="h-72 w-full" src={osmEmbed(center)} loading="lazy" />
                                </div>

                                <div className="rounded-xl border bg-white p-4">
                                    <h3 className="mb-2 font-semibold">Seçili Merkez Bilgileri</h3>
                                    {selMerkez ? (
                                        <div className="text-sm text-gray-700">
                                            <div className="font-medium">{selMerkez.ad}</div>
                                            <div>{selMerkez.adres}</div>
                                            <div>Tel: {selMerkez.tel || "-"}</div>
                                            <div>
                                                Çalışma Saatleri: {selMerkez.saatler.open} – {selMerkez.saatler.close}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-600">Merkez seçin.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Callout title="Nasıl çalışır? – Rezervasyon" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-semibold">Gerekli bilgiler:</span> Merkez, tarih, oturum ve kişi sayısı; ad soyad zorunlu.</li>
                                <li><span className="font-semibold">Ne veriyoruz:</span> Sistem doluluğu kontrol eder, talebinizi “pending” durumuyla kaydeder (demo).</li>
                                <li><span className="font-semibold">Kapasite:</span> Slot bazında görünür; onay sonrası girişte kimlik kontrolü yapılır.</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* Etkinlik */}
                    <Section id="etk" title="Etkinlik / Atölye Kayıt">
                        <div className="grid gap-4 md:grid-cols-2">
                            <form onSubmit={submitEtkinlik} className="rounded-xl border bg-white p-4">
                                <label className="block text-sm text-gray-600">Etkinlik seçin</label>
                                <select
                                    className="mt-1 w-full rounded-lg border px-3 py-2"
                                    value={etkForm.etkinlikId}
                                    onChange={(e) => setEtkForm((s) => ({ ...s, etkinlikId: e.target.value }))}
                                >
                                    {ETKINLIKLER.map((e) => {
                                        const d = etkinlikDoluluk(e.id);
                                        const kalan = e.kontenjan - d;
                                        return (
                                            <option key={e.id} value={e.id}>
                                                {e.baslik} – {e.tarih} {e.saat ? `(${e.saat})` : ""} • Kalan: {kalan}
                                            </option>
                                        );
                                    })}
                                </select>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Ad Soyad"
                                        value={etkForm.adSoyad}
                                        onChange={(e) => setEtkForm((s) => ({ ...s, adSoyad: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="İletişim (ops.)"
                                        value={etkForm.iletisim || ""}
                                        onChange={(e) => setEtkForm((s) => ({ ...s, iletisim: e.target.value }))}
                                    />
                                </div>
                                <input
                                    className="mt-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="Not (ops.)"
                                    value={etkForm.not || ""}
                                    onChange={(e) => setEtkForm((s) => ({ ...s, not: e.target.value }))}
                                />
                                <div className="mt-3">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                        Kayıt Ol
                                    </button>
                                </div>
                            </form>

                            <div className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Etkinlikler</h3>
                                <ul className="grid grid-cols-1 gap-3">
                                    {ETKINLIKLER.map((e) => (
                                        <li key={e.id} className="rounded-lg border p-3 text-sm">
                                            <div className="flex items-center justify-between">
                                                <div className="font-semibold">{e.baslik}</div>
                                                <Badge tone="info">
                                                    {e.tarih} {e.saat ? `• ${e.saat}` : ""}
                                                </Badge>
                                            </div>
                                            <div className="text-gray-700">{MERKEZLER.find((m) => m.id === e.merkezId)?.ad}</div>
                                            <div className="text-xs text-gray-500">
                                                Kontenjan: {e.kontenjan} • Kayıtlı: {etkineGoreKayit(e.id).length}
                                            </div>
                                            {e.aciklama && <div className="mt-1">{e.aciklama}</div>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <Callout title="Nasıl çalışır? – Etkinlik Kayıt" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Etkinlik seçtiğinizde kalan kontenjanı görürsünüz; kayıt sınırı dolduysa farklı oturum seçin.</li>
                                <li>Kayıtlar “pending” olarak oluşturulur; uygunluk durumunda onaylanır (demo).</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* Kitap önerisi */}
                    <Section id="kitap" title="Kitap Önerisi">
                        <div className="grid gap-4 md:grid-cols-2">
                            <form onSubmit={submitKitap} className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Kitap Başlığı"
                                        value={kitap.baslik}
                                        onChange={(e) => setKitap((s) => ({ ...s, baslik: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Yazar (ops.)"
                                        value={kitap.yazar || ""}
                                        onChange={(e) => setKitap((s) => ({ ...s, yazar: e.target.value }))}
                                    />
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="ISBN (ops.)"
                                        value={kitap.isbn || ""}
                                        onChange={(e) => setKitap((s) => ({ ...s, isbn: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Ad Soyad (ops.)"
                                        value={kitap.adSoyad || ""}
                                        onChange={(e) => setKitap((s) => ({ ...s, adSoyad: e.target.value }))}
                                    />
                                </div>
                                <input
                                    className="mt-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="İletişim (ops.)"
                                    value={kitap.iletisim || ""}
                                    onChange={(e) => setKitap((s) => ({ ...s, iletisim: e.target.value }))}
                                />
                                <textarea
                                    className="mt-2 min-h-[70px] w-full rounded-lg border px-3 py-2"
                                    placeholder="Bu kitabı neden öneriyorsunuz? (ops.)"
                                    value={kitap.gerekce || ""}
                                    onChange={(e) => setKitap((s) => ({ ...s, gerekce: e.target.value }))}
                                />
                                <div className="mt-3">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                        Öneriyi Gönder
                                    </button>
                                </div>
                            </form>

                            <Callout title="Nasıl çalışır? – Kitap Önerisi" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Başlık zorunlu; diğer bilgiler isteğe bağlıdır.</li>
                                    <li>Öneriler seçici kurul tarafından değerlendirilir; stok ve bütçe uygunluğuna göre temin edilir.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* Sınav danışmanlığı */}
                    <Section id="ders" title="Sınav Danışmanlığı / Etüt Talebi">
                        <div className="grid gap-4 md:grid-cols-2">
                            <form onSubmit={submitDers} className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-3 gap-2">
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={ders.sinav}
                                        onChange={(e) => setDers((s) => ({ ...s, sinav: e.target.value as SinavTip }))}
                                    >
                                        <option>LGS</option>
                                        <option>YKS</option>
                                        <option>KPSS</option>
                                        <option>DGS</option>
                                        <option>ALES</option>
                                        <option>Diğer</option>
                                    </select>
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Ders (ör. Matematik)"
                                        value={ders.ders}
                                        onChange={(e) => setDers((s) => ({ ...s, ders: e.target.value }))}
                                    />
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={ders.merkezId}
                                        onChange={(e) => setDers((s) => ({ ...s, merkezId: e.target.value }))}
                                    >
                                        {MERKEZLER.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.ad}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Tercih edilen gün/saat (ops.)"
                                        value={ders.tercihSaat || ""}
                                        onChange={(e) => setDers((s) => ({ ...s, tercihSaat: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Ad Soyad"
                                        value={ders.adSoyad}
                                        onChange={(e) => setDers((s) => ({ ...s, adSoyad: e.target.value }))}
                                    />
                                </div>
                                <input
                                    className="mt-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="İletişim"
                                    value={ders.iletisim}
                                    onChange={(e) => setDers((s) => ({ ...s, iletisim: e.target.value }))}
                                />
                                <textarea
                                    className="mt-2 min-h-[70px] w-full rounded-lg border px-3 py-2"
                                    placeholder="Not (ops.)"
                                    value={ders.not || ""}
                                    onChange={(e) => setDers((s) => ({ ...s, not: e.target.value }))}
                                />
                                <div className="mt-3">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                        Talep Gönder
                                    </button>
                                </div>
                            </form>

                            <Callout title="Nasıl çalışır? – Danışmanlık" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-semibold">Gerekli bilgiler:</span> Sınav türü, ders, tercih merkezi, ad soyad ve iletişim.</li>
                                    <li><span className="font-semibold">Ne veriyoruz:</span> Uygun randevu planı çıkarılır; etüt/mentor eşlemesi yapılır (demo).</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* Feedback */}
                    <Section id="fb" title="Öneri • Şikâyet • Teşekkür">
                        <form onSubmit={submitFb} className="rounded-xl border bg-white p-4">
                            <div className="grid grid-cols-3 gap-2">
                                <select
                                    className="rounded-lg border px-3 py-2"
                                    value={fb.tip}
                                    onChange={(e) => setFb((s) => ({ ...s, tip: e.target.value as FeedbackTip }))}
                                >
                                    <option value="öneri">Öneri</option>
                                    <option value="şikayet">Şikâyet</option>
                                    <option value="teşekkür">Teşekkür</option>
                                    <option value="talep">Bilgi/Talep</option>
                                </select>
                                <select
                                    className="rounded-lg border px-3 py-2"
                                    value={fb.merkezId || ""}
                                    onChange={(e) => setFb((s) => ({ ...s, merkezId: e.target.value || undefined }))}
                                >
                                    <option value="">Merkez (ops.)</option>
                                    {MERKEZLER.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.ad}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    placeholder="Ad Soyad (ops.)"
                                    value={fb.adSoyad || ""}
                                    onChange={(e) => setFb((s) => ({ ...s, adSoyad: e.target.value }))}
                                />
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    placeholder="İletişim (ops.)"
                                    value={fb.iletisim || ""}
                                    onChange={(e) => setFb((s) => ({ ...s, iletisim: e.target.value }))}
                                />
                                <button
                                    type="button"
                                    onClick={useMyLocation}
                                    className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:opacity-95"
                                >
                                    Konumumu Kullan (ops.)
                                </button>
                            </div>
                            <textarea
                                className="mt-2 min-h-[90px] w-full rounded-lg border px-3 py-2"
                                placeholder="Mesajınız"
                                value={fb.mesaj}
                                onChange={(e) => setFb((s) => ({ ...s, mesaj: e.target.value }))}
                            />
                            <div className="mt-3">
                                <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                    Gönder
                                </button>
                            </div>
                        </form>

                        <Callout title="Nasıl çalışır? – Geri Bildirim" tone="info">
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Ad-soyad ve iletişim zorunlu değildir; ancak dönüş yapabilmemiz için paylaşmanız önerilir.</li>
                                <li>Mesajınız ilgili merkeze ve müdürlüğe yönlendirilir (demo).</li>
                            </ul>
                        </Callout>
                    </Section>

                    {/* Gönüllü */}
                    <Section id="gon" title="Gönüllü Başvurusu">
                        <div className="grid gap-4 md:grid-cols-2">
                            <form onSubmit={submitGon} className="rounded-xl border bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="Ad Soyad"
                                        value={gon.adSoyad}
                                        onChange={(e) => setGon((s) => ({ ...s, adSoyad: e.target.value }))}
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        placeholder="İletişim"
                                        value={gon.iletisim}
                                        onChange={(e) => setGon((s) => ({ ...s, iletisim: e.target.value }))}
                                    />
                                </div>
                                <input
                                    className="mt-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="Beceriler (ör. İngilizce, Robotik, Resim...)"
                                    value={gon.beceriler || ""}
                                    onChange={(e) => setGon((s) => ({ ...s, beceriler: e.target.value }))}
                                />
                                <input
                                    className="mt-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="Uygun gün/saat (ops.)"
                                    value={gon.uygunGunler || ""}
                                    onChange={(e) => setGon((s) => ({ ...s, uygunGunler: e.target.value }))}
                                />
                                <div className="mt-3">
                                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                        Başvuru Gönder
                                    </button>
                                </div>
                            </form>

                            <Callout title="Nasıl çalışır? – Gönüllülük" tone="info">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Uygun branşlarda atölye eşleştirmesi yapılır; adli sicil/uygunluk kontrolleri gerekebilir.</li>
                                    <li>Katılım belgeleri etkinlik sonunda verilir (demo metni).</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* Kayıtlar / JSON */}
                    <Section id="kayit" title="Kayıtlar / JSON">
                        <div className="grid gap-3 md:grid-cols-3">
                            {[
                                ["Üyelik Başvuruları", uyeler, () => downloadJSON("bilgi-ev-uyelik.json", uyeler)],
                                ["Rezervasyonlar", rezList, () => downloadJSON("bilgi-ev-rezervasyon.json", rezList)],
                                ["Etkinlik Kayıtları", etkKayitlar, () => downloadJSON("bilgi-ev-etkinlik-kayit.json", etkKayitlar)],
                                ["Kitap Önerileri", kitaplar, () => downloadJSON("bilgi-ev-kitap-oneri.json", kitaplar)],
                                ["Danışmanlık Talepleri", dersler, () => downloadJSON("bilgi-ev-danismanlik.json", dersler)],
                                ["Geri Bildirimler", fbList, () => downloadJSON("bilgi-ev-geri-bildirim.json", fbList)],
                                ["Gönüllüler", gonulluler, () => downloadJSON("bilgi-ev-gonullu.json", gonulluler)],
                            ].map(([title, arr, onDl], i) => (
                                <div key={i} className="rounded-xl border bg-white p-3">
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="font-semibold">{title as string}</div>
                                        <button
                                            className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white hover:opacity-95"
                                            onClick={onDl as () => void}
                                        >
                                            JSON
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-600">{(arr as unknown[]).length ? `${(arr as unknown[]).length} kayıt` : "Kayıt yok."}</div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* SSS */}
                    <Section id="sss" title="A’dan Z’ye Sık Sorulan Sorular">
                        {[
                            ["Üye olmak ücretli mi?", "Hayır. Bilgi Evi üyeliği ücretsizdir; etkinliklerde materyal ücreti gerekebilir."],
                            ["Velim olmadan kayıt olabilir miyim?", "18 yaş altı başvurularda veli bilgisi önerilir; iletişim için faydalıdır."],
                            ["Üyelik kartı veriliyor mu?", "Demo sürümünde dijital numara veriyoruz. Gerçekte kart/QR olabilir."],
                            ["Aynı gün birden fazla oturum alabilir miyim?", "Yoğunluk durumuna göre sınırlı olabilir. Sistem slot bazında kapasite kontrolü yapar."],
                            ["Rezervasyonu nasıl iptal ederim?", "Şimdilik çağrı merkezi/merkez ile iletişime geçin (demo)."],
                            ["Geç kalırsam yerim iptal olur mu?", "Giriş saatinden 20 dakika sonra yer başka birine verilebilir."],
                            ["Etkinlik ücretsiz mi?", "Büyük çoğunluğu ücretsizdir; özel atölyelerde malzeme ücreti olabilir."],
                            ["Etkinliğe kayıt oldum ama gelemeyeceğim.", "Kontenjanı başkası kullanabilsin diye lütfen iptal bildirin."],
                            ["Kitap bağışı kabul ediyor musunuz?", "Evet, uygun içerik ve kondisyon kontrolü sonrası raflara eklenir."],
                            ["E-kitap / veri tabanı erişimi var mı?", "Seçili veri tabanlarına merkez bilgisayarlarından erişim sağlanır (demo metni)."],
                            ["Sınav danışmanlığı nasıl işliyor?", "Talebiniz eğitmen havuzuna düşer; uygun randevu ile dönüş yapılır."],
                            ["YKS deneme sınavı yapılıyor mu?", "Dönemsel olarak yapılır; duyuruları etkinlikler bölümünden takip edebilirsiniz."],
                            ["Çalışma salonu kuralları nedir?", "Sessizlik, yiyecek-içecek yasağı, telefon sessizde; giriş-çıkış kaydı zorunlu olabilir."],
                            ["Wi-Fi var mı?", "Merkezlerde güvenli misafir Wi-Fi mevcuttur (demo metni)."],
                            ["Laptop/şarj kullanımı?", "Belirli alanlarda prizler mevcuttur; yoğunlukta ortak kullanım esası geçerlidir."],
                            ["Bireysel çalışma kabini var mı?", "Bazı merkezlerde sınırlı sayıdadır; rezervasyon gerekebilir."],
                            ["Kaybolan eşyalar ne oluyor?", "Danışma biriminde emanet altında tutulur."],
                            ["Yabancı dil konuşma kulübü var mı?", "Evet; dönemsel programlara göre açılır."],
                            ["Kodlama/robotik atölyeleri hangi yaş için?", "Genellikle 9-14 yaş; duyurularda yaş aralığı belirtilir."],
                            ["Gönüllü olmak için yaş sınırı?", "18+ tavsiye edilir; 18 altı için veli onayı gerekebilir."],
                            ["Engelli erişimi uygun mu?", "Merkezlerimiz erişilebilirlik standartlarına uyumludur."],
                            ["Fotoğraf/video çekimi oluyor mu?", "Etkinliklerde bilgilendirme yapılır; rıza olmadan paylaşım yapılmaz."],
                            ["Kütüphane ödünç veriyor mu?", "Demo sayfada işlem yok; gerçek sistemde belirli sürelerle ödünç verilebilir."],
                            ["Merkezler arası rezervasyon aktarımı?", "Her merkez kendi kapasitesini yönetir; farklı merkezden yeni rezervasyon yapılmalıdır."],
                            ["Verilerim nasıl saklanıyor?", "Bu sayfada veriler cihazınızda tutulur (localStorage). Gerçekte KVKK’ya uygun yönetilir."],
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
                        <p><span className="font-semibold">Kültür ve Sosyal İşler – Bilgi Evleri Koordinatörlüğü</span></p>
                        <p>Çağrı Merkezi: 444 0 XXX • Alo 153</p>
                        <p>E-posta: <a className="text-emerald-700 underline" href="mailto:bilgievi@birimajans.bel.tr">bilgievi@birimajans.bel.tr</a></p>
                        <p>Merkez adresleri: yukarıdaki seçim kutusunda listelenmiştir.</p>
                        <div className="mt-3 flex gap-2">
                            <a href="#rez" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95">Rezervasyon Yap</a>
                            <Link href="/ucretler-ve-tarifeler" className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95">Ücretler ve Tarifeler</Link>
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
}


