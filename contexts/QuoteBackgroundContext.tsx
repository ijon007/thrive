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
  isQuoteBgId,
  quoteBgById,
  type QuoteBg,
  type QuoteBgId,
} from "@/constants/quoteBackgrounds";

const STORAGE_KEY = "quotes_background";

interface QuoteBackgroundValue {
  backgroundId: QuoteBgId;
  background: QuoteBg;
  setBackgroundId: (id: QuoteBgId) => void;
}

const QuoteBackgroundContext = createContext<QuoteBackgroundValue>({
  backgroundId: "minimal",
  background: quoteBgById("minimal"),
  setBackgroundId: () => {},
});

export function QuoteBackgroundProvider({ children }: { children: ReactNode }) {
  const [backgroundId, setBackgroundIdState] = useState<QuoteBgId>("minimal");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (isQuoteBgId(v)) setBackgroundIdState(v);
    });
  }, []);

  const setBackgroundId = useCallback((id: QuoteBgId) => {
    setBackgroundIdState(id);
    AsyncStorage.setItem(STORAGE_KEY, id);
  }, []);

  const value = useMemo(
    () => ({
      backgroundId,
      background: quoteBgById(backgroundId),
      setBackgroundId,
    }),
    [backgroundId, setBackgroundId],
  );

  return (
    <QuoteBackgroundContext.Provider value={value}>
      {children}
    </QuoteBackgroundContext.Provider>
  );
}

export const useQuoteBackground = () => useContext(QuoteBackgroundContext);
