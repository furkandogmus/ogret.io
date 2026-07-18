import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Share } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Avatar } from "../../src/components/Avatar";
import { StarRating } from "../../src/components/StarRating";
import { Button } from "../../src/components/Button";
import { Skeleton } from "../../src/components/Skeleton";
import { useToast } from "../../src/components/Toast";
import { tutorApi, reviewApi, referenceApi, listingApi } from "../../src/api/services";
import type { User, SubjectInfo, Review, Reference } from "../../src/types";
import { colors, spacing, radius } from "../../src/constants/theme";
import { getTutorSubjects } from "../../src/utils/tutorSubjects";

function ProfileSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md }}>
      <View style={{ alignItems: "center", paddingVertical: spacing.xxl }}>
        <Skeleton width={88} height={88} borderRadius={44} />
        <Skeleton width="50%" height={22} style={{ marginTop: spacing.md }} />
        <Skeleton width="30%" height={14} style={{ marginTop: spacing.sm }} />
      </View>
      <View style={{ flexDirection: "row", gap: spacing.md }}>
        <Skeleton width="48%" height={80} borderRadius={radius.md} />
        <Skeleton width="48%" height={80} borderRadius={radius.md} />
      </View>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} width="100%" height={60} borderRadius={radius.md} style={{ marginTop: spacing.sm }} />
      ))}
    </View>
  );
}

export default function TutorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tutor, setTutor] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"about" | "reviews" | "references">("about");

  useEffect(() => {
    (async () => {
      try {
        const [tutorRes, reviewsRes, refsRes, listingsRes] = await Promise.all([
          tutorApi.getById(id),
          reviewApi.getTutorReviews(id),
          referenceApi.getApproved(id).catch(() => ({ data: [] })),
          listingApi.getTutorListings(id).catch(() => ({ data: [] })),
        ]);
        const tutorData = tutorRes.data;
        setTutor(tutorData);
        setSubjects(getTutorSubjects(listingsRes.data, tutorData.subjects || []));
        setReviews(reviewsRes.data);
        setReferences(refsRes.data);
      } catch {
        toast.show("Öğretmen bilgileri yüklenemedi", "error");
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!tutor) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.textMuted }}>Öğretmen bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
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
        {(["about", "reviews", "references"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab ? colors.primary : colors.border,
            }}
          >
            <Text style={{ color: activeTab === tab ? colors.primary : colors.textMuted, fontWeight: "600", textAlign: "center", fontSize: 14 }}>
              {tab === "about" ? "Hakkında" : tab === "reviews" ? `Yorumlar (${reviews.length})` : `Referanslar (${references.length})`}
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
          <Text style={{ color: colors.text, fontWeight: "600", marginBottom: spacing.sm }}>Verdiği Dersler</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
            {subjects.length === 0 ? (
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>Henüz ders konusu belirtilmemiş</Text>
            ) : (
              subjects.map((s) => (
                <View key={s.id} style={{ backgroundColor: colors.surfaceLight, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 6 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{s.name}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      ) : activeTab === "reviews" ? (
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
      ) : (
        <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xxl }}>
          <View style={{ backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14, marginBottom: 4 }}>Tavsiye & Referans Yaz</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 18 }}>Bu öğretmen için bir tavsiye yazmak ister misiniz?</Text>
            <TouchableOpacity
              onPress={() => router.push(`/tutor/write-reference?id=${id}`)}
              style={{ backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 10, alignItems: "center", marginTop: spacing.sm }}
            >
              <Text style={{ color: colors.buttonText, fontSize: 13, fontWeight: "700" }}>Referans Yaz</Text>
            </TouchableOpacity>
          </View>
          {references.length === 0 ? (
            <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: spacing.md }}>Henüz referans yok</Text>
          ) : (
            references.map((ref, i) => (
              <View key={ref.id || i} style={{ backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>{ref.recommenderName}</Text>
                {ref.recommenderTitle && <Text style={{ color: colors.textMuted, fontSize: 11 }}>{ref.recommenderTitle}</Text>}
                {ref.comment && <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: spacing.xs, lineHeight: 18 }}>{ref.comment}</Text>}
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}
