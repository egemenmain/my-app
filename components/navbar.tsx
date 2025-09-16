"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV, NavItem } from "@/config/nav";
import { ArrowRight } from "lucide-react";

function isActive(pathname: string, item: NavItem) {
    if (item.href && pathname === item.href) return true;
    if (item.match) return item.match.some((m) => pathname.startsWith(m));
    return false;
}

export default function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <header className="sticky top-0 z-[60] bg-white/90 backdrop-blur border-b border-border overflow-visible">
            <nav className="mx-auto max-w-7xl px-4 md:px-6 relative overflow-visible">
                <div className="flex items-center justify-between h-14 gap-3">
                    {/* logo */}
                    <Link href="/" className="inline-flex items-center gap-2">
                        <span className="rounded-xl bg-primary px-3 py-1.5 font-semibold text-black">
                            Birim Ajans Belediyesi
                        </span>
                    </Link>

                    {/* DESKTOP NAV */}
                    <ul className="hidden md:flex items-center gap-5">
                        {NAV.map((item, i) => {
                            const active = isActive(pathname, item);
                            const hasChildren = !!item.children?.length;

                            return (
                                // Trigger + dropdown aynı <li> içinde → dışına çıkınca kapanır
                                <li
                                    key={item.title}
                                    className="relative"
                                    onMouseEnter={() => hasChildren ? setOpenIndex(i) : setOpenIndex(null)}
                                    onMouseLeave={() => setOpenIndex(null)}
                                >
                                    <Link
                                        href={item.href ?? "#"}
                                        className={`text-sm ${active ? "text-primary underline underline-offset-4" : "text-textPrimary"} hover:text-primary transition`}
                                        aria-expanded={openIndex === i}
                                    >
                                        {item.title}
                                    </Link>

                                    {hasChildren && (
                                        <div
                                            // GAP yok: pt-2. Geniş menüler için sabit genişlik.
                                            className={`absolute left-0 top-full pt-2 ${item.title === "Hizmetlerimiz" ? "w-[720px]" : "w-64"} ${openIndex === i ? "" : "hidden"} overflow-visible`}
                                        >
                                            <div className="relative z-[70] rounded-xl border border-border bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
                                                {item.title === "Hizmetlerimiz" ? (
                                                    <div className="max-h-[60vh] overflow-auto">
                                                        <ul className="grid grid-cols-2">
                                                            {item.children!.map((c) => (
                                                                <li key={c.title} className="border-b border-border/60">
                                                                    <Link href={c.href ?? "#"} className="flex items-center gap-2 px-3 py-2 text-sm text-textPrimary hover:bg-[#fff6d6] hover:text-primary transition-colors">
                                                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/80 flex-shrink-0" />
                                                                        {c.title}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    <ul className="py-1">
                                                        {item.children!.map((c) => (
                                                            <li key={c.title}>
                                                                <Link href={c.href ?? "#"} className="flex items-center gap-2 px-3 py-2 text-sm text-textPrimary hover:bg-[#fff6d6] hover:text-primary transition-colors">
                                                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/80 flex-shrink-0" />
                                                                    {c.title}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>

                    {/* Sağda E-Belediye CTA */}
                    <div className="hidden md:flex items-center">
                        <Link href="/ebelediye" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-[#E4B100] transition">
                            E-BELEDİYE <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* MOBILE button */}
                    <button
                        className="md:hidden inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-sm"
                        onClick={() => setMobileOpen(v => !v)}
                        aria-expanded={mobileOpen}
                        aria-label="Menüyü Aç/Kapat"
                    >
                        Menü
                    </button>
                </div>

                {/* Mobile drawer (kısa) */}
                {mobileOpen && (
                    <div className="md:hidden pb-3">
                        <ul className="flex flex-col gap-1">
                            {NAV.map((item, idx) => (
                                <li key={item.title} className="border-b border-border">
                                    <Link href={item.href ?? "#"} className="block px-3 py-2 text-sm text-textPrimary">
                                        {item.title}
                                    </Link>
                                    {item.children?.length ? (
                                        <ul className="pb-2">
                                            {item.children.map((c) => (
                                                <li key={c.title}>
                                                    <Link
                                                        href={c.href ?? "#"}
                                                        className="block rounded-lg px-5 py-2 text-sm text-textPrimary hover:bg-[#fff6d6]"
                                                    >
                                                        {c.title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </li>
                            ))}
                            {/* Mobile'de CTA */}
                            <li className="px-3 pt-2">
                                <Link
                                    href="/ebelediye"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-[#E4B100]"
                                >
                                    E-BELEDİYE <ArrowRight className="w-4 h-4" />
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}
            </nav>
        </header>
    );
}