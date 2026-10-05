import React from 'react';
import { Calendar, MessageSquare } from 'lucide-react';
import { BUSINESS_INFO } from '../data/treatments';

interface FloatingActionsProps {
  onBookNow: () => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({ onBookNow }) => {
  const whatsappUrl = `https://wa.me/27762006014?text=${encodeURIComponent(
    "Hello Nthabi's Touch, I would like to inquire about spa treatments and availability."
  )}`;

  return (
    <>
      {/* Floating WhatsApp Quick Action Button (Desktop & Mobile) */}
      <aside aria-label="Quick contact" className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-30">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 p-3 sm:px-4 sm:py-3 bg-[#25D366] hover:bg-[#20BE5A] text-white rounded-full shadow-lg shadow-black/20 hover:shadow-xl transition-all duration-300 active:scale-95"
          title="Chat directly with Nthabi's Touch on WhatsApp"
        >
          <MessageSquare className="w-5 h-5 fill-white shrink-0" />
          <span className="hidden sm:inline text-xs font-semibold tracking-wide">
            Chat on WhatsApp
          </span>
        </a>
      </aside>

      {/* Mobile-Only Sticky Floating "Book Now" Bar (Compact: strictly <= 15% mobile viewport height) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 p-2.5 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#E8DEC8] shadow-lg flex items-center justify-between gap-3">
        <div className="flex flex-col pl-1.5 leading-tight">
          <span className="text-[11px] font-semibold text-[#1C2E24] font-serif">
            Nthabi's Touch
          </span>
          <span className="text-[10px] text-[#8C6D46]">
            From R590 · Sandton / Fourways
          </span>
        </div>

        <button
          onClick={onBookNow}
          className="py-2.5 px-6 bg-[#1C2E24] active:bg-[#284133] text-[#FAF7F2] font-semibold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2"
        >
          <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Book Now</span>
        </button>
      </div>
    </>
  );
};
