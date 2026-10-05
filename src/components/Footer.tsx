import React from 'react';
import { Logo } from './Logo';
import { BUSINESS_INFO } from '../data/treatments';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  Lock,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface FooterProps {
  onOpenAdmin: (initialTab?: 'bookings' | 'google-sheets' | 'quiz-leads' | 'block-slots') => void;
  onBookNow: () => void;
  onOpenGoogleSheets?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onBookNow, onOpenGoogleSheets }) => {
  const quickLinks = [
    { label: 'About Studio', href: '#about' },
    { label: 'Treatments & Prices', href: '#treatments' },
    { label: 'Studio Gallery', href: '#gallery' },
    { label: 'Operating Hours', href: '#hours' },
    { label: 'Location & Map', href: '#contact' },
  ];

  return (
    <footer className="bg-[#16241B] text-[#FAF7F2] pt-16 pb-24 sm:pb-16 border-t border-[#D4AF37]/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-14">
          {/* Col 1: Brand Wordmark, Lotus Mark & Tagline (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Logo variant="footer" />
            
            <p className="text-xs sm:text-sm text-[#C8D5CD] leading-relaxed max-w-sm pt-2">
              A private boutique massage and wellness studio based in the Sandton and Fourways area of Johannesburg. Restoring balance to mind and body through intentional touch.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                title="Instagram"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-[#D4AF37] flex items-center justify-center text-[#E5DDD4] hover:text-[#D4AF37] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                title="Facebook"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-[#D4AF37] flex items-center justify-center text-[#E5DDD4] hover:text-[#D4AF37] transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={BUSINESS_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp Direct"
                className="w-8 h-8 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              Explore
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#C8D5CD]">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-[#FAF7F2] hover:underline decoration-[#D4AF37] underline-offset-4 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  onClick={onBookNow}
                  className="text-[#D4AF37] font-medium hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Book Online</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Information (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              Sanctuary Contact
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-[#C8D5CD]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{BUSINESS_INFO.area}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <a
                  href={BUSINESS_INFO.phoneCall}
                  className="hover:text-white underline decoration-[#D4AF37]/50"
                >
                  {BUSINESS_INFO.phoneDisplay}
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <a
                  href={`mailto:${BUSINESS_INFO.email}`}
                  className="hover:text-white underline decoration-[#D4AF37]/50 break-all"
                >
                  {BUSINESS_INFO.email}
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Opening Hours (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              Opening Hours
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-[#C8D5CD]">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#FAF7F2]">Monday – Saturday</p>
                  <p className="text-xs text-[#A1B8A9]">08:00 – 17:00</p>
                </div>
              </div>
              <div className="pt-1 text-xs text-[#E5DDD4]/80">
                <p className="text-[#E5A8A8] font-medium">Sunday: Closed</p>
                <p className="text-[11px] text-[#A1B8A9] mt-0.5">By advance appointment only</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Admin link */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A1B8A9]">
          <p>© Nthabi's Touch. All rights reserved.</p>

          <div className="flex items-center gap-5 flex-wrap justify-center">
            <span>Sandton &amp; Fourways, Johannesburg</span>
            <span>·</span>
            <button
              onClick={onOpenGoogleSheets || (() => onOpenAdmin('google-sheets'))}
              className="text-[#0F9D58] hover:text-[#52d693] transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer"
              title="View Google Sheets Sync"
            >
              <span>Google Sheets Sync</span>
            </button>
            <span>·</span>
            <button
              onClick={() => onOpenAdmin('bookings')}
              className="text-[#D4AF37] hover:text-[#FAF7F2] transition-colors flex items-center gap-1.5 focus:outline-none"
              title="Access therapist scheduling portal"
            >
              <Lock className="w-3 h-3" />
              <span>Staff Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
