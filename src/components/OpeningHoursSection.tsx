import React from 'react';
import { Clock, Calendar, MapPin, ShieldCheck, Coffee } from 'lucide-react';
import { BUSINESS_INFO } from '../data/treatments';

export const OpeningHoursSection: React.FC = () => {
  const schedule = [
    { day: 'Monday', hours: '08:00 – 17:00', open: true },
    { day: 'Tuesday', hours: '08:00 – 17:00', open: true },
    { day: 'Wednesday', hours: '08:00 – 17:00', open: true },
    { day: 'Thursday', hours: '08:00 – 17:00', open: true },
    { day: 'Friday', hours: '08:00 – 17:00', open: true },
    { day: 'Saturday', hours: '08:00 – 17:00', open: true },
    { day: 'Sunday', hours: 'Closed (Rest & Cleanse)', open: false },
  ];

  return (
    <section id="hours" className="py-20 sm:py-24 bg-[#FAF7F2] text-[#2D2723]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left card: Operating Hours Schedule */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-[#E8DEC8] shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-[#1C2E24]/5 text-[#1C2E24]">
                <Clock className="w-6 h-6 text-[#1C2E24]" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold block">
                  Studio Schedule
                </span>
                <h3
                  className="text-2xl sm:text-3xl font-serif text-[#1C2E24]"
                  style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
                >
                  Operating Hours
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#5C5047] mb-6 leading-relaxed">
              We operate strictly by appointment to guarantee absolute privacy, zero waiting room bustle, and complete therapeutic peace for every guest.
            </p>

            <div className="divide-y divide-[#F0EAE2] border-y border-[#F0EAE2]">
              {schedule.map((item) => (
                <div
                  key={item.day}
                  className="py-3 flex items-center justify-between text-xs sm:text-sm"
                >
                  <span className="font-medium text-[#2E2824]">{item.day}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono ${
                        item.open ? 'text-[#1C2E24] font-semibold' : 'text-[#A19488]'
                      }`}
                    >
                      {item.hours}
                    </span>
                    {item.open ? (
                      <span className="w-2 h-2 rounded-full bg-[#34A853]" title="Open" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#D84A49]" title="Closed" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-2 flex items-center gap-2 text-xs text-[#8C6D46]">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span>Last daily appointment finishes strictly by 17:00.</span>
            </div>
          </div>

          {/* Right card: Quiet Luxury Sanctuary Amenities */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#1C2E24] text-[#FAF7F2] rounded-3xl p-6 sm:p-8 shadow-lg">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold block mb-2">
                Sanctuary Amenities
              </span>
              <h4
                className="text-xl sm:text-2xl font-serif text-[#FAF7F2] mb-4"
                style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
              >
                Tranquility Guaranteed
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-[#E5DDD4] leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Secure private parking in the Sandton &amp; Fourways leafy precinct.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Coffee className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Complimentary refreshments with all Signature Luxe rituals.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Exact street details provided upon booking for guest confidentiality.</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#FAF3EA] border border-[#E8DEC8] rounded-2xl p-5 text-xs text-[#5C5047] leading-relaxed">
              <strong className="text-[#1C2E24] block mb-1">Need a specialized booking time?</strong>
              For corporate group wellness, couples packages, or bridal pampering queries outside standard hours, kindly message us on WhatsApp at <strong>{BUSINESS_INFO.phoneDisplay}</strong>.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
