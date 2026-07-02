import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button } from "../../src/components/Button";
import { useToast } from "../../src/components/Toast";
import { useHaptics } from "../../src/hooks/useHaptics";
import { tutorApi } from "../../src/api/services";
import { colors, spacing, radius } from "../../src/constants/theme";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const HOURS = Array.from({ length: 15 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

interface Slot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export default function TutorAvailabilityScreen() {
  const router = useRouter();
  const toast = useToast();
  const haptics = useHaptics();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const { data } = await tutorApi.getAvailability("me");
        setSlots(data);
        setSelectedDays(new Set(data.map((s: Slot) => s.dayOfWeek)));
      } catch { /* */ }
      setLoading(false);
    })();
  }, []);

  const toggleDay = (day: number) => {
    haptics.selection();
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newSlots: Slot[] = [];
      selectedDays.forEach((day) => {
        newSlots.push({ dayOfWeek: day, startTime: "08:00", endTime: "22:00" });
      });
      await tutorApi.updateAvailability(newSlots);
      haptics.success();
      toast.show("Müsaitlik güncellendi", "success");
      router.back();
    } catch {
      toast.show("Güncellenemedi", "error");
    } finally {
      setSaving(false);
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
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", flex: 1 }}>Müsaitlik</Text>
        <Button title="Kaydet" onPress={handleSave} loading={saving} size="sm" haptic="medium" />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: spacing.md }}>
          Ders verebileceğin günleri seç
        </Text>
        {DAYS.map((day, i) => {
          const selected = selectedDays.has(i);
          return (
            <TouchableOpacity
              key={i}
              onPress={() => toggleDay(i)}
              style={{
                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                paddingVertical: 14, paddingHorizontal: spacing.md,
                backgroundColor: colors.card, borderRadius: radius.md, marginBottom: spacing.sm,
                borderWidth: 1, borderColor: selected ? colors.primary : colors.border,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: selected ? colors.primary + "20" : colors.surfaceLight, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: selected ? colors.primary : colors.textSecondary, fontSize: 13, fontWeight: "700" }}>{i + 1}</Text>
                </View>
                <Text style={{ color: selected ? colors.text : colors.textSecondary, fontSize: 15, fontWeight: selected ? "600" : "400" }}>{day}</Text>
              </View>
              <Ionicons name={selected ? "checkbox" : "square-outline"} size={22} color={selected ? colors.primary : colors.textMuted} />
            </TouchableOpacity>
          );
        })}
        <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: "center", marginTop: spacing.md }}>
          Seçilen günlerde 08:00 - 22:00 arası müsait olarak işaretlenecek
        </Text>
      </ScrollView>
    </View>
  );
}
