import { GlassContainer, GlassView } from "expo-glass-effect";
import { useMinimizeOnScroll } from "expo-glass-tabs";
import { Stack, useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
} from "react-native";
import { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SearchBarCommands } from "react-native-screens";

import { QuoteDialog, QuoteTile, TILE_GAP, type TileRect } from "@/components/QuoteGrid";
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

function quoteMatches(quote: Quote, query: string, category: string | null) {
  if (category && quote.category !== category) return false;
  if (!query) return true;
  return (
    quote.text.toLowerCase().includes(query) ||
    quote.author.toLowerCase().includes(query)
  );
}

export default function ExploreScreen() {
  const onScroll = useMinimizeOnScroll();
  const insets = useSafeAreaInsets();
  const { scheme } = useTheme();
  const t = colors[scheme];
  const searchRef = useRef<SearchBarCommands>(null);

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openQuote, setOpenQuote] = useState<Quote | null>(null);
  const [openSource, setOpenSource] = useState<TileRect | null>(null);

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(
    () => QUOTES.filter((quote) => quoteMatches(quote, needle, activeCategory)),
    [needle, activeCategory],
  );

  useFocusEffect(
    useCallback(() => {
      searchRef.current?.focus();
      return () => searchRef.current?.blur();
    }, []),
  );

  return (
    <>
      <Stack.SearchBar
        ref={searchRef}
        autoFocus
        hideWhenScrolling={false}
        placement="automatic"
        placeholder="Quotes and authors"
        autoCapitalize="none"
        onChangeText={(e: NativeSyntheticEvent<TextInputFocusEventData>) =>
          setQuery(e.nativeEvent.text)
        }
        onCancelButtonPress={() => setQuery("")}
      />
      <AnimatedScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 10,
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 8,
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

        {filtered.length === 0 ? (
          <Text
            className="text-[15px]"
            style={{ color: t.mutedForeground, fontFamily: fonts.sans, marginTop: 24 }}
          >
            No quotes match that search.
          </Text>
        ) : (
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
                hidden={openQuote?.id === quote.id}
                onPress={(layout) => {
                  setOpenSource(layout);
                  setOpenQuote(quote);
                }}
              />
            ))}
          </View>
        )}
      </AnimatedScrollView>
      <QuoteDialog
        quote={openQuote}
        source={openSource}
        scheme={scheme}
        onClose={() => {
          setOpenQuote(null);
          setOpenSource(null);
        }}
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
          name={icon as never}
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
