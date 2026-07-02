import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import {
  Search, ArrowRight, Star, BookOpen, Calculator, Globe, Code2, Music, GraduationCap, Zap,
  Dna, Beaker, Map, Hourglass, Camera, Palette, Mic
} from "lucide-react";
import { tutorApi, subjectApi } from "../api/services";
import type { TutorSummaryResponse, SubjectResponse } from "../api/services";
import { TutorCard } from "../components/shared/TutorCard";

const SUBJECT_ICONS: Record<string, any> = {
  matematik: Calculator,
  "lgs-matematik": Calculator,
  fizik: Zap,
  "lgs-fen": Zap,
  kimya: Beaker,
  biyoloji: Dna,
  ingilizce: Globe,
  almanca: Globe,
  fransizca: Globe,
  ispanyolca: Globe,
  rusca: Globe,
  arapca: Globe,
  "lgs-ingilizce": Globe,
  yazilim: Code2,
  python: Code2,
  javascript: Code2,
  "web-gelistirme": Code2,
  java: Code2,
  react: Code2,
  "sql-veritabani": Code2,
  piyano: Music,
  gitar: Music,
  keman: Music,
  "san-ses": Music,
  "muzik-teorisi": Music,
  tarih: Hourglass,
  cografya: Map,
  edebiyat: BookOpen,
  "lgs-turkce": BookOpen,
  fotografcilik: Camera,
  "resim-cizim": Palette,
  "tiyatro-diksiyon": Mic,
  default: BookOpen
};

