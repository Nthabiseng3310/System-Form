import React, { useState, useEffect, useMemo } from 'react';
import { TREATMENTS, Treatment, TreatmentOption, BUSINESS_INFO } from '../data/treatments';
import {
  isSlotAvailable,
  getAvailableSlots,
  createBooking,
  Booking,
  timeToMinutes,
  minutesToTime,
} from '../services/bookingStorage';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
  ExternalLink,
} from 'lucide-react';

interface BookingSectionProps {
  initialTreatmentId?: string;
  initialDurationMinutes?: number;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  initialTreatmentId,
  initialDurationMinutes,
}) => {
  // 1. Treatment and Option state
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>(
    initialTreatmentId || TREATMENTS[0].id
  );

  const selectedTreatment: Treatment = useMemo(() => {
    return (
      TREATMENTS.find((t) => t.id === selectedTreatmentId) || TREATMENTS[0]
    );
  }, [selectedTreatmentId]);

  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState<number>(
    initialDurationMinutes || selectedTreatment.options[0].durationMinutes
  );

  // Update duration if treatment changes and previous duration doesn't exist
  useEffect(() => {
    const valid = selectedTreatment.options.some(
      (opt) => opt.durationMinutes === selectedDurationMinutes
    );
    if (!valid) {
      setSelectedDurationMinutes(selectedTreatment.options[0].durationMinutes);
    }
  }, [selectedTreatment, selectedDurationMinutes]);

  // Sync if parent passes new initialTreatmentId
  useEffect(() => {
    if (initialTreatmentId) {
      setSelectedTreatmentId(initialTreatmentId);
      if (initialDurationMinutes) {
        setSelectedDurationMinutes(initialDurationMinutes);
      }
    }
  }, [initialTreatmentId, initialDurationMinutes]);

  const selectedOption: TreatmentOption = useMemo(() => {
    return (
      selectedTreatment.options.find(
        (o) => o.durationMinutes === selectedDurationMinutes
      ) || selectedTreatment.options[0]
    );
  }, [selectedTreatment, selectedDurationMinutes]);

  // 2. Date state
  const today = useMemo(() => new Date(), []);
  // Helper to format Date to YYYY-MM-DD
  const formatDateISO = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Determine initial valid date (e.g. tomorrow or +3 days if milk bath)
  const defaultDateStr = useMemo(() => {
    const d = new Date(today);
    const minAdvance = selectedTreatment.minDaysInAdvance || 1;
    d.setDate(d.getDate() + minAdvance);
    // If Sunday, roll to Monday
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return formatDateISO(d);
  }, [today, selectedTreatment.minDaysInAdvance]);

  const [selectedDate, setSelectedDate] = useState<string>(defaultDateStr);

  // If treatment requires 3 days in advance, ensure selected date complies
  useEffect(() => {
    if (selectedTreatment.minDaysInAdvance) {
      const minDate = new Date(today);
      minDate.setDate(minDate.getDate() + selectedTreatment.minDaysInAdvance);
      const chosen = new Date(selectedDate);
      if (chosen < minDate) {
        if (minDate.getDay() === 0) minDate.setDate(minDate.getDate() + 1);
        setSelectedDate(formatDateISO(minDate));
      }
    }
  }, [selectedTreatment, today, selectedDate]);

  // 3. Time slot state
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Available slots computed dynamically from storage
  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    return getAvailableSlots(selectedDate, selectedDurationMinutes);
  }, [selectedDate, selectedDurationMinutes]);

  // Reset selected time if it becomes invalid
  useEffect(() => {
    if (selectedTime) {
      const current = availableSlots.find((s) => s.time === selectedTime);
      if (!current || !current.available) {
        setSelectedTime('');
      }
    }
  }, [availableSlots, selectedTime]);

  // 4. Client details form
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');

  // 5. Booking UI State: 'form' | 'review' | 'confirmed'
  const [bookingStep, setBookingStep] = useState<'form' | 'review' | 'confirmed'>('form');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calendar dates generator (next 21 days for easy visual clicking)
  const calendarDays = useMemo(() => {
    const days = [];
    const minAdvance = selectedTreatment.minDaysInAdvance || 0;
    const minAllowedDate = new Date(today);
    minAllowedDate.setHours(0, 0, 0, 0);
    minAllowedDate.setDate(minAllowedDate.getDate() + minAdvance);

    for (let i = 0; i < 28; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      d.setHours(0, 0, 0, 0);

      const isSunday = d.getDay() === 0;
      const isPastMinAdvance = d < minAllowedDate;
      const isSelectable = !isSunday && !isPastMinAdvance;

      days.push({
        dateStr: formatDateISO(d),
        dayName: d.toLocaleDateString('en-ZA', { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('en-ZA', { month: 'short' }),
        isSunday,
        isSelectable,
        reason: isSunday
          ? 'Closed on Sundays'
          : isPastMinAdvance
          ? `${selectedTreatment.minDaysInAdvance} days notice required`
          : undefined,
      });
    }
    return days;
  }, [today, selectedTreatment]);

  // Validation
  const canProceedToReview = useMemo(() => {
    return (
      selectedTreatmentId &&
      selectedDurationMinutes &&
      selectedDate &&
      selectedTime &&
      clientName.trim().length >= 2 &&
      clientPhone.trim().length >= 7 &&
      clientEmail.includes('@')
    );
  }, [
    selectedTreatmentId,
    selectedDurationMinutes,
    selectedDate,
    selectedTime,
    clientName,
    clientPhone,
    clientEmail,
  ]);

  // Handle Submit Booking
  const handleConfirmBooking = () => {
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const newBooking = createBooking({
        treatmentId: selectedTreatment.id,
        treatmentName: selectedTreatment.name,
        durationMinutes: selectedDurationMinutes,
        durationLabel: selectedOption.durationLabel,
        priceZAR: selectedOption.priceZAR,
        date: selectedDate,
        startTime: selectedTime,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim(),
        notes: notes.trim(),
        isCouples: selectedTreatment.forCouples,
      });

      setConfirmedBooking(newBooking);
      setBookingStep('confirmed');
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not complete booking. Please choose another slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-filled WhatsApp message
  const whatsappBookingUrl = useMemo(() => {
    const text = encodeURIComponent(
      `Hello Nthabi's Touch, I would like to book an appointment:\n\n` +
      `• Treatment: ${selectedTreatment.name} (${selectedOption.durationLabel})\n` +
      `• Price: ${selectedOption.priceDisplay}\n` +
      `• Date: ${selectedDate}\n` +
      `• Preferred Time: ${selectedTime || 'Morning / Afternoon'}\n` +
      `• Client Name: ${clientName || 'Valued Guest'}\n` +
      (notes ? `• Notes: ${notes}\n` : '') +
      `\nPlease confirm availability. Thank you!`
    );
    return `https://wa.me/27762006014?text=${text}`;
  }, [selectedTreatment, selectedOption, selectedDate, selectedTime, clientName, notes]);

  const resetForm = () => {
    setBookingStep('form');
    setConfirmedBooking(null);
    setSelectedTime('');
    setNotes('');
  };

  return (
    <section id="booking" className="py-20 sm:py-24 bg-[#FAF7F2] text-[#2D2723] relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold mb-2 block">
            Reserve Your Experience
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1C2E24] font-normal tracking-tight mb-4"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
          >
            Book Your Treatment
          </h2>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mb-6" />
          <p className="text-sm sm:text-base text-[#5A4F47] leading-relaxed">
            Select your preferred treatment, date, and time below. Payment is settled at our Sandton &amp; Fourways studio on arrival (card or cash).
          </p>
        </div>

        {/* Confirmation Screen */}
        {bookingStep === 'confirmed' && confirmedBooking && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8DEC8] shadow-xl max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-[#1C2E24]/10 text-[#1C2E24] flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10 text-[#1C2E24]" />
            </div>

            <div className="text-center mb-8">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37] block mb-1">
                Booking Confirmed
              </span>
              <h3
                className="text-2xl sm:text-3xl font-serif text-[#1C2E24] font-normal"
                style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
              >
                We Look Forward to Welcoming You
              </h3>
              <p className="text-xs text-[#8C6D46] font-mono mt-1">
                Booking Ref: {confirmedBooking.id}
              </p>
            </div>

            {/* Summary Details Card */}
            <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E8DEC8] space-y-3 mb-6 text-sm">
              <div className="flex justify-between items-start border-b border-[#E8DEC8]/60 pb-3">
                <span className="text-[#6B5E55]">Treatment:</span>
                <span className="font-semibold text-[#1C2E24] text-right">
                  {confirmedBooking.treatmentName}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#E8DEC8]/60 pb-3">
                <span className="text-[#6B5E55]">Duration:</span>
                <span className="font-medium text-[#1C2E24]">{confirmedBooking.durationLabel}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#E8DEC8]/60 pb-3">
                <span className="text-[#6B5E55]">Date &amp; Time:</span>
                <span className="font-semibold text-[#1C2E24]">
                  {confirmedBooking.date} at {confirmedBooking.startTime} – {confirmedBooking.endTime}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#E8DEC8]/60 pb-3">
                <span className="text-[#6B5E55]">Total Due at Studio:</span>
                <span className="font-serif text-lg font-bold text-[#1C2E24]">
                  R{confirmedBooking.priceZAR.toLocaleString('en-ZA')}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-[#6B5E55]">
                <span>Guest Name:</span>
                <span className="font-medium text-[#1C2E24]">{confirmedBooking.clientName}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-[#6B5E55]">
                <span>Contact Phone:</span>
                <span className="font-medium text-[#1C2E24]">{confirmedBooking.clientPhone}</span>
              </div>
            </div>

            {/* Email Notification Dispatch Status */}
            <div className="bg-[#F0F5F2] border border-[#C5DDD0] rounded-xl p-4 mb-6 flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#24613E] shrink-0 mt-0.5" />
              <div className="text-xs text-[#1C452C] leading-relaxed">
                <p className="font-semibold mb-0.5">Automated Notifications Dispatched</p>
                <p>
                  A booking confirmation was sent to <strong className="text-[#1C2E24]">{confirmedBooking.clientEmail}</strong> and studio notification dispatched to <strong className="text-[#1C2E24]">{BUSINESS_INFO.email}</strong>.
                </p>
              </div>
            </div>

            {/* Direct WhatsApp Confirmation Button */}
            <div className="space-y-3">
              <a
                href={whatsappBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20BE5A] text-white font-medium rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Open in WhatsApp (+27 76 200 6014)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <button
                onClick={resetForm}
                className="w-full py-3 px-4 bg-[#FAF7F2] hover:bg-[#EFEAE2] text-[#1C2E24] border border-[#D8CFC5] font-medium rounded-xl text-xs sm:text-sm transition-colors"
              >
                Book Another Appointment
              </button>
            </div>
          </div>
        )}

        {/* Step: Review Booking Before Submission */}
        {bookingStep === 'review' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8DEC8] shadow-xl max-w-2xl mx-auto">
            <h3
              className="text-2xl sm:text-3xl font-serif text-[#1C2E24] mb-2 font-normal text-center"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
            >
              Review Your Appointment Details
            </h3>
            <p className="text-xs sm:text-sm text-[#665A51] text-center mb-6">
              Please double-check your appointment details prior to confirmation.
            </p>

            <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E8DEC8] space-y-3.5 mb-6 text-sm">
              <div className="flex justify-between border-b border-[#E8DEC8]/60 pb-2.5">
                <span className="text-[#6B5E55]">Selected Treatment</span>
                <span className="font-semibold text-[#1C2E24]">{selectedTreatment.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#E8DEC8]/60 pb-2.5">
                <span className="text-[#6B5E55]">Duration</span>
                <span className="font-medium text-[#1C2E24]">{selectedOption.durationLabel}</span>
              </div>
              <div className="flex justify-between border-b border-[#E8DEC8]/60 pb-2.5">
                <span className="text-[#6B5E55]">Date</span>
                <span className="font-semibold text-[#1C2E24]">{selectedDate}</span>
              </div>
              <div className="flex justify-between border-b border-[#E8DEC8]/60 pb-2.5">
                <span className="text-[#6B5E55]">Time Window</span>
                <span className="font-semibold text-[#1C2E24]">
                  {selectedTime} – {minutesToTime(timeToMinutes(selectedTime) + selectedDurationMinutes)}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#E8DEC8]/60 pb-2.5">
                <span className="text-[#6B5E55]">Total Due on Arrival</span>
                <span className="font-serif text-lg font-bold text-[#1C2E24]">
                  {selectedOption.priceDisplay}
                </span>
              </div>

              <div className="pt-2 text-xs space-y-1.5 text-[#5C5047]">
                <p>
                  <strong>Guest:</strong> {clientName} ({clientPhone})
                </p>
                <p>
                  <strong>Confirmation to:</strong> {clientEmail}
                </p>
                {notes && (
                  <p>
                    <strong>Special Requests:</strong> {notes}
                  </p>
                )}
              </div>
            </div>

            {/* Studio Payment Notice */}
            <div className="p-4 rounded-xl bg-[#FAF3EA] border border-[#E5D7C5] mb-6 text-xs text-[#7A5A35] flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 text-[#8C6D46] mt-0.5" />
              <span>
                <strong>Studio Payment:</strong> Payment is made at the studio on the day of your treatment (Cash or Card). No upfront online payment is taken.
              </span>
            </div>

            {errorMsg && (
              <div className="p-3.5 mb-6 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setBookingStep('form')}
                className="flex-1 py-3 px-4 rounded-xl bg-[#FAF7F2] text-[#4A3E37] border border-[#D8CFC5] font-medium text-xs sm:text-sm hover:bg-[#EFEAE2] transition-colors"
              >
                Back to Edit
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmBooking}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1C2E24] hover:bg-[#284133] text-[#FAF7F2] font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Main Interactive Booking Form */}
        {bookingStep === 'form' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8DEC8] shadow-lg">
            <div className="space-y-10">
              {/* 1. Treatment Selector */}
              <div>
                <label className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold block mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>1. Choose Treatment</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {TREATMENTS.map((treatment) => {
                    const isSelected = treatment.id === selectedTreatmentId;
                    return (
                      <button
                        key={treatment.id}
                        type="button"
                        onClick={() => setSelectedTreatmentId(treatment.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#FAF6EE] border-[#1C2E24] ring-1 ring-[#1C2E24] shadow-sm'
                            : 'bg-white border-[#E5DDD4] hover:border-[#C5A880]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-serif text-sm font-semibold text-[#1C2E24] leading-snug">
                            {treatment.name}
                          </span>
                          {treatment.isSignatureLuxe && (
                            <span className="text-[10px] bg-[#D4AF37] text-[#16241B] px-1.5 py-0.5 rounded font-medium shrink-0">
                              Luxe
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[#8C6D46] font-medium">
                          From {treatment.options[0]?.priceDisplay}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Duration & Price Options */}
              <div className="pt-6 border-t border-[#F0EAE2]">
                <label className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold block mb-3 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>2. Select Duration &amp; Price</span>
                </label>

                <div className="flex flex-wrap gap-3">
                  {selectedTreatment.options.map((opt) => {
                    const isSelected = opt.durationMinutes === selectedDurationMinutes;
                    return (
                      <button
                        key={opt.durationMinutes}
                        type="button"
                        onClick={() => setSelectedDurationMinutes(opt.durationMinutes)}
                        className={`px-5 py-3 rounded-xl border transition-all flex items-center gap-4 ${
                          isSelected
                            ? 'bg-[#1C2E24] text-[#FAF7F2] border-[#1C2E24] shadow-md'
                            : 'bg-[#FAF7F2] text-[#2E2824] border-[#E0D5C7] hover:border-[#C5A880]'
                        }`}
                      >
                        <span className="text-xs font-medium">{opt.durationLabel}</span>
                        <span
                          className={`font-serif text-base font-semibold ${
                            isSelected ? 'text-[#D4AF37]' : 'text-[#1C2E24]'
                          }`}
                        >
                          {opt.priceDisplay}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Treatment prep notice if applicable */}
                {selectedTreatment.minDaysInAdvance && (
                  <div className="mt-4 p-3 rounded-xl bg-[#FAF0E6] border border-[#E8DEC8] text-xs text-[#8C5D30] flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#8C5D30]" />
                    <span>
                      <strong>Notice:</strong> The {selectedTreatment.name} requires at least 3 days advance pre-booking to prepare fresh floral petals and botanical infusions.
                    </span>
                  </div>
                )}
              </div>

              {/* 3. Pick Date */}
              <div className="pt-6 border-t border-[#F0EAE2]">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>3. Choose Date (Mon – Sat)</span>
                  </label>
                  <span className="text-[11px] text-[#8C6D46]">
                    Studio Closed on Sundays
                  </span>
                </div>

                {/* Interactive Horizontal Date Scroller */}
                <div className="overflow-x-auto pb-2 -mx-2 px-2 flex gap-2.5 scrollbar-thin">
                  {calendarDays.map((item) => {
                    const isSelected = item.dateStr === selectedDate;

                    if (!item.isSelectable) {
                      return (
                        <div
                          key={item.dateStr}
                          title={item.reason}
                          className="shrink-0 w-16 py-2.5 px-1 rounded-xl bg-[#F0EBE5]/50 border border-dashed border-[#E5DDD4] text-center opacity-40 cursor-not-allowed"
                        >
                          <span className="text-[10px] uppercase font-semibold text-[#8C7E74] block">
                            {item.dayName}
                          </span>
                          <span className="text-base font-bold text-[#8C7E74] block">
                            {item.dayNum}
                          </span>
                          <span className="text-[9px] text-[#A6978C] block">
                            {item.isSunday ? 'Closed' : 'N/A'}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={item.dateStr}
                        type="button"
                        onClick={() => setSelectedDate(item.dateStr)}
                        className={`shrink-0 w-16 py-2.5 px-1 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-[#1C2E24] text-[#FAF7F2] border-[#1C2E24] shadow-md scale-102'
                            : 'bg-white text-[#2E2824] border-[#E0D5C7] hover:border-[#1C2E24]'
                        }`}
                      >
                        <span
                          className={`text-[10px] uppercase font-semibold block ${
                            isSelected ? 'text-[#D4AF37]' : 'text-[#8C6D46]'
                          }`}
                        >
                          {item.dayName}
                        </span>
                        <span className="text-lg font-bold block my-0.5">{item.dayNum}</span>
                        <span
                          className={`text-[10px] block ${
                            isSelected ? 'text-[#E5DDD4]' : 'text-[#6B5E55]'
                          }`}
                        >
                          {item.monthName}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-[#5C5047]">
                  <span>Selected Date: <strong>{selectedDate}</strong></span>
                  <input
                    type="date"
                    value={selectedDate}
                    min={formatDateISO(today)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const d = new Date(val);
                      if (d.getDay() === 0) {
                        alert('Our studio is closed on Sundays. Please select Monday to Saturday.');
                        return;
                      }
                      setSelectedDate(val);
                    }}
                    className="text-xs bg-transparent border border-[#D8CFC5] rounded-md px-2 py-1 text-[#2E2824] focus:outline-none focus:border-[#1C2E24]"
                  />
                </div>
              </div>

              {/* 4. Pick Time Slot (08:00 - 17:00 in 30-min steps) */}
              <div className="pt-6 border-t border-[#F0EAE2]">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>4. Select Available Start Time (08:00 – 17:00)</span>
                  </label>
                  <span className="text-[11px] text-[#6B5E55]">
                    Treatment finishes by 17:00
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {availableSlots.map(({ time, available, reason }) => {
                    const isSelected = selectedTime === time;

                    if (!available) {
                      return (
                        <div
                          key={time}
                          title={reason}
                          className="py-2.5 px-2 rounded-xl bg-[#F4EFEA]/60 border border-dashed border-[#E5DDD4] text-center opacity-40 cursor-not-allowed flex flex-col justify-center"
                        >
                          <span className="text-xs font-mono font-medium text-[#7D7065] line-through">
                            {time}
                          </span>
                          <span className="text-[9px] text-[#A19488] truncate">
                            Reserved
                          </span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`py-2.5 px-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-[#1C2E24] text-[#FAF7F2] border-[#1C2E24] shadow-sm font-semibold'
                            : 'bg-white text-[#2E2824] border-[#E0D5C7] hover:border-[#1C2E24]'
                        }`}
                      >
                        <span className="text-xs font-mono block">{time}</span>
                        <span
                          className={`text-[9px] block ${
                            isSelected ? 'text-[#D4AF37]' : 'text-[#8C6D46]'
                          }`}
                        >
                          Available
                        </span>
                      </button>
                    );
                  })}
                </div>

                {!selectedTime && (
                  <p className="text-xs text-[#8C6D46] mt-2 italic">
                    Please click an available start time slot above.
                  </p>
                )}
              </div>

              {/* 5. Client Information Form */}
              <div className="pt-6 border-t border-[#F0EAE2]">
                <label className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold block mb-4 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>5. Your Contact Information</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-[#A89A8D]" />
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Naledi Molefe"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none focus:border-[#1C2E24] focus:ring-1 focus:ring-[#1C2E24]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                      Mobile Number (WhatsApp Preferred) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#A89A8D]" />
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="e.g. 076 200 6014"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none focus:border-[#1C2E24] focus:ring-1 focus:ring-[#1C2E24]"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                      Email Address (For Booking Confirmation) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#A89A8D]" />
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="e.g. naledi@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none focus:border-[#1C2E24] focus:ring-1 focus:ring-[#1C2E24]"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                      Optional Notes (Allergies, pressure preference, pregnancy, injuries)
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 absolute left-3.5 top-3 text-[#A89A8D]" />
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Let our therapists know of any specific muscle focus, allergies to scented oils, or pregnancy."
                        className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none focus:border-[#1C2E24] focus:ring-1 focus:ring-[#1C2E24]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Booking Summary Bar & Action */}
              <div className="pt-6 border-t border-[#F0EAE2] bg-[#FAF8F5] -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 sm:p-10 rounded-b-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#8C6D46] font-semibold block">
                    Total Due at Studio
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-[#1C2E24]">
                      {selectedOption.priceDisplay}
                    </span>
                    <span className="text-xs text-[#6B5E55]">
                      ({selectedOption.durationLabel} · Pay on Arrival)
                    </span>
                  </div>
                  <p className="text-xs text-[#7A6D63] mt-0.5">
                    {selectedDate} at {selectedTime || 'Select time slot'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <a
                    href={whatsappBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20BE5A] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
                    title="Send chosen details via WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    <span>Book via WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    disabled={!canProceedToReview}
                    onClick={() => setBookingStep('review')}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#1C2E24] hover:bg-[#284133] disabled:bg-[#A89D96] disabled:cursor-not-allowed text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Review</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
