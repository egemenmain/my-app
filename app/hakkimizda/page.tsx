/* app/kurumsal/hakkimizda/page.tsx
   Ataşehir Belediyesi örnek alınarak hazırlanmış kurumsal tanıtım sayfası
*/

const INTRO = `
Ataşehir Belediyesi; katılımcı, şeffaf ve hesap verebilir bir yerel yönetim anlayışıyla
kentin yaşam kalitesini yükseltmeyi hedefler. Sosyal belediyecilik, çevre ve iklim
duyarlılığı, eşitlik ve erişilebilirlik ilkeleri çalışmalarımızın merkezindedir.
`;

const VISION = `
Yeşil, dayanıklı ve kapsayıcı bir Ataşehir: herkes için güvenli, erişilebilir,
yenilikçi hizmetlerin sunulduğu; kültür, sanat, spor ve eğitim olanaklarının
geliştiği bir kent ekosistemi.
`;

const MISSION = `
Kaynaklarını etkin ve verimli kullanan; veriye dayalı, şeffaf ve katılımcı karar
süreçleriyle çalışan; kentlilerin talep ve önerilerini hızla çözüme dönüştüren bir
belediye olmak.
`;

const VALUES = [
    "Şeffaflık ve hesap verebilirlik",
    "Katılımcılık ve eşitlik",
    "Sürdürülebilirlik ve iklim dostu yaklaşım",
    "Yenilikçilik ve dijital belediyecilik",
    "Sosyal adalet ve erişilebilir hizmet",
    "İş güvenliği ve etik ilkeler",
];

const SERVICE_FOCUS = [
    "Çevre, İklim ve Sıfır Atık",
    "Kültür, Sanat ve Kütüphaneler",
    "Gençlik, Spor ve Eğitim",
    "Sosyal Yardım ve Dayanışma",
    "Kentsel Planlama, Yol ve Altyapı",
    "Ulaşım ve Trafik Güvenliği",
    "Sağlık, Veterinerlik ve Halk Sağlığı",
    "Dijital Belediyecilik ve e-Belediye",
    "Afet Yönetimi ve Kentsel Dayanıklılık",
    "İstihdam, Girişimcilik ve Mesleki Gelişim",
];

const QUICK_LINKS = [
    { href: "/kurumsal/yonetim-semasi", label: "Yönetim Şeması" },
    { href: "/kurumsal/kurumsal-dokumanlar", label: "Kurumsal Dokümanlar" },
    { href: "/kurumsal/iletisim", label: "İletişim" },
];

export default function HakkimizdaPage() {
    return (
        <main className="container mx-auto px-4 py-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Hakkımızda</h1>
            <p className="text-center text-gray-600 mb-10">
                Ataşehir Belediyesi’ni örnek alarak hazırlanmış kurumsal tanıtım.
            </p>

            <Section title="Kurumsal Kimlik">
                <p className="mb-3">{INTRO}</p>
                <div className="rounded-2xl border bg-white p-4">
                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                            <dt className="font-semibold">Belediye Başkanı</dt>
                            <dd>Onursal Adıgüzel</dd>
                        </div>
                        <div>
                            <dt className="font-semibold">Yönetim Anlayışı</dt>
                            <dd>Katılımcı, şeffaf, veri odaklı</dd>
                        </div>
                        <div>
                            <dt className="font-semibold">Hizmet Prensibi</dt>
                            <dd>Herkes için erişilebilir hizmet</dd>
                        </div>
                    </dl>
                </div>
            </Section>

            <Section title="Vizyon">
                <p>{VISION}</p>
            </Section>

            <Section title="Misyon">
                <p>{MISSION}</p>
            </Section>

            <Section title="Temel Değerler">
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {VALUES.map((v) => (
                        <li key={v} className="rounded-xl border border-yellow-400 bg-white p-3">
                            {v}
                        </li>
                    ))}
                </ul>
            </Section>

            <Section title="Hizmet Odaklarımız">
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SERVICE_FOCUS.map((s) => (
                        <li key={s} className="rounded-xl border border-yellow-400 bg-white p-3">
                            {s}
                        </li>
                    ))}
                </ul>
            </Section>

            <Section title="Şeffaflık ve Katılım">
                <p className="mb-3">
                    Bütçe uygulama sonuçları, faaliyet raporları ve performans programları
                    düzenli olarak kamuoyuyla paylaşılır. Kentlilerimizi anketler,
                    çalıştaylar ve komisyon toplantıları aracılığıyla karar süreçlerine
                    katılmaya davet ediyoruz.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>e-Belediye üzerinden 7/24 çevrimiçi işlemler</li>
                    <li>Çözüm Merkezi ile başvuru ve talep takibi</li>
                    <li>Açık veri yaklaşımıyla paylaşılan kurumsal raporlar</li>
                </ul>
            </Section>

            <Section title="Hızlı Bağlantılar">
                <ul className="flex flex-wrap gap-2">
                    {QUICK_LINKS.map((l) => (
                        <li key={l.href}>
                            <a
                                href={l.href}
                                className="inline-block rounded-xl border border-yellow-400 px-3 py-1 text-sm hover:bg-yellow-50"
                            >
                                {l.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </Section>

            <p className="text-xs text-gray-500 mt-8">
                Not: Bu metin, Ataşehir Belediyesi’nin kurumsal yaklaşımından
                esinlenilerek örnek amaçlı hazırlanmıştır; resmî bilgiler ve güncel
                duyurular için belediyenin ilgili sayfaları esas alınmalıdır.
            </p>
        </main>
    );
}

/* Basit bölüm bileşeni (import gerekmez) */
function Section({
    title,
    children,
}: {
    title?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="mb-8">
            {title ? <h2 className="text-xl font-semibold mb-3">{title}</h2> : null}
            {children}
        </section>
    );
}
