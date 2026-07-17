import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useToast } from "../../src/components/Toast";
import { useHaptics } from "../../src/hooks/useHaptics";
import { useAuth } from "../../src/providers/AuthProvider";
import { referenceApi } from "../../src/api/services";
import type { Reference } from "../../src/types";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function ReferencesScreen() {
  const router = useRouter();
  const toast = useToast();
  const haptics = useHaptics();
  const { user } = useAuth();

  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReferences = useCallback(async () => {
    try {
      const { data } = await referenceApi.getMyReferences();
      setReferences(data);
    } catch {
      toast.show("Referanslar yüklenemedi", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  const handleCopyLink = async () => {
    haptics.success();
    // Copy the tutor's reference submission URL
    const refUrl = `https://ogret.io/ogretmen/${user?.id}/referans-yaz`;
    await Clipboard.setStringAsync(refUrl);
    toast.show("Referans isteme linki kopyalandı!", "success");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.md }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", flex: 1 }}>Referanslarım</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReferences(); }} tintColor={colors.primary} />}
      >
        {/* Info & Copy Link Card */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm }}>
            <Ionicons name="ribbon-outline" size={22} color={colors.primary} />
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>Referanslar & Tavsiyeler</Text>
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: spacing.md }}>
            Eski öğrencileriniz, velileriniz veya meslektaşlarınızdan tavsiye yazısı toplayarak profilinizin güvenilirliğini artırabilirsiniz. Aşağıdaki bağlantıyı kopyalayıp onlarla paylaşın. Yazılan tavsiyeler admin onayından geçtikten sonra profilinizde listelenir.
          </Text>

          {/* Share Link Area */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.surfaceLight,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.sm,
              gap: spacing.sm,
            }}
          >
            <Text
              style={{
                flex: 1,
                color: colors.textMuted,
                fontSize: 12,
                fontFamily: "monospace",
              }}
              numberOfLines={1}
            >
              ogret.io/ogretmen/{user?.id.slice(0, 8)}.../referans-yaz
            </Text>
            <TouchableOpacity
              onPress={handleCopyLink}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: radius.sm,
              }}
            >
              <Ionicons name="copy-outline" size={14} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>Kopyala</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* References List Section */}
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600", marginBottom: spacing.md }}>
          Gelen Tavsiyeler
        </Text>

        {references.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 40, borderStyle: "dashed", borderWidth: 1, borderColor: colors.border, borderRadius: radius.md }}>
            <Ionicons name="ribbon-outline" size={40} color={colors.textMuted} />
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: spacing.sm, textAlign: "center", paddingHorizontal: spacing.lg }}>
              Henüz bir tavsiye almadınız. Yukarıdaki bağlantıyı paylaşarak ilk tavsiyenizi isteyin!
            </Text>
          </View>
        ) : (
          references.map((ref) => (
            <View
              key={ref.id}
              style={{
                backgroundColor: colors.card,
                borderRadius: radius.md,
                padding: spacing.md,
                marginBottom: spacing.sm,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>{ref.recommenderName}</Text>
                  {ref.recommenderTitle && (
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{ref.recommenderTitle}</Text>
                  )}
                </View>
                <View
                  style={{
                    backgroundColor:
                      ref.status === "APPROVED"
                        ? colors.success + "20"
                        : ref.status === "REJECTED"
                        ? colors.error + "20"
                        : colors.warning + "20",
                    borderRadius: radius.full,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                  }}
                >
                  <Text
                    style={{
                      color:
                        ref.status === "APPROVED"
                          ? colors.success
                          : ref.status === "REJECTED"
                          ? colors.error
                          : colors.warning,
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  >
                    {ref.status === "APPROVED" ? "Onaylı" : ref.status === "REJECTED" ? "Red" : "Bekliyor"}
                  </Text>
                </View>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: spacing.md, lineHeight: 18 }}>
                {ref.comment}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
