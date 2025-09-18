/* app/kurumsal/dis-iliskiler/page.tsx
   - Kategoriler: Stratejik Öncelikler, Kardeş Şehirler, AB/Hibe Programları,
                  Devam Eden Projeler, Uluslararası Ağ Üyelikleri, Haber/Etkinlik, İletişim, Dokümanlar
   - Not: Aşağıdaki veriler örnek/placeholder’dır; kendi liste ve PDF’lerinle güncelle.
*/

type SisterCity = { name: string; country?: string; since?: string };
type Grant = { program: string; call?: string; status: "Hazırlık" | "Başvuru" | "Kabul" | "Uygulama" | "Tamamlandı" };
type Project = { title: string; program?: string; period?: string; partners?: string[] };
type Doc = { label: string; href: string };

const STRATEJIK_ONCELIKLER = [
    "Kardeş şehir ilişkileriyle kültürel ve ekonomik iş birliklerini güçlendirmek",
    "AB ve uluslararası hibe programlarına proje geliştirmek",
    "İklim, sürdürülebilirlik ve kapsayıcılık temalarında iş birlikleri kurmak",
    "Gençlik, spor, kültür-sanat ve teknoloji odaklı değişim programlarını yaygınlaştırmak",
];

const SISTER_CITIES: SisterCity[] = [
    { name: "Örnek Şehir 1", country: "Ülke", since: "2022" },
    { name: "Örnek Şehir 2", country: "Ülke", since: "2019" },
    { name: "Örnek Şehir 3", country: "Ülke", since: "2016" },
    // TODO: Resmî listeyle güncelle
];

const GRANTS: Grant[] = [
    { program: "AB – Erasmus+ (KA210/KA220)", call: "Yerel yönetimler ortaklıkları", status: "Hazırlık" },
    { program: "AB – Ufuk Avrupa (Mission/Climate)", call: "İklim nötr kentler", status: "Başvuru" },
    { program: "IPA / Sivil Toplum", call: "Ortaklık hibeleri", status: "Uygulama" },
];

const PROJECTS: Project[] = [
    { title: "Yeşil Ataşehir – İklim Uyumu", program: "Ufuk Avrupa", period: "2025–2027", partners: ["X Belediyesi", "Y Üniversitesi"] },
    { title: "Gençlik Değişimleri", program: "Erasmus+", period: "2024–2025", partners: ["Z Şehri Gençlik Meclisi"] },
    { title: "Atıkta Döngüsel Ekonomi Pilotları", program: "IPA", period: "2024–2026" },
];

const NETWORKS = [
    "CEMR – Avrupa Belediyeler ve Bölgeler Konseyi (örnek)",
    "Energy Cities / ICLEI gibi sürdürülebilirlik ağları (örnek)",
    "Kardeş Şehirler Platformu (örnek)",
    // TODO: Gerçek üyelikler ile güncelle
];

const NEWS = [
    { date: "2024-11-12", title: "Kardeş Şehir Protokolü Taslağı Üzerinde Çalışma Toplantısı" },
    { date: "2024-09-30", title: "Erasmus+ Ortak Proje Hazırlık Ziyareti" },
];

const DOCS: Doc[] = [
    { label: "Kardeş Şehir Prosedürü (PDF)", href: "/docs/kurumsal/dis-iliskiler-kardes-sehir-prosedur.pdf" },
    { label: "Uluslararası Proje Yazım Rehberi (PDF)", href: "/docs/kurumsal/dis-iliskiler-proje-rehberi.pdf" },
    { label: "Protokol Örneği (DOCX)", href: "/docs/kurumsal/dis-iliskiler-protokol-ornek.docx" },
];

