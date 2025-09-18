"use client";

import type { Metadata } from "next";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

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
type ParkKategori = "çocuk" | "oyun" | "skate" | "koşu" | "köpek" | "spor" | "seyir" | "koru" | "yürüyüş";
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

/* —— ATAŞEHİR park verisi —— */
const PARKLAR: Park[] = [
    {
        id: "nezahat-gokyigit-botanik",
        ad: "Nezahat Gökyiğit Botanik Bahçesi",
        adres: "Atatürk Mah., Ataşehir/Ümraniye sınırı",
        mahalle: "Atatürk",
        coords: { lat: 40.996852, lng: 29.11862 },
        kategoriler: ["yürüyüş", "seyir", "koru"],
        ozellikler: ["botanik", "wc", "kafe", "etkinlik"],
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Nezahat_G%C3%B6kyi%C4%9Fit_Botanik_Bah%C3%A7esi.jpg/640px-Nezahat_G%C3%B6kyi%C4%9Fit_Botanik_Bah%C3%A7esi.jpg",
    },
    {
        id: "atasehir-parki",
        ad: "Ataşehir Parkı",
        adres: "Atatürk Mah., Ataşehir Blv. civarı",
        mahalle: "Atatürk",
        coords: { lat: 40.990624, lng: 29.130927 },
        kategoriler: ["yürüyüş", "çocuk", "spor"],
        ozellikler: ["oyun", "açık spor"],
        img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1200&auto=format",
    },
    {
        id: "erguvan-baris-parki",
        ad: "Erguvan Barış Parkı",
        adres: "Esatpaşa Mah., Ataşehir",
        mahalle: "Esatpaşa",
        coords: { lat: 41.005441, lng: 29.082203 },
        kategoriler: ["yürüyüş", "çocuk"],
        ozellikler: ["oturma", "oyun"],
        img: "https://images.unsplash.com/photo-1523419409543-8c1a5b1c5b98?q=80&w=1200&auto=format",
    },
    {
        id: "atasehir-kopek-parki",
        ad: "Ataşehir Köpek Parkı",
        adres: "Atatürk Mah., Ataşehir Blv. doğusu",
        mahalle: "Atatürk",
        coords: { lat: 40.98888268, lng: 29.12901728 },
        kategoriler: ["köpek", "yürüyüş"],
        ozellikler: ["çitli alan"],
        img: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=1200&auto=format",
    },
    {
        id: "beyaz-firin-onu-parki",
        ad: "Beyaz Fırın Önü Parkı",
        adres: "Küçükbakkalköy Mah., Barbaros Sok. çevresi",
        mahalle: "Küçükbakkalköy",
        coords: { lat: 40.986804281, lng: 29.109526655 },
        kategoriler: ["çocuk", "yürüyüş"],
        ozellikler: ["oturma", "oyun"],
        img: "https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?q=80&w=1200&auto=format",
    },
];

/* —— Öntanımlı konumlar (Ataşehir) —— */
const PRESETS: Record<string, { label: string; coords: Coords }> = {
    atasehir_meydan: { label: "Ataşehir Cumhuriyet Meydanı", coords: { lat: 40.994048, lng: 29.108739 } },
    barbaros: { label: "Barbaros Mahallesi", coords: { lat: 40.9911, lng: 29.1017 } },
    ataturk: { label: "Atatürk Mahallesi", coords: { lat: 40.991203, lng: 29.128887 } },
    kucukbakkalkoy: { label: "Küçükbakkalköy", coords: { lat: 40.983231, lng: 29.115435 } },
};

/* Haversine mesafe (km) — park & toplanma için kullanılıyor */
function distanceKm(a: Coords, b: Coords) {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const s1 = Math.sin(dLat / 2) ** 2;
    const s2 = Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s1 + s2));
}

/* OSM embed url — haritalar için */
function osmEmbed(center: Coords) {
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
    foto?: string;
};

/* ——— Deprem Toplanma Alanları ——— */
type ToplanmaKaydi = { id: string; ad: string; mahalle: string; adres: string; coords?: Coords };

