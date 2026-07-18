import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button } from "../../src/components/Button";
import { useToast } from "../../src/components/Toast";
import { useHaptics } from "../../src/hooks/useHaptics";
import { tutorApi, type AvailabilitySlot } from "../../src/api/services";
import { colors, spacing, radius } from "../../src/constants/theme";
import { useAuth } from "../../src/providers/AuthProvider";
import { HALF_HOUR_TIME_SLOTS } from "../../src/utils/dateTimeSlots";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

type EditableSlot = AvailabilitySlot & { clientId: string };

function createClientId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function overlaps(first: Pick<AvailabilitySlot, "startTime" | "endTime">, second: Pick<AvailabilitySlot, "startTime" | "endTime">) {
  return first.startTime < second.endTime && second.startTime < first.endTime;
}

function findNewRange(daySlots: EditableSlot[]) {
  const preferred = [
    { startTime: "09:00", endTime: "12:00" },
    { startTime: "13:00", endTime: "18:00" },
    { startTime: "18:00", endTime: "20:00" },
    { startTime: "07:00", endTime: "09:00" },
  ].find((candidate) => !daySlots.some((slot) => overlaps(candidate, slot)));
  if (preferred) return preferred;

  for (let index = 0; index < HALF_HOUR_TIME_SLOTS.length - 2; index += 1) {
    const candidate = { startTime: HALF_HOUR_TIME_SLOTS[index], endTime: HALF_HOUR_TIME_SLOTS[index + 2] };
    if (!daySlots.some((slot) => overlaps(candidate, slot))) return candidate;
  }
  return undefined;
}

function getApiError(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return "Müsaitlik takvimi kaydedilemedi";
}

