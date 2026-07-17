import { Link } from "react-router";
import { ArrowRight, BookOpen, Calendar, CheckCircle2, HeartHandshake, Search, Sparkles, Star } from "lucide-react";
import { useSeo } from "../hooks/useSeo";
import { JsonLd } from "../components/shared/JsonLd";

const benefits = [
  {
    icon: Search,
    title: "Doğru öğretmeni bulun",
    text: "Konu, seviye, bütçe ve online/yüz yüze tercihinize göre filtreleyin.",
  },
  {
    icon: HeartHandshake,
    title: "Hızlı iletişim kurun",
    text: "Profil, yorum ve puanlar üzerinden güvenle seçim yapın; ilk adımı hemen atın.",
  },
  {
    icon: Calendar,
    title: "Düzenli ilerleyin",
    text: "Takip edilebilir ders planı ile hedefinize uygun şekilde yol alın.",
  },
];

const studentWins = [
  "YKS, LGS, okul dersleri ve yabancı dil için birebir destek",
  "İhtiyaca göre online veya uygun öğretmenle esnek ders seçenekleri",
  "Puan, yorum ve doğrulama rozetleriyle güvenli seçim",
  "İlerleme takibi ve tekrar planı ile düzenli gelişim",
];

export function StudentsPage() {
  useSeo({
    title: "Öğrenciler",
    description: "öğret.io öğrenciler için birebir özel ders deneyimi. Doğru öğretmeni bulun, hedefinize uygun ders programı oluşturun.",
    canonical: "https://ogret.io/ogrenciler",
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-xs font-bold text-rose-700">
            <Sparkles className="w-3.5 h-3.5" />
            Öğrencilere özel
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">
            Öğrenmeyi kolaylaştıran öğretmenlerle tanışın.
          </h1>
          <p className="text-sm md:text-base text-stone-500 leading-relaxed max-w-2xl">
            İster sınava hazırlanın ister bir konuda boşluk kapatın, öğret.io size hedefinize uygun öğretmeni bulmanız için net bir yol sunar.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/arama" className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-rose-500/15">
              Öğretmen Ara <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/sikca-sorulan-sorular" className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50">
              SSS'ye Bak
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Öğrenci deneyimi</h2>
              <p className="text-sm text-stone-500">Güvenli, hızlı ve net</p>
            </div>
          </div>
          <ul className="space-y-3">
            {studentWins.map((item) => (
              <li key={item} className="flex items-start gap-2 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700">
                <CheckCircle2 className="mt-0.5 w-4 h-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {benefits.map((item) => (
          <article key={item.title} className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-50 text-stone-700">
              <item.icon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-rose-500 to-rose-600 p-6 md:p-8 text-white shadow-lg shadow-rose-500/20">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-rose-100/80">Hazırsanız</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">Size en uygun öğretmeni birlikte bulalım.</h2>
            <p className="mt-2 text-sm leading-relaxed text-rose-50/90">
              Arama sayfasından başlayın, birkaç filtre kullanın ve hedefinize en uygun öğretmeni kısa sürede bulun.
            </p>
          </div>
          <Link to="/arama" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-rose-600">
            Aramaya Git <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "öğrenciler için öğret.io",
        description: "öğrencilerin öğretmen bulma ve ders planlama akışı",
        url: "https://ogret.io/ogrenciler",
      }} />
    </div>
  );
}
