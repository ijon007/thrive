import { CATEGORIES, type QuoteCategory } from "@/constants/quotes";

export const ONBOARDING_STORAGE_KEY = "thrive_onboarding_v2";

export type OnboardingPlan = "yearly" | "monthly" | "skip";

export type QuestionId =
  | "heaviest"
  | "when"
  | "often"
  | "hole"
  | "selfTalk"
  | "weekWin"
  | "whoFor"
  | "kills"
  | "thirty";

export type OnboardingAnswers = Record<QuestionId, string>;

export type OnboardingRecord = {
  completed: boolean;
  answers: OnboardingAnswers;
  plan: OnboardingPlan;
};

export type OnboardingOption = {
  id: string;
  label: string;
  weights: Partial<Record<QuoteCategory, number>>;
};

export type OnboardingQuestion = {
  id: QuestionId;
  title: string;
  subtitle?: string;
  options: OnboardingOption[];
};

const emptyAnswers = (): OnboardingAnswers => ({
  heaviest: "",
  when: "",
  often: "",
  hole: "",
  selfTalk: "",
  weekWin: "",
  whoFor: "",
  kills: "",
  thirty: "",
});

export const EMPTY_ONBOARDING_ANSWERS = emptyAnswers();

export const QUESTIONS: OnboardingQuestion[] = [
  {
    id: "heaviest",
    title: "What’s been on your mind the most?",
    subtitle: "Pick the closest fit.",
    options: [
      { id: "overthinking", label: "I can’t turn my brain off", weights: { Mindfulness: 3, Wisdom: 1 } },
      { id: "stuck", label: "I feel stuck and don’t know the next step", weights: { Growth: 3, Courage: 1 } },
      { id: "relationships", label: "Someone I care about", weights: { Love: 3 } },
      { id: "confidence", label: "I keep second-guessing myself", weights: { Courage: 3, Growth: 1 } },
      { id: "meaning", label: "I’m not sure what this is all for", weights: { Wisdom: 3, Growth: 1 } },
      { id: "burnout", label: "I’m running on empty", weights: { Mindfulness: 3, Love: 1 } },
    ],
  },
  {
    id: "when",
    title: "When should a quote show up?",
    subtitle: "We’ll use this for the reminder.",
    options: [
      { id: "wake", label: "Morning", weights: { Growth: 1 } },
      { id: "midday", label: "Midday", weights: { Mindfulness: 1 } },
      { id: "evening", label: "Evening", weights: { Mindfulness: 1, Wisdom: 1 } },
      { id: "random", label: "No set time", weights: { Creativity: 1 } },
    ],
  },
  {
    id: "often",
    title: "How often do you want that reminder?",
    options: [
      { id: "daily", label: "Every day", weights: { Growth: 1 } },
      { id: "weekdays", label: "Weekdays only", weights: { Growth: 1 } },
      { id: "few", label: "A few times a week", weights: { Mindfulness: 1 } },
      { id: "open", label: "Don’t remind me — I’ll open the app", weights: {} },
    ],
  },
  {
    id: "hole",
    title: "On a hard day, what kind of line helps?",
    options: [
      { id: "kick", label: "Direct. Tell me to get up.", weights: { Courage: 3, Growth: 2 } },
      { id: "gentle", label: "Soft. Slow me down.", weights: { Mindfulness: 3, Love: 1 } },
      { id: "notalone", label: "Human. Remind me I’m not the only one.", weights: { Love: 3, Wisdom: 1 } },
      { id: "bigger", label: "Wide. Put this in perspective.", weights: { Wisdom: 3, Mindfulness: 1 } },
    ],
  },
  {
    id: "selfTalk",
    title: "How do you talk to yourself lately?",
    options: [
      { id: "harsh", label: "I’m hard on myself", weights: { Love: 2, Mindfulness: 2 } },
      { id: "numb", label: "I feel checked out", weights: { Mindfulness: 3, Wisdom: 1 } },
      { id: "tired", label: "I’m trying, but I’m tired", weights: { Growth: 2, Love: 1 } },
      { id: "fine", label: "I’m alright — I want more from myself", weights: { Growth: 3, Courage: 1 } },
    ],
  },
  {
    id: "weekWin",
    title: "What would make this week feel like it counted?",
    options: [
      { id: "followed", label: "I did what I said I would", weights: { Growth: 3, Courage: 1 } },
      { id: "kinder", label: "I was gentler with myself or someone else", weights: { Love: 3, Mindfulness: 1 } },
      { id: "risk", label: "I did something that scared me a little", weights: { Courage: 3, Creativity: 1 } },
      { id: "slowed", label: "I actually rested", weights: { Mindfulness: 3, Wisdom: 1 } },
    ],
  },
  {
    id: "whoFor",
    title: "Who are you showing up for?",
    options: [
      { id: "me", label: "Me, right now", weights: { Mindfulness: 1, Growth: 1 } },
      { id: "becoming", label: "The person I want to be", weights: { Growth: 3, Courage: 1 } },
      { id: "people", label: "People in my life", weights: { Love: 3 } },
      { id: "work", label: "The work I’m trying to do", weights: { Creativity: 2, Growth: 2 } },
    ],
  },
  {
    id: "kills",
    title: "Where do you usually get stuck?",
    options: [
      { id: "starting", label: "Getting started", weights: { Courage: 3, Growth: 1 } },
      { id: "finishing", label: "Finishing what I started", weights: { Growth: 3, Courage: 1 } },
      { id: "comparing", label: "Comparing myself to other people", weights: { Mindfulness: 2, Love: 2 } },
      { id: "options", label: "Too many choices — I freeze", weights: { Wisdom: 2, Mindfulness: 2 } },
    ],
  },
  {
    id: "thirty",
    title: "What do you want more of?",
    subtitle: "We’ll lean the quotes this way.",
    options: [
      { id: "discipline", label: "Follow-through", weights: { Growth: 3, Courage: 1 } },
      { id: "calm", label: "A quieter mind", weights: { Mindfulness: 3, Wisdom: 1 } },
      { id: "courage", label: "Guts to do the thing", weights: { Courage: 3 } },
      { id: "connection", label: "Feeling close to people", weights: { Love: 3 } },
      { id: "clarity", label: "Knowing what matters", weights: { Wisdom: 3, Creativity: 1 } },
    ],
  },
];

