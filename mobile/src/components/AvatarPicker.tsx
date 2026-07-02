import { View, Text, TouchableOpacity, Modal, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors, spacing, radius } from "../constants/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  onImagePicked: (uri: string) => void;
}

export function AvatarPicker({ visible, onClose, onImagePicked }: Props) {
  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onImagePicked(result.assets[0].uri);
      onClose();
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onImagePicked(result.assets[0].uri);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "flex-end" }} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingTop: spacing.lg, paddingBottom: Platform.OS === "ios" ? 40 : spacing.xxl }}>
          <View style={{ width: 40, height: 4, backgroundColor: colors.textMuted, borderRadius: 2, alignSelf: "center", marginBottom: spacing.lg }} />
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: "600", textAlign: "center", marginBottom: spacing.lg }}>Profil Fotoğrafı</Text>
          <TouchableOpacity onPress={pickFromCamera} style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + "20", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="camera" size={22} color={colors.primary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 15 }}>Kamera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickFromGallery} style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + "20", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="images" size={22} color={colors.primary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 15 }}>Galeri</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.error + "20", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="close" size={22} color={colors.error} />
            </View>
            <Text style={{ color: colors.error, fontSize: 15 }}>Vazgeç</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
