export type NavItem = {
    title: string;
    href?: string;
    children?: NavItem[];
    match?: string[]; // aktiflik için kapsayan rotalar
};

export const NAV: NavItem[] = [
    { title: "Ana Sayfa", href: "/" },

    // 1) KURUMSAL — görseldeki sıra + önceki ekler en alta (tekilleştir)
    {
        title: "Kurumsal",
        children: [
            { title: "Yönetim Şeması", href: "/kurumsal/yonetim-semasi" },
            { title: "Meclis", href: "/kurumsal/meclis" },
            { title: "Encümen", href: "/kurumsal/encumen" },
            { title: "Dış İlişkiler", href: "/kurumsal/dis-iliskiler" },
            // (önceden bizde olan ekler)
            { title: "Hakkımızda", href: "/hakkimizda" },
            { title: "İletişim", href: "/iletisim" }
        ],
        match: [
            "/kurumsal", "/kurumsal/yonetim-semasi", "/kurumsal/meclis", "/kurumsal/encumen",
            "/kurumsal/dokumanlar", "/kurumsal/dis-iliskiler",
            "/hakkimizda", "/kariyer", "/iletisim"
        ]
    },

    // 2) HİZMETLERİMİZ — Birim Ajans Belediyesi ile ortak hizmetler önce sıralandı
    {
        title: "Hizmetlerimiz",
        href: "/hizmetler",
        children: [
            // Birim Ajans Belediyesi ile ortak hizmetler (17 adet)
            { title: "Altyapı, Yol Bakım Onarım Hizmetleri", href: "/hizmetler/altyapi-yol-bakim-onarim" },
            { title: "Araç Talepleri", href: "/hizmetler/arac-talepleri" },
            { title: "Bilgi Evi Hizmetleri", href: "/hizmetler/bilgi-evi-hizmetleri" },
            { title: "Çevre Koruma ve Geri Dönüşüm", href: "/hizmetler/cevre-koruma-geri-donusum" },
            { title: "Dilekçe – Genel Müracaat", href: "/hizmetler/dilekce-genel-muracaat" },
            { title: "Diyetisyenlik ve Psikolojik Danışmanlık", href: "/hizmetler/diyetisyenlik-ve-psikolojik-danismanlik" },
            { title: "Engelli Hizmetleri", href: "/hizmetler/engelli-hizmetleri" },
            { title: "Evlendirme ve Nikah İşlemleri", href: "/hizmetler/evlendirme-ve-nikah-islemleri" },
            { title: "Hasta ve Yaşlı Hizmetleri", href: "/hizmetler/hasta-ve-yasli-hizmetleri" },
            { title: "İmar ve Şehircilik Hizmetleri", href: "/hizmetler/imar-sehircilik-hizmetleri" },
            { title: "İş Müracaatları (İstihdam Merkezi)", href: "/hizmetler/is-muracaatlari-istihdam-merkezi" },
            { title: "İşyeri Ruhsatları", href: "/hizmetler/isyeri-ruhsatlari" },
            { title: "Kiralama / Ecrimisil / Kamulaştırma", href: "/hizmetler/kiralama-ecrimisil-kamulastirma" },
            { title: "Kültür Sanat Hizmetleri", href: "/hizmetler/kultur-sanat-hizmetleri" },
            { title: "Mali Hizmetler", href: "/hizmetler/mali-hizmetler" },
            { title: "Sosyal Yardım Hizmetleri", href: "/hizmetler/sosyal-yardim-hizmetleri" },
            { title: "Zabıta Hizmetleri", href: "/hizmetler/zabita-hizmetleri" },

            // Birim Ajans Belediyesi'ne özel hizmetler (9 adet)
            { title: "Çevre Temizlik – Geri Dönüşüm", href: "/hizmetler/cevre-temizlik-geri-donusum" },
            { title: "Kentsel Dönüşüm Hizmetleri", href: "/hizmetler/kentsel-donusum-hizmetleri" },
            { title: "Meslek ve Sanat Eğitimleri", href: "/hizmetler/meslek-sanat-egitimleri" },
            { title: "Park ve Yeşil Alan Hizmetleri", href: "/hizmetler/park-ve-yesil-alan-hizmetleri" },
            { title: "Spor Hizmetleri", href: "/hizmetler/spor-hizmetleri" },
            { title: "Tebrik Ziyaretleri", href: "/hizmetler/tebrik-ziyaretleri" },
            { title: "Ücretler ve Tarifeler", href: "/hizmetler/ucretler-tarifeler" },
            { title: "Veteriner Hizmetleri", href: "/hizmetler/veteriner-hizmetleri" },
            { title: "Yapı Kontrol ve Asansör Tescil Hizmetleri", href: "/hizmetler/yapi-kontrol-asansor-tescil" }
        ],
        match: ["/hizmetler"]
    },

    // 3) E-Belediye NAV'dan ÇIKACAK → sağda CTA
    // { title: "E-Belediye", href: "/ebelediye" },

    { title: "Çözüm Merkezi", href: "/cozum-merkezi" },
    { title: "Online Randevu", href: "/randevu" },

    {
        title: "Güncel",
        children: [
            { title: "Duyurular & Haberler", href: "/duyurular" },
            { title: "Etkinlik Takvimi", href: "/etkinlikler" }
        ],
        match: ["/duyurular", "/etkinlikler"]
    }
];