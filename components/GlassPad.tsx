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
  tintColor,
}: {
  scheme: "light" | "dark";
  radius: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  interactive?: boolean;
  effect?: "clear" | "regular" | "none";
  animate?: boolean;
  durationSec?: number;
  tintColor?: string;
}) {
  const t = colors[scheme];
  const fallback = !hasLiquidGlass && effect !== "none";
  return (
    <GlassView
      isInteractive={interactive}
      colorScheme={scheme}
      tintColor={tintColor}
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
          overflow: "visible",
          ...(fallback
            ? {
                backgroundColor:
                  tintColor ??
                  (scheme === "dark" ? "rgba(28,28,30,0.78)" : "rgba(255,255,255,0.78)"),
                borderWidth: tintColor ? 0 : StyleSheet.hairlineWidth,
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
