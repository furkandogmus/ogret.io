import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { BookOpen, User, Mail, Award, MessageSquare, CheckCircle, ChevronLeft } from "lucide-react";
import { tutorApi, referenceApi, type UserResponse } from "../api/services";
import { Avatar } from "../components/shared/Avatar";

export function WriteReferencePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<UserResponse | null>(null);
  const [loadingTutor, setLoadingTutor] = useState(true);

  // Form states
  const [recommenderName, setRecommenderName] = useState("");
  const [recommenderEmail, setRecommenderEmail] = useState("");
  const [recommenderTitle, setRecommenderTitle] = useState("Eski Öğrenci");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    tutorApi
      .getById(id)
      .then(({ data }) => setTutor(data))
      .catch(() => setError("Öğretmen bilgisi alınamadı"))
      .finally(() => setLoadingTutor(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError("");

    if (!recommenderName.trim()) {
      setError("Lütfen adınızı ve soyadınızı girin.");
      return;
    }
    if (!recommenderEmail.trim() || !recommenderEmail.includes("@")) {
      setError("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }
    if (!comment.trim() || comment.length < 10) {
      setError("Lütfen en az 10 karakterden oluşan bir tavsiye yazın.");
      return;
    }

    setSubmitting(true);
    try {
      await referenceApi.create(id, {
        recommenderName,
        recommenderEmail,
        recommenderTitle,
        comment,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Tavsiye gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTutor) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 skeleton" />
            <div className="h-3 w-24 skeleton" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="h-4 w-32 skeleton" />
          <div className="h-20 w-full skeleton rounded-xl" />
          <div className="h-4 w-24 skeleton" />
          <div className="h-10 w-full skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-lg font-medium text-foreground">Öğretmen bulunamadı.</p>
        <button onClick={() => navigate("/")} className="text-primary text-sm hover:underline">
          Ana sayfaya dön
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">Tavsiyeniz Alındı!</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {tutor.fullName} öğretmene yazdığınız tavsiye başarıyla iletildi. Sistem yöneticisi (admin) onayladıktan sonra öğretmenin profilinde yayınlanacaktır.
            </p>
          </div>
          <button
            onClick={() => navigate(`/ogretmen/${tutor.id}`)}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
          >
            Öğretmen Profiline Git
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Geri Dön
      </button>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="h-24 bg-gradient-to-r from-emerald-600 to-emerald-400" />
        <div className="px-6 pb-6">
          <div className="flex items-start gap-4 -mt-8 mb-6">
            <Avatar src={tutor.avatarUrl} alt={tutor.fullName} className="w-20 h-20 rounded-2xl border-4 border-white shadow-sm" />
            <div className="pt-10">
              <h1 className="text-lg font-bold text-foreground">{tutor.fullName} için Tavsiye Yaz</h1>
              <p className="text-xs text-muted-foreground">{tutor.education || "Öğretmen"}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Adınız ve Soyadınız</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="Ad Soyad"
                    value={recommenderName}
                    onChange={(e) => setRecommenderName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">E-posta Adresiniz</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="ornek@email.com"
                    value={recommenderEmail}
                    onChange={(e) => setRecommenderEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Yakınlık Dereceniz / İlişkiniz</label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={recommenderTitle}
                  onChange={(e) => setRecommenderTitle(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer"
                >
                  <option value="Eski Öğrenci">Eski Öğrencisi</option>
                  <option value="Öğrenci Velisi">Öğrenci Velisi</option>
                  <option value="Meslektaş">Meslektaşı</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Tavsiye Yazınız</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <textarea
                  required
                  rows={5}
                  minLength={10}
                  placeholder="Öğretmeniniz hakkındaki olumlu deneyimlerinizi ve tavsiyelerinizi buraya yazın..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm min-h-[120px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
            >
              {submitting ? "Gönderiliyor..." : "Tavsiye Gönder"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
