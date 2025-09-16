"use client";

import type { Metadata } from "next";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

/* ——— metadata (Next, server-read) ———
   Not: use client olduğu için export const metadata desteklenmez.
   Layout veya parent'ta başlığı zaten yönetiyorsan bunu atlayabilirsin.
*/

/* ——— küçük yardımcı bileşenler ——— */
const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <section id={id} className="scroll-mt-28">
        <h2 className="mb-3 text-2xl font-semibold">{title}</h2>
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">{children}</div>
    </section>
);

const Badge = ({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "info" | "danger" }) => {
    const map = {
        neutral: "bg-gray-100 text-gray-800",
        success: "bg-green-100 text-green-800",
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

const Stat = ({ value, label, icon }: { value: string; label: string; icon: "leaf" | "wrench" | "clock" }) => {
    const common = "h-5 w-5";
    const icons = {
        leaf: (
            <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
                <path d="M5 13a7 7 0 0011 5c4-3 3-10 6-13-3 0-10-1-13 3a7 7 0 00-4 5z" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
        ),
        wrench: (
            <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
                <path d="M14 7a4 4 0 105 5l-7 7-4-4 7-7a4 4 0 00-1-1z" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
        ),
        clock: (
            <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
                <path d="M12 8v5l3 2M12 22a10 10 0 110-20 10 10 0 010 20z" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
        ),
    } as const;
    return (
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <span className="text-gray-700">{icons[icon]}</span>
            <div>
                <div className="text-lg font-semibold leading-none">{value}</div>
                <div className="text-sm text-gray-600">{label}</div>
            </div>
        </div>
    );
};

/* ——— Veri modeli ——— */

// Eskisi
// type ParkKategori = "çocuk" | "oyun" | "skate" | "koşu" | "köpek" | "spor" | "seyir" | "koru";

// Yenisi
type ParkKategori =
    | "çocuk"
    | "oyun"
    | "skate"
    | "koşu"
    | "köpek"
    | "spor"
    | "seyir"
    | "koru"
    | "yürüyüş";

type Coords = { lat: number; lng: number };

type Park = {
    id: string;
    ad: string;
    adres: string;
    mahalle: string;
    coords: Coords;
    kategoriler: ParkKategori[];
    ozellikler?: string[];
    img?: string;
};

/* Beşiktaş odaklı örnek veri (temsilî, gerçeğe yakın koordinatlar) */
const PARKLAR: Park[] = [
    {
        id: "yildiz-parki",
        ad: "Yıldız Parkı",
        adres: "Yıldız, Beşiktaş",
        mahalle: "Yıldız",
        coords: { lat: 41.0485, lng: 29.0203 },
        kategoriler: ["koru", "koşu", "seyir"],
        ozellikler: ["wc", "kafe", "piknik", "yürüyüş"],
        img: "https://i20.haber7.net/resize/1280x720//haber/haber7/photos/2020/10/bahar_mevsiminde_istanbulda_gezilecek_park_ve_bahce_rotalari_1583218005_1851.jpg",
    },
    {
        id: "abbasaga-parki",
        ad: "Abbasağa Parkı",
        adres: "Abbasağa, Beşiktaş",
        mahalle: "Abbasağa",
        coords: { lat: 41.0427, lng: 29.0077 },
        kategoriler: ["oyun", "spor", "çocuk"],
        ozellikler: ["basketbol", "çocuk-parkı", "açık spor"],
        img: "https://istanbul-tourist-information.com/wp-content/uploads/2021/12/gulhane-park.jpg",
    },
    {
        id: "bebek-parki",
        ad: "Bebek Parkı",
        adres: "Bebek Sahili, Beşiktaş",
        mahalle: "Bebek",
        coords: { lat: 41.0851, lng: 29.0436 },
        kategoriler: ["seyir", "yürüyüş", "çocuk"],
        ozellikler: ["sahil", "oyun", "koşu"],
        img: "https://www.bizevdeyokuz.com/wp-content/uploads/camlica-tepesi.jpg",
    },
    {
        id: "sanatcilar-parki",
        ad: "Sanatçılar Parkı",
        adres: "Etiler, Beşiktaş",
        mahalle: "Etiler",
        coords: { lat: 41.0854, lng: 29.0362 },
        kategoriler: ["seyir", "çocuk"],
        ozellikler: ["oturma", "oyun"],
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8NIyOCiFYuGXdrbs-hAYm0oPOi8Le8SaTcg&s",
    },
    {
        id: "ihlamur-kasri-korusu",
        ad: "Ihlamur Kasrı Korusu",
        adres: "Ihlamur, Beşiktaş",
        mahalle: "Ihlamur",
        coords: { lat: 41.0477, lng: 28.9969 },
        kategoriler: ["koru", "seyir"],
        ozellikler: ["müze-bahçesi"],
        img: "https://kucukcekmece.istanbul/Content/piclib/bigsize/icerikler/31780/cq7a0620-83517-6926198.jpg",
    },
    {
        id: "besiktas-skate",
        ad: "Beşiktaş Kaykay Alanı (Vişnezade)",
        adres: "Vişnezade, Beşiktaş",
        mahalle: "Vişnezade",
        coords: { lat: 41.0415, lng: 29.0109 },
        kategoriler: ["skate", "spor"],
        ozellikler: ["kaykay", "bmx"],
        img: "https://www.beylikduzu.istanbul/BBImages/Slider/Image/yeni-nesil-konsept-park--6.JPG",
    },
];

/* Öntanımlı konumlar */
const PRESETS: Record<
    string,
    { label: string; coords: Coords }
> = {
    besiktas_iskele: { label: "Beşiktaş İskele", coords: { lat: 41.0430, lng: 29.0094 } },
    ortakoy: { label: "Ortaköy Meydan", coords: { lat: 41.0475, lng: 29.0271 } },
    etiler: { label: "Etiler", coords: { lat: 41.0820, lng: 29.0255 } },
    levent: { label: "Levent", coords: { lat: 41.0786, lng: 29.0119 } },
};

/* Haversine mesafe (km) */
function distanceKm(a: Coords, b: Coords) {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const s1 = Math.sin(dLat / 2) ** 2;
    const s2 = Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s1 + s2));
}

