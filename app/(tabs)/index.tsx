import { GlassView } from "expo-glass-effect";
import { useMinimizeOnScroll } from "expo-glass-tabs";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";

import { AnimatedView, hasLiquidGlass } from "@/components/styled";
import { QUOTES, type Quote } from "@/constants/quotes";
import type { QuoteBg } from "@/constants/quoteBackgrounds";
import { colors, fonts } from "@/constants/theme";
import { useQuoteBackground } from "@/contexts/QuoteBackgroundContext";
import { useSavedQuotes } from "@/contexts/SavedQuotesContext";
import { useTheme } from "@/contexts/ThemeContext";
import { saveImageToCameraRoll, shareImageFile } from "@/lib/shareQuote";

const GAP = 12;
const CARD_R = 24;

export default function HomeScreen() {
  const onScroll = useMinimizeOnScroll();
  const insets = useSafeAreaInsets();
  const { scheme } = useTheme();
  const { background } = useQuoteBackground();
  const t = colors[scheme];

  const [currentIndex, setCurrentIndex] = useState(0);
  const { savedIds, rollIds, toggleSave, markOnRoll } = useSavedQuotes();
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
        <Text
          className="text-[15px]"
          style={{
            color: t.mutedForeground,
            fontFamily: fonts.sans,
            marginTop: 2,
          }}
        >
          Daily quotes · {currentIndex + 1} / {QUOTES.length}
        </Text>
      </AnimatedView>

      <View
        className="flex-1"
        style={{ flex: 1, paddingBottom: insets.bottom }}
      >
        <View className="flex-1" style={{ flex: 1, padding: GAP }}>
          <View
            className="flex-1"
            style={{ flex: 1 }}
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
                removeClippedSubviews={false}
                renderItem={({ item }) => (
                  <View style={{ height: pageH, paddingBottom: GAP }}>
                    <QuoteCard
                      quote={item}
                      scheme={scheme}
                      background={background}
                      liked={savedIds.has(item.id)}
                      onRoll={rollIds.has(item.id)}
                      onToggleLike={() => {
                        void Haptics.impactAsync(
                          Haptics.ImpactFeedbackStyle.Light,
                        );
                        toggleSave(item.id);
                      }}
                      onSavedToRoll={() => markOnRoll(item.id)}
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

function QuoteCard({
  quote,
  scheme,
  background,
  liked,
  onRoll,
  onToggleLike,
  onSavedToRoll,
}: {
  quote: Quote;
  scheme: "light" | "dark";
  background: QuoteBg;
  liked: boolean;
  onRoll: boolean;
  onToggleLike: () => void;
  onSavedToRoll: () => void;
}) {
  const t = colors[scheme];
  const themed = background.id !== "minimal";
  const ink = themed ? background.ink : t.foreground;
  const muted = themed ? background.muted : t.mutedForeground;
  const chipBg = themed ? background.chipBg : t.secondary;
  const chipFg = themed ? background.chipFg : t.secondaryForeground;
  const iconColor = themed ? muted : t.iconDefault;
  const shotRef = useRef<View>(null);
  const busy = useRef(false);

  const snapshot = async () => {
    const view = shotRef.current;
    if (!view) throw new Error("Quote view not ready");
    return captureRef(view, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });
  };

  const onSaveToRoll = async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const uri = await snapshot();
      const ok = await saveImageToCameraRoll(uri, quote.author);
      if (!ok) {
        Alert.alert(
          "Photos",
          "Allow Thrive to add this quote to your photo library.",
        );
        return;
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSavedToRoll();
    } catch {
      Alert.alert("Save failed", "Could not save this quote to Photos.");
    } finally {
      busy.current = false;
    }
  };

  const onShare = async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      await shareImageFile(await snapshot(), quote.author);
    } catch {
      Alert.alert("Share failed", "Could not share this quote.");
    } finally {
      busy.current = false;
    }
  };

  const art = (
    <View
      ref={shotRef}
      collapsable={false}
      style={{
        flex: 1,
        backgroundColor: themed ? undefined : t.card,
      }}
    >
      {themed && background.source ? (
        <Image
          source={background.source}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : null}
      {themed ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: background.scrim }]}
        />
      ) : null}
      <View className="flex-1 justify-center p-7 pr-16 gap-3.5">
        <SymbolView
          name="quote.opening"
          size={28}
          tintColor={muted}
          style={{ opacity: 0.45, marginBottom: 2 }}
        />
        <Text
          className="text-[26px] leading-[38px] tracking-tight"
          style={{ color: ink, fontFamily: fonts.serif }}
        >
          {quote.text}
        </Text>
        <Text
          className="text-sm font-medium tracking-wide"
          style={{ color: muted, fontFamily: fonts.sans }}
        >
          — {quote.author}
        </Text>
        <View
          className="self-start px-3 py-1.5 rounded-full mt-0.5"
          style={{ backgroundColor: chipBg }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: chipFg, fontFamily: fonts.sans }}
          >
            {quote.category}
          </Text>
        </View>
      </View>
    </View>
  );

  const buttons = (
    <View
      pointerEvents="box-none"
      style={[
        StyleSheet.absoluteFill,
        { justifyContent: "flex-end", alignItems: "flex-end" },
      ]}
    >
      <View className="justify-end items-center py-6 pr-1.5 gap-5">
        <SideButton
          icon={liked ? "heart.fill" : "heart"}
          label={liked ? "Liked" : "Like"}
          color={liked ? "#E5484D" : iconColor}
          onPress={onToggleLike}
        />
        <SideButton
          icon={onRoll ? "checkmark.circle.fill" : "arrow.down.to.line"}
          label={onRoll ? "Saved" : "Save"}
          color={onRoll ? t.iconActive : iconColor}
          onPress={() => void onSaveToRoll()}
        />
        <SideButton
          icon="square.and.arrow.up"
          label="Share"
          color={iconColor}
          onPress={() => void onShare()}
        />
      </View>
    </View>
  );

  if (!themed) {
    return (
      <GlassView
        isInteractive
        colorScheme={scheme}
        glassEffectStyle="regular"
        style={{
          flex: 1,
          width: "100%",
          borderRadius: CARD_R,
          borderCurve: "continuous",
          overflow: "hidden",
          ...(hasLiquidGlass
            ? {}
            : {
                backgroundColor: t.card,
                borderWidth: 1,
                borderColor: t.quoteBorder,
              }),
        }}
      >
        {art}
        {buttons}
      </GlassView>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        borderRadius: CARD_R,
        borderCurve: "continuous",
        overflow: "hidden",
      }}
    >
      {art}
      {buttons}
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
        <SymbolView name={icon as never} size={24} tintColor={color} />
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
