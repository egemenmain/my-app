// app/hizmetler/arac-talepleri/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

/* ---------- Basit UI ---------- */
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

/* ---------- Tipler ---------- */
type TalepTuru = "hasta" | "cenaze" | "etkinlik" | "diger";
type TalepDurum = "pending" | "received" | "scheduled" | "rejected";

type VehicleRequest = {
    id: string;
    tur: TalepTuru;
    adSoyad: string;
    tckn?: string;
    telefon: string;
    email?: string;
    hizmetTarihi: string;
    saat: string;
    baslangicAdres: string;
    varisAdres?: string;
    kisiSayisi?: number;
    belge?: string;
    not?: string;
    createdAt: string;
    durum: TalepDurum;
    oncelik: "normal" | "oncelikli";
    ucretTL: number;
};

/* ---------- Storage parse ---------- */
const toDurum = (v: any): TalepDurum =>
    v === "received" || v === "scheduled" || v === "rejected" || v === "pending" ? v : "pending";
const toTur = (v: any): TalepTuru =>
    v === "hasta" || v === "cenaze" || v === "etkinlik" || v === "diger" ? v : "diger";

function safeParseReq(json: string): VehicleRequest[] {
    try {
        const arr = JSON.parse(json) as any[];
        if (!Array.isArray(arr)) return [];
        return arr.map(
            (r: any): VehicleRequest => ({
                id: String(r?.id ?? crypto.randomUUID()),
                tur: toTur(r?.tur),
                adSoyad: String(r?.adSoyad ?? ""),
                tckn: r?.tckn ?? undefined,
                telefon: String(r?.telefon ?? ""),
                email: r?.email ?? undefined,
                hizmetTarihi: String(r?.hizmetTarihi ?? ""),
                saat: String(r?.saat ?? ""),
                baslangicAdres: String(r?.baslangicAdres ?? ""),
                varisAdres: r?.varisAdres ?? undefined,
                kisiSayisi: typeof r?.kisiSayisi === "number" ? r.kisiSayisi : undefined,
                belge: r?.belge ?? undefined,
                not: r?.not ?? undefined,
                createdAt: String(r?.createdAt ?? new Date().toISOString()),
                durum: toDurum(r?.durum),
                oncelik: r?.oncelik === "oncelikli" ? "oncelikli" : "normal",
                ucretTL: typeof r?.ucretTL === "number" ? r.ucretTL : 0,
            })
        );
    } catch {
        return [];
    }
}

/* ---------- Yardimcilar ---------- */
const formatSaat = (h: string) => (h ? h.slice(0, 5) : "");
const tahminiUcret = (tur: TalepTuru, kisi?: number) => {
    if (tur === "cenaze" || tur === "hasta") return 0;
    if (tur === "etkinlik") {
        const k = Math.max(1, kisi ?? 1);
        return 250 + (k > 8 ? 150 : 0);
    }
    return 100;
};

/* ================================================================== */

