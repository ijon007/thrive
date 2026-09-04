import type { ImageSourcePropType } from "react-native";

export const QUOTE_BG_IDS = [
  "minimal",
  "statues",
  "pastel",
  "aurora",
  "parchment",
  "ink",
  "sage",
  "ocean",
  "dusk",
  "blush",
  "slate",
  "gold",
] as const;
export type QuoteBgId = (typeof QUOTE_BG_IDS)[number];

export type QuoteBg = {
  id: QuoteBgId;
  label: string;
  source: ImageSourcePropType | null;
  fill: string | null;
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
    fill: null,
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
    fill: null,
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
    fill: null,
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
    fill: null,
    ink: "#F4F1EA",
    muted: "rgba(244,241,234,0.72)",
    scrim: "rgba(8,12,24,0.42)",
    chipBg: "rgba(255,255,255,0.16)",
    chipFg: "#F4F1EA",
  },
  {
    id: "parchment",
    label: "Parchment",
    source: null,
    fill: "#EDE4D3",
    ink: "#2C2418",
    muted: "#6B5C48",
    scrim: "transparent",
    chipBg: "rgba(44,36,24,0.10)",
    chipFg: "#4A3E2E",
  },
  {
    id: "ink",
    label: "Ink",
    source: null,
    fill: "#141414",
    ink: "#F4F1EA",
    muted: "rgba(244,241,234,0.62)",
    scrim: "transparent",
    chipBg: "rgba(255,255,255,0.12)",
    chipFg: "#F4F1EA",
  },
  {
    id: "sage",
    label: "Sage",
    source: null,
    fill: "#4A5D4E",
    ink: "#F3F6F1",
    muted: "rgba(243,246,241,0.72)",
    scrim: "transparent",
    chipBg: "rgba(255,255,255,0.16)",
    chipFg: "#F3F6F1",
  },
  {
    id: "ocean",
    label: "Ocean",
    source: null,
    fill: "#1C3A4A",
    ink: "#E8F2F6",
    muted: "rgba(232,242,246,0.70)",
    scrim: "transparent",
    chipBg: "rgba(255,255,255,0.14)",
    chipFg: "#E8F2F6",
  },
  {
    id: "dusk",
    label: "Dusk",
    source: null,
    fill: "#2A2440",
    ink: "#F0EAF8",
    muted: "rgba(240,234,248,0.68)",
    scrim: "transparent",
    chipBg: "rgba(255,255,255,0.14)",
    chipFg: "#F0EAF8",
  },
  {
    id: "blush",
    label: "Blush",
    source: null,
    fill: "#C9A9A6",
    ink: "#2C1C1C",
    muted: "#5C4040",
    scrim: "transparent",
    chipBg: "rgba(44,28,28,0.10)",
    chipFg: "#4A3030",
  },
  {
    id: "slate",
    label: "Slate",
    source: null,
    fill: "#3A4048",
    ink: "#F2F3F5",
    muted: "rgba(242,243,245,0.68)",
    scrim: "transparent",
    chipBg: "rgba(255,255,255,0.14)",
    chipFg: "#F2F3F5",
  },
  {
    id: "gold",
    label: "Gold",
    source: null,
    fill: "#C4A35A",
    ink: "#1E1608",
    muted: "#4A3A18",
    scrim: "transparent",
    chipBg: "rgba(30,22,8,0.12)",
    chipFg: "#2C220C",
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
