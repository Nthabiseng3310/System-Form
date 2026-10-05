import React from 'react';
import { QuizEngine } from './QuizEngine';
import { Sparkles } from 'lucide-react';

interface QuizSectionProps {
  onBookingSelect: (treatmentId: string) => void;
  onOpenPrivacyNotice: () => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  onBookingSelect,
  onOpenPrivacyNotice,
}) => {
  return (
    <section id="quiz" className="py-20 sm:py-24 bg-[#FAF7F2] text-[#2D2723] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#8C6D46] text-xs uppercase tracking-widest font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Interactive Spa Matcher</span>
          </div>

          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1C2E24] font-normal tracking-tight mb-3"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
          >
            Discover Your Perfect Treatment ✨
          </h2>

          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mb-5" />

          <p className="text-sm sm:text-base text-[#5A4F47] leading-relaxed">
            Answer 8 quick questions and unlock a treat from Nthabi's Touch. It takes about 60 seconds.
          </p>
        </div>

        {/* Embedded Interactive Quiz Engine */}
        <QuizEngine
          isEmbedded={true}
          onBookingSelect={onBookingSelect}
          onOpenPrivacyNotice={onOpenPrivacyNotice}
        />
      </div>
    </section>
  );
};
