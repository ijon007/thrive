import { GlassContainer, GlassView } from "expo-glass-effect";
import { useMinimizeOnScroll } from "expo-glass-tabs";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
const TILE_R = 18;
const TILE_GAP = 8;
const DIALOG_R = 28;

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
        <Text
          className="text-[15px]"
          style={{ color: t.mutedForeground, fontFamily: fonts.sans, marginTop: 2 }}
        >
          Browse quotes by category
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

function QuoteTile({
  quote,
  scheme,
  onPress,
}: {
  quote: Quote;
  scheme: "light" | "dark";
  onPress: () => void;
}) {
  const t = colors[scheme];

  return (
    <GlassView
      isInteractive
      colorScheme={scheme}
      glassEffectStyle="regular"
      {...{ borderRadius: TILE_R }}
      style={{
        flexGrow: 1,
        flexBasis: "47%",
        maxWidth: "48.5%",
        aspectRatio: 1,
        borderRadius: TILE_R,
        borderCurve: "continuous",
        ...(hasLiquidGlass
          ? {}
          : { backgroundColor: t.card, borderWidth: 1, borderColor: t.border }),
      }}
    >
      <Pressable
        onPress={onPress}
        style={{
          flex: 1,
          padding: 14,
          justifyContent: "space-between",
        }}
      >
        <View style={{ gap: 8 }}>
          <SymbolView
            name="quote.opening"
            size={16}
            tintColor={t.mutedForeground}
            style={{ opacity: 0.5 }}
          />
          <Text
            numberOfLines={4}
            style={{
              color: t.foreground,
              fontFamily: fonts.serif,
              fontSize: 19,
              lineHeight: 25,
              letterSpacing: -0.35,
            }}
          >
            {quote.text}
          </Text>
        </View>
        <Text
          numberOfLines={1}
          style={{
            color: t.mutedForeground,
            fontFamily: fonts.sans,
            fontSize: 12,
          }}
        >
          {quote.author}
        </Text>
      </Pressable>
    </GlassView>
  );
}

function QuoteDialog({
  quote,
  scheme,
  onClose,
}: {
  quote: Quote | null;
  scheme: "light" | "dark";
  onClose: () => void;
}) {
  const t = colors[scheme];

  return (
    <Modal
      visible={quote != null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Pressable
          onPress={onClose}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor:
              scheme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.28)",
          }}
        />
        {quote ? (
          <View style={{ marginHorizontal: 22 }}>
            <GlassView
              isInteractive
              colorScheme={scheme}
              glassEffectStyle="regular"
              {...{ borderRadius: DIALOG_R }}
              style={{
                borderRadius: DIALOG_R,
                borderCurve: "continuous",
                ...(hasLiquidGlass
                  ? {}
                  : {
                      backgroundColor: t.card,
                      borderWidth: 1,
                      borderColor: t.border,
                    }),
              }}
            >
              <View style={{ padding: 28, gap: 16 }}>
                <SymbolView
                  name="quote.opening"
                  size={26}
                  tintColor={t.mutedForeground}
                  style={{ opacity: 0.5 }}
                />
                <Text
                  style={{
                    color: t.foreground,
                    fontFamily: fonts.serif,
                    fontSize: 26,
                    lineHeight: 36,
                    letterSpacing: -0.3,
                  }}
                >
                  {quote.text}
                </Text>
                <Text
                  style={{
                    color: t.mutedForeground,
                    fontFamily: fonts.sans,
                    fontSize: 15,
                  }}
                >
                  — {quote.author}
                </Text>
                <View
                  style={{
                    alignSelf: "flex-start",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: t.secondary,
                  }}
                >
                  <Text
                    style={{
                      color: t.secondaryForeground,
                      fontFamily: fonts.sans,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {quote.category}
                  </Text>
                </View>
              </View>
            </GlassView>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
