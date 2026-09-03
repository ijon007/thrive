import { GlassContainer, GlassView } from "expo-glass-effect";
import { useMinimizeOnScroll } from "expo-glass-tabs";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { QuoteDialog, QuoteTile, TILE_GAP } from "@/components/QuoteGrid";
import { AnimatedScrollView, AnimatedView, hasLiquidGlass } from "@/components/styled";
import { CATEGORIES, QUOTES, type Quote } from "@/constants/quotes";
import { colors, fonts } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

const CATEGORY_ICONS: Record<string, string> = {
  Wisdom: "lightbulb.fill",
  Love: "heart.fill",
  Courage: "flame.fill",
  Mindfulness: "leaf.fill",
  Growth: "arrow.up.right",
  Creativity: "paintbrush.fill",
};

const CHIP_H = 36;
const CHIP_R = CHIP_H / 2;

export default function ExploreScreen() {
  const onScroll = useMinimizeOnScroll();
  const insets = useSafeAreaInsets();
  const { scheme } = useTheme();
  const t = colors[scheme];

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openQuote, setOpenQuote] = useState<Quote | null>(null);

  const filtered = activeCategory
    ? QUOTES.filter((q) => q.category === activeCategory)
    : QUOTES;

  return (
    <>
    <AnimatedScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        gap: 10,
        paddingTop: insets.top + 8,
        paddingBottom: 32,
      }}
      style={{ backgroundColor: t.background }}
    >
      <AnimatedView entering={FadeIn.duration(500)}>
        <Text
          className="text-[32px] font-bold tracking-tight"
          style={{ color: t.foreground, fontFamily: fonts.serifBold }}
        >
          Explore
        </Text>
      </AnimatedView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 2 }}
      >
        <GlassContainer
          spacing={8}
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <CategoryChip
            label="All"
            icon="square.grid.2x2.fill"
            active={activeCategory === null}
            scheme={scheme}
            onPress={() => setActiveCategory(null)}
          />
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              icon={CATEGORY_ICONS[cat]}
              active={activeCategory === cat}
              scheme={scheme}
              onPress={() => setActiveCategory(cat)}
            />
          ))}
        </GlassContainer>
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: TILE_GAP,
          marginTop: 2,
        }}
      >
        {filtered.map((quote) => (
          <QuoteTile
            key={quote.id}
            quote={quote}
            scheme={scheme}
            onPress={() => setOpenQuote(quote)}
          />
        ))}
      </View>
    </AnimatedScrollView>
    <QuoteDialog
      quote={openQuote}
      scheme={scheme}
      onClose={() => setOpenQuote(null)}
    />
    </>
  );
}

function CategoryChip({
  label,
  icon,
  active,
  scheme,
  onPress,
}: {
  label: string;
  icon: string;
  active: boolean;
  scheme: "light" | "dark";
  onPress: () => void;
}) {
  const t = colors[scheme];

  return (
    <GlassView
      isInteractive
      colorScheme={scheme}
      glassEffectStyle={active ? "clear" : "regular"}
      {...{ borderRadius: CHIP_R }}
      style={{
        height: CHIP_H,
        borderRadius: CHIP_R,
        borderCurve: "continuous",
        ...(hasLiquidGlass
          ? {}
          : {
              backgroundColor: active ? t.secondary : t.card,
              borderWidth: 1,
              borderColor: active ? t.primary : t.border,
            }),
      }}
    >
      <Pressable
        onPress={onPress}
        style={{
          height: CHIP_H,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <SymbolView
          name={icon as any}
          size={14}
          tintColor={active ? t.primary : t.mutedForeground}
        />
        <Text
          className="text-[13px] font-medium"
          style={{
            color: active ? t.primary : t.mutedForeground,
            fontFamily: active ? fonts.sansBold : fonts.sans,
          }}
        >
          {label}
        </Text>
      </Pressable>
    </GlassView>
  );
}
