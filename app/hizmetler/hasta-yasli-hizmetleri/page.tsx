import ServiceLayout from "@/components/ServiceLayout";
import Section from "@/components/Section";
import FAQAccordion, { FAQ } from "@/components/FAQAccordion";
import Callout from "@/components/Callout";
import Badge from "@/components/Badge";

export const metadata = {
    title: "Hasta ve Yaşlı Hizmetleri | Birim Ajans Belediyesi",
    description:
        "Evde sağlık koordinasyonu, refakatçi mola hizmeti, sıcak yemek, ev temizliği, ilaç hatırlatma, evde bakım ve palyatif destek.",
};

export default function Page() {
    const faqs: FAQ[] = [
        { q: "Kimler yararlanabilir?", a: <>İlçede ikamet eden, 65+ veya kronik hastalığı/raporlu bakıma ihtiyacı olan bireyler ve bakıcıları. Öncelik: yalnız yaşayan, ekonomik dezavantajlı, hareket kısıtlılığı olan kişiler.</> },
        { q: "Evde hemşirelik hizmetini belediye mi veriyor?", a: <>Temel hizmetleri belediye koordine eder; hemşirelik, hekim ve palyatif hizmetler Sağlık Bakanlığı/İSM ile iş birliği içinde yönlendirilir.</> },
        { q: "Refakatçi mola hizmeti nedir?", a: <>Bakım veren kişiye 3–6 saatlik nefes arası sağlayan planlı destek hizmetidir; haftalık kota uygulanır.</> },
        { q: "Dementia/Alzheimer için özel destek var mı?", a: <>Evet. Ev güvenliği değerlendirmesi, hatırlatma çözümleri, bakım veren eğitimleri ve gündüz destek merkezi yönlendirmesi yapılır.</> },
        { q: "Sıcak yemek nasıl dağıtılıyor?", a: <>Gıda güvenliği kurallarına uygun, tek kullanımlık kaplarda günde 1 öğün; beslenme kısıtları (tuzsuz/şekersiz) dikkate alınır.</> },
        { q: "Ev temizliği ve küçük onarım yapılıyor mu?", a: <>Ağır işleri içermeyen hijyen desteği ve küçük güvenlik düzenlemeleri (tutamak, halı sabitleme) randevuyla sağlanır.</> },
        { q: "İlaç hatırlatma nasıl çalışır?", a: <>Mobil çağrı/SMS ve basit doz kutusu desteği; hekim reçetesine müdahale edilmez.</> },
        { q: "Ücret var mı?", a: <>Temel hizmetler ücretsizdir. Tüketim malzemeleri ve özel talep malzemeleri (ör. yetişkin bezleri) için katkı payı belirlenebilir.</> },
        { q: "Acil durumda kimi aramalıyım?", a: <>112 Acil ilk sıradadır. Sonrasında 7/24 çağrı hattımızı arayarak kayıt oluşturun.</> },
        { q: "Erkek/Kadın personel talep edebilir miyim?", a: <>Mümkün olduğunda planlama buna göre yapılır; güvenlik ve mahremiyet önceliğimizdir.</> },
        { q: "Evcil hayvan var, sorun olur mu?", a: <>Hayır; alerji/çekince varsa personel değişimi planlanır. Ziyaret sırasında hayvanın güvenliği sağlanmalıdır.</> },
        { q: "Hafta sonu hizmet var mı?", a: <>Acil bakım koordinasyonu 7/24; planlı ev hizmetleri hafta içidir. Özel durumlarda nöbet planı yapılabilir.</> },
        { q: "Ekipman ödünç alabilir miyim?", a: <>Yatak, yürüteç, tekerlekli sandalye için ödünç/zimmet sistemi vardır; iade/onarım koşulları sözleşmede yer alır.</> },
        { q: "Verilerim güvende mi?", a: <>Sağlık verileri özel nitelikli kişisel veridir; KVKK kapsamında saklanır, üçüncü kişilerle paylaşılmaz.</> },
    ];

    return (
        <ServiceLayout
            title="Hasta ve Yaşlı Hizmetleri"
            subtitle="Evde bakım koordinasyonu, refakatçi mola, sıcak yemek ve güvenli yaşam desteği"
            quickActions={[
                { label: "Başvuru Yap", href: "/e-belediye/basvuru?service=hasta-yasli" },
                { label: "Acil Çağrı (7/24)", href: "/cagri-merkezi" },
                { label: "Durumu Takip Et", href: "/basvuru-takip" },
            ]}
        >
            <Section id="ozet" title="Özet">
                <div className="space-y-4">
                    <p>
                        Birim Ajans Belediyesi <strong>Hasta ve Yaşlı Hizmetleri</strong>; evde yaşamı kolaylaştırmak için
                        <strong> bakım koordinasyonu</strong>, <strong>refakatçi mola</strong>, <strong>sıcak yemek</strong>,
                        <strong> ev temizliği</strong>, <strong>ilaç hatırlatma</strong>, <strong>ekipman ödünç</strong> ve
                        <strong> palyatif destek yönlendirmesi</strong> sunar.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Badge tone="danger">Acil: 112</Badge>
                        <Badge tone="warning">Yüksek Risk</Badge>
                        <Badge tone="success">Önceliklendirme: Yaş 80+</Badge>
                        <Badge>Bakım Veren Desteği</Badge>
                    </div>
                    <Callout tone="warning" title="Önemli">
                        Ev içi acil belirtiler (şiddetli nefes darlığı, bilinç kaybı, kontrolsüz kanama) için <strong>önce 112</strong>'yi arayın.
                        Belediyenin hizmetleri acil tıbbi müdahale yerine geçmez.
                    </Callout>
                </div>
            </Section>

            <Section id="kimler" title="Kimler Yararlanabilir? (Öncelik Kriterleri)">
                <ul className="list-disc pl-5 space-y-1">
                    <li>İlçe sınırlarında ikamet eden <strong>65 yaş ve üzeri</strong> bireyler</li>
                    <li>Kronik hastalığı, engeli veya palyatif bakım ihtiyacı olan yetişkinler</li>
                    <li>Yalnız yaşayanlar veya bakım veren desteğine ihtiyacı olan haneler</li>
                    <li><em>Öncelik puanı</em>: yaş, fonksiyonel durum, gelir, aciliyet, yalnızlık</li>
                </ul>
            </Section>

            <Section id="subeler" title="Hizmet Kapsamı ve Koordinasyon">
                <ul className="space-y-2">
                    <li><strong>Evde Yaşam Destek Ekibi</strong> — Planlı ziyaretler, risk değerlendirmesi, bakım planı</li>
                    <li><strong>Bakım Veren Destek Hattı</strong> — Eğitim materyalleri, psikososyal destek, mola planı</li>
                    <li><strong>Sağlık Kurumlarıyla İş Birliği</strong> — Evde sağlık / aile hekimliği / palyatif merkez yönlendirmesi</li>
                </ul>
            </Section>

            <Section id="hizmetler" title="Verilen Hizmetler (Modüller)">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <h3 className="font-semibold">1) Evde Bakım Koordinasyonu</h3>
                        <ul className="list-disc pl-5">
                            <li>Günlük yaşam aktiviteleri değerlendirmesi (banyo, giyinme, beslenme, mobilite)</li>
                            <li>Ev güvenliği: düşme risk analizi, halı/aydınlatma/merdiven kontrolleri</li>
                            <li>Bakım planı: görev listesi, ziyaret sıklığı, sorumlu kişi</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold">2) Refakatçi Mola Hizmeti</h3>
                        <ul className="list-disc pl-5">
                            <li>Bakım veren için 3–6 saatlik mola seansı (haftalık kota)</li>
                            <li>Demans/deliryum yönetimi için gözetimli aktivite önerileri</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold">3) Sıcak Yemek ve Beslenme</h3>
                        <ul className="list-disc pl-5">
                            <li>Günde 1 öğün; diyet kısıtları (tuzsuz/şekersiz/glütensiz) seçeneği</li>
                            <li>Yalnız yaşayan ve yemek hazırlayamayanlar öncelikli</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold">4) Ev Temizliği ve Hijyen</h3>
                        <ul className="list-disc pl-5">
                            <li>Temel hijyen (süpürme, silme, banyo/tuvalet temizliği)</li>
                            <li>Ağır kaldırma, tadilat ve cam dış temizliği kapsam dışıdır</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold">5) İlaç Hatırlatma & Takip</h3>
                        <ul className="list-disc pl-5">
                            <li>SMS/otomatik çağrı; haftalık doz kutusu desteği</li>
                            <li>Reçete değişiklikleri yalnızca hekim talimatı ile güncellenir</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold">6) Ekipman Ödünç ve Küçük Düzenleme</h3>
                        <ul className="list-disc pl-5">
                            <li>Yatak, tekerlekli sandalye, yürüteç (zimmet sözleşmesi)</li>
                            <li>Ev içi küçük güvenlik düzenlemeleri (tutamak, kaymaz bant)</li>
                        </ul>
                    </div>
                </div>
                <Callout tone="info" title="Kapsam Dışı Örnekler">
                    Yoğun bakım düzeyi tıbbi işlemler, hekim reçetesi düzenleme, evde enjeksiyon/serum (sağlık kuruluşu yetkisindedir),
                    ağır tadilat/taşıma hizmetleri bu kapsamda değildir.
                </Callout>
            </Section>

            <Section id="belgeler" title="Gerekli Belgeler">
                <ul className="list-disc pl-5 space-y-1">
                    <li>Kimlik ve iletişim bilgileri, ikamet belgesi</li>
                    <li>Sağlık durumunu gösterir rapor/epikriz (varsa)</li>
                    <li>Bakım veren bilgisi ve acil iletişim kişisi</li>
                    <li>Beslenme kısıtları, alerjiler ve düzenli ilaç listesi</li>
                </ul>
            </Section>

            <Section id="kanallar" title="Başvuru Kanalları">
                <ul className="list-disc pl-5 space-y-1">
                    <li><a className="text-blue-700 underline" href="#">e-Belediye → Hasta & Yaşlı Başvurusu</a></li>
                    <li>7/24 <strong>Çağrı Merkezi</strong>: 444 0 XXX</li>
                    <li>Yüz yüze: Sosyal Yardım Hizmet Noktaları</li>
                </ul>
            </Section>

            <Section id="surec" title="Adım Adım Süreç & Hizmet Standardı (SLA)">
                <ol className="list-decimal pl-5 space-y-1">
                    <li>Ön başvuru ve kısa tarama (telefon/online)</li>
                    <li>Ev ziyareti ve <strong>Risk Değerlendirmesi</strong> (düşme, beslenme, bilişsel durum)</li>
                    <li>Bakım planı onayı (ziyaret sıklığı, sorumlu ekip, modüller)</li>
                    <li>Hizmet başlangıcı ve aylık gözden geçirme</li>
                </ol>
                <ul className="mt-4 list-disc pl-5 text-sm text-gray-700">
                    <li><strong>Acil koordinasyon:</strong> 0–24 saat</li>
                    <li><strong>İlk ev ziyareti:</strong> 3 iş günü</li>
                    <li><strong>Sıcak yemek başlangıcı:</strong> 2–5 iş günü</li>
                    <li><strong>Ev temizliği randevusu:</strong> 5–10 iş günü</li>
                </ul>
            </Section>

            <Section id="ucret" title="Ücret & Muafiyet">
                <p>Temel hizmetler <strong>ücretsizdir</strong>. Tüketim malzemeleri ve özel isteğe bağlı hizmetlerde
                    düşük gelirli hanelere <strong>tam muafiyet</strong> uygulanır. Katkı payları "Ücretler ve Tarifeler"de yayımlanır.</p>
            </Section>

            <Section id="erisilebilirlik" title="Erişilebilirlik, Güvenlik ve Mahremiyet">
                <ul className="list-disc pl-5 space-y-1">
                    <li>Personel kimlik kartı ve randevu kodu ile giriş yapar</li>
                    <li>Kadın/erkek personel tercihi mümkün olduğunca karşılanır</li>
                    <li>Kişisel veriler ve ev içi görüntü kaydı paylaşılmaz</li>
                    <li>Enfeksiyon kontrolü: el hijyeni, tek kullanımlık sarf, maske prosedürleri</li>
                </ul>
            </Section>

            <Section id="kvkk" title="KVKK & Veri Güvenliği">
                <ul className="list-disc pl-5 space-y-1">
                    <li>Veriler yalnızca hizmet sunumu amacıyla işlenir; üçüncü kişilerle paylaşılmaz</li>
                    <li>Sağlık verileri özel niteliktedir; erişim rol-temelli yetkilerle sınırlandırılır</li>
                    <li>Kişisel veri talepleriniz için <a className="text-blue-700 underline" href="#">KVKK Başvuru Formu</a>nu kullanın</li>
                </ul>
            </Section>

            <Section id="sss" title="Sık Sorulan Sorular">
                <FAQAccordion items={faqs} />
            </Section>

            <Section id="dokumanlar" title="Dokümanlar">
                <ul className="list-disc pl-5 space-y-1">
                    <li><a className="text-blue-700 underline" href="#">Hasta & Yaşlı Başvuru Formu (PDF)</a></li>
                    <li><a className="text-blue-700 underline" href="#">Bakım Planı Onay Formu (PDF)</a></li>
                    <li><a className="text-blue-700 underline" href="#">Ekipman Zimmet/İade Formu (PDF)</a></li>
                    <li><a className="text-blue-700 underline" href="#">Refakatçi Mola Hizmeti Onayı (PDF)</a></li>
                    <li><a className="text-blue-700 underline" href="#">KVKK Aydınlatma Metni (PDF)</a></li>
                </ul>
            </Section>

            <Section id="duyurular" title="Duyurular">
                <ul className="list-disc pl-5 space-y-1">
                    <li>Kış Dönemi Ziyaret Planı ve Grip Önlemleri</li>
                    <li>Beslenme Danışmanlığı Randevu Takvimi</li>
                    <li>Bakım Veren Eğitim Atölyeleri — {new Date().getFullYear()}</li>
                </ul>
            </Section>

            <Section id="iletisim" title="İletişim">
                <p><strong>Sosyal Yardım İşleri Müdürlüğü — Evde Yaşam Destek Ekibi</strong></p>
                <p>E-posta: <a className="text-blue-700 underline" href="mailto:evdestek@birimajans.bel.tr">evdestek@birimajans.bel.tr</a> • Çağrı Merkezi: 444 0 XXX (7/24)</p>
                <p>Adres: Birim Ajans Belediyesi Hizmet Binası, [adres]</p>
            </Section>
        </ServiceLayout>
    );
}











