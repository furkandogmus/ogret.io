import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getBlogPost, blogPosts } from "../../src/data/blogData";
import { colors, spacing } from "../../src/constants/theme";

export default function BlogPostScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const post = slug ? getBlogPost(slug) : undefined;
  const relatedPosts = post ? blogPosts.filter((p) => p.slug !== slug).slice(0, 2) : [];

  if (!post) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingHorizontal: spacing.md, paddingTop: 56 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 24 }}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>Geri</Text>
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>Blog yazısı bulunamadı</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>Aradığınız yazı mevcut değil</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md }}>
        <TouchableOpacity onPress={() => router.push("/blog")} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 24 }}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>Blog'a Dön</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: 16 }}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{new Date(post.date).toLocaleDateString("tr-TR")}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>•</Text>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{post.readingTime}</Text>
        </View>

        <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700", lineHeight: 28, marginBottom: 24 }}>
          {post.title}
        </Text>

        <View style={{ width: "100%", height: 1, backgroundColor: colors.border, marginBottom: 24 }} />

        <View style={{ gap: 16 }}>
          {post.content.map((paragraph, i) => (
            <Text key={i} style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>
              {paragraph}
            </Text>
          ))}
        </View>

        {relatedPosts.length > 0 && (
          <View style={{ marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: 16 }}>Benzer Yazılar</Text>
            <View style={{ gap: 12 }}>
              {relatedPosts.map((rp) => (
                <TouchableOpacity
                  key={rp.slug}
                  onPress={() => router.replace(`/blog/${rp.slug}`)}
                  style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}
                >
                  <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }} numberOfLines={2}>{rp.title}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }} numberOfLines={2}>{rp.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
