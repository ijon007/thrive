import { GlassView } from "expo-glass-effect";
import { SymbolView } from "expo-symbols";
import { Modal, Pressable, Text, View } from "react-native";

import { hasLiquidGlass } from "@/components/styled";
import { type Quote } from "@/constants/quotes";
import { colors, fonts } from "@/constants/theme";

const TILE_R = 18;
const DIALOG_R = 28;
export const TILE_GAP = 8;

export function QuoteTile({
  quote,
  scheme,
  onPress,
}: {
  quote: Quote;
  scheme: "light" | "dark";
  onPress: () => void;
}) {
  const t = colors[scheme];

  return (
    <GlassView
      isInteractive
      colorScheme={scheme}
      glassEffectStyle="regular"
      {...{ borderRadius: TILE_R }}
      style={{
        flexGrow: 1,
        flexBasis: "47%",
        maxWidth: "48.5%",
        aspectRatio: 1,
        borderRadius: TILE_R,
        borderCurve: "continuous",
        ...(hasLiquidGlass
          ? {}
          : { backgroundColor: t.card, borderWidth: 1, borderColor: t.border }),
      }}
    >
      <Pressable
        onPress={onPress}
        style={{
          flex: 1,
          padding: 14,
          justifyContent: "space-between",
        }}
      >
        <View style={{ gap: 8 }}>
          <SymbolView
            name="quote.opening"
            size={16}
            tintColor={t.mutedForeground}
            style={{ opacity: 0.5 }}
          />
          <Text
            numberOfLines={4}
            style={{
              color: t.foreground,
              fontFamily: fonts.serif,
              fontSize: 20,
              lineHeight: 28,
              letterSpacing: -0.35,
            }}
          >
            {quote.text}
          </Text>
        </View>
        <Text
          numberOfLines={1}
          style={{
            color: t.mutedForeground,
            fontFamily: fonts.sans,
            fontSize: 12,
          }}
        >
          {quote.author}
        </Text>
      </Pressable>
    </GlassView>
  );
}

export function QuoteDialog({
  quote,
  scheme,
  onClose,
}: {
  quote: Quote | null;
  scheme: "light" | "dark";
  onClose: () => void;
}) {
  const t = colors[scheme];

  return (
    <Modal
      visible={quote != null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Pressable
          onPress={onClose}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor:
              scheme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.28)",
          }}
        />
        {quote ? (
          <View style={{ marginHorizontal: 22 }}>
            <GlassView
              isInteractive
              colorScheme={scheme}
              glassEffectStyle="regular"
              {...{ borderRadius: DIALOG_R }}
              style={{
                borderRadius: DIALOG_R,
                borderCurve: "continuous",
                ...(hasLiquidGlass
                  ? {}
                  : {
                      backgroundColor: t.card,
                      borderWidth: 1,
                      borderColor: t.border,
                    }),
              }}
            >
              <View style={{ padding: 28, gap: 16 }}>
                <SymbolView
                  name="quote.opening"
                  size={26}
                  tintColor={t.mutedForeground}
                  style={{ opacity: 0.5 }}
                />
                <Text
                  style={{
                    color: t.foreground,
                    fontFamily: fonts.serif,
                    fontSize: 26,
                    lineHeight: 36,
                    letterSpacing: -0.3,
                  }}
                >
                  {quote.text}
                </Text>
                <Text
                  style={{
                    color: t.mutedForeground,
                    fontFamily: fonts.sans,
                    fontSize: 15,
                  }}
                >
                  — {quote.author}
                </Text>
                <View
                  style={{
                    alignSelf: "flex-start",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
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
                    {quote.category}
                  </Text>
                </View>
              </View>
            </GlassView>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
