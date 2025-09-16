// app/hizmetler/is-muracaatlari-istihdam-merkezi/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

/* basit yardımcılar */
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
    tone?: "neutral" | "success" | "warning" | "info";
}) => {
    const map = {
        neutral: "bg-gray-100 text-gray-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-amber-100 text-amber-900",
        info: "bg-blue-100 text-blue-800",
    } as const;
    return (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${map[tone]}`}>
            {children}
        </span>
    );
};

const Callout = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
        <p className="mb-1 font-semibold">{title}</p>
        <div className="text-gray-700">{children}</div>
    </div>
);

export const metadata: Metadata = {
    title: "İş Müracaatları (İstihdam Merkezi) | Birim Ajans Belediyesi",
    description:
        "İş arayan ve işverenlere ücretsiz danışmanlık, ilan eşleştirme, CV atölyesi, mülakat provası, kurs ve fuar duyuruları.",
};

export default function Page() {
    const jobs = [
        { t: "Çağrı Merkezi Müşteri Temsilcisi", c: "Yerel İş Ortağı AŞ", l: "Merkez / İlçe", y: "Tam Zamanlı" },
        { t: "Depo Personeli", c: "Lojistik Ltd.", l: "OSB / İlçe", y: "Tam Zamanlı" },
        { t: "Ön Muhasebe Elemanı", c: "Perakende AŞ", l: "Merkez / İlçe", y: "Tam Zamanlı" },
        { t: "Grafik Tasarım Stajyeri", c: "Ajans X", l: "Merkez / İlçe", y: "Staj" },
        { t: "Barista", c: "Kafe Y", l: "Sahil / İlçe", y: "Yarı Zamanlı" },
        { t: "Temizlik Personeli", c: "Tesis Hizmetleri", l: "Merkez / İlçe", y: "Tam Zamanlı" },
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">İş Müracaatları (İstihdam Merkezi)</h1>
                <p className="mt-2 text-gray-600">
                    İş arayanlara ve işverenlere <strong>ücretsiz</strong> danışmanlık, ilan eşleştirme ve eğitim desteği.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        href="/e-belediye/basvuru?service=istihdam"
                        className="rounded-xl bg-blue-600 px-5 py-3 text-white shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    >
                        İş Başvurusu Yap
                    </Link>
                    <Link
                        href="/kariyer/cv-yukle"
                        className="rounded-xl bg-gray-900 px-5 py-3 text-white shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        CV Yükle / Güncelle
                    </Link>
                    <Link
                        href="/randevu?birim=istihdam-merkezi"
                        className="rounded-xl bg-emerald-600 px-5 py-3 text-white shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                    >
                        Danışman Randevusu
                    </Link>
                    <Link
                        href="/isveren/ilan-ver"
                        className="rounded-xl bg-indigo-600 px-5 py-3 text-white shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                    >
                        İşveren İlan Ver
                    </Link>
                    <Link
                        href="/basvuru-takip"
                        className="rounded-xl bg-white px-5 py-3 text-gray-900 shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                    >
                        Başvuru Takip
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["ozet", "Özet"],
                            ["kimler", "Kimler Yararlanabilir?"],
                            ["is-arayan", "İş Arayan İçin"],
                            ["isveren", "İşveren İçin"],
                            ["ornek-ilanlar", "Örnek İlanlar"],
                            ["belgeler", "Gerekli Belgeler"],
                            ["kanallar", "Başvuru Kanalları"],
                            ["surec", "Süreç & SLA"],
                            ["ucret", "Ücret"],
                            ["erisilebilirlik", "Erişilebilirlik"],
                            ["kvkk", "KVKK"],
                            ["sss", "SSS"],
                            ["duyurular", "Duyurular"],
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

                <main className="space-y-10">
                    <Section id="ozet" title="Özet">
                        <p>
                            İstihdam Merkezimiz; iş arayanlar için <strong>kariyer danışmanlığı</strong>,{" "}
                            <strong>CV & mülakat hazırlığı</strong>, <strong>kurs/sertifika</strong> yönlendirmesi; işverenler için{" "}
                            <strong>ücretsiz ilan</strong>, <strong>aday tarama</strong> ve <strong>teşvik bilgilendirmesi</strong> sağlar.
                        </p>
                    </Section>

                    <Section id="kimler" title="Kimler Yararlanabilir?">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>İlçede ikamet eden iş arayanlar (15+)</li>
                            <li>İşverenler ve insan kaynakları temsilcileri</li>
                            <li>Öncelik: gençler (15–29), kadınlar, engelliler, uzun süre işsiz kalanlar</li>
                        </ul>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Badge tone="info">Genç Dostu</Badge>
                            <Badge tone="success">Kadın İstihdamı</Badge>
                            <Badge tone="warning">Engelli İstihdamı</Badge>
                        </div>
                    </Section>

                    <Section id="is-arayan" title="İş Arayan İçin Hizmetler">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="font-semibold">Kariyer Danışmanlığı</h3>
                                <ul className="list-disc pl-5">
                                    <li>Profil analizi ve hedef belirleme</li>
                                    <li>CV/önyazı düzenleme, <strong>mülakat provası</strong></li>
                                    <li>İlan eşleştirme ve başvuru stratejisi</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">Kurs & Sertifika</h3>
                                <ul className="list-disc pl-5">
                                    <li>Mesleki eğitim (ofis, lojistik, satış, temel kodlama vb.)</li>
                                    <li>Hijyen, ilkyardım, iş güvenliği bilgilendirmesi</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">Destek Programları</h3>
                                <ul className="list-disc pl-5">
                                    <li>Gençler için ilk iş / mentorluk</li>
                                    <li>Kadın istihdamı ve girişimcilik atölyeleri</li>
                                    <li>Engelliler için uygun pozisyon ve erişilebilirlik danışmanlığı</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">Fuar & Etkinlik</h3>
                                <ul className="list-disc pl-5">
                                    <li>İş buluşmaları, açık kapı günleri</li>
                                    <li>Yerel işveren sunumları</li>
                                </ul>
                            </div>
                        </div>
                        <Callout title="Not">
                            Resmî işe alım süreçlerindeki <strong>tüm belgeler</strong> ilan detayında açıklanır. Belgelerinizi{" "}
                            <strong>PDF/JPG</strong> olarak hazırlayın.
                        </Callout>
                    </Section>

                    <Section id="isveren" title="İşveren İçin Hizmetler">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Ücretsiz ilan yayınlama, aday havuzuna erişim</li>
                            <li>Ön mülakat ve kısa liste desteği</li>
                            <li>Engelli istihdamı ve erişilebilirlik danışmanlığı</li>
                            <li>Teşvik ve programlar hakkında bilgilendirme</li>
                        </ul>
                        <div className="mt-3">
                            <Link
                                href="/isveren/ilan-ver"
                                className="rounded-xl bg-blue-600 px-5 py-3 text-white shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                            >
                                İşveren İlan Ver
                            </Link>
                        </div>
                    </Section>

                    <Section id="ornek-ilanlar" title="Örnek İlanlar (Güncel Aramalar)">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {jobs.map((j, i) => (
                                <div key={i} className="rounded-2xl border bg-white/70 p-4 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-semibold">{j.t}</h3>
                                        <Badge tone={j.y === "Staj" ? "info" : j.y === "Yarı Zamanlı" ? "warning" : "success"}>
                                            {j.y}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {j.c} • {j.l}
                                    </p>
                                    <div className="mt-3">
                                        <a href="#" className="text-blue-700 underline">
                                            İlana Bak
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-3 text-sm text-gray-600">
                            Tüm ilanlar için:{" "}
                            <Link href="/kariyer/ilanlar" className="text-blue-700 underline">
                                İlan Arama
                            </Link>
                        </p>
                    </Section>

                    <Section id="belgeler" title="Gerekli Belgeler">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Kimlik bilgileri ve iletişim</li>
                            <li>Güncel CV (PDF/Docx)</li>
                            <li>Diploma/sertifika fotokopileri (varsa)</li>
                            <li>Askerlik durumu (erkek adaylar için, pozisyona göre)</li>
                            <li>Engellilik/tercih belgeleri (varsa)</li>
                        </ul>
                    </Section>

                    <Section id="kanallar" title="Başvuru Kanalları">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                <a className="text-blue-700 underline" href="#">
                                    e-Belediye → İstihdam Başvurusu
                                </a>
                            </li>
                            <li>İstihdam Merkezi danışma (08:30–17:30)</li>
                            <li>
                                Danışman randevusu:{" "}
                                <Link href="/randevu?birim=istihdam-merkezi" className="text-blue-700 underline">
                                    Randevu Sistemi
                                </Link>
                            </li>
                        </ul>
                    </Section>

                    <Section id="surec" title="Adım Adım Süreç & Hizmet Standardı (SLA)">
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>Profil oluştur / CV yükle</li>
                            <li>Danışman ön görüşmesi (hedef ve uygun pozisyonlar)</li>
                            <li>İlan eşleştirme ve başvuru</li>
                            <li>Mülakat / değerlendirme ve geri bildirim</li>
                            <li>Yerleştirme sonrası ilk ay takip</li>
                        </ol>
                        <ul className="mt-4 list-disc pl-5 text-sm text-gray-700">
                            <li>Ön değerlendirme: <strong>3 iş günü</strong></li>
                            <li>Randevu tarihi: <strong>5 iş günü içinde</strong></li>
                            <li>Eşleştirme: sektör/pozisyona göre <strong>7–20 gün</strong></li>
                        </ul>
                    </Section>

                    <Section id="ucret" title="Ücret">
                        <p>
                            Tüm hizmetler <strong>ücretsizdir</strong>. Kurs materyalleri/sertifika ücretleri (varsa) duyurularda paylaşılır.
                        </p>
                    </Section>

                    <Section id="erisilebilirlik" title="Erişilebilirlik">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Rampa/asansör, yönlendirme ve işaret dili randevusu</li>
                            <li>Görme engelliler için erişilebilir PDF ve sesli okuma</li>
                            <li>Online başvurular klavye ile tam erişilebilir</li>
                        </ul>
                    </Section>

                    <Section id="kvkk" title="KVKK & Veri Güvenliği">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Veriler yalnızca işe yerleştirme/danışmanlık amacıyla işlenir.</li>
                            <li>İşverenlerle sadece başvurduğunuz pozisyon kapsamında paylaşılır.</li>
                            <li>
                                Kişisel veri talepleri için{" "}
                                <a className="text-blue-700 underline" href="#">
                                    KVKK Başvuru Formu
                                </a>
                                nu kullanın.
                            </li>
                        </ul>
                    </Section>

                    <Section id="sss" title="Sık Sorulan Sorular">
                        <details className="group py-3">
                            <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-blue-400">
                                <span className="font-medium">Kimler başvurabilir?</span>
                            </summary>
                            <div className="prose prose-sm max-w-none py-2 text-gray-700">
                                İlçede ikamet eden 15+ yaş herkes. Bazı kurs/meslekler için yaş/mezuniyet şartı aranabilir.
                            </div>
                        </details>
                        <details className="group py-3">
                            <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-blue-400">
                                <span className="font-medium">CV hazırlamayı bilmiyorum, yardım alabilir miyim?</span>
                            </summary>
                            <div className="prose prose-sm max-w-none py-2 text-gray-700">
                                Evet. Her hafta CV Atölyesi ve bire bir danışman randevusu var.
                            </div>
                        </details>
                        <details className="group py-3">
                            <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-blue-400">
                                <span className="font-medium">İşveren ilan verebilir mi?</span>
                            </summary>
                            <div className="prose prose-sm max-w-none py-2 text-gray-700">
                                Evet, ücretsiz ilan yayını ve aday tarama desteği veriyoruz.
                            </div>
                        </details>
                    </Section>

                    <Section id="duyurular" title="Duyurular">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Kariyer Günleri – {new Date().getFullYear()} Bahar</li>
                            <li>CV Atölyesi Takvimi (Her Çarşamba 14:00)</li>
                            <li>Kadın İstihdam Programı yeni başvurular</li>
                        </ul>
                    </Section>

                    <Section id="iletisim" title="İletişim">
                        <p>
                            <strong>İstihdam Merkezi – Kariyer Danışmanlığı</strong>
                        </p>
                        <p>
                            E-posta:{" "}
                            <a className="text-blue-700 underline" href="mailto:istihdam@birimajans.bel.tr">
                                istihdam@birimajans.bel.tr
                            </a>{" "}
                            • Çağrı Merkezi: 444 0 XXX
                        </p>
                        <p>Adres: Birim Ajans Belediyesi Hizmet Binası, [adres]</p>
                    </Section>
                </main>
            </div>
        </div>
    );
}
