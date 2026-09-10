export const MASCOTS = ["bunny", "lovebirds", "bear"] as const;
export type Mascot = (typeof MASCOTS)[number];

export const MASCOT_META: Record<
  Mascot,
  { label: string; blurb: string; emoji: string }
> = {
  bunny: {
    label: "Mochi the bunny",
    blurb: "Shy, blushes a lot, wiggles ears when happy.",
    emoji: "🐰",
  },
  lovebirds: {
    label: "The lovebirds",
    blurb: "Two little birds who only sing duets.",
    emoji: "🐦",
  },
  bear: {
    label: "Boba the bear",
    blurb: "Soft, sleepy, carries a heart everywhere.",
    emoji: "🐻",
  },
};

export const VIBES = [
  { id: "dinner", label: "Dinner", emoji: "🍝" },
  { id: "coffee", label: "Coffee & a walk", emoji: "☕" },
  { id: "movie", label: "Movie night", emoji: "🎬" },
  { id: "picnic", label: "Picnic", emoji: "🧺" },
  { id: "surprise", label: "Surprise me", emoji: "🎁" },
] as const;
export type Vibe = (typeof VIBES)[number]["id"];
export const VIBE_IDS = VIBES.map((v) => v.id) as [Vibe, ...Vibe[]];

export const TIMES = [
  { id: "brunch", label: "Brunch", hint: "11:00 AM", emoji: "🥞" },
  { id: "lunch", label: "Lunch", hint: "1:00 PM", emoji: "🍜" },
  { id: "afternoon", label: "Afternoon", hint: "3:30 PM", emoji: "🍵" },
  { id: "sunset", label: "Golden hour", hint: "6:00 PM", emoji: "🌇" },
  { id: "dinner", label: "Dinner", hint: "8:00 PM", emoji: "🕯️" },
  { id: "latenight", label: "Late night", hint: "10:00 PM", emoji: "🌙" },
] as const;
export type TimeId = (typeof TIMES)[number]["id"];
export const TIME_IDS = TIMES.map((t) => t.id) as [TimeId, ...TimeId[]];
export const TIME_BY_ID = Object.fromEntries(TIMES.map((t) => [t.id, t])) as Record<
  TimeId,
  (typeof TIMES)[number]
>;

export const FOODS = [
  "Korean BBQ",
  "Sushi",
  "Ramen",
  "Italian",
  "Pizza",
  "Tacos",
  "Hotpot",
  "Dim sum",
  "Thai",
  "Burgers",
  "Vegan",
  "Dessert first",
  "Bubble tea",
  "Coffee & pastries",
  "Street food",
  "Anything, honestly",
] as const;

export const INTERESTS = [
  "Movies",
  "K-dramas",
  "Karaoke",
  "Arcade",
  "Museums",
  "Bookstores",
  "Live music",
  "Stargazing",
  "Hiking",
  "Board games",
  "Photography",
  "Cooking together",
  "Night markets",
  "Cat cafés",
  "Dancing",
  "Long drives",
] as const;

export const CONTACT_METHODS = [
  { id: "text", label: "Text me", emoji: "💬" },
  { id: "call", label: "Call me", emoji: "📞" },
  { id: "whatsapp", label: "WhatsApp", emoji: "💚" },
  { id: "instagram", label: "Instagram DM", emoji: "📸" },
] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number]["id"];
export const CONTACT_METHOD_IDS = CONTACT_METHODS.map((c) => c.id) as [
  ContactMethod,
  ...ContactMethod[],
];

export const MESSAGE_IDEAS = [
  "I've been trying to find the right moment to ask you this, so I made one.",
  "Every time we talk I forget what I was going to say. Dinner, so I can try again?",
  "I asked a bunny to ask you for me. Please don't make the bunny sad.",
  "No pressure. (Some pressure. The No button is very small.)",
  "I'd like to hear about your day, in person, over something warm.",
];

export const NO_BUTTON_LINES = [
  "No",
  "Are you sure?",
  "Really sure?",
  "Think about it…",
  "Pretty please?",
  "The bunny is watching",
  "Don't do this",
  "You're breaking my heart",
  "Last chance…",
  "Okay, Yes it is",
];
