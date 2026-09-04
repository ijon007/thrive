import { GlassView } from "expo-glass-effect";
import { SymbolView } from "expo-symbols";
import { useLayoutEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { QuoteCard } from "@/components/QuoteCard";
import { hasLiquidGlass } from "@/components/styled";
import { type Quote } from "@/constants/quotes";
import { colors, fonts } from "@/constants/theme";

const TILE_R = 18;
const DIALOG_R = 24;
export const TILE_GAP = 8;
const FEED_GAP = 12;

/** Matches the quote card size on the home feed. */
function feedCardSize(
  winW: number,
  winH: number,
  insets: { top: number; bottom: number },
) {
  const width = winW - FEED_GAP * 2;
  const height =
    winH - insets.top - (8 + 32 + 4) - insets.bottom - FEED_GAP * 3;
  return { width, height: Math.max(height, 280) };
}

const OPEN_SPRING = { duration: 480, dampingRatio: 0.86 } as const;
const CLOSE_SPRING = { duration: 380, dampingRatio: 0.95 } as const;

export type TileRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function QuoteTile({
  quote,
  scheme,
  hidden,
  onPress,
}: {
  quote: Quote;
  scheme: "light" | "dark";
  hidden?: boolean;
  onPress: (layout: TileRect) => void;
}) {
  const t = colors[scheme];
  const wrapRef = useRef<View>(null);

  return (
    <View
      ref={wrapRef}
      collapsable={false}
      style={{
        flexGrow: 1,
        flexBasis: "47%",
        maxWidth: "48.5%",
        aspectRatio: 1,
        opacity: hidden ? 0 : 1,
      }}
    >
      <GlassView
        isInteractive
        colorScheme={scheme}
        glassEffectStyle="regular"
        {...{ borderRadius: TILE_R }}
        style={{
          flex: 1,
          borderRadius: TILE_R,
          borderCurve: "continuous",
          ...(hasLiquidGlass
            ? {}
            : { backgroundColor: t.card, borderWidth: 1, borderColor: t.border }),
        }}
      >
        <Pressable
          onPress={() => {
            wrapRef.current?.measureInWindow((x, y, width, height) => {
              onPress({ x, y, width, height });
            });
          }}
          style={{ flex: 1 }}
        >
          <TileBody quote={quote} scheme={scheme} />
        </Pressable>
      </GlassView>
    </View>
  );
}

function TileBody({
  quote,
  scheme,
}: {
  quote: Quote;
  scheme: "light" | "dark";
}) {
  const t = colors[scheme];

  return (
    <View
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
            fontSize: 20,
            lineHeight: 28,
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
    </View>
  );
}

export function QuoteDialog({
  quote,
  source,
  scheme,
  onClose,
}: {
  quote: Quote | null;
  source: TileRect | null;
  scheme: "light" | "dark";
  onClose: () => void;
}) {
  const t = colors[scheme];
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const { width: destW, height: destH } = feedCardSize(winW, winH, insets);
  const [editing, setEditing] = useState(false);

  const closingRef = useRef(false);

  const progress = useSharedValue(0);
  const srcX = useSharedValue(0);
  const srcY = useSharedValue(0);
  const srcW = useSharedValue(0);
  const srcH = useSharedValue(0);
  const dstX = useSharedValue(0);
  const dstY = useSharedValue(0);
  const dstW = useSharedValue(destW);
  const dstH = useSharedValue(destH);

  useLayoutEffect(() => {
    if (!quote || !source) {
      setEditing(false);
      return;
    }
    closingRef.current = false;
    setEditing(false);
    srcX.value = source.x;
    srcY.value = source.y;
    srcW.value = source.width;
    srcH.value = source.height;
    dstW.value = destW;
    dstH.value = destH;
    dstX.value = (winW - destW) / 2;
    dstY.value = (winH - destH) / 2;
    progress.value = 0;
    if (reduceMotion) {
      progress.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
    } else {
      progress.value = withSpring(1, OPEN_SPRING);
    }
  }, [quote, source, destH, destW, dstH, dstW, dstX, dstY, insets.bottom, insets.top, progress, reduceMotion, srcH, srcW, srcX, srcY, winH, winW]);

  const finishClose = () => {
    closingRef.current = false;
    setEditing(false);
    onClose();
  };

  const requestClose = () => {
    if (!quote || closingRef.current || editing) return;
    closingRef.current = true;
    if (reduceMotion) {
      progress.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) }, (finished) => {
        if (finished) runOnJS(finishClose)();
      });
      return;
    }
    progress.value = withSpring(0, CLOSE_SPRING, (finished) => {
      if (finished) runOnJS(finishClose)();
    });
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  const cardStyle = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      position: "absolute" as const,
      left: interpolate(p, [0, 1], [srcX.value, dstX.value]),
      top: interpolate(p, [0, 1], [srcY.value, dstY.value]),
      width: interpolate(p, [0, 1], [srcW.value, dstW.value]),
      height: interpolate(p, [0, 1], [srcH.value, dstH.value]),
      borderRadius: interpolate(p, [0, 1], [TILE_R, DIALOG_R]),
      overflow: "hidden" as const,
      borderCurve: "continuous" as const,
    };
  });

  const tileContentStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const w = interpolate(p, [0, 1], [srcW.value, dstW.value]);
    const h = interpolate(p, [0, 1], [srcH.value, dstH.value]);
    return {
      opacity: interpolate(p, [0, 0.62, 0.82], [1, 1, 0], Extrapolation.CLAMP),
      left: (w - srcW.value) / 2,
      top: (h - srcH.value) / 2,
    };
  });

  const dialogContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.62, 0.82], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <Modal
      visible={quote != null}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={requestClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor:
                scheme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.28)",
            },
            backdropStyle,
          ]}
        >
          <Pressable onPress={requestClose} style={{ flex: 1 }} />
        </Animated.View>

        {quote ? (
          <Animated.View style={cardStyle}>
            {source ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  {
                    position: "absolute",
                    width: source.width,
                    height: source.height,
                  },
                  tileContentStyle,
                ]}
              >
                <GlassView
                  colorScheme={scheme}
                  glassEffectStyle="regular"
                  {...{ borderRadius: TILE_R }}
                  style={{
                    flex: 1,
                    borderRadius: TILE_R,
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
                  <TileBody quote={quote} scheme={scheme} />
                </GlassView>
              </Animated.View>
            ) : null}
            <Animated.View
              pointerEvents="auto"
              style={[StyleSheet.absoluteFill, dialogContentStyle]}
            >
              <QuoteCard
                quote={quote}
                editing={editing}
                onEditingChange={setEditing}
              />
            </Animated.View>
          </Animated.View>
        ) : null}
      </GestureHandlerRootView>
    </Modal>
  );
}
