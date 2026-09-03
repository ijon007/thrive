import { useMinimizeOnScroll } from "expo-glass-tabs";
import { SymbolView } from "expo-symbols";
import { useCallback, useRef, useState } from "react";
import { Pressable, Text, View, type ViewToken } from "react-native";
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedView } from "@/components/styled";
import { QUOTES, type Quote } from "@/constants/quotes";
import { colors, fonts } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

const GAP = 8;

export default function HomeScreen() {
  const onScroll = useMinimizeOnScroll();
  const insets = useSafeAreaInsets();
  const { scheme } = useTheme();
  const t = colors[scheme];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [pageH, setPageH] = useState(0);

  // Native tab bar is overlaid; keep the pager above it (paging + auto insets fight).
  const tabClearance = insets.bottom + 56;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const i = viewableItems[0]?.index;
      if (i != null) setCurrentIndex(i);
    },
  ).current;

  const toggleSave = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <View className="flex-1" style={{ flex: 1, backgroundColor: t.background }}>
      <AnimatedView
        entering={FadeIn.duration(400)}
        className="px-5 pb-1 flex-row items-baseline justify-between"
        style={{ paddingTop: insets.top + 6 }}
      >
        <Text
          className="text-[22px] font-bold tracking-tight"
          style={{ color: t.foreground, fontFamily: fonts.serifBold }}
        >
          Thrive
        </Text>
        <Text
          className="text-[13px] opacity-60"
          style={{ color: t.mutedForeground, fontFamily: fonts.sans }}
        >
          {currentIndex + 1} / {QUOTES.length}
        </Text>
      </AnimatedView>

      <View
        className="flex-1"
        style={{ marginBottom: tabClearance }}
        onLayout={(e) => setPageH(e.nativeEvent.layout.height)}
      >
        {pageH > 0 && (
          <Animated.FlatList
            data={QUOTES}
            keyExtractor={(q) => q.id}
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={pageH}
            snapToAlignment="start"
            disableIntervalMomentum
            showsVerticalScrollIndicator={false}
            getItemLayout={(_, i) => ({
              length: pageH,
              offset: pageH * i,
              index: i,
            })}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            renderItem={({ item }) => (
              <View
                style={{
                  height: pageH,
                  paddingHorizontal: GAP,
                  paddingVertical: GAP,
                }}
              >
                <QuoteCard
                  quote={item}
                  scheme={scheme}
                  saved={saved.has(item.id)}
                  onToggleSave={() => toggleSave(item.id)}
                />
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

function QuoteCard({
  quote,
  scheme,
  saved,
  onToggleSave,
}: {
  quote: Quote;
  scheme: "light" | "dark";
  saved: boolean;
  onToggleSave: () => void;
}) {
  const t = colors[scheme];
  return (
    <View
      className="flex-1 rounded-3xl border overflow-hidden flex-row"
      style={{ backgroundColor: t.card, borderColor: t.quoteBorder }}
    >
      <View className="flex-1 justify-center p-7 pr-3 gap-3.5">
        <Text
          className="text-[80px] font-bold leading-[80px] -mb-7"
          style={{ color: t.primary, opacity: 0.08, fontFamily: "Lora" }}
        >
          "
        </Text>
        <Text
          className="text-[26px] leading-[38px] tracking-tight"
          style={{ color: t.foreground, fontFamily: fonts.serif }}
        >
          {quote.text}
        </Text>
        <Text
          className="text-sm font-medium tracking-wide"
          style={{ color: t.mutedForeground, fontFamily: fonts.sans }}
        >
          — {quote.author}
        </Text>
        <View
          className="self-start px-3 py-1.5 rounded-full mt-0.5"
          style={{ backgroundColor: t.secondary }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: t.secondaryForeground, fontFamily: fonts.sans }}
          >
            {quote.category}
          </Text>
        </View>
      </View>
      <View className="justify-end items-center py-6 pr-1.5 gap-5">
        <SideButton
          icon={saved ? "heart.fill" : "heart"}
          label={saved ? "Liked" : "Like"}
          color={saved ? "#E5484D" : t.iconDefault}
          onPress={onToggleSave}
        />
        <SideButton
          icon="arrow.down.to.line"
          label="Save"
          color={t.iconDefault}
          onPress={() => {}}
        />
        <SideButton
          icon="square.and.arrow.up"
          label="Share"
          color={t.iconDefault}
          onPress={() => {}}
        />
      </View>
    </View>
  );
}

function SideButton({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.85, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      onPress={onPress}
    >
      <AnimatedView className="items-center gap-0.5 w-12" style={animStyle}>
        <SymbolView name={icon as any} size={24} tintColor={color} />
        <Text
          className="text-[10px] font-medium"
          style={{ color, fontFamily: "DMSans" }}
        >
          {label}
        </Text>
      </AnimatedView>
    </Pressable>
  );
}
