import { useMinimizeOnScroll } from "expo-glass-tabs";
import { SymbolView } from "expo-symbols";
import { useCallback, useLayoutEffect, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
    Easing,
    FadeIn,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedView } from "@/components/styled";
import { QUOTES, type Quote } from "@/constants/quotes";
import { colors, fonts } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_MS = 200;
const SWIPE_EASE = Easing.out(Easing.cubic);

export default function HomeScreen() {
  useMinimizeOnScroll(); // ponytail: keep tab-bar hook alive even without a scroll view
  const insets = useSafeAreaInsets();
  const { scheme } = useTheme();
  const t = colors[scheme];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const translateX = useSharedValue(0);

  const n = QUOTES.length;
  const quote = QUOTES[currentIndex];
  const prevQuote = QUOTES[(currentIndex - 1 + n) % n];
  const nextQuote = QUOTES[(currentIndex + 1) % n];

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % QUOTES.length);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + QUOTES.length) % QUOTES.length);
  }, []);

  // Reset after index commit so the incoming card (already at center) stays put — no snap-then-swap.
  useLayoutEffect(() => {
    translateX.value = 0;
  }, [currentIndex, translateX]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD || e.velocityX < -500) {
        translateX.value = withTiming(
          -SCREEN_WIDTH,
          { duration: SWIPE_MS, easing: SWIPE_EASE },
          (finished) => {
            if (finished) runOnJS(goNext)();
          },
        );
      } else if (e.translationX > SWIPE_THRESHOLD || e.velocityX > 500) {
        translateX.value = withTiming(
          SCREEN_WIDTH,
          { duration: SWIPE_MS, easing: SWIPE_EASE },
          (finished) => {
            if (finished) runOnJS(goPrev)();
          },
        );
      } else {
        translateX.value = withTiming(0, { duration: 160, easing: SWIPE_EASE });
      }
    });

  const currentAnim = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      {
        rotateZ: `${interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [-6, 0, 6])}deg`,
      },
    ],
  }));

  const prevAnim = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value - SCREEN_WIDTH }],
  }));

  const nextAnim = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value + SCREEN_WIDTH }],
  }));

  const toggleSave = useCallback(() => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(quote.id)) next.delete(quote.id);
      else next.add(quote.id);
      return next;
    });
  }, [quote.id]);

  const isSaved = saved.has(quote.id);
  const cardShell = {
    backgroundColor: t.card,
    borderColor: t.quoteBorder,
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ flex: 1, backgroundColor: t.background }}
    >
      <AnimatedView
        entering={FadeIn.duration(500).delay(100)}
        className="px-5 pb-2 flex-row items-baseline justify-between"
        style={{ paddingTop: insets.top + 8 }}
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
        className="flex-1 mx-3 mt-1"
        style={{ marginBottom: insets.bottom + 96, overflow: "hidden" }}
      >
        <GestureDetector gesture={panGesture}>
          <AnimatedView className="flex-1">
            <AnimatedView
              pointerEvents="none"
              className="absolute inset-0 rounded-3xl border overflow-hidden flex-row"
              style={[cardShell, prevAnim]}
            >
              <QuoteBody quote={prevQuote} scheme={scheme} />
            </AnimatedView>
            <AnimatedView
              className="absolute inset-0 rounded-3xl border overflow-hidden flex-row"
              style={[cardShell, currentAnim]}
            >
              <QuoteBody
                quote={quote}
                scheme={scheme}
                saved={isSaved}
                onToggleSave={toggleSave}
              />
            </AnimatedView>
            <AnimatedView
              pointerEvents="none"
              className="absolute inset-0 rounded-3xl border overflow-hidden flex-row"
              style={[cardShell, nextAnim]}
            >
              <QuoteBody quote={nextQuote} scheme={scheme} />
            </AnimatedView>
          </AnimatedView>
        </GestureDetector>
      </View>

      <AnimatedView
        entering={FadeIn.duration(700).delay(900)}
        className="absolute self-center"
        style={{ bottom: insets.bottom + 104 }}
      >
        <Text
          className="text-[11px] tracking-widest uppercase"
          style={{ color: t.mutedForeground, fontFamily: fonts.sans }}
        >
          Swipe to browse
        </Text>
      </AnimatedView>
    </View>
  );
}

function QuoteBody({
  quote,
  scheme,
  saved,
  onToggleSave,
}: {
  quote: Quote;
  scheme: "light" | "dark";
  saved?: boolean;
  onToggleSave?: () => void;
}) {
  const t = colors[scheme];
  return (
    <>
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
            style={{
              color: t.secondaryForeground,
              fontFamily: fonts.sans,
            }}
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
          onPress={onToggleSave ?? (() => {})}
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
    </>
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
