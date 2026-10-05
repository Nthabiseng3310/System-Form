import React from 'react';
import { GoogleSheetsManager } from './GoogleSheetsManager';
import { X, FileSpreadsheet, ExternalLink } from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E8DEC8] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#1C2E24] text-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#0F9D58] text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold tracking-wide">
                Nthabi's Touch · Google Sheets Live Sync
              </h3>
              <p className="text-[11px] text-[#C5DDD0]">
                Direct connection to your Google Sheets &amp; Drive for client quiz leads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <GoogleSheetsManager />
        </div>
      </div>
    </div>
  );
};