export default function TutorAvailabilityScreen() {
  const router = useRouter();
  const { show: showToast } = useToast();
  const haptics = useHaptics();
  const { refreshUser } = useAuth();
  const [slots, setSlots] = useState<EditableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pickerConfig, setPickerConfig] = useState<{
    clientId: string;
    field: "startTime" | "endTime";
    selected: string;
  } | null>(null);

  const activeDayCount = useMemo(() => new Set(slots.map((slot) => slot.dayOfWeek)).size, [slots]);

  useEffect(() => {
    let active = true;
    tutorApi.getMyAvailability()
      .then(({ data }) => {
        if (!active) return;
        setSlots(data
          .filter((slot) => slot.isActive !== false)
          .map((slot) => ({
            ...slot,
            startTime: formatTime(slot.startTime),
            endTime: formatTime(slot.endTime),
            clientId: slot.id || createClientId(),
          })));
      })
      .catch(() => {
        if (active) showToast("Müsaitlik bilgileri yüklenemedi", "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [showToast]);

  const addRange = (dayOfWeek: number) => {
    const range = findNewRange(slots.filter((slot) => slot.dayOfWeek === dayOfWeek));
    if (!range) {
      showToast(`${DAYS[dayOfWeek]} için boş saat aralığı kalmadı`, "error");
      return;
    }
    haptics.selection();
    setSlots((current) => [...current, { dayOfWeek, ...range, clientId: createClientId() }]);
    setSaved(false);
  };

  const removeRange = (clientId: string) => {
    haptics.selection();
    setSlots((current) => current.filter((slot) => slot.clientId !== clientId));
    setSaved(false);
  };

  const openPicker = (slot: EditableSlot, field: "startTime" | "endTime") => {
    haptics.selection();
    setPickerConfig({ clientId: slot.clientId, field, selected: slot[field] });
  };

  const selectTime = (time: string) => {
    if (!pickerConfig) return;
    const current = slots.find((slot) => slot.clientId === pickerConfig.clientId);
    if (!current) return;
    const candidate = { ...current, [pickerConfig.field]: time };
    if (candidate.endTime <= candidate.startTime) {
      showToast("Bitiş saati başlangıçtan sonra olmalıdır", "error");
      return;
    }
    if (slots.some((slot) => (
      slot.clientId !== candidate.clientId
      && slot.dayOfWeek === candidate.dayOfWeek
      && overlaps(candidate, slot)
    ))) {
      showToast("Aynı gündeki saat aralıkları çakışamaz", "error");
      return;
    }
    setSlots((values) => values.map((slot) => slot.clientId === candidate.clientId ? candidate : slot));
    setPickerConfig(null);
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = slots
        .map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime }))
        .sort((first, second) => first.dayOfWeek - second.dayOfWeek || first.startTime.localeCompare(second.startTime));
      const { data } = await tutorApi.updateAvailability(payload);
      await refreshUser();
      setSlots(data.map((slot) => ({
        ...slot,
        startTime: formatTime(slot.startTime),
        endTime: formatTime(slot.endTime),
        clientId: slot.id || createClientId(),
      })));
      setSaved(true);
      haptics.success();
      showToast("Haftalık müsaitlik takviminiz kaydedildi", "success");
    } catch (error) {
      showToast(getApiError(error), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: spacing.md }}>Takviminiz yükleniyor…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.md }} accessibilityLabel="Kapat">
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>Haftalık Müsaitlik</Text>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
            {slots.length ? `${activeDayCount} gün · ${slots.length} saat aralığı` : "Program boş"}
          </Text>
        </View>
        <Button title="Kaydet" onPress={save} loading={saving} size="sm" haptic="medium" />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }}>
        <View style={{ flexDirection: "row", gap: spacing.sm, backgroundColor: colors.surfaceLight, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg }}>
          <Ionicons name="information-circle-outline" size={19} color={colors.primary} />
          <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 18, flex: 1 }}>
            Ders verebildiğiniz saatleri gün gün ekleyin. Bu program her hafta tekrar eder; öğrenciler yalnızca bu saatlerde talep oluşturabilir.
          </Text>
        </View>

        {DAYS.map((day, dayOfWeek) => {
          const daySlots = slots
            .filter((slot) => slot.dayOfWeek === dayOfWeek)
            .sort((first, second) => first.startTime.localeCompare(second.startTime));
          return (
            <View
              key={day}
              style={{
                backgroundColor: colors.card,
                borderRadius: radius.lg,
                padding: spacing.md,
                marginBottom: spacing.md,
                borderWidth: 1,
                borderColor: daySlots.length ? colors.primary : colors.border,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700" }}>{day}</Text>
                  <Text style={{ color: daySlots.length ? colors.primary : colors.textMuted, fontSize: 11, marginTop: 2 }}>
                    {daySlots.length ? `${daySlots.length} müsaitlik aralığı` : "Bu gün müsait değilsiniz"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => addRange(dayOfWeek)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: 7 }}
                  accessibilityLabel={`${day} gününe saat ekle`}
                >
                  <Ionicons name="add" size={16} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700" }}>Saat ekle</Text>
                </TouchableOpacity>
              </View>

              {daySlots.map((slot) => (
                <View
                  key={slot.clientId}
                  style={{ flexDirection: "row", alignItems: "flex-end", gap: spacing.sm, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: "600", marginBottom: 4 }}>BAŞLANGIÇ</Text>
                    <TouchableOpacity
                      onPress={() => openPicker(slot, "startTime")}
                      style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surfaceLight, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: 9 }}
                    >
                      <Text style={{ color: colors.text, fontSize: 13, fontWeight: "600" }}>{slot.startTime}</Text>
                      <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: 13, paddingBottom: 10 }}>–</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: "600", marginBottom: 4 }}>BİTİŞ</Text>
                    <TouchableOpacity
                      onPress={() => openPicker(slot, "endTime")}
                      style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surfaceLight, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: 9 }}
                    >
                      <Text style={{ color: colors.text, fontSize: 13, fontWeight: "600" }}>{slot.endTime}</Text>
                      <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeRange(slot.clientId)}
                    style={{ borderRadius: radius.md, backgroundColor: "#FEF2F2", padding: 9 }}
                    accessibilityLabel={`${day} ${slot.startTime}-${slot.endTime} aralığını kaldır`}
                  >
                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}

        {slots.length === 0 && (
          <View style={{ flexDirection: "row", gap: spacing.sm, backgroundColor: "#FFFBEB", borderRadius: radius.md, padding: spacing.md }}>
            <Ionicons name="time-outline" size={19} color="#B45309" />
            <Text style={{ color: "#92400E", fontSize: 12, lineHeight: 18, flex: 1 }}>
              Takviminiz boş. Öğrencilerin saat seçebilmesi için en az bir güne müsaitlik ekleyin.
            </Text>
          </View>
        )}
        {saved && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: "#ECFDF5", borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md }}>
            <Ionicons name="checkmark-circle" size={19} color="#047857" />
            <Text style={{ color: "#047857", fontSize: 12, fontWeight: "700" }}>Takviminiz kaydedildi.</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={pickerConfig !== null} transparent animationType="slide" onRequestClose={() => setPickerConfig(null)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "flex-end" }}
          activeOpacity={1}
          onPress={() => setPickerConfig(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl, maxHeight: 460 }}
          >
            <View style={{ width: 40, height: 4, backgroundColor: colors.textMuted, borderRadius: 2, alignSelf: "center", marginBottom: spacing.lg }} />
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700", textAlign: "center", marginBottom: spacing.md }}>
              {pickerConfig?.field === "startTime" ? "Başlangıç saatini seçin" : "Bitiş saatini seçin"}
            </Text>
            <FlatList
              data={HALF_HOUR_TIME_SLOTS}
              contentContainerStyle={{ paddingHorizontal: spacing.lg }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => selectTime(item)}
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}
                >
                  <Text style={{ color: pickerConfig?.selected === item ? colors.primary : colors.text, fontSize: 16, fontWeight: pickerConfig?.selected === item ? "700" : "400" }}>
                    {item}
                  </Text>
                  {pickerConfig?.selected === item && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
