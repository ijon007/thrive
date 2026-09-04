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
const ROLL_KEY = "quotes_saved_to_roll";

interface SavedQuotesValue {
  savedIds: Set<string>;
  rollIds: Set<string>;
  toggleSave: (id: string) => void;
  markOnRoll: (id: string) => void;
}

const SavedQuotesContext = createContext<SavedQuotesValue>({
  savedIds: new Set(),
  rollIds: new Set(),
  toggleSave: () => {},
  markOnRoll: () => {},
});

function parseIdSet(raw: string | null): Set<string> | null {
  if (!raw) return null;
  try {
    const ids: unknown = JSON.parse(raw);
    if (Array.isArray(ids) && ids.every((id) => typeof id === "string")) {
      return new Set(ids);
    }
  } catch {
    // ponytail: corrupt storage is ignored; next write replaces it
  }
  return null;
}

export function SavedQuotesProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [rollIds, setRollIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    void Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(ROLL_KEY),
    ]).then(([savedRaw, rollRaw]) => {
      const saved = parseIdSet(savedRaw);
      const rolled = parseIdSet(rollRaw);
      if (saved) setSavedIds(saved);
      if (rolled) setRollIds(rolled);
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

  const markOnRoll = useCallback((id: string) => {
    setRollIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      AsyncStorage.setItem(ROLL_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ savedIds, rollIds, toggleSave, markOnRoll }),
    [savedIds, rollIds, toggleSave, markOnRoll],
  );

  return (
    <SavedQuotesContext.Provider value={value}>
      {children}
    </SavedQuotesContext.Provider>
  );
}

export const useSavedQuotes = () => useContext(SavedQuotesContext);
