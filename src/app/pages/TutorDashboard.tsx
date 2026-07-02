import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen, Users, DollarSign, Star, Home, Calendar, BarChart2, MessageSquare,
  Settings, X, Check, Zap, LogOut, Link, Award, Copy, CheckSquare
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { useAuth } from "../providers/AuthProvider";
import { lessonApi, referenceApi, listingApi } from "../api/services";
import type { LessonResponse, ListingResponse } from "../api/services";
import { Avatar } from "../components/shared/Avatar";
import { Shield } from "lucide-react";

const SIDEBAR_ITEMS = [
  { id: "dashboard", label: "Genel Bakış", icon: Home },
  { id: "listings", label: "İlanlarım", icon: BookOpen },
  { id: "students", label: "Öğrencilerim", icon: Users },
  { id: "references", label: "Referanslarım", icon: Award },
];

export function TutorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [references, setReferences] = useState<any[]>([]);
  const [listings, setListings] = useState<ListingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [meetingLinks, setMeetingLinks] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchLessons();
    fetchReferences();
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data } = await listingApi.getMyListings();
      setListings(data);
    } catch {
      toast.error("İlanlar yüklenemedi");
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;
    try {
      await listingApi.delete(id);
      fetchListings();
    } catch {
      toast.error("İlan silinemedi");
    }
  };

  const fetchReferences = async () => {
    try {
      const { data } = await referenceApi.getMyReferences();
      setReferences(data);
    } catch {
      toast.error("Referanslar yüklenemedi");
    }
  };
  const fetchLessons = async () => {
    try {
      const { data } = await lessonApi.list("tutor");
      setLessons(data);
    } catch {
      toast.error("Dersler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await lessonApi.confirm(id);
      fetchLessons();
    } catch {
      toast.error("Ders onaylanamadı");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await lessonApi.cancel(id, "Öğretmen tarafından reddedildi");
      fetchLessons();
    } catch {
      toast.error("Ders iptal edilemedi");
    }
  };

  const handleSetMeetingLink = async (lessonId: string) => {
    const link = meetingLinks[lessonId];
    if (!link) return;
    try {
      await lessonApi.updateMeetingLink(lessonId, link);
      fetchLessons();
    } catch {
      toast.error("Meeting linki güncellenemedi");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await lessonApi.complete(id);
      fetchLessons();
    } catch {
      toast.error("Ders tamamlanamadı");
    }
  };

  const pendingRequests = lessons.filter((l) => l.status === "PENDING");
  const upcomingLessons = lessons.filter((l) => l.status === "CONFIRMED" || l.status === "IN_PROGRESS");
  const completedLessons = lessons.filter((l) => l.status === "COMPLETED");
  const students = new Set(lessons.map((l) => l.student.id));
  const totalEarnings = completedLessons.reduce((sum, l) => sum + l.price, 0);
  const avgRating = user?.ratingAvg ?? 0;

  const monthlyData = (() => {
    const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    const data: { month: string; amount: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = months[d.getMonth()];
      const amount = completedLessons
        .filter((l) => {
          const ld = new Date(l.lessonDate);
          return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
        })
        .reduce((sum, l) => sum + l.price, 0);
      data.push({ month: monthLabel, amount });
    }
    return data;
  })();

  const formatDate = (lesson: LessonResponse) => {
    const d = new Date(lesson.lessonDate);
    return `${d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}, ${lesson.startTime.substring(0, 5)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
        <aside className="w-56 flex-shrink-0 hidden md:block">
        <div className="card-elevated p-3 sticky top-24">
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            <div className="relative">
              <Avatar src={user?.avatarUrl} alt={user?.fullName || "Öğretmen"} className="w-10 h-10" online />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{user?.fullName || "Öğretmen"}</p>
              <p className="text-xs text-muted-foreground">Öğretmen</p>
            </div>
          </div>
          <div className="space-y-0.5">
            {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeSection === id
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

      <div className="flex-1 space-y-6 min-w-0">
        <div>
          <h1 className="text-xl font-bold text-foreground">Öğretmen Paneli</h1>
          <p className="text-muted-foreground text-sm">Hoş geldiniz, {user?.fullName || "Öğretmen"}!</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : activeSection === "listings" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-card border border-border rounded-2xl p-5">
              <div>
                <h2 className="font-semibold text-foreground text-lg">Özel Ders İlanlarım</h2>
                <p className="text-sm text-muted-foreground">Farklı kategorilerde açtığınız ilanları buradan yönetin.</p>
              </div>
              <button
                onClick={() => navigate("/ogretmen/ilan-olustur")}
                className="btn-glow bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition text-sm flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" /> Yeni İlan Aç
              </button>
            </div>

            {listings.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl space-y-4">
                <BookOpen className="w-12 h-12 mx-auto opacity-20 text-foreground" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-base">Henüz bir ilanınız bulunmuyor</p>
                  <p className="text-sm text-muted-foreground">Farklı branşlarda ilanlar açarak öğrencilerinize kendinizi tanıtın.</p>
                </div>
                <button
                  onClick={() => navigate("/ogretmen/ilan-olustur")}
                  className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition text-sm"
                >
                  İlk İlanını Oluştur
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {listings.map(l => (
                  <div key={l.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                          {l.subjectName}
                        </span>
                        <span className="text-sm font-bold text-foreground">₺{l.hourlyRate} / sa</span>
                      </div>
                      <h3 className="font-bold text-foreground text-base line-clamp-1">{l.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{l.lessonDescription}</p>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex gap-2">
                        {l.allowsOnline && <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">Online</span>}
                        {l.allowsTutorHome && <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">Evinizde</span>}
                        {l.allowsStudentHome && <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">Seyahat</span>}
                      </div>
                      <button
                        onClick={() => handleDeleteListing(l.id)}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 transition"
                      >
                        İlanı Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeSection === "students" ? (
          <div className="space-y-6">
            <div className="card-elevated p-5">
              <h2 className="font-semibold text-foreground text-lg flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-primary" /> Öğrencilerim
              </h2>
              <p className="text-sm text-muted-foreground mb-5">Size ders alan öğrencilerin listesi.</p>
              {students.size === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Henüz bir öğrenciniz bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.from(students).map(studentId => {
                    const studentLessons = lessons.filter(l => l.student.id === studentId);
                    const student = studentLessons[0].student;
                    const completed = studentLessons.filter(l => l.status === "COMPLETED");
                    const totalHours = completed.reduce((sum, l) => sum + l.durationMinutes, 0);
                    return (
                      <div key={studentId} className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                        <Avatar src={student.avatarUrl} alt={student.fullName} className="w-12 h-12" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground text-sm">{student.fullName}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {studentLessons.length} ders · {totalHours} dk toplam
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/mesajlar?userId=${studentId}`)}
                          className="text-xs border border-border px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                        >
                          Mesaj Gönder
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : activeSection === "references" ? (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" /> Referanslarım ve Tavsiyeler
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Eski öğrencileriniz, velileriniz veya meslektaşlarınızdan tavsiye yazısı toplayarak profilinizin güvenilirliğini artırabilirsiniz. Aşağıdaki referans isteme linkini kopyalayıp onlarla paylaşın. Yazılan tavsiyeler admin onayından geçtikten sonra profilinizde listelenir.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-muted/50 p-3.5 rounded-xl border border-border">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/ogretmen/${user?.id}/referans-yaz`}
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none font-mono text-muted-foreground select-all"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/ogretmen/${user?.id}/referans-yaz`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center justify-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Kopyalandı!" : "Linki Kopyala"}
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-foreground text-base">Gelen Tavsiyeler</h3>
              {references.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                  <Award className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Henüz bir tavsiye almadınız. Yukarıdaki linki paylaşarak ilk tavsiyenizi isteyin!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {references.map((ref) => (
                    <div key={ref.id} className="p-4 border border-border rounded-xl space-y-3 bg-muted/10">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="font-semibold text-foreground text-sm">{ref.recommenderName}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {ref.recommenderTitle} · {new Date(ref.createdAt).toLocaleDateString("tr-TR")}
                          </div>
                        </div>
                        <span                         className={`text-xs px-2.5 py-1 rounded-full font-medium ${ref.status === "APPROVED"
                            ? "bg-green-50 text-green-700"
                            : ref.status === "REJECTED"
                              ? "bg-red-50 text-red-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}>
                          {ref.status === "APPROVED" ? "Yayınlandı" : ref.status === "REJECTED" ? "Reddedildi" : "Admin Onayı Bekliyor"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">"{ref.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : listings.length === 0 && lessons.length === 0 ? (
          <div className="card-elevated p-6 md:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Öğretmen Paneline Hoş Geldiniz!</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                İlk adımı atın, profilinizi oluşturun. Öğrencilerin size ulaşabilmesi için aşağıdaki adımları tamamlayın.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { step: 1, title: "Profilim", desc: "Kişisel bilgilerinizi, adres ve bildirimlerinizi düzenleyin", action: "/profil/duzenle" },
                { step: 2, title: "İlan Oluştur", desc: "Vermek istediğiniz dersleri listeleyin", action: "/ogretmen/ilan-olustur" },
                { step: 3, title: "Doğrulama Yap", desc: "Kimliğinizi onaylayın, güven rozeti kazanın", action: "/dogrulama" },
              ].map(({ step, title, desc, action }) => (
                <button
                  key={step}
                  onClick={() => navigate(action)}
                  className="text-left p-4 rounded-xl bg-muted hover:bg-primary/5 border border-border hover:border-primary/30 transition-all"
                >
                  <div className="text-primary font-bold text-lg mb-1">{step}</div>
                  <div className="font-semibold text-foreground text-sm">{title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{desc}</div>
                </button>
              ))}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => navigate("/ogretmen/ilan-olustur")}
                className="btn-glow bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition text-sm"
              >
                Hemen İlan Oluştur
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Bu Ay Ders", value: String(upcomingLessons.length), icon: BookOpen, bg: "bg-emerald-50", iconColor: "text-emerald-600" },
                { label: "Toplam Öğrenci", value: String(students.size), icon: Users, bg: "bg-emerald-50", iconColor: "text-emerald-600" },
                { label: "Bu Ay Gelir", value: `₺${totalEarnings.toLocaleString("tr-TR")}`, icon: DollarSign, bg: "bg-violet-50", iconColor: "text-violet-600" },
                { label: "Ortalama Puan", value: `${avgRating} ★`, icon: Star, bg: "bg-emerald-50", iconColor: "text-emerald-600" },
              ].map(({ label, value, icon: Icon, bg, iconColor }) => (
                <div key={label} className="bg-card border border-border rounded-2xl p-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div className="text-lg font-bold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {pendingRequests.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="font-semibold text-foreground">Bekleyen Ders Talepleri</h2>
                  <span className="bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center gap-4 p-4 border border-emerald-200 bg-emerald-50 rounded-xl"
                    >
                      <Avatar src={req.student.avatarUrl} alt={req.student.fullName} className="w-12 h-12" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm">{req.student.fullName}</div>
                        <div className="text-xs text-muted-foreground">{req.subject.name} · {req.durationMinutes} dk</div>
                        <div className="text-xs text-emerald-700 mt-0.5">{formatDate(req)}</div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleCancel(req.id)}
                          className="p-2 rounded-lg border border-border hover:bg-red-50 hover:border-red-200 text-muted-foreground hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleConfirm(req.id)}
                          className="p-2 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {upcomingLessons.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="font-semibold text-foreground">Onaylanan Dersler</h2>
                </div>
                <div className="space-y-3">
                  {upcomingLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-4 p-4 bg-muted rounded-xl"
                    >
                      <Avatar src={lesson.student.avatarUrl} alt={lesson.student.fullName} className="w-12 h-12" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm">{lesson.student.fullName}</div>
                        <div className="text-xs text-muted-foreground">{lesson.subject.name} · {lesson.durationMinutes} dk</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{formatDate(lesson)}</div>
                        {!lesson.meetingLink && (
                          <div className="flex items-center gap-1 mt-2">
                            <input
                              type="text"
                              placeholder="Zoom/Meet linki ekle..."
                              value={meetingLinks[lesson.id] || ""}
                              onChange={(e) => setMeetingLinks((prev) => ({ ...prev, [lesson.id]: e.target.value }))}
                              className="flex-1 bg-background rounded-lg px-2 py-1 text-xs border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button
                              onClick={() => handleSetMeetingLink(lesson.id)}
                              disabled={!meetingLinks[lesson.id]}
                              className="p-1 rounded-md bg-primary text-white disabled:opacity-30"
                            >
                              <Link className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {lesson.meetingLink && (
                          <a href={lesson.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 block">
                            {lesson.meetingLink}
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleComplete(lesson.id)}
                        className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-medium px-3 py-2 rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Tamamla
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-foreground">Aylık Gelir</h2>
                  <p className="text-xs text-muted-foreground">Son 7 ay</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">₺{totalEarnings.toLocaleString("tr-TR")}</div>
                </div>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₺${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(v: number) => [`₺${v.toLocaleString("tr-TR")}`, "Gelir"]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", fontSize: "13px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#d97706"
                      strokeWidth={2.5}
                      fill="url(#earningsGrad)"
                      dot={{ fill: "#d97706", strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5" />
                    <span className="font-bold text-lg">Profilimi Öne Çıkar</span>
                  </div>
                  <p className="text-emerald-100 text-sm max-w-xs leading-relaxed">
                    Arama sonuçlarında üst sıralarda çık, daha fazla öğrenciye ulaş. Ayda ₺49'dan başlayan planlar.
                  </p>
                  <button
                    onClick={() => navigate("/abonelik")}
                    className="mt-4 bg-white text-emerald-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors"
                  >
                    Planları İncele
                  </button>
                </div>
                <div className="text-5xl opacity-25 flex-shrink-0">⭐</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
