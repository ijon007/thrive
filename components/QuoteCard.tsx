import { GlassView } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { captureRef } from "react-native-view-shot";

import { QuoteStyleDock, type StyleTab } from "@/components/QuoteStyleDock";
import { GlassPad } from "@/components/GlassPad";
import { AnimatedView, hasLiquidGlass } from "@/components/styled";
import type { Quote } from "@/constants/quotes";
import {
  DEFAULT_PHOTO_SCRIM,
  INK_DARK,
  INK_DARK_MUTED,
  INK_LIGHT,
  INK_LIGHT_MUTED,
  fontFamilyFor,
  inkIsLight,
  resolveStyle,
  scrimRgba,
  axisRange,
  axisRest,
  snapAxis,
  surfaceChrome,
  type QuoteStyle,
} from "@/constants/quoteStyle";
import { colors, fonts } from "@/constants/theme";
import { useQuoteAppearance } from "@/contexts/QuoteAppearanceContext";
import { useQuoteBackground } from "@/contexts/QuoteBackgroundContext";
import { useQuotePhotos } from "@/contexts/QuotePhotosContext";
import { useQuoteStyles } from "@/contexts/QuoteStylesContext";
import { useSavedQuotes } from "@/contexts/SavedQuotesContext";
import { useTheme } from "@/contexts/ThemeContext";
import { CUSTOM_PHOTO_LOOK } from "@/lib/quotePhoto";
import { saveImageToCameraRoll, shareImageFile } from "@/lib/shareQuote";

// ponytail: CARD_R = DOCK_R (28) + dock inset (12) for concentric corners
const CARD_R = 40;
const PAD = 24;
const EDIT_TOP = 68;
const OPEN_SPRING = { duration: 360, dampingRatio: 1 } as const;
const CLOSE_SPRING = { duration: 280, dampingRatio: 1 } as const;
const GLASS_OPEN_S = 0.36;
const GLASS_CLOSE_S = 0.28;

function clampW(n: number, a: number, b: number) {
  "worklet";
  return Math.min(b, Math.max(a, n));
}

