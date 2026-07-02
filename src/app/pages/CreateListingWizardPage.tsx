import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BookOpen, User, MapPin, Globe, DollarSign, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { subjectApi, listingApi } from "../api/services";
import type { SubjectResponse } from "../api/services";

const LANGUAGES_LIST = [
  "Türkçe", "İngilizce", "Almanca", "Fransızca", "İspanyolca", "İtalyanca", "Rusça", "Arapça", "Farsça", "Çince"
];

export function CreateListingWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Form state
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [aboutTutor, setAboutTutor] = useState("");
  const [allowsTutorHome, setAllowsTutorHome] = useState(false);
  const [allowsStudentHome, setAllowsStudentHome] = useState(false);
  const [allowsOnline, setAllowsOnline] = useState(true);
  const [maxTravelDistanceKm, setMaxTravelDistanceKm] = useState<number>(10);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["Türkçe"]);
  const [hourlyRate, setHourlyRate] = useState<number>(500);

  // Status/Error states
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shakeField, setShakeField] = useState<string | null>(null);

  useEffect(() => {
    subjectApi.list()
      .then(({ data }) => setSubjects(data))
      .catch(() => setError("Ders konuları yüklenemedi."))
      .finally(() => setLoadingSubjects(false));
  }, []);

  const getWordCount = (text: string) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  const handleSubjectSelect = (id: string) => {
    setSelectedSubjectId(id);
    const sub = subjects.find(s => s.id === id);
    if (sub) {
      setTitle(`${sub.name} Özel Ders İlanı`);
    }
    setStep(2);
  };

  const triggerShake = (field: string) => {
    setShakeField(null);
    requestAnimationFrame(() => setShakeField(field));
    setTimeout(() => setShakeField(null), 500);
  };

  const handleNext = () => {
    if (step === 2) {
      if (!title.trim()) {
        triggerShake("title");
        return;
      }
      if (getWordCount(lessonDescription) < 50) {
        triggerShake("wordCount");
        return;
      }
      if (containsContactInfo(lessonDescription)) {
        triggerShake("lessonDescription");
        return;
      }
    }

    if (step === 3) {
      if (getWordCount(aboutTutor) < 50) {
        triggerShake("aboutWordCount");
        return;
      }
      if (containsContactInfo(aboutTutor)) {
        triggerShake("aboutTutor");
        return;
      }
    }

    if (step === 4) {
      if (!allowsOnline && !allowsTutorHome && !allowsStudentHome) {
        triggerShake("formats");
        return;
      }
    }

    if (step === 5) {
      if (selectedLanguages.length === 0) {
        triggerShake("languages");
        return;
      }
    }

    setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setError("");
    setStep(prev => prev - 1);
  };

  const containsContactInfo = (text: string) => {
    const phoneRegex = /[0-9]{7,}/;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/;
    return phoneRegex.test(text) || emailRegex.test(text);
  };

  const handleLanguageToggle = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleSubmit = async () => {
    if (hourlyRate <= 0) {
      triggerShake("hourlyRate");
      return;
    }

    setSubmitting(true);
    try {
      await listingApi.create({
        subjectId: selectedSubjectId,
        title,
        lessonDescription,
        aboutTutor,
        hourlyRate,
        allowsTutorHome,
        allowsStudentHome,
        allowsOnline,
        maxTravelDistanceKm: allowsStudentHome ? maxTravelDistanceKm : undefined,
        languages: selectedLanguages
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  if (success) {
    return (
      <div className="max-w-xl mx-auto my-12 px-6 py-12 bg-card rounded-2xl border border-border text-center shadow-lg space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Tebrikler! İlanınız Yayında</h1>
          <p className="text-muted-foreground leading-relaxed">
            {selectedSubject?.name} ders ilanınız başarıyla oluşturuldu ve öğrencilerin aramalarında listelenmeye başladı.
          </p>
        </div>
        <button
          onClick={() => navigate("/ogretmen-panel")}
          className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition"
        >
          Panele Git
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      {/* Progress Header */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">Adım {step} / 6</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm font-medium text-foreground">
              {step === 1 && "Ders Konusu Seçimi"}
              {step === 2 && "Dersler Hakkında"}
              {step === 3 && "Sizin Hakkınızda"}
              {step === 4 && "Dersin Verileceği Yer"}
              {step === 5 && "Konuşulan Diller"}
              {step === 6 && "Saatlik Ücret"}
            </span>
          </div>
          {step > 1 && (
            <button onClick={handlePrev} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
              <ChevronLeft size={16} /> Geri
            </button>
          )}
        </div>
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Contents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Info Card (Steps 2, 3, 4, 5, 6) */}
        {step > 1 && (
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4 h-fit">
            <div className="flex items-center gap-2 text-primary">
              {step === 2 && <BookOpen size={20} />}
              {step === 3 && <User size={20} />}
              {step === 4 && <MapPin size={20} />}
              {step === 5 && <Globe size={20} />}
              {step === 6 && <DollarSign size={20} />}
              <h3 className="font-bold text-foreground">Bilgi</h3>
            </div>
            
            {step === 2 && (
              <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                <p>Özel ders öğretmeni olarak yöntemlerinizi ve bilgilerinizi nasıl aktardığınızı açıklayın:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Öğretim teknik ve yöntemleriniz</li>
                  <li>Ders işlenme biçimi</li>
                  <li>Dersler kime yönelik (diploma, seviye, sınıf, vb.)</li>
                </ul>
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 mt-4">
                  <span className="text-xs font-semibold text-primary block mb-1">UNUTMAYIN</span>
                  <span className="text-xs">İletişim bilgileriniz veya sosyal medya linkleriniz burada yer alamaz.</span>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                <p>Güven verin, yetkinliğinizi kanıtlayın ve öğrencilere uzmanlığınız hakkında bilgi sunun.</p>
                <p>Öğrencilerinizin sizin hakkınızda ilk okuyacağı şeylerden biri burası olacaktır. Yazım kurallarına ve profesyonel üsluba dikkat edin.</p>
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 mt-4">
                  <span className="text-xs font-semibold text-primary block mb-1">UNUTMAYIN</span>
                  <span className="text-xs">İletişim bilgileriniz veya linkleriniz burada da yer alamaz. Söz sizde ;)</span>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                <p>Ders verebileceğiniz formatları seçin:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Evinizde:</strong> Öğrencileri kendi evinizde ağırlayın.</li>
                  <li><strong>Öğrencinin evinde:</strong> Seyahat mesafenizi belirterek öğrenciye gidin.</li>
                  <li><strong>Online:</strong> Sınırları kaldırarak internet üzerinden görüntülü ders verin.</li>
                </ul>
              </div>
            )}

            {step === 5 && (
              <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                <p>Ders anlatımı yapabileceğiniz dilleri işaretleyin.</p>
                <p>Farklı dil seçenekleri, platformdaki yabancı öğrencilerin veya çift dilli eğitim arayan velilerin aramalarında üst sıralarda görünmenizi sağlar.</p>
              </div>
            )}

            {step === 6 && (
              <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                <p>Saatlik ders ücretinizi girmekte ve istediğiniz zaman değiştirmekte özgürsünüz.</p>
                <p>Yeni başlıyorsanız, çok yüksek bir saatlik ücret seçmemek referans ve yorum toplayana kadar avantajlı olabilir.</p>
              </div>
            )}
          </div>
        )}

        {/* Right Side: Main Step Form */}
        <div className={`bg-card rounded-2xl border border-border p-6 shadow-sm ${step === 1 ? "md:col-span-3" : "md:col-span-2"}`}>
          
          {/* Step 1: Subject Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center max-w-lg mx-auto space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Hangi alanda ders vermek istiyorsunuz?</h1>
                <p className="text-sm text-muted-foreground">İlan açmak istediğiniz branşı seçerek başlayın.</p>
              </div>

              {loadingSubjects ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-2xl space-y-3">
                      <div className="w-10 h-10 rounded-full skeleton" />
                      <div className="h-4 w-16 skeleton" />
                      <div className="h-3 w-12 skeleton" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {subjects.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubjectSelect(sub.id)}
                      className={`flex flex-col items-center justify-center p-6 bg-card border rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition text-center space-y-2 group`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition">
                        <BookOpen size={20} />
                      </div>
                      <span className="font-semibold text-foreground text-sm">{sub.name}</span>
                      <span className="text-xs text-muted-foreground uppercase">{sub.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: About the Lesson */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Dersler Hakkında</h2>
                <p className="text-sm text-muted-foreground">Derslerinizin işleyişi ve yöntemleriniz hakkında bilgi yazın.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">İlan Başlığı</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn: Boğaziçi Mezunundan Pratik Matematik Dersleri"
                    className={`w-full px-4 py-3 bg-background border rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition ${shakeField === "title" ? "shake-border" : "border-border"}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ders Açıklaması</label>
                    <span className={`text-xs font-medium ${shakeField === "wordCount" ? "shake-border" : getWordCount(lessonDescription) >= 50 ? "text-green-500" : "text-yellow-500"}`}>
                      {getWordCount(lessonDescription)} / 50 Kelime
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={lessonDescription}
                    onChange={(e) => setLessonDescription(e.target.value)}
                      placeholder="Öğretim metodolojiniz, dersi nasıl işlediğiniz ve hedefleriniz..."
                    className={`w-full px-4 py-3 bg-background border rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition resize-none ${shakeField === "lessonDescription" ? "shake-border" : "border-border"}`}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition text-sm"
                >
                  İleri <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: About You */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Sizin Hakkınızda</h2>
                <p className="text-sm text-muted-foreground">Eğitiminiz, uzmanlığınız ve geçmiş başarılarınız hakkında bilgi verin.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Özgeçmişiniz</label>
                    <span className={`text-xs font-medium ${shakeField === "aboutWordCount" ? "shake-border" : getWordCount(aboutTutor) >= 50 ? "text-green-500" : "text-yellow-500"}`}>
                      {getWordCount(aboutTutor)} / 50 Kelime
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={aboutTutor}
                    onChange={(e) => setAboutTutor(e.target.value)}
                      placeholder="Eğitim geçmişiniz, branştaki uzmanlığınız ve neden sizi tercih etmeliler..."
                    className={`w-full px-4 py-3 bg-background border rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition resize-none ${shakeField === "aboutTutor" ? "shake-border" : "border-border"}`}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition text-sm"
                >
                  İleri <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Formats & Distance */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Dersin Verileceği Yer</h2>
                <p className="text-sm text-muted-foreground">Dersleriniz nerede işlenebilir?</p>
              </div>

              <div className={`space-y-4 ${shakeField === "formats" ? "shake" : ""}`}>
                <label className="flex items-center gap-3 p-4 bg-background border border-border rounded-xl cursor-pointer hover:border-primary/50 transition">
                  <input
                    type="checkbox"
                    checked={allowsOnline}
                    onChange={(e) => setAllowsOnline(e.target.checked)}
                    className="accent-primary"
                  />
                  <div>
                    <span className="font-semibold text-sm text-foreground block">Online</span>
                    <span className="text-xs text-muted-foreground">Webcam üzerinden görüntülü özel ders.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-background border border-border rounded-xl cursor-pointer hover:border-primary/50 transition">
                  <input
                    type="checkbox"
                    checked={allowsTutorHome}
                    onChange={(e) => setAllowsTutorHome(e.target.checked)}
                    className="accent-primary"
                  />
                  <div>
                    <span className="font-semibold text-sm text-foreground block">Evinizde</span>
                    <span className="text-xs text-muted-foreground">Dersi kendi evinizde vermeyi kabul edin.</span>
                  </div>
                </label>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 bg-background border border-border rounded-xl cursor-pointer hover:border-primary/50 transition">
                    <input
                      type="checkbox"
                      checked={allowsStudentHome}
                      onChange={(e) => setAllowsStudentHome(e.target.checked)}
                      className="accent-primary"
                    />
                    <div>
                      <span className="font-semibold text-sm text-foreground block">Ders Vermeye Gidebilirsiniz</span>
                      <span className="text-xs text-muted-foreground">Öğrencinin evine gitmeyi kabul edin.</span>
                    </div>
                  </label>

                  {allowsStudentHome && (
                    <div className="pl-8 space-y-1.5 animate-fadeIn">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Maksimum Seyahat Mesafesi (km)</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={maxTravelDistanceKm}
                        onChange={(e) => setMaxTravelDistanceKm(Number(e.target.value))}
                        className="w-32 px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition text-sm"
                >
                  İleri <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Languages */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Konuşulan Diller</h2>
                <p className="text-sm text-muted-foreground">Ders anlatımı yapabileceğiniz dilleri seçin.</p>
              </div>

              <div className={`grid grid-cols-2 gap-3 ${shakeField === "languages" ? "shake" : ""}`}>
                {LANGUAGES_LIST.map(lang => {
                  const selected = selectedLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      onClick={() => handleLanguageToggle(lang)}
                      className={`flex items-center justify-between p-3.5 border rounded-xl hover:border-primary transition text-sm font-medium ${selected ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground bg-background"}`}
                    >
                      <span>{lang}</span>
                      {selected && <CheckCircle2 size={16} />}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition text-sm"
                >
                  İleri <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Hourly Rate */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Saatlik Ücret</h2>
                <p className="text-sm text-muted-foreground">Dersleriniz için saatlik ne kadar talep ediyorsunuz?</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-[240px]">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₺</span>
                    <input
                      type="number"
                      min={100}
                      max={10000}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className={`w-full pl-8 pr-16 py-3.5 bg-background border rounded-xl text-lg font-bold outline-none focus:border-primary ${shakeField === "hourlyRate" ? "shake-border" : "border-border"}`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">/ saat</span>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-xl text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold block mb-1 text-foreground">Ortalama Branş Fiyatı Bilgisi:</span>
                  Platform genelinde {selectedSubject?.name || "bu branşta"} ortalama özel ders fiyatı <strong>530 ₺</strong> civarındadır. Ücretinizi sonradan istediğiniz zaman güncelleyebilirsiniz.
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-border">
                <button
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 text-sm"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                      Yayınlanıyor...
                    </>
                  ) : (
                    "İlanı Yayınla"
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
