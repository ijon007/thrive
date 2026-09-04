import { Host, Slider, Switch } from "@expo/ui";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Switch as RNSwitch,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { GlassPad } from "@/components/GlassPad";
import {
  QUOTE_FONTS,
  QUOTE_SIZE_MAX,
  QUOTE_SIZE_MIN,
  type QuoteInk,
  type QuoteStyle,
  type QuoteTextAlign,
} from "@/constants/quoteStyle";
import { fonts } from "@/constants/theme";

export type StyleTab = "text" | "look" | "photo";

const DOCK_R = 28;

export function QuoteStyleDock({
  chrome,
  tab,
  onTab,
  draft,
  onPatch,
  customPhoto,
  photoUri,
  onChangePhoto,
  onRemovePhoto,
  onHeight,
  glass,
  glassDuration,
  progress,
}: {
  chrome: "light" | "dark";
  tab: StyleTab;
  onTab: (t: StyleTab) => void;
  draft: QuoteStyle;
  onPatch: (patch: Partial<QuoteStyle>) => void;
  customPhoto: boolean;
  photoUri?: string;
  onChangePhoto: () => void;
  onRemovePhoto: () => void;
  onHeight: (h: number) => void;
  glass: "regular" | "none";
  glassDuration: number;
  progress: SharedValue<number>;
}) {
  const ink = chrome === "dark" ? "#F5F5F7" : "#1C1C1E";
  const faint = chrome === "dark" ? "rgba(245,245,247,0.42)" : "rgba(28,28,30,0.38)";
  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.28, 1], [0, 0.2, 1]),
  }));

  return (
    <View
      onLayout={(e) => onHeight(e.nativeEvent.layout.height)}
      style={{ paddingHorizontal: 12, paddingBottom: 12 }}
    >
      <GlassPad
        scheme={chrome}
        radius={DOCK_R}
        effect={glass}
        animate
        durationSec={glassDuration}
        style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 }}
      >
        <Animated.View style={contentStyle}>
        {tab === "text" ? (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row" }}>
              {QUOTE_FONTS.map((f) => {
                const on = draft.fontId === f.id;
                return (
                  <Pressable
                    key={f.id}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      onPatch({ fontId: f.id });
                    }}
                    style={{
                      flex: 1,
                      height: 40,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: f.family,
                        fontSize: 22,
                        color: on ? ink : faint,
                      }}
                    >
                      Ag
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={{ fontFamily: fonts.serif, fontSize: 12, color: faint }}>A</Text>
              <GlassSlider
                chrome={chrome}
                value={draft.size}
                min={QUOTE_SIZE_MIN}
                max={QUOTE_SIZE_MAX}
                onChange={(size) => onPatch({ size })}
              />
              <Text style={{ fontFamily: fonts.serifBold, fontSize: 18, color: ink }}>A</Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row" }}>
                {(["left", "center", "right"] as const).map((align) => (
                  <ToolIcon
                    key={align}
                    name={
                      align === "left"
                        ? "text.alignleft"
                        : align === "center"
                          ? "text.aligncenter"
                          : "text.alignright"
                    }
                    on={draft.align === align}
                    color={ink}
                    faint={faint}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      onPatch({ align: align as QuoteTextAlign });
                    }}
                  />
                ))}
              </View>
              <View style={{ flexDirection: "row", gap: 12, alignItems: "center", paddingRight: 4 }}>
                {(
                  [
                    { id: "auto" as const, fill: chrome === "dark" ? "#3A3A3C" : "#E8E4DD" },
                    { id: "light" as const, fill: "#F4F1EA" },
                    { id: "dark" as const, fill: "#1A1A1A" },
                  ] satisfies { id: QuoteInk; fill: string }[]
                ).map((c) => {
                  const on = draft.ink === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => {
                        void Haptics.selectionAsync();
                        onPatch({ ink: c.id });
                      }}
                      hitSlop={8}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: c.fill,
                        borderWidth: on ? 2 : StyleSheet.hairlineWidth,
                        borderColor: on ? ink : faint,
                      }}
                    />
                  );
                })}
              </View>
            </View>
          </View>
        ) : null}

        {tab === "look" ? (
          <View style={{ gap: 16, paddingTop: 2 }}>
            <View style={{ paddingHorizontal: 0 }}>
              {(
                [
                  { key: "showMark" as const, icon: "quote.opening", label: "Quote mark" },
                  { key: "showAuthor" as const, icon: "person.fill", label: "Author" },
                  { key: "showCategory" as const, icon: "tag.fill", label: "Category" },
                ] as const
              ).map((item, i, arr) => {
                const on = draft[item.key];
                return (
                  <View
                    key={item.key}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      minHeight: 44,
                      gap: 12,
                      borderBottomWidth: i === arr.length - 1 ? 0 : StyleSheet.hairlineWidth,
                      borderBottomColor: chrome === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        void Haptics.selectionAsync();
                        onPatch({ [item.key]: !on });
                      }}
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        paddingVertical: 6,
                        minWidth: 0,
                      }}
                    >
                      <SymbolView name={item.icon} size={16} tintColor={on ? ink : faint} />
                      <Text
                        numberOfLines={1}
                        style={{
                          color: ink,
                          fontFamily: fonts.sans,
                          fontSize: 16,
                          letterSpacing: 0.15,
                        }}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                    <LookSwitch
                      chrome={chrome}
                      value={on}
                      onValueChange={(v) => {
                        void Haptics.selectionAsync();
                        onPatch({ [item.key]: v });
                      }}
                    />
                  </View>
                );
              })}
            </View>
            <GlassSlider
              chrome={chrome}
              value={draft.scrim}
              min={0}
              max={0.72}
              onChange={(scrim) => onPatch({ scrim })}
            />
          </View>
        ) : null}

        {tab === "photo" ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              paddingVertical: 6,
            }}
          >
            <View>
              <Pressable onPress={onChangePhoto}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    borderCurve: "continuous",
                    overflow: "hidden",
                    backgroundColor: chrome === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {customPhoto && photoUri ? (
                    <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  ) : (
                    <SymbolView name="camera" size={22} tintColor={ink} />
                  )}
                </View>
              </Pressable>
              {customPhoto ? (
                <Pressable
                  onPress={onRemovePhoto}
                  hitSlop={6}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: chrome === "dark" ? "rgba(28,28,30,0.9)" : "rgba(28,28,30,0.78)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SymbolView name="xmark" size={9} tintColor="#FFFFFF" />
                </Pressable>
              ) : null}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: ink, fontFamily: fonts.sans, fontSize: 16 }}>
                {customPhoto ? "Photo" : "Add a photo"}
              </Text>
              <Text style={{ color: faint, fontFamily: fonts.sans, fontSize: 13 }}>
                {customPhoto ? "Tap to change" : "Only on this quote"}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 14, paddingTop: 4 }}>
          {(
            [
              { id: "text", icon: "textformat" },
              { id: "look", icon: "circle.lefthalf.filled" },
              { id: "photo", icon: "camera" },
            ] as const
          ).map((item) => {
            const on = tab === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  void Haptics.selectionAsync();
                  onTab(item.id);
                }}
                style={{
                  width: 56,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SymbolView name={item.icon} size={18} tintColor={on ? ink : faint} />
              </Pressable>
            );
          })}
        </View>
        </Animated.View>
      </GlassPad>
    </View>
  );
}

