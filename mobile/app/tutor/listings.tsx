import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { useToast } from "../../src/components/Toast";
import { useHaptics } from "../../src/hooks/useHaptics";
import { listingApi, subjectApi } from "../../src/api/services";
import { colors, spacing, radius } from "../../src/constants/theme";
import type { Subject, TutorListing } from "../../src/types";

export default function TutorListingsScreen() {
  const router = useRouter();
  const toast = useToast();
  const haptics = useHaptics();

  const [listings, setListings] = useState<TutorListing[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
  const [languages, setLanguages] = useState("Türkçe");

  // Subject selector state
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

  const openCreateForm = () => {
    haptics.selection();
    setEditingId(null);
    setSubjectId("");
    setTitle("");
    setLessonDescription("");
    setAboutTutor("");
    setHourlyRate("");
    setAllowsOnline(true);
    setAllowsTutorHome(false);
    setAllowsStudentHome(false);
    setMaxTravelDistanceKm("10");
    setLanguages("Türkçe");
    setFormOpen(true);
  };

  const openEditForm = (listing: TutorListing) => {
    haptics.selection();
    setEditingId(listing.id);
    setSubjectId(listing.subjectId);
    setTitle(listing.title);
    setLessonDescription(listing.lessonDescription);
    setAboutTutor(listing.aboutTutor);
    setHourlyRate(listing.hourlyRate.toString());
    setAllowsOnline(listing.allowsOnline);
    setAllowsTutorHome(listing.allowsTutorHome);
    setAllowsStudentHome(listing.allowsStudentHome);
    setMaxTravelDistanceKm(listing.maxTravelDistanceKm?.toString() || "10");
    setLanguages(listing.languages?.join(", ") || "Türkçe");
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!subjectId) {
      toast.show("Lütfen bir ders konusu seçin", "error");
      return;
    }
    if (!title.trim()) {
      toast.show("Lütfen bir ilan başlığı girin", "error");
      return;
    }
    if (!lessonDescription.trim()) {
      toast.show("Lütfen ders açıklamasını doldurun", "error");
      return;
    }
    if (!aboutTutor.trim()) {
      toast.show("Lütfen kendiniz hakkındaki bilgileri doldurun", "error");
      return;
    }
    if (!hourlyRate.trim() || isNaN(Number(hourlyRate))) {
      toast.show("Geçerli bir saatlik ücret girin", "error");
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
      languages: languages.split(",").map(lang => lang.trim()).filter(Boolean),
    };

    setLoading(true);
    try {
      if (editingId) {
        await listingApi.update(editingId, payload);
        toast.show("İlanınız güncellendi!", "success");
      } else {
        // Prevent duplicate subject listings
        if (listings.some(l => l.subjectId === subjectId)) {
          toast.show("Bu ders konusu için zaten bir ilanınız var", "error");
          setLoading(false);
          return;
        }
        await listingApi.create(payload);
        toast.show("İlanınız yayınlandı!", "success");
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

      {/* Form Modal */}
      <Modal visible={formOpen} animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Form Header */}
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <TouchableOpacity onPress={() => setFormOpen(false)} style={{ marginRight: spacing.md }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", flex: 1 }}>
              {editingId ? "İlanı Düzenle" : "İlan Oluştur"}
            </Text>
            <Button title="Yayınla" onPress={handleSave} size="sm" haptic="medium" />
          </View>

          <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
            {/* Subject selector */}
            <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginBottom: 6 }}>Ders Konusu</Text>
            <TouchableOpacity
              disabled={!!editingId}
              onPress={() => setShowSubjectPicker(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: editingId ? colors.surfaceLight : colors.surface,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: spacing.md,
                height: 48,
                marginBottom: spacing.md,
              }}
            >
              <Text style={{ color: selectedSubject ? colors.text : colors.textMuted, fontSize: 15 }}>
                {selectedSubject ? selectedSubject.name : "Konu Seçin"}
              </Text>
              {!editingId && <Ionicons name="chevron-down" size={20} color={colors.textMuted} />}
            </TouchableOpacity>

            <Input label="İlan Başlığı" value={title} onChangeText={setTitle} placeholder="Örn: TYT/AYT Matematik ve Geometri Özel Dersi" />
            <Input label="Saatlik Ücret (₺)" value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" placeholder="350" />
            <Input label="Ders Açıklaması" value={lessonDescription} onChangeText={setLessonDescription} multiline placeholder="Ders işleme yönteminiz, materyalleriniz, vb..." />
            <Input label="Hakkınızda" value={aboutTutor} onChangeText={setAboutTutor} multiline placeholder="Eğitim geçmişiniz, tecrübeleriniz, başarılarınız..." />
            <Input label="Diller (Virgülle ayırın)" value={languages} onChangeText={setLanguages} placeholder="Türkçe, İngilizce" />

            {/* Delivery options */}
            <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginBottom: spacing.sm, marginTop: spacing.md }}>
              Ders Yeri Seçenekleri
            </Text>

            <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
              <TouchableOpacity
                onPress={() => setAllowsOnline(!allowsOnline)}
                style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}
              >
                <Ionicons name={allowsOnline ? "checkbox" : "square-outline"} size={22} color={allowsOnline ? colors.primary : colors.textMuted} />
                <Text style={{ color: colors.text, fontSize: 14 }}>Çevrimiçi Ders verebilirim</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setAllowsTutorHome(!allowsTutorHome)}
                style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}
              >
                <Ionicons name={allowsTutorHome ? "checkbox" : "square-outline"} size={22} color={allowsTutorHome ? colors.primary : colors.textMuted} />
                <Text style={{ color: colors.text, fontSize: 14 }}>Kendi evimde ders verebilirim</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setAllowsStudentHome(!allowsStudentHome)}
                style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}
              >
                <Ionicons name={allowsStudentHome ? "checkbox" : "square-outline"} size={22} color={allowsStudentHome ? colors.primary : colors.textMuted} />
                <Text style={{ color: colors.text, fontSize: 14 }}>Öğrencinin evine gidebilirim</Text>
              </TouchableOpacity>

              {/* Travel distance (if student home is active) */}
              {allowsStudentHome && (
                <View style={{ marginTop: spacing.xs, paddingLeft: 30 }}>
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
          </ScrollView>

          {/* Subject Picker Modal */}
          <Modal visible={showSubjectPicker} transparent animationType="slide">
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "flex-end" }}
              activeOpacity={1}
              onPress={() => setShowSubjectPicker(false)}
            >
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  backgroundColor: colors.surface,
                  borderTopLeftRadius: radius.xl,
                  borderTopRightRadius: radius.xl,
                  paddingTop: spacing.lg,
                  paddingBottom: spacing.xxl,
                  maxHeight: 400,
                }}
              >
                <View style={{ width: 40, height: 4, backgroundColor: colors.textMuted, borderRadius: 2, alignSelf: "center", marginBottom: spacing.lg }} />
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600", textAlign: "center", marginBottom: spacing.md }}>
                  Ders Konusu Seçin
                </Text>
                <FlatList
                  data={subjects}
                  contentContainerStyle={{ paddingHorizontal: spacing.lg }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setSubjectId(item.id);
                        setShowSubjectPicker(false);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <Text
                        style={{
                          color: subjectId === item.id ? colors.primary : colors.text,
                          fontSize: 16,
                          fontWeight: subjectId === item.id ? "600" : "400",
                        }}
                      >
                        {item.name}
                      </Text>
                      {subjectId === item.id && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </View>
      </Modal>
    </View>
  );
}