export default function AracTalepleriPage() {
    const [tur, setTur] = useState<TalepTuru>("hasta");
    const [r, setR] = useState<VehicleRequest>({
        id: crypto.randomUUID(),
        tur: "hasta",
        adSoyad: "",
        telefon: "",
        email: "",
        tckn: "",
        hizmetTarihi: "",
        saat: "",
        baslangicAdres: "",
        varisAdres: "",
        kisiSayisi: undefined,
        belge: undefined,
        not: "",
        createdAt: new Date().toISOString(),
        durum: "pending",
        oncelik: "normal",
        ucretTL: 0,
    });

    const [kayitlar, setKayitlar] = useState<VehicleRequest[]>([]);
    const [filter, setFilter] = useState<TalepTuru | "hepsi">("hepsi");

    useEffect(() => {
        try {
            const raw = localStorage.getItem("arac-talepleri");
            if (raw) setKayitlar(safeParseReq(raw));
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        setR((x) => ({
            ...x,
            tur,
            belge: undefined,
            kisiSayisi: tur === "etkinlik" ? x.kisiSayisi ?? 10 : undefined,
            varisAdres: tur === "cenaze" || tur === "etkinlik" ? x.varisAdres ?? "" : "",
            ucretTL: tahminiUcret(tur, x.kisiSayisi),
        }));
    }, [tur]);

    useEffect(() => {
        setR((x) => ({ ...x, ucretTL: tahminiUcret(x.tur, x.kisiSayisi) }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [r.kisiSayisi, r.tur]);

    const toBase64 = (file?: File, cb?: (b64: string) => void) => {
        if (!file) return cb?.("");
        const reader = new FileReader();
        reader.onload = () => cb?.(reader.result as string);
        reader.readAsDataURL(file);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!r.adSoyad || !r.telefon || !r.hizmetTarihi || !r.saat || !r.baslangicAdres) {
            alert("Zorunlu alanlari doldurun.");
            return;
        }
        if (r.tur === "hasta" && !r.varisAdres) {
            alert("Hasta/Engelli nakil icin varis adresi zorunludur.");
            return;
        }

        const yeni: VehicleRequest = {
            ...r,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            durum: "received",
            oncelik: r.tur === "cenaze" ? "oncelikli" : r.oncelik,
            ucretTL: tahminiUcret(r.tur, r.kisiSayisi),
        };

        const list = [yeni, ...kayitlar].slice(0, 100);
        setKayitlar(list);
        try {
            localStorage.setItem("arac-talepleri", JSON.stringify(list));
        } catch {
            /* ignore */
        }
        alert(`Talebiniz alindi. Basvuru No: ${yeni.id.slice(0, 8).toUpperCase()}`);
        setR((x) => ({
            ...x,
            adSoyad: "",
            telefon: "",
            email: "",
            tckn: "",
            hizmetTarihi: "",
            saat: "",
            baslangicAdres: "",
            varisAdres: "",
            kisiSayisi: x.tur === "etkinlik" ? 10 : undefined,
            belge: undefined,
            not: "",
        }));
    };

    const filtered = useMemo(
        () => kayitlar.filter((k) => (filter === "hepsi" ? true : k.tur === filter)),
        [kayitlar, filter]
    );

    const yil = new Date().getFullYear();

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-yellow-50 via-white to-blue-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold">Arac Talepleri</h1>
                        <p className="mt-3 text-gray-700">
                            Hasta/Engelli Nakil, Cenaze Araci ve Etkinlik Servisi icin talep
                            olusturabilirsiniz. Asagida genis SSS ve belgeler-özet tablo var.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="success">Oncelik: Cenaze</Badge>
                            <Badge tone="info">Hasta/Engelli Nakil: Ucretsiz</Badge>
                            <Badge tone="warning">Etkinlik Servisi: Ucretli</Badge>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1582418702059-71a5f1d2a8c6?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* Bilgi seridi */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>🕒</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">En az 24 saat once</div>
                        <div className="text-sm text-gray-600">Etkinlik servisi</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>⚕️</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">112 Acil degil</div>
                        <div className="text-sm text-gray-600">Acil icin 112, planli nakil icin bu sayfa</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span>📍</span>
                    <div>
                        <div className="text-lg font-semibold leading-none">Ilce ici oncelikli</div>
                        <div className="text-sm text-gray-600">Disi kapasiteye bagli</div>
                    </div>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["basvuru", "Hizli Basvuru"],
                            ["kurallar", "Kapasite & Kurallar"],
                            ["ucret", "Belgeler & Ucret Tablosu"],
                            ["sss", "Sik Sorulanlar"],
                            ["kayitlarim", "Basvurularim"],
                        ].map(([id, label]) => (
                            <li key={id}>
                                <a
                                    href={`#${id}`}
                                    className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100"
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Icerik */}
                <main className="space-y-10">
                    {/* ---------- HIZLI BASVURU ---------- */}
                    <Section id="basvuru" title="Hizli Basvuru">
                        <div className="mb-3 flex flex-wrap gap-2">
                            <button
                                onClick={() => setTur("hasta")}
                                className={`rounded-lg px-3 py-2 text-sm ${tur === "hasta" ? "bg-emerald-600 text-white" : "bg-gray-100"
                                    }`}
                                type="button"
                            >
                                Hasta / Engelli Nakil
                            </button>
                            <button
                                onClick={() => setTur("cenaze")}
                                className={`rounded-lg px-3 py-2 text-sm ${tur === "cenaze" ? "bg-emerald-600 text-white" : "bg-gray-100"
                                    }`}
                                type="button"
                            >
                                Cenaze Araci
                            </button>
                            <button
                                onClick={() => setTur("etkinlik")}
                                className={`rounded-lg px-3 py-2 text-sm ${tur === "etkinlik" ? "bg-emerald-600 text-white" : "bg-gray-100"
                                    }`}
                                type="button"
                            >
                                Etkinlik Servisi
                            </button>
                            <button
                                onClick={() => setTur("diger")}
                                className={`rounded-lg px-3 py-2 text-sm ${tur === "diger" ? "bg-emerald-600 text-white" : "bg-gray-100"
                                    }`}
                                type="button"
                            >
                                Diger
                            </button>
                        </div>

                        <form onSubmit={submit} className="grid gap-4 rounded-xl border bg-white p-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="block text-sm text-gray-600">Ad Soyad *</label>
                                <input
                                    className="w-full rounded-lg border px-3 py-2"
                                    value={r.adSoyad}
                                    onChange={(e) => setR({ ...r, adSoyad: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm text-gray-600">Telefon *</label>
                                <input
                                    className="w-full rounded-lg border px-3 py-2"
                                    value={r.telefon}
                                    onChange={(e) => setR({ ...r, telefon: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm text-gray-600">E-posta</label>
                                <input
                                    className="w-full rounded-lg border px-3 py-2"
                                    value={r.email ?? ""}
                                    onChange={(e) => setR({ ...r, email: e.target.value })}
                                />
                            </div>
                            {tur !== "etkinlik" && (
                                <div className="space-y-2">
                                    <label className="block text-sm text-gray-600">
                                        T.C. Kimlik No (teyit icin)
                                    </label>
                                    <input
                                        className="w-full rounded-lg border px-3 py-2"
                                        value={r.tckn ?? ""}
                                        onChange={(e) => setR({ ...r, tckn: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm text-gray-600">Hizmet Tarihi *</label>
                                <input
                                    type="date"
                                    className="w-full rounded-lg border px-3 py-2"
                                    value={r.hizmetTarihi}
                                    onChange={(e) => setR({ ...r, hizmetTarihi: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm text-gray-600">Saat *</label>
                                <input
                                    type="time"
                                    className="w-full rounded-lg border px-3 py-2"
                                    value={r.saat}
                                    onChange={(e) => setR({ ...r, saat: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-2 grid gap-2 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="block text-sm text-gray-600">Baslangic Adresi *</label>
                                    <input
                                        className="w-full rounded-lg border px-3 py-2"
                                        value={r.baslangicAdres}
                                        onChange={(e) => setR({ ...r, baslangicAdres: e.target.value })}
                                    />
                                </div>
                                {(tur === "cenaze" || tur === "etkinlik" || tur === "hasta") && (
                                    <div className="space-y-2">
                                        <label className="block text-sm text-gray-600">
                                            {tur === "etkinlik" ? "Etkinlik/Varis Adresi" : "Varis Adresi"}{" "}
                                            {tur === "hasta" ? "*" : ""}
                                        </label>
                                        <input
                                            className="w-full rounded-lg border px-3 py-2"
                                            value={r.varisAdres ?? ""}
                                            onChange={(e) => setR({ ...r, varisAdres: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            {tur === "etkinlik" && (
                                <div className="space-y-2">
                                    <label className="block text-sm text-gray-600">Kisi Sayisi</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="w-full rounded-lg border px-3 py-2"
                                        value={r.kisiSayisi ?? 10}
                                        onChange={(e) =>
                                            setR({ ...r, kisiSayisi: parseInt(e.target.value || "1", 10) })
                                        }
                                    />
                                </div>
                            )}

                            {tur === "hasta" && (
                                <div className="space-y-2">
                                    <label className="block text-sm text-gray-600">
                                        Rapor/Refakat bilgisi (opsiyonel belge)
                                    </label>
                                    <input
                                        type="file"
                                        className="w-full rounded-lg border px-3 py-2"
                                        onChange={(e) =>
                                            toBase64(e.target.files?.[0], (b64) => setR({ ...r, belge: b64 }))
                                        }
                                    />
                                </div>
                            )}

                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-sm text-gray-600">Not</label>
                                <textarea
                                    className="min-h-[80px] w-full rounded-lg border px-3 py-2"
                                    value={r.not ?? ""}
                                    onChange={(e) => setR({ ...r, not: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-3">
                                <div className="text-sm text-gray-700">
                                    Tahmini Ucret:{" "}
                                    <strong>{r.ucretTL.toLocaleString("tr-TR")} TL</strong>{" "}
                                    {r.tur === "etkinlik" ? "(mesafe/sureye gore netlesir)" : "(ucretsiz hizmet)"}
                                </div>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:opacity-95"
                                >
                                    Talebi Gonder
                                </button>
                            </div>
                        </form>

                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <Callout title="Cenaze Araci" tone="info">
                                7/24. Ilce ici oncelikli; ilce disi icin Mezarliklar Mudurlugu ile koordinasyon
                                yapilabilir.
                            </Callout>
                            <Callout title="Hasta/Engelli Nakil" tone="success">
                                Acil durumda 112. Bu hizmet planli nakildir; sedye/sandalye ihtiyacini notta belirtin.
                            </Callout>
                            <Callout title="Etkinlik Servisi" tone="warning">
                                En az 24 saat once talep. Kamu yarari varsa indirim/sponsorluk uygulanabilir.
                            </Callout>
                        </div>
                    </Section>

                    {/* ---------- Kurallar ---------- */}
                    <Section id="kurallar" title="Kapasite, Oncelik ve Kosullar">
                        <ul className="list-disc space-y-2 pl-6 text-gray-700">
                            <li>
                                <strong>Oncelik sirasi:</strong> Cenaze &gt; Hasta/Engelli Nakil &gt; Resmi/toplumsal
                                fayda etkinlikleri &gt; Diger.
                            </li>
                            <li>
                                <strong>Ilce ici esas:</strong> Ilce disi talepler arac/ekip uygunluguna gore
                                onaylanir.
                            </li>
                            <li>
                                <strong>Calisma saatleri:</strong> Etkinlik servisi 06:00-23:00; gece yalnizca
                                oncelikli vakalar.
                            </li>
                            <li>
                                <strong>Iptal/degisiklik:</strong> En gec 2 saat once bildirin. Habersiz iptal
                                tekrarinda onceligi etkileyebilir.
                            </li>
                        </ul>
                    </Section>

                    {/* ---------- Belgeler & Ucret ---------- */}
                    <Section id="ucret" title="Belgeler ve Ucret Tablosu (Ozet)">
                        <div className="overflow-auto rounded-xl border bg-white">
                            <table className="min-w-[640px] w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr className="text-left">
                                        <th className="p-3">Hizmet</th>
                                        <th className="p-3">Gerekli Belgeler</th>
                                        <th className="p-3">Ucret</th>
                                        <th className="p-3">Not</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t">
                                        <td className="p-3 font-medium">Hasta/Engelli Nakil</td>
                                        <td className="p-3">Kimlik, adres; varsa rapor-refakat</td>
                                        <td className="p-3">Ucretsiz</td>
                                        <td className="p-3">Planli nakil; acil icin 112</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="p-3 font-medium">Cenaze Araci</td>
                                        <td className="p-3">Kimlik, defin/mezarlik bilgisi</td>
                                        <td className="p-3">Ucretsiz</td>
                                        <td className="p-3">7/24; ilce ici oncelik</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="p-3 font-medium">Etkinlik Servisi</td>
                                        <td className="p-3">Etkinlik yazisi/davet, kisi sayisi</td>
                                        <td className="p-3">250-400 TL (tahmini)</td>
                                        <td className="p-3">Kamu yarari varsa indirim/sponsorluk</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Not: Tutarlar ornektir; mesafe ve sureye gore netlesir.
                        </p>
                    </Section>

                    {/* ---------- SSS ---------- */}
                    <Section id="sss" title="Sik Sorulanlar">
                        {[
                            {
                                q: "Acil hasta icin bu formu mu doldurayim?",
                                a: "Hayir. Hayati risk varsa 112 Acil'i arayin. Bu sayfa planli nakil icindir.",
                            },
                            {
                                q: "Hastaneden eve nakil yapiyor musunuz?",
                                a: "Evet. Taburcu tarih/saatini ve refakat bilgisini yazmaniz yeterli.",
                            },
                            {
                                q: "Bina ici tasima var mi?",
                                a: "Kapi teslim alinir; bina ici tasima kural olarak verilmez. Asansor yoksa sedye/sandalye ihtiyacini belirtin.",
                            },
                            {
                                q: "Refakatci alinir mi?",
                                a: "Arac tipine gore 1-2 refakatci alinabilir. Sayiyi basvuruda belirtin.",
                            },
                            {
                                q: "Ilce disina hizmet veriliyor mu?",
                                a: "Oncelik ilce icidir; disi arac/ekip uygunluguna gore onaylanir.",
                            },
                            {
                                q: "Etkinlik servisi son dakika olur mu?",
                                a: "Kapasite uygunsa olabilir; onerilen basvuru suresi en az 24 saattir.",
                            },
                            {
                                q: "Etkinlik ucreti nasil hesaplanir?",
                                a: "Mesafe, sure ve kisi sayisina gore; kamu yarari varsa indirim/sponsorluk olabilir.",
                            },
                            {
                                q: "Cenaze araci 7/24 mu?",
                                a: "Evet. Ilce disi icin Mezarliklar birimiyle koordinasyon yapilir.",
                            },
                            {
                                q: "Iptal/degisiklik nasil yaparim?",
                                a: "Alo 153 ya da 444 0 XXX; en gec 2 saat once bildirin.",
                            },
                            {
                                q: "Talep durumumu nasil takip ederim?",
                                a: "Basvuru numarasi ile Alo 153/444 0 XXX uzerinden. Bu demoda yerel 'Basvurularim' bolumunden kayitlar gorunur.",
                            },
                            {
                                q: "Arac kac kisilik?",
                                a: "Talebe gore minibues/midibues/hasta nakil/cenaze araci yonlendirilir.",
                            },
                            {
                                q: "Adres bulunamazsa?",
                                a: "Ekip sizi arar. Acik adres ve yakin referans noktasi yazin (okul, cami, park vb.).",
                            },
                        ].map((item) => (
                            <details key={item.q} className="group py-3">
                                <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-emerald-400">
                                    <span className="font-medium">{item.q}</span>
                                </summary>
                                <div className="prose prose-sm max-w-none py-2 text-gray-700">{item.a}</div>
                            </details>
                        ))}

                        <Callout title="Onemli" tone="warning">
                            Adres ve saat bilgisini net yazin. Bina adi/blok/kat/daire ve yakin POI (okul, cami,
                            park) eklemek sureci hizlandirir.
                        </Callout>
                    </Section>

                    {/* ---------- Basvurularim (yerel) ---------- */}
                    <Section id="kayitlarim" title="Basvurularim (yerel cihazinizda saklanir)">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <select
                                className="rounded-lg border px-3 py-2 text-sm"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as any)}
                            >
                                <option value="hepsi">Hepsi</option>
                                <option value="hasta">Hasta/Engelli</option>
                                <option value="cenaze">Cenaze</option>
                                <option value="etkinlik">Etkinlik</option>
                                <option value="diger">Diger</option>
                            </select>
                            <button
                                className="rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
                                type="button"
                                onClick={() => {
                                    if (confirm("Tum yerel kayitlar silinsin mi?")) {
                                        localStorage.removeItem("arac-talepleri");
                                        setKayitlar([]);
                                    }
                                }}
                            >
                                Kayitlari Temizle
                            </button>
                        </div>

                        {filtered.length === 0 ? (
                            <p className="rounded-xl border bg-white p-4 text-sm text-gray-600">
                                Henuz kayit yok.
                            </p>
                        ) : (
                            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {filtered.map((k) => (
                                    <li key={k.id} className="rounded-xl border bg-white p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="font-semibold capitalize">
                                                    {k.tur === "hasta"
                                                        ? "Hasta/Engelli Nakil"
                                                        : k.tur === "cenaze"
                                                            ? "Cenaze Araci"
                                                            : k.tur === "etkinlik"
                                                                ? "Etkinlik Servisi"
                                                                : "Diger"}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {k.adSoyad} • {k.telefon}
                                                </div>
                                            </div>
                                            <Badge
                                                tone={
                                                    k.durum === "rejected"
                                                        ? "danger"
                                                        : k.durum === "scheduled"
                                                            ? "success"
                                                            : "info"
                                                }
                                            >
                                                {k.durum.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-700">
                                            <div>
                                                Tarih: <strong>{k.hizmetTarihi}</strong>
                                            </div>
                                            <div>
                                                Saat: <strong>{formatSaat(k.saat)}</strong>
                                            </div>
                                            <div className="col-span-2">Baslangic: {k.baslangicAdres}</div>
                                            {k.varisAdres && (
                                                <div className="col-span-2">Varis: {k.varisAdres}</div>
                                            )}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                            Basvuru No: {k.id.slice(0, 8).toUpperCase()} •{" "}
                                            {new Date(k.createdAt).toLocaleString()}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-600">
                                            Tahmini Ucret: <strong>{k.ucretTL.toLocaleString("tr-TR")} TL</strong>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Section>

                    {/* ---------- Iletisim ---------- */}
                    <Section id="iletisim" title="Iletisim">
                        <p>
                            <strong>Ulasim Hizmetleri / Destek Hizmetleri Mudurlugu</strong>
                        </p>
                        <p>Cagri Merkezi: 444 0 XXX • Alo 153</p>
                        <p>E-posta: ulasim@birimajans.bel.tr</p>
                        <p>Adres: Belediye Hizmet Binasi, [adres]</p>
                        <div className="mt-2 text-xs text-gray-500">© {yil} Birim Ajans Belediyesi</div>
                    </Section>
                </main>
            </div>
        </div>
    );
}
