import { useMinimizeOnScroll } from "expo-glass-tabs";
import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";
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

export default function SettingsScreen() {
  const onScroll = useMinimizeOnScroll();
  const insets = useSafeAreaInsets();
  const { scheme, mode, setMode } = useTheme();
  const t = colors[scheme];

  return (
    <AnimatedScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        gap: 20,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 120,
      }}
      style={{ backgroundColor: t.background }}
    >
      {/* Header */}
      <AnimatedView entering={FadeIn.duration(500)}>
        <Text
          className="text-[32px] font-bold tracking-tight"
          style={{ color: t.foreground, fontFamily: fonts.serifBold }}
        >
          Settings
        </Text>
      </AnimatedView>

      {/* Appearance section */}
      <AnimatedView entering={FadeInDown.duration(400).delay(100)}>
        <Text
          className="text-xs font-semibold tracking-widest mb-2"
          style={{ color: t.mutedForeground, fontFamily: fonts.sansBold }}
        >
          APPEARANCE
        </Text>
        <StyledGlassView className="rounded-2xl p-1.5" glassEffectStyle="regular">
          <View className="flex-row gap-1.5">
            {THEME_OPTIONS.map((option) => (
              <ThemeOption
                key={option.value}
                option={option}
                active={mode === option.value}
                scheme={scheme}
                onPress={() => setMode(option.value)}
              />
            ))}
          </View>
        </StyledGlassView>
      </AnimatedView>

      {/* Preview */}
      <AnimatedView entering={FadeInDown.duration(400).delay(200)}>
        <StyledGlassView className="rounded-2xl" glassEffectStyle="clear">
          <View className="p-6 gap-2">
            <Text
              className="text-lg leading-7 tracking-tight"
              style={{ color: t.foreground, fontFamily: fonts.serif }}
            >
              "The details are not the details. They make the design."
            </Text>
            <Text
              className="text-[13px] font-medium"
              style={{ color: t.mutedForeground, fontFamily: fonts.sans }}
            >
              — Charles Eames
            </Text>
            <Text
              className="text-[11px] mt-2 opacity-50 uppercase tracking-widest"
              style={{ color: t.mutedForeground, fontFamily: fonts.sans }}
            >
              Preview of current theme
            </Text>
          </View>
        </StyledGlassView>
      </AnimatedView>

      {/* Menu items */}
      <AnimatedView entering={FadeInDown.duration(400).delay(300)}>
        <Text
          className="text-xs font-semibold tracking-widest mb-2"
          style={{ color: t.mutedForeground, fontFamily: fonts.sansBold }}
        >
          GENERAL
        </Text>
        <StyledGlassView
          className="rounded-2xl overflow-hidden"
          glassEffectStyle="regular"
        >
          {MENU_ITEMS.map((item, i) => (
            <MenuItem
              key={item.label}
              item={item}
              scheme={scheme}
              isLast={i === MENU_ITEMS.length - 1}
            />
          ))}
        </StyledGlassView>
      </AnimatedView>

      {/* Footer */}
      <AnimatedView
        entering={FadeIn.duration(400).delay(500)}
        className="items-center gap-1 mt-2"
      >
        <Text
          className="text-xs"
          style={{ color: t.mutedForeground, fontFamily: fonts.sans }}
        >
          Thrive v1.0.0
        </Text>
        <Text
          className="text-xs opacity-50"
          style={{ color: t.mutedForeground, fontFamily: fonts.sans }}
        >
          Made with ♥
        </Text>
      </AnimatedView>
    </AnimatedScrollView>
  );
}

function ThemeOption({
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
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      onPress={onPress}
      style={{ flex: 1 }}
    >
      <AnimatedView
        className="items-center justify-center gap-1.5 py-4 rounded-xl"
        style={[active && { backgroundColor: t.primary }, animStyle]}
      >
        <SymbolView
          name={option.icon as any}
          size={20}
          tintColor={active ? t.primaryForeground : t.mutedForeground}
        />
        <Text
          className="text-[13px] font-medium"
          style={{
            color: active ? t.primaryForeground : t.mutedForeground,
            fontFamily: active ? fonts.sansBold : fonts.sans,
          }}
        >
          {option.label}
        </Text>
      </AnimatedView>
    </Pressable>
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
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
    >
      <AnimatedView style={animStyle}>
        <View
          className="flex-row items-center justify-between py-4 px-4"
          style={
            !isLast
              ? { borderBottomWidth: 1, borderBottomColor: t.separator }
              : undefined
          }
        >
          <View className="flex-row items-center gap-3">
            <SymbolView
              name={item.icon as any}
              size={18}
              tintColor={t.mutedForeground}
            />
            <Text
              className="text-base"
              style={{ color: t.foreground, fontFamily: fonts.sans }}
            >
              {item.label}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            {item.badge && (
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: t.primary }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: t.primaryForeground, fontFamily: fonts.sans }}
                >
                  {item.badge}
                </Text>
              </View>
            )}
            <SymbolView
              name="chevron.right"
              size={14}
              tintColor={t.mutedForeground}
            />
          </View>
        </View>
      </AnimatedView>
    </Pressable>
  );
}
