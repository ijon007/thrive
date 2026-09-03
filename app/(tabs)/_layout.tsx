import { NativeTabs } from "expo-router/unstable-native-tabs";

import { colors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

export default function TabLayout() {
  const { scheme } = useTheme();
  const t = colors[scheme];

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor={t.iconActive}
      iconColor={{ default: t.iconDefault, selected: t.iconActive }}
      labelStyle={{
        default: { color: t.mutedForeground },
        selected: { color: t.foreground },
      }}
    >
      <NativeTabs.Trigger name="index" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon sf="quote.opening" md="format_quote" />
        <NativeTabs.Trigger.Label>Quotes</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon sf="safari.fill" md="travel_explore" />
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
