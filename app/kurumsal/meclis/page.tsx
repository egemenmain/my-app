/* app/kurumsal/meclis/page.tsx */

type Member = { name: string; party?: string };

const MAYOR = { name: "Onursal Adıgüzel", role: "Belediye Başkanı" };

const MEMBERS: Member[] = [
    // 1. görsel - üst blok
    { name: "Müslüm Kocaoğlu", party: "Cumhuriyet Halk Partisi" },
    { name: "Mehmet Alver", party: "Cumhuriyet Halk Partisi" },
    { name: "Sinan Emrah Yıldırım", party: "Cumhuriyet Halk Partisi" },
    { name: "Bülent Kamış", party: "Cumhuriyet Halk Partisi" },
    { name: "Birkan Birol Yıldız", party: "Cumhuriyet Halk Partisi" },

    { name: "Muhterem Memiş", party: "Adalet ve Kalkınma Partisi" },
    { name: "Anıl Dursun", party: "Cumhuriyet Halk Partisi" },
    { name: "Rahşan Sertkaya Daniş", party: "Cumhuriyet Halk Partisi" },
    { name: "Serdar Orhan", party: "Adalet ve Kalkınma Partisi" },
    { name: "Mustafa Karaoğlu", party: "Cumhuriyet Halk Partisi" },

    { name: "Oğuz Sarul", party: "Cumhuriyet Halk Partisi" },
    { name: "Fatih Kayacı", party: "Adalet ve Kalkınma Partisi" },
    { name: "Ezgi Kalender", party: "Cumhuriyet Halk Partisi" },
    { name: "Haydar Gürkan Yıldız", party: "Cumhuriyet Halk Partisi" },
    { name: "Selman Ünal", party: "Adalet ve Kalkınma Partisi" },

    { name: "Ekrem Köse", party: "Cumhuriyet Halk Partisi" },
    { name: "Murat Can Aydın", party: "Milliyetçi Hareket Partisi" },
    { name: "Seher Gülay", party: "Cumhuriyet Halk Partisi" },
    { name: "Abubekir Bozkıl", party: "Adalet ve Kalkınma Partisi" },
    { name: "Gülayşe Durak", party: "Adalet ve Kalkınma Partisi" },

    // 2. görsel - alt blok
    { name: "Hüseyin Gültekin", party: "Cumhuriyet Halk Partisi" },
    { name: "Cemil Yardımcı", party: "Cumhuriyet Halk Partisi" },
    { name: "Levent Demirkaya", party: "Adalet ve Kalkınma Partisi" },
    { name: "Murat Güneş", party: "Cumhuriyet Halk Partisi" },
    { name: "Aytekin Şahin", party: "Cumhuriyet Halk Partisi" },

    { name: "Erdal Kaya", party: "Adalet ve Kalkınma Partisi" },
    { name: "Kaya Uluyılmaz", party: "Cumhuriyet Halk Partisi" },
    { name: "Cengiz Kayayurt", party: "Cumhuriyet Halk Partisi" },
    { name: "Fikret Aydınhan", party: "Adalet ve Kalkınma Partisi" },
    { name: "Tülay Uçar", party: "Cumhuriyet Halk Partisi" },

    { name: "Güray Özay", party: "Milliyetçi Hareket Partisi" },
    { name: "Livan Gür", party: "Cumhuriyet Halk Partisi" },
    { name: "Abdullah Aslan", party: "Cumhuriyet Halk Partisi" },
    { name: "Abubekir Uçan", party: "Adalet ve Kalkınma Partisi" },
    { name: "Fatih Evliyaoğlu", party: "Cumhuriyet Halk Partisi" },

    { name: "Ferda Altıntaş", party: "Cumhuriyet Halk Partisi" },
    { name: "Şerafettin Ay", party: "Adalet ve Kalkınma Partisi" },
];

export default function MeclisPage() {
    return (
        <main className="container mx-auto px-4 py-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Meclis</h1>
            <p className="text-center text-gray-600 mb-10">
                Belediye meclisi üyeleri (görselsiz, isim ve parti bilgisiyle).
            </p>

            {/* Başkan (ayrı kart) */}
            <div className="max-w-md mx-auto mb-8">
                <div className="rounded-2xl border border-yellow-400 bg-white p-4 text-center shadow-sm">
                    <div className="font-semibold">{MAYOR.name}</div>
                    <div className="text-sm text-gray-600">{MAYOR.role}</div>
                </div>
            </div>

            {/* Üye listesi */}
            <section>
                <h2 className="text-xl font-semibold mb-3">Meclis Üyeleri</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {MEMBERS.map((m) => (
                        <li
                            key={m.name}
                            className="rounded-xl border border-yellow-400 bg-white p-3"
                        >
                            <div className="font-medium">{m.name}</div>
                            {m.party ? (
                                <div className="text-xs text-gray-600 mt-0.5">{m.party}</div>
                            ) : null}
                        </li>
                    ))}
                </ul>
            </section>

            <p className="text-xs text-gray-500 mt-6">
                Not: Liste, sağlanan görsellerdeki isimlere göre derlenmiştir.
            </p>
        </main>
    );
}


