import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassPad } from "@/components/GlassPad";
import {
  QUESTIONS,
  paywallHeadline,
  paywallSubline,
  type OnboardingPlan,
} from "@/constants/onboarding";
import { colors, fonts } from "@/constants/theme";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useTheme } from "@/contexts/ThemeContext";

const PAD = 20;
const CARD_R = 22;
const BTN_H = 56;
const BTN_R = BTN_H / 2;
const BACK_SIZE = 40;
const SPRING = { duration: 400, dampingRatio: 1 } as const;
const Q_COUNT = QUESTIONS.length;

type Phase = "welcome" | "question" | "build" | "paywall";

function tap() {
  void Haptics.selectionAsync();
}

function commit() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function success() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { scheme } = useTheme();
  const t = colors[scheme];
  const reduce = useReducedMotion();
  const { answers, setAnswer, finish } = useOnboarding();

  const [phase, setPhase] = useState<Phase>("welcome");
  const [qIndex, setQIndex] = useState(0);
  const [plan, setPlan] = useState<Exclude<OnboardingPlan, "skip">>("yearly");
  const showPaywall = useCallback(() => setPhase("paywall"), []);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const question = QUESTIONS[qIndex]!;

  const clearAdvance = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
  };

  useEffect(() => () => clearAdvance(), []);

  const goQuestion = (i: number) => {
    clearAdvance();
    setQIndex(i);
    setPhase("question");
  };

  const onPick = (optionId: string) => {
    tap();
    const already = answers[question.id] === optionId;
    setAnswer(question.id, optionId);
    const delay = reduce ? 0 : already ? 80 : 240;
    clearAdvance();
    advanceTimer.current = setTimeout(() => {
      commit();
      if (qIndex < Q_COUNT - 1) goQuestion(qIndex + 1);
      else setPhase("build");
    }, delay);
  };

  const onBack = () => {
    tap();
    clearAdvance();
    if (phase === "paywall") {
      setPhase("question");
      setQIndex(Q_COUNT - 1);
      return;
    }
    if (phase === "build") {
      goQuestion(Q_COUNT - 1);
      return;
    }
    if (phase === "question" && qIndex === 0) {
      setPhase("welcome");
      return;
    }
    if (phase === "question") goQuestion(qIndex - 1);
  };

  const complete = async (next: OnboardingPlan) => {
    success();
    await finish(next);
  };

  const showBack = phase !== "welcome";
  const showProgress = phase === "question";

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <View
        style={{
          paddingTop: insets.top + 6,
          paddingHorizontal: PAD,
          minHeight: 52,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {showBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={8}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.94 : 1 }],
            })}
          >
            <GlassPad
              scheme={scheme}
              radius={BACK_SIZE / 2}
              style={{
                width: BACK_SIZE,
                height: BACK_SIZE,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SymbolView name="chevron.left" size={20} tintColor={t.foreground} />
            </GlassPad>
          </Pressable>
        ) : (
          <View style={{ width: BACK_SIZE }} />
        )}
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          {showProgress ? <Progress fraction={(qIndex + 1) / Q_COUNT} color={t.foreground} track={t.separator} /> : null}
        </View>
        <View style={{ width: BACK_SIZE }} />
      </View>

      <View style={{ flex: 1 }}>
        {phase === "welcome" ? (
          <Welcome
            scheme={scheme}
            onStart={() => goQuestion(0)}
          />
        ) : null}
        {phase === "question" ? (
          <QuestionStep
            key={question.id}
            scheme={scheme}
            title={question.title}
            subtitle={question.subtitle}
            options={question.options}
            selected={answers[question.id]}
            onPick={onPick}
          />
        ) : null}
        {phase === "build" ? (
          <BuildStep
            scheme={scheme}
            reduce={!!reduce}
            headline={paywallHeadline(answers)}
            subline={paywallSubline(answers)}
            onDone={showPaywall}
          />
        ) : null}
        {phase === "paywall" ? (
          <PaywallStep
            scheme={scheme}
            headline={paywallHeadline(answers)}
            subline={paywallSubline(answers)}
            plan={plan}
            onPlan={(p) => {
              tap();
              setPlan(p);
            }}
            onContinue={() => void complete(plan)}
            onSkip={() => void complete("skip")}
          />
        ) : null}
      </View>
    </View>
  );
}