export function LandingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [featuredTutors, setFeaturedTutors] = useState<TutorSummaryResponse[]>([]);
  const [tutorsLoading, setTutorsLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [focused, setFocused] = useState(false);

  const matchedSubjects = query.trim()
    ? subjects.filter(s => s.name.toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR'))).slice(0, 5)
    : [];

  useEffect(() => {
    tutorApi.list({ sort: "rating", size: 6 })
      .then(({ data }) => setFeaturedTutors(data.content || []))
      .catch(() => toast.error("Öğretmenler yüklenemedi"))
      .finally(() => setTutorsLoading(false));

    subjectApi.list()
      .then(({ data }) => setSubjects(data || []))
      .catch(() => { });
  }, []);

  return (
    <div className="min-h-screen bg-stone-50/30">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#FFF2F2] to-white rounded-b-[40px] md:rounded-b-[56px] border-b border-stone-100/80 pb-16 pt-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 text-center">

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.1] mb-8">
            Türkiye'nin En İyi<br />
            <span className="text-rose-500">Özel Ders</span> Platformu
          </h1>

          {/* Search Box */}
          <div className="relative bg-white shadow-xl shadow-stone-200/50 rounded-2xl md:rounded-full p-2.5 max-w-xl mx-auto flex flex-col md:flex-row items-center border border-stone-100 gap-2">
            <div className="flex-1 w-full flex items-center gap-3 pl-4">
              <Search className="w-5 h-5 text-stone-400 flex-shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                placeholder="Hangi konuyu öğrenmek istiyorsunuz?"
                className="w-full text-stone-800 placeholder-stone-400 outline-none text-sm font-medium bg-transparent py-2.5"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate(query.trim() ? `/arama?q=${encodeURIComponent(query.trim())}` : "/arama");
                  }
                }}
              />
            </div>
            <button
              onClick={() => navigate(query.trim() ? `/arama?q=${encodeURIComponent(query.trim())}` : "/arama")}
              className="w-full md:w-auto bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-bold px-8 py-3 rounded-xl md:rounded-full text-sm transition-all shadow-sm shadow-rose-500/20"
            >
              Ara
            </button>

            {/* Floating Autocomplete Search Suggestions Dropdown Overlay */}
            {query.trim() && focused && matchedSubjects.length > 0 && (
              <>
                <div className="fixed inset-0 z-10" onMouseDown={() => setFocused(false)} />
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200/50 shadow-2xl rounded-2xl p-2.5 z-20 text-left space-y-0.5 overflow-hidden">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-3 py-1.5 block">Önerilen Konular</span>
                  {matchedSubjects.map(sub => (
                    <button
                      key={sub.id}
                      onMouseDown={() => {
                        setQuery(sub.name);
                        setFocused(false);
                        navigate(`/arama?q=${encodeURIComponent(sub.name)}`);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-stone-50 text-stone-700 hover:text-stone-900 font-bold text-xs rounded-xl transition-colors text-left"
                    >
                      <Search className="w-3.5 h-3.5 text-stone-400" />
                      <span>{sub.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Popular Subjects Links */}
          <div className="flex flex-wrap justify-center items-center gap-3 mt-6 text-sm text-stone-500">
            <span className="text-stone-400 text-xs font-semibold uppercase tracking-wider">Popüler:</span>
            {["Matematik", "İngilizce", "Yazılım", "Fizik", "Almanca"].map((s) => (
              <button
                key={s}
                onClick={() => navigate(`/arama?q=${encodeURIComponent(s)}`)}
                className="hover:text-rose-500 font-semibold transition-colors bg-white border border-stone-200/40 px-3 py-1 rounded-full text-xs shadow-sm hover:shadow"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Minimal Stats Row */}
          <div className="flex justify-center items-center gap-8 text-stone-500 text-xs font-semibold mt-10 border-t border-stone-100 pt-6">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-rose-500" /> Uzman Öğretmen</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-rose-500" /> Mutlu Öğrenci</span>
            <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> 4.8/5 Puan</span>
          </div>

        </div>
      </section>

      {/* Categories Horizontal Carousel */}
      {subjects.length > 0 && (
        <section className="py-10 max-w-5xl mx-auto">
          <div className="flex items-center gap-3.5 overflow-x-auto pb-4 pt-1 px-8 md:px-12 no-scrollbar justify-start">
            {subjects.map((sub) => {
              const Icon = SUBJECT_ICONS[sub.slug] || SUBJECT_ICONS.default;
              return (
                <button
                  key={sub.id}
                  onClick={() => navigate(`/arama?q=${encodeURIComponent(sub.name)}`)}
                  className="flex flex-col items-center gap-2 bg-white hover:bg-emerald-50/20 border border-stone-200/50 hover:border-emerald-200 px-6 py-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex-shrink-0 group"
                >
                  <Icon className="w-5.5 h-5.5 text-rose-500 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-[11px] font-bold text-stone-700 whitespace-nowrap">{sub.name}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Tutors Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-1 mb-2 text-rose-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
                Öne Çıkan Öğretmenler
              </h2>
              <p className="text-sm text-stone-500 mt-1 font-medium">39 milyon öğretmen değerlendirildi</p>
            </div>
            <button
              onClick={() => navigate("/arama")}
              className="text-rose-500 text-sm font-bold flex items-center gap-1 hover:gap-2 justify-center transition-all hover:underline"
            >
              Tüm Öğretmenleri Gör <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-stone-100 p-5 space-y-4">
                  <div className="w-full aspect-[4/3] rounded-xl skeleton" />
                  <div className="h-4 w-3/4 skeleton" />
                  <div className="h-3 w-1/2 skeleton" />
                </div>
              ))
            ) : featuredTutors.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-medium">Henüz öğretmen bulunmuyor</p>
              </div>
            ) : (
              featuredTutors.map((tutor) => (
                <TutorCard
                  key={`featured-${tutor.id}`}
                  id={tutor.id}
                  fullName={tutor.fullName}
                  avatarUrl={tutor.avatarUrl}
                  listingTitle={tutor.bio || `${tutor.experienceYears} yıl deneyim`}
                  rating={tutor.ratingAvg || 5.0}
                  reviewCount={tutor.ratingCount || 0}
                  hourlyRate={tutor.hourlyRate}
                  experienceYears={tutor.experienceYears}
                  online={tutor.online}
                  verified={tutor.identityVerified}
                  subjects={tutor.subjects}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              öğret<span className="text-emerald-400">.io</span>
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            {[
              { heading: "Platform", links: ["Nasıl Çalışır", "Fiyatlandırma", "Öğretmenler", "Öğrenciler"] },
              { heading: "Kategoriler", links: ["Matematik", "İngilizce", "Yazılım", "Müzik"] },
              { heading: "Destek", links: ["Yardım Merkezi", "İletişim", "Güvenlik", "Gizlilik"] },
              { heading: "Takip Et", links: ["Instagram", "Twitter / X", "LinkedIn", "YouTube"] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <h4 className="text-white font-medium mb-4 text-xs uppercase tracking-wider">{heading}</h4>
                {links.map((l) => {
                  // TODO: Sayfa yönlendirmeleri ilgili sayfalar oluşturulduğunda güncellenecek
                  const href = `/${l.toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
                  return (
                    <Link key={l} to={href} className="block py-1.5 hover:text-white transition-colors">{l}</Link>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="border-t border-stone-850 mt-10 pt-8 text-center text-xs text-stone-500">
            © 2026 öğret.io · Tüm hakları saklıdır · İstanbul, Türkiye
          </div>
        </div>
      </footer>
    </div>
  );
}
