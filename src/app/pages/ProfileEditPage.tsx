import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import {
  ArrowLeft, Camera, Check, ShieldCheck,
  GraduationCap, Trash2, ChevronRight
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../providers/AuthProvider";
import { toast } from "sonner";
import { userApi, subjectApi, tutorApi, type SubjectResponse } from "../api/services";
import { JsonLd } from "../components/shared/JsonLd";
import { Avatar } from "../components/shared/Avatar";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../components/ui/form";
import { profileSchema, type ProfileForm } from "../lib/validation";
import { TutorAvailabilityEditor } from "../components/tutor/TutorAvailabilityEditor";

function apiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null || !("response" in error)) return fallback;
  const response = (error as { response?: { data?: { message?: unknown } } }).response;
  return typeof response?.data?.message === "string" ? response.data.message : fallback;
}

export function ProfileEditPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";
  
  const [subTab, setSubTab] = useState<"profile" | "tutor">("profile");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [avatarBusy, setAvatarBusy] = useState(false);

  // Genel Bilgiler form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Change Password states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Account delete states
  const [deleteChecked, setDeleteChecked] = useState(false);

  const profileForm = useForm<ProfileForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      fullName: user?.fullName || "",
      bio: user?.bio || "",
      education: user?.education || "",
      experienceYears: user?.experienceYears || undefined,
      hourlyRate: user?.hourlyRate || undefined,
    },
  });

  const [allSubjects, setAllSubjects] = useState<SubjectResponse[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const completionScore = user?.profileCompletion?.score
    ?? user?.profileCompletionScore
    ?? (user?.profileComplete ? 100 : 0);
  const missingCompletionItems = user?.profileCompletion?.items.filter((item) => !item.completed) ?? [];

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setPhone(user.phone || "");
      profileForm.reset({
        fullName: user.fullName || "",
        bio: user.bio || "",
        education: user.education || "",
        experienceYears: user.experienceYears || undefined,
        hourlyRate: user.hourlyRate || undefined,
      });

      // Split fullName into First Name and Last Name
      const parts = (user.fullName || "").trim().split(/\s+/);
      if (parts.length > 1) {
        setFirstName(parts.slice(0, -1).join(" "));
        setLastName(parts[parts.length - 1]);
      } else {
        setFirstName(user.fullName || "");
        setLastName("");
      }
    }
  }, [user, profileForm]);

  useEffect(() => {
    if (user?.role !== "TUTOR") return;
    subjectApi.list().then(({ data }) => setAllSubjects(data)).catch(() => {});
    tutorApi.getMySubjects().then(({ data }) => setSelectedSubjectIds(data.map((subject) => subject.subjectId))).catch(() => {});
  }, [user]);

  const handleSaveProfile = async (values: ProfileForm) => {
    setSaving(true);
    setError("");
    try {
      const { data } = await userApi.updateProfile(values);
      setUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Kaydedilirken hata oluştu"));
    } finally {
      setSaving(false);
    }
  };

  const handleOnaylaGeneralInfo = async () => {
    setSaving(true);
    setError("");
    try {
      const combinedName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const { data } = await userApi.updateProfile({
        fullName: combinedName,
        bio: user?.bio || "",
        education: user?.education || "",
        experienceYears: user?.experienceYears || undefined,
        hourlyRate: user?.hourlyRate || undefined,
        phone: phone || undefined,
      });
      setUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Bilgiler güncellenirken hata oluştu"));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSubjects = async () => {
    setSaving(true);
    setError("");
    try {
      const { data } = await tutorApi.updateMySubjects(selectedSubjectIds);
      setUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { setError("Konular kaydedilirken hata oluştu"); } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Profil fotoğrafı JPEG veya PNG formatında olmalı");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Profil fotoğrafı 5 MB'dan küçük olmalı");
      return;
    }
    try {
      setAvatarBusy(true);
      setError("");
      const { data } = await userApi.uploadAvatar(file);
      setUser(data);
      toast.success("Profil fotoğrafı güncellendi");
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Profil fotoğrafı yüklenirken hata oluştu"));
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!window.confirm("Profil fotoğrafını kaldırmak istediğinize emin misiniz?")) return;
    try {
      setAvatarBusy(true);
      setError("");
      const { data } = await userApi.removeAvatar();
      setUser(data);
      toast.success("Profil fotoğrafı kaldırıldı");
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Profil fotoğrafı kaldırılamadı"));
    } finally {
      setAvatarBusy(false);
    }
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess("");
    setError("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor.");
      return;
    }
    try {
      await userApi.changePassword(oldPassword, newPassword);
      setPasswordSuccess("Şifreniz başarıyla güncellendi ✓");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess("");
      }, 2000);
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Şifre değiştirilirken hata oluştu"));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-1.5 text-xs text-stone-400 font-medium mb-4" aria-label="Sayfa yolu">
        <Link to="/" className="hover:text-stone-600 transition-colors">Ana Sayfa</Link>
        <ChevronRight className="w-3 h-3" aria-hidden="true" />
        <span className="text-stone-700 font-semibold" aria-current="page">Profil Düzenle</span>
      </nav>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://ogret.io/" },
          { "@type": "ListItem", position: 2, name: "Profil Düzenle", item: "https://ogret.io/profil/duzenle" },
        ],
      }} />
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Geri
        </button>
        {isOnboarding && (
          <span className="text-xs bg-emerald-50 text-emerald-700 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Kurulum Sihirbazı
          </span>
        )}
      </div>

      {/* Profile Top Sub-navigation Tabs */}
      <div className="flex items-center gap-8 border-b border-stone-100 pb-4 mb-8 text-sm font-bold">
        <button
          onClick={() => setSubTab("profile")}
          className={`pb-4 -mb-[18px] border-b-2 transition-all duration-300 ${
            subTab === "profile"
              ? "text-stone-900 border-rose-500 font-extrabold"
              : "text-stone-400 border-transparent hover:text-stone-600"
          }`}
        >
          Profilim
        </button>
        {user?.role === "TUTOR" && (
          <button
            onClick={() => setSubTab("tutor")}
            className={`pb-4 -mb-[18px] border-b-2 transition-all duration-300 ${
              subTab === "tutor"
                ? "text-stone-900 border-rose-500 font-extrabold"
                : "text-stone-400 border-transparent hover:text-stone-600"
            }`}
          >
            Ders & Müsaitlik
          </button>
        )}
      </div>

      {/* TAB 1: PROFILIM (Screenshottaki 3 Sütunlu Kart Grid Arayüzü) */}
      {subTab === "profile" && (
        <>
          {/* Branded Header Greeting Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 rounded-[32px] p-8 text-white relative overflow-hidden shadow-lg mb-8">
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mb-16 pointer-events-none animate-pulse" />
            <div className="absolute right-20 top-0 w-36 h-36 bg-white/5 rounded-full -mt-10 pointer-events-none" />
            
            <div className="relative z-10 space-y-2">
              <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-emerald-100">
                {user?.role === "TUTOR" ? "Uzman Öğretmen" : "Öğrenci Üye"}
              </span>
              <h2 className="text-3xl font-black tracking-tight">Hoş geldin, {firstName || user?.fullName?.split(" ")[0]}! 👋</h2>
              <p className="text-xs text-emerald-100/90 font-medium">
                öğret.io profil ayarlarına hoş geldin. Profilini, doğrulamalarını ve hesap güvenliğini buradan yönetebilirsin.
              </p>
              <div className="mt-5 max-w-xl rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3 text-xs font-extrabold">
                  <span>Profil tamamlanma durumu</span>
                  <span data-testid="profile-completion-score">%{completionScore}</span>
                </div>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-white/20"
                  role="progressbar"
                  aria-label="Profil tamamlanma yüzdesi"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={completionScore}
                >
                  <div className="h-full rounded-full bg-white transition-all" style={{ width: `${completionScore}%` }} />
                </div>
                <p className="mt-2 text-[11px] font-medium text-emerald-50">
                  {completionScore === 100
                    ? "Profiliniz kullanıma hazır."
                    : `Sıradaki eksikler: ${missingCompletionItems.slice(0, 3).map((item) => item.label).join(", ") || "profil bilgileri"}`}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          
          {/* SÜTUN 1 */}
          <div className="space-y-6">
            {/* Genel Bilgiler 😁 */}
            <div className="bg-white border border-stone-100 rounded-[32px] p-6 shadow-sm space-y-4 text-center">
              <h3 className="font-extrabold text-stone-900 text-base">Genel Bilgiler</h3>
              
              <div className="space-y-3 text-left">
                <div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ad"
                    className="w-full bg-white rounded-xl px-4 py-2.5 text-xs font-bold text-stone-700 outline-none border border-stone-200/80 focus:border-rose-450 transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Soyad"
                    className="w-full bg-white rounded-xl px-4 py-2.5 text-xs font-bold text-stone-700 outline-none border border-stone-200/80 focus:border-rose-450 transition-colors"
                  />
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-stone-50/30 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-stone-500 outline-none border border-stone-200/40 cursor-not-allowed"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold flex items-center gap-1 text-stone-700">
                    🇹🇷 ~
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Telefon"
                    className="w-full bg-white rounded-xl pl-14 pr-10 py-2.5 text-xs font-bold text-stone-700 outline-none border border-stone-200/80 focus:border-rose-450 transition-colors"
                  />
                  {phone.trim() && (
                    <div title="Telefon bilgisi mevcut" className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-emerald-500 text-white p-0.5 rounded-full">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>

              {saved && (
                <div className="text-xs font-bold text-emerald-600">Bilgileriniz kaydedildi ✓</div>
              )}
              <button
                onClick={handleOnaylaGeneralInfo}
                disabled={saving}
                className="w-full bg-rose-400 hover:bg-rose-500 active:scale-[0.98] text-white font-extrabold py-2.5 px-8 rounded-full text-xs shadow-md shadow-rose-200/50 transition-all block mt-4"
              >
                {saving ? "Kaydediliyor..." : "Onayla"}
              </button>
            </div>

            {/* Education information */}
            {user?.role === "TUTOR" && <div className="bg-white border border-stone-100 rounded-[32px] p-6 shadow-sm space-y-4 text-center">
              <h3 className="font-extrabold text-stone-900 text-base">Eğitim Bilgisi</h3>
              
              <div className="flex flex-col items-center justify-center p-3">
                <div className="relative w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center border border-stone-100/60 shadow-inner">
                  <GraduationCap className="w-10 h-10 text-stone-400" />
                  {user?.education?.trim() && (
                    <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full border-4 border-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>

              <div className={`w-full py-3 rounded-2xl font-bold text-xs ${user?.education?.trim() ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                {user?.education?.trim() ? "Eğitim bilgisi eklendi" : "Eğitim bilgisi henüz eklenmedi"}
              </div>
            </div>}
          </div>

          {/* SÜTUN 2 */}
          <div className="space-y-6">
            {/* Identity verification is optional and only applies to tutors. */}
            {user?.role === "TUTOR" && <div className="bg-white border border-stone-100 rounded-[32px] p-6 shadow-sm space-y-4 text-center">
              <h3 className="font-extrabold text-stone-900 text-base">Kimlik</h3>
              
              <div className="flex flex-col items-center justify-center p-3">
                <div className="relative w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center border border-stone-100/60 shadow-inner">
                  <ShieldCheck className="w-10 h-10 text-stone-400" />
                  {user.identityVerified && (
                    <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full border-4 border-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => !user.identityVerified && navigate("/dogrulama")}
                className={`w-full py-3 rounded-2xl font-bold text-xs shadow-sm transition-all ${user.identityVerified ? "bg-emerald-500 text-white cursor-default" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
              >
                {user.identityVerified ? "Kimlik doğrulandı" : "İsteğe bağlı doğrulamayı başlat"}
              </button>
              {!user.identityVerified && <p className="text-[10px] font-medium text-stone-400">Kimlik doğrulaması profil yüzdesini veya uygulamayı kullanmanızı etkilemez.</p>}
            </div>}

            {/* Hesabımı sil 😲 */}
            <div className="bg-white border border-stone-100 rounded-[32px] p-6 shadow-sm space-y-4 text-center">
              <h3 className="font-extrabold text-stone-900 text-base">Hesabımı Sil</h3>
              
              <div className="space-y-4 text-left">
                <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                  <strong>DİKKAT!</strong> İletişim ve profil bilgileriniz anonimleştirilir; mesajlarınız ve doğrulama belgeleriniz silinir. Hukuki yükümlülük kapsamındaki işlem kayıtları kimliğinizden ayrıştırılarak saklanabilir. İşlemden önce veri kopyanızı indirebilirsiniz.
                </p>

                <button
                  onClick={async () => {
                    try {
                      const { data } = await userApi.exportData();
                      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = "ogret-io-veri-export.json";
                      link.click();
                      URL.revokeObjectURL(url);
                    } catch {
                      toast.error("Veri kopyası oluşturulamadı. Lütfen tekrar deneyin.");
                    }
                  }}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  Veri kopyamı indir
                </button>
                
                <button
                  onClick={() => setDeleteChecked(!deleteChecked)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                    deleteChecked ? "bg-red-50 text-red-600 border border-red-200" : "bg-stone-50 text-stone-400 border border-stone-200/60"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${deleteChecked ? "border-red-500 bg-red-500 text-white" : "border-stone-300 bg-white"}`}>
                    {deleteChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-bold">Hesabımı sil</span>
                </button>

                <button
                  disabled={!deleteChecked}
                  onClick={async () => {
                    if (!window.confirm("Hesabınız anonimleştirilecek ve oturumunuz kapatılacak. Devam edilsin mi?")) return;
                    try {
                      await userApi.deleteAccount();
                      window.location.href = "/";
                    } catch {
                      toast.error("Hesap silme işlemi tamamlanamadı. Lütfen tekrar deneyin.");
                    }
                  }}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all ${
                    deleteChecked
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-200/40 cursor-pointer"
                      : "bg-stone-300 text-stone-500 cursor-not-allowed"
                  }`}
                >
                  Hesabımı sil
                </button>
              </div>
            </div>
          </div>

          {/* SÜTUN 3 */}
          <div className="space-y-6">
            {/* Profil Gücü ⚡ */}
            <div className="bg-white border border-stone-100 rounded-[32px] p-6 shadow-sm space-y-5 text-center">
              <h3 className="font-extrabold text-stone-900 text-base">Profil Gücü</h3>
              
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" className="stroke-stone-100" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="56" cy="56" r="48" className="stroke-emerald-500 transition-all duration-1000" strokeWidth="8"
                    fill="transparent" strokeDasharray="301.6" strokeDashoffset={301.6 * (1 - completionScore / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-stone-900">%{completionScore}</span>
                  <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider">{completionScore === 100 ? "Tamamlandı" : "Devam ediyor"}</span>
                </div>
              </div>

              <div className="space-y-2.5 text-left bg-stone-50/50 p-4 rounded-2xl border border-stone-100/60">
                {(user?.profileCompletion?.items ?? []).map((item) => (
                  <div key={item.key} className={`flex items-center gap-2 text-xs ${item.completed ? "font-bold text-stone-700" : "font-semibold text-stone-400"}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${item.completed ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-500"}`}>
                      {item.completed ? "✓" : "•"}
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
                {!user?.profileCompletion?.items?.length && (
                  <p className="text-xs font-semibold text-stone-500">Profil bilgilerinizi yenileyerek güncel kontrol listesini görüntüleyin.</p>
                )}
              </div>
            </div>

            {/* Profil resmi 📷 */}
            <div className="bg-white border border-stone-100 rounded-[32px] p-6 shadow-sm space-y-4 text-center">
              <h3 className="font-extrabold text-stone-900 text-base">Profil Resmi</h3>
              
              <div className="flex justify-center p-2">
                <div className="relative">
                  <Avatar
                    src={user?.avatarUrl}
                    alt={user?.fullName || ""}
                    className="w-40 h-40 rounded-[28px] object-cover shadow-sm"
                  />
                  <label
                    aria-disabled={avatarBusy}
                    className={`absolute bottom-1 right-1 w-10 h-10 bg-rose-400 rounded-full flex items-center justify-center transition-all shadow-md shadow-rose-300 ${
                      avatarBusy ? "cursor-wait opacity-70" : "hover:bg-rose-500 cursor-pointer hover:scale-105"
                    }`}
                  >
                    <Camera className={`w-4 h-4 text-white ${avatarBusy ? "animate-pulse" : ""}`} />
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      aria-label="Profil fotoğrafı seç"
                      className="hidden"
                      disabled={avatarBusy}
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
              </div>
              <p className="text-[11px] font-medium text-stone-400">JPEG veya PNG, en fazla 5 MB</p>
              {user?.avatarUrl && (
                <button
                  type="button"
                  onClick={handleAvatarRemove}
                  disabled={avatarBusy}
                  className="mx-auto flex items-center justify-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Fotoğrafı kaldır
                </button>
              )}
            </div>

            {/* Şifremi değiştir 🔒 */}
            <div className="bg-white border border-stone-100 rounded-[32px] p-6 shadow-sm space-y-4 text-center">
              <h3 className="font-extrabold text-stone-900 text-base">Şifremi Değiştir</h3>
              
              {!showPasswordForm ? (
                <div className="pt-2">
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full bg-rose-400 hover:bg-rose-500 active:scale-[0.98] text-white font-extrabold py-3 rounded-2xl text-xs shadow-md shadow-rose-200/40 transition-all cursor-pointer"
                  >
                    Şifremi değiştir
                  </button>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-3 text-left">
                  <div>
                    <input
                      type="password"
                      placeholder="Mevcut Şifre"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full bg-white rounded-xl px-4 py-2.5 text-xs font-bold text-stone-700 outline-none border border-stone-200/80 focus:border-rose-450 transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Yeni Şifre"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white rounded-xl px-4 py-2.5 text-xs font-bold text-stone-700 outline-none border border-stone-200/80 focus:border-rose-450 transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Yeni Şifre (Tekrar)"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white rounded-xl px-4 py-2.5 text-xs font-bold text-stone-700 outline-none border border-stone-200/80 focus:border-rose-450 transition-colors"
                    />
                  </div>

                  {passwordSuccess && (
                    <div className="text-xs font-bold text-emerald-600 text-center">{passwordSuccess}</div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-2.5 rounded-xl text-xs transition-all"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-rose-400 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all"
                    >
                      Güncelle
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </>
    )}

      {/* TAB 2: DERS & MUSAITLIK (Öğretmenler için listeleme biyografisi, ders seçimi ve takvim müsaitliği) */}
      {subTab === "tutor" && user?.role === "TUTOR" && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Biography & Basic Listing details */}
          <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-stone-900 text-lg">Öğretmenlik İlan Bilgileri</h3>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleSaveProfile)} className="space-y-5">
                <FormField
                  control={profileForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biyografi</FormLabel>
                      <FormControl>
                        <textarea
                          rows={4}
                          placeholder="Kendinizden, ders anlatım tarzınızdan bahsedin..."
                          className="w-full bg-stone-50/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none border border-stone-200/80 focus:border-primary transition-colors resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eğitim</FormLabel>
                      <FormControl>
                        <input
                          type="text"
                          placeholder="Örn: Boğaziçi Üniversitesi - Matematik"
                          className="w-full bg-stone-50/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none border border-stone-200/80 focus:border-primary transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="experienceYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deneyim (yıl)</FormLabel>
                        <FormControl>
                          <input
                            type="number"
                            className="w-full bg-stone-50/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none border border-stone-200/80 focus:border-primary transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saatlik Ücret (₺)</FormLabel>
                        <FormControl>
                          <input
                            type="number"
                            className="w-full bg-stone-50/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none border border-stone-200/80 focus:border-primary transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary text-white font-semibold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                >
                  {saving ? "Kaydediliyor..." : "İlan Bilgilerini Kaydet"}
                </button>
              </form>
            </Form>
          </div>

          {/* Subjects Selection */}
          <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-stone-900 text-lg mb-1">Verdiğiniz Dersler</h3>
              <p className="text-xs text-stone-400 font-medium mb-4">Hangi konularda özel ders verdiğinizi seçin</p>
              
              <div className="flex flex-wrap gap-2">
                {allSubjects.map((s) => {
                  const selected = selectedSubjectIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSubject(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                        selected
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "border-stone-200 text-stone-500 hover:text-stone-700 hover:border-primary/50"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 inline mr-1 stroke-[3]" />}
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSaveSubjects}
              disabled={saving}
              className="w-full bg-primary text-white font-semibold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 mt-4"
            >
              {saving ? "Kaydediliyor..." : "Dersleri Kaydet"}
            </button>
          </div>

          <TutorAvailabilityEditor />
        </div>
      )}

    </div>
  );
}