export default function DisIliskilerPage() {
    return (
        <main className="container mx-auto px-4 py-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Dış İlişkiler</h1>
            <p className="text-center text-gray-600 mb-8">
                Kardeş şehirler, uluslararası iş birlikleri, hibe programları ve proje geliştirme faaliyetleri.
            </p>

            {/* Kısayollar */}
            <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur border rounded-2xl p-3 mb-8" aria-label="Bölüm kısayolları">
                <ul className="flex flex-wrap gap-2">
                    {[
                        ["#strateji", "Stratejik Öncelikler"],
                        ["#kardes-sehirler", "Kardeş Şehirler"],
                        ["#hibe", "AB/Hibe Programları"],
                        ["#projeler", "Devam Eden Projeler"],
                        ["#ag-uyelikleri", "Ağ Üyelikleri"],
                        ["#haberler", "Haber & Etkinlik"],
                        ["#iletisim", "İletişim"],
                        ["#dokumanlar", "Dokümanlar"],
                    ].map(([href, label]) => (
                        <li key={href}>
                            <a href={href} className="inline-block rounded-xl border border-yellow-400 px-3 py-1 text-sm hover:bg-yellow-50">
                                {label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Stratejik Öncelikler */}
            <Section id="strateji" title="Stratejik Öncelikler">
                <ul className="list-disc pl-5 space-y-1">
                    {STRATEJIK_ONCELIKLER.map((t) => (
                        <li key={t}>{t}</li>
                    ))}
                </ul>
            </Section>

            {/* Kardeş Şehirler */}
            <Section id="kardes-sehirler" title="Kardeş Şehirler">
                <ul className="divide-y rounded-2xl border bg-white">
                    {SISTER_CITIES.map((s) => (
                        <li key={s.name} className="p-3 flex items-center justify-between">
                            <div>
                                <div className="font-medium">{s.name}{s.country ? `, ${s.country}` : ""}</div>
                                {s.since ? <div className="text-xs text-gray-600 mt-0.5">Protokol yılı: {s.since}</div> : null}
                            </div>
                            {/* Dilersen her şehre detay sayfası bağlayabilirsin */}
                        </li>
                    ))}
                </ul>
                <p className="text-xs text-gray-500 mt-2">Not: Liste örnektir. Resmî kardeş şehir protokolleriyle güncelleyin.</p>
            </Section>

            {/* AB / Hibe Programları */}
            <Section id="hibe" title="AB / Uluslararası Hibe Programları">
                <div className="overflow-x-auto">
                    <table className="min-w-[640px] border border-gray-200 rounded bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                {["Program", "Çağrı", "Durum"].map((h) => (
                                    <th key={h} className="text-left p-2 border-b">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {GRANTS.map((g, i) => (
                                <tr key={i} className="odd:bg-white even:bg-gray-50">
                                    <td className="p-2 border-b">{g.program}</td>
                                    <td className="p-2 border-b">{g.call ?? "-"}</td>
                                    <td className="p-2 border-b">{g.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Section>

            {/* Devam Eden Projeler */}
            <Section id="projeler" title="Devam Eden Projeler">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PROJECTS.map((p) => (
                        <div key={p.title} className="rounded-2xl border border-yellow-400 bg-white p-4">
                            <div className="font-semibold">{p.title}</div>
                            <dl className="mt-1 text-sm text-gray-700">
                                {p.program ? <div><dt className="inline font-medium">Program:</dt> <dd className="inline"> {p.program}</dd></div> : null}
                                {p.period ? <div><dt className="inline font-medium">Dönem:</dt>   <dd className="inline"> {p.period}</dd></div> : null}
                                {p.partners && p.partners.length ? (
                                    <div><dt className="inline font-medium">Ortaklar:</dt> <dd className="inline"> {p.partners.join(", ")}</dd></div>
                                ) : null}
                            </dl>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Ağ Üyelikleri */}
            <Section id="ag-uyelikleri" title="Uluslararası Ağ Üyelikleri">
                <ul className="list-disc pl-5 space-y-1">
                    {NETWORKS.map((n) => (
                        <li key={n}>{n}</li>
                    ))}
                </ul>
            </Section>

            {/* Haber & Etkinlik */}
            <Section id="haberler" title="Haberler & Etkinlikler">
                <ul className="divide-y rounded-2xl border bg-white">
                    {NEWS.map((n) => (
                        <li key={n.title} className="p-3 flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="text-xs text-gray-500">{n.date}</span>
                        </li>
                    ))}
                </ul>
            </Section>

            {/* İletişim */}
            <Section id="iletisim" title="İletişim">
                <div className="rounded-2xl border bg-white p-4">
                    <div className="font-medium">Dış İlişkiler Koordinatörlüğü</div>
                    <div className="text-sm text-gray-700 mt-1">
                        E-posta: disiliskiler@belediye.gov.tr (örnek) <br />
                        Telefon: 0 (216) 000 00 00 (örnek)
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Resmî iletişim bilgilerini burada güncelleyiniz.
                    </p>
                </div>
            </Section>

            {/* Dokümanlar */}
            <Section id="dokumanlar" title="Dokümanlar">
                <ul className="list-disc pl-5 space-y-1">
                    {DOCS.map((d) => (
                        <li key={d.label}>
                            <a className="underline" href={d.href}>{d.label}</a>
                        </li>
                    ))}
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                    PDF’leri <code>/public/docs/kurumsal/</code> klasörüne koyup bağlantıları güncelleyin.
                </p>
            </Section>
        </main>
    );
}

/* Basit bölüm bileşeni */
function Section({
    id,
    title,
    children,
}: {
    id?: string;
    title?: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className="mb-10 scroll-mt-24">
            {title ? <h2 className="text-xl font-semibold mb-3">{title}</h2> : null}
            {children}
        </section>
    );
}


