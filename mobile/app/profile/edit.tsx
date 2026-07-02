import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { useToast } from "../../src/components/Toast";
import { useAuth } from "../../src/providers/AuthProvider";
import { userApi, subjectApi, tutorApi } from "../../src/api/services";
import { colors, spacing, radius } from "../../src/constants/theme";
import type { Subject } from "../../src/types";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [education, setEducation] = useState(user?.education || "");
  const [hourlyRate, setHourlyRate] = useState(user?.hourlyRate?.toString() || "");
  const [experienceYears, setExperienceYears] = useState(user?.experienceYears?.toString() || "");
  
  // Subjects states (for tutors)
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (user?.role === "TUTOR") {
      (async () => {
        setFetchingData(true);
        try {
          const [subjectsRes, mySubjectsRes] = await Promise.all([
            subjectApi.list(),
            tutorApi.getMySubjects(),
          ]);
          setAllSubjects(subjectsRes.data);
          setSelectedSubjectIds(mySubjectsRes.data.map((s) => s.subjectId));
        } catch {
          toast.show("Ders konuları yüklenemedi", "error");
        } finally {
          setFetchingData(false);
        }
      })();
    }
  }, [user]);

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjectIds((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.show("Ad Soyad alanı boş bırakılamaz", "error");
      return;
    }

    setLoading(true);
    try {
      // 1. Update basic profile info
      await userApi.updateProfile({
        fullName,
        bio,
        education,
        experienceYears: experienceYears ? Number(experienceYears) : undefined,
        hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
      });

      // 2. If tutor, update subjects
      if (user?.role === "TUTOR") {
        await tutorApi.updateSubjects(selectedSubjectIds);
      }

      await refreshUser();
      toast.show("Profiliniz başarıyla güncellendi", "success");
      router.back();
    } catch {
      toast.show("Profil güncellenemedi", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
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
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", flex: 1 }}>Profili Düzenle</Text>
        <Button title="Kaydet" onPress={handleSave} loading={loading} size="sm" haptic="medium" />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        {/* Profile Info Section */}
        <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "700", textTransform: "uppercase", marginBottom: spacing.md, tracking: 1 }}>
          Genel Bilgiler
        </Text>
        
        <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
          <Input label="Ad Soyad" value={fullName} onChangeText={setFullName} placeholder="Adınız ve soyadınız" />
          <Input label="Eğitim" value={education} onChangeText={setEducation} placeholder="Örn: Boğaziçi Üniversitesi Matematik mezunu" />
          <Input label="Biyografi" value={bio} onChangeText={setBio} multiline placeholder="Kendinizden bahsedin, öğrencilerin sizi tanımasını sağlayın..." />
        </View>

        {/* Tutor Settings Section */}
        {user?.role === "TUTOR" && (
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg, marginTop: spacing.md }}>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "700", textTransform: "uppercase", marginBottom: spacing.md, tracking: 1 }}>
              Öğretmenlik Ayarları
            </Text>

            <View style={{ flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg }}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Saatlik Ücret (₺)"
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                  keyboardType="numeric"
                  placeholder="350"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Deneyim (Yıl)"
                  value={experienceYears}
                  onChangeText={setExperienceYears}
                  keyboardType="numeric"
                  placeholder="5"
                />
              </View>
            </View>

            {/* Subjects / Categories selection */}
            <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "600", marginBottom: spacing.sm }}>
              Verdiğiniz Ders Konuları
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: spacing.md }}>
              Öğrencilerin aramalarda sizi bulabilmesi için verdiğiniz ders konularını seçin:
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.md }}>
              {allSubjects.map((subject) => {
                const isSelected = selectedSubjectIds.includes(subject.id);
                return (
                  <TouchableOpacity
                    key={subject.id}
                    onPress={() => toggleSubject(subject.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: radius.full,
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }}
                  >
                    {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                    <Text
                      style={{
                        color: isSelected ? "#fff" : colors.textSecondary,
                        fontSize: 13,
                        fontWeight: "500",
                      }}
                    >
                      {subject.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
