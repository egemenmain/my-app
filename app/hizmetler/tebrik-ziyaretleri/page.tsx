// app/hizmetler/tebrik-ziyaretleri/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

/* ——— yardımcı bileşenler ——— */
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

const Detail = ({ q, a }: { q: string; a: React.ReactNode }) => (
    <details className="group py-3">
        <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-blue-400">
            <span className="font-medium">{q}</span>
        </summary>
        <div className="prose prose-sm max-w-none py-2 text-gray-700">{a}</div>
    </details>
);

/* ——— metadata ——— */
export const metadata: Metadata = {
    title: "Tebrik Ziyaretleri | Birim Ajans Belediyesi",
    description:
        "Nikâh, yeni doğum, açılış, başarı/mezuniyet gibi özel günlerde Başkan/Protokol tebrik ziyareti veya tebrik çiçeği/mesajı talebi. Başvuru koşulları, belgeler, SSS.",
};

/* ——— sayfa ——— */
export default function TebrikZiyaretleriPage() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-blue-50 via-white to-emerald-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Tebrik Ziyaretleri</h1>
                        <p className="mt-3 text-gray-700">
                            İlçemizde gerçekleşen <strong>nikâh</strong>, <strong>yeni doğum</strong>, <strong>mağaza/işyeri açılışı</strong>, <strong>başarı/mezuniyet</strong> gibi
                            özel günlerde <strong>Başkan/Protokol</strong> tarafından tebrik ziyareti veya tebrik çiçeği/mesajı iletilmesini sağlayan hizmettir.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="success">Ücretsiz</Badge>
                            <Badge tone="info">Randevulu</Badge>
                            <Badge tone="warning">Başvuru: En az 7 gün önce</Badge>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/ebelediye/basvuru?service=tebrik-ziyareti" className="rounded-xl bg-blue-600 px-5 py-3 text-white shadow transition-all hover:-translate-y-px hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                                Online Başvuru
                            </Link>
                            <Link href="/basvuru-takip" className="rounded-xl bg-gray-900 px-5 py-3 text-white shadow transition-all hover:-translate-y-px hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
                                Başvuru Takip
                            </Link>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1542145936-3dc507d2bdb6?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["nedir", "Hizmet Nedir?"],
                            ["kapsam", "Hangi Durumlarda Yapılır?"],
                            ["kosullar", "Koşullar & Öncelik"],
                            ["basvuru", "Başvuru Kanalları & Belgeler"],
                            ["planlama", "Planlama, Zaman ve Etik"],
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
                    <Section id="nedir" title="Hizmet Nedir?">
                        <p>
                            Tebrik Ziyaretleri; vatandaşlarımızın mutlu günlerinde belediye yönetimi adına <strong>iyi dileklerin iletilmesi</strong>,
                            kısa bir ziyaret yapılması veya programa bağlı olarak <strong>tebrik çiçeği/mesajı</strong> gönderilmesini kapsar.
                        </p>
                        <Callout title="Önemli" tone="warning">
                            Talep sayısına ve resmi program yoğunluğuna göre <strong>ziyarete bizzat Başkan katılamayabilir</strong>;
                            Başkan Yardımcısı, Protokol Ekibi veya Sosyal Destek ekibimiz görevlendirilebilir.
                        </Callout>
                    </Section>

                    <Section id="kapsam" title="Hangi Durumlarda Yapılır?">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>🔔 <strong>Nikâh / Evlilik yıldönümü</strong></li>
                            <li>👶 <strong>Yeni doğum</strong> (hastane/ev ziyareti uygunluğuna göre)</li>
                            <li>🏪 <strong>İşyeri / Mağaza Açılışı</strong></li>
                            <li>🎓 <strong>Başarı / Mezuniyet / Derece</strong> (akademik, spor, kültür-sanat)</li>
                            <li>🎉 <strong>Dernek / Kulüp / Kuruluş Yıl Dönümü</strong></li>
                        </ul>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Badge tone="neutral">İlçe Sınırları</Badge>
                            <Badge tone="info">Resmî Program Uygunluğu</Badge>
                            <Badge tone="success">Tebrik Çiçeği / Mesaj Alternatifi</Badge>
                        </div>
                    </Section>

                    <Section id="kosullar" title="Koşullar & Öncelik">
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>İlçe sınırları içinde</strong> olması gerekir.</li>
                            <li><strong>En az 7 gün önce başvuru</strong> yapılması önerilir (mümkünse daha erken).</li>
                            <li>Toplu / kamusal etkinlikler ve <strong>genel fayda</strong> içeren organizasyonlar önceliklidir.</li>
                            <li>Özel mekân ziyaretlerinde <strong>mahremiyet ve izin</strong> aranır.</li>
                        </ul>
                        <Callout title="Program Yoğunluğu" tone="info">
                            Aynı gün için çok sayıda talep olabilir. Bu durumda ekip <strong>tebrik çiçeği/mesajı</strong> gönderimi yapar veya
                            uygun bir tarihe <strong>randevu</strong> verir.
                        </Callout>
                    </Section>

                    <Section id="basvuru" title="Başvuru Kanalları & Belgeler">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="font-semibold">Başvuru Kanalları</h3>
                                <ul className="list-disc pl-5">
                                    <li><Link href="/ebelediye/basvuru?service=tebrik-ziyareti" className="text-blue-700 underline">e-Belediye: Tebrik Ziyareti</Link></li>
                                    <li>Alo 153 / Çözüm Merkezi</li>
                                    <li>Belediye Protokol / Sosyal Destek Birimi</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">Gerekli Bilgiler/Belgeler</h3>
                                <ul className="list-disc pl-5">
                                    <li>Talep konusu (nikâh, açılış, başarı vb.), <strong>tarih-saat</strong>, <strong>adres</strong></li>
                                    <li>Talep sahibi iletişim bilgileri</li>
                                    <li>Varsa davetiye/afiş görseli</li>
                                    <li>Basın-foto izin durumu (izniniz yoksa çekim yapılmaz)</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Link href="/basvuru-takip" className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-90">Başvuru Takip</Link>
                        </div>
                    </Section>

                    <Section id="planlama" title="Planlama, Zaman ve Etik">
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Ziyaret süresi</strong> tipik olarak 10–20 dakikadır.</li>
                            <li>Resmî program değişiklikleri sebebiyle saatlerde <strong>kayma/iptal</strong> olabilir; bu durumda ekip sizi bilgilendirir.</li>
                            <li>Belediyemizde <strong>hediye kabulü yapılmaz</strong>; yalnızca tebrik ve iyi dilek iletilir.</li>
                            <li><strong>Foto/Video</strong> çekimi yalnızca açık rızanızla yapılır.</li>
                            <li><strong>Erişilebilirlik:</strong> Yaşlı/engelli bireyler için uygun rota/kat desteği sağlanır.</li>
                        </ul>
                    </Section>

                    <Section id="sss" title="Sık Sorulan Sorular">
                        <Detail
                            q="Başkan bizzat gelir mi?"
                            a={<>Program yoğunluğuna göre Başkan, Başkan Yardımcısı veya Protokol Ekibi katılır. Ziyaret yerine <strong>tebrik çiçeği/mesajı</strong> gönderimi de yapılabilir.</>}
                        />
                        <Detail
                            q="En geç ne zaman başvurmalıyım?"
                            a={<>En az <strong>7 gün önce</strong> başvurmanız önerilir. Takvim yoğun ise daha erken yapmanız olumlu sonuç verir.</>}
                        />
                        <Detail
                            q="Açık alanda/işyerinde kısa bir konuşma yapılır mı?"
                            a={<>Etkinliğin akışına ve talebe göre <strong>kısa tebrik konuşması</strong> yapılabilir. Ses sistemi vb. organizasyon davet sahibine aittir.</>}
                        />
                        <Detail
                            q="Basın ve fotoğraf olacak mı?"
                            a={<>Yalnızca <strong>açık rıza</strong> verilirse çekim yapılır. İzin yoksa ekip protokol fotoğrafı çekmez.</>}
                        />
                        <Detail
                            q="Talebim reddedildi. Neden?"
                            a={<>İlçe sınırları dışında olması, program yoğunluğu, içerik uygunluğu veya güvenlik gerekçeleri sebebiyle reddedilebilir. Alternatif olarak <strong>tebrik çiçeği/mesajı</strong> talep edebilirsiniz.</>}
                        />
                        <Detail
                            q="Ücretli mi?"
                            a={<>Hayır. Ziyaret ve tebrik gönderimleri <strong>ücretsiz</strong>dir.</>}
                        />
                        <Detail
                            q="İptal/erteleme olur mu?"
                            a={<>Zorunlu hallerde tarafınıza bilgi verilerek saat/tarih <strong>ertelenebilir</strong> ya da tebrik gönderimi yapılabilir.</>}
                        />
                    </Section>

                    <Section id="iletisim" title="İletişim">
                        <p><strong>Protokol ve Basın Birimi</strong></p>
                        <p>Çağrı Merkezi: 444 0 XXX • Alo 153</p>
                        <p>E-posta: <a className="text-blue-700 underline" href="mailto:protokol@birimajans.bel.tr">protokol@birimajans.bel.tr</a></p>
                        <p>Adres: Birim Ajans Belediyesi Hizmet Binası, [adres]</p>
                    </Section>
                </main>
            </div>
        </div>
    );
}
