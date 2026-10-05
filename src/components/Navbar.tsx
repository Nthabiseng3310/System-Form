import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Menu, X, Calendar, Phone, Lock, Sparkles, FileSpreadsheet } from 'lucide-react';
import { BUSINESS_INFO } from '../data/treatments';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenAdmin: (initialTab?: 'bookings' | 'google-sheets' | 'quiz-leads' | 'block-slots') => void;
  onOpenQuiz: () => void;
  onOpenGoogleSheets: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenAdmin,
  onOpenQuiz,
  onOpenGoogleSheets,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Treatments', href: '#treatments' },
    { label: 'Find Treatment', href: '#quiz' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Hours', href: '#hours' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF7F2]/95 backdrop-blur-md shadow-sm border-b border-[#E8DEC8]/60 py-3'
          : 'bg-[#FAF7F2]/80 backdrop-blur-sm py-4'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Zone 1: Single Brand Wordmark / Logo */}
        <a href="#" className="flex items-center gap-2 group focus:outline-none">
          <Logo variant="header" showTagline={false} />
        </a>

        {/* Zone 2: Clean nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4A3E37]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-[#1C2E24] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#C5A880] hover:after:w-full after:transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Primary Action Controls */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={onOpenGoogleSheets}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#0F9D58] hover:text-[#0B8043] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Open Google Sheets Sync & Leads"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#0F9D58]" />
            <span>Google Sheets</span>
          </button>

          <button
            onClick={onOpenQuiz}
            className="px-3.5 py-2 text-xs font-semibold text-[#8C6D46] hover:text-[#1C2E24] bg-[#FAF3EA] hover:bg-[#EFE5D8] border border-[#E0D3C1] rounded-full transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Take the 60-second quiz & unlock a 10% treat"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Take the quiz</span>
          </button>

          <a
            href={BUSINESS_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[#24362A] hover:text-[#1C2E24] hover:bg-[#EFEAE2] rounded-full transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Chat on WhatsApp: 076 200 6014"
          >
            <Phone className="w-3.5 h-3.5 text-[#1C2E24]" />
            <span className="hidden xl:inline">{BUSINESS_INFO.phoneDisplay}</span>
          </a>

          <button
            onClick={onOpenBooking}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] bg-[#1C2E24] hover:bg-[#284133] rounded-full transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-2"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Book Now</span>
          </button>
        </div>

        {/* Mobile Buttons */}
        <div className="flex sm:hidden items-center gap-1.5">
          <button
            onClick={onOpenGoogleSheets}
            className="px-2 py-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full shadow-2xs flex items-center gap-1 text-xs font-semibold"
            title="Open Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="text-[11px]">Sheets</span>
          </button>

          <button
            onClick={onOpenQuiz}
            className="px-2.5 py-1.5 text-xs font-medium text-[#8C6D46] bg-[#FAF3EA] border border-[#E0D3C1] rounded-full shadow-2xs flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>Quiz</span>
          </button>

          <button
            onClick={onOpenBooking}
            className="px-3 py-1.5 text-xs font-medium text-[#FAF7F2] bg-[#1C2E24] rounded-full shadow-sm"
          >
            Book
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#1C2E24] hover:bg-[#EFEAE2] rounded-lg transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#FAF7F2] border-b border-[#E5DDD4] px-5 py-5 shadow-lg animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col gap-4 text-base font-medium text-[#2E2824]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 border-b border-[#F0E9DF] hover:text-[#1C2E24] transition-colors"
              >
                {link.label}
              </a>
            ))}
            
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGoogleSheets();
                }}
                className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#0F9D58]" />
                Open Google Sheets Live Sync
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuiz();
                }}
                className="w-full py-3 bg-[#FAF3EA] border border-[#D8C9B5] text-[#1C2E24] text-center font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                Take the Spa Quiz (Get 10% Off)
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full py-3 bg-[#1C2E24] text-[#FAF7F2] text-center font-medium rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                Book an Appointment
              </button>

              <a
                href={BUSINESS_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-[#EFEAE2] text-[#1C2E24] text-center font-medium rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#1C2E24]" />
                WhatsApp: {BUSINESS_INFO.phoneDisplay}
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin('bookings');
                }}
                className="pt-2 text-center text-xs text-[#8C6D46] hover:text-[#1C2E24] flex items-center justify-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>Therapist &amp; Studio Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
