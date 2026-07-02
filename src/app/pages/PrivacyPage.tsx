import { useSeo } from "../hooks/useSeo";

export function PrivacyPage() {
  useSeo({
    title: "Gizlilik Politikası",
    description: "öğret.io gizlilik politikası. Kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi.",
    canonical: "https://ogret.io/gizlilik",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 prose prose-stone">
      <h1>Gizlilik Politikası</h1>
      <p className="text-sm text-stone-500">Son güncelleme: Mart 2026</p>

      <h2>Toplanan Bilgiler</h2>
      <p>öğret.io olarak, hizmetlerimizi sunabilmek için ad, soyad, e-posta adresi, telefon numarası gibi temel bilgilerinizi toplarız.</p>

      <h2>Bilgilerin Kullanımı</h2>
      <p>Topladığımız bilgiler, size en iyi hizmeti sunabilmek, hesabınızı yönetmek ve platformumuzu geliştirmek için kullanılır.</p>

      <h2>Veri Güvenliği</h2>
      <p>Kişisel verileriniz, KVKK kapsamında gerekli teknik ve idari tedbirler alınarak korunmaktadır.</p>

      <h2>İletişim</h2>
      <p>Gizlilik politikamız hakkında sorularınız için <a href="mailto:info@ogret.io">info@ogret.io</a> adresinden bize ulaşabilirsiniz.</p>
    </div>
  );
}
