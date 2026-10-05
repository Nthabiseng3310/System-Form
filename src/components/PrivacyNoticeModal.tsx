import React from 'react';
import { X, ShieldCheck, Mail, Lock, Check } from 'lucide-react';
import { BUSINESS_INFO } from '../data/treatments';

interface PrivacyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyNoticeModal: React.FC<PrivacyNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E8DEC8] p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE2] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1C2E24]/10 text-[#1C2E24]">
              <ShieldCheck className="w-5 h-5 text-[#1C2E24]" />
            </div>
            <div>
              <h3
                className="font-serif text-xl font-normal text-[#1C2E24]"
                style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
              >
                Privacy Notice
              </h3>
              <p className="text-[11px] text-[#8C6D46]">
                Nthabi's Touch · POPIA Compliance (South Africa)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#FAF7F2] text-[#8C7E74] hover:text-[#1C2E24] transition-colors"
            aria-label="Close Privacy Notice"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content in Plain Language */}
        <div className="space-y-4 text-xs sm:text-sm text-[#5C5047] leading-relaxed">
          <p>
            At <strong>Nthabi’s Touch</strong>, we respect your personal sanctuary. This notice explains clearly how we treat the information you share when taking our spa quiz or booking an appointment.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DEC8]">
              <h4 className="font-semibold text-[#1C2E24] text-xs uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#8C6D46]" />
                1. What We Collect
              </h4>
              <p className="text-xs text-[#6B5E55]">
                Only the details you choose to submit: your first name, mobile number, email address, preferred contact method, and your wellness preferences (e.g. tension areas and treatment interests). We never ask for national ID numbers, banking details, or home addresses in our quiz.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DEC8]">
              <h4 className="font-semibold text-[#1C2E24] text-xs uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#8C6D46]" />
                2. Why We Collect It
              </h4>
              <p className="text-xs text-[#6B5E55]">
                To calculate your personalized spa personality, issue your 10% welcome voucher code, send your appointment confirmation, and share occasional tailored self-care offers. Community demographic options are 100% voluntary and anonymous.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DEC8]">
              <h4 className="font-semibold text-[#1C2E24] text-xs uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#8C6D46]" />
                3. Secure Storage &amp; Zero Selling
              </h4>
              <p className="text-xs text-[#6B5E55]">
                Your data is stored securely in encrypted private systems. <strong>We will never sell, rent, or trade your personal information to third parties.</strong>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DEC8]">
              <h4 className="font-semibold text-[#1C2E24] text-xs uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#8C6D46]" />
                4. Your Right to Remove Data Anytime
              </h4>
              <p className="text-xs text-[#6B5E55]">
                Under South Africa's Protection of Personal Information Act (POPIA), you may ask to view, amend, or completely delete your information at any time. Simply send an email to{' '}
                <a
                  href={`mailto:${BUSINESS_INFO.email}`}
                  className="text-[#1C2E24] font-semibold underline decoration-[#D4AF37]"
                >
                  {BUSINESS_INFO.email}
                </a>{' '}
                with the subject "Data Removal Request", and we will delete your record immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-6 pt-4 border-t border-[#F0EAE2] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#1C2E24] hover:bg-[#284133] text-[#FAF7F2] font-semibold text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
