import { useMinimizeOnScroll } from "expo-glass-tabs";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassPad } from "@/components/GlassPad";
import { QuoteDialog, QuoteTile, TILE_GAP, type TileRect } from "@/components/QuoteGrid";
import { AnimatedScrollView, AnimatedView } from "@/components/styled";
import { QUOTES, type Quote } from "@/constants/quotes";
import { colors, fonts } from "@/constants/theme";
import { useSavedQuotes } from "@/contexts/SavedQuotesContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function SavedQuotesScreen() {
  const onScroll = useMinimizeOnScroll();
  const insets = useSafeAreaInsets();
  const { scheme } = useTheme();
  const t = colors[scheme];
  const { savedIds } = useSavedQuotes();
  const [openQuote, setOpenQuote] = useState<Quote | null>(null);
  const [openSource, setOpenSource] = useState<TileRect | null>(null);

  const liked = QUOTES.filter((q) => savedIds.has(q.id));

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
        style={{ flex: 1, backgroundColor: t.background }}
      >
        <GlassPad
          scheme={scheme}
          radius={22}
          style={{ width: 44, height: 44, alignSelf: "flex-start" }}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <SymbolView name="chevron.left" size={17} tintColor={t.foreground} />
          </Pressable>
        </GlassPad>
        <AnimatedView entering={FadeIn.duration(500)}>
          <Text
            className="text-[32px] font-bold tracking-tight"
            style={{ color: t.foreground, fontFamily: fonts.serifBold }}
          >
            Liked Quotes
          </Text>
        </AnimatedView>

        {liked.length === 0 ? (
          <Text
            style={{
              color: t.mutedForeground,
              fontFamily: fonts.sans,
              fontSize: 15,
              marginTop: 12,
            }}
          >
            Quotes you like will show up here.
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
            {liked.map((quote) => (
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
