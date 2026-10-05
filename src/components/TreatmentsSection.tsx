import React, { useState } from 'react';
import { TREATMENTS, Treatment, SIGNATURE_LUXE_NOTE } from '../data/treatments';
import { Sparkles, Clock, Calendar, Check, Coffee } from 'lucide-react';

interface TreatmentsSectionProps {
  onSelectTreatment: (treatmentId: string, durationMinutes?: number) => void;
}

export const TreatmentsSection: React.FC<TreatmentsSectionProps> = ({ onSelectTreatment }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'massages' | 'facials-body'>('all');

  const filteredTreatments = TREATMENTS.filter((t) => {
    if (activeTab === 'all') return true;
    return t.category === activeTab;
  });

  return (
    <section id="treatments" className="py-20 sm:py-24 bg-[#F5EFEB]/60 text-[#2D2723]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold mb-2 block">
            Our Spa Menu
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1C2E24] font-normal tracking-tight mb-4"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
          >
            Treatments &amp; Prices
          </h2>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mb-6" />
          <p className="text-sm sm:text-base text-[#5A4F47] leading-relaxed">
            Every session is a bespoke journey of sensory healing and relaxation. Select a treatment below to reserve your appointment online or enquire via WhatsApp.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center mb-12">
          <div className="p-1 bg-[#EBE3D8] rounded-full flex items-center gap-1 shadow-inner max-w-md w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-initial px-5 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-[#1C2E24] text-[#FAF7F2] shadow-sm'
                  : 'text-[#5C5047] hover:text-[#1C2E24]'
              }`}
            >
              All Treatments ({TREATMENTS.length})
            </button>
            <button
              onClick={() => setActiveTab('massages')}
              className={`flex-1 sm:flex-initial px-5 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === 'massages'
                  ? 'bg-[#1C2E24] text-[#FAF7F2] shadow-sm'
                  : 'text-[#5C5047] hover:text-[#1C2E24]'
              }`}
            >
              Massages
            </button>
            <button
              onClick={() => setActiveTab('facials-body')}
              className={`flex-1 sm:flex-initial px-5 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === 'facials-body'
                  ? 'bg-[#1C2E24] text-[#FAF7F2] shadow-sm'
                  : 'text-[#5C5047] hover:text-[#1C2E24]'
              }`}
            >
              Body Rituals &amp; Soaks
            </button>
          </div>
        </div>

        {/* Treatments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTreatments.map((treatment) => {
            const hasMultipleOptions = treatment.options.length > 1;

            return (
              <div
                key={treatment.id}
                className="group rounded-2xl bg-white border border-[#E5DDD4] hover:border-[#C5A880] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div>
                  {/* Card Image */}
                  <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-[#EFEAE2]">
                    <img
                      src={treatment.image}
                      alt={treatment.altText}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Category Label */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-[#1C2E24]/85 backdrop-blur-sm text-[#FAF7F2] text-[11px] font-medium tracking-wider uppercase">
                        {treatment.categoryLabel}
                      </span>
                    </div>

                    {/* Signature Luxe Badge */}
                    {treatment.isSignatureLuxe && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-md bg-[#D4AF37] text-[#16241B] text-[11px] font-semibold tracking-wide flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3 h-3 text-[#16241B]" />
                          Signature Luxe
                        </span>
                      </div>
                    )}

                    {/* Price banner at bottom of image for instant scanning */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-[#FAF7F2]">
                      <span className="text-xs font-light text-[#E5DDD4]">
                        {treatment.options[0]?.durationLabel}
                      </span>
                      <span className="text-lg font-serif font-semibold tracking-tight text-[#FAF7F2]">
                        {treatment.options.length === 1
                          ? treatment.options[0]?.priceDisplay
                          : `From ${treatment.options[0]?.priceDisplay}`}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <h3
                      className="text-xl sm:text-2xl font-serif text-[#1C2E24] mb-2 font-normal leading-snug group-hover:text-[#8C6D46] transition-colors"
                      style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
                    >
                      {treatment.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#5C5047] leading-relaxed mb-4">
                      {treatment.fullDescription}
                    </p>

                    {/* Notice for 3 days pre-booking if required */}
                    {treatment.minDaysInAdvance && (
                      <div className="mb-4 px-3 py-2 rounded-lg bg-[#FAF0E6] border border-[#E8DEC8] text-[11px] text-[#8C5D30] font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0 text-[#8C5D30]" />
                        <span>Requires at least 3 days advance pre-booking for fresh botanical preparation.</span>
                      </div>
                    )}

                    {/* Signature Luxe Complimentary Note */}
                    {treatment.isSignatureLuxe && (
                      <div className="mb-4 px-3 py-2 rounded-lg bg-[#F8F5EE] border border-[#E8DFC8] text-[11px] text-[#4A3F35] flex items-start gap-1.5">
                        <Coffee className="w-3.5 h-3.5 shrink-0 text-[#D4AF37] mt-0.5" />
                        <span className="leading-snug">
                          {SIGNATURE_LUXE_NOTE}
                        </span>
                      </div>
                    )}

                    {/* Benefits List */}
                    {treatment.benefits && (
                      <div className="space-y-1.5 mb-5 pt-2 border-t border-[#F0EAE2]">
                        {treatment.benefits.map((b, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[#6B5E55]">
                            <Check className="w-3.5 h-3.5 text-[#8C6D46] shrink-0" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Pricing Options & Booking Action */}
                <div className="px-6 pb-6 pt-2 border-t border-[#F3ECE4] bg-[#FAF8F5]/50">
                  <div className="mb-4">
                    <span className="text-[11px] uppercase tracking-wider text-[#8C6D46] font-semibold block mb-2">
                      Available Options
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {treatment.options.map((opt) => (
                        <div
                          key={opt.durationMinutes}
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#E2D8CC] text-xs font-medium text-[#2E2824] flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <span className="text-[#6B5E55]">{opt.durationLabel}</span>
                          <span className="font-semibold text-[#1C2E24]">{opt.priceDisplay}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectTreatment(treatment.id, treatment.options[0]?.durationMinutes);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1C2E24] hover:bg-[#2A4234] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider transition-colors duration-200 shadow-sm flex items-center justify-center gap-2 group-hover:bg-[#1C2E24]"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Book this treatment</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
