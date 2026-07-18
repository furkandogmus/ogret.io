import type { User } from "../types";

export type MainTabRoute = "/" | "/messages" | "/profile" | "/admin";

export interface MainTabDefinition {
  route: MainTabRoute;
  icon: "home" | "chatbubbles" | "person" | "shield-checkmark";
  label: string;
}

const BASE_TABS: MainTabDefinition[] = [
  { route: "/", icon: "home", label: "Ana Sayfa" },
  { route: "/messages", icon: "chatbubbles", label: "Mesajlar" },
  { route: "/profile", icon: "person", label: "Profil" },
];

export function getMainTabs(role?: User["role"]): MainTabDefinition[] {
  return role === "ADMIN"
    ? [...BASE_TABS, { route: "/admin", icon: "shield-checkmark", label: "Yönetim" }]
    : [...BASE_TABS];
}
