import React from 'react';
import { SpaLotusHandIcon } from './Logo';
import { Calendar, Sparkles, ArrowDown } from 'lucide-react';
import { BUSINESS_INFO } from '../data/treatments';

interface HeroSectionProps {
  onBookNow: () => void;
  onViewTreatments: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onBookNow, onViewTreatments }) => {
  return (
    <section className="relative min-h-[92vh] sm:min-h-[95vh] flex items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
      {/* Background Hero Image with soft, luxurious dark overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_spa_room_1790719191476.jpg"
          alt="Tranquil candle-lit massage therapy suite at Nthabi's Touch day spa"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
          referrerPolicy="no-referrer"
        />
        {/* Soft multi-stop luxury dark gradient overlay ensuring 4.5:1+ text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111C15]/95 via-[#16241B]/80 to-[#1B2A20]/65" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center text-[#FAF7F2] flex flex-col items-center">
        {/* Subtle Brand Pill / Crest */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7F2]/10 backdrop-blur-md border border-[#FAF7F2]/20 text-[#D4AF37] text-xs uppercase tracking-widest mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <SpaLotusHandIcon className="w-4 h-4 text-[#D4AF37]" />
          <span>Boutique Spa · Sandton &amp; Fourways</span>
        </div>

        {/* Studio Name Title */}
        <h2 className="text-xl sm:text-2xl font-light text-[#E8DEC8] tracking-widest uppercase mb-3">
          Nthabi's Touch
        </h2>

        {/* Primary Headline */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-[#FAF7F2] font-normal leading-[1.15] mb-6 tracking-tight max-w-2xl text-balance"
          style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
        >
          Where Every Touch Restores You
        </h1>

        {/* Short Subline */}
        <p className="text-base sm:text-lg md:text-xl text-[#E5DDD4] font-light max-w-xl mb-10 leading-relaxed text-balance">
          A tranquil day spa sanctuary in Johannesburg offering bespoke therapeutic massages, restorative body rituals, and signature milk soak experiences.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onBookNow}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#D4AF37] hover:bg-[#C29D2C] text-[#16241B] font-semibold text-sm rounded-full transition-all duration-200 shadow-lg shadow-black/25 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2.5"
          >
            <Calendar className="w-4 h-4 text-[#16241B]" />
            <span>Book Now</span>
          </button>

          <button
            onClick={onViewTreatments}
            className="w-full sm:w-auto px-7 py-3.5 bg-[#FAF7F2]/10 hover:bg-[#FAF7F2]/20 backdrop-blur-md text-[#FAF7F2] border border-[#FAF7F2]/30 font-medium text-sm rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>View Treatments</span>
            <ArrowDown className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>

        {/* Highlight Metadata Row */}
        <div className="mt-14 pt-8 border-t border-[#FAF7F2]/15 w-full flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[#E5DDD4]/80">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span>Certified Holistic Therapists</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span>Signature Luxe Refreshments</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span>Private &amp; Peaceful Setting</span>
          </div>
        </div>
      </div>
    </section>
  );
};
