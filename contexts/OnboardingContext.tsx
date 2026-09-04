import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  EMPTY_ONBOARDING_ANSWERS,
  ONBOARDING_STORAGE_KEY,
  categoryWeights,
  parseOnboardingRecord,
  wantsNotifications,
  type OnboardingAnswers,
  type OnboardingPlan,
  type OnboardingRecord,
  type QuestionId,
} from "@/constants/onboarding";
import { NOTIF_ENABLED_KEY, syncQuoteNotifications } from "@/lib/quoteNotifications";

type OnboardingValue = {
  ready: boolean;
  completed: boolean;
  answers: OnboardingAnswers;
  plan: OnboardingPlan;
  setAnswer: (id: QuestionId, optionId: string) => void;
  finish: (plan: OnboardingPlan) => Promise<void>;
};

const OnboardingContext = createContext<OnboardingValue>({
  ready: false,
  completed: false,
  answers: EMPTY_ONBOARDING_ANSWERS,
  plan: "skip",
  setAnswer: () => {},
  finish: async () => {},
});

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [answers, setAnswers] = useState<OnboardingAnswers>(EMPTY_ONBOARDING_ANSWERS);
  const [plan, setPlan] = useState<OnboardingPlan>("skip");

  useEffect(() => {
    void AsyncStorage.getItem(ONBOARDING_STORAGE_KEY).then((raw) => {
      const rec = parseOnboardingRecord(raw);
      if (rec) {
        setCompleted(true);
        setAnswers(rec.answers);
        setPlan(rec.plan);
      }
      setReady(true);
    });
  }, []);

  const setAnswer = useCallback((id: QuestionId, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [id]: optionId }));
  }, []);

  const finish = useCallback(async (nextPlan: OnboardingPlan) => {
    const rec: OnboardingRecord = { completed: true, answers, plan: nextPlan };
    setPlan(nextPlan);
    setCompleted(true);
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(rec));
    const enabled = wantsNotifications(answers.often);
    await AsyncStorage.setItem(NOTIF_ENABLED_KEY, enabled ? "1" : "0");
    try {
      await syncQuoteNotifications({
        enabled,
        whenId: answers.when,
        oftenId: answers.often,
      });
    } catch {
      // ponytail: permission / Expo Go must not block finishing onboarding
    }
  }, [answers]);

  const value = useMemo(
    () => ({ ready, completed, answers, plan, setAnswer, finish }),
    [ready, completed, answers, plan, setAnswer, finish],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}

export function useCategoryWeights() {
  const { answers, completed } = useOnboarding();
  return useMemo(
    () => (completed ? categoryWeights(answers) : null),
    [answers, completed],
  );
}
