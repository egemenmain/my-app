// app/hizmetler/mali-hizmetler/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

/* helper bileşenler */
const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <section id={id} className="scroll-mt-28">
        <h2 className="mb-3 text-2xl font-semibold">{title}</h2>
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">{children}</div>
    </section>
);

const Badge = ({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "info" }) => {
    const map = { neutral: "bg-gray-100 text-gray-800", success: "bg-green-100 text-green-800", warning: "bg-amber-100 text-amber-900", info: "bg-blue-100 text-blue-800" } as const;
    return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${map[tone]}`}>{children}</span>;
};

const Callout = ({ title, children, tone = "info" }: { title: string; children: React.ReactNode; tone?: "info" | "warning" | "success" | "danger" }) => {
    const map = {
        info: "border-blue-200 bg-blue-50",
        warning: "border-amber-200 bg-amber-50",
        success: "border-emerald-200 bg-emerald-50",
        danger: "border-red-200 bg-red-50",
    } as const;
    return (
        <div className={`rounded-xl border p-4 text-sm ${map[tone]}`}>
            <p className="mb-1 font-semibold">{title}</p>
            <div className="text-gray-700">{children}</div>
        </div>
    );
};

const Stat = ({ value, label, icon }: { value: string; label: string; icon: "calendar" | "wallet" | "shield" }) => {
    const common = "h-5 w-5";
    const icons = {
        calendar: (
            <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
                <path d="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        wallet: (
            <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
                <path d="M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 7a2 2 0 012-2h11a2 2 0 012 2v2H3V7z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        shield: (
            <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
                <path d="M12 3l7 4v6c0 5-3.5 8-7 8s-7-3-7-8V7l7-4z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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

/* metadata */
export const metadata: Metadata = {
    title: "Mali Hizmetler | Birim Ajans Belediyesi",
    description: "Emlak vergisi, ÇTV, ilan-reklam, kira vb. borç sorgulama, online ödeme, taksit, indirim/muafiyet ve SSS.",
};

/* DEFAULT EXPORT: React bileşeni */
export default function MaliHizmetlerPage() {
    const yil = new Date().getFullYear();

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-amber-50 via-white to-blue-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Mali Hizmetler</h1>
                        <p className="mt-3 text-gray-700">
                            Emlak Vergisi, Çevre Temizlik Vergisi (ÇTV), İlan-Reklam Vergisi ve belediye kira/harç ödemeleri için
                            hızlı bilgi, online işlem ve başvuru kanalları.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="info">Online Ödeme</Badge>
                            <Badge tone="success">Taksit Desteği</Badge>
                            <Badge tone="warning">Son Tarihler</Badge>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/ebelediye/odeme" className="rounded-xl bg-blue-600 px-5 py-3 text-white shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">Borç Sorgula & Öde</Link>
                            <Link href="/ebelediye/basvuru?service=taksit" className="rounded-xl bg-emerald-600 px-5 py-3 text-white shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2">Taksit Başvurusu</Link>
                            <Link href="/ucretler-ve-tarifeler" className="rounded-xl bg-white px-5 py-3 text-gray-900 shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2">Ücretler & Tarifeler</Link>
                            <Link href="/basvuru-takip" className="rounded-xl bg-gray-900 px-5 py-3 text-white shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">Başvuru Takip</Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <Stat icon="calendar" value={`31 Mayıs ${yil}`} label="Emlak/ÇTV 1. Taksit Son Günü" />
                <Stat icon="calendar" value={`30 Kasım ${yil}`} label="Emlak/ÇTV 2. Taksit Son Günü" />
                <Stat icon="wallet" value="3D Secure" label="Kredi Kartı ile Online Tahsilat" />
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["ozet", "Özet"],
                            ["yapilabilecekler", "Ne Yapabilirim?"],
                            ["odeme", "Online Ödeme & Kanallar"],
                            ["tarihler", "Son Ödeme Tarihleri"],
                            ["indirim", "İndirim ve Muafiyetler"],
                            ["belgeler", "Gerekli Belgeler"],
                            ["kvkk", "KVKK & Güvenlik"],
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

                <main className="space-y-10">
                    <Section id="ozet" title="Özet">
                        <p>
                            Bu sayfa; <strong>Emlak Vergisi</strong>, <strong>ÇTV</strong>, <strong>İlan-Reklam Vergisi</strong>,
                            <strong> işgaliye/harç</strong> ve <strong>belediye kira</strong> ödemeleri hakkında {yil} yılı için güncel
                            işlemleri, kanalları ve son tarihleri içerir.
                        </p>
                        <Callout title="Uyarı" tone="warning">
                            Resmî mevzuat değişebilir. Süre ve bedeller bilgilendirme amaçlıdır;{" "}
                            <Link href="/ucretler-ve-tarifeler" className="text-blue-700 underline">Ücretler & Tarifeler</Link> ve duyuruları takip ediniz.
                        </Callout>
                    </Section>

                    <Section id="yapilabilecekler" title="Ne Yapabilirim?">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="font-semibold">Vergi & Harç İşlemleri</h3>
                                <ul className="list-disc pl-5">
                                    <li>TC/Vergi No ile <strong>Borç Sorgulama ve Online Ödeme</strong></li>
                                    <li>Emlak/ÇTV <strong>mükellefiyet açılış-kapanış</strong> bildirimi</li>
                                    <li><strong>İlan-Reklam</strong> beyannamesi ve ödeme</li>
                                    <li>İşgaliye tahakkuk ve ödeme</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">Kolaylıklar</h3>
                                <ul className="list-disc pl-5">
                                    <li><strong>Taksit Başvurusu</strong></li>
                                    <li><strong>Otomatik Ödeme Talimatı</strong></li>
                                    <li><strong>E-tebligat / E-posta</strong> bilgilendirmesi</li>
                                </ul>
                            </div>
                        </div>
                    </Section>

                    <Section id="odeme" title="Online Ödeme & Kanallar">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="font-semibold">Online</h3>
                                <ul className="list-disc pl-5">
                                    <li><Link href="/ebelediye/odeme" className="text-blue-700 underline">Borç Sorgula & Öde</Link> (3D Secure)</li>
                                    <li><Link href="/basvuru-takip" className="text-blue-700 underline">Ödeme Makbuz Görüntüleme</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">Vezneler & Diğer</h3>
                                <ul className="list-disc pl-5">
                                    <li>Hizmet binası vezneleri (08:30–12:30 / 13:30–17:30)</li>
                                    <li><strong>IBAN ile EFT/Havale</strong> (Açıklama: TC Kimlik No + Vergi Türü + Sicil)</li>
                                    <li>Yapılandırma/taksit ödemeleri için duyurulan banka şubeleri</li>
                                </ul>
                            </div>
                        </div>
                        <Callout title="Ödeme Sonrası" tone="success">
                            Online ödemeler dakikalar içinde sisteme yansır. Vezne/IBAN ödemelerinde banka işlem süresine bağlı olarak
                            <strong> aynı/ertesi iş günü</strong> içinde düşer.
                        </Callout>
                    </Section>

                    <Section id="tarihler" title="Son Ödeme Tarihleri">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2 pr-4">Tür</th>
                                        <th className="py-2 pr-4">1. Taksit</th>
                                        <th className="py-2 pr-4">2. Taksit</th>
                                        <th className="py-2">Not</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    <tr>
                                        <td className="py-2 pr-4 font-medium">Emlak Vergisi</td>
                                        <td className="py-2 pr-4">1 Mart – 31 Mayıs {yil}</td>
                                        <td className="py-2 pr-4">1 Kasım – 30 Kasım {yil}</td>
                                        <td className="py-2">Gecikme zammı günlük işler.</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 pr-4 font-medium">ÇTV</td>
                                        <td className="py-2 pr-4">1 Mart – 31 Mayıs {yil}</td>
                                        <td className="py-2 pr-4">1 Kasım – 30 Kasım {yil}</td>
                                        <td className="py-2">Konut/işyeri su tüketimine bağlı olabilir.</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 pr-4 font-medium">İlan-Reklam</td>
                                        <td className="py-2 pr-4">Beyan dönemine göre</td>
                                        <td className="py-2 pr-4">Beyan dönemine göre</td>
                                        <td className="py-2">Mahiyete göre peşin/taksit.</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 pr-4 font-medium">Kira</td>
                                        <td className="py-2 pr-4">Sözleşmeye göre</td>
                                        <td className="py-2 pr-4">Sözleşmeye göre</td>
                                        <td className="py-2">Vade ve gecikme şartları sözleşmede.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    <Section id="indirim" title="İndirim ve Muafiyetler">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="font-semibold">Kimler Yararlanabilir?</h3>
                                <ul className="list-disc pl-5">
                                    <li>200 m²’yi aşmayan <strong>tek konut</strong> için; emekli, ev hanımı, işsiz, engelli, şehit yakını ve gaziler (şartlara bağlı)</li>
                                    <li>Engellilerde vergi indirimi/ÇTV muafiyeti (ikamet ve metrekare sınırı aranır)</li>
                                    <li>İlan-reklamda küçük esnaf indirimleri (varsa meclis kararına göre)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">Nasıl Başvurulur?</h3>
                                <ul className="list-disc pl-5">
                                    <li><Link href="/ebelediye/basvuru?service=vergi-indirim" className="text-blue-700 underline">e-Belediye Başvuru</Link></li>
                                    <li>Gerekli belgeleri yükleyin (aşağıdaki liste)</li>
                                    <li>Sonuç SMS/e-posta ile bildirilir</li>
                                </ul>
                            </div>
                        </div>
                        <Callout title="Belge Örnekleri">
                            Emeklilik belgesi, engellilik raporu, ikametgâh, tapu fotokopisi, gelir durumu beyanı (varsa), dilekçe.
                        </Callout>
                    </Section>

                    <Section id="belgeler" title="Gerekli Belgeler">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Emlak Vergisi: Tapu, kimlik, adres/ikametgâh, yapı kullanma belgesi (yeni binalarda)</li>
                            <li>ÇTV: Abonelik/su faturası bilgisi, işyeri için ruhsat</li>
                            <li>İlan-Reklam: Beyan formu, görsel/ölçü krokisi, kira/ruhsat</li>
                            <li>Kira: Sözleşme, ödeme planı, IBAN</li>
                            <li>İndirim/Muafiyet: İlgili durum belgesi (emeklilik/engellilik vb.)</li>
                        </ul>
                    </Section>

                    <Section id="kvkk" title="KVKK & Güvenlik">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Ödemeler 3D Secure ile alınır; kart verisi belediyede tutulmaz.</li>
                            <li>Kişisel veriler yalnızca tahakkuk ve tahsilat amacıyla işlenir.</li>
                            <li>Makbuzlar elektronik ortamda doğrulanabilir; talep halinde ıslak imzalı makbuz verilir.</li>
                        </ul>
                    </Section>

                    <Section id="sss" title="Sık Sorulan Sorular">
                        <details className="group py-3"><summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-blue-400"><span className="font-medium">Borç sorgulamak için hangi bilgilere ihtiyacım var?</span></summary><div className="prose prose-sm max-w-none py-2 text-gray-700">TC Kimlik No / Vergi No ve mükellef siciliniz yeterlidir. Emlak için ada-parsel veya adres bilgisi sorulabilir.</div></details>
                        <details className="group py-3"><summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-blue-400"><span className="font-medium">Ödedim ama sistemde görünmüyor, ne yapmalıyım?</span></summary><div className="prose prose-sm max-w-none py-2 text-gray-700">Online ödemeler genelde dakikalar içinde yansır. 24 saat içinde görünmezse dekontla <Link href="/cozum-merkezi" className="text-blue-700 underline">Çözüm Merkezi</Link>ne bildirin.</div></details>
                        <details className="group py-3"><summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-blue-400"><span className="font-medium">Taksitlendirme hangi borçlara uygulanır?</span></summary><div className="prose prose-sm max-w-none py-2 text-gray-700">Yürürlükteki mevzuat ve meclis kararına göre belirlenir. Uygun borçlar için <Link href="/ebelediye/basvuru?service=taksit" className="text-blue-700 underline">taksit başvurusu</Link> yapabilirsiniz.</div></details>
                        <details className="group py-3"><summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-blue-400"><span className="font-medium">İndirim/muafiyet onayı ne kadar sürer?</span></summary><div className="prose prose-sm max-w-none py-2 text-gray-700">Eksiksiz başvurularda hedef süre <strong>5–10 iş günü</strong>dür.</div></details>
                        <details className="group py-3"><summary className="cursor-pointer list-none rounded-lg py-2 outline-none focus:ring-2 focus:ring-blue-400"><span className="font-medium">Yanlış/çift ödeme iadesi mümkün mü?</span></summary><div className="prose prose-sm max-w-none py-2 text-gray-700">Dilekçe ve dekontla başvurulduğunda inceleme sonrası iade yapılır.</div></details>
                    </Section>

                    <Section id="iletisim" title="İletişim">
                        <p><strong>Mali Hizmetler Müdürlüğü – Tahakkuk/Tahsilat</strong></p>
                        <p>E-posta: <a className="text-blue-700 underline" href="mailto:mali@birimajans.bel.tr">mali@birimajans.bel.tr</a> • Çağrı Merkezi: 444 0 XXX</p>
                        <p>Adres: Birim Ajans Belediyesi Hizmet Binası, [adres]</p>
                    </Section>
                </main>
            </div>
        </div>
    );
}
