import { Link } from "react-router";
import { BookOpen, GraduationCap, Users, Star, Shield, Zap } from "lucide-react";
import { useSeo } from "../hooks/useSeo";
import { JsonLd } from "../components/shared/JsonLd";

const stats = [
  { icon: GraduationCap, value: "500+", label: "Uzman Öğretmen" },
  { icon: Users, value: "10.000+", label: "Mutlu Öğrenci" },
  { icon: Star, value: "4.8/5", label: "Ortalama Puan" },
  { icon: Shield, value: "%100", label: "Güvenli Ödeme" },
];

const values = [
  {
    icon: Zap,
    title: "Erişilebilirlik",
    desc: "Herkesin kaliteli eğitime erişebilmesi için çalışıyoruz. Online dersler sayesinde coğrafi sınırları ortadan kaldırıyoruz.",
  },
  {
    icon: Star,
    title: "Kalite",
    desc: "Her öğretmen kimlik doğrulamasından geçer. Öğrenci yorumları ve puanlama sistemiyle kaliteyi sürekli takip ederiz.",
  },
  {
    icon: Shield,
    title: "Güven",
    desc: "Ödeme işlemleri güvenli altyapıyla gerçekleştirilir. Kişisel verileriniz KVKK kapsamında korunmaktadır.",
  },
];

export function AboutPage() {
  useSeo({
    title: "Hakkımızda",
    description: "öğret.io, Türkiye'nin lider online özel ders platformu. 500+ uzman öğretmen, 10.000+ mutlu öğrenci. Kaliteli eğitimi herkes için erişilebilir kılıyoruz.",
    canonical: "https://ogret.io/hakkimizda",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2.5 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <span className="font-bold text-2xl text-foreground tracking-tight">
            öğret<span className="text-primary">.io</span>
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-stone-900">Hakkımızda</h1>
        <p className="text-stone-500 mt-3 text-sm max-w-2xl mx-auto leading-relaxed">
          öğret.io, öğrencilerle alanında uzman öğretmenleri bir araya getiren Türkiye'nin 
          en yenilikçi online özel ders platformudur. 2026 yılında İstanbul'da kurulan 
          platformumuz, kaliteli eğitimi herkes için erişilebilir kılmayı hedefler.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-stone-100 rounded-2xl p-5 text-center shadow-sm">
            <s.icon className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-black text-stone-900">{s.value}</p>
            <p className="text-xs text-stone-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 mb-10 shadow-sm">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Misyonumuz</h2>
        <p className="text-sm text-stone-600 leading-relaxed">
          Herkesin ihtiyacı olan eğitime, istediği zaman ve istediği yerden erişebildiği 
          bir dünya yaratmak. Teknolojinin gücünü kullanarak öğretmenler ve öğrenciler 
          arasında anlamlı bağlantılar kuruyor, öğrenmeyi herkes için keyifli ve 
          erişilebilir hale getiriyoruz.
        </p>
      </div>

      <div className="bg-emerald-600 rounded-2xl p-6 md:p-8 mb-10 text-white">
        <h2 className="text-xl font-bold mb-2">Vizyonumuz</h2>
        <p className="text-sm leading-relaxed opacity-90">
          Türkiye'nin en büyük ve en güvenilir özel ders platformu olmak. Her öğrencinin 
          ihtiyacına uygun bir öğretmen bulabildiği, her öğretmenin potansiyelini 
          gerçekleştirebildiği bir ekosistem inşa etmek.
        </p>
      </div>

      <h2 className="text-xl font-bold text-stone-900 mb-4">Değerlerimiz</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {values.map((v) => (
          <div key={v.title} className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
            <v.icon className="w-5 h-5 text-emerald-600 mb-3" />
            <h3 className="font-bold text-sm text-stone-900 mb-1">{v.title}</h3>
            <p className="text-xs text-stone-500 leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "öğret.io",
        url: "https://ogret.io/",
        logo: "https://ogret.io/favicon.svg",
        description: "Türkiye'nin lider online özel ders platformu.",
        foundingDate: "2026",
        location: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "İstanbul", addressCountry: "TR" } },
        sameAs: [],
      }} />
    </div>
  );
}
