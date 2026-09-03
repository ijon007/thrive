import AsyncStorage from "@react-native-async-storage/async-storage";
import { Host, Switch } from "@expo/ui";
import { GlassView } from "expo-glass-effect";
import { useMinimizeOnScroll } from "expo-glass-tabs";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useState, type ReactNode } from "react";
import { Platform, Pressable, Switch as RNSwitch, Text, View } from "react-native";
import { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedScrollView, AnimatedView, hasLiquidGlass } from "@/components/styled";
import { QUOTES } from "@/constants/quotes";
import { colors, fonts } from "@/constants/theme";
import { useSavedQuotes } from "@/contexts/SavedQuotesContext";
import { useTheme } from "@/contexts/ThemeContext";

const NOTIF_KEY = "quotes_notifications";
const CARD_R = 18;
const SELECT_BLUE = "#007AFF";

export default function SettingsScreen() {
  const onScroll = useMinimizeOnScroll();
  const insets = useSafeAreaInsets();
  const { scheme, mode, setMode } = useTheme();
  const t = colors[scheme];
  const { savedIds } = useSavedQuotes();
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(NOTIF_KEY).then((v) => {
      if (v === "0") setNotifications(false);
      if (v === "1") setNotifications(true);
    });
  }, []);

  const onNotifications = (value: boolean) => {
    setNotifications(value);
    AsyncStorage.setItem(NOTIF_KEY, value ? "1" : "0");
  };

  const selectedPreview: "light" | "dark" =
    mode === "light" || mode === "dark" ? mode : scheme;

  return (
    <AnimatedScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
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
          Settings
        </Text>
      </AnimatedView>

      <Text
        style={{
          color: t.mutedForeground,
          fontFamily: fonts.sans,
          fontSize: 13,
          marginTop: 6,
          marginLeft: 4,
        }}
      >
        Appearance
      </Text>
      <GlassView
        colorScheme={scheme}
        glassEffectStyle="regular"
        {...{ borderRadius: CARD_R }}
        style={{
          borderRadius: CARD_R,
          borderCurve: "continuous",
          ...(hasLiquidGlass
            ? {}
            : { backgroundColor: t.card, borderWidth: 1, borderColor: t.border }),
        }}
      >
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            paddingTop: 22,
            paddingBottom: 18,
          }}
        >
          {(["light", "dark"] as const).map((preview) => (
            <ThemeOption
              key={preview}
              preview={preview}
              selected={selectedPreview === preview}
              labelColor={t.foreground}
              mutedColor={t.mutedForeground}
              onPress={() => setMode(preview)}
            />
          ))}
        </View>
      </GlassView>

      <GlassView
        colorScheme={scheme}
        glassEffectStyle="regular"
        {...{ borderRadius: CARD_R }}
        style={{
          borderRadius: CARD_R,
          borderCurve: "continuous",
          ...(hasLiquidGlass
            ? {}
            : { backgroundColor: t.card, borderWidth: 1, borderColor: t.border }),
        }}
      >
        <View style={{ padding: 20, gap: 8 }}>
          <SymbolView
            name="quote.opening"
            size={16}
            tintColor={t.mutedForeground}
            style={{ opacity: 0.5 }}
          />
          <Text
            style={{
              color: t.foreground,
              fontFamily: fonts.serif,
              fontSize: 19,
              lineHeight: 25,
              letterSpacing: -0.35,
            }}
          >
            The details are not the details. They make the design.
          </Text>
          <Text
            style={{
              color: t.mutedForeground,
              fontFamily: fonts.sans,
              fontSize: 12,
            }}
          >
            — Charles Eames
          </Text>
        </View>
      </GlassView>

      <Text
        style={{
          color: t.mutedForeground,
          fontFamily: fonts.sans,
          fontSize: 13,
          marginTop: 6,
          marginLeft: 4,
        }}
      >
        General
      </Text>
      <GlassView
        colorScheme={scheme}
        glassEffectStyle="regular"
        {...{ borderRadius: CARD_R }}
        style={{
          borderRadius: CARD_R,
          borderCurve: "continuous",
          overflow: "hidden",
          ...(hasLiquidGlass
            ? {}
            : { backgroundColor: t.card, borderWidth: 1, borderColor: t.border }),
        }}
      >
        <MenuRow
          label="Saved Quotes"
          icon="heart.fill"
          scheme={scheme}
          badge={savedIds.size > 0 ? String(savedIds.size) : undefined}
          onPress={() => router.push("/saved")}
        />
        <MenuRow
          label="Notifications"
          icon="bell.fill"
          scheme={scheme}
          isLast={false}
          trailing={
            <LgSwitch
              value={notifications}
              onValueChange={onNotifications}
              scheme={scheme}
            />
          }
        />
        <MenuRow
          label="Share App"
          icon="square.and.arrow.up"
          scheme={scheme}
          onPress={() => {}}
        />
        <MenuRow
          label="Rate Us"
          icon="star.fill"
          scheme={scheme}
          isLast
          onPress={() => {}}
        />
      </GlassView>

      <View style={{ alignItems: "center", gap: 2, marginTop: 8 }}>
        <Text
          style={{
            color: t.mutedForeground,
            fontFamily: fonts.sans,
            fontSize: 12,
          }}
        >
          Thrive v1.0.0
        </Text>
        <Text
          style={{
            color: t.mutedForeground,
            fontFamily: fonts.sans,
            fontSize: 12,
            opacity: 0.5,
          }}
        >
          Made with ♥
        </Text>
      </View>
    </AnimatedScrollView>
  );
}