const TOPLANMA_ADRESLERI: ToplanmaKaydi[] = [
    /* —— Aşıkveysel —— */
    { id: "avs-orhan-veli-ortaokulu", mahalle: "Aşıkveysel", ad: "Orhan Veli Ortaokulu / Aşık Veysel Lisesi", adres: "Bingöl Sk. – Erdoğan Sk. kesişimi, Ataşehir/İst." },
    { id: "avs-semahparka", mahalle: "Aşıkveysel", ad: "Semah Parkı", adres: "3073. Sokak, Ataşehir/İst." },
    { id: "avs-yenipark", mahalle: "Aşıkveysel", ad: "Yeni Park", adres: "Nuri Pakdil Sk. – 3029. Sok., Ataşehir/İst." },

    /* —— Atatürk —— */
    { id: "ata-kadriye-faik", mahalle: "Atatürk", ad: "Kadriye Faik İlkokulu / Sait Cordan Ortaokulu", adres: "Girne Cd. – 2. Cadde, Ataşehir/İst." },
    { id: "ata-8mart", mahalle: "Atatürk", ad: "8 Mart Kadın Eli Parkı", adres: "Meriç Cd., Ataşehir/İst." },
    { id: "ata-emek-evler", mahalle: "Atatürk", ad: "Emek Evler Parkları", adres: "Dudullu Cd. – Emekevler Arkası, Ataşehir/İst." },
    { id: "ata-sanat-parki", mahalle: "Atatürk", ad: "Sanat Parkı (Metropol önü)", adres: "Ataşehir Blv., Ataşehir/İst." },

    /* —— Barbaros —— */
    { id: "barb-paladyum", mahalle: "Barbaros", ad: "Paladyum AVM Yanı Kavşak Parkı", adres: "Halk Cd., Ataşehir/İst." },
    { id: "barb-habire-yahsi", mahalle: "Barbaros", ad: "Habire Yahşi Anadolu Lisesi", adres: "Sütçü Yolu Cd. – Kazım Karabekir Cd., Ataşehir/İst." },
    { id: "barb-bulent-ecevit", mahalle: "Barbaros", ad: "Bülent Ecevit Parkı", adres: "Halk Cd. – Kardelen Sk., Ataşehir/İst." },

    /* —— Esatpaşa —— */
    { id: "esa-ali-nihat", mahalle: "Esatpaşa", ad: "Ali Nihat Tarlan İlköğretim", adres: "Zahir Sk. – Keskinler Sk., Ataşehir/İst." },
    { id: "esa-mehmet-akif", mahalle: "Esatpaşa", ad: "Mehmet Akif Parkı", adres: "M. Fevzi Çakmak Cd. – Hacıbekir Cd., Ataşehir/İst." },
    { id: "esa-papatya", mahalle: "Esatpaşa", ad: "Papatya Parkı", adres: "Fidanlık Sk. – Papatya Sk., Ataşehir/İst." },

    /* —— Ferhatpaşa —— */
    { id: "fer-mustafa-oncel", mahalle: "Ferhatpaşa", ad: "Mustafa Öncel İlk/Ortaokulu", adres: "Fatih Sultan Mehmet Cd. – 38. Sok., Ataşehir/İst." },
    { id: "fer-necmettin-erbakan", mahalle: "Ferhatpaşa", ad: "Prof. Dr. Necmettin Erbakan Parkı", adres: "Atatürk Cd., Ataşehir/İst." },

    /* —— Fetih —— */
    { id: "fet-fetih-imkb", mahalle: "Fetih", ad: "Fetih İMKB İlkokulu", adres: "Kafkas Sk. – Ahmet Yesevi Cd., Ataşehir/İst." },
    { id: "fet-acelya", mahalle: "Fetih", ad: "Açelya Parkı", adres: "Tahrali Sk., Ataşehir/İst." },

    /* —— İçerenköy —— */
    { id: "ice-fsm-hastane", mahalle: "İçerenköy", ad: "Fatih Sultan Mehmet Hastanesi Otoparkı", adres: "Eski Üsküdar Yolu Cd., Ataşehir/İst." },
    { id: "ice-hasan-leyli", mahalle: "İçerenköy", ad: "Hasan Leyli Ortaokulu", adres: "Adem Sk. – Ulus Sk., Ataşehir/İst." },
    { id: "ice-carrefour", mahalle: "İçerenköy", ad: "Carrefoursa (otopark/çevresi)", adres: "Kayışdağı Cd. – Yan Yol, Ataşehir/İst." },

    /* —— İnönü —— */
    { id: "ino-mehmet-fidan", mahalle: "İnönü", ad: "Mehmet Fidan Ortaokulu", adres: "Eski Üsküdar Yolu Cd., Ataşehir/İst." },
    { id: "ino-yeditepe", mahalle: "İnönü", ad: "Yeditepe Üniversitesi", adres: "Kayışdağı Cd., Ataşehir/İst." },

    /* —— Kayışdağı —— */
    { id: "kay-arif-pasa", mahalle: "Kayışdağı", ad: "Arif Paşa Ortaokulu", adres: "Kayışdağı Cd. – Baysal Sk., Ataşehir/İst." },
    { id: "kay-80yil", mahalle: "Kayışdağı", ad: "80. Yıl Parkı", adres: "Yunus Sk., Ataşehir/İst." },
    { id: "kay-yarbay-ali-tatar", mahalle: "Kayışdağı", ad: "Yarbay Ali Tatar Parkı", adres: "Büyükbakkalköy Yolu Sk., Ataşehir/İst." },

    /* —— Küçükbakkalköy —— */
    { id: "kb-begonya", mahalle: "Küçükbakkalköy", ad: "Begonya Parkı", adres: "Melih Cevdet Anday Sk. – Yasa Sk., Ataşehir/İst." },
    { id: "kb-beyaz-firin", mahalle: "Küçükbakkalköy", ad: "Beyaz Fırın Önü Parkı", adres: "Vedat Günyol Cd. – Efe Sk., Ataşehir/İst." },
    { id: "kb-erguvan", mahalle: "Küçükbakkalköy", ad: "Erguvan Parkı", adres: "Dere 2 Sk. – Karakoç Sk., Ataşehir/İst." },

    /* —— Mevlana —— */
    { id: "mev-imkb-anadolu", mahalle: "Mevlana", ad: "Mevlana İMKB Anadolu Lisesi", adres: "Dursun Bey Cd., Ataşehir/İst." },
    { id: "mev-30agustos", mahalle: "Mevlana", ad: "30 Ağustos Parkı", adres: "Yeni Sıla Sk., Ataşehir/İst." },

    /* —— Mustafa Kemal —— */
    { id: "mk-deniz-gezmis", mahalle: "Mustafa Kemal", ad: "Deniz Gezmiş Parkı", adres: "3092. Sk., Ataşehir/İst." },
    { id: "mk-ozgurluk", mahalle: "Mustafa Kemal", ad: "Özgürlük Parkı", adres: "Şoklar Cd., Ataşehir/İst." },

    /* —— Örnek —— */
    { id: "orn-ihsan-kursunoglu", mahalle: "Örnek", ad: "İhsan Kurşunoğlu Ortaokulu", adres: "Tınaztepe Cd. – İncilir Ova Sk., Ataşehir/İst." },
    { id: "orn-elvan-spor", mahalle: "Örnek", ad: "Elvan Spor Kulübü", adres: "İncilir Ova Sk. – Semerkand Cd., Ataşehir/İst." },
    { id: "orn-nilufer", mahalle: "Örnek", ad: "Nilüfer Parkı", adres: "Nizam Sk., Ataşehir/İst." },

    /* —— Yeni Çamlıca —— */
    { id: "yc-cagibey", mahalle: "Yeni Çamlıca", ad: "Çağribey İlköğretim", adres: "Çağribey Sk., Ataşehir/İst." },
    { id: "yc-iyibekir", mahalle: "Yeni Çamlıca", ad: "İyibekir Parkı", adres: "Erzurum Sk. – Enes Sk., Ataşehir/İst." },

    /* —— Yeni Sahra —— */
    { id: "ys-ipek-parki", mahalle: "Yeni Sahra", ad: "İpek Parkı", adres: "Sütçü İmam Cd., Ataşehir/İst." },
    { id: "ys-nuri-dede", mahalle: "Yeni Sahra", ad: "Nuri Dede Ortaokulu", adres: "İstiklal Cd., Ataşehir/İst." },

    /* —— Yenişehir —— */
    { id: "ysr-can-parki", mahalle: "Yenişehir", ad: "Can Parkı", adres: "Pazar Sk., Ataşehir/İst." },
    { id: "ysr-imar-iskan", mahalle: "Yenişehir", ad: "İmar İskan Parkları", adres: "İmar İskan Cd., Ataşehir/İst." },
];

