import React, { useState } from 'react';
import { TESTIMONIALS } from '../data/treatments';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prevIdx) => (prevIdx === 0 ? TESTIMONIALS.length - 1 : prevIdx - 1));
  };

  const next = () => {
    setCurrentIndex((prevIdx) => (prevIdx === TESTIMONIALS.length - 1 ? 0 : prevIdx + 1));
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section className="py-20 sm:py-24 bg-[#F5EFEB]/50 text-[#2D2723] overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Section Header */}
        <span className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold mb-2 block">
          Client Experiences
        </span>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1C2E24] font-normal tracking-tight mb-4"
          style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
        >
          Words from Our Guests
        </h2>
        <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mb-12" />

        {/* Carousel Card */}
        <div className="relative bg-white rounded-3xl p-8 sm:p-14 border border-[#E8DEC8] shadow-md">
          {/* Subtle Quote Icon */}
          <div className="w-12 h-12 rounded-full bg-[#1C2E24]/5 text-[#1C2E24] flex items-center justify-center mx-auto mb-6">
            <Quote className="w-5 h-5 text-[#8C6D46]" />
          </div>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-1 mb-6 text-[#D4AF37]">
            {[...Array(current.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>

          {/* Testimonial Quote */}
          <p
            className="text-lg sm:text-2xl font-serif text-[#1C2E24] font-normal leading-relaxed italic mb-8 max-w-2xl mx-auto"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
          >
            "{current.quote}"
          </p>

          {/* Guest Identity */}
          <div>
            <h4 className="text-base font-semibold text-[#1C2E24]">{current.name}</h4>
            <div className="flex items-center justify-center gap-2 text-xs text-[#8C6D46] mt-1">
              <span>{current.location}</span>
              <span>·</span>
              <span>{current.treatment}</span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-[#F0EAE2]">
            <button
              onClick={prev}
              className="p-2.5 rounded-full border border-[#D8CFC5] text-[#2E2824] hover:bg-[#FAF7F2] hover:border-[#1C2E24] transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'bg-[#1C2E24] w-6'
                      : 'bg-[#DCD0C4] hover:bg-[#8C6D46]'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-2.5 rounded-full border border-[#D8CFC5] text-[#2E2824] hover:bg-[#FAF7F2] hover:border-[#1C2E24] transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
