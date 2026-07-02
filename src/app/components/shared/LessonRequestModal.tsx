import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { X, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { lessonApi, subjectApi } from "../../api/services";
import type { UserResponse, SubjectResponse } from "../../api/services";

interface LessonRequestModalProps {
  tutor: UserResponse;
  onClose: () => void;
}

export function LessonRequestModal({ tutor, onClose }: LessonRequestModalProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [duration, setDuration] = useState(60);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState(14);
  const [messageText, setMessageText] = useState("");
  const [stepError, setStepError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    subjectApi.list().then(({ data }) => setSubjects(data)).catch(() => console.error("Konular yuklenemedi"));
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-8 text-center">
          <h2 className="font-bold text-foreground text-lg mb-2">Giriş Yapmalısınız</h2>
          <p className="text-muted-foreground text-sm mb-6">Ders talep etmek için lütfen giriş yapın veya kayıt olun.</p>
          <button
            onClick={() => { onClose(); navigate("/giris"); }}
            className="w-full bg-primary text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Giriş Yap
          </button>
          <button onClick={onClose} className="mt-2 text-sm text-muted-foreground hover:text-foreground">
            Vazgeç
          </button>
        </div>
      </div>
    );
  }

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });
  const times = [9, 10, 11, 14, 15, 16, 17];
  const durations = [30, 45, 60, 90];
  const hourlyRate = tutor.hourlyRate || 0;
  const totalPrice = Math.round((hourlyRate * duration) / 60);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const dateStr = selectedDate || dates[0].toISOString().split("T")[0];
      const startTime = `${String(selectedTime).padStart(2, "0")}:00`;
      const endTime = `${String(selectedTime + Math.ceil(duration / 60)).padStart(2, "0")}:${duration % 60 === 0 ? "00" : String(duration % 60).padStart(2, "0")}`;

      await lessonApi.create({
        tutorId: tutor.id,
        subjectId: subjectId || subjects[0]?.id || "",
        lessonDate: dateStr,
        startTime,
        endTime,
        notes: messageText || undefined,
      });
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.message || "Talep gönderilirken hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateLabel = (d: Date) => {
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return "Bugün";
    if (diff === 1) return "Yarın";
    return d.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-bold text-foreground">Ders Talep Et</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{tutor.fullName} ile ders</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="px-6 pt-5 pb-3">
          <div className="flex items-center justify-between relative">
            {/* Background connecting line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-stone-100 z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-300 z-0"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />

            {[1, 2, 3, 4].map((s) => {
              const label = ["Ders", "Tarih", "Mesaj", "Onay"][s - 1];
              const isCompleted = s < step;
              const isActive = s === step;
              return (
                <div key={s} className="relative z-10 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 shadow-sm ${
                      isCompleted
                        ? "bg-primary text-white"
                        : isActive
                        ? "bg-white border-2 border-primary text-primary ring-4 ring-primary/10"
                        : "bg-white border-2 border-stone-200 text-stone-400"
                    }`}
                  >
                    {isCompleted ? "✓" : s}
                  </div>
                  <span
                    className={`text-[10px] font-bold tracking-wide transition-all ${
                      isActive ? "text-primary font-extrabold" : isCompleted ? "text-stone-600" : "text-stone-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="sr-only">
          Adım {step} / 4 — {["Konu & Süre", "Tarih & Saat", "Mesajınız", "Onay"][step - 1]}
        </div>

        <div className="p-5">
          {step === 1 && (
            <div className="space-y-5">
              {subjects.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Ders Konusu</label>
                  <div className="flex flex-wrap gap-2">
                    {subjects.slice(0, 8).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSubjectId(s.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          subjectId === s.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Ders Süresi</label>
                <div className="grid grid-cols-4 gap-2">
                  {durations.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`p-2.5 rounded-xl text-sm font-medium border transition-colors ${
                        duration === d
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {d} dk
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-muted rounded-xl flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tahmini ücret</span>
                <span className="font-bold text-foreground">₺{totalPrice}</span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Tarih Seçin</label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {dates.map((d, i) => {
                    const dateStr = d.toISOString().split("T")[0];
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                          selectedDate === dateStr
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        {formatDateLabel(d)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Uygun Saatler</label>
                <div className="grid grid-cols-4 gap-2">
                  {times.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`p-2.5 rounded-xl text-sm font-medium border transition-colors ${
                        selectedTime === t
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {t}:00
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Öğretmene Mesaj Yazın</label>
                <p className="text-xs text-muted-foreground mb-3">
                  Hedeflerinizi, mevcut seviyenizi ve öğrenmek istediklerinizi kısaca anlatın.
                </p>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Merhaba, matematik dersinde türev ve integral konularında desteğe ihtiyacım var..."
                  rows={5}
                  className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none text-foreground placeholder-muted-foreground resize-none border border-transparent focus:border-primary transition-colors"
                />
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center py-3">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-9 h-9 text-green-600" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">Talep Gönderildi!</h3>
                <p className="text-muted-foreground text-sm">
                  {tutor.fullName} talebinizi inceleyecek ve en kısa sürede geri dönecek.
                </p>
              </div>
              <div className="bg-muted rounded-xl p-4 space-y-2.5 text-sm">
                {[
                  { label: "Öğretmen", value: tutor.fullName },
                  { label: "Tarih & Saat", value: `${selectedDate ? formatDateLabel(new Date(selectedDate)) : "Yarın"}, ${selectedTime}:00` },
                  { label: "Süre", value: `${duration} dakika` },
                  { label: "Tahmini Ücret", value: `₺${totalPrice}`, bold: true, primary: true },
                ].map(({ label, value, bold, primary }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={`${bold ? "font-bold" : "font-medium"} ${primary ? "text-primary" : "text-foreground"}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
                <strong>Not:</strong> Ödeme, öğretmenle karşılıklı anlaşarak ders sonrasında doğrudan yapılır.
                Platformumuz herhangi bir komisyon almaz.
              </div>
            </div>
          )}
        </div>

        {stepError && (
          <div className="px-5 pb-2">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs">{stepError}</div>
          </div>
        )}
        <div className="flex items-center justify-between px-5 pb-5">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Geri
            </button>
          ) : (
            <div />
          )}
          {step < 4 ? (
            <button
              onClick={() => {
                setStepError("");
                if (step === 3) return handleSubmit();
                if (step === 1 && !subjectId) { setStepError("Lütfen bir ders konusu seçin"); return; }
                if (step === 2 && !selectedDate) { setStepError("Lütfen bir tarih seçin"); return; }
                setStep(step + 1);
              }}
              disabled={submitting}
              className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {step === 3 ? (submitting ? "Gönderiliyor..." : "Talep Gönder") : "Devam Et"}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Kapat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
