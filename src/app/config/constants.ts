import { GraduationCap, Users, Star, Shield } from "lucide-react";

export const APP_CONFIG = {
  SUPPORT_EMAIL: import.meta.env.VITE_SUPPORT_EMAIL || "info@ogret.io",
  STATS: [
    { icon: GraduationCap, value: import.meta.env.VITE_STAT_TEACHERS || "500+", label: "Uzman Öğretmen" },
    { icon: Users, value: import.meta.env.VITE_STAT_STUDENTS || "10.000+", label: "Mutlu Öğrenci" },
    { icon: Star, value: import.meta.env.VITE_STAT_RATING || "4.8/5", label: "Ortalama Puan" },
    { icon: Shield, value: import.meta.env.VITE_STAT_SECURITY || "%100", label: "Güvenli Ödeme" },
  ]
};
