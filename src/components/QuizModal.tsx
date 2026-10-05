import React from 'react';
import { QuizEngine } from './QuizEngine';
import { X, Sparkles } from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingSelect: (treatmentId: string) => void;
  onOpenPrivacyNotice: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  onBookingSelect,
  onOpenPrivacyNotice,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl my-auto animate-in zoom-in-95 duration-250">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 z-20 w-9 h-9 rounded-full bg-[#1C2E24] text-[#FAF7F2] hover:bg-[#284133] border border-[#D4AF37]/40 flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          aria-label="Close Quiz"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Banner Title */}
        <div className="bg-[#1C2E24] text-[#FAF7F2] rounded-t-3xl px-6 py-4 flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <h3
              className="font-serif text-lg sm:text-xl font-medium tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
            >
              Find Your Perfect Treatment ✨
            </h3>
          </div>
          <span className="text-[11px] text-[#D4AF37] uppercase tracking-wider font-semibold hidden sm:inline">
            Unlock 10% Welcome Treat
          </span>
        </div>

        {/* Quiz Engine Box */}
        <div className="rounded-b-3xl overflow-hidden">
          <QuizEngine
            isEmbedded={false}
            onBookingSelect={onBookingSelect}
            onOpenPrivacyNotice={onOpenPrivacyNotice}
            onFinished={onClose}
          />
        </div>
      </div>
    </div>
  );
};
