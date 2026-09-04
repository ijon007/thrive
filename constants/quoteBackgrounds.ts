import type { ImageSourcePropType } from "react-native";

export const QUOTE_BG_IDS = ["minimal", "statues", "pastel", "aurora"] as const;
export type QuoteBgId = (typeof QUOTE_BG_IDS)[number];

export type QuoteBg = {
  id: QuoteBgId;
  label: string;
  source: ImageSourcePropType | null;
  ink: string;
  muted: string;
  scrim: string;
  chipBg: string;
  chipFg: string;
};

export const QUOTE_BACKGROUNDS: QuoteBg[] = [
  {
    id: "minimal",
    label: "Minimal",
    source: null,
    ink: "",
    muted: "",
    scrim: "transparent",
    chipBg: "",
    chipFg: "",
  },
  {
    id: "statues",
    label: "Statues",
    source: require("../assets/images/quote-bgs/statues.png"),
    ink: "#1A1A1A",
    muted: "#4A4A4A",
    scrim: "rgba(255,255,255,0.38)",
    chipBg: "rgba(255,255,255,0.72)",
    chipFg: "#3A3A3A",
  },
  {
    id: "pastel",
    label: "Pastel",
    source: require("../assets/images/quote-bgs/pastel.png"),
    ink: "#2C2430",
    muted: "#6B5A70",
    scrim: "rgba(255,255,255,0.28)",
    chipBg: "rgba(255,255,255,0.65)",
    chipFg: "#5A4A62",
  },
  {
    id: "aurora",
    label: "Aurora",
    source: require("../assets/images/quote-bgs/aurora.png"),
    ink: "#F4F1EA",
    muted: "rgba(244,241,234,0.72)",
    scrim: "rgba(8,12,24,0.42)",
    chipBg: "rgba(255,255,255,0.16)",
    chipFg: "#F4F1EA",
  },
];

export function quoteBgById(id: QuoteBgId): QuoteBg {
  const found = QUOTE_BACKGROUNDS.find((b) => b.id === id);
  return found ?? QUOTE_BACKGROUNDS[0]!;
}

export function isQuoteBgId(value: string | null): value is QuoteBgId {
  return value != null && (QUOTE_BG_IDS as readonly string[]).includes(value);
}

if (__DEV__) {
  const ids = new Set(QUOTE_BACKGROUNDS.map((b) => b.id));
  console.assert(
    ids.size === QUOTE_BG_IDS.length && QUOTE_BG_IDS.every((id) => ids.has(id)),
    "quote backgrounds must match QUOTE_BG_IDS",
  );
}
