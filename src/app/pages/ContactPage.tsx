import { useSeo } from "../hooks/useSeo";
import { JsonLd } from "../components/shared/JsonLd";
import { APP_CONFIG } from "../config/constants";

export function ContactPage() {
  useSeo({
    title: "İletişim",
    description: "öğret.io iletişim bilgileri. Sorularınız, önerileriniz ve iş birliği talepleriniz için bize ulaşın.",
    canonical: "https://ogret.io/iletisim",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-stone-900">İletişim</h1>
        <p className="text-stone-500 mt-2 text-sm font-medium">
          Sorularınız, önerileriniz veya iş birliği talepleriniz için bize ulaşın
        </p>
      </div>

      <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="font-bold text-stone-900 mb-1">E-posta</h2>
          <a href={`mailto:${APP_CONFIG.SUPPORT_EMAIL}`} className="text-emerald-600 hover:underline text-sm">{APP_CONFIG.SUPPORT_EMAIL}</a>
        </div>
        <div>
          <h2 className="font-bold text-stone-900 mb-1">Adres</h2>
          <p className="text-sm text-stone-500">İstanbul, Türkiye</p>
        </div>
        <div>
          <h2 className="font-bold text-stone-900 mb-1">Çalışma Saatleri</h2>
          <p className="text-sm text-stone-500">Hafta içi 09:00 - 18:00</p>
        </div>
      </div>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ContactPoint",
        email: APP_CONFIG.SUPPORT_EMAIL,
        contactType: "customer service",
        availableLanguage: ["Turkish"],
        areaServed: "TR",
      }} />
    </div>
  );
}
