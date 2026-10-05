import React from 'react';
import { Sparkles, HeartHandshake, Feather, Coffee, CheckCircle2 } from 'lucide-react';
import { SpaLotusHandIcon } from './Logo';

export const AboutSection: React.FC = () => {
  const highlights = [
    {
      icon: HeartHandshake,
      title: 'Professional Therapists',
      description: 'Caring, certified practitioners dedicated to holistic recovery, soothing tired muscles, and restoring full bodily balance.',
    },
    {
      icon: Feather,
      title: 'Relaxing Atmosphere',
      description: 'An intimate, private sanctuary tucked away in Sandton & Fourways, enveloped in soft ambient candlelight and pure aromas.',
    },
    {
      icon: Sparkles,
      title: 'Signature Luxe Experience',
      description: 'Every Signature Luxe Ritual includes a complimentary glass of chilled bubbles, freshly brewed coffee, artisanal tea, soft drinks, or botanical infused water.',
    },
    {
      icon: SpaLotusHandIcon,
      title: 'Tailored Treatments',
      description: 'Personalised massage pressure, bespoke organic essential oils, and targeted therapy custom-fitted to your body’s unique posture.',
    },
  ];

  return (
    <section id="about" className="py-20 sm:py-24 bg-[#FAF7F2] text-[#2D2723] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold mb-2 block">
            Our Sanctuary
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1C2E24] font-normal tracking-tight mb-4"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
          >
            About Nthabi's Touch
          </h2>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mb-6" />
          <p className="text-base sm:text-lg text-[#5A4F47] leading-relaxed">
            Welcome to Nthabi’s Touch, a boutique massage and wellness studio based in the Sandton and Fourways area of Johannesburg. We offer therapeutic and luxury spa treatments in a peaceful, private setting, delivered by caring, skilled therapists devoted to your complete restoration.
          </p>
        </div>

        {/* Story Grid with Refreshment Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-16">
          {/* Left Column: Image with Subtle Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#E8DEC8]/80 bg-[#F4EFEA]">
              <img
                src="/src/assets/images/welcome_refreshments_1790719247502.jpg"
                alt="Complimentary spa welcome tray with sparkling bubbles, herbal tea, and infused citrus water at Nthabi's Touch"
                className="w-full h-[360px] sm:h-[420px] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C2E24]/80 via-transparent to-transparent flex items-end p-6">
                <div className="text-[#FAF7F2]">
                  <p className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold mb-1">
                    Signature Hospitality
                  </p>
                  <p className="text-sm font-medium">
                    Complimentary bubbles, artisan coffee, herbal tea &amp; chilled infused water.
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative Offset Element */}
            <div className="hidden sm:block absolute -bottom-5 -right-5 w-28 h-28 bg-[#EFE8DF] -z-10 rounded-2xl border border-[#DCD0C4]" />
          </div>

          {/* Right Column: Key Narrative and Philosophy */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h3
              className="text-2xl sm:text-3xl font-serif text-[#1C2E24] mb-5 leading-snug"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
            >
              A Private Sanctuary Designed to Slow Down Time
            </h3>
            
            <p className="text-sm sm:text-base text-[#5A4F47] leading-relaxed mb-5">
              In the fast pace of Johannesburg life, stress and postural strain often accumulate in silence. At Nthabi’s Touch, we believe that self-care is not a fleeting indulgence, but an essential necessity for physical and mental renewal.
            </p>

            <p className="text-sm sm:text-base text-[#5A4F47] leading-relaxed mb-6">
              Whether you are releasing chronic desk tension with a deep tissue back massage, unwinding under the warm basalt glide of hot stones, or celebrating a quiet moment in our handcrafted fresh petal milk soak, each touch is intentional, compassionate, and deeply therapeutic.
            </p>

            <div className="p-4 sm:p-5 rounded-xl bg-[#F4EFEA] border border-[#E5DDD4] flex items-start gap-4">
              <div className="p-2.5 rounded-full bg-[#1C2E24] text-[#D4AF37] shrink-0 mt-0.5">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#1C2E24] mb-1">
                  Complimentary Signature Luxe Refreshments
                </h4>
                <p className="text-xs sm:text-sm text-[#665A51] leading-relaxed">
                  All Signature Luxe treatments come accompanied with your choice of a complimentary glass of bubbles, fresh cappuccino or coffee, soothing herbal tea, soft drinks, and crisp fruit-infused water.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/70 border border-[#E8DEC8] hover:border-[#C5A880] transition-all duration-200 hover:shadow-md flex flex-col items-start"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1C2E24]/5 text-[#1C2E24] flex items-center justify-center mb-4">
                  {typeof Icon === 'function' ? (
                    <Icon className="w-6 h-6 text-[#1C2E24]" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-[#1C2E24]" />
                  )}
                </div>
                <h4 className="text-base font-semibold text-[#1C2E24] mb-2 font-serif" style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", fontSize: '1.25rem' }}>
                  {item.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#665A51] leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