const SELECT_BLUE = "#007AFF";
const IOS_SWITCH = { width: 51, height: 31 };

function LookSwitch({
  chrome,
  value,
  onValueChange,
}: {
  chrome: "light" | "dark";
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  if (Platform.OS === "ios") {
    return (
      <View style={[IOS_SWITCH, { flexShrink: 0 }]}>
        <Host colorScheme={chrome} seedColor={SELECT_BLUE} style={IOS_SWITCH}>
          <Switch value={value} onValueChange={onValueChange} />
        </Host>
      </View>
    );
  }
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ true: SELECT_BLUE }}
    />
  );
}

function ToolIcon({
  name,
  on,
  color,
  faint,
  onPress,
}: {
  name: string;
  on: boolean;
  color: string;
  faint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 40,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
      }}
    >
      <SymbolView name={name as "text.alignleft"} size={16} tintColor={on ? color : faint} />
    </Pressable>
  );
}

function GlassSlider({
  chrome,
  value,
  min,
  max,
  onChange,
}: {
  chrome: "light" | "dark";
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  if (Platform.OS === "ios") {
    return (
      <View style={{ flex: 1, height: 31, justifyContent: "center" }}>
        <Host colorScheme={chrome} style={{ height: 31, width: "100%" }}>
          <Slider value={value} min={min} max={max} onValueChange={onChange} />
        </Host>
      </View>
    );
  }
  return <HairSlider chrome={chrome} value={value} min={min} max={max} onChange={onChange} />;
}

function HairSlider({
  chrome,
  value,
  min,
  max,
  onChange,
}: {
  chrome: "light" | "dark";
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  const width = useSharedValue(1);
  const start = useSharedValue(value);
  const [trackW, setTrackW] = useState(1);
  const track = chrome === "dark" ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.14)";
  const fill = chrome === "dark" ? "rgba(255,255,255,0.92)" : "rgba(28,28,30,0.88)";

  const apply = (n: number) => {
    onChange(Math.min(max, Math.max(min, n)));
  };

  const pan = Gesture.Pan()
    .onBegin((e) => {
      const w = width.value || 1;
      start.value = min + (e.x / w) * (max - min);
      runOnJS(apply)(start.value);
    })
    .onUpdate((e) => {
      const w = width.value || 1;
      runOnJS(apply)(start.value + (e.translationX / w) * (max - min));
    });

  const pct = (value - min) / (max - min);
  const thumb = 28;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        hitSlop={14}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          width.value = w;
          setTrackW(w);
        }}
        style={{ flex: 1, height: 36, justifyContent: "center" }}
      >
        <View style={{ height: 3, borderRadius: 1.5, backgroundColor: track, overflow: "hidden" }}>
          <View
            style={{
              width: `${Math.min(100, Math.max(0, pct * 100))}%`,
              height: 3,
              backgroundColor: fill,
            }}
          />
        </View>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: Math.max(0, pct * Math.max(0, trackW - thumb)),
            width: thumb,
            height: thumb,
          }}
        >
          <GlassPad scheme={chrome} radius={thumb / 2} style={{ width: thumb, height: thumb }} />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
