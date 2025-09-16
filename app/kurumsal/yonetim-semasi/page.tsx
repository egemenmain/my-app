/* app/kurumsal/yonetim-semasi/page.tsx */

export default function YonetimSemasiPage() {
    // Başkan yardımcıları (isim)
    const baskanYardimcilari = [
        "Birkan Birol Yıldız",
        "Hüseyin Hışman",
        "Orhan Aydoğdu",
        "Oğuz Kaya",
        "Onur Öksel",
    ];

    // Başkana bağlı birimler (ünvan — isim)
    const bagliBirimler = [
        "Özel Kalem Müdürü — Alpay Arslan",
        "İç Denetim Müdürü — Aysel Gürkan",
        "Teftiş Kurulu Müdürü — Nihat Sarı",
    ];

    // Müdürlükler (ünvan — isim) — tüm yardımcılar altındaki birimler tek listede
    const mudurlukler = [
        // Birkan Birol Yıldız
        "Basın Yayın ve Halkla İlişkiler Müdürü — Önder Keklikli",
        "Destek Hizmetleri Müdürü — Engin Yaşar Kıcı",
        "Mali Hizmetler Müdürü — Mürteza Kutluk",
        "Strateji Geliştirme Müdürü — Devran Çakmak (Vekaleten)",
        "Yapı Kontrol Müdürü — Aysun Gökçen",

        // Hüseyin Hışman
        "İnsan Kaynakları ve Eğitim Müdürü — Alpay Arslan (Vekaleten)",
        "Ruhsat Denetim Müdürü — Elgün Emre Yamaner",
        "Spor İşleri Müdürü — Tarkan Mercul",
        "Yazı İşleri Müdürü — Abdüsselam Er",

        // Orhan Aydoğdu
        "Fen İşleri Müdürü — Orhan Aydoğdu (Vekaleten)",
        "Park ve Bahçeler Müdürü — Basri Onur Dedetaş",
        "Ulaşım Hizmetleri Müdürü — Barış Argunşaş",
        "İklim Değişikliği ve Sıfır Atık Müdürü — Çiğdem Kara",
        "Veteriner İşleri Müdürü — Murat Dursun",
        "Etüt ve Proje Müdürü — Seda Çalık",
        "Temizlik İşleri Müdürü — Cihan Karakaş",

        // Oğuz Kaya
        "Emlak ve İstimlak Müdürü — Olcay Akdoğan",
        "Afet İşleri Müdürü — Mahmut Murt",
        "İmar ve Şehircilik Müdürü — Gülbin Ergünay",
        "Kentsel Dönüşüm Müdürü — Mehmet Akif Toprak",
        "Plan ve Proje Müdürü — Nimet Karademir",

        // Onur Öksel
        "Bilgi İşlem Müdürü — Hasan Güneydaş",
        "Kültür ve Sosyal İşler Müdürü — Devran Çakmak",
        "Sağlık İşleri Müdürü — Oktay Nesimi Yılmaz",
        "Zabıta Müdürü — Mehmet Yılmaz",
        "Hukuk İşleri Müdürü — Serkan Batak",
        "Sosyal Destek Hizmetleri Müdürü — Dilek Karabenk Gürsu",
    ];

    return (
        <main className="container mx-auto px-4 py-10">
            {/* Başlık */}
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">
                Yönetim Şeması
            </h1>
            <p className="text-center text-gray-600 mb-10">
                Ataşehir Belediyesi örnek alınarak temsili biçimde hazırlanmıştır.
            </p>

            {/* Belediye Başkanı */}
            <div className="max-w-2xl mx-auto mb-10">
                <Card title="Belediye Başkanı" subtitle="Onursal Adıgüzel" />
            </div>

            {/* Başkan Yardımcıları */}
            <Section title="Başkan Yardımcıları">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {baskanYardimcilari.map((y, i) => (
                        <Card key={i} title={y} />
                    ))}
                </div>
            </Section>

            {/* Bağlı Birimler */}
            <Section title="Başkana Bağlı Birimler">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bagliBirimler.map((b, i) => (
                        <Card key={i} title={b} />
                    ))}
                </div>
            </Section>

            {/* Müdürlükler */}
            <Section title="Müdürlükler">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mudurlukler.map((m, i) => (
                        <Card key={i} title={m} />
                    ))}
                </div>
            </Section>

            <p className="text-xs text-gray-500 mt-10">
                Not: Görevlendirmeler zamanla değişebilir.
            </p>
        </main>
    );
}

/* Yardımcı bileşenler */
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

function Card({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="rounded-2xl border border-yellow-400 p-4 shadow-sm bg-white">
            <div className="font-medium">{title}</div>
            {subtitle ? <div className="text-gray-500 text-sm mt-1">{subtitle}</div> : null}
        </div>
    );
}
