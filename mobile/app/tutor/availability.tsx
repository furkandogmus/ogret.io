import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button } from "../../src/components/Button";
import { useToast } from "../../src/components/Toast";
import { useHaptics } from "../../src/hooks/useHaptics";
import { tutorApi } from "../../src/api/services";
import { colors, spacing, radius } from "../../src/constants/theme";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00",
];

interface DayState {
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function TutorAvailabilityScreen() {
  const router = useRouter();
  const toast = useToast();
  const haptics = useHaptics();
  
  const [slots, setSlots] = useState<Record<number, DayState>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Time picker modal state
  const [pickerConfig, setPickerConfig] = useState<{
    visible: boolean;
    day: number;
    field: "startTime" | "endTime";
    selected: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await tutorApi.getMyAvailability();
        
        // Default values for all 7 days
        const initial: Record<number, DayState> = {};
        for (let i = 0; i < 7; i++) {
          initial[i] = { startTime: "09:00", endTime: "18:00", isActive: false };
        }

        // Format and merge fetched data
        if (Array.isArray(data)) {
          data.forEach((s: any) => {
            const formatTime = (timeVal: any): string => {
              if (Array.isArray(timeVal)) {
                return `${String(timeVal[0]).padStart(2, "0")}:${String(timeVal[1] ?? 0).padStart(2, "0")}`;
              }
              if (typeof timeVal === "string") return timeVal.slice(0, 5);
              return "09:00";
            };

            const dayOfWeek = s.dayOfWeek;
            initial[dayOfWeek] = {
              startTime: formatTime(s.startTime),
              endTime: formatTime(s.endTime),
              isActive: s.isActive ?? true,
            };
          });
        }
        setSlots(initial);
      } catch {
        toast.show("Müsaitlik bilgileri yüklenemedi", "error");
      }
      setLoading(false);
    })();
  }, []);

  const toggleDay = (day: number) => {
    haptics.selection();
    setSlots((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isActive: !prev[day].isActive,
      },
    }));
  };

  const openPicker = (day: number, field: "startTime" | "endTime") => {
    haptics.selection();
    setPickerConfig({
      visible: true,
      day,
      field,
      selected: slots[day][field],
    });
  };

  const handleSelectTime = (time: string) => {
    if (!pickerConfig) return;
    const { day, field } = pickerConfig;
    
    // Check if start time is before end time
    if (field === "startTime" && time >= slots[day].endTime) {
      toast.show("Başlangıç saati bitiş saatinden önce olmalıdır", "error");
      return;
    }
    if (field === "endTime" && time <= slots[day].startTime) {
      toast.show("Bitiş saati başlangıç saatinden sonra olmalıdır", "error");
      return;
    }

    setSlots((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: time,
      },
    }));
    setPickerConfig(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(slots)
        .filter(([_, value]) => value.isActive)
        .map(([key, value]) => ({
          dayOfWeek: parseInt(key),
          startTime: value.startTime,
          endTime: value.endTime,
          isActive: true,
        }));

      await tutorApi.updateAvailability(payload);
      haptics.success();
      toast.show("Müsaitlik durumunuz güncellendi!", "success");
      router.back();
    } catch {
      toast.show("Güncellenirken bir hata oluştu", "error");
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
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", flex: 1 }}>Müsaitlik Durumu</Text>
        <Button title="Kaydet" onPress={handleSave} loading={saving} size="sm" haptic="medium" />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }}>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: spacing.lg }}>
          Haftalık ders verebileceğiniz günleri ve saat aralıklarını belirleyin:
        </Text>

        {DAYS.map((day, i) => {
          const config = slots[i] || { startTime: "09:00", endTime: "18:00", isActive: false };
          return (
            <View
              key={i}
              style={{
                backgroundColor: colors.card,
                borderRadius: radius.lg,
                padding: spacing.md,
                marginBottom: spacing.md,
                borderWidth: 1,
                borderColor: config.isActive ? colors.primary : colors.border,
                elevation: config.isActive ? 2 : 0,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: config.isActive ? 0.05 : 0,
                shadowRadius: 4,
              }}
            >
              {/* Day Header Row */}
              <TouchableOpacity
                onPress={() => toggleDay(i)}
                activeOpacity={0.8}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: config.isActive ? colors.primary : colors.surfaceLight,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="calendar"
                      size={16}
                      color={config.isActive ? "#fff" : colors.textSecondary}
                    />
                  </View>
                  <View>
                    <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>{day}</Text>
                    <Text style={{ color: config.isActive ? colors.primary : colors.textMuted, fontSize: 12, marginTop: 2 }}>
                      {config.isActive ? `Müsait (${config.startTime} - ${config.endTime})` : "Müsait Değil"}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={config.isActive ? "checkbox" : "square-outline"}
                  size={24}
                  color={config.isActive ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>

              {/* Time Pickers (Visible if Active) */}
              {config.isActive && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                    marginTop: spacing.md,
                    paddingTop: spacing.md,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 4 }}>Başlangıç</Text>
                    <TouchableOpacity
                      onPress={() => openPicker(i, "startTime")}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: colors.surfaceLight,
                        borderRadius: radius.md,
                        borderWidth: 1,
                        borderColor: colors.border,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 8,
                      }}
                    >
                      <Text style={{ color: colors.text, fontSize: 13, fontWeight: "500" }}>{config.startTime}</Text>
                      <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 16 }}>veya</Text>

                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 4 }}>Bitiş</Text>
                    <TouchableOpacity
                      onPress={() => openPicker(i, "endTime")}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: colors.surfaceLight,
                        borderRadius: radius.md,
                        borderWidth: 1,
                        borderColor: colors.border,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 8,
                      }}
                    >
                      <Text style={{ color: colors.text, fontSize: 13, fontWeight: "500" }}>{config.endTime}</Text>
                      <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Time Picker Modal */}
      {pickerConfig && (
        <Modal visible={pickerConfig.visible} transparent animationType="slide">
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "flex-end" }}
            activeOpacity={1}
            onPress={() => setPickerConfig(null)}
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
                {pickerConfig.field === "startTime" ? "Başlangıç Saati Seç" : "Bitiş Saati Seç"}
              </Text>
              <FlatList
                data={TIME_SLOTS}
                contentContainerStyle={{ paddingHorizontal: spacing.lg }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectTime(item)}
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
                        color: pickerConfig.selected === item ? colors.primary : colors.text,
                        fontSize: 16,
                        fontWeight: pickerConfig.selected === item ? "600" : "400",
                      }}
                    >
                      {item}
                    </Text>
                    {pickerConfig.selected === item && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}