/* mahalle seçeneklerini üret */
const MAHALLELER = Array.from(new Set(TOPLANMA_ADRESLERI.map((x) => x.mahalle))).sort();

/* geocode helper (demo) + cache */
async function geocodeIfNeeded(item: ToplanmaKaydi): Promise<ToplanmaKaydi> {
    if (item.coords) return item;
    const key = `geo:${item.id}`;
    try {
        const cached = localStorage.getItem(key);
        if (cached) return { ...item, coords: JSON.parse(cached) as Coords };
    } catch { }
    const q = encodeURIComponent(`${item.adres}, ${item.mahalle} Mah., Ataşehir, İstanbul, Türkiye`);
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`, {
            headers: { "Accept-Language": "tr" },
        });
        const data = await res.json();
        if (Array.isArray(data) && data[0]) {
            const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            try {
                localStorage.setItem(key, JSON.stringify(coords));
            } catch { }
            return { ...item, coords };
        }
    } catch { }
    return item;
}

/* Harita araması linki */
const mapsSearch = (adres: string, mahalle?: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${adres}${mahalle ? ", " + mahalle + " Mah." : ""} Ataşehir İstanbul`)}`;

export default function ParkYesilAlanPage() {
    /* Park Bul durumu — DEFAULT CENTER ATAŞEHİR MEYDAN */
    const [center, setCenter] = useState<Coords>(PRESETS.atasehir_meydan.coords);
    const [kategori, setKategori] = useState<ParkKategori | "hepsi">("hepsi");
    const [maxKm, setMaxKm] = useState<number>(5);
    const [query, setQuery] = useState<string>("");

    /* Deprem toplanma — mahalle filtresi + veri (geocode’lanmış) */
    const [depremMahalle, setDepremMahalle] = useState<string>("");
    const [toplanma, setToplanma] = useState<ToplanmaKaydi[]>(TOPLANMA_ADRESLERI);

    /* Rapor durumu (hatalı sulama) */
    const [raporlar, setRaporlar] = useState<SulamaRapor[]>([]);
    const [rapor, setRapor] = useState<SulamaRapor>({
        id: crypto.randomUUID(),
        coords: center,
        tarih: new Date().toISOString().slice(0, 16),
        yolIslaniyorMu: true,
    });

    useEffect(() => {
        try {
            const raw = localStorage.getItem("hatalı-sulama-raporları");
            if (raw) setRaporlar(JSON.parse(raw));
        } catch { }
    }, []);

    useEffect(() => {
        setRapor((r) => ({ ...r, coords: center }));
    }, [center]);

    /* Deprem listesi için tek seferlik geocode */
    useEffect(() => {
        (async () => {
            const enriched = await Promise.all(TOPLANMA_ADRESLERI.map(geocodeIfNeeded));
            setToplanma(enriched);
        })();
    }, []);

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

    /* Deprem: filtre + yakınlığa göre sırala */
    const depremSirali = useMemo(() => {
        const base = depremMahalle ? toplanma.filter((t) => t.mahalle === depremMahalle) : toplanma;
        return base
            .map((t) => ({ ...t, uzaklik: t.coords ? distanceKm(center, t.coords) : Number.POSITIVE_INFINITY }))
            .sort((a, b) => a.uzaklik - b.uzaklik);
    }, [toplanma, depremMahalle, center]);

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
                            Park bakım-onarım, ağaçlandırma, budama/ilaçlama, çim-ot temizliği, etkinlik ve piknik izinleri; ayrıca <strong>konuma göre en yakın parkları</strong> bulma ve{" "}
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
                            ["deprem", "Deprem Toplanma Alanları"],
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
                                    <button onClick={handleMyLocation} className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:opacity-95" type="button">
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
                                <select className="mb-3 w-full rounded-lg border px-3 py-2" value={kategori} onChange={(e) => setKategori(e.target.value as any)}>
                                    <option value="hepsi">Hepsi</option>
                                    <option value="çocuk">Çocuk</option>
                                    <option value="oyun">Oyun</option>
                                    <option value="skate">Kaykay</option>
                                    <option value="koşu">Koşu</option>
                                    <option value="köpek">Köpek</option>
                                    <option value="spor">Spor</option>
                                    <option value="seyir">Seyir</option>
                                    <option value="koru">Koru</option>
                                    <option value="yürüyüş">Yürüyüş</option>
                                </select>

                                <label className="block text-sm text-gray-600">Mesafe (km)</label>
                                <input className="w-full" type="range" min={1} max={10} step={1} value={maxKm} onChange={(e) => setMaxKm(parseInt(e.target.value))} />
                                <div className="text-sm text-gray-700">Maksimum: {maxKm} km</div>

                                <label className="mt-3 block text-sm text-gray-600">Ara</label>
                                <input className="w-full rounded-lg border px-3 py-2" placeholder="Park adı / mahalle" value={query} onChange={(e) => setQuery(e.target.value)} />
                            </div>

                            {/* Sonuçlar + Harita */}
                            <div className="space-y-4">
                                <div className="overflow-hidden rounded-xl border">
                                    <iframe title="Harita" className="h-72 w-full" src={osmEmbed(center)} loading="lazy" />
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
                                                    {/* YÜRÜME SÜRESİ: inline hesap */}
                                                    {(() => {
                                                        const d = distanceKm(center, p.coords);
                                                        const mins = Math.max(1, Math.round((d * 1000) / 80)); // ~4.8 km/s → 80 m/dk
                                                        return (
                                                            <p className="text-xs text-gray-500">
                                                                Uzaklık: {d.toFixed(2)} km • Yürüme: ~{mins} dk
                                                            </p>
                                                        );
                                                    })()}
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
                                                    <Badge key={k} tone="success">
                                                        {k}
                                                    </Badge>
                                                ))}
                                                {p.ozellikler?.map((o) => (
                                                    <Badge key={o} tone="neutral">
                                                        {o}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </li>
                                    ))}
                                    {sonuc.length === 0 && <li className="rounded-xl border bg-white p-4 text-sm text-gray-700">Bu filtrelerle park bulunamadı. Mesafeyi artırmayı deneyin.</li>}
                                </ul>
                            </div>
                        </div>
                    </Section>

                    {/* ——— Deprem Toplanma Alanları ——— */}
                    <Section id="deprem" title="Deprem Toplanma Alanları (Ataşehir)">
                        <Callout title="Bilgilendirme" tone="warning">
                            Aşağıdaki adresler bilgilendirme amaçlıdır. Resmî toplanma alanları listesi AFAD/İBB duyurularına göre güncellenir.
                        </Callout>

                        <div className="mt-4 grid gap-4 md:grid-cols-[320px_1fr]">
                            {/* Sol panel */}
                            <div className="rounded-xl border bg-white p-4">
                                <label className="block text-sm text-gray-600">Mahalle seç (opsiyonel)</label>
                                <select className="mb-2 w-full rounded-lg border px-3 py-2" value={depremMahalle} onChange={(e) => setDepremMahalle(e.target.value)}>
                                    <option value="">Hepsi</option>
                                    {MAHALLELER.map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>

                                <button onClick={handleMyLocation} className="w-full rounded-lg bg-red-600 px-3 py-2 text-white hover:opacity-95" type="button">
                                    Konumumu Kullan ve En Yakını Sırala
                                </button>

                                <p className="mt-2 text-xs text-gray-500">Konumu açarsan en yakın toplanma alanı en üstte görünür.</p>
                            </div>

                            {/* Harita + Liste */}
                            <div className="space-y-4">
                                <div className="overflow-hidden rounded-xl border">
                                    <iframe title="Harita" className="h-72 w-full" src={osmEmbed(center)} loading="lazy" />
                                </div>

                                <div className="overflow-hidden rounded-xl border bg-white">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-700">
                                            <tr>
                                                <th className="px-4 py-2">Ad</th>
                                                <th className="px-4 py-2">Mahalle</th>
                                                <th className="px-4 py-2">Açık Adres</th>
                                                <th className="px-4 py-2">Uzaklık</th>
                                                <th className="px-4 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {depremSirali.map((t) => (
                                                <tr key={t.id} className="border-t">
                                                    <td className="px-4 py-2 font-medium">{t.ad}</td>
                                                    <td className="px-4 py-2">{t.mahalle}</td>
                                                    <td className="px-4 py-2">{t.adres}</td>
                                                    <td className="px-4 py-2 text-gray-600">{isFinite((t as any).uzaklik) ? `${(t as any).uzaklik.toFixed(2)} km` : "—"}</td>
                                                    <td className="px-4 py-2 text-right">
                                                        <a
                                                            className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white hover:opacity-90"
                                                            href={
                                                                t.coords
                                                                    ? `https://www.openstreetmap.org/?mlat=${t.coords.lat}&mlon=${t.coords.lng}#map=17/${t.coords.lat}/${t.coords.lng}`
                                                                    : mapsSearch(t.adres, t.mahalle)
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            Yol Tarifi
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                            {depremSirali.length === 0 && (
                                                <tr>
                                                    <td className="px-4 py-6 text-gray-600" colSpan={5}>
                                                        Liste boş. Lütfen resmî adresleri ekleyin.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* ——— Budama / İlaçlama ——— */}
                    <Section id="budama" title="Ağaç Budama / İlaçlama">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="font-semibold">Budama</h3>
                                <ul className="list-disc pl-5">
                                    <li>
                                        Genellikle <strong>Kasım–Mart</strong> arası planlı budama dönemi uygulanır.
                                    </li>
                                    <li>
                                        Tehlike arz eden durumlarda <strong>acil budama</strong> yapılabilir.
                                    </li>
                                    <li>Özel mülkte budama için dönemsel başvuru ve yönetim kararı istenebilir.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">İlaçlama & Bakım</h3>
                                <ul className="list-disc pl-5">
                                    <li>
                                        Bitki hastalık ve zararlılara karşı <strong>programlı ilaçlama</strong>
                                    </li>
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
                        <p>
                            Parklarda küçük ölçekli toplu etkinlikler için <strong>dilekçe/online başvuru</strong> ve çevre-güvenlik taahhüdü gerekir. Büyük etkinliklerde süre, alan ve güvenlik planı istenir.
                        </p>
                        <ul className="list-disc pl-5">
                            <li>Gürültü, çevre temizliği ve park mobilyalarının korunması şarttır.</li>
                            <li>Elektrik-su ihtiyaçları için teknik şartlara uyulur.</li>
                        </ul>
                        <div className="mt-3">
                            <Link href="/ebelediye/basvuru?service=etkinlik-izni" className="rounded-lg bg-amber-600 px-4 py-2 text-white hover:opacity-95">
                                Etkinlik Başvurusu
                            </Link>
                        </div>
                    </Section>

                    {/* ——— Bakım ——— */}
                    <Section id="bakim" title="Periyodik Bakım & Temizlik">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Çim biçme, ağaç–çalı bakımı, sulama ve gübreleme</li>
                            <li>
                                Haşereye karşı dönemsel <strong>ilaçlama</strong>
                            </li>
                            <li>
                                Oyun grupları ve kent mobilyaları <strong>periyodik kontrol</strong>
                            </li>
                            <li>
                                Arıza anında <strong>48 saat içinde</strong> ilk müdahale hedefi
                            </li>
                        </ul>
                    </Section>

                    {/* ——— Hatalı Yeşil Alan Sulama Mini Sistemi ——— */}
                    <Section id="sulama" title="Hatalı Yeşil Alan Sulama (Bildir)">
                        <p>
                            Sprinkler sulaması <strong>yola taşıyor</strong>, kaldırıma su fışkırtıyor veya görüşü azaltıyorsa <strong>kaza riski</strong> oluşabilir. Aşağıdan konum ve fotoğrafla bildirebilirsiniz.
                        </p>

                        <form className="mt-4 grid gap-3 rounded-xl border bg-white p-4" onSubmit={handleRaporKaydet}>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm text-gray-600">Enlem (lat)</label>
                                    <input
                                        className="w-full rounded-lg border px-3 py-2"
                                        type="number"
                                        step="0.0001"
                                        value={rapor.coords.lat}
                                        onChange={(e) => setRapor((r) => ({ ...r, coords: { ...r.coords, lat: parseFloat(e.target.value) } }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600">Boylam (lng)</label>
                                    <input
                                        className="w-full rounded-lg border px-3 py-2"
                                        type="number"
                                        step="0.0001"
                                        value={rapor.coords.lng}
                                        onChange={(e) => setRapor((r) => ({ ...r, coords: { ...r.coords, lng: parseFloat(e.target.value) } }))}
                                    />
                                </div>
                            </div>

                            <label className="block text-sm text-gray-600">Adres (varsa)</label>
                            <input className="rounded-lg border px-3 py-2" placeholder="Mahalle/Cadde, yakın numara" value={rapor.adres ?? ""} onChange={(e) => setRapor((r) => ({ ...r, adres: e.target.value }))} />

                            <label className="block text-sm text-gray-600">Tarih & Saat</label>
                            <input className="rounded-lg border px-3 py-2" type="datetime-local" value={rapor.tarih} onChange={(e) => setRapor((r) => ({ ...r, tarih: e.target.value }))} />

                            <div className="flex items-center gap-2">
                                <input id="yol" type="checkbox" checked={rapor.yolIslaniyorMu} onChange={(e) => setRapor((r) => ({ ...r, yolIslaniyorMu: e.target.checked }))} />
                                <label htmlFor="yol" className="text-sm">
                                    Su yolu ıslatıyor / taşıyor
                                </label>
                            </div>

                            <label className="block text-sm text-gray-600">Açıklama</label>
                            <textarea className="min-h-[90px] rounded-lg border px-3 py-2" placeholder="Zaman, şiddet, kaza riski vb." value={rapor.aciklama ?? ""} onChange={(e) => setRapor((r) => ({ ...r, aciklama: e.target.value }))} />

                            <label className="block text-sm text-gray-600">Fotoğraf (isteğe bağlı)</label>
                            <input className="rounded-lg border px-3 py-2" type="file" accept="image/*" onChange={(e) => handleRaporFoto(e.target.files?.[0])} />
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
                            <p className="text-xs text-gray-500">Not: Bu mini sistem konsept amaçlıdır; kayıtlar yerelde saklanır ve ilgili birimlere aktarım için entegrasyon sağlanabilir.</p>
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
                                                    <div className="text-sm font-medium">{r.adres || `${r.coords.lat.toFixed(5)}, ${r.coords.lng.toFixed(5)}`}</div>
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
                            <div className="prose prose-sm max-w-none py-2 text-gray-700">Online başvuru ile alan, saat, katılımcı sayısı ve çevre planını bildirin. Büyük etkinliklerde güvenlik/temizlik planı şarttır.</div>
                        </details>
                        <details className="group py-3">
                            <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-green-400">
                                <span className="font-medium">Kırık salıncak, yanmayan aydınlatma var.</span>
                            </summary>
                            <div className="prose prose-sm max-w-none py-2 text-gray-700">
                                <Link href="/cozum-merkezi?tab=park-ariza" className="text-green-700 underline">
                                    Arıza/hasar bildirimi
                                </Link>{" "}
                                yapın; hedef ilk müdahale 48 saattir.
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
                        <p>
                            <strong>Park ve Yeşil Alanlar Müdürlüğü</strong>
                        </p>
                        <p>Alo 153 • Çağrı Merkezi: 444 0 XXX</p>
                        <p>
                            E-posta:{" "}
                            <a className="text-green-700 underline" href="mailto:parkyesil@birimajans.bel.tr">
                                parkyesil@birimajans.bel.tr
                            </a>
                        </p>
                        <p>Adres: Birim Ajans Belediyesi Hizmet Binası, [adres]</p>
                    </Section>
                </main>
            </div>
        </div>
    );
}
