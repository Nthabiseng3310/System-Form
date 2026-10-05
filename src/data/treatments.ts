export interface TreatmentOption {
  durationMinutes: number;
  durationLabel: string;
  priceZAR: number;
  priceDisplay: string;
}

export interface Treatment {
  id: string;
  name: string;
  category: 'massages' | 'facials-body';
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  options: TreatmentOption[];
  isSignatureLuxe?: boolean;
  minDaysInAdvance?: number; // e.g. 3 days for Milk & Flower Soak
  image: string;
  altText: string;
  benefits?: string[];
  forCouples?: boolean;
}

export const TREATMENTS: Treatment[] = [
  // MASSAGES
  {
    id: 'swedish-massage',
    name: 'Swedish Massage',
    category: 'massages',
    categoryLabel: 'Massage Therapy',
    shortDescription: 'Classic full-body relaxation using long flowing strokes and gentle kneading.',
    fullDescription: 'A classic full-body massage that uses long strokes, kneading, friction and other techniques to promote relaxation and increase circulation.',
    options: [
      { durationMinutes: 60, durationLabel: '60 min', priceZAR: 850, priceDisplay: 'R850' },
      { durationMinutes: 90, durationLabel: '90 min', priceZAR: 1200, priceDisplay: 'R1 200' },
    ],
    image: '/src/assets/images/swedish_massage_1790719203105.jpg',
    altText: 'Peaceful massage table prepared with fresh ivory linens, warm botanical oils, and eucalyptus sprigs',
    benefits: ['Relieves tension', 'Enhances circulation', 'Deep full-body relaxation'],
  },
  {
    id: 'thai-massage',
    name: 'Thai Massage',
    category: 'massages',
    categoryLabel: 'Massage Therapy',
    shortDescription: 'Healing touch designed to improve flexibility and relieve muscle tension.',
    fullDescription: 'Experience the healing touch of our Thai Massage, designed to improve flexibility, relieve muscle tension and leave you feeling completely renewed.',
    options: [
      { durationMinutes: 60, durationLabel: '60 min', priceZAR: 990, priceDisplay: 'R990' },
      { durationMinutes: 90, durationLabel: '90 min', priceZAR: 1450, priceDisplay: 'R1 450' },
    ],
    image: '/src/assets/images/hero_spa_room_1790719191476.jpg',
    altText: 'Tranquil private massage therapy suite with ambient warm lighting and calm natural decor',
    benefits: ['Aids joint mobility', 'Re-energises body flow', 'Deep assisted stretching'],
  },
  {
    id: 'hot-stone-massage',
    name: 'Hot Stone Massage',
    category: 'massages',
    categoryLabel: 'Massage Therapy',
    shortDescription: 'Heated basalt stones melt away muscle knots and induce profound calmness.',
    fullDescription: 'The heat from the stones helps to relax the muscles and increase circulation, allowing the therapist to apply deeper pressure, if desired.',
    options: [
      { durationMinutes: 60, durationLabel: '60 min', priceZAR: 880, priceDisplay: 'R880' },
      { durationMinutes: 90, durationLabel: '90 min', priceZAR: 1270, priceDisplay: 'R1 270' },
    ],
    image: '/src/assets/images/hot_stone_therapy_1790719218919.jpg',
    altText: 'Polished heated black volcanic basalt stones resting beside fragrant botanical essential oils',
    benefits: ['Thermal muscle relief', 'Dissolves stress', 'Deep restorative warmth'],
  },
  {
    id: 'deep-tissue-massage',
    name: 'Deep Tissue Massage',
    category: 'massages',
    categoryLabel: 'Massage Therapy',
    shortDescription: 'Targeted therapeutic work on deeper muscle layers to resolve chronic tightness.',
    fullDescription: 'Focuses on the deeper layers of muscle and connective tissue. Used to treat chronic tension, muscle pain and injury rehabilitation.',
    options: [
      { durationMinutes: 60, durationLabel: '60 min', priceZAR: 1460, priceDisplay: 'R1 460' },
      { durationMinutes: 90, durationLabel: '90 min', priceZAR: 1760, priceDisplay: 'R1 760' },
    ],
    image: '/src/assets/images/swedish_massage_1790719203105.jpg',
    altText: 'Therapeutic massage treatment area with targeted pressure oils and comfortable table support',
    benefits: ['Releases chronic knots', 'Post-workout recovery', 'Postural alignment'],
  },
  {
    id: 'back-neck-shoulder',
    name: 'Back, Neck & Shoulder Massage',
    category: 'massages',
    categoryLabel: 'Massage Therapy',
    shortDescription: 'Focused therapy targeting the primary trigger zones of workday strain.',
    fullDescription: 'A therapeutic massage that focuses on the three areas of the body commonly associated with tension, stress and pain.',
    options: [
      { durationMinutes: 45, durationLabel: '45 min', priceZAR: 665, priceDisplay: 'R665' },
      { durationMinutes: 60, durationLabel: '60 min', priceZAR: 890, priceDisplay: 'R890' },
    ],
    image: '/src/assets/images/hot_stone_therapy_1790719218919.jpg',
    altText: 'Specialised massage therapy room with ergonomic headrest and soothing lavender oils',
    benefits: ['Desk posture relief', 'Alleviates neck stiffness', 'Rapid stress reduction'],
  },
  {
    id: 'indian-head-massage',
    name: 'Indian Head Massage',
    category: 'massages',
    categoryLabel: 'Massage Therapy',
    shortDescription: 'Revitalising pressure point therapy across the scalp, neck, and shoulders.',
    fullDescription: 'The therapist uses techniques including kneading, pressing and stroking to work on the pressure points of the head, neck and shoulders.',
    options: [
      { durationMinutes: 30, durationLabel: '30 min', priceZAR: 590, priceDisplay: 'R590' },
      { durationMinutes: 60, durationLabel: '60 min', priceZAR: 790, priceDisplay: 'R790' },
    ],
    image: '/src/assets/images/hero_spa_room_1790719191476.jpg',
    altText: 'Quiet spa corner with organic botanical oils and candles for head and scalp acupressure',
    benefits: ['Calms mental fatigue', 'Eases tension headaches', 'Promotes restful sleep'],
  },
  {
    id: 'aromatherapy-signature-luxe',
    name: 'Aromatherapy Signature Luxe Massage',
    category: 'massages',
    categoryLabel: 'Massage Therapy',
    shortDescription: 'Pure botanical essential oils paired with bespoke restorative massage strokes.',
    fullDescription: 'Promotes relaxation, relieves stress and tension, improves circulation and boosts the immune system.',
    options: [
      { durationMinutes: 60, durationLabel: '60 min', priceZAR: 1260, priceDisplay: 'R1 260' },
      { durationMinutes: 90, durationLabel: '90 min', priceZAR: 1665, priceDisplay: 'R1 665' },
    ],
    isSignatureLuxe: true,
    image: '/src/assets/images/swedish_massage_1790719203105.jpg',
    altText: 'Handcrafted essential oil infusions and fresh flowers in a luxury spa sanctuary',
    benefits: ['Bespoke aromatherapy blend', 'Immune system support', 'Complimentary luxury refreshments'],
  },

  // FACIALS & BODY TREATMENTS
  {
    id: 'luxe-milk-flower-soak',
    name: 'Luxe Milk & Flower Soak',
    category: 'facials-body',
    categoryLabel: 'Body Rituals',
    shortDescription: 'Warm, fragrant milk and fresh rose petal bath for deep skin hydration.',
    fullDescription: 'Escape to a milk and flower bath infused with essential oils, combining the moisturising, soothing properties of a milk bath with the aromatic, relaxing effects of flower petals, to naturally nourish the skin and promote relaxation.',
    options: [
      { durationMinutes: 60, durationLabel: '60 min (Per Couple)', priceZAR: 1700, priceDisplay: 'R1 700' },
    ],
    isSignatureLuxe: true,
    minDaysInAdvance: 3,
    forCouples: true,
    image: '/src/assets/images/milk_flower_bath_1790719228348.jpg',
    altText: 'Freestanding spa soaking tub brimming with silky milk water, fresh floating pink rose petals, and warm candles',
    benefits: ['Intense skin hydration', '3-day fresh floral preparation', 'Complimentary chilled bubbles & tea'],
  },
  {
    id: 'charcoal-full-body-exfoliation',
    name: 'Charcoal Full Body Exfoliation',
    category: 'facials-body',
    categoryLabel: 'Body Rituals',
    shortDescription: 'Deeply detoxifying activated charcoal polish that purifies and illuminates skin.',
    fullDescription: 'Charcoal absorbs impurities and toxins and cleanses the skin deeply, leaving it looking more youthful and radiant.',
    options: [
      { durationMinutes: 30, durationLabel: '30 min', priceZAR: 890, priceDisplay: 'R890' },
    ],
    isSignatureLuxe: true,
    image: '/src/assets/images/charcoal_salt_scrub_1790719238092.jpg',
    altText: 'Ceramic bowls with activated charcoal body exfoliant scrub and botanical extracts',
    benefits: ['Draws out skin impurities', 'Silky skin texture', 'Complimentary luxury refreshments'],
  },
  {
    id: 'salt-glow-full-body-therapy',
    name: 'Salt Glow Full Body Therapy',
    category: 'facials-body',
    categoryLabel: 'Body Rituals',
    shortDescription: 'Mineral-rich marine salt scrub buffing away dead cells for velvety soft skin.',
    fullDescription: 'Removes dead skin cells, unclogs pores and stimulates new skin cell growth, leaving skin smoother, brighter and more even-toned.',
    options: [
      { durationMinutes: 30, durationLabel: '30 min', priceZAR: 790, priceDisplay: 'R790' },
    ],
    isSignatureLuxe: true,
    image: '/src/assets/images/charcoal_salt_scrub_1790719238092.jpg',
    altText: 'Fine pink Himalayan and sea salt scrub crystals with nourishing aromatic body oils',
    benefits: ['Stimulates cellular renewal', 'Unclogs and refines pores', 'Complimentary luxury refreshments'],
  },
];

