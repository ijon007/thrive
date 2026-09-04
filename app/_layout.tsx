import { useFonts } from "expo-font";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider as NavThemeProvider,
    Stack,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "../global.css";

import OnboardingScreen from "./onboarding";
import { colors, fonts } from "@/constants/theme";
import { OnboardingProvider, useOnboarding } from "@/contexts/OnboardingContext";
import { QuoteAppearanceProvider } from "@/contexts/QuoteAppearanceContext";
import { QuoteBackgroundProvider } from "@/contexts/QuoteBackgroundContext";
import { QuotePhotosProvider } from "@/contexts/QuotePhotosContext";
import { QuoteStylesProvider } from "@/contexts/QuoteStylesContext";
import { SavedQuotesProvider } from "@/contexts/SavedQuotesContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

const LightNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.light.background,
    card: colors.light.card,
    text: colors.light.foreground,
    border: colors.light.border,
    primary: colors.light.primary,
  },
};

const DarkNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.dark.background,
    card: colors.dark.card,
    text: colors.dark.foreground,
    border: colors.dark.border,
    primary: colors.dark.primary,
  },
};

function InnerLayout() {
  const { scheme } = useTheme();
  const { ready, completed } = useOnboarding();

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <NavThemeProvider value={scheme === "dark" ? DarkNavTheme : LightNavTheme}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      {completed ? (
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors[scheme].background },
            headerTintColor: colors[scheme].foreground,
            headerShadowVisible: false,
            headerTitleStyle: {
              fontFamily: fonts.sansBold,
              color: colors[scheme].foreground,
            },
            contentStyle: { backgroundColor: colors[scheme].background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="saved" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      ) : (
        <OnboardingScreen />
      )}
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Lora: require("../assets/fonts/Lora-Regular.ttf"),
    LoraBold: require("../assets/fonts/Lora-Bold.ttf"),
    DMSans: require("../assets/fonts/DMSans-Regular.ttf"),
    DMSansBold: require("../assets/fonts/DMSans-Bold.ttf"),
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <OnboardingProvider>
          <SavedQuotesProvider>
            <QuoteBackgroundProvider>
              <QuoteAppearanceProvider>
                <QuotePhotosProvider>
                  <QuoteStylesProvider>
                    <InnerLayout />
                  </QuoteStylesProvider>
                </QuotePhotosProvider>
              </QuoteAppearanceProvider>
            </QuoteBackgroundProvider>
          </SavedQuotesProvider>
        </OnboardingProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
