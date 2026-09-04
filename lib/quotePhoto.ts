import { File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

import { asFileUri } from "@/lib/shareQuote";

export const CUSTOM_PHOTO_LOOK = {
  ink: "#F4F1EA",
  muted: "rgba(244,241,234,0.72)",
  scrim: "rgba(8,12,24,0.42)",
  chipBg: "rgba(255,255,255,0.16)",
  chipFg: "#F4F1EA",
} as const;

export type PickPhotoStatus = "picked" | "canceled" | "denied";

export type PickPhotoResult =
  | { status: "picked"; uri: string }
  | { status: "canceled" }
  | { status: "denied" };

export function parsePhotoUris(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v !== "object" || v == null) return {};
    const out: Record<string, string> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (typeof val === "string" && val.length > 0) out[k] = val;
    }
    return out;
  } catch {
    return {};
  }
}

export async function pickQuotePhoto(): Promise<PickPhotoResult> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return { status: "denied" };

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 0.85,
  });
  if (result.canceled) return { status: "canceled" };
  const uri = result.assets[0]?.uri;
  if (!uri) return { status: "canceled" };
  return { status: "picked", uri };
}

export async function persistQuotePhoto(
  quoteId: string,
  sourceUri: string,
): Promise<string> {
  const dest = new File(Paths.document, `quote-photo-${quoteId}.jpg`);
  if (dest.exists) dest.delete();
  await new File(asFileUri(sourceUri)).copy(dest);
  return dest.uri;
}

export async function deletePersistedPhoto(uri: string): Promise<void> {
  const file = new File(asFileUri(uri));
  if (file.exists) file.delete();
}

if (__DEV__) {
  console.assert(Object.keys(parsePhotoUris(null)).length === 0);
  console.assert(parsePhotoUris('{"a":"file://x"}').a === "file://x");
  console.assert(parsePhotoUris("{").a === undefined);
}
