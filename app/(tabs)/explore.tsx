import { useMinimizeOnScroll } from "expo-glass-tabs";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
    FadeIn,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    AnimatedScrollView,
    AnimatedView,
    StyledGlassView,
} from "@/components/styled";
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

export default function ExploreScreen() {
  const onScroll = useMinimizeOnScroll();
  const insets = useSafeAreaInsets();
  const { scheme } = useTheme();
  const t = colors[scheme];

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? QUOTES.filter((q) => q.category === activeCategory)
    : QUOTES;

  return (
    <AnimatedScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        gap: 16,
        paddingTop: insets.top + 16,
        paddingBottom: 32,
      }}
      style={{ backgroundColor: t.background }}
    >
      {/* Header */}
      <AnimatedView entering={FadeIn.duration(500)}>
        <Text
          className="text-[32px] font-bold tracking-tight"
          style={{ color: t.foreground, fontFamily: fonts.serifBold }}
        >
          Explore
        </Text>
        <Text
          className="text-[15px] mt-0.5"
          style={{ color: t.mutedForeground, fontFamily: fonts.sans }}
        >
          Browse quotes by category
        </Text>
      </AnimatedView>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: "row",
          gap: 8,
          paddingVertical: 4,
        }}
      >
        <CategoryChip
          label="All"
          icon="square.grid.2x2.fill"
          active={activeCategory === null}
          scheme={scheme}
          onPress={() => setActiveCategory(null)}
          delay={0}
        />
        {CATEGORIES.map((cat, i) => (
          <CategoryChip
            key={cat}
            label={cat}
            icon={CATEGORY_ICONS[cat]}
            active={activeCategory === cat}
            scheme={scheme}
            onPress={() => setActiveCategory(cat)}
            delay={(i + 1) * 50}
          />
        ))}
      </ScrollView>

      {/* Quote list */}
      <View className="gap-2.5">
        {filtered.map((quote, i) => (
          <QuoteListItem
            key={quote.id}
            quote={quote}
            scheme={scheme}
            index={i}
          />
        ))}
      </View>
    </AnimatedScrollView>
  );
}

function CategoryChip({
  label,
  icon,
  active,
  scheme,
  onPress,
  delay,
}: {
  label: string;
  icon: string;
  active: boolean;
  scheme: "light" | "dark";
  onPress: () => void;
  delay: number;
}) {
  const t = colors[scheme];
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedView entering={FadeInDown.duration(400).delay(delay)}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.93, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
        onPress={onPress}
      >
        <AnimatedView style={animStyle}>
          <StyledGlassView
            className="flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-full border"
            style={
              active
                ? { borderWidth: 1.5, borderColor: t.primary }
                : { borderColor: "transparent" }
            }
            glassEffectStyle={active ? "clear" : "regular"}
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
          </StyledGlassView>
        </AnimatedView>
      </Pressable>
    </AnimatedView>
  );
}

function QuoteListItem({
  quote,
  scheme,
  index,
}: {
  quote: Quote;
  scheme: "light" | "dark";
  index: number;
}) {
  const t = colors[scheme];
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedView entering={FadeInDown.duration(400).delay(index * 60)}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
      >
        <AnimatedView style={animStyle}>
          <StyledGlassView
            className="rounded-2xl overflow-hidden"
            glassEffectStyle="regular"
          >
            <View className="p-5 gap-3">
              <Text
                className="text-base leading-6 tracking-tight"
                style={{ color: t.foreground, fontFamily: fonts.serif }}
                numberOfLines={3}
              >
                "{quote.text}"
              </Text>
              <View className="flex-row justify-between items-center">
                <Text
                  className="text-[13px] font-medium"
                  style={{ color: t.mutedForeground, fontFamily: fonts.sans }}
                >
                  {quote.author}
                </Text>
                <View
                  className="px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: t.secondary }}
                >
                  <Text
                    className="text-[11px] font-semibold"
                    style={{
                      color: t.secondaryForeground,
                      fontFamily: fonts.sans,
                    }}
                  >
                    {quote.category}
                  </Text>
                </View>
              </View>
            </View>
          </StyledGlassView>
        </AnimatedView>
      </Pressable>
    </AnimatedView>
  );
}
