import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TutorCard } from "../../src/components/TutorCard";
import { TutorCardSkeleton } from "../../src/components/Skeleton";
import { EmptyState } from "../../src/components/EmptyState";
import { Badge } from "../../src/components/Badge";
import { tutorApi, favoriteApi } from "../../src/api/services";
import type { TutorSummary } from "../../src/types";
import { colors, spacing, radius } from "../../src/constants/theme";

const categories = [
  { name: "Tümü", icon: "grid" as const },
  { name: "YKS", icon: "school" as const },
  { name: "LGS", icon: "book" as const },
  { name: "Dil", icon: "language" as const },
  { name: "Yazılım", icon: "code-slash" as const },
  { name: "Müzik", icon: "musical-notes" as const },
];

export default function SearchScreen() {
  const router = useRouter();
  const [tutors, setTutors] = useState<TutorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [sort, setSort] = useState("popular");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);

  const fetchTutors = useCallback(async () => {
    try {
      const [tutorsRes, favRes] = await Promise.all([
        tutorApi.list({ sort, size: 50 }),
        favoriteApi.list().catch(() => ({ data: [] })),
      ]);
      setTutors(tutorsRes.data.content);
      setFavoriteIds(new Set(favRes.data.map((u) => u.id)));
    } catch {
      // hata yönetimi
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sort]);

  useEffect(() => { fetchTutors(); }, [fetchTutors]);

  const handleFavoriteToggle = async (tutorId: string) => {
    const isFav = favoriteIds.has(tutorId);
    try {
      if (isFav) {
        await favoriteApi.remove(tutorId);
        setFavoriteIds((prev) => { const n = new Set(prev); n.delete(tutorId); return n; });
      } else {
        await favoriteApi.add(tutorId);
        setFavoriteIds((prev) => new Set(prev).add(tutorId));
      }
    } catch { /* */ }
  };

  const filtered = useMemo(() => tutors.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      if (!t.fullName.toLowerCase().includes(q) && !t.subjects.some((s) => s.toLowerCase().includes(q))) return false;
    }
    if (selectedCategory !== "Tümü" && !t.subjects.some((s) => s.toLowerCase().includes(selectedCategory.toLowerCase()))) return false;
    if (onlineOnly && !t.online) return false;
    if (minPrice && t.hourlyRate < Number(minPrice)) return false;
    if (maxPrice && t.hourlyRate > Number(maxPrice)) return false;
    return true;
  }), [tutors, search, selectedCategory, onlineOnly, minPrice, maxPrice]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.sm }}>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: "700" }}>öğret.io</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>
          Alanında uzman öğretmenler
        </Text>

        <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.md }}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, height: 44 }}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              placeholder="Öğretmen veya ders ara..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              accessibilityLabel="Öğretmen ara"
              style={{ flex: 1, color: colors.text, fontSize: 14, marginLeft: 8 }}
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            accessibilityLabel="Filtrele"
            accessibilityRole="button"
            style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: showFilters ? colors.primary : colors.surface, borderWidth: 1, borderColor: showFilters ? colors.primary : colors.border, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="options-outline" size={18} color={showFilters ? "#fff" : colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={{ backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.sm }}>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 4 }}>Min. Fiyat</Text>
                <TextInput
                  placeholder="₺0"
                  placeholderTextColor={colors.textMuted}
                  value={minPrice}
                  onChangeText={setMinPrice}
                  keyboardType="numeric"
                  accessibilityLabel="Minimum fiyat"
                  style={{ backgroundColor: colors.surface, borderRadius: radius.sm, paddingHorizontal: spacing.sm, height: 36, color: colors.text, fontSize: 13, borderWidth: 1, borderColor: colors.border }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 4 }}>Max. Fiyat</Text>
                <TextInput
                  placeholder="₺999"
                  placeholderTextColor={colors.textMuted}
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  keyboardType="numeric"
                  accessibilityLabel="Maksimum fiyat"
                  style={{ backgroundColor: colors.surface, borderRadius: radius.sm, paddingHorizontal: spacing.sm, height: 36, color: colors.text, fontSize: 13, borderWidth: 1, borderColor: colors.border }}
                />
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setOnlineOnly(!onlineOnly)}
              accessibilityLabel={`Sadece çevrimiçi öğretmenler${onlineOnly ? ", aktif" : ""}`}
              accessibilityRole="switch"
              accessibilityState={{ checked: onlineOnly }}
              style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}
            >
              <View style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: onlineOnly ? colors.primary : colors.surface, borderWidth: 1.5, borderColor: onlineOnly ? colors.primary : colors.border, alignItems: "center", justifyContent: "center" }}>
                {onlineOnly && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={{ color: colors.text, fontSize: 13 }}>Sadece çevrimiçi öğretmenler</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        horizontal
        data={categories}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm, marginBottom: spacing.sm }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(item.name)}
            accessibilityRole="button"
            accessibilityLabel={`Kategori: ${item.name}`}
            accessibilityState={{ selected: selectedCategory === item.name }}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: selectedCategory === item.name ? colors.primary : colors.surface, borderWidth: 1, borderColor: selectedCategory === item.name ? colors.primary : colors.border }}
          >
            <Ionicons name={item.icon} size={14} color={selectedCategory === item.name ? "#fff" : colors.textSecondary} />
            <Text style={{ color: selectedCategory === item.name ? "#fff" : colors.textSecondary, fontSize: 13, fontWeight: "500" }}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.name}
      />

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{filtered.length} öğretmen</Text>
        <View style={{ flexDirection: "row", gap: spacing.xs }}>
          {["popular", "rating", "price_asc"].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSort(s)}
              accessibilityRole="button"
              accessibilityLabel={`Sırala: ${s === "popular" ? "Popüler" : s === "rating" ? "Puan" : "Fiyat"}`}
              accessibilityState={{ selected: sort === s }}
              style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: sort === s ? colors.surfaceLight : "transparent" }}
            >
              <Text style={{ color: sort === s ? colors.primary : colors.textMuted, fontSize: 12 }}>{s === "popular" ? "Popüler" : s === "rating" ? "Puan" : "Fiyat"}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        windowSize={10}
        maxToRenderPerBatch={10}
        initialNumToRender={10}
        removeClippedSubviews={Platform.OS === "android"}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TutorCard tutor={item} onPress={() => router.push(`/tutor/${item.id}`)} favorited={favoriteIds.has(item.id)} onFavoriteToggle={() => handleFavoriteToggle(item.id)} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTutors(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingHorizontal: 0 }}>
              {[1,2,3,4,5].map((i) => <TutorCardSkeleton key={i} />)}
            </View>
          ) : (
            <EmptyState icon="search-outline" title="Sonuç bulunamadı" subtitle="Farklı bir arama terimi dene veya filtreleri kaldır" />
          )
        }
      />
    </View>
  );
}