/* OSM embed url */
function osmEmbed(center: Coords) {
    // küçük bir bbox oluştur
    const delta = 0.02;
    const left = center.lng - delta;
    const right = center.lng + delta;
    const top = center.lat + delta;
    const bottom = center.lat - delta;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;
}

/* ——— Hatalı Sulama Rapor modeli ——— */
type SulamaRapor = {
    id: string;
    coords: Coords;
    adres?: string;
    tarih: string;
    aciklama?: string;
    yolIslaniyorMu: boolean;
    foto?: string; // base64
};

/* ——— Sayfa ——— */
export default function ParkYesilAlanPage() {
    /* Park Bul durumu */
    const [center, setCenter] = useState<Coords>(PRESETS.besiktas_iskele.coords);
    const [kategori, setKategori] = useState<ParkKategori | "hepsi">("hepsi");
    const [maxKm, setMaxKm] = useState<number>(5);
    const [query, setQuery] = useState<string>("");

    /* Rapor durumu (hatalı sulama) */
    const [raporlar, setRaporlar] = useState<SulamaRapor[]>([]);
    const [rapor, setRapor] = useState<SulamaRapor>({
        id: crypto.randomUUID(),
        coords: center,
        tarih: new Date().toISOString().slice(0, 16),
        yolIslaniyorMu: true,
    });

    useEffect(() => {
        // localStorage’dan raporları çek
        try {
            const raw = localStorage.getItem("hatalı-sulama-raporları");
            if (raw) setRaporlar(JSON.parse(raw));
        } catch { }
    }, []);

    useEffect(() => {
        // konum değişince rapor konumunu senkronla
        setRapor((r) => ({ ...r, coords: center }));
    }, [center]);

    const sonuc = useMemo(() => {
        const filtered = PARKLAR.filter((p) => {
            const d = distanceKm(center, p.coords);
            const inRange = d <= maxKm;
            const byKat = kategori === "hepsi" ? true : p.kategoriler.includes(kategori);
            const byQuery = query.trim()
                ? [p.ad.toLowerCase(), p.mahalle.toLowerCase(), p.adres.toLowerCase()].some((t) => t.includes(query.trim().toLowerCase()))
                : true;
            return inRange && byKat && byQuery;
        })
            .map((p) => ({ ...p, uzaklik: distanceKm(center, p.coords) }))
            .sort((a, b) => a.uzaklik - b.uzaklik);

        return filtered;
    }, [center, kategori, maxKm, query]);

    const handleMyLocation = () => {
        if (!("geolocation" in navigator)) return alert("Tarayıcınız konumu desteklemiyor.");
        navigator.geolocation.getCurrentPosition(
            (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => alert("Konum alınamadı.")
        );
    };

    const handleRaporFoto = (file?: File) => {
        if (!file) return setRapor((r) => ({ ...r, foto: undefined }));
        const reader = new FileReader();
        reader.onload = () => setRapor((r) => ({ ...r, foto: reader.result as string }));
        reader.readAsDataURL(file);
    };

    const handleRaporKaydet = (e: React.FormEvent) => {
        e.preventDefault();
        const yeni: SulamaRapor = { ...rapor, id: crypto.randomUUID() };
        const yeniListe = [yeni, ...raporlar].slice(0, 20);
        setRaporlar(yeniListe);
        try {
            localStorage.setItem("hatalı-sulama-raporları", JSON.stringify(yeniListe));
        } catch { }
        setRapor({
            id: crypto.randomUUID(),
            coords: center,
            tarih: new Date().toISOString().slice(0, 16),
            yolIslaniyorMu: true,
        });
        alert("Teşekkürler! Raporunuz kaydedildi ve ilgili birime iletilecek.");
    };

    const yil = new Date().getFullYear();

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-50 via-white to-lime-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Park ve Yeşil Alan Hizmetleri</h1>
                        <p className="mt-3 text-gray-700">
                            Park bakım-onarım, ağaçlandırma, budama/ilaçlama, çim-ot temizliği, etkinlik ve piknik izinleri; ayrıca{" "}
                            <strong>konuma göre en yakın parkları</strong> bulma ve{" "}
                            <strong>Hatalı Yeşil Alan Sulama</strong> şikâyet bildirimi bu sayfada.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="success">Bakım Programlı</Badge>
                            <Badge tone="info">Alo 153 / Çözüm Merkezi</Badge>
                            <Badge tone="warning">Budama Dönemi: Kış</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://istanbul-tourist-information.com/wp-content/uploads/2021/08/Parks-Gardens-Forests-in-Istanbul.jpg')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* İSTATİSTİK */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <Stat icon="clock" value="48 saat" label="Arıza İlk Müdahale Hedefi" />
                <Stat icon="wrench" value="Kasım–Mart" label="Budama Ana Dönemi (takvime göre)" />
                <Stat icon="leaf" value={`${yil}`} label="Yıllık Ağaçlandırma & Bakım Programı" />
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["parkbul", "Yakınımdaki Parklar"],
                            ["budama", "Ağaç Budama / İlaçlama"],
                            ["etkinlik", "Etkinlik / Piknik İzni"],
                            ["bakim", "Periyodik Bakım & Temizlik"],
                            ["sulama", "Hatalı Yeşil Alan Sulama (Bildir)"],
                            ["sss", "Sık Sorulan Sorular"],
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

                {/* İÇERİK */}
                <main className="space-y-10">
                    {/* ——— Yakınımdaki Parklar ——— */}
                    <Section id="parkbul" title="Yakınımdaki Parklar">
                        <div className="grid gap-4 md:grid-cols-[320px_1fr]">
                            {/* Kontrol paneli */}
                            <div className="rounded-xl border bg-white p-4">
                                <h3 className="mb-2 font-semibold">Konum</h3>
                                <div className="flex flex-col gap-2">
                                    <select
                                        className="w-full rounded-lg border px-3 py-2"
                                        value=""
                                        onChange={(e) => {
                                            const key = e.target.value as keyof typeof PRESETS;
                                            if (!key) return;
                                            setCenter(PRESETS[key].coords);
                                        }}
                                    >
                                        <option value="">Öntanımlı seç…</option>
                                        {Object.entries(PRESETS).map(([k, v]) => (
                                            <option key={k} value={k}>
                                                {v.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleMyLocation}
                                        className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:opacity-95"
                                        type="button"
                                    >
                                        Konumumu Kullan
                                    </button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            className="rounded-lg border px-3 py-2"
                                            type="number"
                                            step="0.0001"
                                            value={center.lat}
                                            onChange={(e) => setCenter((c) => ({ ...c, lat: parseFloat(e.target.value) }))}
                                            placeholder="enlem (lat)"
                                        />
                                        <input
                                            className="rounded-lg border px-3 py-2"
                                            type="number"
                                            step="0.0001"
                                            value={center.lng}
                                            onChange={(e) => setCenter((c) => ({ ...c, lng: parseFloat(e.target.value) }))}
                                            placeholder="boylam (lng)"
                                        />
                                    </div>
                                </div>

                                <hr className="my-4" />

                                <h3 className="mb-2 font-semibold">Filtreler</h3>
                                <label className="block text-sm text-gray-600">Kategori</label>
                                <select
                                    className="mb-3 w-full rounded-lg border px-3 py-2"
                                    value={kategori}
                                    onChange={(e) => setKategori(e.target.value as any)}
                                >
                                    <option value="hepsi">Hepsi</option>
                                    <option value="çocuk">Çocuk</option>
                                    <option value="oyun">Oyun</option>
                                    <option value="skate">Kaykay</option>
                                    <option value="koşu">Koşu</option>
                                    <option value="köpek">Köpek</option>
                                    <option value="spor">Spor</option>
                                    <option value="seyir">Seyir</option>
                                    <option value="koru">Koru</option>
                                </select>

                                <label className="block text-sm text-gray-600">Mesafe (km)</label>
                                <input
                                    className="w-full"
                                    type="range"
                                    min={1}
                                    max={10}
                                    step={1}
                                    value={maxKm}
                                    onChange={(e) => setMaxKm(parseInt(e.target.value))}
                                />
                                <div className="text-sm text-gray-700">Maksimum: {maxKm} km</div>

                                <label className="mt-3 block text-sm text-gray-600">Ara</label>
                                <input
                                    className="w-full rounded-lg border px-3 py-2"
                                    placeholder="Park adı / mahalle"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>

                            {/* Sonuçlar + Harita */}
                            <div className="space-y-4">
                                <div className="overflow-hidden rounded-xl border">
                                    <iframe
                                        title="Harita"
                                        className="h-72 w-full"
                                        src={osmEmbed(center)}
                                        loading="lazy"
                                    />
                                </div>

                                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {sonuc.map((p) => (
                                        <li key={p.id} className="rounded-xl border bg-white p-3">
                                            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
                                                <img src={p.img} alt={p.ad} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="mt-2 flex items-start justify-between gap-2">
                                                <div>
                                                    <h4 className="font-semibold">{p.ad}</h4>
                                                    <p className="text-sm text-gray-600">{p.adres}</p>
                                                    <p className="text-xs text-gray-500">Uzaklık: {distanceKm(center, p.coords).toFixed(2)} km</p>
                                                </div>
                                                <a
                                                    className="rounded-lg bg-gray-900 px-3 py-2 text-xs text-white hover:opacity-90"
                                                    href={`https://www.openstreetmap.org/?mlat=${p.coords.lat}&mlon=${p.coords.lng}#map=17/${p.coords.lat}/${p.coords.lng}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Haritada Aç
                                                </a>
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {p.kategoriler.map((k) => (
                                                    <Badge key={k} tone="success">{k}</Badge>
                                                ))}
                                                {p.ozellikler?.map((o) => (
                                                    <Badge key={o} tone="neutral">{o}</Badge>
                                                ))}
                                            </div>
                                        </li>
                                    ))}
                                    {sonuc.length === 0 && (
                                        <li className="rounded-xl border bg-white p-4 text-sm text-gray-700">Bu filtrelerle park bulunamadı. Mesafeyi artırmayı deneyin.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </Section>

                    {/* ——— Budama / İlaçlama ——— */}
                    <Section id="budama" title="Ağaç Budama / İlaçlama">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="font-semibold">Budama</h3>
                                <ul className="list-disc pl-5">
                                    <li>Genellikle <strong>Kasım–Mart</strong> arası planlı budama dönemi uygulanır.</li>
                                    <li>Tehlike arz eden durumlarda <strong>acil budama</strong> yapılabilir.</li>
                                    <li>Özel mülkte budama için dönemsel başvuru ve yönetim kararı istenebilir.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">İlaçlama & Bakım</h3>
                                <ul className="list-disc pl-5">
                                    <li>Bitki hastalık ve zararlılara karşı <strong>programlı ilaçlama</strong></li>
                                    <li>Kuruyan/tehlikeli ağaçların tespiti ve raporlanması</li>
                                    <li>Çim biçme, çiçeklendirme, sulama, gübreleme</li>
                                </ul>
                            </div>
                        </div>
                        <Callout title="Belge & Yetki" tone="info">
                            Ağaç kesimi ve özel mülkte müdahale <strong>mevzuata tabidir</strong>; gerekli hallerde ilgili kurumlardan izin alınır.
                        </Callout>
                    </Section>

                    {/* ——— Etkinlik İzni ——— */}
                    <Section id="etkinlik" title="Etkinlik / Piknik İzni">
                        <p>Parklarda küçük ölçekli toplu etkinlikler için <strong>dilekçe/online başvuru</strong> ve çevre-güvenlik taahhüdü gerekir. Büyük etkinliklerde süre, alan ve güvenlik planı istenir.</p>
                        <ul className="list-disc pl-5">
                            <li>Gürültü, çevre temizliği ve park mobilyalarının korunması şarttır.</li>
                            <li>Elektrik-su ihtiyaçları için teknik şartlara uyulur.</li>
                        </ul>
                        <div className="mt-3">
                            <Link href="/ebelediye/basvuru?service=etkinlik-izni" className="rounded-lg bg-amber-600 px-4 py-2 text-white hover:opacity-95">Etkinlik Başvurusu</Link>
                        </div>
                    </Section>

                    {/* ——— Bakım ——— */}
                    <Section id="bakim" title="Periyodik Bakım & Temizlik">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Çim biçme, ağaç–çalı bakımı, sulama ve gübreleme</li>
                            <li>Haşereye karşı dönemsel <strong>ilaçlama</strong></li>
                            <li>Oyun grupları ve kent mobilyaları <strong>periyodik kontrol</strong></li>
                            <li>Arıza anında <strong>48 saat içinde</strong> ilk müdahale hedefi</li>
                        </ul>
                    </Section>

                    {/* ——— YENİ: Hatalı Yeşil Alan Sulama Mini Sistemi ——— */}
                    <Section id="sulama" title="Hatalı Yeşil Alan Sulama (Bildir)">
                        <p>Sprinkler sulaması <strong>yola taşıyor</strong>, kaldırıma su fışkırtıyor veya görüşü azaltıyorsa <strong>kaza riski</strong> oluşabilir. Aşağıdan konum ve fotoğrafla bildirebilirsiniz.</p>

                        <form className="mt-4 grid gap-3 rounded-xl border bg-white p-4" onSubmit={handleRaporKaydet}>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm text-gray-600">Enlem (lat)</label>
                                    <input className="w-full rounded-lg border px-3 py-2" type="number" step="0.0001" value={rapor.coords.lat} onChange={(e) => setRapor((r) => ({ ...r, coords: { ...r.coords, lat: parseFloat(e.target.value) } }))} />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600">Boylam (lng)</label>
                                    <input className="w-full rounded-lg border px-3 py-2" type="number" step="0.0001" value={rapor.coords.lng} onChange={(e) => setRapor((r) => ({ ...r, coords: { ...r.coords, lng: parseFloat(e.target.value) } }))} />
                                </div>
                            </div>

                            <label className="block text-sm text-gray-600">Adres (varsa)</label>
                            <input className="rounded-lg border px-3 py-2" placeholder="Mahalle/Cadde, yakın numara" value={rapor.adres ?? ""} onChange={(e) => setRapor((r) => ({ ...r, adres: e.target.value }))} />

                            <label className="block text-sm text-gray-600">Tarih & Saat</label>
                            <input className="rounded-lg border px-3 py-2" type="datetime-local" value={rapor.tarih} onChange={(e) => setRapor((r) => ({ ...r, tarih: e.target.value }))} />

                            <div className="flex items-center gap-2">
                                <input id="yol" type="checkbox" checked={rapor.yolIslaniyorMu} onChange={(e) => setRapor((r) => ({ ...r, yolIslaniyorMu: e.target.checked }))} />
                                <label htmlFor="yol" className="text-sm">Su yolu ıslatıyor / taşıyor</label>
                            </div>

                            <label className="block text-sm text-gray-600">Açıklama</label>
                            <textarea className="min-h-[90px] rounded-lg border px-3 py-2" placeholder="Zaman, şiddet, kaza riski vb." value={rapor.aciklama ?? ""} onChange={(e) => setRapor((r) => ({ ...r, aciklama: e.target.value }))} />

                            <label className="block text-sm text-gray-600">Fotoğraf (isteğe bağlı)</label>
                            <input
                                className="rounded-lg border px-3 py-2"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleRaporFoto(e.target.files?.[0])}
                            />
                            {rapor.foto && (
                                <div className="overflow-hidden rounded-lg border">
                                    <img src={rapor.foto} alt="Önizleme" className="max-h-64 w-full object-contain" />
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                    Bildirimi Gönder
                                </button>
                                <a
                                    className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95"
                                    href={`https://www.openstreetmap.org/?mlat=${rapor.coords.lat}&mlon=${rapor.coords.lng}#map=17/${rapor.coords.lat}/${rapor.coords.lng}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Haritada Kontrol Et
                                </a>
                            </div>
                            <p className="text-xs text-gray-500">
                                Not: Bu mini sistem konsept amaçlıdır; kayıtlar yerelde saklanır ve ilgili birimlere aktarım için entegrasyon sağlanabilir.
                            </p>
                        </form>

                        {/* Son raporlar */}
                        <div className="mt-4">
                            <h3 className="mb-2 font-semibold">Son Bildirimler</h3>
                            {raporlar.length === 0 ? (
                                <p className="text-sm text-gray-600">Henüz kayıt yok.</p>
                            ) : (
                                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {raporlar.slice(0, 6).map((r) => (
                                        <li key={r.id} className="rounded-xl border bg-white p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-medium">
                                                        {r.adres || `${r.coords.lat.toFixed(5)}, ${r.coords.lng.toFixed(5)}`}
                                                    </div>
                                                    <div className="text-xs text-gray-600">{new Date(r.tarih).toLocaleString()}</div>
                                                </div>
                                                <Badge tone={r.yolIslaniyorMu ? "danger" : "neutral"}>{r.yolIslaniyorMu ? "Yol ıslanıyor" : "Alan içi"}</Badge>
                                            </div>
                                            {r.foto && <img src={r.foto} alt="rapor" className="mt-2 max-h-40 w-full rounded-lg object-cover" />}
                                            <div className="mt-1 text-sm text-gray-700">{r.aciklama}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </Section>

                    {/* ——— SSS ——— */}
                    <Section id="sss" title="Sık Sorulan Sorular">
                        <details className="group py-3">
                            <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-green-400">
                                <span className="font-medium">Budama ne zaman yapılır?</span>
                            </summary>
                            <div className="prose prose-sm max-w-none py-2 text-gray-700">
                                İlçemizde <strong>kış dönemi</strong> (genellikle Kasım–Mart) ana budama takvimi uygulanır; acil durumlarda yıl içinde müdahale yapılabilir.
                            </div>
                        </details>
                        <details className="group py-3">
                            <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-green-400">
                                <span className="font-medium">Parkta etkinlik düzenlemek istiyorum.</span>
                            </summary>
                            <div className="prose prose-sm max-w-none py-2 text-gray-700">
                                Online başvuru ile alan, saat, katılımcı sayısı ve çevre planını bildirin. Büyük etkinliklerde güvenlik/temizlik planı şarttır.
                            </div>
                        </details>
                        <details className="group py-3">
                            <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-green-400">
                                <span className="font-medium">Kırık salıncak, yanmayan aydınlatma var.</span>
                            </summary>
                            <div className="prose prose-sm max-w-none py-2 text-gray-700">
                                <Link href="/cozum-merkezi?tab=park-ariza" className="text-green-700 underline">Arıza/hasar bildirimi</Link> yapın; hedef ilk müdahale 48 saattir.
                            </div>
                        </details>
                        <details className="group py-3">
                            <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-green-400">
                                <span className="font-medium">Ağaç kesimi için izin gerekir mi?</span>
                            </summary>
                            <div className="prose prose-sm max-w-none py-2 text-gray-700">
                                Evet. Tehlike tespiti ve mevzuat gereği kurum onayları aranır; izinsiz kesim <strong>yasaktır</strong>.
                            </div>
                        </details>
                    </Section>

                    {/* ——— İletişim ——— */}
                    <Section id="iletisim" title="İletişim">
                        <p><strong>Park ve Yeşil Alanlar Müdürlüğü</strong></p>
                        <p>Alo 153 • Çağrı Merkezi: 444 0 XXX</p>
                        <p>E-posta: <a className="text-green-700 underline" href="mailto:parkyesil@birimajans.bel.tr">parkyesil@birimajans.bel.tr</a></p>
                        <p>Adres: Birim Ajans Belediyesi Hizmet Binası, [adres]</p>
                    </Section>
                </main>
            </div>
        </div>
    );
}