export const SIGNATURE_LUXE_NOTE = 'Includes a complimentary glass of bubbles, coffee, tea, soft drinks & infused water';

export const BUSINESS_INFO = {
  name: "Nthabi's Touch",
  tagline: 'Relax. Restore. Renew.',
  subline: 'Where Every Touch Restores You',
  area: 'Sandton / Fourways area, Johannesburg, South Africa',
  phoneDisplay: '076 200 6014',
  phoneInternational: '+27762006014',
  phoneCall: 'tel:+27762006014',
  whatsappUrl: 'https://wa.me/27762006014',
  email: 'rakuoanenthabiseng17@gmail.com',
  hoursDisplay: 'Monday to Saturday: 08:00 – 17:00 (Closed Sundays)',
  openDaysText: 'Mon – Sat: 08:00 – 17:00',
  closedDaysText: 'Sunday: Closed',
  startHour: 8,
  endHour: 17,
  slotIntervalMinutes: 30,
};

export const TESTIMONIALS = [
  {
    id: 'test-1',
    name: 'Lerato M.',
    location: 'Sandton, Johannesburg',
    treatment: 'Aromatherapy Signature Luxe',
    quote: 'From the warm welcome with fresh infused water to the therapeutic aromatherapy massage, Nthabi’s touch is pure magic. I left feeling completely restored and lighter.',
    rating: 5,
  },
  {
    id: 'test-2',
    name: 'Brenda K.',
    location: 'Fourways, Johannesburg',
    treatment: 'Luxe Milk & Flower Soak',
    quote: 'Booked the Milk & Flower soak for our anniversary. The scented petals, candlelight, and complimentary bubbles made it an unforgettable couple’s retreat right in Fourways.',
    rating: 5,
  },
  {
    id: 'test-3',
    name: 'David S.',
    location: 'Bryanston, Johannesburg',
    treatment: 'Deep Tissue Massage',
    quote: 'As someone who trains 5 days a week, the deep tissue massage here is unmatched. Professional, attentive therapist who knew exactly where to release the tension.',
    rating: 5,
  },
];
