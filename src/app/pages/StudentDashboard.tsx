import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  BookOpen, Heart, MessageSquare, User, LogOut, Shield, Zap,
  Calendar, Clock, Video, Star, CheckCircle, Check, ArrowRight
} from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { lessonApi, favoriteApi, reviewApi } from "../api/services";
import type { LessonResponse, UserResponse } from "../api/services";
import { Avatar } from "../components/shared/Avatar";

const SIDEBAR_ITEMS = [
  { id: "lessons", label: "Derslerim", icon: BookOpen },
  { id: "favorites", label: "Öğretmenlerim", icon: Heart },
  { id: "subscription", label: "Abonelik", icon: Zap },
];

export function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = searchParams.get("section");

  const [activeSection, setActiveSection] = useState("lessons");
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [favorites, setFavorites] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal/feedback states
  const [reviewingLesson, setReviewingLesson] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    if (sectionParam === "lessons" || sectionParam === "favorites" || sectionParam === "subscription") {
      setActiveSection(sectionParam);
    } else {
      setActiveSection("lessons");
    }
  }, [sectionParam]);

  useEffect(() => {
    Promise.all([fetchLessons(), fetchFavorites()]).finally(() => setLoading(false));
  }, []);

  const fetchLessons = async () => {
    try {
      const { data } = await lessonApi.list("student");
      setLessons(data);
    } catch {
      console.error("Dersler yuklenemedi");
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data } = await favoriteApi.list();
      setFavorites(data);
    } catch {
      console.error("Favoriler yuklenemedi");
    }
  };

  const handleCancelLesson = async (id: string) => {
    if (!window.confirm("Bu dersi iptal etmek istediğinizden emin misiniz?")) return;
    try {
      await lessonApi.cancel(id, "Öğrenci tarafından iptal edildi");
      fetchLessons();
    } catch {
      console.error("Ders iptal edilemedi");
    }
  };

  const handleReviewSubmit = async (lessonId: string) => {
    setReviewError("");
    if (reviewRating < 1) { setReviewError("Lütfen bir puan seçin"); return; }
    try {
      await reviewApi.create(lessonId, { rating: reviewRating, comment: reviewComment || undefined });
      setReviewingLesson(null);
      setReviewRating(0);
      setReviewComment("");
      fetchLessons();
    } catch {
      setReviewError("Yorum gönderilirken hata oluştu");
    }
  };

  const formatDate = (lesson: LessonResponse) => {
    const d = new Date(lesson.lessonDate);
    const time = lesson.startTime.substring(0, 5);
    return `${d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}, ${time}`;
  };

  const handleSectionChange = (id: string) => {
    setActiveSection(id);
    setSearchParams({ section: id });
  };

  const upcoming = lessons.filter((l) => l.status === "CONFIRMED" || l.status === "IN_PROGRESS");
  const past = lessons.filter((l) => l.status === "COMPLETED" || l.status === "CANCELLED");
  const totalCount = lessons.length;
  const thisMonthCount = lessons.filter((l) => {
    const d = new Date(l.lessonDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
      
      {/* Sidebar Navigation */}
      <aside className="w-56 flex-shrink-0 hidden md:block">
        <div className="card-elevated p-3 sticky top-24">
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm truncate max-w-[110px]">{user?.fullName || "Öğrenci"}</p>
              <p className="text-xs text-muted-foreground">Öğrenci</p>
            </div>
          </div>
          
          <div className="space-y-0.5">
            {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleSectionChange(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="pt-2 mt-2 border-t border-border">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6 min-w-0">
        
        {/* Dynamic Headers */}
        {activeSection === "lessons" && (
          <div>
            <h1 className="text-xl font-bold text-foreground">Derslerim</h1>
            <p className="text-muted-foreground text-sm">Yaklaşan ve geçmiş derslerleriniz</p>
          </div>
        )}
        {activeSection === "favorites" && (
          <div>
            <h1 className="text-xl font-bold text-foreground">Öğretmenlerim</h1>
            <p className="text-muted-foreground text-sm">Sık çalıştığınız veya favoriye eklediğiniz öğretmenler</p>
          </div>
        )}
        {activeSection === "subscription" && (
          <div>
            <h1 className="text-xl font-bold text-foreground">Abonelik</h1>
            <p className="text-muted-foreground text-sm">Öğrenci abonelik paketiniz ve sistem ayrıcalıkları</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                  <div className="w-10 h-10 rounded-xl skeleton" />
                  <div className="h-5 w-16 skeleton" />
                  <div className="h-3 w-20 skeleton" />
                </div>
              ))}
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 skeleton" />
                  <div className="h-3 w-2/3 skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* VIEW 1: DERSLERIM */}
            {activeSection === "lessons" && (
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Toplam Ders", value: String(totalCount), icon: BookOpen, bg: "bg-emerald-50", iconColor: "text-emerald-600" },
                    { label: "Bu Ay Gerçekleşen", value: String(thisMonthCount), icon: Calendar, bg: "bg-emerald-50", iconColor: "text-emerald-600" },
                  ].map(({ label, value, icon: Icon, bg, iconColor }) => (
                    <div key={label} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                      </div>
                      <div className="text-2xl font-bold text-foreground">{value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Upcoming lessons list */}
                {upcoming.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <h2 className="font-semibold text-foreground mb-4">Yaklaşan Dersler</h2>
                    <div className="space-y-3">
                      {upcoming.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                          <Avatar src={lesson.tutor.avatarUrl} alt={lesson.tutor.fullName} className="w-12 h-12" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground text-sm">{lesson.tutor.fullName}</div>
                            <div className="text-xs text-muted-foreground truncate">{lesson.subject.name} · {lesson.durationMinutes} dk</div>
                            <div className="flex items-center gap-1 text-xs text-primary mt-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(lesson)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <a
                              href={lesson.meetingLink || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
                            >
                              <Video className="w-3.5 h-3.5" />
                              Katıl
                            </a>
                            <button
                              onClick={() => handleCancelLesson(lesson.id)}
                              className="text-xs text-red-500 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium"
                            >
                              İptal
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past lessons list */}
                {past.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <h2 className="font-semibold text-foreground mb-4">Geçmiş Dersler</h2>
                    <div className="space-y-3">
                      {past.map((lesson) => (
                        <div key={lesson.id}>
                          <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                            <Avatar src={lesson.tutor.avatarUrl} alt={lesson.tutor.fullName} className="w-12 h-12 opacity-60" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground text-sm">{lesson.tutor.fullName}</div>
                              <div className="text-xs text-muted-foreground">{lesson.subject.name} · {lesson.durationMinutes} dk</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{formatDate(lesson)}</div>
                            </div>
                            {lesson.status === "COMPLETED" ? (
                              <button
                                onClick={() => setReviewingLesson(reviewingLesson === lesson.id ? null : lesson.id)}
                                className="text-xs bg-emerald-500 text-white px-3 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex-shrink-0"
                              >
                                Değerlendir
                              </button>
                            ) : (
                              <span className="text-xs text-muted-foreground bg-card px-2.5 py-1 rounded-lg border border-border flex-shrink-0">
                                İptal
                              </span>
                            )}
                          </div>
                          {reviewingLesson === lesson.id && (
                            <div className="mt-2 p-4 bg-card border border-border rounded-xl space-y-3 shadow-inner">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button key={star} onClick={() => setReviewRating(star)}>
                                    <Star className={`w-5 h-5 ${star <= reviewRating ? "fill-emerald-400 text-emerald-400" : "text-muted-foreground"}`} />
                                  </button>
                                ))}
                              </div>
                              <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Yorumunuz (isteğe bağlı)..."
                                rows={2}
                                className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none text-foreground placeholder-muted-foreground resize-none border border-transparent focus:border-primary transition-colors"
                              />
                              {reviewError && (
                                <div className="text-xs text-red-500">{reviewError}</div>
                              )}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReviewSubmit(lesson.id)}
                                  className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                                >
                                  Gönder
                                </button>
                                <button
                                  onClick={() => { setReviewingLesson(null); setReviewError(""); }}
                                  className="text-xs text-muted-foreground px-4 py-2 hover:text-foreground transition-colors"
                                >
                                  Vazgeç
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {upcoming.length === 0 && past.length === 0 && (
                  <div className="text-center py-16 bg-white border border-stone-100 rounded-3xl p-8 shadow-sm">
                    <p className="text-base font-bold text-stone-900">Henüz dersiniz bulunmuyor</p>
                    <p className="text-xs text-muted-foreground mt-1.5 mb-4">
                      Türkiye'nin en başarılı uzman öğretmenlerinden özel ders talep ederek başlayabilirsiniz.
                    </p>
                    <button
                      onClick={() => navigate("/arama")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/10 active:scale-[0.97]"
                    >
                      Öğretmen Ara
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: FAVORILER / OĞRETMENLERIM */}
            {activeSection === "favorites" && (
              <div className="space-y-4">
                {favorites.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((tutor) => (
                      <div
                        key={tutor.id}
                        className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative cursor-pointer"
                        onClick={() => navigate(`/ogretmen/${tutor.id}`)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar src={tutor.avatarUrl} alt={tutor.fullName} className="w-12 h-12 rounded-xl" online={tutor.online} />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-stone-900 truncate">{tutor.fullName}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate">{tutor.education || "Özel Ders Öğretmeni"}</p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-amber-500 font-bold">
                              <span>★</span>
                              <span className="text-stone-700">{tutor.ratingAvg ? tutor.ratingAvg.toFixed(1) : "5.0"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-50">
                          <span className="text-xs font-bold text-stone-900">₺{tutor.hourlyRate || 0}/saat</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/mesajlar?userId=${tutor.id}`);
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 p-2 rounded-xl transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white border border-stone-100 rounded-3xl p-8 shadow-sm">
                    <p className="text-base font-bold text-stone-900">Favori öğretmeniniz bulunmuyor</p>
                    <p className="text-xs text-muted-foreground mt-1.5 mb-4">
                      Öğretmen profillerinde bulunan kalp simgesine tıklayarak favorilerinizi buraya ekleyebilirsiniz.
                    </p>
                    <button
                      onClick={() => navigate("/arama")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/10 active:scale-[0.97]"
                    >
                      Öğretmenleri Keşfet
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: ABONELIK */}
            {activeSection === "subscription" && (
              <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm max-w-xl mx-auto space-y-6">
                <div className="flex items-center gap-4 pb-4 border-b border-stone-100">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-emerald-600 fill-emerald-600/20" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-stone-950 text-base">öğret.io Standart Öğrenci</h3>
                    <p className="text-xs text-stone-400 font-medium mt-0.5">Süresiz Ücretsiz Plan</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">Plan Ayrıcalıkları</span>
                  <div className="space-y-3">
                    {[
                      "Uzman öğretmenlerle doğrudan sınırsız iletişim",
                      "İlk deneme dersini ücretsiz talep edebilme hakkı",
                      "Komisyonsuz ders ödeme transferleri",
                      "7/24 Canlı destek ve veli yardım paneli"
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-600 font-semibold">
                        <div className="bg-emerald-50 text-emerald-600 p-0.5 rounded-full mt-0.5 flex-shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => navigate("/abonelik")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md shadow-emerald-600/10 active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <span>Abonelik Paketlerini İncele</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
