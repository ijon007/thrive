import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_QUOTE_APPEARANCE,
  parseQuoteAppearance,
  type QuoteAppearance,
} from "@/constants/quoteAppearance";

const STORAGE_KEY = "quotes_appearance";

interface QuoteAppearanceValue {
  appearance: QuoteAppearance;
  patchAppearance: (patch: Partial<QuoteAppearance>) => void;
}

const QuoteAppearanceContext = createContext<QuoteAppearanceValue>({
  appearance: DEFAULT_QUOTE_APPEARANCE,
  patchAppearance: () => {},
});

export function QuoteAppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<QuoteAppearance>(DEFAULT_QUOTE_APPEARANCE);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      setAppearance(parseQuoteAppearance(v));
    });
  }, []);

  const patchAppearance = useCallback((patch: Partial<QuoteAppearance>) => {
    setAppearance((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ appearance, patchAppearance }),
    [appearance, patchAppearance],
  );

  return (
    <QuoteAppearanceContext.Provider value={value}>
      {children}
    </QuoteAppearanceContext.Provider>
  );
}

export const useQuoteAppearance = () => useContext(QuoteAppearanceContext);