function Progress({
  fraction,
  color,
  track,
}: {
  fraction: number;
  color: string;
  track: string;
}) {
  const fill = useSharedValue(fraction);
  useEffect(() => {
    fill.value = withSpring(fraction, SPRING);
  }, [fill, fraction]);
  const style = useAnimatedStyle(() => ({
    width: `${Math.min(1, Math.max(0, fill.value)) * 100}%`,
  }));
  return (
    <View
      style={{
        height: 4,
        borderRadius: 2,
        backgroundColor: track,
        overflow: "hidden",
      }}
    >
      <Animated.View style={[{ height: "100%", backgroundColor: color, borderRadius: 2 }, style]} />
    </View>
  );
}

function Welcome({
  scheme,
  onStart,
}: {
  scheme: "light" | "dark";
  onStart: () => void;
}) {
  const t = colors[scheme];
  const insets = useSafeAreaInsets();
  return (
    <Animated.View
      entering={FadeIn.duration(420)}
      style={{ flex: 1, paddingHorizontal: PAD, paddingBottom: insets.bottom + 16 }}
    >
      <View style={{ flex: 1, justifyContent: "center", gap: 14, paddingBottom: 40 }}>
        <Text
          style={{
            color: t.foreground,
            fontFamily: fonts.serifBold,
            fontSize: 44,
            letterSpacing: -0.8,
            lineHeight: 50,
          }}
        >
          Thrive
        </Text>
        <Text
          style={{
            color: t.mutedForeground,
            fontFamily: fonts.sans,
            fontSize: 18,
            lineHeight: 26,
            maxWidth: 320,
          }}
        >
          A few questions so the next line you see is actually for you.
        </Text>
      </View>
      <PrimaryButton label="Get started" scheme={scheme} onPress={onStart} />
    </Animated.View>
  );
}

function QuestionStep({
  scheme,
  title,
  subtitle,
  options,
  selected,
  onPick,
}: {
  scheme: "light" | "dark";
  title: string;
  subtitle?: string;
  options: { id: string; label: string }[];
  selected: string;
  onPick: (id: string) => void;
}) {
  const t = colors[scheme];
  const insets = useSafeAreaInsets();
  return (
    <Animated.View
      entering={FadeIn.duration(280)}
      exiting={FadeOut.duration(120)}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: PAD,
          paddingBottom: insets.bottom + 12,
        }}
        showsVerticalScrollIndicator={false}
      >
      <Text
        style={{
          color: t.foreground,
          fontFamily: fonts.serifBold,
          fontSize: 32,
          letterSpacing: -0.5,
          lineHeight: 38,
          marginTop: 8,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            color: t.mutedForeground,
            fontFamily: fonts.sans,
            fontSize: 16,
            lineHeight: 22,
            marginTop: 8,
            marginBottom: 22,
          }}
        >
          {subtitle}
        </Text>
      ) : (
        <View style={{ height: 22 }} />
      )}
      <GlassPad scheme={scheme} radius={CARD_R} style={{ overflow: "hidden" }}>
        {options.map((opt, i) => {
          const on = selected === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onPick(opt.id)}
              style={({ pressed }) => ({
                minHeight: 58,
                paddingHorizontal: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                backgroundColor: pressed ? (scheme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)") : "transparent",
                borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                borderTopColor: t.separator,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              })}
            >
              <Text
                style={{
                  flex: 1,
                  color: t.foreground,
                  fontFamily: fonts.sans,
                  fontSize: 17,
                }}
              >
                {opt.label}
              </Text>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: on ? 0 : 1.5,
                  borderColor: t.mutedForeground,
                  backgroundColor: on ? t.foreground : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {on ? <SymbolView name="checkmark" size={11} tintColor={t.background} /> : null}
              </View>
            </Pressable>
          );
        })}
      </GlassPad>
      </ScrollView>
    </Animated.View>
  );
}

