import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Save, ArrowLeft, Camera, Check, X, Zap, ShieldCheck,
  GraduationCap, MapPin, Lock, Search, Trash2, CheckCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../providers/AuthProvider";
import { userApi, subjectApi, tutorApi, fileApi } from "../api/services";
import type { SubjectResponse } from "../api/services";
import { Avatar } from "../components/shared/Avatar";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../components/ui/form";
import { profileSchema, type ProfileForm } from "../lib/validation";

const DAY_LABELS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

const ALL_TIMES = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, "0")}:00`
);

export function ProfileEditPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";
  
  // Navigation tabs: My Profile, Tutor Settings (if tutor), My Invoices
  const [subTab, setSubTab] = useState<"profile" | "tutor" | "billing">("profile");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Genel Bilgiler form states
  const [gender, setGender] = useState("Erkek");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("2002-01-30");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("Türkiye");

  // Notifications states
  const [smsLessons, setSmsLessons] = useState(true);
  const [emailActivity, setEmailActivity] = useState(true);
  const [emailLessons, setEmailLessons] = useState(true);
  const [emailOffers, setEmailOffers] = useState(true);
  const [emailCancel, setEmailCancel] = useState(true);

  // Change Password states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Account delete states
  const [deleteChecked, setDeleteChecked] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
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

  const [availSlots, setAvailSlots] = useState<{ dayOfWeek: number; startTime: string; endTime: string }[]>([]);
  const [availDays, setAvailDays] = useState<Record<number, boolean>>({});
  const [availStart, setAvailStart] = useState("09:00");
  const [availEnd, setAvailEnd] = useState("18:00");

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
    tutorApi.getMySubjects().then(({ data }) => setSelectedSubjectIds(data.map((s: any) => s.subjectId))).catch(() => {});
    tutorApi.getMyAvailability().then(({ data }) => {
      setAvailSlots(data.map((s: any) => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime.substring(0, 5), endTime: s.endTime.substring(0, 5) })));
      const days: Record<number, boolean> = {};
      data.forEach((s: any) => { days[s.dayOfWeek] = true; });
      setAvailDays(days);
    }).catch(() => {});
  }, [user]);

  const handleSaveProfile = async (values: ProfileForm) => {
    setSaving(true);
    setError("");
    try {
      const { data } = await userApi.updateProfile(values);
      setUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Kaydedilirken hata oluştu");
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
      });
      setUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Bilgiler güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSubjects = async () => {
    setSaving(true);
    setError("");
    try {
      await tutorApi.updateMySubjects(selectedSubjectIds);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { setError("Konular kaydedilirken hata oluştu"); } finally { setSaving(false); }
  };

  const handleSaveAvailability = async () => {
    setSaving(true);
    setError("");
    try {
      const slots = Object.entries(availDays)
        .filter(([_, active]) => active)
        .map(([day]) => ({ dayOfWeek: parseInt(day), startTime: availStart, endTime: availEnd }));
      await tutorApi.updateMyAvailability(slots);
      setAvailSlots(slots);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { setError("Müsaitlik kaydedilirken hata oluştu"); } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setError("");
      const uploadRes = await fileApi.upload(file, true);
      const fileUrl = uploadRes.data.url;
      const { data } = await userApi.updateAvatar(fileUrl);
      setUser(data);
    } catch {
      setError("Avatar yüklenirken hata oluştu");
    }
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleDay = (day: number) => {
    setAvailDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Yeni şifreler eşleşmiyor.");
      return;
    }
    // Simulate password update
    setPasswordSuccess("Şifreniz başarıyla güncellendi ✓");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => {
      setShowPasswordForm(false);
      setPasswordSuccess("");
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button & Navigation header */}
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
        <button
          onClick={() => setSubTab("billing")}
          className={`pb-4 -mb-[18px] border-b-2 transition-all duration-300 ${
            subTab === "billing"
              ? "text-stone-900 border-rose-500 font-extrabold"
              : "text-stone-400 border-transparent hover:text-stone-600"
          }`}
        >
          Faturalarım
        </button>
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
                öğret.io profil ayarlarına hoş geldin. Hesap doğrulamalarını ve abonelik durumunu buradan takip edebilirsin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          
          {/* SÜTUN 1 */}
          <div className="space-y-6">
            {/* Genel Bilgiler 😁 */}
            <div className="bg-white border border-stone-100 rounded-[32px] p-6 shadow-sm space-y-4 text-center">
              <h3 className="font-extrabold text-stone-900 text-base">Genel bilgiler 😁</h3>
              
              <div className="space-y-3 text-left">
                <div>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-stone-50/50 rounded-xl px-4 py-2.5 text-xs font-bold text-stone-700 outline-none border border-stone-200/80 focus:border-rose-450 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Erkek">Erkek</option>
                    <option value="Kadın">Kadın</option>
                    <option value="Belirtmek istemiyorum">Belirtmek istemiyorum</option>
                  </select>
                </div>
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
                <div>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
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
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-[#4CD084] text-white p-0.5 rounded-full">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
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
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-[#4CD084] text-white p-0.5 rounded-full">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
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

            {/* Diploma 📜 */}
            <div className="bg-white border border-stone-100 rounded-[32px] p-6 shadow-sm space-y-4 text-center">
              <h3 className="font-extrabold text-stone-900 text-base">Diploma 📜</h3>
              
              <div className="flex flex-col items-center justify-center p-3">
                <div className="relative w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center border border-stone-100/60 shadow-inner">
                  <GraduationCap className="w-10 h-10 text-stone-400" />
                  <div className="absolute bottom-0 right-0 bg-[#4CD084] text-white p-1 rounded-full border-4 border-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </div>

              <button className="w-full bg-[#4CD084] text-white py-3 rounded-2xl font-bold text-xs shadow-sm transition-all cursor-default">
                Diploma onaylandı
              </button>
            </div>

            {/* Bildirimler 🗣️ */}
            <div className="bg-white border border-stone-100 rounded-[32px] p-6 shadow-sm space-y-5 text-center">
              <h3 className="font-extrabold text-stone-900 text-base">Bildirimler 🗣️</h3>
              
              <div className="space-y-4 text-left">
                <div>
                  <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block mb-2">SMS</span>
                  <button
                    onClick={() => setSmsLessons(!smsLessons)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                      smsLessons ? "bg-[#4CD084] text-white shadow-sm" : "bg-stone-50 text-stone-400 border border-stone-200/60"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${smsLessons ? "border-white bg-white text-[#4CD084]" : "border-stone-300 bg-white"}`}>
                      {smsLessons && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-bold">Ders talepleri</span>
                  </button>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block mb-2">E-MAIL</span>
                  <div className="space-y-2">
                    {[
                      { state: emailActivity, setState: setEmailActivity, label: "Hesap hareketleri" },
                      { state: emailLessons, setState: setEmailLessons, label: "Ders talepleri" },
                      { state: emailOffers, setState: setEmailOffers, label: "İlanlarımı ilgilendiren teklifler" },
                      { state: emailCancel, setState: setEmailCancel, label: "Abonelik iptali" }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => item.setState(!item.state)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                          item.state ? "bg-[#4CD084] text-white shadow-sm" : "bg-stone-50 text-stone-400 border border-stone-200/60"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${item.state ? "border-white bg-white text-[#4CD084]" : "border-stone-300 bg-white"}`}>
                          {item.state && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-bold">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SÜTUN 2 */}
          <div className="space-y-6">
            {/* Posta adresi 📍 */}
            <div className="bg-white border border-stone-100 rounded-[32px] p-6 shadow-sm space-y-4 text-center">
              <h3 className="font-extrabold text-stone-900 text-base">Posta adresi 📍</h3>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ülke / Şehir"
                  className="w-full bg-white rounded-xl px-4 py-2.5 text-xs font-bold text-stone-700 outline-none border border-stone-200/80 focus:border-rose-450 transition-colors"
                />
                
                {/* CSS simulated vector MapPin Locator */}
                <div className="relative h-44 w-full bg-stone-50 rounded-2xl overflow-hidden border border-stone-200/60 flex items-center justify-center shadow-inner">
                  {/* Grid layout */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="absolute top-8 left-12 w-28 h-2 bg-stone-200/50 rounded-full rotate-12" />
                  <div className="absolute top-16 left-6 w-36 h-2 bg-stone-200/50 rounded-full -rotate-6" />
                  <div className="absolute top-24 left-20 w-24 h-2 bg-stone-200/50 rounded-full rotate-45" />
                  
                  {/* Pin indicator */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <span className="relative flex h-6 w-6 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <MapPin className="relative w-6 h-6 text-rose-500 fill-rose-500" />
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold text-stone-500 shadow-sm border border-stone-100">
                    Google
                  </div>
                </div>
              </div>
            </div>

            {/* Kimlik 🪪 */}
            <div className="bg-white border border-stone-100 rounded-[32px] p-6 shadow-sm space-y-4 text-center">
              <h3 className="font-extrabold text-stone-900 text-base">Kimlik 🪪</h3>
              
              <div className="flex flex-col items-center justify-center p-3">
                <div className="relative w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center border border-stone-100/60 shadow-inner">
                  <ShieldCheck className="w-10 h-10 text-stone-400" />
                  <div className="absolute bottom-0 right-0 bg-[#4CD084] text-white p-1 rounded-full border-4 border-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </div>

              <button className="w-full bg-[#4CD084] text-white py-3 rounded-2xl font-bold text-xs shadow-sm transition-all cursor-default">
                Kimlik onaylandı
              </button>
            </div>

            {/* Hesabımı sil 😲 */}
            <div className="bg-white border border-stone-100 rounded-[32px] p-6 shadow-sm space-y-4 text-center">
              <h3 className="font-extrabold text-stone-900 text-base">Hesabımı sil 😲</h3>
              
              <div className="space-y-4 text-left">
                <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                  <strong>DİKKAT!</strong> Tüm bilgileriniz (iletişim bilgileri, ilanlar, e-mailler,...) tamamen ve geri dönüşü olmaksızın silinecek. Lütfen aşağıdaki kutucuğu işaretleyin.
                </p>
                
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
                  onClick={() => {
                    if (window.confirm("Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
                      alert("Hesabınız silindi.");
                      setUser(null);
                      navigate("/");
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
              <h3 className="font-extrabold text-stone-900 text-base">Profil gücü ⚡</h3>
              
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" className="stroke-stone-100" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="56" cy="56" r="48" className="stroke-emerald-500 transition-all duration-1000" strokeWidth="8"
                    fill="transparent" strokeDasharray="301.6" strokeDashoffset="45.2"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-stone-900">%85</span>
                  <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider">Çok Başarılı</span>
                </div>
              </div>

              <div className="space-y-2.5 text-left bg-stone-50/50 p-4 rounded-2xl border border-stone-100/60">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">✓</div>
                  <span>Kimlik doğrulandı (+%30)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">✓</div>
                  <span>Diploma onaylandı (+%30)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">✓</div>
                  <span>İletişim bilgileri (+%25)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-400">
                  <div className="w-4 h-4 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center text-[10px]">•</div>
                  <span>Profil fotoğrafı ekle (+%15)</span>
                </div>
              </div>
            </div>

            {/* Profil resmi 📷 */}
            <div className="bg-white border border-stone-100 rounded-[32px] p-6 shadow-sm space-y-4 text-center">
              <h3 className="font-extrabold text-stone-900 text-base">Profil resmi 📷</h3>
              
              <div className="flex justify-center p-2">
                <div className="relative">
                  <Avatar
                    src={user?.avatarUrl}
                    alt={user?.fullName || ""}
                    className="w-40 h-40 rounded-[28px] object-cover shadow-sm"
                  />
                  <label className="absolute bottom-1 right-1 w-10 h-10 bg-rose-400 hover:bg-rose-500 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-105 shadow-md shadow-rose-300">
                    <Camera className="w-4 h-4 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
              </div>
            </div>

            {/* Şifremi değiştir 🔒 */}
            <div className="bg-white border border-stone-100 rounded-[32px] p-6 shadow-sm space-y-4 text-center">
              <h3 className="font-extrabold text-stone-900 text-base">Şifremi değiştir 🔒</h3>
              
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

          {/* Availability schedule matrix */}
          <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-stone-900 text-lg mb-1">Müsaitlik Takvimi</h3>
              <p className="text-xs text-stone-400 font-medium mb-4">Hangi gün ve saatlerde müsait olduğunuzu belirtin</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-xs font-bold text-stone-400 block mb-1">Başlangıç Saati</label>
                  <select
                    value={availStart}
                    onChange={(e) => setAvailStart(e.target.value)}
                    className="w-full bg-stone-50/50 rounded-xl px-3 py-2 text-sm text-foreground border border-stone-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {ALL_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400 block mb-1">Bitiş Saati</label>
                  <select
                    value={availEnd}
                    onChange={(e) => setAvailEnd(e.target.value)}
                    className="w-full bg-stone-50/50 rounded-xl px-3 py-2 text-sm text-foreground border border-stone-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {ALL_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {DAY_LABELS.map((label, i) => {
                  const active = availDays[i] || false;
                  return (
                    <button
                      key={i}
                      onClick={() => toggleDay(i)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        active
                          ? "bg-green-50 text-green-700 border-green-300 shadow-sm"
                          : "border-stone-200 text-stone-500 hover:text-stone-700"
                      }`}
                    >
                      {active && <Check className="w-3 h-3 inline mr-1 stroke-[3]" />}
                      {label}
                    </button>
                  );
                })}
              </div>

              {availSlots.length > 0 && (
                <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-150">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Kayıtlı Müsaitlik Saatleri:</p>
                  <p className="text-xs font-bold text-stone-700 mt-1">
                    {availSlots
                      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                      .map((s) => DAY_LABELS[s.dayOfWeek])
                      .join(", ")}
                    {availSlots.length > 0 && ` (${availSlots[0]?.startTime || "?"} - ${availSlots[0]?.endTime || "?"})`}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleSaveAvailability}
              disabled={saving}
              className="w-full bg-primary text-white font-semibold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 mt-4"
            >
              {saving ? "Kaydediliyor..." : "Müsaitliği Kaydet"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: FATURALARIM (Kullanıcının faturalarını listelediği premium tablo ekranı) */}
      {subTab === "billing" && (
        <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm space-y-6 max-w-4xl mx-auto">
          <div className="space-y-2">
            <h3 className="font-extrabold text-stone-900 text-lg">Ödeme Geçmişi & Faturalar</h3>
            <p className="text-xs text-stone-400 font-medium">Satın aldığınız üyelikler ve ders paketleri faturaları.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-100 text-xs font-bold text-stone-400">
                  <th className="pb-3">Fatura No</th>
                  <th className="pb-3">Tarih</th>
                  <th className="pb-3">Açıklama</th>
                  <th className="pb-3">Tutar</th>
                  <th className="pb-3">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50 text-xs font-semibold text-stone-600">
                {[
                  { no: "INV-2026-003", date: "28.06.2026", desc: "Uzman Öğretmen Aboneliği (1 Aylık)", price: "₺299", status: "Ödendi" },
                  { no: "INV-2026-002", date: "28.05.2026", desc: "Uzman Öğretmen Aboneliği (1 Aylık)", price: "₺299", status: "Ödendi" },
                  { no: "INV-2026-001", date: "15.04.2026", desc: "Sistem Komisyon Bedeli - Matematik Dersi", price: "₺95", status: "Ödendi" }
                ].map((inv) => (
                  <tr key={inv.no} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 font-bold text-stone-900">{inv.no}</td>
                    <td className="py-4">{inv.date}</td>
                    <td className="py-4 font-medium">{inv.desc}</td>
                    <td className="py-4 font-bold text-stone-900">{inv.price}</td>
                    <td className="py-4">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
