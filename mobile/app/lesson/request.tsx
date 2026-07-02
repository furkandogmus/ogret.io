import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { DateTimePicker } from "../../src/components/DateTimePicker";
import { useToast } from "../../src/components/Toast";
import { tutorApi, subjectApi, lessonApi } from "../../src/api/services";
import type { Subject } from "../../src/types";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function LessonRequestScreen() {
  const { tutorId } = useLocalSearchParams<{ tutorId: string }>();
  const router = useRouter();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tutorSubjectIds, setTutorSubjectIds] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [subjectsRes, tutorRes] = await Promise.all([
          subjectApi.list(),
          tutorApi.getById(tutorId),
        ]);
        setSubjects(subjectsRes.data);
        setTutorSubjectIds(tutorRes.data?.subjects?.map((s: any) => typeof s === "string" ? s : s.id) || []);
      } catch {
        toast.show("Bilgiler yüklenemedi", "error");
      }
      setLoading(false);
    })();
  }, [tutorId]);

  const tutorSubjects = tutorSubjectIds.length > 0
    ? subjects.filter((s) => tutorSubjectIds.includes(s.id))
    : subjects;

  const handleSubmit = async () => {
    if (!selectedSubject || !selectedDate || !selectedStart || !selectedEnd) {
      toast.show("Tarih, saat ve konu seçimi zorunlu", "error");
      return;
    }
    if (selectedStart >= selectedEnd) {
      toast.show("Bitiş saati başlangıçtan sonra olmalı", "error");
      return;
    }
    setSubmitting(true);
    try {
      await lessonApi.create({
        tutorId,
        subjectId: selectedSubject,
        lessonDate: selectedDate,
        startTime: selectedStart,
        endTime: selectedEnd,
        notes: notes || undefined,
      });
      toast.show("Ders talebiniz iletildi!", "success");
      router.back();
    } catch (err: any) {
      toast.show(err?.response?.data?.message || "Talep gönderilemedi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.textMuted }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.md }}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", flex: 1 }}>Ders Talep Et</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginBottom: spacing.sm }}>Konu Seç</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
            {tutorSubjects.length === 0 ? (
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>Bu öğretmen için konu bulunamadı</Text>
            ) : (
              tutorSubjects.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setSelectedSubject(s.id)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full,
                    backgroundColor: selectedSubject === s.id ? colors.primary : colors.surface,
                    borderWidth: 1, borderColor: selectedSubject === s.id ? colors.primary : colors.border,
                  }}
                >
                  <Text style={{ color: selectedSubject === s.id ? "#fff" : colors.textSecondary, fontSize: 13, fontWeight: "500" }}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <DateTimePicker
              selectedDate={selectedDate}
              selectedStart={selectedStart}
              selectedEnd={selectedEnd}
              onDateSelect={setSelectedDate}
              onStartSelect={setSelectedStart}
              onEndSelect={setSelectedEnd}
              disabledDates={[]}
            />
          </View>

          {selectedStart && selectedEnd && selectedDate && (
            <View style={{ backgroundColor: colors.surfaceLight, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {new Date(selectedDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                {" • "}{selectedStart} - {selectedEnd}
              </Text>
            </View>
          )}

          <View style={{ marginTop: spacing.lg }}>
            <Input
              label="Notlar (isteğe bağlı)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholder="Öğretmene iletmek istediğiniz notlar..."
            />
          </View>
        </View>

        <Button
          title="Talep Gönder"
          onPress={handleSubmit}
          loading={submitting}
          size="lg"
          disabled={!selectedSubject || !selectedDate || !selectedStart || !selectedEnd}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </View>
  );
}
