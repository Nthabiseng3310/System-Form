import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  QUIZ_QUESTIONS,
  QuizAnswers,
  QuizOption,
  SpaPersonality,
  REWARD_CONFIG,
  determineSpaPersonality,
  getRecommendedTreatments,
} from '../data/quizConfig';
import { QuizFlowerProgress } from './QuizFlowerProgress';
import {
  submitQuizAnswers,
  trackFunnelStep,
  SubmitQuizResult,
} from '../services/quizService';
import { BUSINESS_INFO } from '../data/treatments';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Gift,
  Copy,
  CheckCircle2,
  Calendar,
  Share2,
  Lock,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Heart,
} from 'lucide-react';

interface QuizEngineProps {
  onBookingSelect: (treatmentId: string) => void;
  onOpenPrivacyNotice: () => void;
  onFinished?: () => void;
  isEmbedded?: boolean;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  onBookingSelect,
  onOpenPrivacyNotice,
  onFinished,
  isEmbedded = false,
}) => {
  // Current question step (1 to 8, then 9 = result screen)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [microMessage, setMicroMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [submitResult, setSubmitResult] = useState<SubmitQuizResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Quiz state
  const [answers, setAnswers] = useState<QuizAnswers>({
    treatments: ['swedish'],
    mainNeed: 'stress-relief',
    visitFrequency: 'monthly',
    occupationStatus: 'working-pro',
    jobTitleOrStudy: '',
    area: 'fourways',
    suburbOther: '',
    gender: 'Prefer not to say',
    ageRange: 'Prefer not to say',
    race: 'Prefer not to say',
    firstName: '',
    mobile: '',
    email: '',
    preferredContact: 'WhatsApp',
    consentGiven: false,
    honeypot: '',
  });

  // Track funnel drop-off on step change
  useEffect(() => {
    trackFunnelStep(currentStep);
  }, [currentStep]);

  // Launch confetti upon reaching result screen
  useEffect(() => {
    if (currentStep === 9 && submitResult) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#1C2E24', '#F4EAE6', '#E5C76B'],
        });
      } catch {
        // Safe fallback if canvas not available
      }
    }
  }, [currentStep, submitResult]);

  // Phone validator for South Africa
  const isValidSAPhone = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return /^((\+27)|0|27)[6-8][0-9]{8}$/.test(cleaned);
  };

  const handleNextStep = () => {
    setValidationError(null);

    // Validation per step
    if (currentStep === 1 && (!answers.treatments || answers.treatments.length === 0)) {
      setValidationError('Please select at least one treatment you are curious about.');
      return;
    }
    if (currentStep === 2 && !answers.mainNeed) {
      setValidationError('Please select what your body needs most right now.');
      return;
    }
    if (currentStep === 3 && !answers.visitFrequency) {
      setValidationError('Please choose how often you treat yourself.');
      return;
    }
    if (currentStep === 4 && !answers.occupationStatus) {
      setValidationError('Please choose an occupation option.');
      return;
    }
    if (currentStep === 5 && !answers.area) {
      setValidationError('Please choose your general area.');
      return;
    }

    // Set micro encouragement message
    const questionConfig = QUIZ_QUESTIONS.find((q) => q.id === currentStep);
    if (questionConfig?.encouragement) {
      setMicroMessage(questionConfig.encouragement);
    }

    if (currentStep < 8) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBackStep = () => {
    setValidationError(null);
    setMicroMessage('');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Submit Q8 contact & generate result
  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!answers.firstName.trim()) {
      setValidationError('Please enter your first name.');
      return;
    }
    if (!answers.mobile.trim() || !isValidSAPhone(answers.mobile)) {
      setValidationError('Please enter a valid South African mobile number (e.g. 076 200 6014).');
      return;
    }
    if (!answers.email.trim() || !answers.email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!answers.consentGiven) {
      setValidationError('Please accept the consent terms to unlock your reward.');
      return;
    }

    setIsSubmitting(true);
    const personality = determineSpaPersonality(answers);

    try {
      const res = await submitQuizAnswers(answers, personality);
      setSubmitResult(res);
      setCurrentStep(9); // Show Result Screen
    } catch (err: any) {
      setValidationError(err.message || 'Could not submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRewardCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const currentQ = QUIZ_QUESTIONS.find((q) => q.id === currentStep);

  // ------------------------------------------------------------------
  // RESULT SCREEN (Step 9)
  // ------------------------------------------------------------------
  if (currentStep === 9 && submitResult) {
    const personality = submitResult.personality;
    const recommended = getRecommendedTreatments(personality);
    const firstName = answers.firstName.trim();
    const shareText = encodeURIComponent(
      `I just took the Nthabi's Touch Spa Quiz and unlocked my spa personality "${personality.title}" + a 10% welcome treat! Take it here: ${window.location.origin}`
    );

    return (
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8DEC8] shadow-xl max-w-2xl mx-auto animate-in zoom-in-95 duration-400">
        {/* Top Celebration Crest */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#1C2E24]/10 text-[#1C2E24] flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Gift className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold block mb-1">
            Bespoke Result &amp; Welcome Reward
          </span>
          <h3
            className="text-2xl sm:text-4xl font-serif text-[#1C2E24] font-normal leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
          >
            Thank You, {firstName}!
          </h3>
          <p className="text-xs sm:text-sm text-[#5C5047] mt-1">
            Your personalised spa profile is unlocked below.
          </p>
        </div>

        {/* Spa Personality Card */}
        <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E8DEC8] mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-5 shadow-xs">
          <div className="w-20 h-20 rounded-2xl bg-[#1C2E24] text-[#FAF7F2] flex items-center justify-center text-4xl shrink-0 shadow-md">
            {personality.emoji}
          </div>
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#8C6D46] text-[10px] uppercase font-semibold tracking-wider mb-1">
              Your Spa Personality
            </div>
            <h4
              className="text-2xl font-serif text-[#1C2E24] font-semibold"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
            >
              {personality.title}
            </h4>
            <p className="text-xs text-[#8C6D46] font-medium mb-2">
              {personality.tagline}
            </p>
            <p className="text-xs sm:text-sm text-[#5C5047] leading-relaxed">
              {personality.description}
            </p>
          </div>
        </div>

        {/* Reward Voucher Box */}
        <div className="relative rounded-2xl border-2 border-dashed border-[#D4AF37] bg-gradient-to-r from-[#FAF6EE] to-[#F7EFE8] p-5 sm:p-6 mb-8 text-center shadow-xs">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-[#8C6D46] font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{REWARD_CONFIG.voucherTitle}</span>
          </div>

          <p className="text-base sm:text-lg font-serif font-bold text-[#1C2E24] mb-3">
            {REWARD_CONFIG.discountText}
          </p>

          {/* Unique Code Block */}
          <div className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-[#D4AF37] shadow-sm mb-3">
            <span className="font-mono text-lg sm:text-xl font-bold tracking-widest text-[#1C2E24]">
              {submitResult.rewardCode}
            </span>
            <button
              onClick={() => copyRewardCode(submitResult.rewardCode)}
              className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EFEAE2] text-[#1C2E24] transition-colors"
              title="Copy voucher code"
            >
              {copiedCode ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <p className="text-[11px] text-[#7A6D63] max-w-sm mx-auto">
            Quote this code when settling your treatment at our Sandton &amp; Fourways studio. {REWARD_CONFIG.description}
          </p>
        </div>

        {/* Top 2 Recommended Treatments */}
        <div className="mb-8">
          <h4
            className="text-lg sm:text-xl font-serif text-[#1C2E24] mb-3 text-center sm:text-left"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
          >
            Your Curated Recommendations:
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommended.map((treatment) => (
              <div
                key={treatment.id}
                className="bg-white rounded-2xl border border-[#E5DDD4] p-4 flex flex-col justify-between hover:border-[#C5A880] transition-colors shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h5 className="font-serif text-base font-semibold text-[#1C2E24] leading-snug">
                      {treatment.name}
                    </h5>
                    <span className="font-serif text-xs font-bold text-[#8C6D46] shrink-0">
                      {treatment.options[0]?.priceDisplay}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B5E55] line-clamp-2 mb-3">
                    {treatment.shortDescription}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onBookingSelect(treatment.id);
                    if (onFinished) onFinished();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#1C2E24] hover:bg-[#284133] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Book this now</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Share & Actions Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#20BE5A] text-white font-medium rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share with a Friend</span>
          </a>

          {onFinished && (
            <button
              onClick={onFinished}
              className="w-full sm:w-auto py-3 px-6 bg-[#FAF7F2] hover:bg-[#EFEAE2] text-[#1C2E24] border border-[#D8CFC5] font-medium rounded-xl text-xs sm:text-sm transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // QUESTION FLOW (Steps 1 to 8)
  // ------------------------------------------------------------------
  return (
    <div
      className={`relative w-full max-w-2xl mx-auto ${
        isEmbedded
          ? 'bg-white rounded-3xl p-6 sm:p-10 border border-[#E8DEC8] shadow-lg'
          : 'bg-white rounded-3xl p-6 sm:p-10 border border-[#E8DEC8] shadow-2xl'
      }`}
    >
      {/* Blooming Lotus Progress Bar */}
      <QuizFlowerProgress currentStep={currentStep} totalSteps={8} />

      {/* Encouraging micro-message */}
      {microMessage && (
        <div className="text-center mb-4 text-xs font-medium text-[#8C6D46] animate-in fade-in duration-300">
          {microMessage}
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* QUESTION 1: WHAT ARE YOU IN THE MOOD FOR? (Multi-select) */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h3
              className="text-2xl sm:text-3xl font-serif text-[#1C2E24] font-normal leading-snug mb-1"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
            >
              {currentQ?.question}
            </h3>
            <p className="text-xs text-[#6B5E55]">{currentQ?.subtext}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {currentQ?.options?.map((opt: QuizOption) => {
              const isSelected = answers.treatments.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setAnswers((prev) => {
                      const exists = prev.treatments.includes(opt.id);
                      const updated = exists
                        ? prev.treatments.filter((x) => x !== opt.id)
                        : [...prev.treatments, opt.id];
                      return { ...prev, treatments: updated };
                    });
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-[#FAF6EE] border-[#1C2E24] ring-1 ring-[#1C2E24] shadow-xs'
                      : 'bg-white border-[#E5DDD4] hover:border-[#C5A880]'
                  }`}
                >
                  <span className="text-2xl shrink-0">{opt.emoji}</span>
                  <div className="flex-1">
                    <span className="text-xs sm:text-sm font-semibold text-[#1C2E24] block">
                      {opt.label}
                    </span>
                    {opt.description && (
                      <span className="text-[11px] text-[#7A6D63] block leading-tight">
                        {opt.description}
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-[#1C2E24] border-[#1C2E24] text-white'
                        : 'border-[#D8CFC5]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* QUESTION 2: WHAT DO YOU NEED MOST RIGHT NOW? (Single-select) */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h3
              className="text-2xl sm:text-3xl font-serif text-[#1C2E24] font-normal leading-snug mb-1"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
            >
              {currentQ?.question}
            </h3>
            <p className="text-xs text-[#6B5E55]">{currentQ?.subtext}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ?.options?.map((opt) => {
              const isSelected = answers.mainNeed === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, mainNeed: opt.id }))}
                  className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 ${
                    isSelected
                      ? 'bg-[#FAF6EE] border-[#1C2E24] ring-1 ring-[#1C2E24] shadow-xs'
                      : 'bg-white border-[#E5DDD4] hover:border-[#C5A880]'
                  }`}
                >
                  <span className="text-2xl shrink-0">{opt.emoji}</span>
                  <span className="text-xs sm:text-sm font-semibold text-[#1C2E24]">
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* QUESTION 3: HOW OFTEN WOULD YOU TREAT YOURSELF? (Single-select) */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h3
              className="text-2xl sm:text-3xl font-serif text-[#1C2E24] font-normal leading-snug mb-1"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
            >
              {currentQ?.question}
            </h3>
            <p className="text-xs text-[#6B5E55]">{currentQ?.subtext}</p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {currentQ?.options?.map((opt) => {
              const isSelected = answers.visitFrequency === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, visitFrequency: opt.id }))}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#FAF6EE] border-[#1C2E24] ring-1 ring-[#1C2E24] shadow-xs'
                      : 'bg-white border-[#E5DDD4] hover:border-[#C5A880]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="text-xs sm:text-sm font-medium text-[#1C2E24]">
                      {opt.label}
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#1C2E24]' : 'border-[#D8CFC5]'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-[#1C2E24]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* QUESTION 4: WHAT KEEPS YOU BUSY? (Occupation + conditional input) */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h3
              className="text-2xl sm:text-3xl font-serif text-[#1C2E24] font-normal leading-snug mb-1"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
            >
              {currentQ?.question}
            </h3>
            <p className="text-xs text-[#6B5E55]">{currentQ?.subtext}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentQ?.options?.map((opt) => {
              const isSelected = answers.occupationStatus === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, occupationStatus: opt.id }))}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-[#FAF6EE] border-[#1C2E24] ring-1 ring-[#1C2E24] shadow-xs'
                      : 'bg-white border-[#E5DDD4] hover:border-[#C5A880]'
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="text-xs sm:text-sm font-medium text-[#1C2E24]">
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Conditional text input for Working Professional */}
          {answers.occupationStatus === 'working-pro' && (
            <div className="pt-2 animate-in fade-in duration-200">
              <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                What do you do? (Optional, e.g. teacher, nurse, IT, executive)
              </label>
              <input
                type="text"
                value={answers.jobTitleOrStudy || ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, jobTitleOrStudy: e.target.value }))}
                placeholder="e.g. Software Engineer, Doctor, Creative Director"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none focus:border-[#1C2E24]"
              />
            </div>
          )}

          {/* Conditional text input for Student */}
          {answers.occupationStatus === 'student' && (
            <div className="pt-2 animate-in fade-in duration-200">
              <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                What are you studying / where? (Optional)
              </label>
              <input
                type="text"
                value={answers.jobTitleOrStudy || ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, jobTitleOrStudy: e.target.value }))}
                placeholder="e.g. Law at Wits, Design at Vega"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none focus:border-[#1C2E24]"
              />
            </div>
          )}
        </div>
      )}

      {/* QUESTION 5: WHERE ARE YOU BASED? (Location) */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h3
              className="text-2xl sm:text-3xl font-serif text-[#1C2E24] font-normal leading-snug mb-1"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
            >
              {currentQ?.question}
            </h3>
            <p className="text-xs text-[#6B5E55]">{currentQ?.subtext}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentQ?.options?.map((opt) => {
              const isSelected = answers.area === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, area: opt.id }))}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-[#FAF6EE] border-[#1C2E24] ring-1 ring-[#1C2E24] shadow-xs'
                      : 'bg-white border-[#E5DDD4] hover:border-[#C5A880]'
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="text-xs sm:text-sm font-medium text-[#1C2E24]">
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          {answers.area === 'other' && (
            <div className="pt-2 animate-in fade-in duration-200">
              <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                Please specify your suburb / city:
              </label>
              <input
                type="text"
                value={answers.suburbOther || ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, suburbOther: e.target.value }))}
                placeholder="e.g. Centurion, Pretoria, Bedfordview"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none focus:border-[#1C2E24]"
              />
            </div>
          )}
        </div>
      )}

      {/* QUESTION 6: A LITTLE ABOUT YOU (Gender & Age range - Optional) */}
      {currentStep === 6 && (
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h3
              className="text-2xl sm:text-3xl font-serif text-[#1C2E24] font-normal leading-snug mb-1"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
            >
              {currentQ?.question}
            </h3>
            <p className="text-xs text-[#6B5E55]">{currentQ?.subtext}</p>
          </div>

          <div className="space-y-5">
            {/* Part A: Gender */}
            <div>
              <span className="block text-xs font-semibold text-[#8C6D46] uppercase tracking-wider mb-2">
                Gender (Optional)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Female', 'Male', 'Non-binary', 'Prefer not to say'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, gender: g }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      answers.gender === g
                        ? 'bg-[#1C2E24] text-[#FAF7F2] border-[#1C2E24] shadow-xs'
                        : 'bg-white text-[#2E2824] border-[#E5DDD4] hover:border-[#C5A880]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Part B: Age Range */}
            <div>
              <span className="block text-xs font-semibold text-[#8C6D46] uppercase tracking-wider mb-2">
                Age Range (Optional)
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {['18-24', '25-34', '35-44', '45-54', '55+', 'Prefer not to say'].map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, ageRange: age }))}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium text-center transition-all ${
                      answers.ageRange === age
                        ? 'bg-[#1C2E24] text-[#FAF7F2] border-[#1C2E24] shadow-xs'
                        : 'bg-white text-[#2E2824] border-[#E5DDD4] hover:border-[#C5A880]'
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION 7: HELP US UNDERSTAND OUR COMMUNITY (Race/Community - Optional) */}
      {currentStep === 7 && (
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h3
              className="text-2xl sm:text-3xl font-serif text-[#1C2E24] font-normal leading-snug mb-1"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
            >
              {currentQ?.question}
            </h3>
            <p className="text-xs text-[#8C6D46] leading-relaxed">
              {currentQ?.subtext}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {currentQ?.options?.map((opt) => {
              const isSelected = answers.race === opt.label;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, race: opt.label }))}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-[#FAF6EE] border-[#1C2E24] ring-1 ring-[#1C2E24] shadow-xs'
                      : 'bg-white border-[#E5DDD4] hover:border-[#C5A880]'
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="text-xs font-medium text-[#1C2E24]">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* QUESTION 8: CONTACT DETAILS & CONSENT */}
      {currentStep === 8 && (
        <form onSubmit={handleSubmitQuiz} className="space-y-5">
          <div className="text-center sm:text-left">
            <h3
              className="text-2xl sm:text-3xl font-serif text-[#1C2E24] font-normal leading-snug mb-1"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
            >
              {currentQ?.question}
            </h3>
            <p className="text-xs text-[#6B5E55]">{currentQ?.subtext}</p>
          </div>

          {/* Honeypot field (hidden for anti-spam) */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="website_url"
              tabIndex={-1}
              autoComplete="off"
              value={answers.honeypot || ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, honeypot: e.target.value }))}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={answers.firstName}
                onChange={(e) => setAnswers((prev) => ({ ...prev, firstName: e.target.value }))}
                placeholder="e.g. Zola"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none focus:border-[#1C2E24]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                  Mobile Number (South Africa) *
                </label>
                <input
                  type="tel"
                  required
                  value={answers.mobile}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, mobile: e.target.value }))}
                  placeholder="e.g. 076 200 6014"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none focus:border-[#1C2E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={answers.email}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g. zola@example.co.za"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none focus:border-[#1C2E24]"
                />
              </div>
            </div>

            {/* Preferred contact channel */}
            <div>
              <label className="block text-xs font-medium text-[#4A3E37] mb-1.5">
                Preferred Way to be Contacted
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['WhatsApp', 'Call', 'Email'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, preferredContact: method }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      answers.preferredContact === method
                        ? 'bg-[#1C2E24] text-[#FAF7F2] border-[#1C2E24] shadow-xs'
                        : 'bg-white text-[#2E2824] border-[#E5DDD4] hover:border-[#C5A880]'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Required POPIA Consent */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#5C5047] leading-relaxed">
                <input
                  type="checkbox"
                  required
                  checked={answers.consentGiven}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, consentGiven: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 rounded text-[#1C2E24] focus:ring-[#1C2E24] border-[#D8CFC5]"
                />
                <span>
                  I agree that Nthabi's Touch may store my details and contact me about treatments and offers. I can ask to have my data removed at any time.{' '}
                  <button
                    type="button"
                    onClick={onOpenPrivacyNotice}
                    className="text-[#1C2E24] font-semibold underline decoration-[#D4AF37] hover:text-[#8C6D46]"
                  >
                    Read Privacy Notice
                  </button>
                </span>
              </label>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-[#F0EAE2] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBackStep}
              className="py-2.5 px-4 rounded-xl border border-[#D8CFC5] text-[#2E2824] text-xs font-medium hover:bg-[#FAF7F2] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-7 bg-[#1C2E24] hover:bg-[#284133] disabled:opacity-50 text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>{isSubmitting ? 'Unlocking Treat...' : 'Unlock My Reward'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Navigation Buttons for Steps 1 through 7 */}
      {currentStep < 8 && (
        <div className="pt-6 border-t border-[#F0EAE2] flex items-center justify-between gap-3 mt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBackStep}
              className="py-2.5 px-4 rounded-xl border border-[#D8CFC5] text-[#2E2824] text-xs font-medium hover:bg-[#FAF7F2] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <span className="text-[11px] text-[#8C6D46] italic">
              Takes ~60 seconds
            </span>
          )}

          <div className="flex items-center gap-2">
            {currentQ?.skipAllowed && (
              <button
                type="button"
                onClick={() => {
                  setValidationError(null);
                  setCurrentStep((prev) => prev + 1);
                }}
                className="py-2.5 px-4 text-xs font-medium text-[#8C6D46] hover:text-[#1C2E24] transition-colors"
              >
                Skip
              </button>
            )}

            <button
              type="button"
              onClick={handleNextStep}
              className="py-2.5 px-6 bg-[#1C2E24] hover:bg-[#284133] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>
          </div>
        </div>
      )}

      {/* Footer Transparency Notice */}
      <div className="mt-5 pt-3 border-t border-[#F5EFEB] text-center">
        <p className="text-[10px] text-[#A19488]">
          🔒 Your answers help us recommend treatments and plan offers that suit our clients. Only the last step asks for contact details.
        </p>
      </div>
    </div>
  );
};
