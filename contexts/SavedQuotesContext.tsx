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

const STORAGE_KEY = "quotes_saved_ids";

interface SavedQuotesValue {
  savedIds: Set<string>;
  toggleSave: (id: string) => void;
}

const SavedQuotesContext = createContext<SavedQuotesValue>({
  savedIds: new Set(),
  toggleSave: () => {},
});

export function SavedQuotesProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const ids: unknown = JSON.parse(raw);
        if (Array.isArray(ids) && ids.every((id) => typeof id === "string")) {
          setSavedIds(new Set(ids));
        }
      } catch {
        // ponytail: corrupt storage is ignored; next toggle rewrites a valid list
      }
    });
  }, []);

  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const value = useMemo(() => ({ savedIds, toggleSave }), [savedIds, toggleSave]);

  return (
    <SavedQuotesContext.Provider value={value}>
      {children}
    </SavedQuotesContext.Provider>
  );
}

export const useSavedQuotes = () => useContext(SavedQuotesContext);
