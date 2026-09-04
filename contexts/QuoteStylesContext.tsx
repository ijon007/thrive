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

import { parseQuoteStyles, type QuoteStyle } from "@/constants/quoteStyle";

const STORAGE_KEY = "quotes_card_styles";

interface QuoteStylesValue {
  styles: Record<string, QuoteStyle>;
  setQuoteStyle: (quoteId: string, style: QuoteStyle) => void;
  clearQuoteStyle: (quoteId: string) => void;
}

const QuoteStylesContext = createContext<QuoteStylesValue>({
  styles: {},
  setQuoteStyle: () => {},
  clearQuoteStyle: () => {},
});

export function QuoteStylesProvider({ children }: { children: ReactNode }) {
  const [styles, setStyles] = useState<Record<string, QuoteStyle>>({});

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      setStyles(parseQuoteStyles(v));
    });
  }, []);

  const setQuoteStyle = useCallback((quoteId: string, style: QuoteStyle) => {
    setStyles((prev) => {
      const next = { ...prev, [quoteId]: style };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearQuoteStyle = useCallback((quoteId: string) => {
    setStyles((prev) => {
      if (!(quoteId in prev)) return prev;
      const next = { ...prev };
      delete next[quoteId];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ styles, setQuoteStyle, clearQuoteStyle }),
    [styles, setQuoteStyle, clearQuoteStyle],
  );

  return (
    <QuoteStylesContext.Provider value={value}>{children}</QuoteStylesContext.Provider>
  );
}

export const useQuoteStyles = () => useContext(QuoteStylesContext);
