import { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "./Avatar";
import { colors, spacing, radius, statusColors, statusLabels } from "../constants/theme";
import { formatLocalDateShort, formatTimeRange } from "../utils/dateFormat";
import type { Lesson } from "../types";

interface Props {
  lesson: Lesson;
  userRole: "STUDENT" | "TUTOR";
  onPress?: () => void;
  onAvatarPress?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  onMeetingLink?: () => void;
  onMessage?: () => void;
}

const statusIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  PENDING: "time",
  CONFIRMED: "checkmark-circle",
  IN_PROGRESS: "play-circle",
  COMPLETED: "checkmark-done-circle",
  CANCELLED: "close-circle",
};

function LessonCardComponent({ lesson, userRole, onPress, onAvatarPress, onCancel, onComplete, onMeetingLink, onMessage }: Props) {
  const otherUser = userRole === "STUDENT" ? lesson.tutor : lesson.student;
  const canCancel = lesson.status === "PENDING";
  const canComplete = lesson.status === "IN_PROGRESS" || lesson.status === "PENDING" || lesson.status === "CONFIRMED";
  const showActions = (onCancel && canCancel) || (onComplete && canComplete);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flexDirection: "row", gap: spacing.sm, flex: 1 }}>
          <TouchableOpacity onPress={onAvatarPress} disabled={!onAvatarPress}>
            <Avatar uri={otherUser.avatarUrl} name={otherUser.fullName} size={40} />
          </TouchableOpacity>
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
            {formatLocalDateShort(lesson.lessonDate)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            {formatTimeRange(lesson.startTime, lesson.endTime)}
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

      <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm }}>
        {onMessage && lesson.status !== "CANCELLED" && (
          <TouchableOpacity onPress={onMessage} style={{ flex: 1, backgroundColor: colors.primary + "15", borderRadius: radius.sm, padding: spacing.sm, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 4 }}>
            <Ionicons name="chatbubble-ellipses" size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 13 }}>Mesaj Gönder</Text>
          </TouchableOpacity>
        )}
        {canCancel && onCancel && (
          <TouchableOpacity onPress={onCancel} style={{ flex: 1, backgroundColor: colors.error + "20", borderRadius: radius.sm, padding: spacing.sm, alignItems: "center" }}>
            <Text style={{ color: colors.error, fontWeight: "600", fontSize: 13 }}>İptal Et</Text>
          </TouchableOpacity>
        )}
        {canComplete && onComplete && (
          <TouchableOpacity onPress={onComplete} style={{ flex: 1, backgroundColor: colors.success + "20", borderRadius: radius.sm, padding: spacing.sm, alignItems: "center" }}>
            <Text style={{ color: colors.success, fontWeight: "600", fontSize: 13 }}>
              {lesson.status === "PENDING" ? "Onayla" : "Tamamla"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export const LessonCard = memo(LessonCardComponent);
