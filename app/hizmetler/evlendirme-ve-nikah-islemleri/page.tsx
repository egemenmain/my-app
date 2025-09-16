// app/hizmetler/evlendirme-nikah-islemleri/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ExportMenu from "@/components/ExportMenu";

/* ——— küçük yardımcılar ——— */
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
        <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${map[tone]}`}
        >
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

/* ——— domain tipleri ——— */
type SalonId = "s1" | "s2" | "s3";
type Slot = { saat: string; dolu?: boolean };
type Salon = { id: SalonId; ad: string; kapasite: number; adres: string };

type OnBasvuru = {
    id: string;
    adSoyad1: string;
    tc1?: string;
    adSoyad2: string;
    tc2?: string;
    telefon?: string;
    email?: string;
    tarih: string; // YYYY-MM-DD
    saat: string; // HH:mm
    salonId: SalonId;
    disNikaH: boolean;
    ikametIlce: boolean;
    not?: string;
};

const SALONLAR: Salon[] = [
    { id: "s1", ad: "Merkez Nikâh Salonu", kapasite: 220, adres: "Belediye Kültür Merkezi" },
    { id: "s2", ad: "Sahil Nikâh Terası", kapasite: 140, adres: "Sahil Etkinlik Alanı" },
    { id: "s3", ad: "Bahçe Nikâh Alanı", kapasite: 80, adres: "Kent Parkı" },
];

const DEMO_SAATLER = ["10:30", "11:30", "13:00", "14:00", "15:00", "16:00", "17:00"];

/* ——— yardımcı fonksiyonlar ——— */
const todayISO = () => new Date().toISOString().slice(0, 10);
const uuid = () => crypto.randomUUID();

const saveJSON = (filename: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

/* ——— ana bileşen ——— */
export default function EvlendirmeNikahPage() {
    /* ——— quick pre-application (localStorage) ——— */
    const [form, setForm] = useState<OnBasvuru>({
        id: uuid(),
        adSoyad1: "",
        adSoyad2: "",
        tarih: todayISO(),
        saat: "15:00",
        salonId: "s1",
        disNikaH: false,
        ikametIlce: true,
    });

    const [basvurular, setBasvurular] = useState<OnBasvuru[]>([]);
    useEffect(() => {
        try {
            const raw = localStorage.getItem("nikah-onbasvurular");
            if (raw) setBasvurular(JSON.parse(raw));
        } catch { }
    }, []);
    useEffect(() => {
        try {
            localStorage.setItem("nikah-onbasvurular", JSON.stringify(basvurular));
        } catch { }
    }, [basvurular]);

    const kaydet = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.adSoyad1 || !form.adSoyad2) {
            alert("Lütfen iki eş adayının ad-soyadını giriniz.");
            return;
        }
        const kayit = { ...form, id: uuid() };
        setBasvurular((prev) => [kayit, ...prev].slice(0, 50));
        alert("Ön başvuru taslağınız kaydedildi (demo). Dışa aktarım menüsünden verilerinizi indirebilirsiniz.");
    };


    const jsonYukle = (f?: File) => {
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const arr = JSON.parse(String(reader.result));
                if (Array.isArray(arr)) {
                    setBasvurular(arr);
                    alert("JSON ön başvurular yüklendi.");
                } else {
                    alert("Geçersiz JSON yapısı.");
                }
            } catch {
                alert("JSON okunamadı.");
            }
        };
        reader.readAsText(f);
    };

    /* ——— slot görüntüleme (demo) ——— */
    const [seciliTarih, setSeciliTarih] = useState(todayISO());
    const [seciliSalon, setSeciliSalon] = useState<SalonId>("s1");
    const rezervasyonlar = useMemo(() => {
        // localStorage’dan o tarihe ait dolu saatleri çek (demo)
        const key = `nikah-dolu-${seciliSalon}-${seciliTarih}`;
        try {
            const raw = localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as string[]) : [];
        } catch {
            return [];
        }
    }, [seciliSalon, seciliTarih]);

    const slotlar: Slot[] = DEMO_SAATLER.map((saat) => ({
        saat,
        dolu: rezervasyonlar.includes(saat),
    }));

    const demoDoldur = (saat: string) => {
        const key = `nikah-dolu-${seciliSalon}-${seciliTarih}`;
        const yeni = new Set(rezervasyonlar);
        if (yeni.has(saat)) yeni.delete(saat);
        else yeni.add(saat);
        localStorage.setItem(key, JSON.stringify(Array.from(yeni)));
        // küçük bir tetikleyici
        setSeciliSalon((v) => v);
    };

    /* ——— ücret hesaplayıcı ——— */
    const [haftaSonu, setHaftaSonu] = useState(false);
    const [mesaiDisi, setMesaiDisi] = useState(false);
    const [ikametIlce, setIkametIlce] = useState(true);
    const [disNikah, setDisNikah] = useState(false);

    const ucret = useMemo(() => {
        // örnek rakamlar (demo)
        const tabanHaftaIci = 600;
        const tabanHaftaSonu = 900;
        const mesaiDisiEk = 500;
        const disNikahEk = 350;
        const ikametIndirimi = -250;

        const taban = haftaSonu ? tabanHaftaSonu : tabanHaftaIci;
        let toplam = taban;
        if (mesaiDisi) toplam += mesaiDisiEk;
        if (disNikah) toplam += disNikahEk;
        if (ikametIlce) toplam += ikametIndirimi;
        return toplam;
    }, [haftaSonu, mesaiDisi, ikametIlce, disNikah]);

    const yil = new Date().getFullYear();

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-pink-50 via-white to-blue-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Evlendirme ve Nikâh İşlemleri</h1>
                        <p className="mt-3 text-gray-700">
                            Online ön başvuru, salon ve slot görüntüleme, ücret hesaplama ve
                            belgeler—hepsi tek sayfada. Aşağıdaki SSS’de A’dan Z’ye bütün
                            sorularınızın cevabını bulabilirsiniz.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="success">Hızlı Ön Başvuru</Badge>
                            <Badge tone="info">Slot Görüntüleme</Badge>
                            <Badge tone="warning">Ücret Hesaplama</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* kısa vaat şeridi */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>⏱️</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">24 saat</div>
                        <div className="text-sm text-gray-600">Ön başvuru ön inceleme süresi (hedef)</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>📅</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">7 gün</div>
                        <div className="text-sm text-gray-600">Hafta içi/sonu uygun saatler</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🏛️</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">{yil}</div>
                        <div className="text-sm text-gray-600">Güncel ücret ve kurallar</div>
                    </div>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["onbasvuru", "Hızlı Ön Başvuru"],
                            ["slot", "Salon & Slot Görüntüleme"],
                            ["ucret", "Ücret Hesaplayıcı"],
                            ["belgeler", "Gerekli Belgeler"],
                            ["surec", "Adım Adım Süreç"],
                            ["kurallar", "Kurallar & Notlar"],
                            ["sss", "Sık Sorulanlar (A-Z)"],
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
                    {/* ——— ÖN BAŞVURU ——— */}
                    <Section id="onbasvuru" title="Hızlı Ön Başvuru (Demo)">
                        <form onSubmit={kaydet} className="rounded-xl border bg-white p-4">
                            <div className="grid gap-2 md:grid-cols-2">
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    placeholder="Ad Soyad 1"
                                    value={form.adSoyad1}
                                    onChange={(e) => setForm((f) => ({ ...f, adSoyad1: e.target.value }))}
                                />
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    placeholder="Ad Soyad 2"
                                    value={form.adSoyad2}
                                    onChange={(e) => setForm((f) => ({ ...f, adSoyad2: e.target.value }))}
                                />
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    placeholder="TC Kimlik (ops.)"
                                    value={form.tc1 ?? ""}
                                    onChange={(e) => setForm((f) => ({ ...f, tc1: e.target.value }))}
                                />
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    placeholder="TC Kimlik (ops.)"
                                    value={form.tc2 ?? ""}
                                    onChange={(e) => setForm((f) => ({ ...f, tc2: e.target.value }))}
                                />
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    placeholder="Telefon (ops.)"
                                    value={form.telefon ?? ""}
                                    onChange={(e) => setForm((f) => ({ ...f, telefon: e.target.value }))}
                                />
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    placeholder="E-posta (ops.)"
                                    value={form.email ?? ""}
                                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                />
                            </div>

                            <div className="mt-2 grid gap-2 md:grid-cols-3">
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    type="date"
                                    value={form.tarih}
                                    onChange={(e) => setForm((f) => ({ ...f, tarih: e.target.value }))}
                                />
                                <input
                                    className="rounded-lg border px-3 py-2"
                                    type="time"
                                    value={form.saat}
                                    onChange={(e) => setForm((f) => ({ ...f, saat: e.target.value }))}
                                />
                                <select
                                    className="rounded-lg border px-3 py-2"
                                    value={form.salonId}
                                    onChange={(e) => setForm((f) => ({ ...f, salonId: e.target.value as SalonId }))}
                                >
                                    {SALONLAR.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.ad}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mt-2 grid gap-2 md:grid-cols-3">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.disNikaH}
                                        onChange={(e) => setForm((f) => ({ ...f, disNikaH: e.target.checked }))}
                                    />
                                    Dış Nikâh (salon dışında)
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.ikametIlce ?? true}
                                        onChange={(e) => setForm((f) => ({ ...f, ikametIlce: e.target.checked }))}
                                    />
                                    İlçemizde ikamet
                                </label>
                            </div>

                            <textarea
                                className="mt-2 min-h-[70px] w-full rounded-lg border px-3 py-2"
                                placeholder="Not (opsiyonel)"
                                value={form.not ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, not: e.target.value }))}
                            />

                            <div className="mt-3 flex flex-wrap gap-2">
                                <button className="rounded-lg bg-rose-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                                    Taslağı Kaydet
                                </button>
                                <ExportMenu
                                    data={basvurular}
                                    filename="nikah-onbasvuru"
                                    resourceId="evlendirme-nikah"
                                />
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm ring-1 ring-gray-300 hover:bg-gray-50">
                                    JSON Yükle
                                    <input type="file" accept="application/json" className="hidden" onChange={(e) => jsonYukle(e.target.files?.[0])} />
                                </label>
                            </div>

                            <Callout title="Bu bölüm nasıl çalışır?">
                                Girilen bilgiler tarayıcınızda saklanır (demo). JSON’u indirerek başka bir cihazda tekrar yükleyebilirsiniz.
                                Gerçek başvuru için aşağıdaki süreç ve belgeleri takip edip Belediyemize teslim ediniz.
                            </Callout>

                            {basvurular.length > 0 && (
                                <div className="mt-4 rounded-lg border p-3">
                                    <h4 className="mb-2 font-semibold">Son Kayıtlar</h4>
                                    <ul className="space-y-2 text-sm">
                                        {basvurular.slice(0, 5).map((b) => (
                                            <li key={b.id} className="rounded border p-2">
                                                {b.adSoyad1} & {b.adSoyad2} • {b.tarih} {b.saat} •{" "}
                                                {SALONLAR.find((s) => s.id === b.salonId)?.ad}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </form>
                    </Section>

                    {/* ——— SLOT GÖRÜNTÜLEME ——— */}
                    <Section id="slot" title="Salon & Slot Görüntüleme (Demo)">
                        <div className="rounded-xl border bg-white p-4">
                            <div className="grid gap-2 md:grid-cols-3">
                                <select
                                    className="rounded-lg border px-3 py-2"
                                    value={seciliSalon}
                                    onChange={(e) => setSeciliSalon(e.target.value as SalonId)}
                                >
                                    {SALONLAR.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.ad} (kapasite {s.kapasite})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="date"
                                    className="rounded-lg border px-3 py-2"
                                    value={seciliTarih}
                                    onChange={(e) => setSeciliTarih(e.target.value)}
                                />
                                <div className="rounded-lg border bg-gray-50 px-3 py-2 text-sm">
                                    {SALONLAR.find((s) => s.id === seciliSalon)?.adres}
                                </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                                {slotlar.map((sl) => (
                                    <button
                                        key={sl.saat}
                                        onClick={() => demoDoldur(sl.saat)}
                                        className={`rounded-lg border px-3 py-2 text-sm ${sl.dolu ? "bg-red-100 text-red-800" : "bg-emerald-50 text-emerald-800"
                                            }`}
                                    >
                                        {sl.saat} {sl.dolu ? "• Dolu" : "• Müsait"}
                                    </button>
                                ))}
                            </div>

                            <p className="mt-3 text-xs text-gray-600">
                                * Saatler ve durumlar temsili olarak gösterilmektedir. Gerçek randevu teyidi yetkili personel tarafından yapılır.
                            </p>
                        </div>
                    </Section>

                    {/* ——— ÜCRET HESAPLAYICI ——— */}
                    <Section id="ucret" title="Ücret Hesaplayıcı (Demo)">
                        <div className="rounded-xl border bg-white p-4">
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={haftaSonu} onChange={(e) => setHaftaSonu(e.target.checked)} />
                                    Hafta sonu
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={mesaiDisi} onChange={(e) => setMesaiDisi(e.target.checked)} />
                                    Mesai dışı (18:00 sonrası)
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={ikametIlce} onChange={(e) => setIkametIlce(e.target.checked)} />
                                    İlçemizde ikamet indirimi
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={disNikah} onChange={(e) => setDisNikah(e.target.checked)} />
                                    Dış nikâh (salon dışında)
                                </label>
                            </div>

                            <div className="mt-3 rounded-lg bg-gray-50 p-3">
                                Tahmini Ücret:{" "}
                                <span className="text-xl font-semibold">{ucret.toLocaleString("tr-TR")} ₺</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-600">
                                * Bilgilendirme amaçlıdır; resmi ücret, ödeme sırasında kesinleşir.
                            </p>
                        </div>
                    </Section>

                    {/* ——— BELGELER ——— */}
                    <Section id="belgeler" title="Gerekli Belgeler">
                        <ul className="list-disc space-y-1 pl-5">
                            <li>Nüfus cüzdanı/T.C. Kimlik kartı (fotoğraflı, son 10 yıl)</li>
                            <li>Fotoğraflı vesikalık (son 6 ay; arka fon açık renk) – 4’er adet</li>
                            <li>Sağlık raporu (Aile hekimi/Toplum Sağlığı Merkezi; “Evliliğe engel yoktur”)</li>
                            <li>Vesayet/velayet durumunda mahkeme/veli izin yazısı</li>
                            <li>Yabancı uyruklu için: Pasaport, doğum belgesi, bekârlık belgesi, çok dilli apostilli evraklar</li>
                            <li>Boşanmış/dul ise: Kesinleşmiş mahkeme kararı/ölüm belgesi</li>
                            <li>Dış nikâh için: Mekân kullanım izni ve organizasyon planı</li>
                        </ul>
                    </Section>

                    {/* ——— SÜREÇ ——— */}
                    <Section id="surec" title="Adım Adım Süreç">
                        <ol className="list-decimal space-y-1 pl-5">
                            <li>Uygun salon/saat seçimi ve ön başvuru (bu sayfa).</li>
                            <li>Belgelerin hazırlanması ve Evlendirme Memurluğumuza teslimi.</li>
                            <li>Ücretin ödenmesi ve nikâh randevusunun kesinleşmesi.</li>
                            <li>Nikâh günü: Nüfus cüzdanları, iki tanık ve yüzükler ile salonda hazır olun.</li>
                            <li>Nikâh akdi sonrası evlenme cüzdanı teslimi ve nüfus işlemleri.</li>
                        </ol>
                        <Callout title="Zamanlama İpucu" tone="success">
                            Belgelerin geçerlilik süreleri (ör. sağlık raporu) sınırlıdır. Randevudan 1–3 hafta önce işlem yapmanız önerilir.
                        </Callout>
                    </Section>

                    {/* ——— KURALLAR ——— */}
                    <Section id="kurallar" title="Kurallar & Notlar">
                        <ul className="list-disc space-y-1 pl-5">
                            <li>İki tanık zorunludur (18 yaşını doldurmuş, akıl sağlığı yerinde).</li>
                            <li>Salonlara yiyecek-içecek sokulmaz; çiçek/konfeti için görevlilerden bilgi alınız.</li>
                            <li>Fotoğraf/Video çekimi kuralları salona göre değişir; görevliler yönlendirir.</li>
                            <li>Geç kalma: 15 dakikayı aşan gecikmelerde seans iptal olabilir.</li>
                            <li>İptal/değişiklik talebinizi en az 3 iş günü önce bildiriniz.</li>
                        </ul>
                    </Section>

                    {/* ——— SSS ——— */}
                    <Section id="sss" title="Sık Sorulan Sorular (A-Z)">
                        <div className="space-y-3">
                            {[
                                ["Başvuru kimler yapabilir?", "18 yaşını doldurmuş, evlenmeye engeli bulunmayan herkes. 17 yaş için veli/vasî izni gerekir; 16 ve altı için mahkeme kararı gerekir."],
                                ["İkamet şartı var mı?", "İlçe sakinlerine öncelik verilir; ikamet indirimi ücret hesaplayıcıda dikkate alınır. İkamet yoksa başvuru kabul edilebilir ancak indirim uygulanmaz."],
                                ["Sağlık raporu nereden?", "Aile hekimi/TSM. “Evliliğe engel yoktur” ibareli, fotoğraflı ve hekim onaylı rapor gerekir."],
                                ["Yabancı uyrukluların belgeleri?", "Bekârlık belgesi (apostilli, çok dilli), doğum belgesi, pasaport çevirileri. Ülkeye göre değişebilir; önceden memurluğumuzla iletişime geçiniz."],
                                ["Boşanmış/dul başvuruları?", "Kesinleşmiş mahkeme kararı veya ölüm belgesi ibrazı zorunludur. Kızlık soyadı tercihi için ayrıca dilekçe alınır."],
                                ["Dış nikâh mümkün mü?", "Evet. Mekân uygunluğu, hava şartları ve güvenlik kriterleri sağlanmalı; ek ücret ve lojistik koşulları vardır."],
                                ["Tanık şartları?", "İki tanık zorunlu; tanıklar 18+ ve kimlikleri yanlarında olmalıdır. Akrabalık engel değildir."],
                                ["Soyadı tercihleri?", "Kadın: eşinin soyadını alabilir; kendi soyadı + eşinin soyadı olarak kullanabilir; kendi soyadını tek başına kullanma talebi için mahkeme gerekir."],
                                ["Ücret iadesi / tarih değişikliği?", "Etkinlikten 3 iş gününden fazla süre varsa tarih değişikliği mümkündür. İade politikası ücret tarifesine göre uygulanır."],
                                ["Geç kalırsak?", "15 dakikayı aşan gecikmeler, sonraki törenleri aksatmamak için iptale veya başka saate ertelenmeye neden olabilir."],
                                ["Fotoğraf/Video?", "Serbesttir; ancak salona zarar vermeyecek, töreni aksatmayacak şekilde yapılmalıdır."],
                                ["Nikâh sırasında gerekli belgeler?", "Kimlikler, yüzükler, iki tanık ve varsa özel izinler. Görevliler son kontrolü yapar."],
                                ["Engelli erişimi / işaret dili?", "Salonlarımız erişilebilir. İşaret dili veya farklı ihtiyaçlar için en az 3 gün önce bilgi veriniz."],
                                ["Nüfus işlemleri nasıl tamamlanır?", "Nikâh akdinden sonra evlenme cüzdanı verilir; nüfus sistemine işlenmesi görevli memurlukça yapılır."],
                                ["Randevu ne zaman kesinleşir?", "Belgelerin teslimi ve ödemenin alınmasıyla randevu kesinleşir. Bu sayfadaki kayıtlar bilgilendirme amaçlıdır."],
                                ["Müzik / organizasyon?", "Kısa müzik girişi serbest; yüksek ses, piroteknik vb. yasaktır. Çıkışta karşılama için görevlilerle plan yapınız."],
                                ["İptal koşulları?", "Mücbir sebepler dışında iptal, ücret tarifesine göre kesinti içerebilir. Detay için memurluğumuza başvurunuz."],
                                ["Nikâh şahitlerini değiştirebilir miyiz?", "Evet, tören öncesi kimlik kontrolünde bildirebilirsiniz."],
                                ["Birlikte soyadı kullanımı örneği?", "“Ayşe Yılmaz-Kaya” gibi; başvuru sırasında beyan edilir, nüfusa öyle işlenir."],
                                ["Kapalı salon kapasitesi?", "Salon bilgileri üst bölümde listelidir (220/140/80). Ayakta kapasite artırılamaz."],
                            ].map(([q, a]) => (
                                <details key={q} className="group rounded-lg py-2">
                                    <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-rose-400">
                                        <span className="font-medium">{q}</span>
                                    </summary>
                                    <div className="prose prose-sm max-w-none py-1 text-gray-700">{a}</div>
                                </details>
                            ))}
                        </div>
                    </Section>

                    {/* ——— İLETİŞİM ——— */}
                    <Section id="iletisim" title="İletişim">
                        <p>
                            <strong>Evlendirme Memurluğu</strong>
                        </p>
                        <p>Çağrı Merkezi: 444 0 XXX • Alo 153</p>
                        <p>
                            E-posta:{" "}
                            <a className="text-rose-700 underline" href="mailto:evlendirme@birimajans.bel.tr">
                                evlendirme@birimajans.bel.tr
                            </a>
                        </p>
                        <p>Adres: Belediye Kültür Merkezi, [adres]</p>
                        <div className="mt-3 flex gap-2">
                            <Link
                                href="/randevu?tab=nikah"
                                className="rounded-lg bg-rose-600 px-4 py-2 text-white hover:opacity-95"
                            >
                                Online Randevu Talebi
                            </Link>
                            <Link
                                href="/ucretler-ve-tarifeler"
                                className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95"
                            >
                                Ücretler ve Tarifeler
                            </Link>
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
}
