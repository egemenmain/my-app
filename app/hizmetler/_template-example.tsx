/**
 * HİZMET SAYFASI ŞABLONU
 * 
 * Bu dosya yeni hizmet sayfaları oluşturmak için şablon olarak kullanılır.
 * Kopyalayıp yeni bir sayfa oluştururken:
 * 1. Dosya adını değiştirin (örn: altyapi-yol-bakim/page.tsx)
 * 2. Aşağıdaki placeholder'ları gerçek içerikle değiştirin
 * 3. Gerekli bölümleri kaldırın veya ekleyin
 * 4. FAQ listesini güncelleyin
 * 5. Quick actions linklerini gerçek URL'lerle değiştirin
 */

import ServiceLayout from "@/components/ServiceLayout";
import Section from "@/components/Section";
import FAQAccordion, { FAQ } from "@/components/FAQAccordion";

// Sayfa meta bilgileri - SEO için önemli
export const metadata = {
    title: "HİZMET ADI | Birim Ajans Belediyesi", // Hizmet adını buraya yazın
    description: "Hizmet kısa açıklaması buraya gelecek.", // Kısa açıklama
};

export default function Page() {
    // Sık sorulan sorular - hizmete göre güncelleyin
    const faqs: FAQ[] = [
        {
            q: "Örnek soru 1?",
            a: <>Örnek cevap 1 buraya gelecek.</>
        },
        {
            q: "Örnek soru 2?",
            a: <>Örnek cevap 2 buraya gelecek.</>
        },
        // Daha fazla FAQ ekleyebilirsiniz
    ];

    return (
        <ServiceLayout
            title="HİZMET ADI" // Ana başlık
            subtitle="Hizmet kısa açıklaması buraya gelecek" // Alt başlık
            quickActions={[
                { label: "Başvuru Yap", href: "/e-belediye/basvuru?service=HIZMET-ID" }, // Hizmet ID'sini değiştirin
                { label: "Randevu Al", href: "/randevu?birim=HIZMET-BIRIMI" }, // Birim adını değiştirin
                { label: "Durumu Takip Et", href: "/basvuru-takip" },
                // Gerekirse daha fazla quick action ekleyebilirsiniz
            ]}
        >
            {/* ÖZET BÖLÜMÜ - Hizmetin genel tanımı */}
            <Section id="ozet" title="Özet">
                <p>
                    Hizmetin genel tanımı buraya gelecek.
                    <strong> Önemli noktalar</strong> vurgulanabilir.
                </p>
            </Section>

            {/* KİMLER YARARLANABİLİR - Hedef kitle */}
            <Section id="kimler" title="Kimler Yararlanabilir?">
                <ul className="list-disc pl-5 space-y-1">
                    <li>Hedef kitle 1</li>
                    <li>Hedef kitle 2</li>
                    <li>Özel koşullar varsa buraya yazın</li>
                </ul>
            </Section>

            {/* VERİLEN HİZMETLER - Hizmet listesi */}
            <Section id="hizmetler" title="Verilen Hizmetler">
                <ul className="grid gap-2 md:grid-cols-2 list-disc pl-5">
                    <li>Hizmet 1</li>
                    <li>Hizmet 2</li>
                    <li>Hizmet 3</li>
                    {/* Daha fazla hizmet ekleyebilirsiniz */}
                </ul>
            </Section>

            {/* GEREKLİ BELGELER - Başvuru için gerekli evraklar */}
            <Section id="belgeler" title="Gerekli Belgeler">
                <ul className="list-disc pl-5 space-y-1">
                    <li>Belge 1</li>
                    <li>Belge 2</li>
                    <li>Belge 3</li>
                    {/* Gerekli belgeleri listeleyin */}
                </ul>
            </Section>

            {/* BAŞVURU KANALLARI - Nasıl başvuru yapılır */}
            <Section id="kanallar" title="Başvuru Kanalları">
                <ul className="list-disc pl-5 space-y-1">
                    <li><a className="text-blue-700 underline" href="/e-belediye/basvuru?service=HIZMET-ID">e-Belediye → Hizmet Başvurusu</a></li>
                    <li>Mobil uygulama</li>
                    <li>Yüz yüze başvuru</li>
                    {/* Başvuru kanallarını listeleyin */}
                </ul>
            </Section>

            {/* ADIM ADIM SÜREÇ - Başvuru süreci */}
            <Section id="surec" title="Adım Adım Süreç">
                <ol className="list-decimal pl-5 space-y-1">
                    <li>Adım 1: Açıklama</li>
                    <li>Adım 2: Açıklama</li>
                    <li>Adım 3: Açıklama</li>
                    {/* Süreç adımlarını sıralayın */}
                </ol>
            </Section>

            {/* SÜRE / HİZMET STANDARDI - SLA bilgileri */}
            <Section id="sla" title="Süre / Hizmet Standardı">
                <ul className="list-disc pl-5 space-y-1">
                    <li>İşlem süresi: <strong>X iş günü</strong></li>
                    <li>Yanıt süresi: <strong>X iş günü</strong></li>
                    {/* SLA bilgilerini listeleyin */}
                </ul>
            </Section>

            {/* ÜCRET & MUAFİYET - Mali bilgiler */}
            <Section id="ucret" title="Ücret & Muafiyet">
                <p>
                    Ücret bilgileri buraya gelecek.
                    <strong> Önemli mali bilgiler</strong> vurgulanabilir.
                </p>
            </Section>

            {/* SIK SORULAN SORULAR - FAQ */}
            <Section id="sss" title="Sık Sorulan Sorular">
                <FAQAccordion items={faqs} />
            </Section>

            {/* ERİŞİLEBİLİRLİK & GÜVENLİK - Erişim ve güvenlik */}
            <Section id="erisilebilirlik" title="Erişilebilirlik & Güvenlik">
                <ul className="list-disc pl-5 space-y-1">
                    <li>Erişilebilirlik özelliği 1</li>
                    <li>Güvenlik önlemi 1</li>
                    <li>Güvenlik önlemi 2</li>
                    {/* Erişilebilirlik ve güvenlik bilgilerini listeleyin */}
                </ul>
            </Section>

            {/* DOKÜMANLAR & FORMLAR - İndirilebilir dosyalar */}
            <Section id="dokumanlar" title="Dokümanlar & Formlar">
                <ul className="list-disc pl-5 space-y-1">
                    <li><a className="text-blue-700 underline" href="#">Form 1 (PDF)</a></li>
                    <li><a className="text-blue-700 underline" href="#">Form 2 (PDF)</a></li>
                    <li><a className="text-blue-700 underline" href="#">Doküman 1 (PDF)</a></li>
                    {/* İndirilebilir dosyaları listeleyin */}
                </ul>
            </Section>

            {/* İLETİŞİM - İletişim bilgileri */}
            <Section id="iletisim" title="İletişim">
                <div className="space-y-2">
                    <p><strong>İlgili Müdürlük/Birim</strong></p>
                    <p>e-posta: <a className="text-blue-700 underline" href="mailto:email@birimajans.bel.tr">email@birimajans.bel.tr</a> • Çağrı Merkezi: 444 0 XXX</p>
                    <p>Çalışma saatleri: Hafta içi 09:00–17:00</p>
                    {/* İletişim bilgilerini güncelleyin */}
                </div>
            </Section>
        </ServiceLayout>
    );
}

/**
 * KULLANIM NOTLARI:
 * 
 * 1. Tüm placeholder metinleri gerçek içerikle değiştirin
 * 2. Gereksiz bölümleri kaldırın (örn: ücret bölümü yoksa)
 * 3. FAQ'leri hizmete özel sorularla güncelleyin
 * 4. Link'leri gerçek URL'lerle değiştirin
 * 5. Meta bilgilerini SEO için optimize edin
 * 6. İletişim bilgilerini güncelleyin
 * 7. Gerekirse yeni bölümler ekleyebilirsiniz
 * 
 * BÖLÜM SIRALAMASI:
 * - Özet (zorunlu)
 * - Kimler Yararlanabilir (zorunlu)
 * - Verilen Hizmetler (zorunlu)
 * - Gerekli Belgeler (zorunlu)
 * - Başvuru Kanalları (zorunlu)
 * - Adım Adım Süreç (zorunlu)
 * - Süre / Hizmet Standardı (zorunlu)
 * - Ücret & Muafiyet (opsiyonel)
 * - Sık Sorulan Sorular (zorunlu)
 * - Erişilebilirlik & Güvenlik (zorunlu)
 * - Dokümanlar & Formlar (opsiyonel)
 * - İletişim (zorunlu)
 */












