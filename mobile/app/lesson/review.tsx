import { useState } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { StarRating } from "../../src/components/StarRating";
import { useToast } from "../../src/components/Toast";
import { reviewApi } from "../../src/api/services";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function LessonReviewScreen() {
  const router = useRouter();
  const toast = useToast();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.show("Lütfen bir puan verin", "error");
      return;
    }
    setLoading(true);
    try {
      await reviewApi.create(lessonId, { rating, comment: comment || undefined });
      toast.show("Değerlendirmeniz kaydedildi", "success");
      router.back();
    } catch {
      toast.show("Gönderilemedi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.md }}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600" }}>Ders Değerlendirmesi</Text>
      </View>
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: spacing.xl }}>
        <View style={{ alignItems: "center", marginBottom: spacing.xl }}>
          <Ionicons name="star-outline" size={80} color={colors.star} />
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700", marginTop: spacing.md }}>Nasıldı?</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: "center", marginTop: spacing.xs }}>
            Ders deneyimini değerlendir
          </Text>
        </View>
        <View style={{ alignItems: "center", marginBottom: spacing.xl }}>
          <StarRating rating={rating} size={40} interactive onRate={setRating} />
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: spacing.sm }}>
            {rating === 0 ? "Puan ver" : rating < 3 ? "Geliştirilebilir" : rating < 4 ? "İyi" : rating < 5 ? "Çok iyi" : "Mükemmel"}
          </Text>
        </View>
        <Input label="Yorum (isteğe bağlı)" value={comment} onChangeText={setComment} multiline numberOfLines={4} placeholder="Deneyiminizi paylaşın..." />
        <Button title="Gönder" onPress={handleSubmit} loading={loading} size="lg" disabled={rating === 0} />
      </View>
    </KeyboardAvoidingView>
  );
}
