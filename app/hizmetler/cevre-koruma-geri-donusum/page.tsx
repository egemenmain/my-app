"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/* ========= Küçük yardımcılar ========= */
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

/* ========= Tipler / veri ========= */
type Coords = { lat: number; lng: number };
type Kategori =
    | "cam"
    | "plastik"
    | "kagit"
    | "metal"
    | "tekstil"
    | "atik-pil"
    | "e-atik"
    | "yag";

type Nokta = {
    id: string;
    ad: string;
    konum: Coords;
    turler: Kategori[];
    adres?: string;
    aciklama?: string;
    calisma?: string;
};

type SikayetKategori =
    | "dolu-konteyner"
    | "kacak-dokum"
    | "kirik-kap"
    | "koku"
    | "yanlis-ayrik"
    | "gorus-oneri";

type Sikayet = {
    id: string;
    kategori: SikayetKategori;
    konum: Coords;
    adres?: string;
    aciklama?: string;
    foto?: string; // base64
    iletisim?: string;
    zaman: string; // ISO
    durum: "acik" | "alindi" | "cozuldu";
};

type Okul = {
    id: string;
    ad: string;
    mahalle: string;
    buAyAdet: number; // bu ay toplanan parça/poşet
    toplamAdet: number; // toplam
};

/* ========= Demo veriler ========= */
const DEFAULT_CENTER: Coords = { lat: 41.043, lng: 29.0094 }; // Beşiktaş İskele

const DEMO_NOKTALAR: Nokta[] = [
    {
        id: "pt_001",
        ad: "Beşiktaş Meydan Geri Dönüşüm Noktası",
        konum: { lat: 41.0431, lng: 29.0093 },
        turler: ["cam", "plastik", "kagit", "metal"],
        adres: "İskele Cd. No:1",
        aciklama: "Dört bölmeli konteyner",
        calisma: "7/24",
    },
    {
        id: "pt_002",
        ad: "Sinanpaşa Tekstil Kumbarası",
        konum: { lat: 41.0413, lng: 29.0042 },
        turler: ["tekstil"],
    },
    {
        id: "pt_003",
        ad: "Atık Pil Kutusu – Çarşı",
        konum: { lat: 41.0423, lng: 29.0065 },
        turler: ["atik-pil"],
        aciklama: "Belediye danışma önü",
    },
    {
        id: "pt_004",
        ad: "E-Atık Noktası – Kültür Merkezi",
        konum: { lat: 41.0452, lng: 29.0101 },
        turler: ["e-atik"],
    },
    {
        id: "pt_005",
        ad: "Bitkisel Yağ Bidon Teslim – Muhtarlık",
        konum: { lat: 41.0481, lng: 29.0015 },
        turler: ["yag"],
    },
];

const DEMO_OKULLAR: Okul[] = [
    { id: "sch_1", ad: "X Anadolu Lisesi", mahalle: "Abbasağa", buAyAdet: 1000, toplamAdet: 5400 },
    { id: "sch_2", ad: "Y Ortaokulu", mahalle: "Vişnezade", buAyAdet: 820, toplamAdet: 3720 },
    { id: "sch_3", ad: "Z İlkokulu", mahalle: "Sinanpaşa", buAyAdet: 770, toplamAdet: 2980 },
    { id: "sch_4", ad: "K Meslek Lisesi", mahalle: "Türkali", buAyAdet: 610, toplamAdet: 4310 },
];

const ATIK_REHBERI: Array<{ kalem: string; nereye: string; ipucu?: string }> = [
    { kalem: "Cam şişe", nereye: "Cam", ipucu: "Kırık camı gazeteye sarın, kapaksız atın." },
    { kalem: "Plastik şişe", nereye: "Plastik", ipucu: "Sıkıştırıp kapatın, içine sıvı kalmasın." },
    { kalem: "Karton koli", nereye: "Kağıt", ipucu: "Yassılaştırıp bandını çıkarın." },
    { kalem: "Teneke kutu", nereye: "Metal", ipucu: "Gerekirse çalkalayın, ezip atın." },
    { kalem: "Eski kıyafet", nereye: "Tekstil Kumbarası" },
    { kalem: "Atık pil", nereye: "Atık Pil Kutusu" },
    { kalem: "Telefon, şarj aleti", nereye: "E-Atık Noktası" },
    { kalem: "Kızartma yağı", nereye: "Bitkisel Yağ Bidonu" },
    { kalem: "İlaç", nereye: "Eczane/Belediye Tıbbi Atık" },
    { kalem: "Ampul/Florasan", nereye: "E-Atık / Tehlikeli Atık" },
];

