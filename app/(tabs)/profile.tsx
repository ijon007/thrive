import { GlassContainer, GlassView } from "expo-glass-effect";
import { useMinimizeOnScroll } from "expo-glass-tabs";
import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";
import { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedScrollView, AnimatedView, hasLiquidGlass } from "@/components/styled";
import { colors, fonts } from "@/constants/theme";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "sun.max.fill" },
  { value: "dark", label: "Dark", icon: "moon.fill" },
  { value: "system", label: "System", icon: "gear" },
];

const MENU_ITEMS = [
  { label: "Saved Quotes", icon: "heart.fill", badge: "12" },
  { label: "Notifications", icon: "bell.fill", badge: null },
  { label: "Share App", icon: "square.and.arrow.up", badge: null },
  { label: "Rate Us", icon: "star.fill", badge: null },
  { label: "About", icon: "info.circle.fill", badge: null },
];

const CHIP_H = 36;
const CHIP_R = CHIP_H / 2;
const CARD_R = 18;

export default function SettingsScreen() {
  const onScroll = useMinimizeOnScroll();
  const insets = useSafeAreaInsets();
  const { scheme, mode, setMode } = useTheme();
  const t = colors[scheme];

  return (
    <>
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
        className="text-xs font-semibold tracking-widest"
        style={{
          color: t.mutedForeground,
          fontFamily: fonts.sansBold,
          marginTop: 6,
        }}
      >
        APPEARANCE
      </Text>
      <GlassContainer
        spacing={8}
        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
      >
        {THEME_OPTIONS.map((option) => (
          <ThemeChip
            key={option.value}
            option={option}
            active={mode === option.value}
            scheme={scheme}
            onPress={() => setMode(option.value)}
          />
        ))}
      </GlassContainer>

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
        className="text-xs font-semibold tracking-widest"
        style={{
          color: t.mutedForeground,
          fontFamily: fonts.sansBold,
          marginTop: 6,
        }}
      >
        GENERAL
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
        {MENU_ITEMS.map((item, i) => (
          <MenuItem
            key={item.label}
            item={item}
            scheme={scheme}
            isLast={i === MENU_ITEMS.length - 1}
          />
        ))}
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
    </>
  );
}

function ThemeChip({
  option,
  active,
  scheme,
  onPress,
}: {
  option: (typeof THEME_OPTIONS)[number];
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
        flex: 1,
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
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <SymbolView
          name={option.icon as any}
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
          {option.label}
        </Text>
      </Pressable>
    </GlassView>
  );
}

function MenuItem({
  item,
  scheme,
  isLast,
}: {
  item: (typeof MENU_ITEMS)[number];
  scheme: "light" | "dark";
  isLast: boolean;
}) {
  const t = colors[scheme];

  return (
    <Pressable>
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
            name={item.icon as any}
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
            {item.label}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {item.badge ? (
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
                {item.badge}
              </Text>
            </View>
          ) : null}
          <SymbolView
            name="chevron.right"
            size={14}
            tintColor={t.mutedForeground}
          />
        </View>
      </View>
    </Pressable>
  );
}
