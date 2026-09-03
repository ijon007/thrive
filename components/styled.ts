import { GlassView } from "expo-glass-effect";
import Animated from "react-native-reanimated";
import { withUniwind } from "uniwind";

export const StyledGlassView = withUniwind(GlassView);
export const AnimatedView = withUniwind(Animated.View);
export const AnimatedText = withUniwind(Animated.Text);
export const AnimatedScrollView = withUniwind(Animated.ScrollView);
