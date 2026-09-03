export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
}

export const CATEGORIES = [
  "Wisdom",
  "Love",
  "Courage",
  "Mindfulness",
  "Growth",
  "Creativity",
] as const;

export const QUOTES: Quote[] = [
  {
    id: "1",
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "Wisdom",
  },
  {
    id: "2",
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "Courage",
  },
  {
    id: "3",
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
    category: "Creativity",
  },
  {
    id: "4",
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    category: "Wisdom",
  },
  {
    id: "5",
    text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
    author: "Thich Nhat Hanh",
    category: "Mindfulness",
  },
  {
    id: "6",
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
    category: "Growth",
  },
  {
    id: "7",
    text: "Where there is love there is life.",
    author: "Mahatma Gandhi",
    category: "Love",
  },
  {
    id: "8",
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon",
    category: "Wisdom",
  },
  {
    id: "9",
    text: "Creativity takes courage.",
    author: "Henri Matisse",
    category: "Creativity",
  },
  {
    id: "10",
    text: "You must be the change you wish to see in the world.",
    author: "Mahatma Gandhi",
    category: "Growth",
  },
  {
    id: "11",
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "Courage",
  },
  {
    id: "12",
    text: "Almost everything will work again if you unplug it for a few minutes, including you.",
    author: "Anne Lamott",
    category: "Mindfulness",
  },
  {
    id: "13",
    text: "To love and be loved is to feel the sun from both sides.",
    author: "David Viscott",
    category: "Love",
  },
  {
    id: "14",
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    category: "Growth",
  },
  {
    id: "15",
    text: "Imagination is the beginning of creation.",
    author: "George Bernard Shaw",
    category: "Creativity",
  },
];
