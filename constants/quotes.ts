export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
}

/** Fisher-Yates shuffle; returns a new array. */
export function shuffleQuotes<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export const CATEGORIES = [
  "Wisdom",
  "Love",
  "Courage",
  "Mindfulness",
  "Growth",
  "Creativity",
] as const;

// Curated from Wikiquote (en.wikiquote.org) — sourced lines, not quote-site sludge.
export const QUOTES: Quote[] = [
  {
    id: "baldwin-faced",
    text: "Not everything that is faced can be changed; but nothing can be changed until it is faced.",
    author: "James Baldwin",
    category: "Wisdom",
  },
  {
    id: "didion-stories",
    text: "We tell ourselves stories in order to live.",
    author: "Joan Didion",
    category: "Wisdom",
  },
  {
    id: "seneca-time",
    text: "It is not that we have a short time to live, but that we waste a lot of it.",
    author: "Seneca",
    category: "Wisdom",
  },
  {
    id: "aurelius-mind",
    text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    category: "Wisdom",
  },
  {
    id: "laozi-self",
    text: "Knowing others is intelligence; knowing yourself is true wisdom. Mastering others is strength; mastering yourself is true power.",
    author: "Laozi",
    category: "Wisdom",
  },
  {
    id: "thoreau-see",
    text: "The question is not what you look at, but what you see.",
    author: "Henry David Thoreau",
    category: "Wisdom",
  },
  {
    id: "woolf-ordinary",
    text: "Examine for a moment an ordinary mind on an ordinary day.",
    author: "Virginia Woolf",
    category: "Wisdom",
  },
  {
    id: "camus-summer",
    text: "In the depth of winter, I finally learned that within me there lay an invincible summer.",
    author: "Albert Camus",
    category: "Wisdom",
  },
  {
    id: "oliver-animal",
    text: "You only have to let the soft animal of your body love what it loves.",
    author: "Mary Oliver",
    category: "Love",
  },
  {
    id: "baldwin-masks",
    text: "Love takes off the masks that we fear we cannot live without and know we cannot live within.",
    author: "James Baldwin",
    category: "Love",
  },
  {
    id: "rilke-love-task",
    text: "For one human being to love another: that is perhaps the most difficult of all our tasks, the ultimate, the last test and proof, the work for which all other work is but preparation.",
    author: "Rainer Maria Rilke",
    category: "Love",
  },
  {
    id: "nhat-hanh-know",
    text: "To love without knowing how to love wounds the person we love.",
    author: "Thich Nhat Hanh",
    category: "Love",
  },
  {
    id: "lorde-forever",
    text: "Each time you love, love as deeply as if it were forever. Only, nothing is eternal.",
    author: "Audre Lorde",
    category: "Love",
  },
  {
    id: "rumi-barriers",
    text: "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.",
    author: "Rumi",
    category: "Love",
  },
  {
    id: "angelou-barriers",
    text: "Love recognizes no barriers. It jumps hurdles, leaps fences, penetrates walls to arrive at its destination full of hope.",
    author: "Maya Angelou",
    category: "Love",
  },
  {
    id: "emerson-beloved",
    text: "He who is in love is wise and is becoming wiser, sees newly every time he looks at the object beloved.",
    author: "Ralph Waldo Emerson",
    category: "Love",
  },
  {
    id: "lorde-powerful",
    text: "When I dare to be powerful, to use my strength in the service of my vision, then it becomes less and less important whether I am afraid.",
    author: "Audre Lorde",
    category: "Courage",
  },
  {
    id: "angelou-courage",
    text: "Without courage we cannot practice any other virtue with consistency. We can't be kind, true, merciful, generous, or honest.",
    author: "Maya Angelou",
    category: "Courage",
  },
  {
    id: "baldwin-treat",
    text: "You've got to tell the world how to treat you. If the world tells you how you are going to be treated, you are in trouble.",
    author: "James Baldwin",
    category: "Courage",
  },
  {
    id: "camus-rebellion",
    text: "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.",
    author: "Albert Camus",
    category: "Courage",
  },
  {
    id: "didion-respect",
    text: "The willingness to accept responsibility for one's own life is the source from which self-respect springs.",
    author: "Joan Didion",
    category: "Courage",
  },
  {
    id: "aurelius-right",
    text: "If it is not right, do not do it; if it is not true, do not say it.",
    author: "Marcus Aurelius",
    category: "Courage",
  },
  {
    id: "seneca-free",
    text: "He who is brave is free.",
    author: "Seneca",
    category: "Courage",
  },
  {
    id: "angelou-cynic",
    text: "There is nothing so pitiful as a young cynic because he has gone from knowing nothing to believing nothing.",
    author: "Maya Angelou",
    category: "Courage",
  },
  {
    id: "pema-teacher",
    text: "This very moment is the perfect teacher, and, lucky for us, it's with us wherever we are.",
    author: "Pema Chodron",
    category: "Mindfulness",
  },
  {
    id: "oliver-breathing",
    text: "Listen. Are you breathing just a little and calling it a life?",
    author: "Mary Oliver",
    category: "Mindfulness",
  },
  {
    id: "nhat-hanh-present",
    text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
    author: "Thich Nhat Hanh",
    category: "Mindfulness",
  },
  {
    id: "thoreau-wave",
    text: "You must live in the present, launch yourself on every wave, find your eternity in each moment.",
    author: "Henry David Thoreau",
    category: "Mindfulness",
  },
  {
    id: "pema-back",
    text: "Meditation is just gently coming back again and again to what's right here.",
    author: "Pema Chodron",
    category: "Mindfulness",
  },
  {
    id: "laozi-hurry",
    text: "Nature does not hurry, yet everything is accomplished.",
    author: "Laozi",
    category: "Mindfulness",
  },
  {
    id: "aurelius-present",
    text: "Confine yourself to the present.",
    author: "Marcus Aurelius",
    category: "Mindfulness",
  },
  {
    id: "pema-control",
    text: "We can't control what's going to happen but we can grow in awareness of what is happening.",
    author: "Pema Chodron",
    category: "Mindfulness",
  },
  {
    id: "rilke-feeling",
    text: "Let everything happen to you: beauty and terror. Just keep going. No feeling is final.",
    author: "Rainer Maria Rilke",
    category: "Growth",
  },
  {
    id: "oliver-precious",
    text: "Tell me, what is it you plan to do with your one wild and precious life?",
    author: "Mary Oliver",
    category: "Growth",
  },
  {
    id: "angelou-butterfly",
    text: "We delight in the beauty of the butterfly, but rarely admit the changes it has gone through to achieve that beauty.",
    author: "Maya Angelou",
    category: "Growth",
  },
  {
    id: "epictetus-react",
    text: "It's not what happens to you, but how you react to it that matters.",
    author: "Epictetus",
    category: "Growth",
  },
  {
    id: "didion-price",
    text: "Self-respect is a question of recognizing that anything worth having has a price.",
    author: "Joan Didion",
    category: "Growth",
  },
  {
    id: "rilke-heart-work",
    text: "The work of the eyes is done. Go now and do the heart-work on the images imprisoned within you.",
    author: "Rainer Maria Rilke",
    category: "Growth",
  },
  {
    id: "lorde-preservation",
    text: "Caring for myself is not self-indulgence, it is self-preservation, and that is an act of political warfare.",
    author: "Audre Lorde",
    category: "Growth",
  },
  {
    id: "emerson-self-reliance",
    text: "Self-reliance, the height and perfection of man, is reliance on God.",
    author: "Ralph Waldo Emerson",
    category: "Growth",
  },
  {
    id: "oliver-creative",
    text: "The most regretful people on earth are those who felt the call to creative work, who felt their own creative power restive and uprising, and gave to it neither power nor time.",
    author: "Mary Oliver",
    category: "Creativity",
  },
  {
    id: "baldwin-alone",
    text: "The primary distinction of the artist is that he must actively cultivate that state which most men, necessarily, must avoid: the state of being alone.",
    author: "James Baldwin",
    category: "Creativity",
  },
  {
    id: "lorde-nameless",
    text: "Poetry is the way we help give name to the nameless so it can be thought.",
    author: "Audre Lorde",
    category: "Creativity",
  },
  {
    id: "didion-writers",
    text: "Writers are always selling somebody out.",
    author: "Joan Didion",
    category: "Creativity",
  },
  {
    id: "emerson-poetry",
    text: "Poetry teaches the enormous force of a few words, and, in proportion to the inspiration, checks loquacity.",
    author: "Ralph Waldo Emerson",
    category: "Creativity",
  },
  {
    id: "rilke-porous",
    text: "Make your ego porous. Will is of little importance, complaining is nothing, fame is nothing. Openness, patience, receptivity, solitude is everything.",
    author: "Rainer Maria Rilke",
    category: "Creativity",
  },
  {
    id: "woolf-pieces",
    text: "Arrange whatever pieces come your way.",
    author: "Virginia Woolf",
    category: "Creativity",
  },
  {
    id: "camus-novel",
    text: "A novel is never anything but a philosophy put into images.",
    author: "Albert Camus",
    category: "Creativity",
  },
];
