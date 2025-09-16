// app/hizmetler/kentsel-donusum-hizmetleri/page.tsx
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

const Stat = ({ value, label, icon }: { value: string; label: string; icon: "shield" | "home" | "clock" }) => {
    const common = "h-5 w-5";
    const icons = {
        shield: (
            <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
                <path d="M12 3l8 4v6c0 6-4 8-8 8s-8-2-8-8V7l8-4z" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
        ),
        home: (
            <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
                <path d="M3 10l9-7 9 7v9a2 2 0 01-2 2h-4V12H9v9H5a2 2 0 01-2-2v-9z" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
        ),
        clock: (
            <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
                <path d="M12 8v5l4 2M12 22a10 10 0 110-20 10 10 0 010 20z" stroke="currentColor" strokeWidth="2" fill="none" />
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
    title: "Kentsel Dönüşüm Hizmetleri | Birim Ajans Belediyesi",
    description:
        "Riskli yapı tespiti, güçlendirme/yıkım-yeniden yapım, kira/taşınma yardımı, kredi/faiz desteği, rezerv konut, kiracılar için rehber ve SSS.",
};

/* ——— sayfa ——— */
export default function KentselDonusumPage() {
    const yil = new Date().getFullYear();

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            {/* hero */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-50 via-white to-blue-50">
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold tracking-tight">Kentsel Dönüşüm Hizmetleri</h1>
                        <p className="mt-3 text-gray-700">
                            Deprem riski altındaki binalar için <strong>risk tespiti</strong>, <strong>güçlendirme/yeniden yapım</strong> ve
                            <strong> kira/taşınma yardımı</strong> süreçlerinde yanınızdayız.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="info">6306 sayılı Kanun</Badge>
                            <Badge tone="success">Belediye Destek Masası</Badge>
                            <Badge tone="warning">Kira & Taşınma Yardımı</Badge>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/ebelediye/basvuru?service=riskli-yapi-tespiti" className="rounded-xl bg-blue-600 px-5 py-3 text-white shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                                Riskli Yapı Tespiti Başvurusu
                            </Link>
                            <Link href="/ebelediye/basvuru?service=guclendirme-proje" className="rounded-xl bg-emerald-600 px-5 py-3 text-white shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2">
                                Güçlendirme/Proje Danışmanlığı
                            </Link>
                            <Link href="/ebelediye/basvuru?service=kira-yardimi" className="rounded-xl bg-amber-600 px-5 py-3 text-white shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2">
                                Kira Yardımı Başvurusu
                            </Link>
                            <Link href="/basvuru-takip" className="rounded-xl bg-gray-900 px-5 py-3 text-white shadow transition-all hover:-translate-y-px hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
                                Başvuru Takip
                            </Link>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center md:aspect-[5/4]" />
                    </div>
                </div>
            </section>

            {/* istatistik şeridi */}
            <div className="mt-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
                <Stat icon="home" value="1.000+" label="Danışılan Bağımsız Bölüm" />
                <Stat icon="shield" value="%100" label="Resmî Lisanslı Laboratuvarlarla Çalışma" />
                <Stat icon="clock" value="3–7 gün" label="Ön Görüşme Randevu Süresi (hedef)" />
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                {/* TOC */}
                <nav className="top-24 hidden self-start lg:sticky lg:block">
                    <ul className="space-y-1">
                        {[
                            ["ozet", "Özet"],
                            ["kimler", "Kimler Yararlanabilir?"],
                            ["adimlar", "Adım Adım Süreç"],
                            ["haklar", "Haklar (Malik/Kiracı)"],
                            ["kiracilar", "Kiracılar İçin Rehber"], // ← yeni
                            ["destekler", "Mali Destekler (Kira, Taşınma, Kredi)"],
                            ["belgeler", "Gerekli Belgeler"],
                            ["kanallar", "Başvuru Kanalları"],
                            ["sure", "Süreler & Zaman Çizelgesi"],
                            ["ucret", "Ücretler"],
                            ["sss", "Sık Sorulan Sorular (Halk Arasında)"], // ← genişletildi
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
                            6306 sayılı Kanun kapsamında binalar <strong>riskli yapı tespiti</strong> ile değerlendirilir. Sonuca göre
                            <strong> güçlendirme</strong> ya da <strong>yıkım–yeniden yapım</strong> süreçleri başlar. Belediyemiz; başvuru, bilgilendirme,
                            planlama ve hak sahipliği işlemlerinde rehberlik sağlar.
                        </p>
                        <Callout title="Önemli" tone="warning">
                            Riskli yapı tespitini yalnızca <strong>lisanslı kurum/laboratuvarlar</strong> yapabilir. Belediyemiz bu kurumların
                            listesine yönlendirir; numune alma ve rapor ücretleri başvuru sahibine aittir.
                        </Callout>
                    </Section>

                    <Section id="kimler" title="Kimler Yararlanabilir?">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>İlçe sınırları içindeki konut ve işyeri sahipleri</li>
                            <li>Site/apt. yönetimleri ve kat malikleri kurulu</li>
                            <li>Kiracılar (kira/taşınma desteği başvuruları için)</li>
                        </ul>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Badge tone="success">Malik</Badge>
                            <Badge tone="info">Kiracı</Badge>
                            <Badge tone="warning">İşyeri</Badge>
                        </div>
                    </Section>

                    <Section id="adimlar" title="Adım Adım Kentsel Dönüşüm Süreci">
                        <ol className="list-decimal pl-5 space-y-1">
                            <li><strong>Ön Görüşme & Bilgilendirme:</strong> Belediyemizle randevu.</li>
                            <li><strong>Riskli Yapı Tespiti:</strong> Lisanslı kurumdan teknik rapor alınır.</li>
                            <li><strong>İtiraz / Onay:</strong> Rapor Çevre, Şehircilik ve İklim Değişikliği İl Müdürlüğünce sonuçlanır.</li>
                            <li><strong>Proje:</strong> Güçlendirme ya da yeniden yapım için mimari–statik–mekanik projeler.</li>
                            <li><strong>Finansman:</strong> Kredi/teşvik/kira- taşınma desteği başvuruları.</li>
                            <li><strong>Yıkım–Yapım & Geçici İskân:</strong> Şantiye süreci ve denetimler.</li>
                            <li><strong>İskân/Iskan Sonrası:</strong> Tapu, abonelikler ve dönüş.</li>
                        </ol>
                    </Section>

                    <Section id="haklar" title="Haklar (Malik / Kiracı)">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2 pr-4">Taraf</th>
                                        <th className="py-2 pr-4">Hak</th>
                                        <th className="py-2">Not</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    <tr>
                                        <td className="py-2 pr-4 font-medium">Malik</td>
                                        <td className="py-2 pr-4">Kredi/faiz desteği, kira/taşınma yardımı (koşullu), rezerv konut</td>
                                        <td className="py-2">Süreçte 2/3 çoğunlukla karar alınır.</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 pr-4 font-medium">Kiracı</td>
                                        <td className="py-2 pr-4">Taşınma yardımı ve sınırlı kira desteği</td>
                                        <td className="py-2">Sözleşme ve ikamet şartları aranır.</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 pr-4 font-medium">İşyeri</td>
                                        <td className="py-2 pr-4">Taşınma/gelir kaybı desteği (mevzuata bağlı)</td>
                                        <td className="py-2">Vergi/SGK kayıtları istenebilir.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    {/* ——— YENİ: Kiracı rehberi ——— */}
                    <Section id="kiracilar" title="Kiracılar İçin Rehber: Haklar, Adımlar ve Pratik Çözümler">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="font-semibold">Hızlı Yol Haritası</h3>
                                <ol className="list-decimal pl-5">
                                    <li>Resmî <strong>riskli yapı tebliği</strong> size ulaştığında yazıyı saklayın.</li>
                                    <li><Link href="/ebelediye/basvuru?service=kira-yardimi" className="text-blue-700 underline">Kira/Taşınma Yardımı Başvurusu</Link> yapın.</li>
                                    <li>Ev sahibiyle <strong>tutanaklı</strong> teslim planı ve depozito iadesini görüşün.</li>
                                    <li><strong>Geçici konut</strong> için kira sözleşmesi yapın; ödemeleri dekontla saklayın.</li>
                                    <li>Şantiye sürecinde <strong>Başvuru Takip</strong> üzerinden duyuruları izleyin.</li>
                                </ol>
                            </div>
                            <div>
                                <h3 className="font-semibold">Kiracı Başvuru Adımları</h3>
                                <ul className="list-disc pl-5">
                                    <li>Kimlik, kira sözleşmesi ve <strong>ikametgâh</strong> belgesi</li>
                                    <li>IBAN (adınıza), iletişim bilgileri</li>
                                    <li>Riskli yapı karar tebligatı/ilânı</li>
                                    <li>Taşınma masraf belgeleri (varsa)</li>
                                </ul>
                            </div>
                        </div>

                        <Callout title="Bilmeniz Faydalı" tone="info">
                            Kira yardımı <em>dönemsel</em> olarak belirlenir ve süre/ tutarlar il bazında duyurulur. Yardımlar hak sahipliği incelemesi sonrası ödenir.
                        </Callout>

                        <h3 className="mt-4 font-semibold">Sık Karşılaşılan Senaryolar & Çözümler</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>“Ev sahibi hemen çıkmamı istiyor.”</strong> – Resmî tebliğde belirtilen süreler geçerlidir. Tebliğ olmadan tahliye talebi bağlayıcı değildir.</li>
                            <li><strong>“Depozitomu geri alamadım.”</strong> – Teslim/yerinde tespit tutanağı düzenleyin; anlaşmazlıkta arabuluculuk/yasal yola başvurabilirsiniz.</li>
                            <li><strong>“Kira aşırı artırıldı.”</strong> – Tahliye sürecinde fahiş artışa karşı yasal sınırlar ve sözleşme hükümleri geçerlidir.</li>
                            <li><strong>“Yeni ev bulana kadar nereye gideceğim?”</strong> – Kira yardımı/rezerv konut ilanlarını takip edin; sosyal destek birimlerimiz yönlendirme yapar.</li>
                            <li><strong>“İşyeri kiracısıyım.”</strong> – Taşınma/gelir kaybı desteği şartlara bağlıdır. Vergi/SGK kayıtlarınızla başvurun.</li>
                        </ul>
                    </Section>

                    <Section id="destekler" title="Mali Destekler (Kira, Taşınma, Kredi)">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="font-semibold">Kira & Taşınma Yardımı</h3>
                                <ul className="list-disc pl-5">
                                    <li>Başvuru sahibinin hak sahipliği tespiti yapılır.</li>
                                    <li>Ödeme süresi ve tutarı resmi duyurulara göre belirlenir.</li>
                                    <li>IBAN, ikamet ve sözleşme belgeleri zorunludur.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">Kredi / Faiz Desteği</h3>
                                <ul className="list-disc pl-5">
                                    <li>Güçlendirme ya da yeniden yapım için kredi seçenekleri</li>
                                    <li>Faiz desteği limit ve oranları merkezi idare kararlarına göre uygulanır.</li>
                                    <li>Banka ön onayı ve hak sahipliği belgesi gerekir.</li>
                                </ul>
                            </div>
                        </div>
                        <Callout title="Güncel Tutarlar" tone="warning">
                            Kira/taşınma ve faiz destek tutarları dönemsel olarak değişebilir. Belediyemizin <Link href="/duyurular" className="text-blue-700 underline">duyurular</Link>ını takip edin.
                        </Callout>
                    </Section>

                    <Section id="belgeler" title="Gerekli Belgeler">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="font-semibold">Riskli Yapı Tespiti (Malik)</h3>
                                <ul className="list-disc pl-5">
                                    <li>Tapu kayıt örneği, kimlik</li>
                                    <li>Adres/ikametgâh</li>
                                    <li>Yapı ruhsatı/iskan (varsa)</li>
                                    <li>Başvuru formu ve vekalet (varsa)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">Kira/Taşınma Yardımı (Kiracı)</h3>
                                <ul className="list-disc pl-5">
                                    <li>Kira sözleşmesi, ikametgâh, kimlik</li>
                                    <li>IBAN ve iletişim bilgileri</li>
                                    <li>Riskli yapı tebliği veya ilânı</li>
                                </ul>
                            </div>
                        </div>
                    </Section>

                    <Section id="kanallar" title="Başvuru Kanalları">
                        <ul className="list-disc pl-5 space-y-1">
                            <li><Link href="/ebelediye/basvuru?service=riskli-yapi-tespiti" className="text-blue-700 underline">e-Belediye → Riskli Yapı Tespiti</Link></li>
                            <li><Link href="/ebelediye/basvuru?service=kira-yardimi" className="text-blue-700 underline">e-Belediye → Kira Yardımı</Link></li>
                            <li>Belediye Kentsel Dönüşüm Masası (randevu ile)</li>
                            <li>Çağrı Merkezi: 444 0 XXX</li>
                        </ul>
                    </Section>

                    <Section id="sure" title="Süreler & Zaman Çizelgesi (Hedef)">
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Ön Görüşme:</strong> 3–7 iş günü içinde randevu</li>
                            <li><strong>Riskli Yapı Raporu:</strong> Numune/analiz sürecine göre 10–30 gün</li>
                            <li><strong>Onay/İtiraz Sonucu:</strong> İl müdürlüğü işlemleri 15–30 gün</li>
                            <li><strong>Proje ve Ruhsat:</strong> 30–90 gün (proje kapsamına göre)</li>
                        </ul>
                    </Section>

                    <Section id="ucret" title="Ücretler">
                        <p>Riskli yapı tespiti ve laboratuvar ücretleri başvuru sahibine aittir. Belediyemizde yapılan danışmanlık işlemleri <strong>ücretsizdir</strong>. Harç ve ruhsat bedelleri için <Link href="/ucretler-ve-tarifeler" className="text-blue-700 underline">Ücretler & Tarifeler</Link> sayfasına bakınız.</p>
                    </Section>

                    {/* ——— GENİŞLETİLMİŞ: Halk arasında en çok sorulanlar ——— */}
                    <Section id="sss" title="Sık Sorulan Sorular (Halk Arasında)">
                        <Detail q="Binam riskli mi, nasıl anlarım?" a={<>Sadece lisanslı kuruluşun hazırladığı <strong>teknik rapor</strong> ile anlaşılır; gözle tespit yeterli değildir.</>} />
                        <Detail q="Raporu kim verir?" a={<>Bakanlıkça lisanslı laboratuvar/kuruluşlar düzenler; belediye sizi bu listeye yönlendirir.</>} />
                        <Detail q="Rapor hatalıysa ne yapabilirim?" a={<>Belirtilen sürede İl Müdürlüğüne <strong>itiraz</strong> edebilirsiniz; yeni inceleme yapılabilir.</>} />
                        <Detail q="Karar kaç oyla alınır?" a={<>Kat malikleri kurulunda <strong>2/3 çoğunluk</strong> aranır. Karara katılmayanlar için kanuni süreç işler.</>} />
                        <Detail q="Güçlendirme mi, yeniden yapım mı?" a={<>Teknik rapor ve mali fizibiliteye göre belirlenir; danışmanlarımız alternatifleri anlatır.</>} />
                        <Detail q="Kiracılar ne kadar destek alır?" a={<>Taşınma ve belirli süre kira yardımı sağlanabilir; tutarlar dönemsel duyurulur.</>} />
                        <Detail q="Rezerv konut nedir?" a={<>Geçici/kalıcı iskân için ayrılan konutlardır; kura/teslim süreçleri duyurulur.</>} />
                        <Detail q="Tahliye ne zaman olur?" a={<>Riskli yapı kararı kesinleşip <strong>tebliğ</strong> edildikten sonra yasal süre başlar.</>} />
                        <Detail q="Müteahhiti kim seçer, nelere bakılır?" a={<>Malikler seçer. Teminat, süre, fiyat/eser sözleşmesi, cezai şart ve bağımsız bölüm paylaşımı kritik maddelerdir.</>} />
                        <Detail q="Vergi ve sigortalar?" a={<>DASK zorunludur. Yıkım sonrası arsa vergisi, iskan sonrası bina vergisi uygulanır.</>} />
                        <Detail q="Şantiyeden kaynaklı gürültü/toz?" a={<>Yönetmeliklere uyum ve koruma önlemleri zorunludur; ihlal halinde zabıta ve ilgili birimlere bildirin.</>} />
                    </Section>

                    <Section id="dokuman" title="Formlar & Dokümanlar">
                        <ul className="list-disc pl-5 space-y-1">
                            <li><a className="text-blue-700 underline" href="#">Riskli Yapı Tespiti Başvuru Formu (PDF)</a></li>
                            <li><a className="text-blue-700 underline" href="#">Kira/Taşınma Yardımı Başvuru Formu (PDF)</a></li>
                            <li><a className="text-blue-700 underline" href="#">Vekaletname Örneği (DOCX)</a></li>
                            <li><a className="text-blue-700 underline" href="#">Hak Sahipliği Beyanı (PDF)</a></li>
                        </ul>
                    </Section>

                    <Section id="iletisim" title="İletişim">
                        <p><strong>Kentsel Dönüşüm Danışma Masası</strong></p>
                        <p>E-posta: <a className="text-blue-700 underline" href="mailto:kentseldonusum@birimajans.bel.tr">kentseldonusum@birimajans.bel.tr</a> • Çağrı Merkezi: 444 0 XXX</p>
                        <p>Adres: Birim Ajans Belediyesi Hizmet Binası, [adres]</p>
                    </Section>
                </main>
            </div>
        </div>
    );
}
