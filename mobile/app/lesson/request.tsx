import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { DateTimePicker } from "../../src/components/DateTimePicker";
import { useToast } from "../../src/components/Toast";
import { tutorApi, subjectApi, lessonApi, listingApi } from "../../src/api/services";
import type { Subject, TutorListing } from "../../src/types";
import { colors, spacing, radius } from "../../src/constants/theme";
import { formatLocalDate } from "../../src/utils/dateFormat";

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

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
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const availableDaysOfWeek = useMemo(
    () => [...new Set(availability.map(s => s.dayOfWeek))],
    [availability]
  );

  useEffect(() => {
    (async () => {
      try {
        const [subjectsRes, listingsRes, availRes] = await Promise.all([
          subjectApi.list(),
          listingApi.getTutorListings(tutorId),
          tutorApi.getAvailability(tutorId).catch(() => ({ data: [] })),
        ]);
        setSubjects(subjectsRes.data);
        const ids = (listingsRes.data || []).map((l: TutorListing) => l.subjectId);
        setTutorSubjectIds(ids);
        setAvailability(availRes.data || []);
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
    if (!notes.trim()) {
      toast.show("Ders açıklaması zorunludur", "error");
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
        notes: notes.trim(),
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
        <ActivityIndicator size="large" color={colors.primary} />
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
              onDateSelect={(d) => { setSelectedStart(null); setSelectedEnd(null); setSelectedDate(d); }}
              onStartSelect={setSelectedStart}
              onEndSelect={setSelectedEnd}
              disabledDates={[]}
              availableDaysOfWeek={availableDaysOfWeek}
              availableTimeRanges={(() => {
                if (!selectedDate || !availability.length) return undefined;
                const jsDay = new Date(selectedDate + "T12:00:00").getDay();
                const backendDay = (jsDay + 6) % 7;
                return availability.filter(s => s.dayOfWeek === backendDay).map(s => ({ startTime: s.startTime, endTime: s.endTime }));
              })()}
            />
          </View>

          {selectedStart && selectedEnd && selectedDate && (
            <View style={{ backgroundColor: colors.surfaceLight, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {(() => {
                  return formatLocalDate(selectedDate);
                })()}
                {" • "}{selectedStart} - {selectedEnd}
              </Text>
            </View>
          )}

          <View style={{ marginTop: spacing.lg }}>
            <Input
              label="Ders Açıklaması"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholder="Hangi konuda ders almak istediğinizi, eksik olduğunuz konuları ve varsa özel taleplerinizi yazın..."
            />
          </View>
        </View>

        <Button
          title="Talep Gönder"
          onPress={handleSubmit}
          loading={submitting}
          size="lg"
          disabled={!selectedSubject || !selectedDate || !selectedStart || !selectedEnd || !notes.trim()}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </View>
  );
}
