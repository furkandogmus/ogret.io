import { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";
import { getSelectableTimeSlots, type TimeRange } from "../utils/dateTimeSlots";

interface DateTimePickerProps {
  selectedDate: string | null;
  selectedStart: string | null;
  selectedEnd: string | null;
  onDateSelect: (date: string) => void;
  onStartSelect: (time: string) => void;
  onEndSelect: (time: string) => void;
  disabledDates?: string[];
  availableDaysOfWeek?: number[];
  availableTimeRanges?: TimeRange[];
}

function toBackendDay(jsDay: number): number {
  return (jsDay + 6) % 7;
}

export function DateTimePicker({
  selectedDate, selectedStart, selectedEnd,
  onDateSelect, onStartSelect, onEndSelect,
  disabledDates, availableDaysOfWeek, availableTimeRanges,
}: DateTimePickerProps) {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const isDisabled = (dateStr: string) => {
    if (disabledDates?.includes(dateStr)) return true;
    if (availableDaysOfWeek) {
      const d = new Date(dateStr + "T12:00:00");
      const backendDay = toBackendDay(d.getDay());
      if (!availableDaysOfWeek.includes(backendDay)) return true;
    }
    return false;
  };
  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
  const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

  return (
    <View>
      <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginBottom: spacing.sm }}>Tarih Seç</Text>
      <FlatList
        horizontal
        data={days}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.xs }}
        renderItem={({ item: d }) => {
          const dateStr = formatDate(d);
          const disabled = isDisabled(dateStr);
          const selected = selectedDate === dateStr;
          return (
            <TouchableOpacity
              disabled={disabled}
              onPress={() => onDateSelect(dateStr)}
              style={{
                width: 64, paddingVertical: 10, borderRadius: radius.md, alignItems: "center",
                backgroundColor: selected ? colors.primary : disabled ? colors.surface + "80" : colors.card,
                borderWidth: 1, borderColor: selected ? colors.primary : colors.border,
                opacity: disabled ? 0.4 : 1,
              }}
            >
              <Text style={{ color: selected ? "#fff" : colors.textMuted, fontSize: 11 }}>{dayNames[d.getDay()]}</Text>
              <Text style={{ color: selected ? "#fff" : colors.text, fontSize: 18, fontWeight: "700", marginVertical: 2 }}>{d.getDate()}</Text>
              <Text style={{ color: selected ? "#fff" : colors.textMuted, fontSize: 11 }}>{monthNames[d.getMonth()]}</Text>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(d) => formatDate(d)}
      />

      <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginBottom: spacing.xs }}>Başlangıç</Text>
          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            style={{
              flexDirection: "row", alignItems: "center", justifyContent: "space-between",
              backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
              paddingHorizontal: spacing.md, paddingVertical: 12,
            }}
          >
            <Text style={{ color: selectedStart ? colors.text : colors.textMuted, fontSize: 14 }}>
              {selectedStart || "Seç"}
            </Text>
            <Ionicons name="time-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500", marginBottom: spacing.xs }}>Bitiş</Text>
          <TouchableOpacity
            disabled={!selectedStart}
            onPress={() => setShowEndPicker(true)}
            style={{
              flexDirection: "row", alignItems: "center", justifyContent: "space-between",
              backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
              paddingHorizontal: spacing.md, paddingVertical: 12, opacity: selectedStart ? 1 : 0.5,
            }}
          >
            <Text style={{ color: selectedEnd ? colors.text : colors.textMuted, fontSize: 14 }}>
              {selectedEnd || "Seç"}
            </Text>
            <Ionicons name="time-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <TimeSlotModal
        visible={showStartPicker}
        selected={selectedStart}
        onSelect={(t) => { onStartSelect(t); setShowStartPicker(false); }}
        onClose={() => setShowStartPicker(false)}
        mode="start"
        timeRanges={availableTimeRanges}
      />
      <TimeSlotModal
        visible={showEndPicker}
        selected={selectedEnd}
        onSelect={(t) => { onEndSelect(t); setShowEndPicker(false); }}
        onClose={() => setShowEndPicker(false)}
        mode="end"
        selectedStart={selectedStart}
        timeRanges={availableTimeRanges}
      />
    </View>
  );
}

function TimeSlotModal({
  visible, selected, onSelect, onClose, mode, selectedStart, timeRanges,
}: {
  visible: boolean;
  selected: string | null;
  onSelect: (t: string) => void;
  onClose: () => void;
  mode: "start" | "end";
  selectedStart?: string | null;
  timeRanges?: TimeRange[];
}) {
  const slots = getSelectableTimeSlots({ mode, selectedStart, timeRanges });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "flex-end" }} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl, maxHeight: 400 }}>
          <View style={{ width: 40, height: 4, backgroundColor: colors.textMuted, borderRadius: 2, alignSelf: "center", marginBottom: spacing.lg }} />
          <FlatList
            data={slots}
            contentContainerStyle={{ paddingHorizontal: spacing.lg }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelect(item)}
                style={{
                  flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                  paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
                }}
              >
                <Text style={{ color: selected === item ? colors.primary : colors.text, fontSize: 16, fontWeight: selected === item ? "600" : "400" }}>
                  {item}
                </Text>
                {selected === item && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
