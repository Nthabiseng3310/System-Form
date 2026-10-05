import { TREATMENTS, Treatment } from './treatments';

export interface QuizOption {
  id: string;
  label: string;
  emoji: string;
  description?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  subtext?: string;
  type: 'multi' | 'single' | 'occupation' | 'location' | 'demographics' | 'community' | 'contact';
  options?: QuizOption[];
  encouragement?: string;
  skipAllowed?: boolean;
}

export const REWARD_CONFIG = {
  prefix: 'NT-',
  discountText: '10% off your first booking',
  voucherTitle: 'Welcome Treat · 10% Off',
  description: 'Valid for 30 days towards any treatment at Nthabi’s Touch in Sandton / Fourways.',
  validityDays: 30,
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'What are you in the mood for?',
    subtext: 'Choose one or more treatments you would love to experience.',
    type: 'multi',
    encouragement: 'Lovely selection! We have crafted something special for you 🌸',
    options: [
      { id: 'swedish', label: 'Swedish Massage', emoji: '🌿', description: 'Long flowing strokes for total ease' },
      { id: 'thai', label: 'Thai Massage', emoji: '🧘‍♀️', description: 'Healing stretching & joint mobility' },
      { id: 'hot-stone', label: 'Hot Stone Therapy', emoji: '🪨', description: 'Heated basalt stones melting knots' },
      { id: 'deep-tissue', label: 'Deep Tissue Massage', emoji: '💪', description: 'Targeted chronic tension release' },
      { id: 'back-neck-shoulder', label: 'Back, Neck & Shoulder', emoji: '💆‍♀️', description: 'Fast relief for desk fatigue' },
      { id: 'indian-head', label: 'Indian Head Massage', emoji: '✨', description: 'Calming scalp & acupressure therapy' },
      { id: 'aromatherapy', label: 'Aromatherapy Luxe', emoji: '🌸', description: 'Essential oils & immune booster' },
      { id: 'milk-soak', label: 'Milk & Flower Soak', emoji: '🛁', description: 'Rose petal bath & deep hydration' },
      { id: 'charcoal-scrub', label: 'Charcoal Exfoliation', emoji: '🌑', description: 'Detoxifying body cleanse' },
      { id: 'salt-glow', label: 'Salt Glow Therapy', emoji: '🧂', description: 'Silky mineral renewal polish' },
    ],
  },
  {
    id: 2,
    question: 'What do you need most right now?',
    subtext: 'Pick what your body or mind is calling for today.',
    type: 'single',
    encouragement: 'Listening to your body is where genuine healing begins 🌿',
    options: [
      { id: 'stress-relief', label: 'Stress relief & mental calm', emoji: '🕯️' },
      { id: 'muscle-pain', label: 'Relief from muscle pain or tension', emoji: '⚡' },
      { id: 'glowing-skin', label: 'Glowing, silky skin', emoji: '✨' },
      { id: 'pure-pampering', label: 'Pure, uninterrupted pampering', emoji: '🥂' },
      { id: 'special-occasion', label: 'Celebrating a special occasion', emoji: '🎉' },
      { id: 'gift', label: 'A thoughtful gift for someone special', emoji: '🎁' },
    ],
  },
  {
    id: 3,
    question: 'How often would you treat yourself?',
    subtext: 'Help us design self-care plans that fit your natural rhythm.',
    type: 'single',
    encouragement: 'Consistency is the secret to enduring vitality ✨',
    options: [
      { id: 'weekly', label: 'Weekly – wellness is my priority', emoji: '🌱' },
      { id: 'monthly', label: 'Monthly – a regular monthly reset', emoji: '🗓️' },
      { id: 'few-times-year', label: 'A few times a year – seasonal refresh', emoji: '🍃' },
      { id: 'special-occasions', label: 'Special occasions only', emoji: '🥂' },
      { id: 'first-time', label: 'This is my first time exploring spa treatments', emoji: '💫' },
    ],
  },
  {
    id: 4,
    question: 'What keeps you busy?',
    subtext: 'Understanding your daily posture helps us target tight muscles.',
    type: 'occupation',
    encouragement: 'Great insight! Different lifestyles place tension in unique places 💼',
    options: [
      { id: 'working-pro', label: 'Working professional', emoji: '💼' },
      { id: 'business-owner', label: 'Business owner / self-employed', emoji: '🚀' },
      { id: 'student', label: 'Student', emoji: '📚' },
      { id: 'parent', label: 'Stay-at-home parent', emoji: '🏡' },
      { id: 'between-jobs', label: 'Between jobs / in transition', emoji: '🔄' },
      { id: 'retired', label: 'Retired', emoji: '🌅' },
      { id: 'other', label: 'Other', emoji: '✨' },
    ],
  },
  {
    id: 5,
    question: 'Where are you based?',
    subtext: 'Our studio is in the Sandton & Fourways area of Johannesburg.',
    type: 'location',
    encouragement: 'Wonderful! You are just around the corner from our sanctuary 📍',
    options: [
      { id: 'sandton', label: 'Sandton', emoji: '🏙️' },
      { id: 'fourways', label: 'Fourways', emoji: '🌳' },
      { id: 'bryanston', label: 'Bryanston', emoji: '🏡' },
      { id: 'randburg', label: 'Randburg', emoji: '🌇' },
      { id: 'midrand', label: 'Midrand', emoji: '🛣️' },
      { id: 'rosebank', label: 'Rosebank / Johannesburg North', emoji: '☕' },
      { id: 'other', label: 'Other area (please specify)', emoji: '📍' },
    ],
  },
  {
    id: 6,
    question: 'A little about you',
    subtext: 'Optional details to help tailor our treatment room ambiance.',
    type: 'demographics',
    skipAllowed: true,
    encouragement: 'Almost there! Your personal treat is nearly unlocked 🎁',
  },
  {
    id: 7,
    question: 'Help us understand our community',
    subtext: 'Optional. Used only for anonymous community insights, never for pricing or to judge you.',
    type: 'community',
    skipAllowed: true,
    encouragement: 'Thank you for helping us grow an inclusive sanctuary 💛',
    options: [
      { id: 'black-african', label: 'Black African', emoji: '🇿🇦' },
      { id: 'coloured', label: 'Coloured', emoji: '✨' },
      { id: 'indian-asian', label: 'Indian / Asian', emoji: '🌸' },
      { id: 'white', label: 'White', emoji: '🌿' },
      { id: 'other', label: 'Other', emoji: '💫' },
      { id: 'prefer-not-say', label: 'Prefer not to say', emoji: '🔒' },
    ],
  },
  {
    id: 8,
    question: 'Where should we send your result and reward?',
    subtext: 'Your 10% voucher code and bespoke spa personality will be unlocked instantly.',
    type: 'contact',
  },
];

