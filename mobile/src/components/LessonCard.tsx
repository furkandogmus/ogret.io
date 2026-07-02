import { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "./Avatar";
import { colors, spacing, radius, statusColors, statusLabels } from "../constants/theme";
import type { Lesson } from "../types";

interface Props {
  lesson: Lesson;
  userRole: "STUDENT" | "TUTOR";
  onPress?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  onMeetingLink?: () => void;
}

const statusIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  PENDING: "time",
  CONFIRMED: "checkmark-circle",
  IN_PROGRESS: "play-circle",
  COMPLETED: "checkmark-done-circle",
  CANCELLED: "close-circle",
};

function LessonCardComponent({ lesson, userRole, onPress, onCancel, onComplete, onMeetingLink }: Props) {
  const otherUser = userRole === "STUDENT" ? lesson.tutor : lesson.student;
  const canCancel = lesson.status === "PENDING";
  const canComplete = lesson.status === "CONFIRMED" || lesson.status === "IN_PROGRESS";
  const showActions = (onCancel && canCancel) || (onComplete && canComplete);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flexDirection: "row", gap: spacing.sm, flex: 1 }}>
          <Avatar uri={otherUser.avatarUrl} name={otherUser.fullName} size={40} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }} numberOfLines={1}>
              {otherUser.fullName}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{lesson.subject.name}</Text>
          </View>
        </View>
        <View style={{ backgroundColor: statusColors[lesson.status] + "20", borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3, flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name={statusIcons[lesson.status]} size={12} color={statusColors[lesson.status]} />
          <Text style={{ color: statusColors[lesson.status], fontSize: 12, fontWeight: "500" }}>{statusLabels[lesson.status]}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", marginTop: spacing.sm, gap: spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            {(() => {
              const val = lesson.lessonDate;
              if (!val) return "Belirtilmemiş";
              if (Array.isArray(val)) {
                return new Date(val[0], val[1] - 1, val[2]).toLocaleDateString("tr-TR");
              }
              if (typeof val === "string") {
                const parts = val.split("-").map(Number);
                if (parts.length === 3 && !parts.some(isNaN)) {
                  return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("tr-TR");
                }
                return new Date(val).toLocaleDateString("tr-TR");
              }
              return "Belirtilmemiş";
            })()}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            {(() => {
              const formatTime = (val: any) => {
                if (!val) return "";
                if (Array.isArray(val)) {
                  const h = String(val[0]).padStart(2, "0");
                  const m = String(val[1] ?? 0).padStart(2, "0");
                  return `${h}:${m}`;
                }
                if (typeof val === "string") {
                  return val.slice(0, 5);
                }
                return String(val);
              };
              return `${formatTime(lesson.startTime)} - ${formatTime(lesson.endTime)}`;
            })()}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="cash-outline" size={14} color={colors.textMuted} />
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>₺{lesson.price}</Text>
        </View>
      </View>

      {lesson.meetingLink && (lesson.status === "CONFIRMED" || lesson.status === "IN_PROGRESS") && (
        <TouchableOpacity onPress={onMeetingLink} style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm, backgroundColor: colors.surfaceLight, borderRadius: radius.sm, padding: spacing.sm }}>
          <Ionicons name="videocam" size={14} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: 13, flex: 1 }} numberOfLines={1}>{lesson.meetingLink}</Text>
        </TouchableOpacity>
      )}

      {showActions && (
        <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm }}>
          {canCancel && onCancel && (
            <TouchableOpacity onPress={onCancel} style={{ flex: 1, backgroundColor: colors.error + "20", borderRadius: radius.sm, padding: spacing.sm, alignItems: "center" }}>
              <Text style={{ color: colors.error, fontWeight: "600", fontSize: 13 }}>İptal Et</Text>
            </TouchableOpacity>
          )}
          {canComplete && onComplete && (
            <TouchableOpacity onPress={onComplete} style={{ flex: 1, backgroundColor: colors.success + "20", borderRadius: radius.sm, padding: spacing.sm, alignItems: "center" }}>
              <Text style={{ color: colors.success, fontWeight: "600", fontSize: 13 }}>Tamamla</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

export const LessonCard = memo(LessonCardComponent);
