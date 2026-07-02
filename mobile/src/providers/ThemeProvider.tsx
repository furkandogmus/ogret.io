import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors, darkColors } from "../constants/theme";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  mode: "system",
  setMode: () => {},
  toggle: () => {},
});

const THEME_KEY = "@theme_mode";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setModeState(stored);
      }
    });
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(THEME_KEY, newMode);
  };

  const isDark = mode === "system" ? systemScheme === "dark" : mode === "dark";
  const toggle = () => setMode(isDark ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ isDark, mode, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

export { lightColors, darkColors };
