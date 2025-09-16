import Link from "next/link";

const items = [
    {
        label: "Hizmetler", href: "/hizmetler", children: [
            { label: "Bilgi Evi Hizmetleri", href: "/hizmetler/bilgi-evi-hizmetleri" },
            { label: "Dilekçe – Genel Müracaat", href: "/hizmetler/dilekce-genel-muracaat" },
            { label: "Engelli Hizmetleri", href: "/hizmetler/engelli-hizmetleri" },
            { label: "Hasta ve Yaşlı Hizmetleri", href: "/hizmetler/hasta-yasli-hizmetleri" },
            { label: "İş Müracaatları (İstihdam Merkezi)", href: "/hizmetler/is-muracaatlari-istihdam-merkezi" },
            { label: "Altyapı, Yol Bakım Onarım", href: "/hizmetler/altyapi-yol-bakim" },
            // gerekirse diğerleri
        ]
    },
    { label: "E-Belediye", href: "/e-belediye" },
    { label: "Kurumsal", href: "/kurumsal" },
];

export default function Header() {
    return (
        <header className="border-b bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
                <Link href="/" className="font-semibold">Birim Ajans Belediyesi</Link>
                <nav className="flex gap-6">
                    {items.map((it) => (
                        <div key={it.label} className="relative group">
                            <Link href={it.href} className="px-2 py-1 rounded-lg hover:bg-gray-100">{it.label}</Link>
                            {it.children && (
                                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition pointer-events-none group-hover:pointer-events-auto absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border bg-white shadow-lg">
                                    <ul className="py-2">
                                        {it.children.map((c) => (
                                            <li key={c.label}>
                                                <Link href={c.href} className="block px-4 py-2 hover:bg-gray-100">{c.label}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>
        </header>
    );
}
