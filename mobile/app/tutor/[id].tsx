import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Share } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Avatar } from "../../src/components/Avatar";
import { StarRating } from "../../src/components/StarRating";
import { Button } from "../../src/components/Button";
import { useToast } from "../../src/components/Toast";
import { tutorApi, subjectApi, reviewApi } from "../../src/api/services";
import type { User, Subject, Review } from "../../src/types";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function TutorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tutor, setTutor] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"about" | "reviews">("about");

  useEffect(() => {
    (async () => {
      try {
        const [tutorRes, subjectsRes, reviewsRes] = await Promise.all([
          tutorApi.getById(id),
          subjectApi.list(),
          reviewApi.getTutorReviews(id),
        ]);
        setTutor(tutorRes.data);
        setSubjects(subjectsRes.data);
        setReviews(reviewsRes.data);
      } catch { /* */ }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!tutor) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.textMuted }}>Öğretmen bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingTop: 56 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <TouchableOpacity
            onPress={async () => {
              await Clipboard.setStringAsync(`https://ogret.io/tutor/${id}`);
              toast.show("Profil bağlantısı kopyalandı", "success");
            }}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="copy-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              try {
                await Share.share({ message: `${tutor?.fullName} - öğret.io'da özel ders veriyor!`, url: `https://ogret.io/tutor/${id}` });
              } catch {}
            }}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <LinearGradient colors={[colors.primary + "30", "transparent"]} style={{ position: "absolute", top: 0, left: 0, right: 0, height: 200 }} />
      <View style={{ alignItems: "center", paddingVertical: spacing.lg }}>
        <Avatar uri={tutor.avatarUrl} name={tutor.fullName} size={88} online={tutor.online} />
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700", marginTop: spacing.md }}>{tutor.fullName}</Text>
        {tutor.bio && <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>{tutor.bio}</Text>}
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm }}>
          <StarRating rating={tutor.ratingAvg ?? 0} />
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>({tutor.ratingCount ?? 0})</Text>
          <Text style={{ color: colors.textMuted }}>•</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{tutor.experienceYears ?? 0} yıl deneyim</Text>
        </View>
        {tutor.hourlyRate && (
          <Text style={{ color: colors.primary, fontSize: 24, fontWeight: "700", marginTop: spacing.sm }}>
            ₺{tutor.hourlyRate}
            <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: "400" }}>/saat</Text>
          </Text>
        )}
        <Button title="Ders Talep Et" onPress={() => router.push(`/lesson/request?tutorId=${id}`)} style={{ marginTop: spacing.md }} />
      </View>

      <View style={{ flexDirection: "row", paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
        {["about", "reviews"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as typeof activeTab)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab ? colors.primary : colors.border,
            }}
          >
            <Text style={{ color: activeTab === tab ? colors.primary : colors.textMuted, fontWeight: "600", textAlign: "center", fontSize: 14 }}>
              {tab === "about" ? "Hakkında" : "Yorumlar"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "about" ? (
        <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xxl }}>
          {tutor.education && (
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{ color: colors.text, fontWeight: "600", marginBottom: spacing.xs }}>Eğitim</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{tutor.education}</Text>
            </View>
          )}
          <Text style={{ color: colors.text, fontWeight: "600", marginBottom: spacing.sm }}>Ders Konuları</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
            {subjects.map((s) => (
              <View key={s.id} style={{ backgroundColor: colors.surfaceLight, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 6 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{s.name}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xxl }}>
          {reviews.length === 0 ? (
            <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: spacing.xl }}>Henüz yorum yok</Text>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={{ backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>{review.studentName || "Anonim"}</Text>
                  <StarRating rating={review.rating} />
                </View>
                {review.comment && <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: spacing.xs }}>{review.comment}</Text>}
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}