/* ========= küçük yardımcılar ========= */
const toBase64 = (file?: File, cb?: (b64: string) => void) => {
    if (!file) return cb?.("");
    const reader = new FileReader();
    reader.onload = () => cb?.(reader.result as string);
    reader.readAsDataURL(file);
};

const osmEmbed = (center: Coords) => {
    const d = 0.02;
    const left = center.lng - d;
    const right = center.lng + d;
    const top = center.lat + d;
    const bottom = center.lat - d;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;
};

export default function CevreKorumaPage() {
    /* ----- Harita / filtre ----- */
    const [center, setCenter] = useState<Coords>(DEFAULT_CENTER);
    const [points, setPoints] = useState<Nokta[]>([]);
    const [aktifTur, setAktifTur] = useState<"hepsi" | Kategori>("hepsi");
    const [secili, setSecili] = useState<Nokta | null>(null);

    useEffect(() => {
        // demo veriyi yükle (ileride API'den gelebilir)
        setPoints(DEMO_NOKTALAR);
    }, []);

    const filtreliNoktalar = useMemo(() => {
        if (aktifTur === "hepsi") return points;
        return points.filter((n) => n.turler.includes(aktifTur));
    }, [points, aktifTur]);

    const useMyLocation = () => {
        if (!("geolocation" in navigator)) return alert("Tarayıcınız konum özelliğini desteklemiyor.");
        navigator.geolocation.getCurrentPosition(
            (p) => setCenter({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => alert("Konum alınamadı.")
        );
    };

    /* ----- Atık rehberi ----- */
    const [q, setQ] = useState("");
    const rehberSonuc = useMemo(() => {
        if (!q) return [];
        return ATIK_REHBERI.filter((x) => x.kalem.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
    }, [q]);

    /* ----- İhbar/şikâyet ----- */
    const [sikayetler, setSikayetler] = useState<Sikayet[]>([]);
    const [form, setForm] = useState<Sikayet>({
        id: crypto.randomUUID(),
        kategori: "dolu-konteyner",
        konum: center,
        zaman: new Date().toISOString(),
        durum: "acik",
    });

    useEffect(() => setForm((f) => ({ ...f, konum: center })), [center]);
    useEffect(() => {
        // localStorage restore
        try {
            const s = localStorage.getItem("recycle-reports");
            if (s) setSikayetler(JSON.parse(s));
        } catch { }
    }, []);

    const submitSikayet = (e: React.FormEvent) => {
        e.preventDefault();
        const yeni = { ...form, id: crypto.randomUUID(), zaman: new Date().toISOString() };
        const liste = [yeni, ...sikayetler].slice(0, 50);
        setSikayetler(liste);
        try {
            localStorage.setItem("recycle-reports", JSON.stringify(liste));
        } catch { }
        alert("Teşekkürler! Bildiriminiz ilgili birime iletilecek (demo).");
        setForm({
            id: crypto.randomUUID(),
            kategori: "dolu-konteyner",
            konum: center,
            zaman: new Date().toISOString(),
            durum: "acik",
        });
    };

    /* ----- Okul sıralaması / kazanımlar ----- */
    const [okullar, setOkullar] = useState<Okul[]>([]);
    useEffect(() => setOkullar(DEMO_OKULLAR), []);
    const siraliOkullar = useMemo(
        () => [...okullar].sort((a, b) => b.buAyAdet - a.buAyAdet),
        [okullar]
    );
    const toplamBuAy = useMemo(
        () => okullar.reduce((acc, x) => acc + x.buAyAdet, 0),
        [okullar]
    );
    const toplamGenel = useMemo(
        () => okullar.reduce((acc, x) => acc + x.toplamAdet, 0),
        [okullar]
    );

    // Basit kazanım katsayıları (temsilidir)
    const kazanımlar = useMemo(() => {
        // Varsayımsal 1 parça ~ 0.5 kg karışık geri dönüşüm
        const kg = toplamBuAy * 0.5;
        return {
            agac: Math.round((kg / 1000) * 17), // 1 ton kağıt ~ 17 ağaç
            co2: Math.round(kg * 1.7), // kg karşılığı CO2 (temsili)
            su: Math.round(kg * 5), // litre (temsili)
            enerji: Math.round(kg * 3), // kWh (temsili)
        };
    }, [toplamBuAy]);

    const yil = new Date().getFullYear();

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-50 via-white to-blue-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Çevre Koruma & Geri Dönüşüm
                        </h1>
                        <p className="mt-3 text-gray-700">
                            Yakınınızdaki <strong>geri dönüşüm noktalarını</strong> bulun,
                            “<strong>Nereye Atılır?</strong>” rehberiyle doğru ayrıştırın,
                            sorun gördüğünüzde <strong>ihbar</strong> edin. Okullar arası{" "}
                            <strong>geri dönüşüm şampiyonları</strong> ve aylık{" "}
                            <strong>kazanımlar</strong> burada.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="success">Sıfır Atık İlçesi</Badge>
                            <Badge tone="info">Harita + Rehber</Badge>
                            <Badge tone="warning">Hızlı İhbar</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://i.monay.com.tr/2/878/494/storage/files/images/2024/02/10/5-a0vr-cover-rkdi_cover.jpg')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* hızlı aksiyonlar */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-4">
                <Link href="#harita" className="rounded-xl bg-gray-50 p-3 hover:bg-gray-100">
                    ♻️ <span className="ml-2 font-semibold">Yakınımdaki Kutular</span>
                </Link>
                <Link href="#rehber" className="rounded-xl bg-gray-50 p-3 hover:bg-gray-100">
                    📒 <span className="ml-2 font-semibold">Nereye Atılır?</span>
                </Link>
                <Link href="#ihbar" className="rounded-xl bg-gray-50 p-3 hover:bg-gray-100">
                    🛎️ <span className="ml-2 font-semibold">İhbar / Şikâyet</span>
                </Link>
                <Link href="#okullar" className="rounded-xl bg-gray-50 p-3 hover:bg-gray-100">
                    🏆 <span className="ml-2 font-semibold">Okul Sıralaması</span>
                </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["harita", "Geri Dönüşüm Noktaları Haritası"],
                            ["rehber", "Atık Rehberi (Nereye Atılır?)"],
                            ["ihbar", "İhbar / Şikâyet"],
                            ["okullar", "Okullar Arası Sıralama"],
                            ["kazanımlar", "Bu Ayın Kazanımları"],
                            ["sss", "SSS"],
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
                    {/* HARİTA */}
                    <Section id="harita" title="Geri Dönüşüm Noktaları Haritası">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <div className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Filtre</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={aktifTur}
                                        onChange={(e) => setAktifTur(e.target.value as any)}
                                    >
                                        <option value="hepsi">Hepsi</option>
                                        <option value="cam">Cam</option>
                                        <option value="plastik">Plastik</option>
                                        <option value="kagit">Kağıt</option>
                                        <option value="metal">Metal</option>
                                        <option value="tekstil">Tekstil</option>
                                        <option value="atik-pil">Atık Pil</option>
                                        <option value="e-atik">E-Atık</option>
                                        <option value="yag">Bitkisel Yağ</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={useMyLocation}
                                        className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:opacity-95"
                                    >
                                        Konumumu Kullan
                                    </button>
                                </div>

                                <h3 className="mb-2 mt-4 font-semibold">Noktalar</h3>
                                <ul className="max-h-80 space-y-2 overflow-auto pr-1">
                                    {filtreliNoktalar.map((n) => (
                                        <li
                                            key={n.id}
                                            className={`cursor-pointer rounded-lg border p-2 hover:bg-gray-50 ${secili?.id === n.id ? "ring-2 ring-emerald-400" : ""
                                                }`}
                                            onClick={() => {
                                                setSecili(n);
                                                setCenter(n.konum);
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium">{n.ad}</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {n.turler.map((t) => (
                                                        <Badge key={t} tone="neutral">
                                                            {t}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            {n.adres && <div className="text-sm text-gray-600">{n.adres}</div>}
                                            {n.aciklama && <div className="text-xs text-gray-500">{n.aciklama}</div>}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <div className="overflow-hidden rounded-xl border">
                                    <iframe title="Harita" className="h-96 w-full" src={osmEmbed(center)} loading="lazy" />
                                </div>
                                {secili ? (
                                    <Callout title={`Seçili Nokta: ${secili.ad}`} tone="info">
                                        <div className="text-sm">
                                            {secili.adres && <div>Adres: {secili.adres}</div>}
                                            <div>Türler: {secili.turler.join(", ")}</div>
                                            {secili.calisma && <div>Çalışma: {secili.calisma}</div>}
                                        </div>
                                    </Callout>
                                ) : (
                                    <Callout title="İpucu">
                                        Listeden bir nokta seçtiğinizde harita o konuma odaklanır.
                                    </Callout>
                                )}
                            </div>
                        </div>
                    </Section>

                    {/* REHBER */}
                    <Section id="rehber" title="Atık Rehberi – Nereye Atılır?">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <div className="rounded-xl border bg-white p-4">
                                <input
                                    className="mb-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="Arayın: ör. pil, kıyafet, ampul…"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                />
                                {q && (
                                    <ul className="space-y-2">
                                        {rehberSonuc.length === 0 ? (
                                            <li className="rounded-lg border p-2 text-sm text-gray-600">Sonuç yok.</li>
                                        ) : (
                                            rehberSonuc.map((r, i) => (
                                                <li key={i} className="rounded-lg border p-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-medium">{r.kalem}</div>
                                                        <Badge tone="success">{r.nereye}</Badge>
                                                    </div>
                                                    {r.ipucu && <div className="text-sm text-gray-600">{r.ipucu}</div>}
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                )}
                                {!q && (
                                    <>
                                        <h3 className="mb-1 mt-2 font-semibold">Örnekler</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {["Cam şişe", "Plastik şişe", "Karton", "Pil", "Kıyafet", "Telefon"].map((k) => (
                                                <button
                                                    key={k}
                                                    className="rounded-full border bg-gray-50 px-3 py-1 text-sm hover:bg-gray-100"
                                                    onClick={() => setQ(k)}
                                                >
                                                    {k}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <Callout title="Doğru Ayrıştırma" tone="success">
                                <ul className="list-disc pl-5">
                                    <li>Kapak/toplama poşeti ayrı; sıvı bırakmayın.</li>
                                    <li>Yağ, ilaç, pil ve elektronik atıklar <strong>genel çöpe atılmaz</strong>.</li>
                                    <li>İnşaat molozu için lisanslı firmalara yönlendirilirsiniz.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* İHBAR */}
                    <Section id="ihbar" title="İhbar / Şikâyet">
                        <div className="grid gap-4 md:grid-cols-[360px_1fr]">
                            <form onSubmit={submitSikayet} className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Konu</h3>
                                <select
                                    className="w-full rounded-lg border px-3 py-2"
                                    value={form.kategori}
                                    onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value as SikayetKategori }))}
                                >
                                    <option value="dolu-konteyner">Dolu Konteyner</option>
                                    <option value="kacak-dokum">Kaçak Döküm</option>
                                    <option value="kirik-kap">Kırık/Kapak sorunu</option>
                                    <option value="koku">Koku</option>
                                    <option value="yanlis-ayrik">Yanlış Ayrıştırma</option>
                                    <option value="gorus-oneri">Görüş/Öneri</option>
                                </select>

                                <h3 className="mb-2 mt-4 font-semibold">Konum</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="number"
                                        step="0.0001"
                                        value={center.lat}
                                        onChange={(e) => setCenter((c) => ({ ...c, lat: parseFloat(e.target.value) }))}
                                        placeholder="Enlem"
                                    />
                                    <input
                                        className="rounded-lg border px-3 py-2"
                                        type="number"
                                        step="0.0001"
                                        value={center.lng}
                                        onChange={(e) => setCenter((c) => ({ ...c, lng: parseFloat(e.target.value) }))}
                                        placeholder="Boylam"
                                    />
                                </div>
                                <input
                                    className="mt-2 w-full rounded-lg border px-3 py-2"
                                    placeholder="Adres (varsa)"
                                    value={form.adres ?? ""}
                                    onChange={(e) => setForm((f) => ({ ...f, adres: e.target.value }))}
                                />
                                <button
                                    type="button"
                                    onClick={useMyLocation}
                                    className="mt-2 w-full rounded-lg bg-emerald-600 px-3 py-2 text-white hover:opacity-95"
                                >
                                    Konumumu Kullan
                                </button>

                                <h3 className="mb-2 mt-4 font-semibold">Açıklama</h3>
                                <textarea
                                    className="min-h-[80px] w-full rounded-lg border px-3 py-2"
                                    placeholder="Kısa açıklama…"
                                    value={form.aciklama ?? ""}
                                    onChange={(e) => setForm((f) => ({ ...f, aciklama: e.target.value }))}
                                />

                                <label className="mt-2 block text-sm text-gray-600">Fotoğraf (opsiyonel)</label>
                                <input
                                    className="w-full rounded-lg border px-3 py-2"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => toBase64(e.target.files?.[0], (b64) => setForm((f) => ({ ...f, foto: b64 })))}
                                />
                                {form.foto && (
                                    <img src={form.foto} alt="önizleme" className="mt-2 max-h-48 w-full rounded-lg object-cover" />
                                )}

                                <label className="mt-2 block text-sm text-gray-600">İletişim (opsiyonel)</label>
                                <input
                                    className="w-full rounded-lg border px-3 py-2"
                                    placeholder="Telefon/E-posta"
                                    value={form.iletisim ?? ""}
                                    onChange={(e) => setForm((f) => ({ ...f, iletisim: e.target.value }))}
                                />

                                <div className="mt-3">
                                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                        İhbari Gönder
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-3">
                                <div className="overflow-hidden rounded-xl border">
                                    <iframe title="Harita" className="h-64 w-full" src={osmEmbed(center)} loading="lazy" />
                                </div>
                                <div className="rounded-xl border bg-white p-4">
                                    <h3 className="mb-2 font-semibold">Son Bildirimler (demo)</h3>
                                    {sikayetler.length === 0 ? (
                                        <p className="text-sm text-gray-600">Henüz kayıt yok.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {sikayetler.slice(0, 6).map((s) => (
                                                <li key={s.id} className="rounded-lg border p-2 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">{s.kategori}</span>
                                                        <span className="text-gray-600">{new Date(s.zaman).toLocaleString()}</span>
                                                    </div>
                                                    <div className="text-gray-700">
                                                        {s.adres || `${s.konum.lat.toFixed(4)}, ${s.konum.lng.toFixed(4)}`}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* OKULLAR */}
                    <Section id="okullar" title="Okullar Arası Geri Dönüşüm Sıralaması (Bu Ay)">
                        <div className="rounded-xl border bg-white p-4">
                            <div className="grid grid-cols-1 gap-3">
                                {siraliOkullar.map((o, i) => (
                                    <div key={o.id} className="rounded-lg border p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{o.ad}</div>
                                                    <div className="text-xs text-gray-600">{o.mahalle}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-semibold">{o.buAyAdet.toLocaleString()} puan</div>
                                                <div className="text-xs text-gray-600">
                                                    Toplam: {o.toplamAdet.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 h-2 w-full overflow-hidden rounded bg-gray-100">
                                            <div
                                                className="h-full rounded bg-emerald-500"
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        Math.round((o.buAyAdet / (siraliOkullar[0]?.buAyAdet || 1)) * 100)
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-3 text-xs text-gray-500">
                                Not: Puan, bu ay teslim edilen geri dönüşüm poşet/parça sayısına göre hesaplanır (demo).
                            </p>
                        </div>
                    </Section>

                    {/* KAZANIMLAR */}
                    <Section id="kazanımlar" title={`Bu Ayın Kazanımları (${yil})`}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Toplamlar</h3>
                                <ul className="space-y-1 text-sm">
                                    <li>
                                        Toplanan (okullar): <strong>{toplamBuAy.toLocaleString()}</strong> parça/poşet
                                    </li>
                                    <li>
                                        Genel toplam: <strong>{toplamGenel.toLocaleString()}</strong>
                                    </li>
                                </ul>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                                    <div className="rounded-lg bg-emerald-50 p-3">
                                        🌳
                                        <div className="text-lg font-semibold">{kazanımlar.agac}</div>
                                        <div className="text-xs text-gray-600">Tahmini ağaç eşdeğeri</div>
                                    </div>
                                    <div className="rounded-lg bg-blue-50 p-3">
                                        💧
                                        <div className="text-lg font-semibold">
                                            {kazanımlar.su.toLocaleString()} L
                                        </div>
                                        <div className="text-xs text-gray-600">Su tasarrufu (tahmini)</div>
                                    </div>
                                    <div className="rounded-lg bg-amber-50 p-3">
                                        ⚡
                                        <div className="text-lg font-semibold">
                                            {kazanımlar.enerji.toLocaleString()} kWh
                                        </div>
                                        <div className="text-xs text-gray-600">Enerji tasarrufu (tahmini)</div>
                                    </div>
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        CO₂
                                        <div className="text-lg font-semibold">
                                            {kazanımlar.co2.toLocaleString()} kg
                                        </div>
                                        <div className="text-xs text-gray-600">Emisyon önleme (tahmini)</div>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    * Katsayılar temsilidir; resmi raporlama için tartım verisi kullanılır.
                                </p>
                            </div>

                            <Callout title="Okul Programı – Nasıl Dahil Olurum?" tone="info">
                                <ul className="list-disc pl-5">
                                    <li>Okul/kurum olarak başvurun:{" "}
                                        <Link href="/okul-geri-donusum" className="text-blue-700 underline">
                                            Başvuru Formu
                                        </Link>
                                    </li>
                                    <li>Poşetler tartım noktasında kayda alınır, aylık puana eklenir.</li>
                                    <li>Ay sonu “Geri Dönüşüm Şampiyonları” ödüllendirilir.</li>
                                </ul>
                            </Callout>
                        </div>
                    </Section>

                    {/* SSS */}
                    <Section id="sss" title="Sık Sorulan Sorular">
                        <details className="group py-3">
                            <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-emerald-400">
                                <span className="font-medium">Kutular dolu; ne yapmalıyım?</span>
                            </summary>
                            <div className="prose prose-sm max-w-none py-2 text-gray-700">
                                <strong>İhbar/Şikâyet</strong> bölümünden “Dolu Konteyner” seçin, konumu paylaşın. Ekipler rota planına ekler.
                            </div>
                        </details>
                        <details className="group py-3">
                            <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-emerald-400">
                                <span className="font-medium">Hacimli/e-atık/yağ evden alınır mı?</span>
                            </summary>
                            <div className="prose prose-sm max-w-none py-2 text-gray-700">
                                Evet, randevulu toplama ile alınır (yakında). Geçici süreyle noktalara bırakabilirsiniz.
                            </div>
                        </details>
                    </Section>

                    {/* İLETİŞİM */}
                    <Section id="iletisim" title="İletişim">
                        <p><strong>Çevre Koruma ve Kontrol Müdürlüğü</strong></p>
                        <p>Alo 153 • Çağrı Merkezi: 444 0 XXX</p>
                        <p>E-posta: <a className="text-emerald-700 underline" href="mailto:cevre@birimajans.bel.tr">cevre@birimajans.bel.tr</a></p>
                        <p>Adres: Birim Ajans Belediyesi Hizmet Binası, [adres]</p>
                    </Section>
                </main>
            </div>
        </div>
    );
}