function ThemeOption({
  preview,
  selected,
  labelColor,
  mutedColor,
  onPress,
}: {
  preview: "light" | "dark";
  selected: boolean;
  labelColor: string;
  mutedColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: "center", gap: 10 }}>
      <MiniQuotesPhone preview={preview} />
      <Text
        style={{
          color: labelColor,
          fontFamily: fonts.sans,
          fontSize: 13,
        }}
      >
        {preview === "light" ? "Light" : "Dark"}
      </Text>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: selected ? 0 : 1.5,
          borderColor: mutedColor,
          backgroundColor: selected ? SELECT_BLUE : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected ? (
          <SymbolView name="checkmark" size={11} tintColor="#FFFFFF" />
        ) : null}
      </View>
    </Pressable>
  );
}

function MiniQuotesPhone({
  preview,
}: {
  preview: "light" | "dark";
}) {
  const t = colors[preview];
  const quote = QUOTES[0];
  return (
    <View
      style={{
        width: 92,
        height: 168,
        borderRadius: 22,
        borderCurve: "continuous",
        backgroundColor: t.background,
        borderWidth: 1.5,
        borderColor: preview === "dark" ? "#3A3A3C" : "#C7C7CC",
        overflow: "hidden",
        paddingHorizontal: 6,
        paddingTop: 8,
        paddingBottom: 6,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color: t.foreground,
          fontFamily: fonts.serifBold,
          fontSize: 8,
          letterSpacing: -0.2,
        }}
      >
        Thrive
      </Text>
      <Text
        numberOfLines={1}
        style={{
          color: t.mutedForeground,
          fontFamily: fonts.sans,
          fontSize: 5,
          marginTop: 1,
          marginBottom: 5,
        }}
      >
        Daily quotes · 1 / {QUOTES.length}
      </Text>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          borderRadius: 10,
          borderCurve: "continuous",
          backgroundColor: t.card,
          paddingVertical: 6,
          paddingLeft: 6,
          paddingRight: 3,
          borderWidth: 1,
          borderColor: t.quoteBorder,
        }}
      >
        <View style={{ flex: 1, justifyContent: "center", gap: 3, paddingRight: 2 }}>
          <SymbolView
            name="quote.opening"
            size={8}
            tintColor={t.mutedForeground}
            style={{ opacity: 0.45 }}
          />
          <Text
            numberOfLines={4}
            style={{
              color: t.foreground,
              fontFamily: fonts.serif,
              fontSize: 6,
              lineHeight: 8,
            }}
          >
            {quote?.text}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: t.mutedForeground,
              fontFamily: fonts.sans,
              fontSize: 5,
            }}
          >
            — {quote?.author}
          </Text>
        </View>
        <View style={{ width: 10, alignItems: "center", justifyContent: "flex-end", gap: 6, paddingBottom: 2 }}>
          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#E5484D" }} />
          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: t.iconDefault }} />
          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: t.iconDefault }} />
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingTop: 5,
        }}
      >
        {(["quote.opening", "safari.fill", "gearshape.fill"] as const).map((icon, i) => (
          <SymbolView
            key={icon}
            name={icon}
            size={7}
            tintColor={i === 0 ? t.foreground : t.iconDefault}
          />
        ))}
      </View>
    </View>
  );
}

function LgSwitch({
  value,
  onValueChange,
  scheme,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  scheme: "light" | "dark";
}) {
  if (Platform.OS === "ios") {
    return (
          <Host matchContents colorScheme={scheme} seedColor={SELECT_BLUE}>
        <Switch value={value} onValueChange={onValueChange} />
      </Host>
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

function MenuRow({
  label,
  icon,
  scheme,
  badge,
  trailing,
  isLast = false,
  onPress,
}: {
  label: string;
  icon: string;
  scheme: "light" | "dark";
  badge?: string;
  trailing?: ReactNode;
  isLast?: boolean;
  onPress?: () => void;
}) {
  const t = colors[scheme];

  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 14,
          paddingHorizontal: 16,
          ...(!isLast
            ? { borderBottomWidth: 1, borderBottomColor: t.separator }
            : {}),
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <SymbolView
            name={icon as "heart.fill"}
            size={16}
            tintColor={t.mutedForeground}
          />
          <Text
            style={{
              color: t.foreground,
              fontFamily: fonts.sans,
              fontSize: 16,
            }}
          >
            {label}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {badge ? (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
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
                {badge}
              </Text>
            </View>
          ) : null}
          {trailing ?? (
            <SymbolView
              name="chevron.right"
              size={14}
              tintColor={t.mutedForeground}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}
