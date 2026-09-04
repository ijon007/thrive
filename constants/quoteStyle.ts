import { fonts } from "@/constants/theme";
import type { QuoteAppearance, QuoteAlign } from "@/constants/quoteAppearance";

export const QUOTE_FONT_IDS = ["serif", "sans", "display"] as const;
export type QuoteFontId = (typeof QUOTE_FONT_IDS)[number];

export const QUOTE_INK_IDS = ["auto", "light", "dark"] as const;
export type QuoteInk = (typeof QUOTE_INK_IDS)[number];

export const QUOTE_TEXT_ALIGNS = ["left", "center", "right"] as const;
export type QuoteTextAlign = (typeof QUOTE_TEXT_ALIGNS)[number];

export const QUOTE_SIZE_MIN = 0.8;
export const QUOTE_SIZE_MAX = 1.35;
export const DEFAULT_PHOTO_SCRIM = 0.42;

export const INK_LIGHT = "#F4F1EA";
export const INK_LIGHT_MUTED = "rgba(244,241,234,0.72)";
export const INK_DARK = "#1A1A1A";
export const INK_DARK_MUTED = "rgba(26,26,26,0.62)";

export type QuoteStyle = {
  fontId: QuoteFontId;
  size: number;
  align: QuoteTextAlign;
  ax: number;
  ay: number;
  ink: QuoteInk;
  scrim: number;
  showMark: boolean;
  showAuthor: boolean;
  showCategory: boolean;
};

export const QUOTE_FONTS: {
  id: QuoteFontId;
  label: string;
  family: string;
}[] = [
  { id: "serif", label: "Serif", family: fonts.serif },
  { id: "sans", label: "Sans", family: fonts.sans },
  { id: "display", label: "Display", family: fonts.serifBold },
];

export function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function clampSize(n: number): number {
  return Math.min(QUOTE_SIZE_MAX, Math.max(QUOTE_SIZE_MIN, n));
}

export function snapAxis(n: number): number {
  if (Math.abs(n - 0.5) < 0.07) return 0.5;
  if (n < 0.07) return 0;
  if (n > 0.93) return 1;
  return clamp01(n);
}

export function axisRange(span: number, pad0: number, pad1: number, box: number): number {
  return Math.max(0, span - pad0 - pad1 - box);
}

export function axisRest(pad0: number, range: number, t: number): number {
  return pad0 + t * range;
}

export function fontFamilyFor(id: QuoteFontId): string {
  switch (id) {
    case "serif":
      return fonts.serif;
    case "sans":
      return fonts.sans;
    case "display":
      return fonts.serifBold;
    default: {
      const _never: never = id;
      void _never;
      return fonts.serif;
    }
  }
}

export function alignFromAppearance(align: QuoteAlign): QuoteTextAlign {
  return align === "center" ? "center" : "left";
}

export function defaultAx(align: QuoteTextAlign): number {
  if (align === "left") return 0;
  if (align === "right") return 1;
  return 0.5;
}

export function alphaFromCss(c: string): number {
  if (!c || c === "transparent") return 0;
  const m = c.match(/rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([0-9.]+)\s*\)/);
  return m ? clamp01(Number(m[1])) : 0.3;
}

export function resolveStyle(
  stored: QuoteStyle | undefined,
  appearance: QuoteAppearance,
  bgScrim: string,
  customPhoto: boolean,
): QuoteStyle {
  const align = stored?.align ?? alignFromAppearance(appearance.align);
  return {
    fontId: stored?.fontId ?? "serif",
    size: stored?.size != null ? clampSize(stored.size) : 1,
    align,
    ax: stored?.ax != null ? clamp01(stored.ax) : defaultAx(align),
    ay: stored?.ay != null ? clamp01(stored.ay) : 0.5,
    ink: stored?.ink ?? "auto",
    scrim:
      stored?.scrim != null
        ? clamp01(stored.scrim)
        : customPhoto
          ? DEFAULT_PHOTO_SCRIM
          : alphaFromCss(bgScrim),
    showMark: stored?.showMark ?? appearance.showMark,
    showAuthor: stored?.showAuthor ?? appearance.showAuthor,
    showCategory: stored?.showCategory ?? appearance.showCategory,
  };
}

function isFontId(v: unknown): v is QuoteFontId {
  return v === "serif" || v === "sans" || v === "display";
}
function isInk(v: unknown): v is QuoteInk {
  return v === "auto" || v === "light" || v === "dark";
}
function isAlign(v: unknown): v is QuoteTextAlign {
  return v === "left" || v === "center" || v === "right";
}

export function parseQuoteStyle(v: unknown): QuoteStyle | undefined {
  if (typeof v !== "object" || v == null) return undefined;
  const o = v as Record<string, unknown>;
  const out: Partial<QuoteStyle> = {};
  if (isFontId(o.fontId)) out.fontId = o.fontId;
  if (typeof o.size === "number" && Number.isFinite(o.size)) out.size = clampSize(o.size);
  if (isAlign(o.align)) out.align = o.align;
  if (typeof o.ax === "number" && Number.isFinite(o.ax)) out.ax = clamp01(o.ax);
  if (typeof o.ay === "number" && Number.isFinite(o.ay)) out.ay = clamp01(o.ay);
  if (isInk(o.ink)) out.ink = o.ink;
  if (typeof o.scrim === "number" && Number.isFinite(o.scrim)) out.scrim = clamp01(o.scrim);
  if (typeof o.showMark === "boolean") out.showMark = o.showMark;
  if (typeof o.showAuthor === "boolean") out.showAuthor = o.showAuthor;
  if (typeof o.showCategory === "boolean") out.showCategory = o.showCategory;
  if (Object.keys(out).length === 0) return undefined;
  return out as QuoteStyle;
}

export function parseQuoteStyles(raw: string | null): Record<string, QuoteStyle> {
  if (!raw) return {};
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v !== "object" || v == null) return {};
    const out: Record<string, QuoteStyle> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      const s = parseQuoteStyle(val);
      if (s) out[k] = s;
    }
    return out;
  } catch {
    return {};
  }
}

export function inkIsLight(ink: QuoteInk, autoInk: string): boolean {
  if (ink === "light") return true;
  if (ink === "dark") return false;
  const c = autoInk.trim().toLowerCase();
  if (!c) return false;
  if (c.startsWith("#") && c.length >= 7) {
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 160;
  }
  return true;
}

export function surfaceChrome(autoInk: string, fallbackFg: string): "light" | "dark" {
  return inkIsLight("auto", autoInk || fallbackFg) ? "dark" : "light";
}

export function scrimRgba(lightText: boolean, amount: number): string {
  if (amount <= 0) return "transparent";
  return lightText
    ? `rgba(8,12,24,${amount})`
    : `rgba(255,255,255,${amount})`;
}

if (__DEV__) {
  console.assert(snapAxis(0.48) === 0.5);
  console.assert(axisRest(24, axisRange(500, 24, 24, 100), 0.5) + 50 === 250);
  console.assert(clampSize(3) === QUOTE_SIZE_MAX);
  console.assert(alphaFromCss("rgba(8,12,24,0.42)") === 0.42);
  console.assert(parseQuoteStyles('{"a":{"fontId":"sans","ax":0.2}}').a?.fontId === "sans");
  console.assert(surfaceChrome("#F4F1EA", "#1A1A1A") === "dark");
  console.assert(surfaceChrome("#1A1A1A", "#1A1A1A") === "light");
}
