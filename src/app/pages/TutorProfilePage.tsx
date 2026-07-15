import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ChevronLeft, CheckCircle, Shield, Star, GraduationCap, Award, Check,
  Clock, MapPin, MessageSquare, BookOpen, Calendar, ChevronRight
} from "lucide-react";
import { tutorApi, reviewApi, referenceApi, listingApi, type UserResponse, type ReviewResponse, type ReferenceResponse, type ListingResponse } from "../api/services";
import { StarRating } from "../components/shared/StarRating";
import { Avatar } from "../components/shared/Avatar";
import { JsonLd } from "../components/shared/JsonLd";
import { useModal } from "../providers/ModalProvider";
import { useAuth } from "../providers/AuthProvider";
import { useSeo } from "../hooks/useSeo";

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const DAY_NAMES = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const ALL_HOURS = Array.from({ length: 10 }, (_, i) => i + 9);

export function TutorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { isAuthenticated, user } = useAuth();
  const [tutor, setTutor] = useState<UserResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [references, setReferences] = useState<ReferenceResponse[]>([]);
  const [listings, setListings] = useState<ListingResponse[]>([]);
  const [selectedListing, setSelectedListing] = useState<ListingResponse | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);

  useSeo({
    title: tutor ? `${tutor.fullName} - Özel Ders Öğretmeni` : "Öğretmen Profili",
    description: tutor?.bio || "Alanında uzman öğretmenimizle tanışın. Online özel ders için hemen iletişime geçin.",
    canonical: id ? `https://ogret.io/ogretmen/${id}` : undefined,
  });

  useEffect(() => {
    if (!id) return;
    Promise.all([
      tutorApi.getById(id).then(({ data }) => setTutor(data)),
      reviewApi.getTutorReviews(id).then(({ data }) => setReviews(data)),
      referenceApi.getApproved(id).then(({ data }) => setReferences(data)),
      listingApi.getTutorListings(id).then(({ data }) => {
        setListings(data);
        if (data.length > 0) setSelectedListing(data[0]);
      }),
      tutorApi.getAvailability(id).then(({ data }) => setAvailability(data)),
    ]).finally(() => setLoading(false));
  }, [id]);

  const isAvailable = (dayIdx: number, hour: number) =>
    availability.some(
      (s) =>
        s.dayOfWeek === dayIdx &&
        parseInt(s.startTime) <= hour &&
        parseInt(s.endTime) > hour
    );

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="h-5 w-40 skeleton" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 h-64 skeleton" />
            <div className="bg-card border border-border rounded-3xl p-6 h-96 skeleton" />
          </div>
          <div className="h-96 rounded-3xl skeleton" />
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Star className="w-12 h-12 mx-auto mb-4 opacity-20 text-muted-foreground" />
        <p className="text-lg font-medium text-foreground">Öğretmen bulunamadı</p>
        <button onClick={() => navigate("/arama")} className="text-primary text-sm mt-2 hover:underline">
          Arama sonuçlarına dön
        </button>
      </div>
    );
  }

  const tabs = [
    { key: "about", label: "Hakkında" },
    { key: "availability", label: "Uygunluk" },
    { key: "reviews", label: `Yorumlar (${reviews.length})` },
    { key: "references", label: `Referanslar (${references.length})` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-1.5 text-xs text-stone-400 font-medium mb-4" aria-label="Sayfa yolu">
        <Link to="/" className="hover:text-stone-600 transition-colors">Ana Sayfa</Link>
        <ChevronRight className="w-3 h-3" aria-hidden="true" />
        <Link to="/arama" className="hover:text-stone-600 transition-colors">Öğretmenler</Link>
        {tutor && (
          <>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <span className="text-stone-700 font-semibold" aria-current="page">{tutor.fullName}</span>
          </>
        )}
      </nav>
      {tutor && (
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://ogret.io/" },
            { "@type": "ListItem", position: 2, name: "Öğretmenler", item: "https://ogret.io/arama" },
            { "@type": "ListItem", position: 3, name: tutor.fullName, item: `https://ogret.io/ogretmen/${id}` },
          ],
        }} />
      )}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors font-semibold"
      >
        <ChevronLeft className="w-4 h-4" /> Geri
      </button>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header Card */}
          <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar src={tutor.avatarUrl} alt={tutor.fullName} className="w-32 h-32 rounded-2xl border-2 border-stone-100 shadow-sm flex-shrink-0" online={tutor.online} />
            <div className="flex-1 text-center sm:text-left space-y-3 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-3xl font-black text-stone-900 tracking-tight leading-none">{tutor.fullName}</h1>
                {tutor.verified && <CheckCircle className="w-5 h-5 text-emerald-505 flex-shrink-0" />}
                {tutor.identityVerified && (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1 rounded-md flex items-center gap-0.5 border border-emerald-100/60 shadow-sm flex-shrink-0">
                    <Shield className="w-3.5 h-3.5" /> KİMLİK DOĞRULANDI
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-stone-500 truncate">{tutor.education || "Özel Ders Eğitmeni"}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold text-stone-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{tutor.ratingAvg ? tutor.ratingAvg.toFixed(1) : "5.0"} ({reviews.length} yorum)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-rose-500" />
                  <span>{tutor.experienceYears || 0} Yıl Deneyim</span>
                </div>
                {tutor.online && (
                  <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Online
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sticky/Scroll Navigation Tabs for E2E and Quick Scroll */}
          <div className="bg-white border border-stone-100 rounded-2xl p-1.5 shadow-sm flex">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => scrollToSection(key)}
                className="flex-1 py-2 text-center text-xs font-bold text-stone-500 hover:text-emerald-600 rounded-xl transition-all"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Listings Selector */}
          {listings.length > 1 && (
            <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Ders İlanları</p>
              <div className="flex flex-wrap gap-2">
                {listings.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedListing(l)}
                    className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all ${selectedListing?.id === l.id
                      ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-sm"
                      : "border-stone-250 text-stone-500 hover:text-stone-700 hover:border-stone-300"
                      }`}
                  >
                    {l.subjectName} · ₺{l.hourlyRate}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* About Section */}
          <div id="about" className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm space-y-6">
            {selectedListing ? (
              <>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-lg mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" /> Dersler Hakkında
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">{selectedListing.lessonDescription}</p>
                </div>
                <div className="border-t border-stone-100 pt-6">
                  <h3 className="font-extrabold text-stone-900 text-lg mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-600" /> Öğretmen Hakkında
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">{selectedListing.aboutTutor}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 border-t border-stone-100 pt-6">
                  <div>
                    <h4 className="font-bold text-stone-800 text-sm mb-2">Ders Formatları</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedListing.allowsOnline && <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold">Online</span>}
                      {selectedListing.allowsTutorHome && <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold">Öğretmenin Evinde</span>}
                      {selectedListing.allowsStudentHome && <span className="text-[11px] bg-violet-50 text-violet-700 px-2.5 py-1 rounded-md font-bold">Öğrencinin Evinde {selectedListing.maxTravelDistanceKm ? `(${selectedListing.maxTravelDistanceKm} km)` : ""}</span>}
                    </div>
                  </div>
                  {selectedListing.languages && selectedListing.languages.length > 0 && (
                    <div>
                      <h4 className="font-bold text-stone-800 text-sm mb-2">Ders Dili</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedListing.languages.map(lang => (
                          <span key={lang} className="text-[11px] bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md font-bold">{lang}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              tutor.bio && (
                <div>
                  <h3 className="font-extrabold text-stone-900 text-lg mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-rose-500" /> Biyografi
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">{tutor.bio}</p>
                </div>
              )
            )}
          </div>

          {/* Availability Calendar */}
          <div id="availability" className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-stone-900 text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-500" /> Haftalık Uygunluk Takvimi
            </h3>
            <div className="overflow-x-auto border border-stone-100 rounded-2xl">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 border-b border-stone-100">
                    <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider">Saat</th>
                    {DAY_NAMES.map((day) => (
                      <th key={day} className="py-3 px-2 text-xs font-bold">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {ALL_HOURS.map((hour) => (
                    <tr key={hour} className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-2 text-xs font-bold text-stone-400">{hour}:00</td>
                      {DAY_NAMES.map((_, dayIdx) => {
                        const avail = isAvailable(dayIdx + 1, hour);
                        return (
                          <td key={dayIdx} className="py-2.5 px-2">
                            {avail ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="text-stone-200">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reviews Section */}
          <div id="reviews" className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="font-extrabold text-stone-900 text-lg">Öğrenci Değerlendirmeleri ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-stone-400">
                <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Henüz yorum yapılmamış.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="flex gap-4 pb-4 border-b border-stone-100 last:border-0 last:pb-0">
                    <Avatar src={r.anonymous ? undefined : r.studentAvatar} alt={r.anonymous ? "A" : r.studentName || "Ö"} className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-850 text-sm">{r.anonymous ? "Anonim" : r.studentName || "Öğrenci"}</span>
                        <span className="text-xs text-stone-400">{new Date(r.createdAt).toLocaleDateString("tr-TR")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"}`} />
                        ))}
                      </div>
                      {r.comment && <p className="text-sm text-stone-600 leading-relaxed pt-1">{r.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div id="references" className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-stone-900 text-lg">Tavsiyeler & Referanslar ({references.length})</h3>
              <button
                onClick={() => navigate(`/ogretmen/${tutor.id}/referans-yaz`)}
                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
              >
                Tavsiye Yaz
              </button>
            </div>
            {references.length === 0 ? (
              <div className="text-center py-8 text-stone-400">
                <p className="text-sm font-medium">Henüz tavsiye yazılmamış. İlk yazan siz olun!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {references.map((ref) => (
                  <div key={ref.id} className="pb-4 border-b border-stone-100 last:border-0 last:pb-0 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-stone-850 text-sm">{ref.recommenderName}</span>
                      <span className="text-[10px] bg-stone-150 text-stone-500 px-2 py-0.5 rounded font-bold">{ref.recommenderTitle}</span>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">{ref.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Sticky Request Card */}
        <div className="sticky top-24 bg-white border border-stone-100/80 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.06)] rounded-[28px] p-6 space-y-5">

          <div className="text-center md:text-left border-b border-stone-100/60 pb-4">
            <div className="flex items-baseline justify-center md:justify-start gap-1">
              <span className="text-3xl font-black text-stone-900">₺{selectedListing ? selectedListing.hourlyRate : (tutor.hourlyRate || 0)}</span>
              <span className="text-xs text-stone-500 font-bold">/saat</span>
            </div>
            <div className="text-xs text-rose-500 font-extrabold mt-1">İlk ders ücretsiz</div>
          </div>

          {user?.id !== tutor.id && (
            <div className="space-y-2.5">
              <button
                onClick={() => isAuthenticated ? openModal(tutor) : navigate("/giris")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md shadow-emerald-600/10 active:scale-[0.98] text-sm"
              >
                Ders Talep Et
              </button>
              <button
                onClick={() => navigate(`/mesajlar?userId=${tutor.id}`)}
                className="w-full bg-stone-50 hover:bg-stone-100 border border-stone-200/60 text-stone-700 font-bold py-3.5 rounded-2xl transition-all active:scale-[0.98] text-sm"
              >
                Mesaj Gönder
              </button>
            </div>
          )}

          <div className="bg-stone-50 rounded-2xl p-4 space-y-3 text-xs font-bold text-stone-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <span>Ortalama Cevap Süresi: 1 saatten az</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <span className="truncate">
                Konum: {selectedListing?.allowsOnline ? "Online" : ""}
                {selectedListing?.allowsTutorHome ? " · Öğretmen Evi" : ""}
                {selectedListing?.allowsStudentHome ? " · Öğrenci Evi" : ""}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
