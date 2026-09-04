import { useMinimizeOnScroll } from "expo-glass-tabs";
import { useMemo, useRef, useState } from "react";
import { Text, View, type ViewToken } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { QuoteCard } from "@/components/QuoteCard";
import { AnimatedView } from "@/components/styled";
import { QUOTES, shuffleQuotes } from "@/constants/quotes";
import { colors, fonts } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

const GAP = 12;

export default function HomeScreen() {
  const onScroll = useMinimizeOnScroll();
  const insets = useSafeAreaInsets();
  const { scheme } = useTheme();
  const t = colors[scheme];

  const quotes = useMemo(() => shuffleQuotes(QUOTES), []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pageH, setPageH] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const i = viewableItems[0]?.index;
      if (i != null) setCurrentIndex(i);
    },
  ).current;

  return (
    <View className="flex-1" style={{ flex: 1, backgroundColor: t.background }}>
      <AnimatedView
        entering={FadeIn.duration(500)}
        style={{
          paddingHorizontal: 16,
          paddingTop: insets.top + 8,
          paddingBottom: 4,
        }}
      >
        <Text
          className="text-[32px] font-bold tracking-tight"
          style={{ color: t.foreground, fontFamily: fonts.serifBold }}
        >
          Thrive
        </Text>
      </AnimatedView>

      <View className="flex-1" style={{ flex: 1, paddingBottom: insets.bottom }}>
        <View className="flex-1" style={{ flex: 1, padding: GAP }}>
          <View
            className="flex-1"
            style={{ flex: 1 }}
            onLayout={(e) => setPageH(e.nativeEvent.layout.height)}
          >
            {pageH > 0 && (
              <Animated.FlatList
                data={quotes}
                extraData={editingId}
                keyExtractor={(q) => q.id}
                pagingEnabled
                scrollEnabled={editingId == null}
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
                removeClippedSubviews={false}
                renderItem={({ item }) => (
                  <View style={{ height: pageH, paddingBottom: GAP }}>
                    <QuoteCard
                      quote={item}
                      editing={editingId === item.id}
                      onEditingChange={(next) => setEditingId(next ? item.id : null)}
                    />
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
