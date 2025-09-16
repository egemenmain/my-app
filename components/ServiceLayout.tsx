import React from "react";
import Link from "next/link";

type QuickAction = { label: string; href: string };
type Props = {
    title: string;
    subtitle?: string;
    quickActions?: QuickAction[];
    children: React.ReactNode;
};

const sections = [
    { id: "ozet", label: "Özet" },
    { id: "kimler", label: "Kimler Yararlanabilir?" },
    { id: "subeler", label: "Şubeler ve Saatler" },
    { id: "hizmetler", label: "Verilen Hizmetler" },
    { id: "belgeler", label: "Gerekli Belgeler" },
    { id: "kanallar", label: "Başvuru Kanalları" },
    { id: "surec", label: "Adım Adım Süreç & SLA" },
    { id: "ucret", label: "Ücret ve Muafiyet" },
    { id: "kurallar", label: "Kütüphane Kuralları" },
    { id: "erisilebilirlik", label: "Erişilebilirlik & Güvenlik" },
    { id: "kvkk", label: "KVKK & Veri Güvenliği" },
    { id: "sss", label: "SSS" },
    { id: "dokumanlar", label: "Dokümanlar" },
    { id: "duyurular", label: "Duyurular" },
    { id: "iletisim", label: "İletişim" },
];

export default function ServiceLayout({ title, subtitle, quickActions = [], children }: Props) {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
                {quickActions.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-3">
                        {quickActions.map((qa) => (
                            <Link
                                key={qa.label}
                                href={qa.href}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-95"
                                aria-label={qa.label}
                            >
                                {qa.label}
                            </Link>
                        ))}
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
                <nav className="top-24 hidden lg:block lg:sticky self-start">
                    <ul className="space-y-1">
                        {sections.map((s) => (
                            <li key={s.id}>
                                <a
                                    href={`#${s.id}`}
                                    className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                >
                                    {s.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <main className="space-y-10">{children}</main>
            </div>
        </div>
    );
}
