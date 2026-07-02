import { View, Text, FlatList, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { blogPosts } from "../../src/data/blogData";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function BlogIndexScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>Blog</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>Özel ders ve eğitim üzerine içerikler</Text>
      </View>

      <FlatList
        data={blogPosts}
        keyExtractor={(item) => item.slug}
        windowSize={10}
        maxToRenderPerBatch={10}
        initialNumToRender={10}
        removeClippedSubviews={Platform.OS === "android"}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/blog/${item.slug}`)}
            style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.sm }}>
              <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{new Date(item.date).toLocaleDateString("tr-TR")}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>•</Text>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{item.readingTime}</Text>
            </View>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600", marginBottom: 4 }} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 18 }} numberOfLines={2}>
              {item.description}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
