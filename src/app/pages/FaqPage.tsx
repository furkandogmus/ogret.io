import { Link } from "react-router";
import { useSeo } from "../hooks/useSeo";
import { JsonLd } from "../components/shared/JsonLd";

const faqs = [
  {
    q: "öğret.io nedir?",
    a: "öğret.io, öğrencilerle alanında uzman öğretmenleri buluşturan online bir özel ders platformudur. Matematik, İngilizce, yazılım, müzik ve daha birçok alanda birebir ders imkanı sunar.",
  },
  {
    q: "Nasıl öğretmen bulabilirim?",
    a: "Ana sayfadaki arama çubuğunu kullanarak ders almak istediğiniz konuyu yazabilir veya kategori filtrelerini kullanarak size en uygun öğretmeni bulabilirsiniz.",
  },
  {
    q: "Dersler online mı yoksa yüz yüze mi?",
    a: "Her iki seçenek de mevcuttur. Öğretmen profillerinde hangi ders türünü sunduklarını görebilir, size uygun olanı seçebilirsiniz.",
  },
  {
    q: "Ödeme nasıl yapılıyor?",
    a: "Ödemeler güvenli bir şekilde online olarak gerçekleştirilir. Abonelik planları havale/EFT ile de ödenebilir.",
  },
  {
    q: "Öğretmenler güvenilir mi?",
    a: "Tüm öğretmenler kimlik doğrulamasından geçer. Ayrıca öğrenci yorumlarını ve puanlarını inceleyerek karar verebilirsiniz.",
  },
  {
    q: "İptal ve iade politikası nedir?",
    a: "Dersler, planlanan saatten en az 24 saat önce ücretsiz olarak iptal edilebilir. Abonelikler ise her ay sonunda iptal edilebilir.",
  },
  {
    q: "Öğretmen olarak nasıl kayıt olabilirim?",
    a: "Kayıt sayfasından 'Öğretmen' rolünü seçerek ücretsiz hesap oluşturabilir, ardından profil bilgilerinizi tamamlayarak ders vermeye başlayabilirsiniz.",
  },
  {
    q: "Abonelik planları nelerdir?",
    a: "Öğretmenler için Basic, Premium ve VIP olmak üzere üç farklı abonelik planı sunuyoruz. Detaylı bilgi için Abonelik sayfamızı ziyaret edebilirsiniz.",
  },
];

export function FaqPage() {
  useSeo({
    title: "Sıkça Sorulan Sorular",
    description: "öğret.io hakkında sıkça sorulan sorular ve cevapları. Özel ders, ödeme, abonelik ve daha fazlası.",
    canonical: "https://ogret.io/sikca-sorulan-sorular",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-stone-900">Sıkça Sorulan Sorular</h1>
        <p className="text-stone-500 mt-2 text-sm font-medium">
          Özel ders platformumuz hakkında merak edilenler
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="bg-white border border-stone-100 rounded-xl overflow-hidden group">
            <summary className="px-5 py-4 font-semibold text-sm text-stone-800 cursor-pointer hover:bg-stone-50 transition-colors list-none flex items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
              <span>{faq.q}</span>
              <span className="text-stone-400 group-open:rotate-180 transition-transform text-xs">▼</span>
            </summary>
            <div className="px-5 pb-4 text-sm text-stone-500 leading-relaxed border-t border-stone-50 pt-3">
              {faq.a}
            </div>
          </details>
        ))}
      </div>

      <div className="text-center mt-10 p-6 bg-stone-50 rounded-2xl">
        <p className="text-sm text-stone-600 font-medium">Başka bir sorunuz mu var?</p>
        <p className="text-xs text-stone-400 mt-1">Bize ulaşın, size yardımcı olalım.</p>
      </div>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      }} />
    </div>
  );
}
