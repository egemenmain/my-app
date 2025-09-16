"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

/* ——— küçük yardımcılar ——— */
const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
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
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${map[tone]}`}>{children}</span>;
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

/* ——— basit map embed ——— */
type Coords = { lat: number; lng: number };
function osmEmbed(center: Coords) {
  const d = 0.02;
  const left = center.lng - d;
  const right = center.lng + d;
  const top = center.lat + d;
  const bottom = center.lat - d;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;
}

/* ——— ACİL PATİ ——— */
type EmergencyType = "trafik" | "kanama" | "sıkışma" | "hasta" | "zehirlenme/yangın" | "yavru" | "diğer";
type AnimalType = "kedi" | "köpek" | "kuş" | "yaban" | "diğer";

type AcilPatiIhbar = {
  id: string;
  coords: Coords;
  adres?: string;
  zaman: string; // ISO
  tur: EmergencyType;
  hayvan: AnimalType;
  adet: number;
  aciklama?: string;
  foto?: string; // base64
  adSoyad?: string;
  telefon?: string;
  kabulEdiyorum: boolean; // iletişime geçilebilir
};

const DEFAULT_CENTER: Coords = { lat: 41.043, lng: 29.0094 }; // Beşiktaş İskele çevresi

/* ——— KAYIP / BULUNDU ——— */
type PostType = "kayıp" | "bulundu";
type Sex = "erkek" | "dişi" | "bilinmiyor";
type PetType = "kedi" | "köpek" | "kuş" | "tavşan" | "diğer";
type DurumOnay = "pending" | "approved" | "rejected";

type PetPost = {
  id: string;
  durum: PostType;
  tur: PetType;
  isim?: string;
  cins?: string;
  yas?: string;
  cinsiyet?: Sex;
  renkAyirtici?: string;
  microchip?: string;
  sonGorulmeAdres?: string;
  sonGorulmeZaman?: string; // ISO
  coords?: Coords;
  aciklama?: string;
  foto?: string; // base64
  iletisim?: string; // telefon/email
  durumOnay: DurumOnay;
};

/* ——— (kullanılmasa da kalsın) localStorage normalizer ——— */
const toDurumOnay = (v: any): DurumOnay =>
  v === "approved" || v === "rejected" || v === "pending" ? (v as DurumOnay) : "pending";
function safeParsePosts(json: string): PetPost[] {
  try {
    const arr = JSON.parse(json) as any[];
    if (!Array.isArray(arr)) return [];
    return arr.map((p: any): PetPost => ({
      id: String(p?.id ?? crypto.randomUUID()),
      durum: (p?.durum === "kayıp" || p?.durum === "bulundu" ? p.durum : "kayıp") as PostType,
      tur: (["kedi", "köpek", "kuş", "tavşan", "diğer"].includes(p?.tur) ? p.tur : "kedi") as PetType,
      isim: p?.isim ?? undefined,
      cins: p?.cins ?? undefined,
      yas: p?.yas ?? undefined,
      cinsiyet: (["erkek", "dişi", "bilinmiyor"].includes(p?.cinsiyet) ? p.cinsiyet : "bilinmiyor") as Sex,
      renkAyirtici: p?.renkAyirtici ?? undefined,
      microchip: p?.microchip ?? undefined,
      sonGorulmeAdres: p?.sonGorulmeAdres ?? undefined,
      sonGorulmeZaman: p?.sonGorulmeZaman ?? undefined,
      coords:
        p?.coords && typeof p.coords.lat === "number" && typeof p.coords.lng === "number"
          ? { lat: p.coords.lat, lng: p.coords.lng }
          : undefined,
      aciklama: p?.aciklama ?? undefined,
      foto: p?.foto ?? undefined,
      iletisim: p?.iletisim ?? undefined,
      durumOnay: toDurumOnay(p?.durumOnay),
    }));
  } catch {
    return [];
  }
}

export default function VeterinerHizmetleriPage() {
  /* ——— ortak durum ——— */
  const [center, setCenter] = useState<Coords>(DEFAULT_CENTER);

  /* ——— ACİL PATİ ——— */
  const [ihbarlar, setIhbarlar] = useState<AcilPatiIhbar[]>([]);
  const [ihbar, setIhbar] = useState<AcilPatiIhbar>({
    id: crypto.randomUUID(),
    coords: center,
    zaman: new Date().toISOString().slice(0, 16),
    tur: "trafik",
    hayvan: "köpek",
    adet: 1,
    kabulEdiyorum: true,
  });

  /* ——— PANOLAR ——— */
  const [pending, setPending] = useState<PetPost[]>([]);
  const [approved, setApproved] = useState<PetPost[]>([]);
  const [mod, setMod] = useState(false); // Moderatör modu
  const [yeni, setYeni] = useState<PetPost>({
    id: crypto.randomUUID(),
    durum: "kayıp",
    tur: "kedi",
    durumOnay: "pending" as DurumOnay,
  });
  const [filtre, setFiltre] = useState<{ q: string; durum: "hepsi" | PostType; tur: "hepsi" | PetType }>({
    q: "",
    durum: "hepsi",
    tur: "hepsi",
  });

  /* ——— API'den yükle ——— */
  const loadAll = async () => {
    try {
      const [panoRes, ihbarRes] = await Promise.all([
        fetch("/api/veteriner/pano", { cache: "no-store" }),
        fetch("/api/veteriner/ihbar", { cache: "no-store" }),
      ]);
      const pano = await panoRes.json();
      const ihb = await ihbarRes.json();
      setPending(pano.pending || []);
      setApproved(pano.approved || []);
      setIhbarlar(ihb.ihbarlar || []);
    } catch (e) {
      console.error("Veriler yüklenemedi:", e);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => setIhbar((r) => ({ ...r, coords: center })), [center]);

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

  /* ——— ACİL PATİ: gönder (API) ——— */
  const submitIhbar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ihbar.kabulEdiyorum) return alert("Bildirimde iletişim izni kutucuğunu işaretleyin.");
    try {
      const payload = { action: "create", ihbar: { ...ihbar, id: crypto.randomUUID() } };
      const res = await fetch("/api/veteriner/ihbar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("İhbar kaydı başarısız.");
      const data = await res.json();
      setIhbarlar(data.ihbarlar || []);
      alert("Teşekkürler! İhbarınız kaydedildi.");
      setIhbar({
        id: crypto.randomUUID(),
        coords: center,
        zaman: new Date().toISOString().slice(0, 16),
        tur: "trafik",
        hayvan: "köpek",
        adet: 1,
        kabulEdiyorum: true,
      });
    } catch (err) {
      console.error(err);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  /* ——— KAYIP/BULUNDU: başvuru (API) ——— */
  const submitPet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const kayit: PetPost = {
        ...yeni,
        id: crypto.randomUUID(),
        durumOnay: "pending" as DurumOnay,
        coords: yeni.coords ?? center,
        sonGorulmeZaman: yeni.sonGorulmeZaman ?? new Date().toISOString().slice(0, 16),
      };
      const res = await fetch("/api/veteriner/pano", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", post: kayit }),
      });
      if (!res.ok) throw new Error("İlan gönderilemedi.");
      const data = await res.json();
      setPending(data.pending || []);
      alert("Başvurunuz moderasyona alındı.");
      setYeni({ id: crypto.randomUUID(), durum: "kayıp", tur: "kedi", durumOnay: "pending" as DurumOnay });
    } catch (err) {
      console.error(err);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  /* ——— Moderasyon (API) ——— */
  const approve = async (id: string) => {
    try {
      const res = await fetch("/api/veteriner/pano", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", id }),
      });
      if (!res.ok) throw new Error("Onaylanamadı.");
      const data = await res.json();
      setPending(data.pending || []);
      setApproved(data.approved || []);
    } catch (err) {
      console.error(err);
      alert("Onay sırasında bir hata oluştu.");
    }
  };

  const reject = async (id: string) => {
    try {
      const res = await fetch("/api/veteriner/pano", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", id }),
      });
      if (!res.ok) throw new Error("Reddedilemedi.");
      const data = await res.json();
      setPending(data.pending || []);
    } catch (err) {
      console.error(err);
      alert("Reddetme sırasında bir hata oluştu.");
    }
  };

  /* ——— pano filtre ——— */
  const filteredApproved = useMemo(() => {
    return approved.filter((p) => {
      const byDurum = filtre.durum === "hepsi" ? true : p.durum === filtre.durum;
      const byTur = filtre.tur === "hepsi" ? true : p.tur === filtre.tur;
      const byQ = filtre.q
        ? [p.isim, p.sonGorulmeAdres, p.renkAyirtici, p.cins].filter(Boolean).some((t) => (t as string).toLowerCase().includes(filtre.q.toLowerCase()))
        : true;
      return byDurum && byTur && byQ;
    });
  }, [approved, filtre]);

  const yil = new Date().getFullYear();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold tracking-tight">Veteriner Hizmetleri</h1>
            <p className="mt-3 text-gray-700">
              Sahipsiz/yaralı hayvanlar için <strong>ACİL PATİ</strong> ihbarı, ilçemizdeki <strong>Kayıp/Bulundu Panosu</strong>,
              kısırlaştırma–aşılama ve sahiplendirme yönlendirmeleri bu sayfada.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="success">Saha Ekipleri</Badge>
              <Badge tone="info">Alo 153 • 7/24</Badge>
              <Badge tone="warning">Trafik Güvenliği Önceliğimiz</Badge>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1568641028509-489eb9f3fe9c?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
          </div>
        </div>
      </section>

      {/* küçük istatistik/vaat şeridi */}
      <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <span>🚑</span>
          <div>
            <div className="text-lg font-semibold leading-none">30 dk</div>
            <div className="text-sm text-gray-600">Acil çağrıda hedef ilk temas</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <span>🧪</span>
          <div>
            <div className="text-lg font-semibold leading-none">TNR</div>
            <div className="text-sm text-gray-600">Kısırlaştır–Aşılat–Yerine Bırak programı</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <span>🏠</span>
          <div>
            <div className="text-lg font-semibold leading-none">{yil}</div>
            <div className="text-sm text-gray-600">Sahiplendirme yönlendirmeleri</div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        {/* TOC */}
        <nav className="top-24 hidden self-start lg:sticky lg:block">
          <ul className="space-y-1">
            {[
              ["acil", "ACİL PATİ İhbarı"],
              ["pano", "Kayıp/Bulundu Panosu"],
              ["sss", "Sık Sorulanlar"],
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
          {/* ——— ACİL PATİ ——— */}
          <Section id="acil" title="ACİL PATİ – Yaralı/Tehlikedeki Hayvan İhbarı (3 Adım)">
            <div className="grid gap-4 md:grid-cols-[320px_1fr]">
              {/* sol: form */}
              <form onSubmit={submitIhbar} className="rounded-xl border bg-white p-4">
                <h3 className="mb-2 font-semibold">1) Konum</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="rounded-lg border px-3 py-2"
                    type="number"
                    step="0.0001"
                    value={center.lat}
                    onChange={(e) => setCenter((c) => ({ ...c, lat: parseFloat(e.target.value) }))}
                    placeholder="Enlem (lat)"
                  />
                  <input
                    className="rounded-lg border px-3 py-2"
                    type="number"
                    step="0.0001"
                    value={center.lng}
                    onChange={(e) => setCenter((c) => ({ ...c, lng: parseFloat(e.target.value) }))}
                    placeholder="Boylam (lng)"
                  />
                </div>
                <input
                  className="mt-2 w-full rounded-lg border px-3 py-2"
                  placeholder="Adres (varsa)"
                  value={ihbar.adres ?? ""}
                  onChange={(e) => setIhbar((r) => ({ ...r, adres: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={useMyLocation}
                  className="mt-2 w-full rounded-lg bg-emerald-600 px-3 py-2 text-white hover:opacity-95"
                >
                  Konumumu Kullan
                </button>

                <h3 className="mb-2 mt-4 font-semibold">2) Durum</h3>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="rounded-lg border px-3 py-2"
                    value={ihbar.tur}
                    onChange={(e) => setIhbar((r) => ({ ...r, tur: e.target.value as EmergencyType }))}
                  >
                    <option value="trafik">Trafik/Çarpma Riski</option>
                    <option value="kanama">Kanama/Kırık</option>
                    <option value="sıkışma">Sıkışma/İple/Izgara</option>
                    <option value="hasta">Hasta/Zayıf</option>
                    <option value="zehirlenme/yangın">Zehirlenme/Yangın</option>
                    <option value="yavru">Yavru/Anne yok</option>
                    <option value="diğer">Diğer</option>
                  </select>
                  <select
                    className="rounded-lg border px-3 py-2"
                    value={ihbar.hayvan}
                    onChange={(e) => setIhbar((r) => ({ ...r, hayvan: e.target.value as AnimalType }))}
                  >
                    <option value="köpek">Köpek</option>
                    <option value="kedi">Kedi</option>
                    <option value="kuş">Kuş</option>
                    <option value="yaban">Yaban</option>
                    <option value="diğer">Diğer</option>
                  </select>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    className="rounded-lg border px-3 py-2"
                    type="number"
                    min={1}
                    value={ihbar.adet}
                    onChange={(e) => setIhbar((r) => ({ ...r, adet: parseInt(e.target.value || "1") }))}
                    placeholder="Adet"
                  />
                  <input
                    className="rounded-lg border px-3 py-2"
                    type="datetime-local"
                    value={ihbar.zaman}
                    onChange={(e) => setIhbar((r) => ({ ...r, zaman: e.target.value }))}
                  />
                </div>
                <textarea
                  className="mt-2 min-h-[80px] w-full rounded-lg border px-3 py-2"
                  placeholder="Kısa açıklama (trafikte, kanıyor, nefes almıyor vb.)"
                  value={ihbar.aciklama ?? ""}
                  onChange={(e) => setIhbar((r) => ({ ...r, aciklama: e.target.value }))}
                />

                <label className="mt-2 block text-sm text-gray-600">Foto (opsiyonel)</label>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  type="file"
                  accept="image/*"
                  onChange={(e) => toBase64(e.target.files?.[0], (b64) => setIhbar((r) => ({ ...r, foto: b64 })))}
                />
                {ihbar.foto && <img src={ihbar.foto} alt="önizleme" className="mt-2 max-h-48 w-full rounded-lg object-cover" />}

                <h3 className="mb-2 mt-4 font-semibold">3) İletişim</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="rounded-lg border px-3 py-2"
                    placeholder="Ad Soyad (ops.)"
                    value={ihbar.adSoyad ?? ""}
                    onChange={(e) => setIhbar((r) => ({ ...r, adSoyad: e.target.value }))}
                  />
                  <input
                    className="rounded-lg border px-3 py-2"
                    placeholder="Telefon (ops.)"
                    value={ihbar.telefon ?? ""}
                    onChange={(e) => setIhbar((r) => ({ ...r, telefon: e.target.value }))}
                  />
                </div>
                <label className="mt-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={ihbar.kabulEdiyorum}
                    onChange={(e) => setIhbar((r) => ({ ...r, kabulEdiyorum: e.target.checked }))}
                  />
                  Ekiplerin gerekirse benimle iletişime geçmesini kabul ediyorum.
                </label>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                    İhbarı Gönder
                  </button>
                  <a className="rounded-lg bg-red-600 px-4 py-2 text-white hover:opacity-95" href="tel:153">
                    Alo 153
                  </a>
                  <a className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95" href="tel:112">
                    112 Acil
                  </a>
                </div>

                <Callout title="Trafikte Güvenlik" tone="warning">
                  Önce kendi güvenliğiniz. Yoğun trafikte risk almayın; hayvanı yola sürüklemeye çalışmayın. Ekipler yönlendirme
                  yapacaktır.
                </Callout>
              </form>

              {/* sağ: harita + son ihbarlar */}
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border">
                  <iframe title="Harita" className="h-72 w-full" src={osmEmbed(center)} loading="lazy" />
                </div>
                <div className="rounded-xl border bg-white p-4">
                  <h3 className="mb-2 font-semibold">Son İhbarlar</h3>
                  {ihbarlar.length === 0 ? (
                    <p className="text-sm text-gray-600">Henüz kayıt yok.</p>
                  ) : (
                    <ul className="space-y-2">
                      {ihbarlar.slice(0, 6).map((r) => (
                        <li key={r.id} className="rounded-lg border p-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {r.hayvan.toUpperCase()} • {r.tur}
                            </span>
                            <span className="text-gray-600">{new Date(r.zaman).toLocaleString()}</span>
                          </div>
                          <div className="text-gray-700">
                            {r.adres || `${r.coords.lat.toFixed(4)}, ${r.coords.lng.toFixed(4)}`}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* ——— Kayıp/Bulundu Panosu ——— */}
          <Section id="pano" title="Kayıp / Bulundu Panosu (Onaylı)">
            <div className="grid gap-4 md:grid-cols-[340px_1fr]">
              {/* başvuru formu */}
              <form onSubmit={submitPet} className="rounded-xl border bg-white p-4">
                <h3 className="mb-2 font-semibold">İlan Gönder</h3>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="rounded-lg border px-3 py-2"
                    value={yeni.durum}
                    onChange={(e) => setYeni((s) => ({ ...s, durum: e.target.value as PostType }))}
                  >
                    <option value="kayıp">Kayıp</option>
                    <option value="bulundu">Bulundu</option>
                  </select>
                  <select
                    className="rounded-lg border px-3 py-2"
                    value={yeni.tur}
                    onChange={(e) => setYeni((s) => ({ ...s, tur: e.target.value as PetType }))}
                  >
                    <option value="kedi">Kedi</option>
                    <option value="köpek">Köpek</option>
                    <option value="kuş">Kuş</option>
                    <option value="tavşan">Tavşan</option>
                    <option value="diğer">Diğer</option>
                  </select>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    className="rounded-lg border px-3 py-2"
                    placeholder="İsim (ops.)"
                    value={yeni.isim ?? ""}
                    onChange={(e) => setYeni((s) => ({ ...s, isim: e.target.value }))}
                  />
                  <input
                    className="rounded-lg border px-3 py-2"
                    placeholder="Cinsi/ırkı (ops.)"
                    value={yeni.cins ?? ""}
                    onChange={(e) => setYeni((s) => ({ ...s, cins: e.target.value }))}
                  />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <select
                    className="rounded-lg border px-3 py-2"
                    value={yeni.cinsiyet ?? "bilinmiyor"}
                    onChange={(e) => setYeni((s) => ({ ...s, cinsiyet: e.target.value as Sex }))}
                  >
                    <option value="erkek">Erkek</option>
                    <option value="dişi">Dişi</option>
                    <option value="bilinmiyor">Bilinmiyor</option>
                  </select>
                  <input
                    className="rounded-lg border px-3 py-2"
                    placeholder="Yaş (ops.)"
                    value={yeni.yas ?? ""}
                    onChange={(e) => setYeni((s) => ({ ...s, yas: e.target.value }))}
                  />
                  <input
                    className="rounded-lg border px-3 py-2"
                    placeholder="Renk/ayırt edici"
                    value={yeni.renkAyirtici ?? ""}
                    onChange={(e) => setYeni((s) => ({ ...s, renkAyirtici: e.target.value }))}
                  />
                </div>

                <label className="mt-2 block text-sm text-gray-600">Mikroçip No (ops.)</label>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  value={yeni.microchip ?? ""}
                  onChange={(e) => setYeni((s) => ({ ...s, microchip: e.target.value }))}
                />

                <label className="mt-2 block text-sm text-gray-600">Son görüldüğü adres</label>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  value={yeni.sonGorulmeAdres ?? ""}
                  onChange={(e) => setYeni((s) => ({ ...s, sonGorulmeAdres: e.target.value }))}
                />

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    className="rounded-lg border px-3 py-2"
                    type="datetime-local"
                    value={yeni.sonGorulmeZaman ?? ""}
                    onChange={(e) => setYeni((s) => ({ ...s, sonGorulmeZaman: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={useMyLocation}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:opacity-95"
                  >
                    Konumumu Kullan
                  </button>
                </div>

                <label className="mt-2 block text-sm text-gray-600">İletişim (telefon/e-posta)</label>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  value={yeni.iletisim ?? ""}
                  onChange={(e) => setYeni((s) => ({ ...s, iletisim: e.target.value }))}
                />

                <label className="mt-2 block text-sm text-gray-600">Açıklama</label>
                <textarea
                  className="min-h-[80px] w-full rounded-lg border px-3 py-2"
                  value={yeni.aciklama ?? ""}
                  onChange={(e) => setYeni((s) => ({ ...s, aciklama: e.target.value }))}
                />

                <label className="mt-2 block text-sm text-gray-600">Fotoğraf</label>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  type="file"
                  accept="image/*"
                  onChange={(e) => toBase64(e.target.files?.[0], (b64) => setYeni((s) => ({ ...s, foto: b64 })))}
                />
                {yeni.foto && <img src={yeni.foto} alt="önizleme" className="mt-2 max-h-48 w-full rounded-lg object-cover" />}

                <div className="mt-3">
                  <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:opacity-95" type="submit">
                    Onaya Gönder
                  </button>
                  <p className="mt-1 text-xs text-gray-500">
                    Not: Kötüye kullanımın önüne geçmek için tüm ilanlar önce moderasyon onayından geçer.
                  </p>
                </div>
              </form>

              {/* pano + filtre */}
              <div className="space-y-4">
                <div className="rounded-xl border bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">Yayınlanan İlanlar</h3>
                    <div className="flex items-center gap-2">
                      <input
                        className="rounded-lg border px-3 py-2"
                        placeholder="Ara (isim/renk/mahalle)"
                        value={filtre.q}
                        onChange={(e) => setFiltre((f) => ({ ...f, q: e.target.value }))}
                      />
                      <select
                        className="rounded-lg border px-3 py-2"
                        value={filtre.durum}
                        onChange={(e) => setFiltre((f) => ({ ...f, durum: e.target.value as any }))}
                      >
                        <option value="hepsi">Hepsi</option>
                        <option value="kayıp">Kayıp</option>
                        <option value="bulundu">Bulundu</option>
                      </select>
                      <select
                        className="rounded-lg border px-3 py-2"
                        value={filtre.tur}
                        onChange={(e) => setFiltre((f) => ({ ...f, tur: e.target.value as any }))}
                      >
                        <option value="hepsi">Tür (hepsi)</option>
                        <option value="kedi">Kedi</option>
                        <option value="köpek">Köpek</option>
                        <option value="kuş">Kuş</option>
                        <option value="tavşan">Tavşan</option>
                        <option value="diğer">Diğer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {filteredApproved.length === 0 ? (
                  <p className="rounded-xl border bg-white p-4 text-sm text-gray-600">Henüz onaylanmış ilan yok.</p>
                ) : (
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {filteredApproved.map((p) => (
                      <li key={p.id} className="rounded-xl border bg-white p-3">
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
                          {p.foto ? (
                            <img src={p.foto} alt={p.isim || "ilan"} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">Fotoğraf yok</div>
                          )}
                        </div>
                        <div className="mt-2 flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold">
                              {p.isim || (p.durum === "kayıp" ? "Kayıp" : "Bulundu")} – {p.tur.toUpperCase()}
                            </h4>
                            <p className="text-sm text-gray-600">{p.sonGorulmeAdres || "Adres belirtilmemiş"}</p>
                            <p className="text-xs text-gray-500">
                              {p.sonGorulmeZaman ? new Date(p.sonGorulmeZaman).toLocaleString() : ""}
                            </p>
                          </div>
                          {p.coords && (
                            <a
                              className="rounded-lg bg-gray-900 px-3 py-2 text-xs text-white hover:opacity-90"
                              href={`https://www.openstreetmap.org/?mlat=${p.coords.lat}&mlon=${p.coords.lng}#map=17/${p.coords.lat}/${p.coords.lng}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Haritada Aç
                            </a>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.cins && <Badge tone="neutral">{p.cins}</Badge>}
                          {p.cinsiyet && <Badge tone="neutral">{p.cinsiyet}</Badge>}
                          {p.renkAyirtici && <Badge tone="neutral">{p.renkAyirtici}</Badge>}
                          <Badge tone={p.durum === "kayıp" ? "danger" : "success"}>{p.durum.toUpperCase()}</Badge>
                        </div>
                        {p.iletisim && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-600">İletişim:</span> {p.iletisim}
                          </div>
                        )}
                        {p.aciklama && <div className="mt-1 text-sm text-gray-700">{p.aciklama}</div>}
                      </li>
                    ))}
                  </ul>
                )}

                {/* moderasyon kutusu */}
                <div className="rounded-xl border bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold">Moderatör</h3>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={mod} onChange={(e) => setMod(e.target.checked)} /> Modu Aç
                    </label>
                  </div>
                  {!mod ? (
                    <p className="text-sm text-gray-600">Mod açık değil. Onaya düşen ilanlar burada görünür.</p>
                  ) : pending.length === 0 ? (
                    <p className="text-sm text-gray-600">Bekleyen ilan yok.</p>
                  ) : (
                    <ul className="space-y-3">
                      {pending.map((p) => (
                        <li key={p.id} className="rounded-lg border p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-medium">
                                {p.durum.toUpperCase()} – {p.tur.toUpperCase()} {p.isim ? `• ${p.isim}` : ""}
                              </div>
                              <div className="text-sm text-gray-600">{p.sonGorulmeAdres}</div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => approve(p.id)}
                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:opacity-95"
                                type="button"
                              >
                                Onayla
                              </button>
                              <button
                                onClick={() => reject(p.id)}
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-white hover:opacity-95"
                                type="button"
                              >
                                Reddet
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* ——— SSS ——— */}
          <Section id="sss" title="Sık Sorulanlar">
            <details className="group py-3">
              <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-emerald-400">
                <span className="font-medium">Acil durumda önce kimi aramalıyım?</span>
              </summary>
              <div className="prose prose-sm max-w-none py-2 text-gray-700">
                Trafik/yaralanma varsa <strong>112</strong>; sahipsiz hayvan için <strong>Alo 153</strong> ve bu sayfadaki ACİL PATİ’yi
                kullanın.
              </div>
            </details>
            <details className="group py-3">
              <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-emerald-400">
                <span className="font-medium">Bulduğum hayvanı panoya ekledim, sonra ne olacak?</span>
              </summary>
              <div className="prose prose-sm max-w-none py-2 text-gray-700">
                İlan <strong>onaya</strong> düşer. Uygun görülürse panoda yayınlanır; iletişim bilgileriniz sadece ilan kartında görünür.
              </div>
            </details>
            <details className="group py-3">
              <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-emerald-400">
                <span className="font-medium">Kötüye kullanım olursa?</span>
              </summary>
              <div className="prose prose-sm max-w-none py-2 text-gray-700">
                Tüm ilanlar moderasyondan geçer. Gerektiğinde kimlik/kanıt isteyebilir veya ilanı kaldırabiliriz.
              </div>
            </details>
          </Section>

          {/* ——— İletişim ——— */}
          <Section id="iletisim" title="İletişim">
            <p>
              <strong>Veteriner İşleri Müdürlüğü</strong>
            </p>
            <p>Alo 153 • Çağrı Merkezi: 444 0 XXX</p>
            <p>
              E-posta:{" "}
              <a className="text-emerald-700 underline" href="mailto:veteriner@birimajans.bel.tr">
                veteriner@birimajans.bel.tr
              </a>
            </p>
            <p>Adres: Birim Ajans Belediyesi Hizmet Binası, [adres]</p>
            <div className="mt-3 flex gap-2">
              <Link
                href="/ebelediye/basvuru?service=randevu-kisirlastirma"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95"
              >
                Kısırlaştırma/Aşı Randevusu
              </Link>
              <Link href="/sahiplendirme" className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-95">
                Sahiplendirme
              </Link>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
