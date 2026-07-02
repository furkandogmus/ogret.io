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
      <p className="text-sm text-stone-500">Son güncelleme: Mart 2026</p>

      <h2>Hesap Kaydı</h2>
      <p>Platformumuza kayıt olurken doğru ve güncel bilgiler vermeyi kabul edersiniz. Hesap güvenliğiniz sizin sorumluluğunuzdadır.</p>

      <h2>Ders Verme ve Alma</h2>
      <p>Öğretmenler, belirttikleri uzmanlık alanlarında ders vermeyi taahhüt eder. Öğrenciler, ders saatlerine uymayı kabul eder.</p>

      <h2>İptal ve İade</h2>
      <p>Dersler, planlanan saatten en az 24 saat önce ücretsiz iptal edilebilir. Abonelikler dönem sonunda iptal edilebilir.</p>

      <h2>Fikri Mülkiyet</h2>
      <p>Platformda paylaşılan tüm içeriklerin hakları saklıdır. İzinsiz kullanım yasaktır.</p>
    </div>
  );
}
