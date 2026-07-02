import { Alert } from "react-native";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function showConfirmation({ title, message, confirmLabel = "Onayla", cancelLabel = "Vazgeç", destructive = false, onConfirm, onCancel }: ConfirmOptions) {
  Alert.alert(title, message, [
    { text: cancelLabel, style: "cancel", onPress: onCancel },
    { text: confirmLabel, style: destructive ? "destructive" : "default", onPress: onConfirm },
  ]);
}
