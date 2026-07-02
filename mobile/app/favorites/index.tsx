import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TutorCard } from "../../src/components/TutorCard";
import { favoriteApi } from "../../src/api/services";
import type { User } from "../../src/types";
import { colors, spacing } from "../../src/constants/theme";

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const fetchFavorites = useCallback(async () => {
    try {
      const { data } = await favoriteApi.list();
      setFavorites(data);
      setFavoriteIds(new Set(data.map((u) => u.id)));
    } catch { /* */ }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const handleToggle = async (tutorId: string) => {
    const isFav = favoriteIds.has(tutorId);
    try {
      if (isFav) {
        await favoriteApi.remove(tutorId);
        setFavoriteIds((prev) => { const n = new Set(prev); n.delete(tutorId); return n; });
        setFavorites((prev) => prev.filter((u) => u.id !== tutorId));
      } else {
        await favoriteApi.add(tutorId);
        setFavoriteIds((prev) => new Set(prev).add(tutorId));
      }
    } catch { /* */ }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>Favorilerim</Text>
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TutorCard
            tutor={{
              id: item.id,
              fullName: item.fullName,
              avatarUrl: item.avatarUrl,
              title: item.education,
              bio: item.bio,
              ratingAvg: item.ratingAvg ?? 0,
              ratingCount: item.ratingCount ?? 0,
              hourlyRate: item.hourlyRate ?? 0,
              experienceYears: item.experienceYears ?? 0,
              online: item.online,
              identityVerified: item.identityVerified,
              subjects: [],
              tags: [],
            }}
            onPress={() => router.push(`/tutor/${item.id}`)}
            favorited={favoriteIds.has(item.id)}
            onFavoriteToggle={() => handleToggle(item.id)}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFavorites(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          : <View style={{ alignItems: "center", marginTop: 40 }}>
              <Ionicons name="heart-outline" size={48} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 15, marginTop: spacing.sm }}>Henüz favori öğretmenin yok</Text>
            </View>
        }
      />
    </View>
  );
}