function BuildStep({
  scheme,
  reduce,
  headline,
  subline,
  onDone,
}: {
  scheme: "light" | "dark";
  reduce: boolean;
  headline: string;
  subline: string;
  onDone: () => void;
}) {
  const t = colors[scheme];
  const insets = useSafeAreaInsets();
  const done = useRef(false);
  const fill = useSharedValue(0);

  useEffect(() => {
    tap();
    fill.value = reduce
      ? withTiming(1, { duration: 280 })
      : withSpring(1, { duration: 1400, dampingRatio: 1 });

    const tick = setTimeout(() => tap(), reduce ? 140 : 700);
    const id = setTimeout(() => {
      if (done.current) return;
      done.current = true;
      success();
      onDone();
    }, reduce ? 360 : 1680);

    return () => {
      clearTimeout(tick);
      clearTimeout(id);
    };
  }, [fill, onDone, reduce]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: fill.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(reduce ? 200 : 360)}
      exiting={FadeOut.duration(reduce ? 120 : 220)}
      style={{
        flex: 1,
        paddingHorizontal: PAD,
        paddingBottom: insets.bottom + 24,
        justifyContent: "center",
        gap: 28,
      }}
    >
      <View style={{ gap: 10 }}>
        <Text
          style={{
            color: t.foreground,
            fontFamily: fonts.serifBold,
            fontSize: 32,
            letterSpacing: -0.55,
            lineHeight: 38,
            textAlign: "center",
          }}
        >
          {headline}
        </Text>
        <Text
          style={{
            color: t.mutedForeground,
            fontFamily: fonts.sans,
            fontSize: 16,
            lineHeight: 22,
            textAlign: "center",
          }}
        >
          {subline}
        </Text>
      </View>

      <GlassPad
        scheme={scheme}
        radius={18}
        animate
        durationSec={0.32}
        style={{ paddingVertical: 16, paddingHorizontal: 18 }}
      >
        <View
          style={{
            height: 3,
            borderRadius: 1.5,
            backgroundColor: t.separator,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={[
              {
                height: 3,
                width: "100%",
                borderRadius: 1.5,
                backgroundColor: t.foreground,
                transformOrigin: "left",
              },
              fillStyle,
            ]}
          />
        </View>
      </GlassPad>
    </Animated.View>
  );
}

function PaywallStep({
  scheme,
  headline,
  subline,
  plan,
  onPlan,
  onContinue,
  onSkip,
}: {
  scheme: "light" | "dark";
  headline: string;
  subline: string;
  plan: Exclude<OnboardingPlan, "skip">;
  onPlan: (p: Exclude<OnboardingPlan, "skip">) => void;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const t = colors[scheme];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const features = [
    "Unlimited quotes, weighted to you",
    "Daily reminder at the hour you picked",
    "Styles, photos, save & share",
    "New lines, no ads",
  ];

  return (
    <Animated.View entering={FadeIn.duration(320)} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: PAD,
          paddingBottom: insets.bottom + 10,
          flexGrow: 1,
          justifyContent: "space-between",
        }}
        showsVerticalScrollIndicator={false}
      >
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View>
          <Text
            style={{
              color: t.foreground,
              fontFamily: fonts.serifBold,
              fontSize: width < 380 ? 28 : 32,
              letterSpacing: -0.6,
              lineHeight: 38,
              marginTop: 4,
            }}
          >
            {headline}
          </Text>
          <Text
            style={{
              color: t.mutedForeground,
              fontFamily: fonts.sans,
              fontSize: 15,
              marginTop: 8,
              marginBottom: 22,
            }}
          >
            {subline}
          </Text>

          <View style={{ gap: 10, marginBottom: 22 }}>
            {features.map((f) => (
              <View key={f} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <SymbolView name="checkmark.circle.fill" size={20} tintColor={t.foreground} />
                <Text style={{ color: t.foreground, fontFamily: fonts.sans, fontSize: 16, flex: 1 }}>
                  {f}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ gap: 10 }}>
            <PlanRow
              scheme={scheme}
              selected={plan === "yearly"}
              title="Yearly"
              price="$39.99"
              detail="$3.33 / month"
              badge="Save 67%"
              onPress={() => onPlan("yearly")}
            />
            <PlanRow
              scheme={scheme}
              selected={plan === "monthly"}
              title="Monthly"
              price="$9.99"
              detail="per month"
              onPress={() => onPlan("monthly")}
            />
          </View>
        </View>

        <View style={{ gap: 10, paddingTop: 16 }}>
          <PrimaryButton label="Continue" scheme={scheme} onPress={onContinue} />
          <Pressable
            onPress={onSkip}
            style={({ pressed }) => ({
              paddingVertical: 8,
              opacity: pressed ? 0.55 : 1,
            })}
          >
            <Text
              style={{
                textAlign: "center",
                color: t.mutedForeground,
                fontFamily: fonts.sans,
                fontSize: 15,
              }}
            >
              Skip for now
            </Text>
          </Pressable>
          <Pressable
            onPress={() => Alert.alert("Restore", "Purchases aren’t wired yet.")}
            style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1, paddingBottom: 4 })}
          >
            <Text
              style={{
                textAlign: "center",
                color: t.mutedForeground,
                fontFamily: fonts.sans,
                fontSize: 13,
              }}
            >
              Restore purchases
            </Text>
          </Pressable>
        </View>
      </View>
      </ScrollView>
    </Animated.View>
  );
}

