import { useSeo } from "../hooks/useSeo";

export function TermsPage() {
  useSeo({
    title: "Kullanım Koşulları",
    description: "öğret.io kullanım koşulları. Platformumuzu kullanırken kabul ettiğiniz şartlar ve kurallar.",
    canonical: "https://ogret.io/kullanim-kosullari",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 prose prose-stone">
      <h1>Kullanım Koşulları</h1>
      <p className="text-sm text-stone-500">Son güncelleme: 17 Temmuz 2026 · Sürüm 1.0</p>

      <h2>Hesap Kaydı</h2>
      <p>Platformumuza kayıt olurken doğru ve güncel bilgiler vermeyi kabul edersiniz. Hesap güvenliğiniz sizin sorumluluğunuzdadır.</p>

      <h2>Ders Verme ve Alma</h2>
      <p>Öğretmenler, belirttikleri uzmanlık alanlarında ders vermeyi taahhüt eder. Öğrenciler, ders saatlerine uymayı kabul eder.</p>

      <h2>Ders Ücreti ve Ödeme</h2>
      <p>öğret.io ilk sürümde ödeme tahsil etmez, komisyon almaz ve ödeme hizmeti sunmaz. Ders ücreti, ödeme yöntemi, iptal ve varsa iade koşulları öğrenci ile öğretmen arasında ders öncesinde kararlaştırılır. Platform bu işlemin tarafı, emanetçisi veya garantörü değildir.</p>

      <h2>Fikri Mülkiyet</h2>
      <p>Platformda paylaşılan tüm içeriklerin hakları saklıdır. İzinsiz kullanım yasaktır.</p>
    </div>
  );
}
