// app/hizmetler/zabita-hizmetleri/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

/* ——— küçük yardımcı bileşenler ——— */
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
        success: "bg-green-100 text-green-800",
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

const Detail = ({ q, a }: { q: string; a: React.ReactNode }) => (
    <details className="group py-3">
        <summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-blue-400">
            <span className="font-medium">{q}</span>
        </summary>
        <div className="prose prose-sm max-w-none py-2 text-gray-700">{a}</div>
    </details>
);

const Stat = ({ value, label, icon }: { value: string; label: string; icon: "phone" | "moon" | "bolt" }) => {
    const common = "h-5 w-5";
    const icons = {
        phone: (
            <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
                <path
                    d="M3 5a2 2 0 012-2h2l2 4-2 1a14 14 0 006 6l1-2 4 2v2a2 2 0 01-2 2h-1C8.82 18.77 5.23 15.18 4 11V10a2 2 0 01-1-2V5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        moon: (
            <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
        ),
        bolt: (
            <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
                <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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

/* ——— metadata ——— */
export const metadata: Metadata = {
    title: "Zabıta Hizmetleri | Birim Ajans Belediyesi",
    description:
        "Zabıta başvuru/şikayet, görev-yetkiler, denetim alanları, pazar denetimi, kaldırım/otopark işgali, ceza ve tutanak süreçleri, kayıp eşya, çalışma saatleri ve iletişim.",
};

/* ——— sayfa ——— */
export default function ZabitaHizmetleriPage() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* hero */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-blue-50 via-white to-amber-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Zabıta Hizmetleri</h1>
                        <p className="mt-3 text-gray-700">
                            Kent düzeni, halk sağlığı ve kamu huzuru için 7/24 görevdeyiz. Şikâyet, ihbar, pazar ve işyeri denetimleri, kaldırım işgalleri,
                            afiş–reklam, gürültü ve daha fazlası bu sayfada.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="info">153 ZABITA</Badge>
                            <Badge tone="success">7/24 Ekip</Badge>
                            <Badge tone="warning">Ruhsat & Denetim</Badge>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/cozum-merkezi?tab=zabita" className="rounded-xl bg-blue-600 px-5 py-3 text-white shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                                Zabıta Şikâyet / İhbar
                            </Link>
                            <Link href="/ebelediye/basvuru?service=pazar-ruhsat" className="rounded-xl bg-emerald-600 px-5 py-3 text-white shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2">
                                Pazar Tezgâh Başvurusu
                            </Link>
                            <Link href="/isletme/ruhsat" className="rounded-xl bg-indigo-600 px-5 py-3 text-white shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2">
                                İşyeri Açma / Ruhsat
                            </Link>
                            <Link href="/zabita/kayip-esya" className="rounded-xl bg-white px-5 py-3 text-gray-900 shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2">
                                Kayıp Eşya Bildir
                            </Link>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1520975922284-9e0ce3bfb6b0?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* istatistik şeridi */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <Stat icon="phone" value="153" label="Zabıta Hızlı Hat" />
                <Stat icon="moon" value="7/24" label="Nöbetçi Ekip" />
                <Stat icon="bolt" value="30 dk" label="Ortalama İlk Müdahale Hedefi" />
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["ozet", "Özet"],
                            ["basvuru", "Başvuru & Şikâyet Kanalları"],
                            ["gorev", "Zabıtanın Görevleri"],
                            ["yetki", "Zabıtanın Yetkileri"],
                            ["denetim", "Denetim Alanları"],
                            ["pazar", "Pazar & Seyyar"],
                            ["kaldirim", "Kaldırım/Otopark İşgali"],
                            ["ceza", "Ceza & Tutanak Süreçleri"],
                            ["kayip", "Kayıp Eşya"],
                            ["sosyal", "Sosyal Destek ve Kriz"],
                            ["calisma", "Çalışma Saatleri & Ekipler"],
                            ["sss", "Sık Sorulan Sorular"],
                            ["dokuman", "Formlar & Dokümanlar"],
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
                    <Section id="ozet" title="Özet">
                        <p>
                            Zabıta; belediye emir ve yasaklarının uygulanmasını sağlamak, ruhsatsız/faaliyet dışı çalışmaları önlemek, kamu düzenini ve sağlığını korumakla görevlidir.
                            İşyeri denetimi, seyyar satıcı, kaldırım–yol işgali, gürültü, afiş–ilan, fiyat tarifesi, pazar düzeni, dilencilere müdahale ve tüketici hakları yönünden ilk
                            temas noktasıdır.
                        </p>
                    </Section>

                    <Section id="basvuru" title="Başvuru & Şikâyet Kanalları">
                        <ul className="list-disc pl-5 space-y-1">
                            <li><Link href="/cozum-merkezi?tab=zabita" className="text-blue-700 underline">Çözüm Merkezi → Zabıta Şikâyet/İhbar</Link></li>
                            <li>153 ZABITA hattı (acil durumlarda 112/155/156 ile koordinasyon)</li>
                            <li>WhatsApp İhbar Hattı (varsa duyurularda numara)</li>
                            <li>Hizmet Binası Zabıta Danışma (08:30–17:30)</li>
                        </ul>
                        <Callout title="Acil Uyarı" tone="danger">Yangın, can güvenliği ve adli olaylarda önce 112 Acil’i arayın; eş zamanlı zabıtayı bilgilendirin.</Callout>
                    </Section>

                    <Section id="gorev" title="Zabıtanın Görevleri (Vatandaş Gözünden)">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <ul className="list-disc pl-5">
                                    <li>İşyeri ruhsat denetimleri, fiyat–tarife, etiket ve hijyen kontrolü</li>
                                    <li>Seyyar satıcı ve dilencilere müdahale</li>
                                    <li>Pazar yerlerinin düzeni ve esnaf–vatandaş memnuniyeti</li>
                                    <li>Cadde–kaldırım işgallerinin kaldırılması</li>
                                    <li>Afiş, pankart, reklam ve gürültü denetimi</li>
                                </ul>
                            </div>
                            <div>
                                <ul className="list-disc pl-5">
                                    <li>Tüketici şikâyetlerinin ilk değerlendirmesi</li>
                                    <li>Fiyat artışı/fahiş fiyat ve stokçuluk yönünden bildirim</li>
                                    <li>Umuma açık istirahat ve eğlence yerlerinin kontrolü</li>
                                    <li>Belediye karar ve yasaklarının tebliği ve uygulanması</li>
                                </ul>
                            </div>
                        </div>
                    </Section>

                    <Section id="yetki" title="Zabıtanın Yetkileri (Özet)">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Tespit, tutanak düzenleme ve idari yaptırım teklif etme</li>
                            <li>Ruhsatsız faaliyeti <strong>geçici mühürleme</strong> ile durdurma (mevzuata göre)</li>
                            <li>İşgal/izinsiz afiş vb. maddi unsurları kaldırma/müsadere</li>
                            <li>Kimlik bilgisi tespiti ve ilgili birimlere sevk</li>
                            <li>Gerekli hallerde kollukla müşterek denetim</li>
                        </ul>
                        <Callout title="Hukuki Dayanak" tone="info">5393 sayılı Belediye Kanunu, 5326 Kabahatler Kanunu, 1608 sayılı Kanun, İşyeri Açma ve Çalışma Ruhsatlarına İlişkin Yönetmelik ve Belediye Meclisi kararları.</Callout>
                    </Section>

                    <Section id="denetim" title="Denetim Alanları">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                "Gıda satış yerleri & fırınlar",
                                "Market–manav etiket/fiyat",
                                "Lokanta–kafe hijyen",
                                "Berber/kuaför çalışma saatleri",
                                "Ruhsat uygunluğu",
                                "Seyyar–işportacı",
                                "Kaldırım/otopark işgali",
                                "Afiş–reklam/izinsiz pankart",
                                "Gürültü & çevre düzeni",
                            ].map((t) => (
                                <div key={t} className="rounded-xl bg-gray-50 p-3">{t}</div>
                            ))}
                        </div>
                    </Section>

                    <Section id="pazar" title="Pazar & Seyyar">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Pazar yerlerinde tezgâh tahsisi, sıra ve temizlik denetimi</li>
                            <li>Terazi–etiket kontrolü, satıcı kartı denetimi</li>
                            <li>Seyyar satışın yasak/izinli alanları ve bildirim süreçleri</li>
                        </ul>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Badge tone="success">Pazar Düzeni</Badge>
                            <Badge tone="warning">Seyyarla Mücadele</Badge>
                        </div>
                    </Section>

                    <Section id="kaldirim" title="Kaldırım / Otopark İşgali">
                        <p>Yaya güvenliği için kaldırımların masa–sandalyeyle, ürün teşhiriyle veya araçla işgal edilmesi yasaktır.</p>
                        <ul className="list-disc pl-5">
                            <li>Uyarı → Süre verilmesi → İşgalin kaldırılması → İdari yaptırım</li>
                            <li>İşgal fotoğrafı ve adresiyle <Link href="/cozum-merkezi?tab=zabita" className="text-blue-700 underline">ihbar</Link> edebilirsiniz.</li>
                        </ul>
                    </Section>

                    <Section id="ceza" title="Ceza & Tutanak Süreçleri">
                        <ol className="list-decimal pl-5 space-y-1">
                            <li><strong>Tespit & Tutanak:</strong> Fiil ve mevzuat maddesi yazılır, taraflara tebliğ edilir.</li>
                            <li><strong>İdari Yaptırım:</strong> Kabahat türüne göre para cezası/işlem teklifi uygulanır.</li>
                            <li><strong>İtiraz:</strong> Tebliğden itibaren yasal sürede ilgili mercilere başvurabilirsiniz.</li>
                        </ol>
                        <Callout title="Şeffaflık" tone="success">Tutanak numaranızla <Link href="/basvuru-takip" className="text-blue-700 underline">Başvuru Takip</Link> üzerinden durum sorgulaması yapabilirsiniz.</Callout>
                    </Section>

                    <Section id="kayip" title="Kayıp Eşya">
                        <p>Kayıp eşyalar Zabıta Kayıp Eşya Birimi’nde kayıt altına alınır. Emanet süresi ve teslim koşulları mevzuata göre yürütülür.</p>
                        <ul className="list-disc pl-5">
                            <li><Link href="/zabita/kayip-esya" className="text-blue-700 underline">Kayıp Eşya Bildir</Link> veya bulundu bildirimi yapın.</li>
                            <li>Kimlik, tarih, yer bilgisi ve iletişim numarası gerekli.</li>
                        </ul>
                    </Section>

                    <Section id="sosyal" title="Sosyal Destek ve Kriz Durumları">
                        <p>Evde yalnız/yaşlı/engelli bireyler, sokakta kalanlar ve risk altındaki vatandaşlar için sosyal hizmet birimleriyle ortak çalışırız.</p>
                        <ul className="list-disc pl-5">
                            <li>Acil durum: 112, eş zamanlı zabıta bilgilendirmesi</li>
                            <li>Sosyal Yardım yönlendirmesi ve refakat</li>
                        </ul>
                    </Section>

                    <Section id="calisma" title="Çalışma Saatleri & Ekipler">
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Gündüz Ekipleri:</strong> 08:30–17:30</li>
                            <li><strong>Akşam/Nöbet:</strong> 17:30–08:30 (153/ihbar üzerine)</li>
                            <li><strong>Özel Ekipler:</strong> Pazar, Ruhsat, Seyyar, Trafik Düzen (yetki sınırları içinde)</li>
                        </ul>
                    </Section>

                    <Section id="sss" title="Sık Sorulan Sorular">
                        <Detail q="Zabıtayı hangi konularda aramalıyım?" a={<>Ruhsatsız/uygunsuz işyeri, kaldırım işgali, seyyar, gürültü, izinsiz afiş–reklam, fahiş fiyat, pazar düzeni, dilenci vb.</>} />
                        <Detail q="Şikâyetim ne kadar sürede sonuçlanır?" a={<>Acil olaylarda anında ekip sevk edilir. Diğer başvurularda hedef <strong>3 iş günü</strong> içinde ilk dönüş yapılır.</>} />
                        <Detail q="Para cezası nasıl ödenir?" a={<>Tebligattaki tahakkuk numarasıyla <Link href="/ebelediye/odeme" className="text-blue-700 underline">online ödeme</Link> veya veznelerden.</>} />
                        <Detail q="Ruhsatım var; dışarı masa–sandalye koyabilir miyim?" a={<>Yaya güvenliği ve yönetmelik şartlarına göre <strong>özel izin</strong> gerekir. Aykırılıkta işgal işlemi uygulanır.</>} />
                        <Detail q="Seyyar satış yapabilir miyim?" a={<>İzin verilen alanlar dışında <strong>yasaktır</strong>. Pazar veya tahsisli alan başvurularını inceleyin.</>} />
                    </Section>

                    <Section id="dokuman" title="Formlar & Dokümanlar">
                        <ul className="list-disc pl-5 space-y-1">
                            <li><a className="text-blue-700 underline" href="#">Masa-Sandalye Kullanım İzin Formu (PDF)</a></li>
                            <li><a className="text-blue-700 underline" href="#">Afiş/İlan Asma İzin Formu (PDF)</a></li>
                            <li><a className="text-blue-700 underline" href="#">Pazar Tezgâh Başvuru Formu (PDF)</a></li>
                            <li><a className="text-blue-700 underline" href="#">Kayıp Eşya Teslim Tutanağı (DOCX)</a></li>
                        </ul>
                    </Section>

                    <Section id="iletisim" title="İletişim">
                        <p><strong>Zabıta Müdürlüğü</strong></p>
                        <p>153 ZABITA • Çağrı Merkezi: 444 0 XXX</p>
                        <p>E-posta: <a className="text-blue-700 underline" href="mailto:zabita@birimajans.bel.tr">zabita@birimajans.bel.tr</a></p>
                        <p>Adres: Birim Ajans Belediyesi Hizmet Binası, [adres]</p>
                    </Section>
                </main>
            </div>
        </div>
    );
}
