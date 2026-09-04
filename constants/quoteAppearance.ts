export const QUOTE_ALIGN_IDS = ["left", "center"] as const;
export type QuoteAlign = (typeof QUOTE_ALIGN_IDS)[number];

export type QuoteAppearance = {
  showMark: boolean;
  showAuthor: boolean;
  showCategory: boolean;
  align: QuoteAlign;
};

export const DEFAULT_QUOTE_APPEARANCE: QuoteAppearance = {
  showMark: true,
  showAuthor: true,
  showCategory: true,
  align: "left",
};

export function parseQuoteAppearance(raw: string | null): QuoteAppearance {
  if (!raw) return DEFAULT_QUOTE_APPEARANCE;
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v !== "object" || v == null) return DEFAULT_QUOTE_APPEARANCE;
    const o = v as Record<string, unknown>;
    const align =
      o.align === "center" || o.align === "left" ? o.align : DEFAULT_QUOTE_APPEARANCE.align;
    return {
      showMark: typeof o.showMark === "boolean" ? o.showMark : DEFAULT_QUOTE_APPEARANCE.showMark,
      showAuthor:
        typeof o.showAuthor === "boolean" ? o.showAuthor : DEFAULT_QUOTE_APPEARANCE.showAuthor,
      showCategory:
        typeof o.showCategory === "boolean"
          ? o.showCategory
          : DEFAULT_QUOTE_APPEARANCE.showCategory,
      align,
    };
  } catch {
    return DEFAULT_QUOTE_APPEARANCE;
  }
}

if (__DEV__) {
  console.assert(parseQuoteAppearance(null).showAuthor === true);
  console.assert(parseQuoteAppearance('{"showAuthor":false}').showAuthor === false);
  console.assert(parseQuoteAppearance("{").showMark === true);
  console.assert(parseQuoteAppearance('{"align":"center"}').align === "center");
}
