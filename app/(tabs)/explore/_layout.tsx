import { Stack } from "expo-router";

import { colors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

export default function ExploreLayout() {
  const { scheme } = useTheme();
  const t = colors[scheme];

  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        title: "",
        contentStyle: { backgroundColor: t.background },
      }}
    />
  );
}
