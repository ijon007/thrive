import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

import { StyledGlassView } from "@/components/styled";
import { colors, fonts } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

export default function ModalScreen() {
  const { scheme } = useTheme();
  const t = colors[scheme];

  return (
    <View
      className="flex-1 items-center justify-center p-6"
      style={{ backgroundColor: t.background }}
    >
      <StyledGlassView
        className="rounded-[20px] p-8 items-center gap-2 w-full"
        glassEffectStyle="regular"
      >
        <Text
          className="text-[22px] font-bold"
          style={{ color: t.foreground, fontFamily: fonts.serifBold }}
        >
          Share Quote
        </Text>
        <Text
          className="text-[15px] text-center"
          style={{ color: t.mutedForeground, fontFamily: fonts.sans }}
        >
          Sharing functionality coming soon.
        </Text>
      </StyledGlassView>
      <StatusBar style="light" />
    </View>
  );
}