export function QuoteCard({
  quote,
  editing,
  onEditingChange,
}: {
  quote: Quote;
  editing: boolean;
  onEditingChange: (next: boolean) => void;
}) {
  const { scheme } = useTheme();
  const t = colors[scheme];
  const { background } = useQuoteBackground();
  const { appearance } = useQuoteAppearance();
  const { savedIds, rollIds, toggleSave, markOnRoll } = useSavedQuotes();
  const { photoUris, choosePhoto, clearPhoto } = useQuotePhotos();
  const { styles, setQuoteStyle, clearQuoteStyle } = useQuoteStyles();

  const customPhotoUri = photoUris[quote.id];
  const custom = customPhotoUri != null;
  const stored = styles[quote.id];
  const liked = savedIds.has(quote.id);
  const onRoll = rollIds.has(quote.id);

  const [draft, setDraft] = useState<QuoteStyle>(() =>
    resolveStyle(stored, appearance, background.scrim, custom),
  );
  const [tab, setTab] = useState<StyleTab>("text");
  const [dockH, setDockH] = useState(148);
  const [canvas, setCanvas] = useState({ w: 0, h: 0 });
  const [block, setBlock] = useState({ w: 0, h: 0 });
  const [sheet, setSheet] = useState(editing);
  const [glass, setGlass] = useState<"regular" | "none">(editing ? "regular" : "none");
  const reduceMotion = useReducedMotion();
  const open = useSharedValue(editing ? 1 : 0);
  const glassDuration = editing ? GLASS_OPEN_S : GLASS_CLOSE_S;
  const editingRef = useRef(editing);
  const openedRef = useRef(editing);
  editingRef.current = editing;

  const live = editing ? draft : resolveStyle(stored, appearance, background.scrim, custom);

  useEffect(() => {
    if (editing) return;
    setDraft(resolveStyle(stored, appearance, background.scrim, custom));
  }, [appearance, background.scrim, custom, editing, stored]);

  useEffect(() => {
    const hideIfIdle = () => {
      if (editingRef.current) return;
      openedRef.current = false;
      setSheet(false);
    };
    if (editing) {
      openedRef.current = true;
      setSheet(true);
      const id = requestAnimationFrame(() => {
        setGlass("regular");
        open.value = reduceMotion
          ? withTiming(1, { duration: 160, easing: Easing.out(Easing.quad) })
          : withSpring(1, OPEN_SPRING);
      });
      return () => cancelAnimationFrame(id);
    }
    setGlass("none");
    if (!openedRef.current) return;
    const finish = (done?: boolean) => {
      if (done) runOnJS(hideIfIdle)();
    };
    open.value = reduceMotion
      ? withTiming(0, { duration: 160, easing: Easing.out(Easing.quad) }, finish)
      : withSpring(0, CLOSE_SPRING, finish);
  }, [editing, open, reduceMotion]);

  const dockMotion = useAnimatedStyle(() => {
    const p = open.value;
    return {
      transform: reduceMotion
        ? [{ scale: 1 }]
        : [{ translateY: interpolate(p, [0, 1], [28, 0]) }, { scale: interpolate(p, [0, 1], [0.96, 1]) }],
      ...(hasLiquidGlass ? {} : { opacity: p }),
    };
  });

  const topMotion = useAnimatedStyle(() => {
    const p = open.value;
    return {
      transform: reduceMotion
        ? [{ scale: 1 }]
        : [{ translateY: interpolate(p, [0, 1], [-16, 0]) }, { scale: interpolate(p, [0, 1], [0.96, 1]) }],
      ...(hasLiquidGlass ? {} : { opacity: p }),
    };
  });

  const buttonsFade = useAnimatedStyle(() => ({
    opacity: interpolate(open.value, [0, 1], [1, 0]),
  }));

  const themed = custom || background.source != null || background.fill != null;
  const look = custom ? CUSTOM_PHOTO_LOOK : background;
  const lightText = inkIsLight(live.ink, look.ink || t.foreground);
  const ink =
    live.ink === "light" ? INK_LIGHT : live.ink === "dark" ? INK_DARK : themed ? look.ink : t.foreground;
  const muted =
    live.ink === "light"
      ? INK_LIGHT_MUTED
      : live.ink === "dark"
        ? INK_DARK_MUTED
        : themed
          ? look.muted
          : t.mutedForeground;
  const chipBg = themed ? look.chipBg : t.secondary;
  const chipFg = themed ? look.chipFg : t.secondaryForeground;
  const iconColor = themed ? muted : t.iconDefault;
  const scrim = scrimRgba(lightText, live.scrim);
  const chrome = surfaceChrome(look.ink, t.foreground);
  const guide = chrome === "dark" ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.2)";

  const padT = sheet ? EDIT_TOP : PAD;
  const padB = sheet ? dockH + 8 : PAD;
  const maxBlockW = Math.max(96, canvas.w - PAD * 2);

  // Action buttons overlay the card; text uses full width with symmetric padding.
  const rangeX = axisRange(canvas.w, PAD, PAD, block.w);
  const rangeY = axisRange(canvas.h, PAD, PAD, block.h);
  const restLeft = axisRest(PAD, rangeX, live.ax);
  const restTop = axisRest(PAD, rangeY, live.ay);
  const dragMinY = padT;
  const dragMaxY = Math.max(dragMinY, canvas.h - padB - block.h);
  const dragMaxX = PAD + rangeX;

  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const minX = useSharedValue(PAD);
  const maxX = useSharedValue(PAD);
  const minY = useSharedValue(PAD);
  const maxY = useSharedValue(PAD);
  const dragging = useSharedValue(0);
  const draggingRef = useRef(false);

  useEffect(() => {
    minX.value = PAD;
    maxX.value = dragMaxX;
    minY.value = dragMinY;
    maxY.value = dragMaxY;
    if (draggingRef.current) return;
    x.value = sheet ? Math.min(Math.max(restLeft, PAD), dragMaxX) : restLeft;
    y.value = sheet ? Math.min(Math.max(restTop, dragMinY), dragMaxY) : restTop;
  }, [dragMaxX, dragMaxY, dragMinY, maxX, maxY, minX, minY, restLeft, restTop, sheet, x, y]);

  const commitPos = (left: number, top: number) => {
    draggingRef.current = false;
    const ax = snapAxis(rangeX <= 0 ? live.ax : (left - PAD) / rangeX);
    const ay = snapAxis(rangeY <= 0 ? live.ay : (top - PAD) / rangeY);
    if (ax !== live.ax && (ax === 0 || ax === 0.5 || ax === 1)) {
      void Haptics.selectionAsync();
    } else if (ay !== live.ay && (ay === 0 || ay === 0.5 || ay === 1)) {
      void Haptics.selectionAsync();
    }
    setDraft((prev) => ({ ...prev, ax, ay }));
  };

  const setDragging = (v: boolean) => {
    draggingRef.current = v;
  };

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(editing)
        .onStart(() => {
          startX.value = x.value;
          startY.value = y.value;
          dragging.value = 1;
          runOnJS(setDragging)(true);
        })
        .onUpdate((e) => {
          x.value = clampW(startX.value + e.translationX, minX.value, maxX.value);
          y.value = clampW(startY.value + e.translationY, minY.value, maxY.value);
        })
        .onEnd(() => {
          dragging.value = 0;
          runOnJS(commitPos)(x.value, y.value);
        })
        .onFinalize(() => {
          dragging.value = 0;
        }),
    // ponytail: gesture closes over live/range; recreated when layout or edit mode changes
    [editing, live.ax, live.ay, rangeX, rangeY],
  );

  const textPos = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  const gridStyle = useAnimatedStyle(() => ({
    opacity: dragging.value,
  }));

  const shotRef = useRef<View>(null);
  const busy = useRef(false);

  const snapshot = async () => {
    const view = shotRef.current;
    if (!view) throw new Error("Quote view not ready");
    return captureRef(view, { format: "png", quality: 1, result: "tmpfile" });
  };

  const onSaveToRoll = async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const uri = await snapshot();
      const ok = await saveImageToCameraRoll(uri, quote.author);
      if (!ok) {
        Alert.alert("Photos", "Allow Thrive to add this quote to your photo library.");
        return;
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      markOnRoll(quote.id);
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

  const runChoosePhoto = async () => {
    const status = await choosePhoto(quote.id);
    if (status === "denied") {
      Alert.alert("Photos", "Allow Thrive to use a photo as this quote’s background.");
      return;
    }
    if (status === "picked") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setDraft((prev) => ({
        ...prev,
        scrim: prev.scrim < 0.15 ? DEFAULT_PHOTO_SCRIM : prev.scrim,
      }));
      if (!editing) {
        setTab("text");
        onEditingChange(true);
      }
    }
  };

  const enterStyle = () => {
    setDraft(resolveStyle(stored, appearance, background.scrim, custom));
    setTab("text");
    onEditingChange(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onCancel = () => {
    setDraft(resolveStyle(stored, appearance, background.scrim, custom));
    onEditingChange(false);
  };

  const onDone = () => {
    setQuoteStyle(quote.id, draft);
    onEditingChange(false);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onReset = () => {
    clearQuoteStyle(quote.id);
    const next = resolveStyle(undefined, appearance, background.scrim, custom);
    setDraft(next);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const quoteSize = Math.round(26 * live.size);
  const quoteLine = Math.round(38 * live.size);
  const family = fontFamilyFor(live.fontId);

  const textBlock = (
    <View
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width !== block.w || height !== block.h) setBlock({ w: width, h: height });
      }}
      style={{
        maxWidth: maxBlockW,
        alignItems:
          live.align === "center" ? "center" : live.align === "right" ? "flex-end" : "flex-start",
        gap: 10,
      }}
    >
      {live.showMark ? (
        <SymbolView
          name="quote.opening"
          size={28}
          tintColor={muted}
          style={{ opacity: 0.45, marginBottom: 2 }}
        />
      ) : null}
      <Text
        style={{
          color: ink,
          fontFamily: family,
          fontSize: quoteSize,
          lineHeight: quoteLine,
          letterSpacing: live.fontId === "mono" ? 0 : -0.3,
          textAlign: live.align,
          textShadowColor: lightText ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.25)",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: themed || custom ? 8 : 0,
        }}
      >
        {quote.text}
      </Text>
      {live.showAuthor ? (
        <Text
          style={{
            color: muted,
            fontFamily: fonts.sans,
            fontSize: 14,
            fontWeight: "500",
            letterSpacing: 0.3,
            textAlign: live.align,
          }}
        >
          — {quote.author}
        </Text>
      ) : null}
      {live.showCategory ? (
        <View
          className="px-3 py-1.5 rounded-full mt-0.5"
          style={{ backgroundColor: chipBg }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: chipFg, fontFamily: fonts.sans }}
          >
            {quote.category}
          </Text>
        </View>
      ) : null}
    </View>
  );

  const art = (
    <View
      ref={shotRef}
      collapsable={false}
      style={{
        flex: 1,
        backgroundColor: custom
          ? undefined
          : themed
            ? (background.fill ?? undefined)
            : t.card,
      }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width !== canvas.w || height !== canvas.h) setCanvas({ w: width, h: height });
      }}
    >
      {custom ? (
        <Image
          source={{ uri: customPhotoUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : themed && background.source ? (
        <Image
          source={background.source}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : null}
      {scrim !== "transparent" ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: scrim }]}
        />
      ) : null}
      {canvas.w > 0 ? (
        editing ? (
          <GestureDetector gesture={pan}>
            <Animated.View style={[{ position: "absolute", left: 0, top: 0 }, textPos]}>
              {textBlock}
            </Animated.View>
          </GestureDetector>
        ) : (
          <Animated.View
            pointerEvents="none"
            style={[{ position: "absolute", left: 0, top: 0 }, textPos]}
          >
            {textBlock}
          </Animated.View>
        )
      ) : null}
    </View>
  );

  const buttons = (
    <Animated.View
      pointerEvents={sheet ? "none" : "box-none"}
      style={[
        StyleSheet.absoluteFill,
        { zIndex: 2, justifyContent: "flex-end", alignItems: "flex-end" },
        buttonsFade,
      ]}
    >
      <View className="justify-end items-center py-6 pr-1.5 gap-5">
        <SideButton
          icon={liked ? "heart.fill" : "heart"}
          label={liked ? "Liked" : "Like"}
          color={liked ? "#E5484D" : iconColor}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            toggleSave(quote.id);
          }}
        />
        <SideButton icon="textformat" label="Style" color={iconColor} onPress={enterStyle} />
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
    </Animated.View>
  );

  const editor = (
    <View pointerEvents={editing ? "box-none" : "none"} style={[StyleSheet.absoluteFill, { zIndex: 3 }]}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, gridStyle]}>
        <View
          style={{
            position: "absolute",
            top: "50%",
            left: "18%",
            right: "18%",
            height: StyleSheet.hairlineWidth,
            backgroundColor: guide,
          }}
        />
        <View
          style={{
            position: "absolute",
            left: "50%",
            top: "22%",
            bottom: "28%",
            width: StyleSheet.hairlineWidth,
            backgroundColor: guide,
          }}
        />
      </Animated.View>

      <Animated.View
        pointerEvents="box-none"
        style={[
          {
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            transformOrigin: "50% 0%",
          },
          topMotion,
        ]}
      >
        <View style={{ flexDirection: "row", gap: 12 }}>
          <GlassIconButton
            scheme={chrome}
            icon="xmark"
            onPress={onCancel}
            glass={glass}
            glassDuration={glassDuration}
            progress={open}
          />
          <GlassIconButton
            scheme={chrome}
            icon="arrow.counterclockwise"
            onPress={onReset}
            glass={glass}
            glassDuration={glassDuration}
            progress={open}
          />
        </View>
        <GlassIconButton
          scheme={chrome}
          icon="checkmark"
          onPress={onDone}
          glass={glass}
          glassDuration={glassDuration}
          progress={open}
        />
      </Animated.View>

      <View style={{ flex: 1 }} />
      <Animated.View style={[{ transformOrigin: "50% 100%" }, dockMotion]}>
        <QuoteStyleDock
          chrome={chrome}
          tab={tab}
          onTab={setTab}
          draft={draft}
          onPatch={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
          customPhoto={custom}
          photoUri={customPhotoUri}
          onChangePhoto={() => void runChoosePhoto()}
          onRemovePhoto={() => {
            clearPhoto(quote.id);
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onHeight={setDockH}
          glass={glass}
          glassDuration={glassDuration}
          progress={open}
        />
      </Animated.View>
    </View>
  );

  const frame = {
    flex: 1,
    width: "100%" as const,
    borderRadius: CARD_R,
    borderCurve: "continuous" as const,
    overflow: "hidden" as const,
  };

  // ponytail: nested GlassView eats sibling glass; keep dock/chrome outside the card effect
  const surface =
    !themed && !custom ? (
      <GlassView
        isInteractive
        colorScheme={scheme}
        glassEffectStyle="regular"
        style={{
          ...frame,
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
    ) : (
      <View style={frame}>
        {art}
        {buttons}
      </View>
    );

  return (
    <View style={{ flex: 1, width: "100%" }}>
      {surface}
      {sheet ? editor : null}
    </View>
  );
}

function GlassIconButton({
  scheme,
  icon,
  onPress,
  glass,
  glassDuration,
  progress,
}: {
  scheme: "light" | "dark";
  icon: string;
  onPress: () => void;
  glass: "regular" | "none";
  glassDuration: number;
  progress: SharedValue<number>;
}) {
  const tint = scheme === "dark" ? "#F5F5F7" : "#1C1C1E";
  const fade = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.28, 1], [0, 0.2, 1]),
  }));

  return (
    <GlassPad
      scheme={scheme}
      radius={22}
      effect={glass}
      animate
      durationSec={glassDuration}
      style={{ width: 44, height: 44 }}
    >
      <Pressable
        onPress={onPress}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Animated.View style={fade}>
          <SymbolView name={icon as never} size={17} tintColor={tint} />
        </Animated.View>
      </Pressable>
    </GlassPad>
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
        <Text className="text-[10px] font-medium" style={{ color, fontFamily: "DMSans" }}>
          {label}
        </Text>
      </AnimatedView>
    </Pressable>
  );
}