function PlanRow({
  scheme,
  selected,
  title,
  price,
  detail,
  badge,
  onPress,
}: {
  scheme: "light" | "dark";
  selected: boolean;
  title: string;
  price: string;
  detail: string;
  badge?: string;
  onPress: () => void;
}) {
  const t = colors[scheme];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.985 : 1 }] })}
    >
      <GlassPad
        scheme={scheme}
        radius={18}
        interactive={false}
        style={{
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderWidth: selected ? 2 : 0,
          borderColor: t.foreground,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              borderWidth: selected ? 0 : 1.5,
              borderColor: t.mutedForeground,
              backgroundColor: selected ? t.foreground : "transparent",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            {selected ? <SymbolView name="checkmark" size={11} tintColor={t.background} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ color: t.foreground, fontFamily: fonts.sansBold, fontSize: 17 }}>
                {title}
              </Text>
              {badge ? (
                <View
                  style={{
                    backgroundColor: t.foreground,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: t.background, fontFamily: fonts.sansBold, fontSize: 11 }}>
                    {badge}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={{ color: t.mutedForeground, fontFamily: fonts.sans, fontSize: 13, marginTop: 2 }}>
              {detail}
            </Text>
          </View>
          <Text style={{ color: t.foreground, fontFamily: fonts.sansBold, fontSize: 17 }}>{price}</Text>
        </View>
      </GlassPad>
    </Pressable>
  );
}

function PrimaryButton({
  label,
  scheme,
  onPress,
}: {
  label: string;
  scheme: "light" | "dark";
  onPress: () => void;
}) {
  const t = colors[scheme];
  return (
    <Pressable
      onPress={() => {
        commit();
        onPress();
      }}
      style={({ pressed }) => ({
        alignSelf: "stretch",
        height: BTN_H,
        borderRadius: BTN_R,
        borderCurve: "continuous",
        overflow: "hidden",
        backgroundColor: t.primary,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <GlassPad
        scheme={scheme}
        radius={BTN_R}
        tintColor={t.primary}
        style={StyleSheet.absoluteFillObject}
      />
      <View
        pointerEvents="none"
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: t.primaryForeground, fontFamily: fonts.sansBold, fontSize: 17 }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
