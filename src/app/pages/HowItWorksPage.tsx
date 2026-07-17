import { Link } from "react-router";
import { ArrowRight, BookOpen, Calendar, MessageSquare, Search, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useSeo } from "../hooks/useSeo";
import { JsonLd } from "../components/shared/JsonLd";

const studentSteps = [
  {
    icon: Search,
    title: "Arama yapın",
    text: "Ders almak istediğiniz konuyu, seviyeyi veya hedefinizi yazın ve size uygun öğretmenleri filtreleyin.",
  },
  {
    icon: MessageSquare,
    title: "İletişime geçin",
    text: "Profil, puan, yorum ve uygunluk bilgilerini inceleyin; öğretmenle ders planınızı hızlıca netleştirin.",
  },
  {
    icon: Calendar,
    title: "Derse başlayın",
    text: "Online ya da uygun bir lokasyonda ilk dersinizi alın, ilerlemenizi düzenli olarak takip edin.",
  },
];

const tutorSteps = [
  {
    icon: BookOpen,
    title: "Profilinizi oluşturun",
    text: "Uzmanlık alanlarınızı, deneyiminizi ve ders verme tarzınızı etkileyici bir profil ile anlatın.",
  },
  {
    icon: ShieldCheck,
    title: "Doğrulamanızı tamamlayın",
    text: "Kimlik ve gerekiyorsa belge doğrulamasıyla güven veren bir öğretmen profili oluşturun.",
  },
  {
    icon: Sparkles,
    title: "Öğrenci kazanın",
    text: "İlanınızı yayınlayın, referans toplayın ve öğrenci taleplerini doğrudan yönetmeye başlayın.",
  },
];

export function HowItWorksPage() {
  useSeo({
    title: "Nasıl Çalışır",
    description: "öğret.io'da öğrenci ve öğretmenler için ders bulma, iletişim kurma ve ders verme süreci nasıl işler, adım adım inceleyin.",
    canonical: "https://ogret.io/nasil-calisir",
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700">
          <Sparkles className="w-3.5 h-3.5" />
          Platform akışı
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">Nasıl Çalışır?</h1>
        <p className="text-sm md:text-base text-stone-500 leading-relaxed">
          Öğrenciler için doğru öğretmeni bulmak, öğretmenler içinse yeni öğrencilere ulaşmak birkaç adım sürer. Süreç sade, şeffaf ve hızlıdır.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to="/arama" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/15">
            Öğretmen Ara <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/kayit?role=tutor" className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50">
            Öğretmen Ol
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-stone-100 bg-white p-6 md:p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">Öğrenciler için</h2>
              <p className="text-sm text-stone-500">Doğru öğretmeni bulma akışı</p>
            </div>
          </div>
          <div className="space-y-4">
            {studentSteps.map((step, index) => (
              <div key={step.title} className="flex gap-4 rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                  <step.icon className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400">0{index + 1}</p>
                  <h3 className="font-semibold text-stone-900">{step.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-stone-100 bg-white p-6 md:p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">Öğretmenler için</h2>
              <p className="text-sm text-stone-500">Ders ilanı açma ve öğrenci kazanma akışı</p>
            </div>
          </div>
          <div className="space-y-4">
            {tutorSteps.map((step, index) => (
              <div key={step.title} className="flex gap-4 rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-stone-900 shadow-sm">
                  <step.icon className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400">0{index + 1}</p>
                  <h3 className="font-semibold text-stone-900">{step.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 md:p-8 text-white shadow-lg shadow-emerald-600/20">
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-100/80">Başlamak için</p>
            <h2 className="text-2xl font-black tracking-tight">İlk dersinizi bugün planlayın.</h2>
            <p className="text-sm leading-relaxed text-emerald-50/90">
              İster öğrenci olun ister öğretmen, öğret.io üzerinde süreci olabildiğince sade tuttuk. Size sadece doğru eşleşmeyi seçmek kalıyor.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link to="/arama" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-700">
              Aramaya Başla <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/iletisim" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur">
              Bize Ulaşın
            </Link>
          </div>
        </div>
      </section>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "öğret.io nasıl çalışır",
        description: "öğrencilerin öğretmen bulma ve öğretmenlerin ilan oluşturma akışı",
        step: [
          ...studentSteps.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: step.title,
            text: step.text,
          })),
        ],
      }} />
    </div>
  );
}
