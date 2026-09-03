import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { useColorScheme as useSystemScheme } from "react-native";
import { Uniwind } from "uniwind";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedScheme = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  scheme: ResolvedScheme;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  scheme: "light",
  setMode: () => {},
});

const STORAGE_KEY = "quotes_theme_mode";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === "light" || v === "dark" || v === "system") setModeState(v);
      setLoaded(true);
    });
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    Uniwind.setTheme(m);
    AsyncStorage.setItem(STORAGE_KEY, m);
  }, []);

  useEffect(() => {
    Uniwind.setTheme(mode);
  }, [mode]);

  const scheme: ResolvedScheme =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ mode, scheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
