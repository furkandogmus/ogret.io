import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { useToast } from "../../src/components/Toast";
import { useHaptics } from "../../src/hooks/useHaptics";
import { listingApi, subjectApi } from "../../src/api/services";
import { colors, spacing, radius } from "../../src/constants/theme";
import type { Subject, TutorListing } from "../../src/types";

const LANGUAGES_LIST = [
  "Türkçe", "İngilizce", "Almanca", "Fransızca", "İspanyolca", "İtalyanca", "Rusça", "Arapça", "Farsça", "Çine"
];

export default function TutorListingsScreen() {
  const router = useRouter();
  const toast = useToast();
  const haptics = useHaptics();

  const [listings, setListings] = useState<TutorListing[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal / Wizard state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [step, setStep] = useState(1); // Steps: 1-6 (used for Creation Wizard)

  // Form Fields state
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [aboutTutor, setAboutTutor] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [allowsOnline, setAllowsOnline] = useState(true);
  const [allowsTutorHome, setAllowsTutorHome] = useState(false);
  const [allowsStudentHome, setAllowsStudentHome] = useState(false);
  const [maxTravelDistanceKm, setMaxTravelDistanceKm] = useState("10");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["Türkçe"]);

  // Subject selector modal (only used in edit mode)
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const fetchListingsAndSubjects = async () => {
    try {
      const [listingsRes, subjectsRes] = await Promise.all([
        listingApi.getMyListings(),
        subjectApi.list(),
      ]);
      setListings(listingsRes.data);
      setSubjects(subjectsRes.data);
    } catch {
      toast.show("İlanlar yüklenemedi", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListingsAndSubjects();
  }, []);

  const getWordCount = (text: string) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  const containsContactInfo = (text: string) => {
    const phoneRegex = /[0-9]{7,}/;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/;
    return phoneRegex.test(text) || emailRegex.test(text);
  };

  const openCreateForm = () => {
    haptics.selection();
    setEditingId(null);
    setStep(1);
    setSubjectId("");
    setTitle("");
    setLessonDescription("");
    setAboutTutor("");
    setHourlyRate("350");
    setAllowsOnline(true);
    setAllowsTutorHome(false);
    setAllowsStudentHome(false);
    setMaxTravelDistanceKm("10");
    setSelectedLanguages(["Türkçe"]);
    setFormOpen(true);
  };

  const openEditForm = (listing: TutorListing) => {
    haptics.selection();
    setEditingId(listing.id);
    setStep(1); // Edit mode renders single page form directly
    setSubjectId(listing.subjectId);
    setTitle(listing.title);
    setLessonDescription(listing.lessonDescription);
    setAboutTutor(listing.aboutTutor);
    setHourlyRate(listing.hourlyRate.toString());
    setAllowsOnline(listing.allowsOnline);
    setAllowsTutorHome(listing.allowsTutorHome);
    setAllowsStudentHome(listing.allowsStudentHome);
    setMaxTravelDistanceKm(listing.maxTravelDistanceKm?.toString() || "10");
    setSelectedLanguages(listing.languages || ["Türkçe"]);
    setFormOpen(true);
  };

  const handleNext = () => {
    haptics.selection();
    if (step === 1) {
      if (!subjectId) {
        toast.show("Lütfen bir ders konusu seçin", "error");
        return;
      }
      // Check duplicate listings
      if (listings.some(l => l.subjectId === subjectId)) {
        toast.show("Bu ders konusu için zaten bir ilanınız var", "error");
        return;
      }
    }

    if (step === 2) {
      if (!title.trim()) {
        toast.show("Lütfen ilan başlığı girin", "error");
        return;
      }
      if (getWordCount(lessonDescription) < 15) { // Adjusted from 50 to 15 for better mobile UX, but keeping the rule
        toast.show("Ders açıklaması en az 15 kelime olmalıdır", "error");
        return;
      }
      if (containsContactInfo(lessonDescription)) {
        toast.show("Açıklama telefon veya e-posta adresi içeremez", "error");
        return;
      }
    }

    if (step === 3) {
      if (getWordCount(aboutTutor) < 15) {
        toast.show("Hakkınızda açıklaması en az 15 kelime olmalıdır", "error");
        return;
      }
      if (containsContactInfo(aboutTutor)) {
        toast.show("Hakkınızda bölümü telefon veya e-posta adresi içeremez", "error");
        return;
      }
    }

    if (step === 4) {
      if (!allowsOnline && !allowsTutorHome && !allowsStudentHome) {
        toast.show("En az bir ders yeri seçeneği işaretlemelisiniz", "error");
        return;
      }
    }

    if (step === 5) {
      if (selectedLanguages.length === 0) {
        toast.show("En az bir konuştuğunuz dil seçmelisiniz", "error");
        return;
      }
    }

    setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    haptics.selection();
    setStep(prev => prev - 1);
  };

  const handleLanguageToggle = (lang: string) => {
    haptics.selection();
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleSubjectSelect = (id: string) => {
    haptics.selection();
    setSubjectId(id);
    const sub = subjects.find(s => s.id === id);
    if (sub) {
      setTitle(`${sub.name} Özel Ders İlanı`);
    }
    setStep(2);
  };

  const handleSave = async () => {
    if (!hourlyRate.trim() || isNaN(Number(hourlyRate)) || Number(hourlyRate) <= 0) {
      toast.show("Lütfen geçerli bir saatlik ücret girin", "error");
      return;
    }

    const payload = {
      subjectId,
      title: title.trim(),
      lessonDescription: lessonDescription.trim(),
      aboutTutor: aboutTutor.trim(),
      hourlyRate: Number(hourlyRate),
      allowsOnline,
      allowsTutorHome,
      allowsStudentHome,
      maxTravelDistanceKm: allowsStudentHome ? Number(maxTravelDistanceKm) : undefined,
      languages: selectedLanguages,
    };

    setLoading(true);
    try {
      if (editingId) {
        await listingApi.update(editingId, payload);
        toast.show("İlanınız güncellendi!", "success");
      } else {
        await listingApi.create(payload);
        toast.show("İlanınız başarıyla yayınlandı!", "success");
      }
      setFormOpen(false);
      fetchListingsAndSubjects();
    } catch (err: any) {
      toast.show(err.response?.data?.message || "İlan kaydedilemedi", "error");
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("İlanı Sil", "Bu ilanı kaldırmak istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await listingApi.delete(id);
            toast.show("İlan kaldırıldı", "success");
            fetchListingsAndSubjects();
          } catch {
            toast.show("İlan silinemedi", "error");
            setLoading(false);
          }
        },
      },
    ]);
  };

  const selectedSubject = subjects.find(s => s.id === subjectId);

  if (loading && listings.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.md }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", flex: 1 }}>İlanlarım</Text>
        <TouchableOpacity
          onPress={openCreateForm}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary + "15", alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="add" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}>
        {listings.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 80 }}>
            <Ionicons name="document-text-outline" size={60} color={colors.textMuted} />
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600", marginTop: spacing.md }}>Henüz ilanınız yok</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: "center", marginTop: 4, paddingHorizontal: spacing.xl }}>
              Özel ders talepleri alabilmek için ilk özel ders ilanınızı oluşturun.
            </Text>
            <Button title="İlan Oluştur" onPress={openCreateForm} size="md" style={{ marginTop: spacing.lg }} />
          </View>
        ) : (
          listings.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: colors.card,
                borderRadius: radius.md,
                padding: spacing.md,
                marginBottom: spacing.sm,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700", textTransform: "uppercase" }}>
                    {item.subjectName}
                  </Text>
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600", marginTop: 2 }}>{item.title}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: "600", marginTop: spacing.xs }}>
                    ₺{item.hourlyRate} <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "400" }}>/saat</Text>
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: spacing.xs }}>
                  <TouchableOpacity
                    onPress={() => openEditForm(item)}
                    style={{ width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }}
                  >
                    <Ionicons name="pencil" size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={{ width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.error + "15", alignItems: "center", justifyContent: "center" }}
                  >
                    <Ionicons name="trash" size={14} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Delivery info tags */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }}>
                {item.allowsOnline && (
                  <View style={{ backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="videocam-outline" size={12} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Çevrimiçi</Text>
                  </View>
                )}
                {item.allowsStudentHome && (
                  <View style={{ backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="car-outline" size={12} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Öğrenci Evi ({item.maxTravelDistanceKm} km)</Text>
                  </View>
                )}
                {item.allowsTutorHome && (
                  <View style={{ backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="home-outline" size={12} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Öğretmen Evi</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Form / Wizard Modal */}
      <Modal visible={formOpen} animationType="slide">
        {editingId ? (
          // --- EDIT MODE: Single page form ---
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <TouchableOpacity onPress={() => setFormOpen(false)} style={{ marginRight: spacing.md }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", flex: 1 }}>İlanı Düzenle</Text>
              <Button title="Kaydet" onPress={handleSave} size="sm" haptic="medium" />
            </View>

            <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginBottom: 6 }}>Ders Konusu</Text>
              <View style={{ backgroundColor: colors.surfaceLight, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, height: 48, justifyContent: "center", marginBottom: spacing.md }}>
                <Text style={{ color: colors.text, fontSize: 15 }}>{selectedSubject?.name}</Text>
              </View>

              <Input label="İlan Başlığı" value={title} onChangeText={setTitle} placeholder="Örn: TYT/AYT Matematik ve Geometri Özel Dersi" />
              <Input label="Saatlik Ücret (₺)" value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" placeholder="350" />
              <Input label="Ders Açıklaması" value={lessonDescription} onChangeText={setLessonDescription} multiline placeholder="Ders işleme yönteminiz, materyalleriniz, vb..." />
              <Input label="Hakkınızda" value={aboutTutor} onChangeText={setAboutTutor} multiline placeholder="Eğitim geçmişiniz, tecrübeleriniz, başarılarınız..." />
              
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginBottom: spacing.sm, marginTop: spacing.md }}>
                Konuşulan Diller
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.md }}>
                {LANGUAGES_LIST.map(lang => {
                  const active = selectedLanguages.includes(lang);
                  return (
                    <TouchableOpacity
                      key={lang}
                      onPress={() => handleLanguageToggle(lang)}
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full, backgroundColor: active ? colors.primary : colors.surface, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}
                    >
                      <Text style={{ color: active ? "#fff" : colors.textSecondary, fontSize: 12, fontWeight: "500" }}>{lang}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginBottom: spacing.sm }}>
                Ders Yeri Seçenekleri
              </Text>
              <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
                <TouchableOpacity onPress={() => setAllowsOnline(!allowsOnline)} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <Ionicons name={allowsOnline ? "checkbox" : "square-outline"} size={22} color={allowsOnline ? colors.primary : colors.textMuted} />
                  <Text style={{ color: colors.text, fontSize: 14 }}>Çevrimiçi Ders verebilirim</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setAllowsTutorHome(!allowsTutorHome)} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <Ionicons name={allowsTutorHome ? "checkbox" : "square-outline"} size={22} color={allowsTutorHome ? colors.primary : colors.textMuted} />
                  <Text style={{ color: colors.text, fontSize: 14 }}>Kendi evimde ders verebilirim</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setAllowsStudentHome(!allowsStudentHome)} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <Ionicons name={allowsStudentHome ? "checkbox" : "square-outline"} size={22} color={allowsStudentHome ? colors.primary : colors.textMuted} />
                  <Text style={{ color: colors.text, fontSize: 14 }}>Öğrencinin evine gidebilirim</Text>
                </TouchableOpacity>
                {allowsStudentHome && (
                  <View style={{ marginTop: spacing.xs, paddingLeft: 30 }}>
                    <Input label="Maksimum Seyahat Mesafesi (km)" value={maxTravelDistanceKm} onChangeText={setMaxTravelDistanceKm} keyboardType="numeric" placeholder="10" />
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        ) : (
          // --- CREATE MODE: Step-by-Step Wizard (Web flow matching) ---
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Wizard Header */}
            <View style={{ paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "700" }}>Adım {step} / 6</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 14 }}>•</Text>
                  <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>
                    {step === 1 && "Ders Konusu"}
                    {step === 2 && "Ders Hakkında"}
                    {step === 3 && "Sizin Hakkınızda"}
                    {step === 4 && "Ders Konumu"}
                    {step === 5 && "Diller"}
                    {step === 6 && "Ücret"}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setFormOpen(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Progress bar */}
              <View style={{ height: 4, width: "100%", backgroundColor: colors.border, borderRadius: 2, overflow: "hidden" }}>
                <View style={{ height: "100%", width: `${(step / 6) * 100}%`, backgroundColor: colors.primary }} />
              </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
              {/* STEP 1: Subject Selection */}
              {step === 1 && (
                <View style={{ gap: spacing.md }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>Ders Konusu Seçin</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Hangi alanda ders vermek istiyorsanız aşağıdaki konulardan birini seçin:</Text>
                  
                  <View style={{ gap: spacing.sm }}>
                    {subjects.map((sub) => {
                      const hasListing = listings.some(l => l.subjectId === sub.id);
                      return (
                        <TouchableOpacity
                          key={sub.id}
                          disabled={hasListing}
                          onPress={() => handleSubjectSelect(sub.id)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: spacing.md,
                            backgroundColor: subjectId === sub.id ? colors.primary + "10" : colors.card,
                            borderRadius: radius.md,
                            borderWidth: 1,
                            borderColor: subjectId === sub.id ? colors.primary : colors.border,
                            opacity: hasListing ? 0.5 : 1,
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceLight, alignItems: "center", justifyContent: "center" }}>
                              <Ionicons name="book" size={18} color={colors.primary} />
                            </View>
                            <View>
                              <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>{sub.name}</Text>
                              {hasListing && <Text style={{ color: colors.error, fontSize: 11, marginTop: 2 }}>Bu konuda ilanınız bulunuyor</Text>}
                            </View>
                          </View>
                          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* STEP 2: Lesson Title & Description */}
              {step === 2 && (
                <View style={{ gap: spacing.md }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>Dersleriniz Hakkında</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Ders işleme metodunuzdan, kullandığınız kaynaklardan ve süreçten bahsedin:</Text>

                  <Input
                    label="İlan Başlığı"
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Örn: Birebir LGS Matematik Özel Dersi"
                  />

                  <View>
                    <Input
                      label="Ders Açıklaması"
                      value={lessonDescription}
                      onChangeText={setLessonDescription}
                      multiline
                      placeholder="Ders yönteminizi detaylı açıklayın. En az 15 kelime girmelisiniz..."
                    />
                    <Text style={{ color: getWordCount(lessonDescription) >= 15 ? colors.success : colors.textMuted, fontSize: 12, marginTop: -8, textAlign: "right" }}>
                      Kelime sayısı: {getWordCount(lessonDescription)} / 15 (Önerilen: 50+)
                    </Text>
                  </View>
                </View>
              )}

              {/* STEP 3: About Tutor */}
              {step === 3 && (
                <View style={{ gap: spacing.md }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>Kendiniz Hakkında</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Eğitim geçmişinizden, öğretmenlik tecrübelerinizden ve başarılarınızdan bahsedin:</Text>

                  <View>
                    <Input
                      label="Profil Açıklaması / Hakkınızda"
                      value={aboutTutor}
                      onChangeText={setAboutTutor}
                      multiline
                      placeholder="Öğrencilere kendinizi tanıtın. En az 15 kelime girmelisiniz..."
                    />
                    <Text style={{ color: getWordCount(aboutTutor) >= 15 ? colors.success : colors.textMuted, fontSize: 12, marginTop: -8, textAlign: "right" }}>
                      Kelime sayısı: {getWordCount(aboutTutor)} / 15 (Önerilen: 50+)
                    </Text>
                  </View>
                </View>
              )}

              {/* STEP 4: Format / Locations */}
              {step === 4 && (
                <View style={{ gap: spacing.md }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>Ders Konumu</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Dersleri nerede verebileceğinizi belirleyin (Birden fazla seçebilirsiniz):</Text>

                  <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
                    <TouchableOpacity
                      onPress={() => setAllowsOnline(!allowsOnline)}
                      style={{
                        flexDirection: "row", alignItems: "center", padding: spacing.md,
                        backgroundColor: allowsOnline ? colors.primary + "10" : colors.card,
                        borderRadius: radius.md, borderWidth: 1, borderColor: allowsOnline ? colors.primary : colors.border
                      }}
                    >
                      <Ionicons name={allowsOnline ? "checkbox" : "square-outline"} size={22} color={allowsOnline ? colors.primary : colors.textMuted} style={{ marginRight: spacing.sm }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>Çevrimiçi (Online)</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>Görüntülü görüşme ile uzaktan dersler.</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setAllowsTutorHome(!allowsTutorHome)}
                      style={{
                        flexDirection: "row", alignItems: "center", padding: spacing.md,
                        backgroundColor: allowsTutorHome ? colors.primary + "10" : colors.card,
                        borderRadius: radius.md, borderWidth: 1, borderColor: allowsTutorHome ? colors.primary : colors.border
                      }}
                    >
                      <Ionicons name={allowsTutorHome ? "checkbox" : "square-outline"} size={22} color={allowsTutorHome ? colors.primary : colors.textMuted} style={{ marginRight: spacing.sm }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>Öğretmen Evinde</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>Öğrenci sizin belirttiğiniz lokasyona gelir.</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setAllowsStudentHome(!allowsStudentHome)}
                      style={{
                        flexDirection: "row", alignItems: "center", padding: spacing.md,
                        backgroundColor: allowsStudentHome ? colors.primary + "10" : colors.card,
                        borderRadius: radius.md, borderWidth: 1, borderColor: allowsStudentHome ? colors.primary : colors.border
                      }}
                    >
                      <Ionicons name={allowsStudentHome ? "checkbox" : "square-outline"} size={22} color={allowsStudentHome ? colors.primary : colors.textMuted} style={{ marginRight: spacing.sm }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>Öğrenci Evinde</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>Dersler için öğrencinin lokasyonuna seyahat edersiniz.</Text>
                      </View>
                    </TouchableOpacity>

                    {allowsStudentHome && (
                      <View style={{ marginTop: spacing.xs, paddingHorizontal: spacing.sm }}>
                        <Input
                          label="Maksimum Seyahat Mesafesi (km)"
                          value={maxTravelDistanceKm}
                          onChangeText={setMaxTravelDistanceKm}
                          keyboardType="numeric"
                          placeholder="10"
                        />
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* STEP 5: Languages */}
              {step === 5 && (
                <View style={{ gap: spacing.md }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>Konuşulan Diller</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Ders anlatımı yapabileceğiniz dilleri seçin:</Text>

                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm }}>
                    {LANGUAGES_LIST.map((lang) => {
                      const isSelected = selectedLanguages.includes(lang);
                      return (
                        <TouchableOpacity
                          key={lang}
                          onPress={() => handleLanguageToggle(lang)}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: radius.full,
                            backgroundColor: isSelected ? colors.primary : colors.card,
                            borderWidth: 1,
                            borderColor: isSelected ? colors.primary : colors.border,
                          }}
                        >
                          <Text style={{ color: isSelected ? "#fff" : colors.textSecondary, fontSize: 13, fontWeight: "600" }}>
                            {lang}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* STEP 6: Hourly Rate */}
              {step === 6 && (
                <View style={{ gap: spacing.md }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>Saatlik Ders Ücreti</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Bu ders konusu için talep ettiğiniz 1 saatlik ücreti (₺) belirleyin:</Text>

                  <View style={{ marginTop: spacing.lg }}>
                    <Input
                      label="Saatlik Ders Ücreti (₺)"
                      value={hourlyRate}
                      onChangeText={setHourlyRate}
                      keyboardType="numeric"
                      placeholder="350"
                      leftIcon={<Text style={{ color: colors.textMuted, fontSize: 16, fontWeight: "700" }}>₺</Text>}
                    />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Wizard Navigation Footer */}
            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: spacing.md, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: "row", gap: spacing.sm }}>
              {step > 1 ? (
                <Button
                  title="Geri"
                  onPress={handlePrev}
                  variant="outline"
                  style={{ flex: 1 }}
                />
              ) : (
                <Button
                  title="İptal"
                  onPress={() => setFormOpen(false)}
                  variant="outline"
                  style={{ flex: 1 }}
                />
              )}
              {step < 6 ? (
                <Button
                  title="Devam Et"
                  onPress={handleNext}
                  variant="primary"
                  style={{ flex: 2 }}
                />
              ) : (
                <Button
                  title="İlanı Yayınla"
                  onPress={handleSave}
                  variant="primary"
                  style={{ flex: 2 }}
                />
              )}
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}