export const QUESTION_IDS: QuestionId[] = QUESTIONS.map((q) => q.id);

export function optionById(questionId: QuestionId, optionId: string): OnboardingOption | undefined {
  return QUESTIONS.find((q) => q.id === questionId)?.options.find((o) => o.id === optionId);
}

export function categoryWeights(answers: OnboardingAnswers): Record<QuoteCategory, number> {
  const w = Object.fromEntries(CATEGORIES.map((c) => [c, 1])) as Record<QuoteCategory, number>;
  for (const q of QUESTIONS) {
    const chosen = answers[q.id];
    const opt = q.options.find((o) => o.id === chosen);
    if (!opt) continue;
    for (const [cat, n] of Object.entries(opt.weights) as [QuoteCategory, number][]) {
      w[cat] += n;
    }
  }
  return w;
}

const THIRTY_NOUN: Record<string, string> = {
  discipline: "follow-through",
  calm: "calm",
  courage: "courage",
  connection: "connection",
  clarity: "clarity",
};

const HEAVY_SITUATION: Record<string, string> = {
  overthinking: "for a loud mind",
  stuck: "for when you feel stuck",
  relationships: "for the people who matter",
  confidence: "for when you second-guess yourself",
  meaning: "for when you need a why",
  burnout: "for when you’re spent",
};

export function paywallHeadline(answers: OnboardingAnswers): string {
  const noun = THIRTY_NOUN[answers.thirty] ?? "quotes";
  const sit = HEAVY_SITUATION[answers.heaviest];
  if (sit) return `Daily ${noun} ${sit}.`;
  return `Daily ${noun}, written for you.`;
}

export function paywallSubline(answers: OnboardingAnswers): string {
  const want = optionById("thirty", answers.thirty)?.label;
  const when = optionById("when", answers.when)?.label;
  const often = optionById("often", answers.often)?.label;
  if (want && when && often && answers.often !== "open") {
    return `${want} · ${when}, ${often.toLowerCase()}`;
  }
  if (want) return `Quotes aimed at ${want.toLowerCase()}.`;
  return "Your feed, from what you told us.";
}

export function notifHour(whenId: string): number {
  if (whenId === "wake") return 8;
  if (whenId === "midday") return 13;
  if (whenId === "evening") return 21;
  return 10;
}

export function wantsNotifications(oftenId: string): boolean {
  return oftenId !== "open" && oftenId !== "";
}

export function parseOnboardingRecord(raw: string | null): OnboardingRecord | null {
  if (!raw) return null;
  try {
    const o: unknown = JSON.parse(raw);
    if (typeof o !== "object" || o == null) return null;
    const rec = o as Record<string, unknown>;
    if (rec.completed !== true) return null;
    if (typeof rec.answers !== "object" || rec.answers == null) return null;
    const answers = emptyAnswers();
    const src = rec.answers as Record<string, unknown>;
    for (const id of QUESTION_IDS) {
      if (typeof src[id] === "string") answers[id] = src[id];
    }
    const plan: OnboardingPlan =
      rec.plan === "yearly" || rec.plan === "monthly" || rec.plan === "skip"
        ? rec.plan
        : "skip";
    return { completed: true, answers, plan };
  } catch {
    return null;
  }
}

if (__DEV__) {
  const sample: OnboardingAnswers = {
    ...emptyAnswers(),
    heaviest: "stuck",
    thirty: "courage",
    often: "daily",
    when: "wake",
  };
  console.assert(paywallHeadline(sample).includes("courage"));
  console.assert(categoryWeights(sample).Courage > categoryWeights(emptyAnswers()).Courage);
  console.assert(wantsNotifications("daily") === true);
  console.assert(wantsNotifications("open") === false);
  console.assert(parseOnboardingRecord(null) === null);
  console.assert(parseOnboardingRecord('{"completed":true,"answers":{"thirty":"calm"},"plan":"yearly"}')?.answers.thirty === "calm");
}
