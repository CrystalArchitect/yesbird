export const MASCOTS = ["bunny", "bear", "kitty", "duck", "lovebirds"] as const;
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
  bear: {
    label: "Boba the bear",
    blurb: "Soft, sleepy, carries a heart everywhere.",
    emoji: "🐻",
  },
  kitty: {
    label: "Dumpling the kitty",
    blurb: "Pretends not to care. Cares enormously.",
    emoji: "🐱",
  },
  duck: {
    label: "Peach the duckling",
    blurb: "Waddles in with a flower. Every single time.",
    emoji: "🐥",
  },
  lovebirds: {
    label: "The lovebirds",
    blurb: "Two little birds who only sing duets.",
    emoji: "🐦",
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

/** Little sticker-style reactions the mascot blurts out while they answer. Written in the asker's voice. */
export const TIME_REACTIONS: Record<TimeId, string> = {
  brunch: "Brunch. Pancakes are a love language.",
  lunch: "Lunch. Casual. Smart. I see you.",
  afternoon: "Afternoon tea. Fancy. I'll wear a shirt with buttons.",
  sunset: "Golden hour. Okay, that's very romantic.",
  dinner: "Dinner. Classic. Candles optional (they're not optional).",
  latenight: "Late night. Stargazing potential detected.",
};

export const FOOD_REACTIONS: Record<(typeof FOODS)[number], string> = {
  "Korean BBQ": "Korean BBQ. You have taste. Noted.",
  Sushi: "Sushi. Elegant. I'll practice with chopsticks.",
  Ramen: "Ramen. Slurping is allowed. Encouraged.",
  Italian: "Italian. Very romantic of you.",
  Pizza: "Pizza. A person of the people.",
  Tacos: "Tacos!! Tuesday or not.",
  Hotpot: "Hotpot. A long dinner. Perfect.",
  "Dim sum": "Dim sum. Brunch date confirmed.",
  Thai: "Thai. Spicy. Like this invitation.",
  Burgers: "Burgers. No judgement. Respect, actually.",
  Vegan: "Vegan. I know a place. Probably.",
  "Dessert first": "Dessert first?? Okay, we're going to get along.",
  "Bubble tea": "Bubble tea. Say less.",
  "Coffee & pastries": "Coffee & pastries. Cozy. Love it.",
  "Street food": "Street food. Adventurous. Cute.",
  "Anything, honestly": "Anything, honestly. Dangerous. Noted.",
};

export const INTEREST_REACTIONS: Record<(typeof INTERESTS)[number], string> = {
  Movies: "Movies. I won't talk during them. Much.",
  "K-dramas": "K-dramas?? We are going to get along.",
  Karaoke: "Karaoke. I only know the choruses.",
  Arcade: "Arcade. Prepare to lose at air hockey.",
  Museums: "Museums. Pretending to understand art, together.",
  Bookstores: "Bookstores. Quiet. Then coffee. Perfect.",
  "Live music": "Live music. Ears ringing, hearts full.",
  Stargazing: "Stargazing. Okay, that's very romantic.",
  Hiking: "Hiking. I'll carry the snacks.",
  "Board games": "Board games. I'm competitive. Sorry in advance.",
  Photography: "Photography. Golden hour it is.",
  "Cooking together": "Cooking together. Nobody burns anything. Hopefully.",
  "Night markets": "Night markets. Eat everything. Twice.",
  "Cat cafés": "Cat cafés. The kitty approves.",
  Dancing: "Dancing. Two left feet, one big heart.",
  "Long drives": "Long drives. You pick the playlist.",
};

export const CONTACT_REACTIONS: Record<ContactMethod, string> = {
  text: "Text. I'll try not to double-text. No promises.",
  call: "A call?! Brave. I like it.",
  whatsapp: "WhatsApp. Voice notes incoming.",
  instagram: "Instagram. I have definitely already seen your story.",
};

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
