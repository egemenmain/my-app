"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, CreditCard, CircleHelp, NotebookPen } from "lucide-react";

interface MenuItem {
    title: string;
    href: string;
}

interface MenuGroup {
    id: string;
    title: string;
    icon: string;
    items: MenuItem[];
}

interface EBelediyeMenu {
    groups: MenuGroup[];
}

const iconMap = {
    CreditCard,
    CircleHelp,
    NotebookPen,
};

export default function EBelediyeSidebar() {
    const pathname = usePathname();
    const [openGroups, setOpenGroups] = useState<string[]>(["e-odeme"]); // İlk grup açık

    // Menü verisini statik olarak tanımlıyoruz (JSON dosyasından okumak için API route gerekir)
    const menuData: EBelediyeMenu = {
        "groups": [
            {
                "id": "e-odeme",
                "title": "E-ÖDEME",
                "icon": "CreditCard",
                "items": [
                    { "title": "Vergi Ödeme", "href": "/ebelediye/vergi-odeme" },
                    { "title": "Vergi Takvimi ve Beyanname", "href": "/ebelediye/vergi-takvimi-beyanname" },
                    { "title": "Banka ve Posta Bilgileri", "href": "/ebelediye/banka-posta-bilgileri" }
                ]
            },
            {
                "id": "e-sorgulama",
                "title": "E-SORGULAMA",
                "icon": "CircleHelp",
                "items": [
                    { "title": "Birim Ajans Kent Rehberi", "href": "/hizmetler/kent-rehberi" },
                    { "title": "İmar Sorgulama", "href": "/imar" },
                    { "title": "Ruhsat Başvuru Sorgulama", "href": "/ebelediye?tab=ruhsat" },
                    { "title": "Yapı Kontrol Dosya Arama", "href": "/imar?view=yapi-kontrol" },
                    { "title": "İmar Dosya Arama (Ebys)", "href": "/imar?view=ebys" },
                    { "title": "Vefat Edenler", "href": "/hizmetler/mezarlik-islemleri" },
                    { "title": "Asansör Periyodik Muayenesi", "href": "/hizmetler/yapi-kontrol-asansor-tescil" },
                    { "title": "Askıda İmar/Plan Tadilat İlanları", "href": "/imar/askida-ilanlar" },
                    { "title": "Rayiç Değerler", "href": "/hizmetler/ucretler-tarifeler?view=rayic" }
                ]
            },
            {
                "id": "e-basvuru",
                "title": "E-BAŞVURU",
                "icon": "NotebookPen",
                "items": [
                    { "title": "Emlak Beyan Oluşturma", "href": "/ebelediye/emlak-beyan" },
                    { "title": "İlan Reklam Beyan Oluşturma", "href": "/ebelediye/ilan-reklam-beyan" },
                    { "title": "Köpek Eğitim Başvurusu", "href": "/hizmetler/veteriner-hizmetleri?form=kopek-egitim" },
                    { "title": "Hayvanlarda İlk Yardım", "href": "/hizmetler/veteriner-hizmetleri?form=ilk-yardim" },
                    { "title": "Hayvan Sahiplenme", "href": "/hizmetler/veteriner-hizmetleri?form=sahiplenme" },
                    { "title": "Birim Ajans'ta Staj Bir Başka", "href": "/kariyer?program=staj" },
                    { "title": "Bilgi Edinme", "href": "/ebelediye/bilgi-edinme" },
                    { "title": "Çözüm Merkezi", "href": "/cozum-merkezi?view=basvuru" },
                    { "title": "Çözüm Merkezi Öneri Şikayet Formu", "href": "/cozum-merkezi?view=basvuru&tip=onerisikayet" },
                    { "title": "Sosyal Yardım Hizmetleri", "href": "/hizmetler/sosyal-yardim-hizmetleri" },
                    { "title": "Eğitim ve Kurs Kayıtları", "href": "/hizmetler/meslek-sanat-egitimleri?form=kayit" },
                    { "title": "Hoş Geldin Bebek", "href": "/hizmetler/sosyal-yardim-hizmetleri?program=hos-geldin-bebek" },
                    { "title": "Engelli Hizmetleri", "href": "/hizmetler/engelli-hizmetleri" }
                ]
            }
        ]
    };

    const toggleGroup = (groupId: string) => {
        setOpenGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const isActive = (href: string) => {
        // Query parametrelerini kaldır
        const cleanHref = href.split('?')[0];
        const cleanPathname = pathname.split('?')[0];

        if (cleanHref === cleanPathname) return true;

        // E-Belediye ana sayfası için özel kontrol
        if (cleanHref === "/ebelediye" && cleanPathname === "/ebelediye") return true;

        return false;
    };

    return (
        <div className="sticky top-24 max-h-[70vh] overflow-auto rounded-2xl border border-border bg-white shadow-card">
            <div className="p-4">
                {menuData.groups.map((group) => {
                    const IconComponent = iconMap[group.icon as keyof typeof iconMap];
                    const isOpen = openGroups.includes(group.id);

                    return (
                        <div key={group.id} className="mb-4 last:mb-0">
                            {/* Grup Başlığı */}
                            <button
                                onClick={() => toggleGroup(group.id)}
                                className="flex w-full items-center justify-between rounded-lg bg-[#fff6d6] px-3 py-2 text-left text-sm font-semibold text-primary hover:bg-[#E4B100] transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    {IconComponent && <IconComponent className="w-4 h-4" />}
                                    {group.title}
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Grup İçeriği */}
                            {isOpen && (
                                <div className="mt-2 space-y-1">
                                    {group.items.map((item, index) => (
                                        <Link
                                            key={index}
                                            href={item.href}
                                            className={`block rounded-lg px-3 py-2 text-sm text-textPrimary transition-colors hover:bg-[#fff6d6] hover:text-primary ${isActive(item.href)
                                                ? 'bg-[#fff6d6] text-primary font-medium'
                                                : ''
                                                }`}
                                        >
                                            {item.title}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