export interface QuizAnswers {
  treatments: string[]; // Q1
  mainNeed: string; // Q2
  visitFrequency: string; // Q3
  occupationStatus: string; // Q4
  jobTitleOrStudy?: string; // Q4 optional
  area: string; // Q5
  suburbOther?: string; // Q5 optional
  gender?: string; // Q6
  ageRange?: string; // Q6
  race?: string; // Q7
  firstName: string; // Q8
  mobile: string; // Q8
  email: string; // Q8
  preferredContact: 'WhatsApp' | 'Call' | 'Email'; // Q8
  consentGiven: boolean; // Q8
  honeypot?: string; // spam protection
}

export interface SpaPersonality {
  id: string;
  title: string;
  emoji: string;
  tagline: string;
  description: string;
  recommendedTreatmentIds: string[];
}

export const SPA_PERSONALITIES: Record<string, SpaPersonality> = {
  deepReset: {
    id: 'deepReset',
    title: 'The Deep Reset',
    emoji: '🪨',
    tagline: 'Liberating Muscle Release & Postural Relief',
    description: 'You carry the world on your shoulders. Your body responds best to deep, firm pressure and heated stones that break through chronic knots, revitalising tired fibres and clearing postural fatigue.',
    recommendedTreatmentIds: ['deep-tissue-massage', 'hot-stone-massage'],
  },
  glowSeeker: {
    id: 'glowSeeker',
    title: 'The Glow Seeker',
    emoji: '✨',
    tagline: 'Radiant Skin Renewal & Botanical Nourishment',
    description: 'You thrive on sensory indulgence and radiant skin vitality. Exfoliating natural scrubs and flower petal milk baths nourish your epidermal barrier, leaving you glowing from collar to toe.',
    recommendedTreatmentIds: ['luxe-milk-flower-soak', 'charcoal-full-body-exfoliation'],
  },
  serenityLover: {
    id: 'serenityLover',
    title: 'The Serenity Lover',
    emoji: '🕯️',
    tagline: 'Holistic Stress Release & Nervous System Calm',
    description: 'You seek quietude, ambient candlelight, and pure essential oils. Your nervous system craves rhythmic, soothing touch that lowers cortisol and returns your mind to still waters.',
    recommendedTreatmentIds: ['aromatherapy-signature-luxe', 'swedish-massage'],
  },
  celebrator: {
    id: 'celebrator',
    title: 'The Celebrator',
    emoji: '🥂',
    tagline: 'Milestone Pampering, Bubbles & Shared Joy',
    description: 'You believe milestones deserve intentional celebration. Paired with complimentary chilled bubbles, soothing head massages, and couple soaks, every minute feels memorable.',
    recommendedTreatmentIds: ['luxe-milk-flower-soak', 'aromatherapy-signature-luxe'],
  },
};

export function determineSpaPersonality(answers: Partial<QuizAnswers>): SpaPersonality {
  const need = answers.mainNeed || '';
  const selectedTreatments = answers.treatments || [];

  if (need === 'muscle-pain' || selectedTreatments.includes('deep-tissue') || selectedTreatments.includes('hot-stone')) {
    return SPA_PERSONALITIES.deepReset;
  }
  if (need === 'glowing-skin' || selectedTreatments.includes('milk-soak') || selectedTreatments.includes('charcoal-scrub') || selectedTreatments.includes('salt-glow')) {
    return SPA_PERSONALITIES.glowSeeker;
  }
  if (need === 'special-occasion' || need === 'gift' || need === 'pure-pampering') {
    return SPA_PERSONALITIES.celebrator;
  }
  return SPA_PERSONALITIES.serenityLover;
}

export function getRecommendedTreatments(personality: SpaPersonality): Treatment[] {
  return personality.recommendedTreatmentIds
    .map((id) => TREATMENTS.find((t) => t.id === id))
    .filter((t): t is Treatment => Boolean(t));
}

// Generate unique reward code
export function generateRewardCode(prefix = REWARD_CONFIG.prefix): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}${random}`;
}
