import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { QUOTE_BACKGROUNDS, type QuoteBg, type QuoteBgId } from "@/constants/quoteBackgrounds";
import { colors, fonts } from "@/constants/theme";

const SELECT_BLUE = "#007AFF";
const TILE_W = 112;
const TILE_H = 156;
const TILE_GAP = 10;

export function QuoteBackgroundPicker({
  scheme,
  selectedId,
  onSelect,
}: {
  scheme: "light" | "dark";
  selectedId: QuoteBgId;
  onSelect: (id: QuoteBgId) => void;
}) {
  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      decelerationRate="normal"
      bounces
      alwaysBounceHorizontal
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 18,
        gap: TILE_GAP,
      }}
    >
      {QUOTE_BACKGROUNDS.map((bg) => (
        <BackgroundTile
          key={bg.id}
          background={bg}
          selected={selectedId === bg.id}
          scheme={scheme}
          onPress={() => {
            void Haptics.selectionAsync();
            onSelect(bg.id);
          }}
        />
      ))}
    </ScrollView>
  );
}

function BackgroundTile({
  background,
  selected,
  scheme,
  onPress,
}: {
  background: QuoteBg;
  selected: boolean;
  scheme: "light" | "dark";
  onPress: () => void;
}) {
  const t = colors[scheme];
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: TILE_W,
        alignItems: "center",
        gap: 8,
      }}
    >
      <View
        style={{
          width: TILE_W,
          height: TILE_H,
          borderRadius: 16,
          borderCurve: "continuous",
          overflow: "hidden",
          borderWidth: selected ? 2.5 : 1,
          borderColor: selected ? SELECT_BLUE : t.border,
          backgroundColor: t.card,
        }}
      >
        {background.source ? (
          <Image
            source={background.source}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: background.fill ?? t.background },
            ]}
          />
        )}
        {selected ? (
          <View
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: SELECT_BLUE,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SymbolView name="checkmark" size={11} tintColor="#FFFFFF" />
          </View>
        ) : null}
      </View>
      <Text
        style={{
          color: t.foreground,
          fontFamily: fonts.sans,
          fontSize: 13,
        }}
      >
        {background.label}
      </Text>
    </Pressable>
  );
}
