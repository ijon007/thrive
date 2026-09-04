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
  deletePersistedPhoto,
  persistQuotePhoto,
  pickQuotePhoto,
  parsePhotoUris,
  type PickPhotoStatus,
} from "@/lib/quotePhoto";

const STORAGE_KEY = "quotes_custom_photos";

interface QuotePhotosValue {
  photoUris: Record<string, string>;
  choosePhoto: (quoteId: string) => Promise<PickPhotoStatus>;
  clearPhoto: (quoteId: string) => void;
}

const QuotePhotosContext = createContext<QuotePhotosValue>({
  photoUris: {},
  choosePhoto: async () => "canceled",
  clearPhoto: () => {},
});

export function QuotePhotosProvider({ children }: { children: ReactNode }) {
  const [photoUris, setPhotoUris] = useState<Record<string, string>>({});

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      setPhotoUris(parsePhotoUris(v));
    });
  }, []);

  const choosePhoto = useCallback(async (quoteId: string) => {
    const picked = await pickQuotePhoto();
    if (picked.status !== "picked") return picked.status;
    const uri = await persistQuotePhoto(quoteId, picked.uri);
    setPhotoUris((prev) => {
      const stale = prev[quoteId];
      if (stale && stale !== uri) void deletePersistedPhoto(stale);
      const next = { ...prev, [quoteId]: uri };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    return "picked" as const;
  }, []);

  const clearPhoto = useCallback((quoteId: string) => {
    setPhotoUris((prev) => {
      const stale = prev[quoteId];
      if (stale) void deletePersistedPhoto(stale);
      const next = { ...prev };
      delete next[quoteId];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ photoUris, choosePhoto, clearPhoto }),
    [photoUris, choosePhoto, clearPhoto],
  );

  return (
    <QuotePhotosContext.Provider value={value}>
      {children}
    </QuotePhotosContext.Provider>
  );
}

export const useQuotePhotos = () => useContext(QuotePhotosContext);
