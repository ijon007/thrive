import { GlassView } from "expo-glass-effect";
import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { hasLiquidGlass } from "@/components/styled";
import { colors } from "@/constants/theme";

export function GlassPad({
  scheme,
  radius,
  style,
  children,
  interactive = true,
  effect = "regular",
  animate = false,
  durationSec = 0.32,
}: {
  scheme: "light" | "dark";
  radius: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  interactive?: boolean;
  effect?: "clear" | "regular" | "none";
  animate?: boolean;
  durationSec?: number;
}) {
  const t = colors[scheme];
  const fallback = !hasLiquidGlass && effect !== "none";
  return (
    <GlassView
      isInteractive={interactive}
      colorScheme={scheme}
      glassEffectStyle={
        hasLiquidGlass && animate
          ? { style: effect, animate: true, animationDuration: durationSec }
          : effect
      }
      {...{ borderRadius: radius }}
      style={[
        {
          borderRadius: radius,
          borderCurve: "continuous",
          // ponytail: overflow hidden clips native Switch thumbs at rounded corners
          overflow: "visible",
          ...(fallback
            ? {
                backgroundColor:
                  scheme === "dark" ? "rgba(28,28,30,0.78)" : "rgba(255,255,255,0.78)",
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: t.border,
              }
            : {}),
        },
        style,
      ]}
    >
      {children}
    </GlassView>
  );
}
