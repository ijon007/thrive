import { File, Paths } from "expo-file-system";
import { Asset, requestPermissionsAsync } from "expo-media-library";
import * as Sharing from "expo-sharing";

export function asFileUri(uri: string): string {
  if (
    uri.startsWith("file://") ||
    uri.startsWith("content://") ||
    uri.startsWith("data:")
  ) {
    return uri;
  }
  return `file://${uri}`;
}

export function quotePngName(author: string): string {
  const slug =
    author
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "Quote";
  return `Thrive-${slug}.png`;
}

export async function namedQuotePng(
  uri: string,
  author: string,
): Promise<string> {
  const dest = new File(Paths.cache, quotePngName(author));
  if (dest.exists) dest.delete();
  await new File(asFileUri(uri)).copy(dest);
  return dest.uri;
}

export async function saveImageToCameraRoll(
  uri: string,
  author: string,
): Promise<boolean> {
  const perm = await requestPermissionsAsync(true);
  if (perm.status !== "granted") return false;
  await Asset.create(await namedQuotePng(uri, author));
  return true;
}

export async function shareImageFile(
  uri: string,
  author: string,
): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) return;
  await Sharing.shareAsync(await namedQuotePng(uri, author), {
    mimeType: "image/png",
    UTI: "public.png",
    dialogTitle: "Share quote",
  });
}

if (__DEV__) {
  console.assert(asFileUri("/tmp/q.png") === "file:///tmp/q.png");
  console.assert(quotePngName("Steve Jobs") === "Thrive-Steve-Jobs.png");
  console.assert(quotePngName("  ") === "Thrive-Quote.png");
}
