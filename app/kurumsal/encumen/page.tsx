type Member = { name: string; role: string };

const MEMBERS: Member[] = [
    // Sol sütun
    { name: "Hüseyin Hışman", role: "Başkan Yardımcısı – Encümen Başkan V." },
    { name: "Abubekir Bozkızıl", role: "Encümen Üyesi" },
    { name: "Orhan Aydoğdu", role: "Encümen Üyesi – Fen İşleri Müdürü" },
    { name: "Serkan Batak", role: "Encümen Üyesi – Hukuk İşleri Müdürü" },

    // Sağ sütun
    { name: "Murat Güneş", role: "Encümen Üyesi" },
    { name: "Cengiz Kayayurt", role: "Encümen Üyesi" },
    { name: "Mürteza Kutluk", role: "Encümen Üyesi – Mali Hizmetler Müdürü" },
];

export default function EncumenPage() {
    return (
        <main className="container mx-auto px-4 py-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Encümen</h1>
            <p className="text-center text-gray-600 mb-10">
                Encümen üyeleri ve görevleri.
            </p>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10">
                {MEMBERS.map((m) => (
                    <MemberItem key={m.name} name={m.name} role={m.role} />
                ))}
            </section>
        </main>
    );
}

function MemberItem({ name, role }: Member) {
    return (
        <div className="pt-1">
            {/* İsim + sağa doğru çizgi */}
            <div className="flex items-center gap-6">
                <h3 className="text-lg font-extrabold tracking-wide uppercase">
                    {name}
                </h3>
                <span className="flex-1 border-t-2 border-yellow-500" />
            </div>

            {/* Ünvan / görev */}
            <div className="mt-3 text-gray-700 uppercase tracking-wide">
                {role}
            </div>
        </div>
    );
}


