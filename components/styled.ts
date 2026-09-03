import {
    GlassContainer,
    GlassView,
    isLiquidGlassAvailable,
} from "expo-glass-effect";
import Animated from "react-native-reanimated";
import { withUniwind } from "uniwind";

export const hasLiquidGlass = isLiquidGlassAvailable();
export const StyledGlassView = withUniwind(GlassView);
export const StyledGlassContainer = withUniwind(GlassContainer);
export const AnimatedView = withUniwind(Animated.View);
export const AnimatedText = withUniwind(Animated.Text);
export const AnimatedScrollView = withUniwind(Animated.ScrollView);
