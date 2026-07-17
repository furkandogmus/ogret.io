import { Link } from "react-router";
import { ArrowRight, Check, Handshake, ShieldCheck, Users } from "lucide-react";
import { useSeo } from "../hooks/useSeo";
import { JsonLd } from "../components/shared/JsonLd";

const features = [
  "Öğretmen profili ve ilan oluşturma",
  "Öğretmen arama, favoriler ve ders talebi",
  "Öğrenci–öğretmen mesajlaşması",
  "Ders planlama ve değerlendirme",
];

export function PricingPage() {
  useSeo({
    title: "Fiyatlandırma",
    description: "öğret.io ilk sürümde öğrenci ve öğretmenler için ücretsizdir. Ders ücreti taraflar arasında doğrudan belirlenir.",
    canonical: "https://ogret.io/fiyatlandirma",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700">
          <Users className="w-3.5 h-3.5" /> İlk sürüm ücretsiz
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">Platform ücreti yok</h1>
        <p className="text-sm md:text-base text-stone-500 leading-relaxed">
          Öğrenciler ve öğretmenler öğret.io'yu ilk sürümde ücretsiz kullanır. Ücretli abonelik, öne çıkarma paketi veya platform üzerinden ödeme bulunmaz.
        </p>
        <Link to="/kayit" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/15">
          Ücretsiz Başla <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm">
          <ShieldCheck className="w-9 h-9 text-emerald-600 mb-4" />
          <h2 className="text-xl font-bold text-stone-900">Dahil olan özellikler</h2>
          <ul className="mt-5 space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-stone-700">
                <Check className="mt-0.5 w-4 h-4 shrink-0 text-emerald-600" /> {feature}
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6">
          <Handshake className="w-9 h-9 text-amber-700 mb-4" />
          <h2 className="text-xl font-bold text-stone-900">Ders ücreti nasıl ödenir?</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Ders ücreti, ödeme zamanı, yöntemi, iptal ve varsa iade koşulları öğrenci ile öğretmen tarafından ders öncesinde doğrudan kararlaştırılır.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-stone-500">
            öğret.io ödemenin tarafı, aracısı, emanetçisi veya garantörü değildir ve kart ya da banka hesabı bilgisi toplamaz.
          </p>
        </article>
      </section>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "öğret.io fiyatlandırma",
        description: "İlk sürümde ücretsiz platform kullanımı ve taraflar arasında doğrudan ders ücreti modeli",
        url: "https://ogret.io/fiyatlandirma",
      }} />
    </div>
  );
}
